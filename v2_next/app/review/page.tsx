
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { getReviewItems, getLegacyUser } from '@/lib/progress';
import QuizSystem from '@/components/features/QuizSystem';
import LoadingPrinter from '@/components/ui/LoadingPrinter';
import { useSecurity } from '@/hooks/useSecurity';
import { Question } from '@/lib/db';

export default function ReviewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reviewItems, setReviewItems] = useState<Question[]>([]);
    const [sessionFinish, setSessionFinish] = useState(false);

    useSecurity({ preventCopy: true });

    useEffect(() => {
        const user = getLegacyUser();
        if (!user) {
            router.push('/');
            return;
        }

        const loadReviewQuestions = async () => {
            const items = getReviewItems();
            if (items.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const questionsBatch = await Promise.all(
                    items.map(async (item) => {
                        const res = await fetch(`/api/quiz/${item.chapterId}`);
                        const data = await res.json();
                        return data.questions.find((q: Question) => q.number === item.questionNumber);
                    })
                );
                setReviewItems(questionsBatch.filter((q): q is Question => !!q));
            } catch (e) {
                console.error('Failed to load review questions:', e);
            } finally {
                setLoading(false);
            }
        };

        loadReviewQuestions();
    }, [router]);

    const handleFinish = () => {
        setSessionFinish(true);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <LoadingPrinter />
        </div>
    );

    if (reviewItems.length === 0 && !sessionFinish) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 text-blue-400">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-3xl font-black mb-4">오늘의 복습 완료!</h1>
                <p className="text-slate-400 max-w-md mx-auto mb-10">
                    지금은 복습할 내용이 없습니다. 새로운 학습을 진행하거나 내일 다시 확인해주세요.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all"
                >
                    대시보드로 가기
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">나가기</span>
                    </button>
                    <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs">
                        <RefreshCw size={14} className="animate-spin-slow" /> Spaced Repetition Review
                    </div>
                    <div className="w-20" />
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-12 px-6">
                <AnimatePresence mode="wait">
                    {!sessionFinish ? (
                        <motion.div
                            key="session"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
                                    <Layers className="text-blue-500" /> 틀린 문제 정밀 타격
                                </h1>
                                <p className="text-slate-500">에빙하우스 망각 곡선에 따라 최적의 복습 주기(1, 3, 7일)가 적용됩니다.</p>
                            </div>

                            <QuizSystem
                                questions={reviewItems}
                                onFinish={handleFinish}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="bg-emerald-500/10 p-10 rounded-[3rem] border border-emerald-500/30 max-w-lg">
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                                <h2 className="text-4xl font-black mb-4">복습 세션 완료!</h2>
                                <p className="text-slate-400 mb-10 leading-relaxed">
                                    완벽하게 이해하셨군요. 이 문제들은 기억 저편으로 사라지지 않도록 다음 주기에 다시 등장할 예정입니다.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    대시보드로 돌아가기
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
