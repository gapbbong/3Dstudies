
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurity } from '@/hooks/useSecurity';

interface TheoryTracingProps {
    targetText: string;
    onComplete: () => void;
    isRecallMode?: boolean;
    keywords?: string[];
}

const DEFAULT_KEYWORDS = ['FDM', 'SLA', 'DLP', 'SLS', 'FFF', 'G-Code', 'STL', '적층', '레이어', '필라멘트', '베드', '노즐', '익스트루더', '서포트', '슬라이싱', '큐라', '메쉬', '모델링', '출력', '베드', '안전', '수평', '레벨링'];

export default function TheoryTracing({ targetText, onComplete, isRecallMode = false, keywords = [] }: TheoryTracingProps) {
    const [userInput, setUserInput] = useState('');
    const [accuracy, setAccuracy] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const mergedKeywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords]));

    const isKeyword = useCallback((word: string) => {
        const clean = word.replace(/[.,!?()[\]]/g, '');
        return mergedKeywords.includes(clean) || (clean.length >= 4 && !clean.includes(' '));
    }, [mergedKeywords]);

    const handleAutoReplace = (text: string, start: number) => {
        const transformed = text
            .replace(/--/g, '→')
            .replace(/\.\./g, '·');

        if (transformed !== text) {
            setUserInput(transformed);
            requestAnimationFrame(() => {
                const input = inputRef.current;
                if (input) {
                    const offset = text.length - transformed.length;
                    input.setSelectionRange(start - offset, start - offset);
                }
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const start = e.target.selectionStart;
        setUserInput(val);
        handleAutoReplace(val, start);

        // Calculate progress based on matching characters (ignoring whitespace differences)
        let matched = 0;
        const userChars = val.replace(/\s+/g, '');
        const targetChars = targetText.replace(/\s+/g, '');
        const minLen = Math.min(userChars.length, targetChars.length);
        for (let i = 0; i < minLen; i++) {
            if (userChars[i] === targetChars[i]) matched++;
        }
        const progress = Math.min(100, Math.floor((matched / targetChars.length) * 100));
        setAccuracy(progress);
    };

    const handleSubmit = () => {
        if (accuracy >= 98) {
            setIsSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1500);
        } else {
            alert(`아직 ${accuracy}% 완성되었습니다. 98% 이상 채워주세요!`);
        }
    };

    useSecurity({
        onEnter: (e: KeyboardEvent) => {
            if (e?.ctrlKey) handleSubmit();
        },
        preventCopy: true
    });

    // Draw text to Canvas with pixel noise for anti-OCR
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
        if (!ctx) return;

        const fontSize = 20;
        const lineHeight = 32;
        const padding = 24;
        const letterSpacing = 1;

        const fontStack = 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
        ctx.font = `500 ${fontSize}px ${fontStack}`;
        ctx.textBaseline = 'top';
        ctx.imageSmoothingEnabled = true;

        const targetTokens = targetText.split(/(\s+)/);
        const userTokens = userInput.split(/(\s+)/);

        // Calculate required height
        let x = padding;
        let y = padding;
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const maxWidth = containerWidth - (padding * 2);

        targetTokens.forEach((token) => {
            const isWhitespace = /\s+/.test(token);
            if (token.includes('\n')) {
                const newlineCount = (token.match(/\n/g) || []).length;
                x = padding;
                y += lineHeight * newlineCount;
                if (newlineCount > 1) y += lineHeight * 0.5;
                return;
            }
            const tokenWidth = token.split('').reduce((acc, char) => {
                return acc + ctx.measureText(char).width + letterSpacing;
            }, 0);
            if (x + tokenWidth > maxWidth && !isWhitespace && x !== padding) {
                x = padding;
                y += lineHeight;
            }
            x += tokenWidth;
        });

        const requiredHeight = y + lineHeight + padding;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = containerWidth * dpr;
        canvas.height = requiredHeight * dpr;
        ctx.scale(dpr, dpr);

        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${requiredHeight}px`;

        ctx.clearRect(0, 0, containerWidth, requiredHeight);
        ctx.font = `500 ${fontSize}px ${fontStack}`;
        ctx.textBaseline = 'top';
        ctx.imageSmoothingEnabled = true;

        // Render
        x = padding;
        y = padding;

        targetTokens.forEach((token, i) => {
            const isWhitespace = /\s+/.test(token);
            const userToken = userTokens[i] || '';
            const isLastToken = i === userTokens.length - 1;
            const isPastToken = i < userTokens.length - 1;
            const shouldMask = isRecallMode && !isWhitespace && isKeyword(token);

            if (token.includes('\n')) {
                const newlineCount = (token.match(/\n/g) || []).length;
                x = padding;
                y += lineHeight * newlineCount;
                if (newlineCount > 1) y += lineHeight * 0.5;
                return;
            }

            let displayText = token;
            if (shouldMask && userToken !== token) {
                displayText = '■'.repeat(token.length);
            }

            if (isPastToken) {
                ctx.fillStyle = userToken === token ? '#60a5fa' : '#ef4444';
            } else if (isLastToken && !isWhitespace) {
                ctx.fillStyle = '#ffffff';
            } else if (shouldMask) {
                ctx.fillStyle = '#facc15';
            } else {
                ctx.fillStyle = '#334155';
            }

            const tokenWidth = displayText.split('').reduce((acc, char) => {
                return acc + ctx.measureText(char).width + letterSpacing;
            }, 0);

            if (x + tokenWidth > maxWidth && !isWhitespace && x !== padding) {
                x = padding;
                y += lineHeight;
            }

            displayText.split('').forEach(char => {
                ctx.fillText(char, x, y);
                x += ctx.measureText(char).width + letterSpacing;
            });
        });

        // Add pixel noise for OCR protection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                const noise = (Math.random() - 0.5) * 6;
                data[i] += noise;
                data[i + 1] += noise;
                data[i + 2] += noise;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }, [userInput, targetText, isRecallMode, isKeyword]);

    return (
        <div className="w-full max-w-[90%] mx-auto px-2">
            {/* Mobile: Overlay typing (< md) */}
            <div className="md:hidden flex flex-col gap-4">
                <div className="relative w-full max-h-[480px] bg-slate-900 rounded-2xl border border-slate-700 overflow-y-auto shadow-inner">
                    <canvas
                        ref={canvasRef}
                        className="w-full pointer-events-none select-none z-0"
                        style={{ imageRendering: 'auto' }}
                        aria-hidden="true"
                        role="presentation"
                    />

                    <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={handleChange}
                        spellCheck={false}
                        className="absolute top-0 left-0 right-0 bg-transparent p-6 text-xl leading-relaxed text-white whitespace-pre-wrap outline-none resize-none z-10 caret-blue-500"
                        style={{
                            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
                            letterSpacing: '1px',
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: '32px',
                            padding: '24px'
                        }}
                        placeholder={isRecallMode ? "빈칸(■■)에 들어갈 내용을 채우며 입력하세요..." : "여기에 위 내용을 따라 적으세요..."}
                        autoFocus
                    />
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-400">
                            {isRecallMode ? '암기율' : '진행도'}: <span className="font-bold text-blue-400">{accuracy}%</span>
                        </div>
                        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${isRecallMode ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${accuracy}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className={`px-6 py-2 ${isRecallMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-lg font-bold transition-all disabled:opacity-50`}
                        disabled={accuracy < 98}
                    >
                        {isRecallMode ? '암기 완료' : '제출하기'}
                    </button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                    {isRecallMode
                        ? "※ 노란색 박스는 핵심 키워드입니다. 기억을 되살려 입력해보세요!"
                        : "※ --는 →로, ..은 ·으로 자동 변환됩니다. Ctrl+Enter로 제출"
                    }
                </p>
            </div>

            {/* PC/Tablet: Side-by-side (>= md) */}
            <div className="hidden md:grid md:grid-cols-2 gap-8">
                {/* Left: Theory Display */}
                <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-h-[600px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">📖 핵심 이론</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        {isRecallMode
                            ? "※ 노란색 박스는 핵심 키워드입니다."
                            : "※ --는 →로, ..은 ·으로 자동 변환됩니다."
                        }
                    </p>
                    <canvas
                        ref={canvasRef}
                        className="w-full pointer-events-none select-none"
                        style={{ imageRendering: 'auto' }}
                        aria-hidden="true"
                        role="presentation"
                    />
                </div>

                {/* Right: Input Area */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 flex-1">
                        <h3 className="text-lg font-bold text-green-400 mb-4">✍️ 따라쓰기</h3>
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={handleChange}
                            spellCheck={false}
                            className="w-full h-[500px] bg-slate-800 p-4 text-xl leading-relaxed text-white whitespace-pre-wrap outline-none resize-none rounded-lg caret-blue-500"
                            style={{
                                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
                                letterSpacing: '1px',
                                lineHeight: '32px'
                            }}
                            placeholder={isRecallMode ? "빈칸에 들어갈 내용을 입력하세요..." : "왼쪽 이론을 보고 여기에 따라 적으세요..."}
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-400">
                                {isRecallMode ? '암기율' : '진행도'}: <span className="font-bold text-blue-400">{accuracy}%</span>
                            </div>
                            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${isRecallMode ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${accuracy}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className={`px-6 py-2 ${isRecallMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-lg font-bold transition-all disabled:opacity-50`}
                            disabled={accuracy < 98}
                        >
                            {isRecallMode ? '암기 완료' : '제출하기'} (Ctrl+Enter)
                        </button>
                    </div>
                </div>
            </div>
            {/* Success Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-blue-600/10 p-12 rounded-[3rem] border border-blue-500/20"
                        >
                            <div className="text-7xl mb-6">🎯</div>
                            <h2 className="text-4xl font-black text-white mb-2">훌륭합니다!</h2>
                            <p className="text-blue-400 text-lg">내용을 완벽하게 {isRecallMode ? '암기' : '정독'}하셨습니다.</p>
                            <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                                잠시 후 다음 단계로 이동합니다...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
