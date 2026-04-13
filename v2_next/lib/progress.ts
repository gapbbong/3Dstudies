
export const PROGRESS_KEY = '3d_study_progress';

export interface ProgressData {
    passed: boolean;
    score: number;
    total: number;
    updatedAt: string;
}

export interface ReviewItem {
    questionNumber: string;
    scheduledDate: string;
    level: number;
}

export interface UserStats {
    temperature: number;
    totalAttempts: number;
    lastLogin: string;
}

export interface UserProgressEntry extends ProgressData {
    lastStudy: string;
    reviewBatch?: ReviewItem[];
    theoryAttempts?: number;
}

export interface UserProgress {
    chapters: Record<string, UserProgressEntry>;
    stats: UserStats;
}

// Spaced Repetition Intervals (days)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// Basic protection to prevent direct reading/tampering in localStorage
const SALT = '3D_PRINTER_STUDY_SECURE_SALT';
const encode = (str: string) => {
    return btoa(unescape(encodeURIComponent(str.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
    ).join(''))));
};

const decode = (str: string) => {
    try {
        const decoded = atob(str);
        return decodeURIComponent(escape(decoded.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
        ).join('')));
    } catch {
        return null;
    }
};

const DEFAULT_STATS: UserStats = {
    temperature: 36.5,
    totalAttempts: 0,
    lastLogin: new Date().toISOString()
};

const getUserKey = (username: string) => `${PROGRESS_KEY}_${username}`;

export const getProgress = (username?: string): UserProgress => {
    if (typeof window === 'undefined') return { chapters: {}, stats: DEFAULT_STATS };
    
    const user = username || localStorage.getItem('currentUser');
    if (!user) {
        // Fallback to legacy if no user logged in yet (unlikely in study mode)
        const globalSaved = localStorage.getItem(PROGRESS_KEY);
        if (globalSaved) return parseProgress(globalSaved);
        return { chapters: {}, stats: DEFAULT_STATS };
    }

    const userKey = getUserKey(user);
    const saved = localStorage.getItem(userKey);

    if (saved) return parseProgress(saved);

    // If no user-specific data, try to migrate from global if it's the right user
    const globalSaved = localStorage.getItem(PROGRESS_KEY);
    if (globalSaved) {
        const globalData = parseProgress(globalSaved);
        // Basic check: if global data exists and it's 36.5 (default), maybe it's fresh
        // But if it's higher, it belongs to someone. For safety, we only migrate if we're sure.
        // For now, let's keep it simple: new user = new progress, unless we have clear legacy.
        return globalData; 
    }

    return { chapters: {}, stats: DEFAULT_STATS };
};

const parseProgress = (saved: string): UserProgress => {
    const decoded = decode(saved);
    let data: any = null;
    try {
        data = decoded ? JSON.parse(decoded) : JSON.parse(saved);
    } catch {
        return { chapters: {}, stats: DEFAULT_STATS };
    }

    if (!!data && typeof data === 'object' && !('chapters' in data) && !('stats' in data)) {
        return { chapters: data, stats: DEFAULT_STATS };
    }
    return data || { chapters: {}, stats: DEFAULT_STATS };
}

export const getLegacyUser = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('currentUser');
};

