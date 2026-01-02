// Multi-tab prevention logic (Robust Version with LocalStorage)
(function () {
    const LOCK_KEY = 'app_tab_lock';
    const HEARTBEAT_INTERVAL = 1000;
    const LOCK_TIMEOUT = 3000; // If lock is older than 3s, assume it's dead
    const tabId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const channel = new BroadcastChannel('app_instance_channel');

    function blockAccess() {
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#f8f9fa; color:#333; font-family:sans-serif; text-align:center;">
                <h1 style="font-size:2rem; margin-bottom:1rem;">⚠️ 중복 실행 감지됨</h1>
                <p style="font-size:1.2rem; margin-bottom:0.5rem; color:#666;">이미 다른 창에서 앱이 실행 중입니다.</p>
                <p style="font-size:1rem; color:#999; margin-bottom:2rem;">데이터 충돌 방지를 위해 하나의 창만 사용해주세요.</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="window.close()" style="padding:10px 20px; font-size:1rem; cursor:pointer; background-color:#e74c3c; color:white; border:none; border-radius:5px;">창 닫기</button>
                    <button onclick="window.location.reload()" style="padding:10px 20px; font-size:1rem; cursor:pointer; background-color:#3498db; color:white; border:none; border-radius:5px;">사용할 수 있도록 갱신 (강제 실행)</button>
                </div>
            </div>
        `;
        // Stop heartbeat if running
        if (heartbeatTimer) clearInterval(heartbeatTimer);
    }

    let heartbeatTimer;

    function startHeartbeat() {
        // Initial set
        updateLock();

        heartbeatTimer = setInterval(() => {
            updateLock();
        }, HEARTBEAT_INTERVAL);
    }

    function updateLock() {
        // We write our ID and current time
        localStorage.setItem(LOCK_KEY, JSON.stringify({
            id: tabId,
            time: Date.now()
        }));
    }

    function checkLock() {
        const lockRaw = localStorage.getItem(LOCK_KEY);
        if (lockRaw) {
            try {
                const lock = JSON.parse(lockRaw);
                const timeDiff = Date.now() - lock.time;

                // If lock exists and is "fresh" (less than timeout) AND it's not us
                if (timeDiff < LOCK_TIMEOUT && lock.id !== tabId) {
                    // Someone else is active
                    console.log("Active detected via LocalStorage:", lock.id);
                    blockAccess();
                    return false; // Blocked
                }
            } catch (e) {
                console.error("Lock parse error", e);
            }
        }
        return true; // Safe to proceed
    }

    // 1. Check LocalStorage first (Persistent check)
    if (!checkLock()) {
        return; // Already blocked
    }

    // 2. Start Heartbeat (Taking ownership)
    startHeartbeat();

    // 3. Listen for checks from others (BroadcastChannel - Immediate check)
    channel.onmessage = function (event) {
        if (event.data.type === 'check_active') {
            // Someone asked if we are here.
            // Check if we are the rightful owner? 
            // We just say "I am here"
            channel.postMessage({
                type: 'i_am_active',
                id: tabId
            });
        } else if (event.data.type === 'i_am_active') {
            // Someone else claims they are active.
            // Conflict resolution: The one who started EARLIER (or has lock) stays?
            // Usually, the NEW tab (us, potentially) receives this if we just joined.

            // Or, if we are an existing tab and see another existing tab?
            // Let's assume this message is only relevant if we are "Starting up".
            // But we are already running.

            // If the other ID is NOT us, and we are running...
            // It might be a late message.
            // Let's rely on LocalStorage for the definitive "One Only" source of truth
            // to avoid "Ping Pong" closing of both tabs.

            // Actually, if we receive 'i_am_active', it means WE are the intruder OR they are.
            // If our start time is much later than theirs...
            // But we didn't send start time.

            // Simple logic: If we receive 'i_am_active', and their ID != our ID...
            if (event.data.id !== tabId) {
                // If we JUST started (e.g. within last 2 seconds), we should bow out.
                // But we already checked lock.

                // Let's check lock again.
                // If the LOCK ID is not ours, we die.
                const lockRaw = localStorage.getItem(LOCK_KEY);
                if (lockRaw) {
                    const lock = JSON.parse(lockRaw);
                    if (lock.id !== tabId && (Date.now() - lock.time < LOCK_TIMEOUT)) {
                        blockAccess();
                    }
                }
            }
        }
    };

    // 4. Initial Ping (Double check)
    channel.postMessage({ type: 'check_active' });

    // 5. Storage Event Listener (To detect if someone overwrites our lock)
    window.addEventListener('storage', (e) => {
        if (e.key === LOCK_KEY) {
            // Someone changed the lock!
            checkLock();
        }
    });

    // Cleanup on close/refresh
    window.addEventListener('beforeunload', () => {
        // Stop heartbeat immediately so we don't re-acquire lock while prompt is shown
        if (heartbeatTimer) clearInterval(heartbeatTimer);

        const lockRaw = localStorage.getItem(LOCK_KEY);
        if (lockRaw) {
            try {
                const lock = JSON.parse(lockRaw);
                // If we own the lock, release it so the next load (refresh) can take it immediately
                if (lock.id === tabId) {
                    localStorage.removeItem(LOCK_KEY);
                }
            } catch (e) {
                // Ignore errors
            }
        }
    });

})();
