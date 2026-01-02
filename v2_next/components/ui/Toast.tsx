'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const api: ToastContextType = {
        toast: addToast,
        success: (m) => addToast(m, 'success'),
        error: (m) => addToast(m, 'error'),
        info: (m) => addToast(m, 'info'),
        warning: (m) => addToast(m, 'warning'),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`
                flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md pointer-events-auto
                ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    t.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                        t.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            'bg-blue-500/10 border-blue-500/30 text-blue-400'}
              `}
                        >
                            <div className="flex-shrink-0">
                                {t.type === 'success' && <CheckCircle2 size={20} />}
                                {t.type === 'error' && <AlertCircle size={20} />}
                                {t.type === 'warning' && <AlertCircle size={20} />}
                                {t.type === 'info' && <Info size={20} />}
                            </div>
                            <p className="flex-grow text-sm font-bold leading-relaxed">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