export function saveProgress(chapterId: string, data: {
    passed: boolean;
    score: number;
    total: number;
    wrongNumbers?: string[];
    tempChange?: number;
    theoryDelta?: number;
}, username?: string) {
    if (typeof window === 'undefined') return;

    const user = username || localStorage.getItem('currentUser');
    if (!user) return;

    const progress = getProgress(user);
    const existing = progress.chapters[chapterId] || {
        passed: false,
        score: 0,
        total: 0,
        lastStudy: '',
        reviewBatch: [],
        updatedAt: new Date().toISOString()
    };

    const newProgress: UserProgressEntry = {
        ...existing,
        passed: data.passed || existing.passed,
        score: data.score,
        total: data.total || existing.total,
        lastStudy: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theoryAttempts: (existing.theoryAttempts || 0) + (data.theoryDelta || 0)
    };

    if (data.wrongNumbers && data.wrongNumbers.length > 0) {
        const now = Date.now();
        const batch: ReviewItem[] = data.wrongNumbers.map(num => ({
            questionNumber: num,
            scheduledDate: new Date(now + REVIEW_INTERVALS[0] * 24 * 60 * 60 * 1000).toISOString(),
            level: 0
        }));

        const existingBatch = existing.reviewBatch || [];
        const mergedBatch = [...existingBatch];
        batch.forEach(item => {
            const idx = mergedBatch.findIndex(b => b.questionNumber === item.questionNumber);
            if (idx === -1) mergedBatch.push(item);
            else mergedBatch[idx] = item;
        });
        newProgress.reviewBatch = mergedBatch;
    }

    progress.chapters[chapterId] = newProgress;
    if (data.tempChange) {
        progress.stats.temperature = Math.round((progress.stats.temperature + data.tempChange) * 10) / 10;
    }
    progress.stats.totalAttempts += 1;
    progress.stats.lastLogin = new Date().toISOString();

    localStorage.setItem(getUserKey(user), encode(JSON.stringify(progress)));

    // Also update global for backward compatibility with vanilla app
    localStorage.setItem(PROGRESS_KEY, encode(JSON.stringify(progress)));
    syncWithLegacy(chapterId, newProgress, progress.stats.temperature);
}

export function getReviewItems(): { chapterId: string, questionNumber: string }[] {
    if (typeof window === 'undefined') return [];
    const progress = getProgress();
    const items: { chapterId: string, questionNumber: string }[] = [];
    const now = new Date();

    Object.entries(progress.chapters).forEach(([chapterId, entry]) => {
        if (entry.reviewBatch) {
            entry.reviewBatch.forEach(b => {
                if (new Date(b.scheduledDate) <= now) {
                    items.push({ chapterId, questionNumber: b.questionNumber });
                }
            });
        }
    });

    return items;
}

export function getRankInfo(temp: number) {
    if (temp >= 1000) return { title: 'Lv.7 숲 (Master)', icon: '🌲', color: '#27ae60', description: '완성된 숲의 명예로운 마스터입니다!' };
    if (temp >= 700) return { title: 'Lv.6 웅장한 나무', icon: '🌳', color: '#2ecc71', description: '깊은 뿌리와 넓은 가지를 가진 나무입니다.' };
    if (temp >= 400) return { title: 'Lv.5 풍성한 열매', icon: '🍎', color: '#e67e22', description: '학습의 결실이 맺히기 시작했습니다.' };
    if (temp >= 200) return { title: 'Lv.4 만개한 꽃', icon: '🌸', color: '#e84393', description: '지식이 화사하게 피어났습니다.' };
    if (temp >= 100) return { title: 'Lv.3 푸른 잎새', icon: '🍃', color: '#16a085', description: '성장의 기운이 가득한 잎새입니다.' };
    if (temp >= 50) return { title: 'Lv.2 파릇한 새싹', icon: '🌱', color: '#27ae60', description: '배움의 싹이 트기 시작했습니다.' };
    return { title: 'Lv.1 잠든 씨앗', icon: '🌱', color: '#b2bec3', description: '곧 깨어날 소중한 지식의 씨앗입니다.' };
}

function syncWithLegacy(chapterId: string, newProgress: UserProgressEntry, temperature?: number) {
    if (typeof window === 'undefined') return;

    // Sync with 'appData' if exists
    const legacyProgress = localStorage.getItem('appData');
    if (legacyProgress) {
        try {
            const parsed = JSON.parse(legacyProgress);
            if (!parsed.userData) parsed.userData = {};
            if (!parsed.userData.progress) parsed.userData.progress = {};

            parsed.userData.progress[chapterId] = {
                passed: newProgress.passed,
                score: newProgress.score,
                total: newProgress.total,
                date: newProgress.updatedAt
            };

            if (temperature !== undefined) {
                parsed.userData.temperature = temperature;
            }

            localStorage.setItem('appData', JSON.stringify(parsed));
        } catch (e) {
            console.error('Legacy sync failed:', e);
        }
    }
}
