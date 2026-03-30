# 두기고(Dukigo) 플랫폼 상세 마스터 이행 계획서 (Ultimate System Architecture)

이 문서는 AI 개발 스튜디오(예: Gemini, Cursor 등)가 '두기고(Dukigo)' 플랫폼을 구축할 때 완벽한 기준점으로 삼아야 할 **데이터베이스, 인프라, UI/UX, 그리고 보안 정책의 구체적 명세**를 담은 최종 마스터 플랜입니다.

하드코딩을 원천 금지하며, 모든 제어는 Supabase의 `Global_Configs` 기반으로 작동하는 동적 시스템(Data-Driven Architecture)을 지향합니다.

---

## 1. 프로젝트 아키텍처 및 설정 (Technical Stack & Global Configs)

### 🛠 기술 스택
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion (애니메이션)
- **Backend/Auth/DB**: Supabase (PostgreSQL, Realtime, RPC)
- **Payment**: Toss Payments (토스 페이먼츠)

### 🌐 글로벌 컨트롤 타워 (운영자 제어 변수 - `Global_Config`)
모든 UI 렌더링과 학습 로직은 DB에 저장된 JSON 설정값을 구독하여 동작합니다. 이로 인해 소스 코드 수정 없이 대시보드에서 시스템의 수치를 즉각 튜닝할 수 있습니다.

**A. 학습 및 게임화 밸런스 (`STUDY_CONFIG`)**
- `PASS_THRESHOLD_ACCURACY`: 트레이싱 통과 임계값 (일반 모드: 93, 벼락치기 모드: 96)
- `TEMP_WEIGHTS`: { `CORRECT`: +2.0, `WRONG`: -1.0, `STREAK_BONUS`: +0.5 }
- `IDLE_TIMEOUT`: 60 (60초 무반응 시 경고)
- `SUBJECT_TYPE`: `['KEC', 'Architecture', '3D_Print', 'General_School']` (멀티 테넌트 과목 확장)

**B. 보안 및 접근 제어 (`SECURITY_CONFIG`)**
- `MAX_TABS`: 동시 허용 브라우저 탭 수 (Default: 1)
- `SCREEN_PROTECTION_LEVEL`: `['NONE', 'BLUR', 'LOCK', 'LOGOUT']`

**C. 비즈니스 및 환급 (`FINANCE_CONFIG`)**
- `BASE_FEE`: 기본 수강료 (Toss Payments 결제 금액 연동)
- `REFUND_POLICY`: \{ `TYPE`: 'FULL_REFUND', `CONDITION`: 'CERTIFICATE_VALIDATED' \}
- `TRIAL_LIMIT`: 무료 미리보기 제공 문항 수 (Default: 10)

---

## 2. 멀티 테넌트 및 역할 기반 DB 설계 (Supabase Schema)

플랫폼의 모든 데이터는 학교(`school_id`)와 과목(`subject_id`)을 기준으로 완전히 격리(Row Level Security 적용)되어야 합니다.

### 💾 핵심 테이블 (Database Blueprint)
1. **`Global_Configs`**: `id`, `school_id`, `subject_id`, `config_json` (위의 제어 변수 저장)
2. **`Profiles`**: 사용자 역할(Teacher, Student, Parent), 누적 도파민 온도(`current_temp`), 티어 관리
3. **`Study_Logs`**: 감사 표준(user_id, action_type, metadata)에 맞춘 학습 및 보안 로그 기록
4. **`User_Relations`**: `parent_id`(UUID)와 `student_id`(UUID)의 매핑, `is_active` (학부모-자녀 연결)
5. **`Refund_Requests`**: `payment_key`, OCR 검증 상태, 환급 파이프라인 관리를 위한 상태 머신 트래커

---

## 3. 프리미엄 UI/UX 및 동적 컴포넌트 시스템 (Dynamic Layout)

화면 수정을 피하고 어떤 기기에서도 완벽한 비율을 유지하기 위한 **'상태 중심의 맥락적 UI(Contextual UI)'** 원칙을 수립합니다.

