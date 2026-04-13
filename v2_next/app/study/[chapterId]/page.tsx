'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSecurity } from '@/hooks/useSecurity';
import LoadingPrinter from '@/components/ui/LoadingPrinter';
import TheoryTracing from '@/components/features/TheoryTracing';
import QuizSystem from '@/components/features/QuizSystem';
import { Chapter } from '@/lib/db';
import { saveProgress } from '@/lib/progress';

export default function StudyPage({ params }: { params: Promise<{ chapterId: string }> }) {
    const router = useRouter();
    const { chapterId } = use(params);
    const [phase, setPhase] = useState<'theory' | 'quiz' | 'result'>('theory');
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [config, setConfig] = useState({ passScore: 0.8, theoryAttempts: 2 });
    const [theoryAttempts, setTheoryAttempts] = useState(0);
    const [isRecallSelection, setIsRecallSelection] = useState(false);
    const [isRecallMode, setIsRecallMode] = useState(false);
    const [score, setScore] = useState(0);

    useSecurity({
        preventCopy: true,
        preventMultiTab: true
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Chapter
                const chRes = await fetch(`/api/quiz/${chapterId}`);
                if (!chRes.ok) throw new Error('Failed to load chapter');
                const chData = await chRes.json();
                setChapter(chData);

                // 2. Load Student Config
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    const cfgRes = await fetch(`/api/quiz/student-config?name=${encodeURIComponent(currentUser)}`);
                    if (cfgRes.ok) {
                        const cfgData = await cfgRes.json();
                        setConfig(cfgData);
                    }
                }
            } catch (error) {
                console.error('Failed to load study data:', error);
                router.push('/dashboard');
            }
        };
        loadData();
    }, [chapterId, router]);

    const handleTheoryComplete = () => {
        const nextCount = theoryAttempts + 1;
        setTheoryAttempts(nextCount);

        // Save progress for theory completion
        saveProgress(chapterId, {
            passed: false, // Completing theory doesn't "pass" the chapter yet
            score: 0,
            total: chapter?.questions.length || 0,
            theoryDelta: 1,
            tempChange: 0.5 // Earning small temp boost for studying theory
        });

        if (nextCount >= config.theoryAttempts) {
            setPhase('quiz');
        } else {
            setIsRecallSelection(true);
        }
    };

    const handleChoice = (mode: 'tracing' | 'recall') => {
        setIsRecallMode(mode === 'recall');
        setIsRecallSelection(false);
    };

    const handleQuizFinish = (result: { score: number; wrongNumbers: string[] }) => {
        if (!chapter) return;
        const finalScore = result.score;
        setScore(finalScore);
        const passed = finalScore / chapter.questions.length >= config.passScore;

        const correctCount = finalScore;
        const wrongCount = chapter.questions.length - correctCount;
        const tempChange = (correctCount * 1.5) - (wrongCount * 0.5);

        saveProgress(chapter.id || chapterId, {
            passed,
            score: finalScore,
            total: chapter.questions.length,
            wrongNumbers: result.wrongNumbers,
            tempChange
        });

        if (passed) {
            setPhase('result');
        } else {
            router.push('/review');
        }
    };

    if (!chapter) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <LoadingPrinter message="학습 데이터를 불러오는 중..." />
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">대시보드</span>
                    </button>
                    <div className="text-right">
                        <h1 className="text-xl font-bold text-white mb-1">{chapter.title}</h1>
                        <div className="flex items-center justify-end gap-2">
                            <p className="text-slate-500 text-sm">
                                {phase === 'theory' ? `이론 학습 (시도: ${theoryAttempts}/${config.theoryAttempts})` : '실전 퀴즈'}
                            </p>
                            <span className="text-[10px] text-slate-600 font-mono">v1.0.2</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {phase === 'theory' && (
                        <motion.div
                            key="theory"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {isRecallSelection ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900 p-8 rounded-2xl border border-blue-500/30 text-center space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-blue-400">학습 방식을 선택하세요</h2>
                                    <p className="text-slate-400">한 번 더 타이핑하여 완벽하게 외우거나,<br />핵심 단어 빈칸 맞추기에 도전해보세요!</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        <button
                                            onClick={() => handleChoice('tracing')}
                                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all font-bold"
                                        >
                                            ✍️ 한 번 더 쓰기
                                        </button>
                                        <button
                                            onClick={() => handleChoice('recall')}
                                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40 transition-all font-bold"
                                        >
                                            🧠 액티브 리콜 (빈칸 맞추기)
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <TheoryTracing
                                    targetText={chapter.theoryContent || ""}
                                    onComplete={handleTheoryComplete}
                                    isRecallMode={isRecallMode}
                                    keywords={chapter.keywords}
                                />
                            )}
                        </motion.div>
                    )}

                    {phase === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <QuizSystem
                                questions={chapter.questions}
                                onFinish={handleQuizFinish}
                            />
                        </motion.div>
                    )}

                    {phase === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 p-12 rounded-3xl border border-blue-500/20 text-center shadow-2xl"
                        >
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/10 rounded-full mb-6">
                                <span className="text-5xl">🎉</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2">합격을 축하합니다!</h2>
                            <p className="text-blue-400 text-xl font-medium mb-8">
                                최종 점수: <span className="text-white">{Math.round((score / chapter.questions.length) * 100)}</span>점
                            </p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                대시보드로 돌아가기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
