"use client";

import { ReactNode } from "react";
import { useConfigStore } from "@/hooks/useConfig";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { motion, AnimatePresence } from "framer-motion";

interface SmartLayoutProps {
  children: ReactNode;
  userId?: string;
}

export function SmartLayout({ children, userId }: SmartLayoutProps) {
  const { config, isLoading, temp } = useConfigStore();
  const { isBlurred } = useHeartbeat(userId);

  const isFeverMode = temp >= 90;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  // 화면 보호 (탭 중복 접속 방지)
  if (isBlurred && config?.SECURITY_CONFIG.SCREEN_PROTECTION_LEVEL === "BLUR") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">접근 제한됨</h2>
        <p className="text-zinc-400">다른 탭이나 창에서 두기고 플랫폼이 켜져 있습니다.</p>
        <p className="text-sm mt-2 text-zinc-500">학습의 집중을 위해 하나의 탭만 허용합니다.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition"
        >
          현재 창 강제 점유하기
        </button>
      </div>
    );
  }

  return (
    <div 
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      onDragStart={(e: React.DragEvent) => e.preventDefault()}
      className={`relative min-h-screen w-full font-sans transition-colors duration-[800ms] ${
      isFeverMode 
        ? "bg-red-950 text-zinc-50 selection:bg-red-500" 
        : "bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-orange-500 border-zinc-200"
    }`}>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full transition-colors duration-1000 mix-blend-screen blur-[120px] ${
          isFeverMode ? "bg-red-600/30" : "bg-orange-400/10"
        }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full transition-colors duration-1000 mix-blend-screen blur-[120px] ${
          isFeverMode ? "bg-orange-600/30" : "bg-indigo-500/10"
        }`} />
      </div>

      <AnimatePresence>
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isFeverMode ? 0.2 : 0.4, ease: "easeOut" }}
          className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-12 pb-32 sm:px-6 lg:px-8 flex flex-col items-center"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
