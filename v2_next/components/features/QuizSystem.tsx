'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import QuestionCanvas from './QuestionCanvas';
import ChoiceCanvas from './ChoiceCanvas';
import { GOOGLE_SCRIPT_URL } from '@/lib/security';
import { useSecurity } from '@/hooks/useSecurity';

interface Question {
    number: string;
    question: string;
    choices: string[];
    answer: string;
    image?: string | null;
    choices_images?: string[];
    explanation: string;
}

interface QuizSystemProps {
    questions: Question[];
    onFinish: (result: { score: number; wrongNumbers: string[] }) => void;
}

export default function QuizSystem({ questions, onFinish }: QuizSystemProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [reportModal, setReportModal] = useState<{ isOpen: boolean; qId: string; qText: string } | null>(null);
    const [reportMsg, setReportMsg] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    // Secure focus/blur protection while studying
    useSecurity({
        useCaptureProtect: true,
        preventCopy: true
    });

    const currentQ = questions[currentIdx];

    const handleSelect = (choiceIdx: number) => {
        if (showResult) return;
        setSelectedAnswers({ ...selectedAnswers, [currentQ.number]: choiceIdx });
    };

    const checkAnswer = async () => {
        if (selectedAnswers[currentQ.number] === undefined) return;
        setShowResult(true);
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setShowResult(false);
        } else {
            // Calculate final results
            const wrongNumbers: string[] = [];
            let score = 0;

            questions.forEach(q => {
                const isCorrect = Number(selectedAnswers[q.number]) === Number(q.answer);
                if (isCorrect) score++;
                else wrongNumbers.push(q.number);
            });

            onFinish({ score, wrongNumbers });
        }
    };

    const handleReport = () => {
        setReportModal({
            isOpen: true,
            qId: currentQ.number,
            qText: currentQ.question
        });
    };

    const confirmReport = async () => {
        setIsReporting(true);
        try {
            const user = localStorage.getItem('currentUser') || 'Anonymous';
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Common for GAS
                body: JSON.stringify({
                    type: 'report_error',
                    user,
                    chapterId: 'temp_chapter', // Could be passed as prop
                    questionId: currentQ.number,
                    questionText: currentQ.question,
                    message: reportMsg
                })
            });
            alert('오류 신고가 접수되었습니다.');
            setReportModal(null);
            setReportMsg('');
        } catch (e) {
            alert('신고 전송 중 오류가 발생했습니다.');
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="text-slate-400 text-sm">
                    문제 <span className="text-white font-bold">{currentIdx + 1}</span> / {questions.length}
                </div>
                <div className="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-slate-800/40 backdrop-blur-lg border border-slate-700 p-8 rounded-3xl"
                >
                    {/* Question Canvas (Security) */}
                    <div className="mb-6">
                        <QuestionCanvas
                            text={currentQ.question}
                            onLongPress={handleReport}
                        />
                        <div className="text-[10px] text-slate-600 mt-2 italic">* 문항을 2초간 길게 누르면 오류를 신고할 수 있습니다.</div>
                    </div>

                    {/* Question Image (If exists) */}
                    {currentQ.image && (
                        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-4 relative" style={{ minHeight: '100px' }}> {/* Added relative and minHeight for Image component */}
                            <Image
                                src={currentQ.image}
                                alt="Question Content"
                                className="object-contain"
                                fill // Use fill to make image take up parent space
                                unoptimized // Use unoptimized to avoid Next.js image optimization for external/dynamic images
                            />
                            {/* Fallback icon if URL is broken in dev */}
                            {!currentQ.image.startsWith('http') && <ImageIcon className="text-slate-600" size={48} />}
                        </div>
                    )}

                    {/* Choices */}
                    <div className="grid grid-cols-1 gap-3">
                        {currentQ.choices.map((choice, i) => (
                            <div
                                key={i}
                                className={`
                  p-5 rounded-2xl border transition-all
                  ${selectedAnswers[currentQ.number] === i
                                        ? 'bg-blue-600/20 border-blue-500'
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}
                `}
                            >
                                <ChoiceCanvas
                                    text={choice}
                                    index={i}
                                    isSelected={selectedAnswers[currentQ.number] === i}
                                    isDisabled={showResult}
                                    onClick={() => handleSelect(i)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Result Feedback */}
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 bg-slate-900/80 rounded-2xl border border-slate-700"
                        >
                            <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                                <HelpCircle className="text-blue-400" /> 해설
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {currentQ.explanation}
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex justify-end">
                        {!showResult ? (
                            <button
                                onClick={checkAnswer}
                                disabled={selectedAnswers[currentQ.number] === undefined}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                            >
                                정답 확인하기
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                            >
                                {currentIdx < questions.length - 1 ? '다음 문제' : '결과 확인'}
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {reportModal?.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4 text-amber-400">
                                <AlertTriangle size={24} />
                                <h3 className="text-xl font-black">문항 오류 신고</h3>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">
                                <span className="text-blue-400 font-bold">#{reportModal.qId}</span> 문항의 오류를 신고하시겠습니까?
                            </p>
                            <textarea
                                value={reportMsg}
                                onChange={(e) => setReportMsg(e.target.value)}
                                placeholder="오류 내용을 간단히 입력해 주세요 (선택)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-6 min-h-[100px]"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmReport}
                                    disabled={isReporting}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {isReporting ? '전송 중...' : '신고하기'}
                                </button>
                                <button
                                    onClick={() => setReportModal(null)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                                >
                                    취소
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
