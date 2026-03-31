-- 1. Dukigo+ 플랫폼 테이블 세팅 (다른 앱과의 충돌 방지를 위해 접두사 dukigo_ 사용)

-- 전역 설정 테이블 (Realtime 구독용)
CREATE TABLE public.dukigo_global_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL DEFAULT 'DEFAULT_SCHOOL',
    subject_id TEXT NOT NULL DEFAULT 'DEFAULT_SUBJECT',
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 (학생, 학부모, 교사 정보 및 누적 온도 관리)
CREATE TABLE public.dukigo_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'PARENT', 'TEACHER', 'ADMIN')),
    display_name TEXT NOT NULL,
    current_temp NUMERIC DEFAULT 0.0,
    school_id TEXT NOT NULL DEFAULT 'DEFAULT_SCHOOL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학부모-학생 매핑 (관제 시스템용)
CREATE TABLE public.dukigo_user_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.dukigo_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.dukigo_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 누적 학습/보안 로그 기록
CREATE TABLE public.dukigo_study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.dukigo_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기능사 원본 기출문제 보관 테이블 (데이터 밀어넣기 용도)
CREATE TABLE public.dukigo_exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id TEXT NOT NULL DEFAULT 'ELECTRICITY',
    exam_year INT,
    exam_round INT,
    question_no INT,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    tracing_text TEXT, -- 나중에 트레이싱 엔진용으로 추출할 속성
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 환급 파이프라인 테이블
CREATE TABLE public.dukigo_refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.dukigo_profiles(id) ON DELETE CASCADE,
    payment_key TEXT UNIQUE NOT NULL, -- Toss Payments 식별자
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PAID', 'UPLOADED', 'MANUAL_REVIEW', 'APPROVED', 'REFUNDED')),
    evidence_url TEXT,
    reviewed_by UUID REFERENCES public.dukigo_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Realtime 리플리케이션(복제) 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.dukigo_global_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dukigo_study_logs;

-- 3. Row Level Security (RLS) 적용
ALTER TABLE public.dukigo_global_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dukigo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dukigo_user_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dukigo_study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dukigo_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dukigo_refund_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 (Policies) - 시연을 위해 단순화된 기본 읽기 허용, 확장을 고려
-- Global Config: 누구나 읽을 수 있음, 업데이트는 관리자만
CREATE POLICY "Allow public read of configs" ON public.dukigo_global_configs FOR SELECT USING (TRUE);

-- Profiles: 누구나 자신의 정보를, TEACHER 이상은 같은 학교 읽기 허용(데모용으론 전부 허용 후 조건 추가)
CREATE POLICY "Allow individual read Profiles" ON public.dukigo_profiles FOR SELECT USING (TRUE);

-- Questions: 퍼블릭 접근 허용 (학습을 해야 하므로)
CREATE POLICY "Allow public read of questions" ON public.dukigo_exam_questions FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert of questions" ON public.dukigo_exam_questions FOR INSERT WITH CHECK (TRUE); -- 마이그레이션을 위해 우선 해제

-- Logs: 누구나 본인의 로그 작성
CREATE POLICY "Allow single user create log" ON public.dukigo_study_logs FOR INSERT WITH CHECK (TRUE); 
CREATE POLICY "Allow users read own log" ON public.dukigo_study_logs FOR SELECT USING (TRUE); -- 실제 운영에선 auth.uid() = user_id 제약

-- Refund: 결제 데이터
CREATE POLICY "Allow access refund list" ON public.dukigo_refund_requests FOR ALL USING (TRUE);

-- 5. RPC 함수(Remote Procedure Call) - 서버 사이드 연산 보장

-- A. 도파민 온도 업데이트 (원자성)
CREATE OR REPLACE FUNCTION dukigo_check_and_update_temp(
    p_user_id UUID,
    p_temp_weight NUMERIC,
    p_is_correct BOOLEAN
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_val NUMERIC;
BEGIN
    -- 현재 온도 확인 및 누적 연산
    SELECT current_temp INTO current_val FROM public.dukigo_profiles WHERE id = p_user_id FOR UPDATE;
    
    IF current_val IS NULL THEN
        -- 유저가 없으면 무시하거나 0 반환
        RETURN 0;
    END IF;

    -- 정답 시 상승, 오답 시 하락(마이너스 가중치 입력 받았을 경우 더함)
    -- 온도가 0 미만으로 떨어지지 않게, 100을 넘지 않게 제어(Fever max)
    current_val := current_val + p_temp_weight;
    
    IF current_val < 0 THEN
        current_val := 0;
    END IF;
    
    IF current_val > 100 THEN
        current_val := 100; -- 100 이상은 그냥 100으로 고정 (Max Fever)
    END IF;

    UPDATE public.dukigo_profiles SET current_temp = current_val WHERE id = p_user_id;

    -- Study Log 삽입
    INSERT INTO public.dukigo_study_logs (user_id, action_type, metadata)
    VALUES (p_user_id, 'TEMP_UPDATE', jsonb_build_object('weight_applied', p_temp_weight, 'is_correct', p_is_correct, 'new_temp', current_val));

    RETURN current_val;
END;
$$;

-- B. 하트비트 동기화(탭 중복 제어 및 생존 신고)
CREATE OR REPLACE FUNCTION dukigo_heartbeat_sync(
    p_user_id UUID,
    p_tab_id TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 메타데이터에 가장 최근 접속 탭 업데이트 로깅
    INSERT INTO public.dukigo_study_logs (user_id, action_type, metadata)
    VALUES (p_user_id, 'HEARTBEAT_SYNC', jsonb_build_object('tab_id', p_tab_id));
END;
$$;

-- 초기 데모용 전역 설정 인서트
INSERT INTO public.dukigo_global_configs (school_id, subject_id, config_json)
VALUES (
    'DEFAULT_SCHOOL', 
    'DEFAULT_SUBJECT', 
    '{
        "STUDY_CONFIG": {
            "PASS_THRESHOLD_ACCURACY": 93,
            "CRAM_THRESHOLD_ACCURACY": 96,
            "TEMP_WEIGHTS": { "CORRECT": 2.0, "WRONG": -1.0, "STREAK_BONUS": 0.5 },
            "IDLE_TIMEOUT": 60,
            "SUBJECT_TYPE": ["KEC", "Architecture", "3D_Print", "General_School"]
        },
        "SECURITY_CONFIG": {
            "MAX_TABS": 1,
            "SCREEN_PROTECTION_LEVEL": "BLUR"
        },
        "FINANCE_CONFIG": {
            "BASE_FEE": 1000,
            "REFUND_POLICY": { "TYPE": "FULL_REFUND", "CONDITION": "CERTIFICATE_VALIDATED" },
            "TRIAL_LIMIT": 10
        }
    }'::jsonb
);
