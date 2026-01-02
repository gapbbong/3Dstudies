'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, LayoutDashboard, LogOut, BookOpen, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/components/ui/Toast';
import { getProgress, getLegacyUser, UserProgress, getRankInfo } from '@/lib/progress';
import LoadingPrinter from '@/components/ui/LoadingPrinter';
import { BarChart3, MessageSquareText, Trophy } from 'lucide-react';

interface Chapter {
    id: string;
    title: string;
    type: 'basic' | 'practice' | 'advanced';
    questionCount: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<string | null>(null);
    const [progress, setProgress] = useState<UserProgress>({
        chapters: {},
        stats: { temperature: 36.5, totalAttempts: 0, lastLogin: '' }
    });
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const toast = useToast();

    useSecurity({
        preventCopy: true
    });

    useEffect(() => {
        const currentUser = getLegacyUser();
        if (!currentUser) {
            router.push('/');
            return;
        }
        setUser(currentUser);
        setProgress(getProgress());

        const fetchChapters = async () => {
            try {
                const response = await fetch('/api/quiz/chapters');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setChapters(data);
                } else {
                    console.error('API returned non-array:', data);
                    setChapters([]);
                }
            } catch (error) {
                console.error('Failed to fetch chapters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    const isChapterLocked = (idx: number, currentList: Chapter[]) => {
        if (idx === 0) return false;
        const prevId = currentList[idx - 1].id;
        return !progress.chapters[prevId]?.passed;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <LoadingPrinter message="학습 정보를 불러오는 중..." />
            </div>
        );
    }

    const passedChaptersCount = Object.keys(progress.chapters || {}).filter(k => progress.chapters[k]?.passed).length;
    const rankInfo = getRankInfo(progress.stats.temperature);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="text-blue-500" />
                            <span className="text-lg font-black tracking-tighter uppercase italic">Dashboard</span>
                        </div>

                        {/* Teacher View: Current Progress Status */}
                        <div className="hidden lg:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 scale-110 origin-left">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Current Status</span>
                            <div className="h-4 w-[1px] bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-blue-400 italic">
                                    STEP {Math.min(3, Math.floor(passedChaptersCount / 4) + 1)}
                                </span>
                                <span className="text-sm font-bold text-slate-400">
                                    PART {String(passedChaptersCount + 1).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Mobile Status */}
                        <div className="text-right sm:hidden">
                            <div className="text-[10px] font-black text-blue-400 uppercase italic">
                                S{Math.min(3, Math.floor(passedChaptersCount / 4) + 1)} · P{String(passedChaptersCount + 1).padStart(2, '0')}
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="flex items-center gap-2 justify-end mb-0.5">
                                <span className="text-[10px] text-slate-600 font-mono">v1.0.2</span>
                                <div className="text-sm font-bold text-white">{user}</div>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg font-black italic tracking-tighter ring-1 ring-blue-400/20">
                                    {rankInfo.icon} {rankInfo.title.split(' ')[0]}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{rankInfo.title.split(' ').slice(1).join(' ')}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/40 hover:bg-red-500/10 hover:text-red-400 border border-slate-700/50 transition-all group"
                            title="로그아웃"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Learning Tools Quick Nav */}
                <section className="mb-10 flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-blue-400 transition-all">
                        <BarChart3 size={16} /> 데이터 분석
                    </button>
                    <button className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-400 transition-all">
                        <MessageSquareText size={16} /> AI 튜터 질문
                    </button>
                    <button className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-yellow-400 transition-all">
                        <Trophy size={16} /> 명예의 전당 (랭킹)
                    </button>
                </section>
                {/* Stats Section */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/20"
                    >
                        <div>
                            <h2 className="text-4xl font-black mb-4 leading-tight">준비되셨나요?<br />합격은 이미 당신의 것!</h2>
                            <p className="text-blue-100 text-lg opacity-80">학습 온도를 높여 등급을 올려보세요.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/10 text-center">
                                <div className="text-3xl font-black">{passedChaptersCount}</div>
                                <div className="text-xs text-blue-200 mt-1 uppercase tracking-wider font-bold">합격 챕터</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/10 text-center">
                                <div className="text-3xl font-black">{progress.stats.temperature}°C</div>
                                <div className="text-xs text-blue-200 mt-1 uppercase tracking-wider font-bold">학습 온도</div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Categories */}
                {['basic', 'practice', 'advanced'].map((type) => {
                    const typeChapters = chapters.filter(c => c.type === type);
                    if (typeChapters.length === 0) return null;

                    return (
                        <section key={type} className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                {type === 'basic' && <BookOpen className="text-emerald-400" />}
                                {type === 'practice' && <GraduationCap className="text-orange-400" />}
                                {type === 'advanced' && <Play className="text-red-400" />}
                                <h3 className="text-2xl font-bold capitalize">
                                    {type === 'basic' ? '1단계: 핵심 이론 파악' : type === 'practice' ? '2단계: 주제별 기출' : '3단계: 실전 모의고사'}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {typeChapters.map((chapter, idx) => {
                                    const locked = isChapterLocked(idx, typeChapters);
                                    const passed = progress.chapters[chapter.id]?.passed;

                                    return (
                                        <motion.div
                                            key={chapter.id}
                                            whileHover={!locked ? { y: -8, scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.4)' } : {}}
                                            onClick={() => {
                                                if (locked) {
                                                    toast.warning('이전 챕터를 먼저 완료해야 합니다.');
                                                    return;
                                                }
                                                router.push(`/study/${chapter.id}`);
                                            }}
                                            className={`
                                                group relative p-8 rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden
                                                ${locked
                                                    ? 'bg-[#0f172a]/20 border-white/5 opacity-40 grayscale'
                                                    : passed
                                                        ? 'bg-blue-600/5 border-blue-500/20 hover:border-blue-500 shadow-2xl shadow-blue-900/10'
                                                        : 'bg-[#0f172a]/40 border-white/5 hover:border-white/20'}
                                            `}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center border
                                                    ${passed ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-700'}
                                                `}>
                                                    {locked ? <Lock size={20} className="text-slate-600" /> : passed ? <CheckCircle2 size={24} /> : <Play size={20} />}
                                                </div>
                                                {passed && (
                                                    <div className="px-3 py-1 bg-blue-500 text-[10px] font-black uppercase rounded-full tracking-widest">
                                                        PASS
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="text-xl font-bold mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                                                {chapter.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 font-medium">
                                                {chapter.questionCount} 문제 수록
                                            </p>

                                            {locked && (
                                                <div className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                                    Locked (이전 단계 완료 필요)
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}
