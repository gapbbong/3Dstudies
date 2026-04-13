'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ClipboardList, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import QuestionCanvas from './QuestionCanvas';
import ChoiceCanvas from './ChoiceCanvas';

interface Question {
    number: string;
    question: string;
    choices: string[];
    answer: string;
    image?: string | null;
    explanation: string;
}

interface CbtExamSystemProps {
    questions: Question[];
    timeLimitSeconds?: number;
    onFinish: (result: { score: number; answers: Record<string, number>; timeSpent: number }) => void;
}

export default function CbtExamSystem({ questions, timeLimitSeconds = 3600, onFinish }: CbtExamSystemProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [isFinished, setIsFinished] = useState(false);
    const [flags, setFlags] = useState<Record<string, boolean>>({});

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0 || isFinished) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished]);

    // Auto-finish when time is up
    useEffect(() => {
        if (timeLeft <= 0 && !isFinished) {
            handleFinalSubmit();
        }
    }, [timeLeft, isFinished]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleSelect = (choiceIdx: number) => {
        if (isFinished) return;
        setAnswers({ ...answers, [questions[currentIdx].number]: choiceIdx });
    };

    const toggleFlag = () => {
        const qNum = questions[currentIdx].number;
        setFlags({ ...flags, [qNum]: !flags[qNum] });
    };

    const handleFinalSubmit = () => {
        if (isFinished) return;
        
        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0 && timeLeft > 0) {
            if (!confirm(`아직 ${unansweredCount}문항에 답하지 않았습니다. 정말 제출하시겠습니까?`)) {
                return;
            }
        }

        setIsFinished(true);
        let score = 0;
        questions.forEach(q => {
            if (Number(answers[q.number]) === Number(q.answer)) {
                score++;
            }
        });

        onFinish({
            score,
            answers,
            timeSpent: timeLimitSeconds - timeLeft
        });
    };

    const currentQ = questions[currentIdx];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto min-h-[700px]">
            {/* Main Question Area */}
            <div className="flex-1 bg-slate-900/50 rounded-3xl border border-white/5 p-8 flex flex-col">
                {/* Exam Sub-header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl border font-black text-sm tracking-tighter ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}>
                            <Timer className="inline-block mr-2 mb-0.5" size={16} />
                            남은 시간: {formatTime(timeLeft)}
                        </div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            문항 <span className="text-white">{currentIdx + 1}</span> / {questions.length}
                        </div>
                    </div>
                    <button 
                        onClick={toggleFlag}
                        className={`p-2 rounded-xl border transition-all ${flags[currentQ.number] ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                        title="나중에 다시보기 표시"
                    >
                        <Flag size={20} />
                    </button>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                    <QuestionCanvas text={currentQ.question} />
                    
                    <div className="grid grid-cols-1 gap-3 mt-8">
                        {currentQ.choices.map((choice, i) => (
                            <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer ${answers[currentQ.number] === i ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'}`}>
                                <ChoiceCanvas 
                                    text={choice} 
                                    index={i} 
                                    isSelected={answers[currentQ.number] === i} 
                                    isDisabled={isFinished}
                                    onClick={() => handleSelect(i)} 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                    <button 
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl font-bold transition-all"
                    >
                        <ChevronLeft size={18} /> 이전
                    </button>
                    <div className="flex gap-3">
                        {currentIdx < questions.length - 1 ? (
                            <button 
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
                            >
                                다음 <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleFinalSubmit}
                                className="flex items-center gap-2 px-10 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40"
                            >
                                <CheckCircle2 size={18} /> 시험 종료 및 제출
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* OMR Card Sidebar */}
            <div className="w-full lg:w-80 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex flex-col shadow-2xl">
                <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <ClipboardList size={16} /> OMR 답안지
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        {questions.map((q, i) => (
                            <div 
                                key={q.number}
                                onClick={() => setCurrentIdx(i)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${currentIdx === i ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-500">{String(i + 1).padStart(2, '0')}</span>
                                    {flags[q.number] && <Flag size={12} className="text-orange-400 fill-orange-400" />}
                                </div>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map(cIdx => (
                                        <div 
                                            key={cIdx} 
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${answers[q.number] === cIdx ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
                                        >
                                            {cIdx + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <span>진행률: {Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
                        <span>{Object.keys(answers).length} / {questions.length}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-500" 
                            animate={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
