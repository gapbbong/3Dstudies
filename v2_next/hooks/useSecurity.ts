
import { useEffect } from 'react';

interface SecurityOptions {
    onDevToolsOpen?: () => void;
    onEnter?: (e: KeyboardEvent) => void;
    onSpace?: () => void;
    onEsc?: () => void;
    preventCopy?: boolean;
}

export function useSecurity(options: SecurityOptions = {}) {
    useEffect(() => {
        // 1. DevTools Detection (Simplified for modern browsers)
        const handleDevToolsChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ isOpen: boolean }>;
            if (customEvent.detail?.isOpen && options.onDevToolsOpen) {
                options.onDevToolsOpen();
            }
        };

        window.addEventListener('devtoolschange', handleDevToolsChange);

        // 2. Keyboard Shortcuts (Enter, Space, Esc)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && options.onEnter) options.onEnter(e);
            if (e.key === ' ' && options.onSpace) options.onSpace();
            if (e.key === 'Escape' && options.onEsc) options.onEsc();
        };

        window.addEventListener('keydown', handleKeyDown);

        // 3. Copy/Context Menu Protection
        const handleContext = (e: MouseEvent) => {
            if (options.preventCopy) {
                e.preventDefault();
                alert('보안을 위해 우클릭이 제한됩니다.');
            }
        };

        const handleCopy = (e: Event) => {
            if (options.preventCopy) {
                e.preventDefault();
            }
        };

        if (options.preventCopy) {
            window.addEventListener('contextmenu', handleContext);
            window.addEventListener('copy', handleCopy);
        }

        return () => {
            window.removeEventListener('devtoolschange', handleDevToolsChange);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContext);
            window.removeEventListener('copy', handleCopy);
        };
    }, [options]);
}
