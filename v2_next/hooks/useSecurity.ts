
import { useEffect } from 'react';

interface SecurityOptions {
    onDevToolsOpen?: () => void;
    onEnter?: (e: KeyboardEvent) => void;
    onSpace?: () => void;
    onEsc?: () => void;
    preventCopy?: boolean;
    useCaptureProtect?: boolean;
    preventMultiTab?: boolean;
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
            window.addEventListener('dragstart', handleContext as any);
            window.addEventListener('drop', handleContext as any);
        }

        // 4. Capture Protection (Focus/Blur)
        const handleBlur = () => {
            if (options.useCaptureProtect) {
                document.getElementById('capture-protect-overlay')?.style.setProperty('display', 'flex');
                document.getElementById('main-content-area')?.classList.add('capture-blur');
            }
        };

        const handleFocus = () => {
            if (options.useCaptureProtect) {
                document.getElementById('capture-protect-overlay')?.style.setProperty('display', 'none');
                document.getElementById('main-content-area')?.classList.remove('capture-blur');
            }
        };

        if (options.useCaptureProtect) {
            window.addEventListener('blur', handleBlur);
            window.addEventListener('focus', handleFocus);
        }

        // 5. Multi-tab Prevention (Heartbeat)
        let heartbeatInterval: NodeJS.Timeout;
        const tabId = Math.random().toString(36).substring(7);

        if (options.preventMultiTab) {
            const checkMultiTab = () => {
                const now = Date.now();
                const lastHeartbeat = Number(localStorage.getItem('3d_study_heartbeat') || 0);
                const lastTabId = localStorage.getItem('3d_study_tab_id');

                if (lastTabId && lastTabId !== tabId && (now - lastHeartbeat) < 3000) {
                    // Another tab is active
                    alert('중복 접속이 감지되었습니다. 원활한 학습과 보안을 위해 한 개의 탭만 이용해 주세요.');
                    window.location.href = 'about:blank';
                } else {
                    localStorage.setItem('3d_study_heartbeat', now.toString());
                    localStorage.setItem('3d_study_tab_id', tabId);
                }
            };

            checkMultiTab();
            heartbeatInterval = setInterval(checkMultiTab, 2000);
        }

        return () => {
            window.removeEventListener('devtoolschange', handleDevToolsChange);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContext);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('dragstart', handleContext as any);
            window.removeEventListener('drop', handleContext as any);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [options]);
}
