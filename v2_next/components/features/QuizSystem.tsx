'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

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
                    {/* Question Text */}
                    <h2 className="text-xl font-medium leading-relaxed mb-6">
                        <span className="text-blue-400 mr-2 font-bold">Q.</span>
                        {currentQ.question}
                    </h2>

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
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                disabled={showResult}
                                className={`
                  text-left p-5 rounded-2xl border transition-all flex items-start gap-4
                  ${selectedAnswers[currentQ.number] === i
                                        ? 'bg-blue-600/20 border-blue-500 text-white'
                                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}
                `}
                            >
                                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  ${selectedAnswers[currentQ.number] === i ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600'}
                `}>
                                    {i + 1}
                                </div>
                                <span>{choice}</span>
                            </button>
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
        </div>
    );
}
