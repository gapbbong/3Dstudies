'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, LayoutDashboard, LogOut, BookOpen, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/components/ui/Toast';
import { getProgress, getLegacyUser, UserProgress, getRankInfo } from '@/lib/progress';
import LoadingPrinter from '@/components/ui/LoadingPrinter';
import { BarChart3, MessageSquareText, Trophy, Thermometer } from 'lucide-react';

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
        preventCopy: true,
        preventMultiTab: true
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 bg-[#0f172a] p-12 rounded-[3.5rem] border border-white/5 shadow-3xl"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />

                        <div className="relative z-10 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight text-white">
                                    {user}님,<br />
                                    <span className="text-blue-500">열정적인 학습</span>이<br />
                                    성장을 이끕니다!
                                </h2>
                                <p className="text-slate-400 text-lg font-medium max-w-md">
                                    현재 {rankInfo.title} 단계입니다. <br />
                                    {rankInfo.description}
                                </p>
                            </motion.div>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-12">
                            {/* Temperature Gauge */}
                            <div className="relative flex items-center justify-center">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray="552.92"
                                        initial={{ strokeDashoffset: 552.92 }}
                                        animate={{ strokeDashoffset: 552.92 - (Math.min(100, (progress.stats.temperature / 1000) * 100) / 100) * 552.92 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                        className="text-blue-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Thermometer className="text-blue-400 mb-1" size={24} />
                                    <div className="text-3xl font-black text-white">{progress.stats.temperature}°C</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Learning Temp</div>
                                </div>
                            </div>

                            {/* Badge Info */}
                            <div className="flex flex-col gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-slate-900/50 backdrop-blur-xl px-8 py-6 rounded-3xl border border-white/5 flex items-center gap-6"
                                >
                                    <div className="text-5xl">{rankInfo.icon}</div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Current Tier</div>
                                        <div className="text-2xl font-black text-white">{rankInfo.title.split(' ').slice(1).join(' ')}</div>
                                    </div>
                                </motion.div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/5 text-center">
                                        <div className="text-2xl font-black text-blue-400">{passedChaptersCount}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chapters</div>
                                    </div>
                                    <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/5 text-center">
                                        <div className="text-2xl font-black text-indigo-400">{progress.stats.totalAttempts}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Attempts</div>
                                    </div>
                                </div>
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
                                            <p className="text-sm text-slate-500 font-medium mb-6">
                                                {chapter.questionCount} 문제 수록
                                            </p>

                                            <div className="flex gap-2">
                                                <button 
                                                    disabled={locked}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/study/${chapter.id}`);
                                                    }}
                                                    className={`hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${passed ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-slate-400'}`}
                                                >
                                                    {passed ? 'Step 1: Review' : 'Step 1: Study'}
                                                </button>
                                                {(passed || chapter.type === 'advanced') && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/exam/${chapter.id}`);
                                                        }}
                                                        className="hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                                                    >
                                                        Step 2: Exam
                                                    </button>
                                                )}
                                            </div>

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
