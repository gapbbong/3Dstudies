
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

            // Draw Text with micro distortions (OCR prevention)
            ctx.font = `bold ${fontSize}px "Pretendard Variable", "Inter", sans-serif`;
            ctx.fillStyle = '#94a3b8'; // Slate-400 (matches theme)

            lines.forEach((l, i) => {
                // 각 라인을 문자 단위로 렌더링하여 미세한 왜곡 적용
                let xOffset = 20;
                for (let charIdx = 0; charIdx < l.length; charIdx++) {
                    const char = l[charIdx];
                    const yOffset = 40 + i * lineHeight + (Math.random() - 0.5) * 1.5; // ±0.75px
                    const alpha = 0.97 + Math.random() * 0.03; // 0.97-1.0
                    ctx.globalAlpha = alpha;
                    ctx.fillText(char, xOffset, yOffset);
                    xOffset += ctx.measureText(char).width;
                }
                ctx.globalAlpha = 1.0; // Reset
            });
        };

        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [text]);

    const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // 1. Dense Random Dots (육안으로는 거의 안 보이지만 OCR 방해)
        for (let i = 0; i < 3000; i++) {
            const size = Math.random() * 3 + 1; // 1-4px
            const opacity = Math.random() * 0.08 + 0.05; // 0.05-0.13
            ctx.fillStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, size, size);
        }

        // 2. Stronger Watermark (회전 + 더 촘촘하게)
        ctx.save();
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
        for (let y = -20; y < height + 40; y += 50) {
            for (let x = -40; x < width + 80; x += 100) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.3); // -15° ~ 15°
                ctx.fillText("3D STUDY", 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();

        // 3. Random Lines (가로/세로/대각선)
        ctx.strokeStyle = "rgba(148, 163, 184, 0.04)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            if (Math.random() > 0.5) {
                // 가로선
                const y = Math.random() * height;
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            } else {
                // 세로선
                const x = Math.random() * width;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            ctx.stroke();
        }

        // 4. Diagonal Pattern (대각선 패턴)
        ctx.strokeStyle = "rgba(148, 163, 184, 0.03)";
        ctx.lineWidth = 1;
        for (let i = -height; i < width + height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
        }

        // 5. Micro Gradient Noise (미세한 그라데이션 노이즈)
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
            gradient.addColorStop(0, `rgba(148, 163, 184, ${Math.random() * 0.05})`);
            gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 20, y - 20, 40, 40);
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
