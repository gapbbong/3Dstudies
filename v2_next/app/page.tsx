'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, GraduationCap, Users, ArrowRight } from 'lucide-react';
import packageInfo from '../package.json';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/components/ui/Toast';
import { getProgress, getRankInfo } from '@/lib/progress';

const QUOTES = [
  "성공은 매일 반복되는 작은 노력들의 합이다. - 로버트 콜리어",
  "기회는 일어나는 것이 아니라 만들어내는 것이다. - 크리스 그로서",
  "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병이다. - 아인슈타인",
  "멈추지 않는 한 얼마나 천천히 가는지는 중요하지 않다.",
  "학습은 우연히 얻어지는 것이 아니라 열정과 부지런함으로 찾아야 한다. - 아비가일 아담스",
  "전문가는 한때 초보자였다. - 헬렌 헤이스",
  "나약한 태도는 성격도 나약하게 만든다. - 아인슈타인",
  "가장 큰 위험은 위험 없는 삶을 사는 것이다. - 스티븐 코비",
  "행동은 모든 성공의 기본 열쇠다. - 파블로 피카소",
  "위대한 업적은 힘이 아니라 끈기로 이루어진다. - 사무엘 존슨",
  "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 믿는 대로 될 것이다. - 헨리 포드",
  "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다. - 피터 드러커",
  "고통 없이는 얻는 것도 없다. - 벤자민 프랭클린",
  "오늘 걷지 않으면 내일 뛰어야 한다. - 카를레스 푸욜",
  "공부할 때의 고통은 잠깐이지만, 못 배운 고통은 평생이다. - 하버드 도서관",
  "가장 위대한 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데 있다.",
  "천재는 1%의 영감과 99%의 땀으로 이루어진다. - 토마스 에디슨",
  "늦었다고 생각할 때가 가장 빠를 때다.",
  "꿈을 꿀 수 있다면 이룰 수도 있다. - 월트 디즈니",
  "시작이 반이다. - 아리스토텔레스",
  "노력은 배신하지 않는다.",
  "피할 수 없으면 즐겨라. - 로버트 엘리엇",
  "실패는 성공의 어머니이다. - 에디슨",
  "독서가 정신에 미치는 영향은 운동이 육체에 미치는 영향과 같다. - 리처드 스틸"
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Subject, 2: School, 3: Class, 4: Name
  const [formData, setFormData] = useState({
    subject: '3D프린터운용기능사',
    school: '',
    className: '',
    studentName: ''
  });
  const [quote, setQuote] = useState('');
  const toast = useToast();

  // Use Security & Shortcut Hook
  useSecurity({
    onEnter: () => handleNext(),
    onDevToolsOpen: () => {
      toast.warning('보안 경고: 개발자 도구가 감지되었습니다. 정상적인 학습을 방해할 수 있습니다.');
    },
    preventCopy: true
  });

  useEffect(() => {
    // 1. Pick Random Quote
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);

    // 2. Load Saved Info from LocalStorage
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('last_student_name') : null;
    if (savedName) {
      setFormData((prev: any) => ({ ...prev, studentName: savedName }));
    }

    // 3. Handle URL Parameters
    const subjectParam = searchParams.get('subject');
    const schoolParam = searchParams.get('school');
    const classParam = searchParams.get('class');

    let nextStep = 1;
    let initialData = {
      subject: '3D프린터운용기능사',
      school: '',
      className: '',
      studentName: savedName || ''
    };

    if (subjectParam) {
      initialData.subject = subjectParam === '3d' ? '3D프린터운용기능사' :
        subjectParam === 'inf' ? '정보처리산업기사' :
          subjectParam === 'des' ? '시각디자인산업기사' : subjectParam;
      nextStep = 2;

      if (schoolParam) {
        const mappedSchool = schoolParam === 'ks' ? '경성전자고등학교' : schoolParam;
        initialData.school = mappedSchool;
        nextStep = 3;

        if (classParam) {
          const mappedClass = classParam === 'eval' ? '과정평가형반' : classParam;
          initialData.className = mappedClass;
          nextStep = 4;
        }
      }
    }

    setFormData((prev: any) => ({ ...prev, ...initialData }));
    setStep(nextStep);
  }, [searchParams]);

  const version = '4.2.2';

  const handleNext = () => {
    if (step === 1 && !formData.subject) {
      toast.info('자격증 종목을 선택해주세요.');
      return;
    }
    if (step === 2 && !formData.school) {
      toast.info('학교를 선택해주세요.');
      return;
    }
    if (step === 3 && !formData.className) {
      toast.info('반을 선택해주세요.');
      return;
    }

    if (step < 4) setStep(step + 1);
    else {
      // Final login logic
      const fullId = formData.studentName;
      if (!fullId || fullId.length < 5) {
        toast.warning('학번(4자리)과 이름을 올바르게 입력해주세요. (예: 3105홍길동)');
        return;
      }

      const history = localStorage.getItem('login_history');
      let historyList: string[] = history ? JSON.parse(history) : [];
      historyList = [fullId, ...historyList.filter(id => id !== fullId)].slice(0, 5);
      localStorage.setItem('login_history', JSON.stringify(historyList));

      localStorage.setItem('last_student_name', fullId);
      localStorage.setItem('currentUser', fullId);

      const now = new Date().toLocaleString('ko-KR');
      localStorage.setItem('last_login', now);

      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-4 left-4 text-[10px] text-slate-500 font-mono tracking-widest opacity-80 z-[100] pointer-events-none">
        VERSION v{version}
      </div>

      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={quote}
            className="text-lg font-bold text-blue-300 mb-6 px-4 py-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner"
          >
            {quote || "오늘도 화이팅!"}
          </motion.p>

          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/20 ring-4 ring-white/5">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400">
            3D Printer Study <span className="text-[12px] font-mono font-medium text-slate-500 opacity-60 ml-2">v4.2.2</span>
          </h1>
          <p className="text-slate-500/80 italic font-medium text-sm">&quot;자격증 합격의 지름길, 함께 모델링해봐요!&quot;</p>
        </div>

        <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <Package size={16} className="text-blue-400" /> 자격증 종목을 선택해 주세요
              </label>
              <div className="space-y-3">
                {[
                  { id: '3D프린터운용기능사', label: '3D프린터운용기능사' },
                  { id: '정보처리산업기사', label: '정보처리산업기사' },
                  { id: '시각디자인산업기사', label: '시각디자인산업기사' }
                ].map((subj) => (
                  <div
                    key={subj.id}
                    onClick={() => setFormData({ ...formData, subject: subj.id })}
                    className={`
                      p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                      ${formData.subject === subj.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                    `}
                  >
                    <span>{subj.label}</span>
                    {formData.subject === subj.id && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-400" /> 학교를 선택해 주세요
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-slate-500"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              >
                <option value="">목록에서 선택</option>
                <option value="경성전자고등학교">경성전자고등학교</option>
              </select>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-400" /> 반을 선택해 주세요
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-slate-500"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="">목록에서 선택</option>
                <option value="과정평가형반">과정평가형반</option>
              </select>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-400">학번(4자리) + 이름 입력</label>
                <button
                  onClick={() => {
                    const s = formData.subject === '3D프린터운용기능사' ? '3d' : formData.subject === '정보처리산업기사' ? 'inf' : formData.subject === '시각디자인산업기사' ? 'des' : formData.subject;
                    const sch = formData.school === '경성전자고등학교' ? 'ks' : formData.school;
                    const cl = formData.className === '과정평가형반' ? 'eval' : formData.className;
                    const url = `${window.location.origin}/?subject=${s}&school=${sch}&class=${cl}`;
                    navigator.clipboard.writeText(url);
                    toast.success('다이렉트 로그인 링크가 복사되었습니다!');
                  }}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border border-white/5"
                >
                  🔗 링크 복사
                </button>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="예: 3105홍길동"
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-mono tracking-wider text-white placeholder:text-slate-700 shadow-inner"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
              <p className="text-[10px] text-slate-600 mt-3 ml-1 font-medium">* 띄어쓰기 없이 입력해 주세요.</p>
            </motion.div>
          )}

          <button
            onClick={handleNext}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
          >
            {step === 4 ? '학습 시작하기' : '다음 단계로'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/guide')}
              className="text-slate-500 hover:text-blue-400 text-xs transition-colors underline underline-offset-4"
            >
              선생님 안내 페이지 (타학교)
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-blue-500 shadow-sm shadow-blue-500/50' : 'w-2 bg-slate-700'}`}
            />
          ))}
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-slate-600 text-sm flex flex-col items-center gap-2 w-full">
        <LoginHistory />
        <span className="opacity-50 font-mono tracking-tighter">© 2026 3D Printer Study. All rights reserved.</span>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-mono animate-pulse">환경 설정 로드 중...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginHistory() {
  const [history, setHistory] = useState<{ name: string; icon: string; temp: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('login_history');
    const legacyUser = localStorage.getItem('currentUser');

    let names: string[] = [];
    if (saved) names = JSON.parse(saved);
    else if (legacyUser) names = [legacyUser];

    // Fetch stats for each name
    const historyWithStats = names.slice(0, 3).map(name => {
      const progress = getProgress(name);
      const rank = getRankInfo(progress.stats.temperature);
      return {
        name,
        icon: rank.icon,
        temp: progress.stats.temperature
      };
    });

    setHistory(historyWithStats);
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <div className="bg-slate-900/40 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col items-center gap-3 text-[10px] mb-4 min-w-[300px]">
      <span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">최근 학습자 기록</span>
      <div className="flex flex-wrap justify-center gap-2">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/5 pl-2 pr-3 py-1.5 rounded-xl border border-white/5 transition-all hover:border-blue-500/50 group cursor-default">
            <span className="text-lg">{h.icon}</span>
            <div className="flex flex-col">
              <span className="text-slate-200 font-bold font-mono">{h.name}</span>
              <span className="text-[8px] text-blue-400 font-black">{h.temp}°C</span>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          if (confirm('모든 로그인 기록과 로컬 학습 데이터를 삭제하시겠습니까?')) {
            localStorage.clear();
            window.location.reload();
          }
        }}
        className="mt-2 text-red-500/30 hover:text-red-500 transition-colors uppercase font-black text-[9px] tracking-tighter"
      >
        [Clear All Data]
      </button>
    </div>
  );
}