### 🎨 앱 동작 레이아웃 원칙
- **사이트 테마 벤치마크**: [Stripe.com](https://stripe.com/) 수준의 압도적인 프리미엄 디자인 언어 채택. 과도한 입체감이나 복잡한 모달을 배제하고, 정교한 타이포그래피, 은은한 메시 보라믹/그라데이션, 유려한 상태 트랜지션(모션)으로 신뢰감 극대화.
- **Config 기반 공통 레이아웃**: `useConfig` 훅이 Supabase Realtime으로 설정을 구독하여 `SmartLayout` 컴포넌트 내부 버튼 렌더링을 제어. `v-if` 방식으로 필요 리소스만 마운트.
- **오토-레이아웃 엔진 (Dynamic Layout)**: 수동 `px` 배치가 아닌 Flex/Grid 기반 자동 반응형 시스템 운용, 최소 40px 안전 구역(Safe Area) 확보.
- **절대 깨지지 않는 버튼 (Fluid Buttons)**: 모든 버튼에 `white-space: nowrap` 적용, 박스 사이즈에 따라 미세하게 폰트를 조절하는 가변 사이즈 지정 (버튼 글자 두 줄 분할 원천 차단).
- **모바일 우선(Mobile-First) 하단 바**: 중요 학습 버튼(제출, 힌트 등)을 손이 닿기 쉬운 하단 액션 바(FAB)에 고정 구성.

---

## 4. 지능형 학습 엔진 메커니즘 (Intelligent Metrics)

### 🎯 트레이싱 및 정합성 (calculateLevenshtein)
- **공백 무시 연산**: 모든 공백(`/ \s+ /g`)을 제거한 후, `STUDY_CONFIG.PASS_THRESHOLD_ACCURACY`(일반 93%, 벼락치기 96%) 달성 여부를 산출.
- **자동 기호 치환**: 사용자가 `--` 입력 시 `→`, `..` 입력 시 `·`으로 즉각 치환.
- **Transaction Flow**: `accuracy >= TRACING_PASS_THRESHOLD`일 때만 단원 `is_unlocked` 상태를 `TRUE`로 원자적 업데이트.

### 🔥 도파민 루프 몰입 제어 (Engagement Loop)
- 정답 체크 결과에 따라 원자적 RPC 함구(`check_and_update_temp`) 실행을 통해 온도를 상승시킴.
- 연속 3회 정답(`streak_count >= 3`) 시 `Confetti`(폭죽) 렌더링 및 보너스 온도.
- `current_temp >= 90` 달성 시, 전역 테마가 Orange-Red로 점등되며 모든 애니메이션 배분 속도를 1.5배로 가속(Fever Mode).
- 정답/오답 판정 시 즉각적인 햅틱 및 시각 피드백 발동(`window.navigator.vibrate(20)`).

---

## 5. 보안 및 인프라 모듈 상세 (Security & Anti-Cheat)

보안은 단순한 앱 막음이 아닌 데이터 무결성 보존이 핵심입니다.

- **심박수 동기화 (`useHeartbeat`)**: `localStorage`의 `tab_id`와 `last_active`를 1초마다 갱신. `storage` 이벤트 감지로 다른 탭이 열리면 화면 `blur` 후 알림 노출. 동시에 Supabase 채널을 통해 서버 단에도 RPC 호출(`heartbeat_sync`).
- **부재 감지 (`IdleDetectionSystem`)**: 60초 무반응 설정값(`IDLE_TIMEOUT`) 초과 시, 테두리 적색 펄스 애니메이션(Border-Flash)을 점화 및 Audit Log 발생.
- **웹 표준 렌더링 보호**: 가독성 확보를 위해 Canvas 렌더링 및 User ID 워터마크는 적용하지 않으며, 순수 DOM 기반의 최적화된 학습 환경을 제공.
- **어댑티브 저사양 대응 (`useAdaptiveStyle`)**: `devicePixelRatio` 등 감지하여 기기가 구형일 경우 초고사양 `Framer Motion` 효과를 `initial` 스냅 전환으로 대체하여 폭죽, 진동 효과 등이 끊김 없이 수행되도록 강제.

---

## 6. 결제 및 환급 상태 머신 (Toss Payments & Refund Pipeline)

선결제 후 통과 시 환급을 제공하는 '반자동(Semi-Automatic)' 파이프라인입니다. 민감한 금전 이슈이므로 자동화 도구를 맹신하지 않고, 최종 단계에서는 사람이 직접 검증하여 승인 처리합니다.

| 상태 (Status) | 단계 설명 | 액션 / 조건 설명 |
| :--- | :--- | :--- |
| **`PAID`** | 토스(Toss) API 결제 완료 | 토스 Webhook 수신 후 `User_Subscription`에 `payment_key` 저장 |
| **`UPLOADED`** | 자격 증빙 제출 완료 | 학생이 본인 확인용 캡처 파일(신분증 및 합격증)을 업로드 |
| **`MANUAL_REVIEW`** | 운영자 최종 검수 대기 | 대시보드 리스트에 등록되며, 선생님(관리자)이 육안으로 일치 여부를 대조 |
| **`APPROVED`** | 사람(Admin) 승인 완료 | 관리자가 '환급 승인' 버튼 클릭 시 상태 변경 |
| **`REFUNDED`** | 전액 환급 (Toss API) | 승인과 동시에 `cancelPayment()` API 호출 및 로그 확정 |

---

## 7. 교사 및 학부모 관제 시스템 (Parental & Teacher Dashboard)

학습 과정을 '정보'로 변환하여 교육 현장에 전달합니다. '감시'보다 '격려'를 유발하도록 디자인합니다.

- **AI 분석 멘트 (`generateAIComment`)**: `Study_Logs` 최근 1시간 동향을 토대로 문제점 파악 안내문구 생성 (예: "수치 암기는 우수하나 계산 공식 적용에 코칭 필요").
- **안심 알림 및 주간 리포트**: 피버 모드 진입, 첫 로그인 시 푸시 알림. "이번 주 취약 KEC 수치 요약" 자동 생성하여 전송.
- **실시간 격려 (Parent Nudge)**: 학부모가 앱에서 "응원하기" 버튼 입력. Supabase Realtime으로 0.5초 이내에 자녀 화면 하단 토스트 팝업 렌더링 ("엄마가 응원합니다! 온도 +0.5").

---

## 8. [특화] 벼락치기 모드 (Cram Mode - v2_next)

- 단기 합격을 위한 초고속/저지연 특수 모드 (이론 타이핑 1회로 임계값 단축).
- 불과 시간을 단축하기 위해 입력 폼 자동 포커싱.
- 최근 오답 문제를 AI(Gemini)가 3문장 이내로 정리하는 가이드라인 오버레이 렌더레이션 기능 제공.
- 불필요한 트랜지션 애니메이션 제거, 블랙/레드 기반 고대비 전용 테마를 적용하여 시야 및 반응 속도 최적화.

---

## 9. AI 개발 스튜디오를 위한 통합 마스터 개발 프롬프트 (구현 순서)

AI가 코드를 생성하고 빌드할 때는 **무조건 이 순서를 엄수**해야 합니다. 서버 액션과 RLS가 보호받지 못한 상태의 UI 제작은 무의미합니다.

1. **Interface & Schema**: `Global_Configs`, `Profiles`, `Refund_Requests` 등의 DB 스키마 작성 및 RLS(Row Level Security) 제약 조건 부여.
2. **Infrastructure**: Supabase Realtime을 구독하는 `useConfig` 훅 구현 및 테넌시(`school_id`, `subject_id`) 보안 분리 작업.
3. **Core Functions (RPC)**: `check_and_update_temp`, `process_refund_pipeline`, `heartbeat_sync` 형태의 서버 프로시저 구동.
4. **Security Hook Implementation**: 중복 로그인 및 탭 감시를 위한 `useHeartbeat` 훅 구축 (인증 및 보안 가드가 UI 렌더링보다 앞서 마운트되어야 함).
5. **Logic**: `calculateLevenshtein` 등 기반으로 한 학습 프로세스와 정답 체크 연계 (`STUDY_CONFIG.PASS_THRESHOLD_ACCURACY` 응용).
6. **Payment Pipeline**: 토스 페이먼츠(`useTossPayment`) 연동 및 환급 머신 상태 전송 로직 작업.
7. **Parental API**: `NUDGE_EVENT`를 Realtime으로 전달하여 클라이언트에 토스트를 반영하는 기능 연동.
8. **UI/UX Construction**: `SmartLayout` 적용으로 버튼 깨짐 등 반응형 대응 마무리. 
9. **Dopamine Optimization**: Framer Motion을 결합하여 가중치와 콤보 시스템(폭죽 배포)에 따른 효과 적용, 저사양 기기 최적화(`useAdaptiveStyle`) 연동.

D:\App\Dukigo\client\src\data에 기출문제들이 있고, 
다른 프로젝트들이 사용하는 테이블 이름이 겹치지 않도록 주의해 주세요. (예: kchaple_students와 겹치지 않게 other_app_students 등으로 구분)
ngrok이 8000 포트(API용)에 연결되어 있으므로, 모든 프로젝트가 이 포트를 통해 통신하면 됩니다.

Supabase URL	https://vanquishable-nonzoological-brandi.ngrok-free.dev
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

