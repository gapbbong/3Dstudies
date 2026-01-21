
'use client';

import { useEffect, useRef } from 'react';

interface ChoiceCanvasProps {
    text: string;
    index: number;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}

export default function ChoiceCanvas({ text, index, isSelected, isDisabled, onClick }: ChoiceCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const maxWidth = container.clientWidth || 600;
            const lineHeight = 24;
            const fontSize = 16;
            const padding = 20;

            // Set canvas size (and scale for high DPI)
            const dpr = window.devicePixelRatio || 1;
            canvas.width = maxWidth * dpr;
            canvas.height = 60 * dpr; // Fixed height for choice
            canvas.style.width = `${maxWidth}px`;
            canvas.style.height = `60px`;

            ctx.scale(dpr, dpr);

            // Background (transparent)
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, maxWidth, 60);

            // Add OCR Prevention Noise
            addNoise(ctx, maxWidth, 60);

            // Draw choice number circle
            const circleX = 20;
            const circleY = 30;
            const circleRadius = 12;

            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
            if (isSelected) {
                ctx.fillStyle = '#3b82f6'; // blue-500
                ctx.fill();
            }
            ctx.strokeStyle = isSelected ? '#3b82f6' : '#475569'; // blue-500 or slate-600
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw number
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((index + 1).toString(), circleX, circleY);

            // Draw choice text with micro distortions
            ctx.font = `${fontSize}px "Pretendard Variable", "Inter", sans-serif`;
            ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let xOffset = 45;
            for (let charIdx = 0; charIdx < text.length; charIdx++) {
                const char = text[charIdx];
                const yOffset = 30 + (Math.random() - 0.5) * 1.2; // ±0.6px
                const alpha = 0.97 + Math.random() * 0.03; // 0.97-1.0
                ctx.globalAlpha = alpha;
                ctx.fillText(char, xOffset, yOffset);
                xOffset += ctx.measureText(char).width;
            }
            ctx.globalAlpha = 1.0;
        };

        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [text, index, isSelected]);

    const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // 1. Dense Random Dots
        for (let i = 0; i < 800; i++) {
            const size = Math.random() * 2 + 1; // 1-3px
            const opacity = Math.random() * 0.06 + 0.04; // 0.04-0.10
            ctx.fillStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, size, size);
        }

        // 2. Watermark
        ctx.save();
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "rgba(148, 163, 184, 0.06)";
        for (let y = -10; y < height + 20; y += 40) {
            for (let x = -20; x < width + 40; x += 80) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.2);
                ctx.fillText("3D", 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();

        // 3. Random Lines
        ctx.strokeStyle = "rgba(148, 163, 184, 0.03)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            if (Math.random() > 0.5) {
                const y = Math.random() * height;
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            } else {
                const x = Math.random() * width;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            ctx.stroke();
        }

        // 4. Micro Gradient Noise
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, `rgba(148, 163, 184, ${Math.random() * 0.04})`);
            gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, y - 15, 30, 30);
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={isDisabled ? undefined : onClick}
            className={`
                w-full select-none cursor-pointer transition-all
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
            `}
        >
            <canvas
                ref={canvasRef}
                className="w-full"
            />
        </div>
    );
}
