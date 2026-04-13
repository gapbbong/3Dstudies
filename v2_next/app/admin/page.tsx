'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Activity, ShieldCheck, Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import LoadingPrinter from '@/components/ui/LoadingPrinter';

interface StudentData {
    id: string;
    name: string;
    class: string;
    temperature: number;
    progress: number;
    lastActive: string;
    isOnline: boolean;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Simulate fetching real-time student data (would normally come from Supabase/GAS)
        const mockStudents: StudentData[] = [
            { id: '1', name: '김철수', class: '3-1', temperature: 84.5, progress: 92, lastActive: '2분 전', isOnline: true },
            { id: '2', name: '이영희', class: '3-1', temperature: 42.1, progress: 45, lastActive: '10분 전', isOnline: false },
            { id: '3', name: '박민준', class: '3-2', temperature: 105.8, progress: 100, lastActive: '방금 전', isOnline: true },
            { id: '4', name: '최지우', class: '3-2', temperature: 38.2, progress: 12, lastActive: '1시간 전', isOnline: false },
            { id: '5', name: '정우성', class: '3-1', temperature: 67.4, progress: 68, lastActive: '5분 전', isOnline: true },
        ];
        
        setTimeout(() => {
            setStudents(mockStudents);
            setLoading(false);
        }, 1200);
    }, []);

    const filteredStudents = students.filter(s => 
        s.name.includes(searchQuery) || s.class.includes(searchQuery)
    );

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <LoadingPrinter message="관리자 콘솔 초기화 중..." />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-widest text-xs mb-2">
                        <ShieldCheck size={16} /> Admin Console
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Teacher Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="학생 이름 또는 반 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 md:w-80"
                        />
                    </div>
                    <button className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {/* Stats Overview */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Users size={24} /></div>
                            <span className="flex items-center text-xs font-bold text-emerald-400"><ArrowUpRight size={14} /> 12%</span>
                        </div>
                        <div className="text-2xl font-black">128명</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">총 학습 학생</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Activity size={24} /></div>
                            <span className="flex items-center text-xs font-bold text-emerald-400"><ArrowUpRight size={14} /> 5%</span>
                        </div>
                        <div className="text-2xl font-black">42명</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">현재 동시 접속</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400"><BarChart3 size={24} /></div>
                            <span className="flex items-center text-xs font-bold text-red-400"><ArrowDownRight size={14} /> 2.1%</span>
                        </div>
                        <div className="text-2xl font-black">60.4°C</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">평균 학습 온도</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><ShieldCheck size={24} /></div>
                            <span className="flex items-center text-xs font-bold text-emerald-400"><ArrowUpRight size={14} /> 100%</span>
                        </div>
                        <div className="text-2xl font-black">안전</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">보안 시스템 상태</div>
                    </div>
                </section>

                {/* Student Table */}
                <section className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-lg font-bold">학생별 학습 현황</h3>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold transition-all">
                                <Filter size={14} /> 필터
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    <th className="px-8 py-6">상태</th>
                                    <th className="px-8 py-6">이름</th>
                                    <th className="px-8 py-6">학급</th>
                                    <th className="px-8 py-6">학습 온도</th>
                                    <th className="px-8 py-6">진척도</th>
                                    <th className="px-8 py-6">최근 활동</th>
                                    <th className="px-8 py-6">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                        </td>
                                        <td className="px-8 py-6 font-bold text-slate-200">{student.name}</td>
                                        <td className="px-8 py-6 text-slate-400 font-mono text-xs">{student.class}</td>
                                        <td className="px-8 py-6">
                                            <span className={`font-black ${student.temperature > 80 ? 'text-orange-400' : 'text-blue-400'}`}>
                                                {student.temperature}°C
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-[100px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${student.progress}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-slate-500 underline decoration-slate-800 underline-offset-4">{student.lastActive}</td>
                                        <td className="px-8 py-6">
                                            <button className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="py-20 text-center text-slate-500 font-bold">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
