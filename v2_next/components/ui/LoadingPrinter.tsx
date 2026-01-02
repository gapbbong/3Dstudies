
'use client';

import { motion } from 'framer-motion';

export default function LoadingPrinter({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-24 h-24 border-b-4 border-slate-700">
                {/* Printer Head */}
                <motion.div
                    className="absolute w-6 h-6 bg-blue-500 rounded-sm"
                    animate={{
                        x: [0, 60, 0, 60, 0],
                        y: [0, -5, -10, -15, -20],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Extruder Nozzle */}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-3 bg-blue-400 rounded-full" />
                </motion.div>

                {/* Printing Object (Growing) */}
                <motion.div
                    className="absolute bottom-0 left-4 right-4 bg-gradient-to-t from-blue-600/40 to-blue-400/20 border-t border-blue-400"
                    initial={{ height: 0 }}
                    animate={{ height: [0, 10, 20, 30, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>
            <div className="text-slate-400 font-medium animate-pulse">
                {message || "3D 레이어 쌓는 중..."}
            </div>
        </div>
    );
}
