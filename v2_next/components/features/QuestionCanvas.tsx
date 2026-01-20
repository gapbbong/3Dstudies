
'use client';

import { useEffect, useRef } from 'react';

interface QuestionCanvasProps {
    text: string;
    onLongPress?: () => void;
}

export default function QuestionCanvas({ text, onLongPress }: QuestionCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const maxWidth = container.clientWidth || 800;
            const lineHeight = 32;
            const fontSize = 20;

            ctx.font = `bold ${fontSize}px Arial`;
            const words = text.split(' ');
            let line = '';
            const lines: string[] = [];

            words.forEach(word => {
                const testLine = line + word + ' ';
                if (ctx.measureText(testLine).width > maxWidth - 40) {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            });
            lines.push(line);

            // Set canvas size (and scale for high DPI)
            const dpr = window.devicePixelRatio || 1;
            canvas.width = maxWidth * dpr;
            canvas.height = (lines.length * lineHeight + 40) * dpr;
            canvas.style.width = `${maxWidth}px`;
            canvas.style.height = `${lines.length * lineHeight + 40}px`;

            ctx.scale(dpr, dpr);

            // Draw Background (Slightly Textured)
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, maxWidth, canvas.height);

            // Add Security Noise
            addNoise(ctx, maxWidth, lines.length * lineHeight + 40);

            // Draw Text
            ctx.font = `bold ${fontSize}px "Pretendard Variable", "Inter", sans-serif`;
            ctx.fillStyle = '#94a3b8'; // Slate-400 (matches theme)

            lines.forEach((l, i) => {
                ctx.fillText(l, 20, 40 + i * lineHeight);
            });
        };

        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [text]);

    const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // 1. Random Dots
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = `rgba(148, 163, 184, ${Math.random() * 0.04})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
        // 2. Subtle Watermark
        ctx.font = "10px Arial";
        ctx.fillStyle = "rgba(148, 163, 184, 0.05)";
        for (let y = 0; y < height; y += 60) {
            for (let x = 0; x < width; x += 120) {
                ctx.fillText("3D STUDY", x, y);
            }
        }
    };

    const handleStart = () => {
        timerRef.current = setTimeout(() => {
            if (onLongPress) onLongPress();
        }, 1500);
    };

    const handleEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <div ref={containerRef} className="w-full select-none cursor-default">
            <canvas
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                className="w-full"
            />
        </div>
    );
}
