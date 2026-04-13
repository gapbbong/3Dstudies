'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flag, CheckCircle2 } from 'lucide-react';
import { useSecurity } from '@/hooks/useSecurity';
import LoadingPrinter from '@/components/ui/LoadingPrinter';
import CbtExamSystem from '@/components/features/CbtExamSystem';
import { Chapter } from '@/lib/db';
import { saveProgress } from '@/lib/progress';
import { EXAM_CONFIGS } from '@/lib/exam';

export default function ExamPage({ params }: { params: Promise<{ chapterId: string }> }) {
    const router = useRouter();
    const { chapterId } = use(params);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro');
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    useSecurity({
        preventCopy: true,
        useCaptureProtect: true,
        preventMultiTab: true
    });

    useEffect(() => {
        const loadChapter = async () => {
            try {
                const response = await fetch(`/api/quiz/${chapterId}`);
                if (!response.ok) throw new Error('Failed to load chapter');
                const data = await response.json();
                setChapter(data);
            } catch (error) {
                console.error('Failed to load chapter:', error);
                router.push('/dashboard');
            }
        };
        loadChapter();
    }, [chapterId, router]);

    const handleFinish = (result: { score: number; answers: Record<string, number>; timeSpent: number }) => {
        if (!chapter) return;
        setScore(result.score);
        setTimeSpent(result.timeSpent);
        
        const config = EXAM_CONFIGS[chapterId] || EXAM_CONFIGS.default;
        const totalQ = chapter.questions.length;
        const percent = (result.score / totalQ) * 100;
        const passed = percent >= config.passScore;

        const correctCount = result.score;
        const wrongCount = totalQ - correctCount;
        // Higher stakes for Exam: 2x boost for correct, -1x penalty for wrong
        const tempChange = (correctCount * 2.0) - (wrongCount * 1.0);

        saveProgress(chapterId, {
            passed,
            score: result.score,
            total: totalQ,
            tempChange
        });

        setPhase('result');
    };

    if (!chapter) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <LoadingPrinter message="CBT 시험 환경 초기화 중..." />
        </div>
    );

    return (
        <main className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
            <AnimatePresence mode="wait">
                {phase === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-2xl mx-auto py-20"
                    >
                        <div className="bg-slate-900/50 border border-white/5 p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-xl text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/10 rounded-full mb-8">
                                <span className="text-5xl">🎯</span>
                            </div>
                            <h1 className="text-4xl font-black mb-4 tracking-tight">{chapter.title} 모의고사</h1>
                            <p className="text-slate-400 text-lg mb-10">
                                실제 국가공인 자격시험과 동일한 환경에서 실력을 점검합니다.<br />
                                준비되셨나요?
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">문항수</div>
                                    <div className="text-2xl font-black">{chapter.questions.length}문항</div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">제한시간</div>
                                    <div className="text-2xl font-black">60분</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => setPhase('exam')}
                                    className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                                >
                                    시험 시작하기
                                </button>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="px-8 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                                >
                                    뒤로가기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'exam' && (
                    <motion.div
                        key="exam"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CbtExamSystem 
                            questions={chapter.questions} 
                            onFinish={handleFinish} 
                        />
                    </motion.div>
                )}

                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto py-20"
                    >
                        <div className="bg-slate-900/50 border border-white/5 p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-xl text-center">
                            <div className="mb-8">
                                <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">시험 결과</div>
                                <h2 className="text-5xl font-black">
                                    {Math.round((score / chapter.questions.length) * 100)}점
                                </h2>
                            </div>

                            <div className={`inline-block px-10 py-3 rounded-full font-black text-xl mb-12 border ${ (score / chapter.questions.length) >= 0.6 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                                {(score / chapter.questions.length) >= 0.6 ? '축하합니다! 합격입니다.' : '아쉽습니다. 불합격입니다.'}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">맞춘 문항</div>
                                    <div className="text-2xl font-black text-emerald-400">{score} / {chapter.questions.length}</div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">소요 시간</div>
                                    <div className="text-2xl font-black text-blue-400">{Math.floor(timeSpent / 60)}분 {timeSpent % 60}초</div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40"
                                >
                                    대시보드로 돌아가기
                                </button>
                                <button 
                                    onClick={() => setPhase('intro')}
                                    className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all"
                                >
                                    다시 시험보기
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
