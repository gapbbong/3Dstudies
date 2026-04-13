
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
            const yOffset = 30;
            ctx.fillText(text, xOffset, yOffset);
        };

        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [text, index, isSelected]);

    const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Noise removed for better readability
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
