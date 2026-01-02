
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

export const getProgress = (): UserProgress => {
    if (typeof window === 'undefined') return { chapters: {}, stats: DEFAULT_STATS };
    const saved = localStorage.getItem(PROGRESS_KEY);

    let data: unknown = null;
    if (saved) {
        const decoded = decode(saved);
        try {
            data = decoded ? JSON.parse(decoded) : JSON.parse(saved);
        } catch {
            data = null;
        }
    }

    // Migration logic if it's the old Record<string, UserProgressEntry> format
    const isOldFormat = (d: unknown): d is Record<string, UserProgressEntry> => {
        return !!d && typeof d === 'object' && !('chapters' in d) && !('stats' in d);
    };

    if (isOldFormat(data)) {
        return { chapters: data, stats: DEFAULT_STATS };
    }

    const castedData = data as UserProgress | null;

    let finalData = castedData;

    // Deep merge legacy appData if available
    const legacyAppData = localStorage.getItem('appData');
    if (legacyAppData && (!finalData || finalData.stats.temperature === 36.5)) {
        try {
            const parsedLegacy = JSON.parse(legacyAppData);
            if (parsedLegacy.userData) {
                const legacyTemp = parsedLegacy.userData.temperature || 36.5;
                if (!finalData) finalData = { chapters: {}, stats: { ...DEFAULT_STATS, temperature: legacyTemp } };
                else finalData.stats.temperature = legacyTemp;
            }
        } catch (e) {
            console.error("Legacy migration failed:", e);
        }
    }

    return finalData || { chapters: {}, stats: DEFAULT_STATS };
};

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
}) {
    if (typeof window === 'undefined') return;

    const progress = getProgress();
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
        total: data.total,
        lastStudy: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // If wrong answers provided, schedule them for review
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
            else mergedBatch[idx] = item; // Reset to level 0 if wrong again
        });
        newProgress.reviewBatch = mergedBatch;
    }

    // Update global stats
    progress.chapters[chapterId] = newProgress;
    if (data.tempChange) {
        progress.stats.temperature = Math.round((progress.stats.temperature + data.tempChange) * 10) / 10;
    }
    progress.stats.totalAttempts += 1;
    progress.stats.lastLogin = new Date().toISOString();

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
    if (temp >= 5000) return { title: 'Lv.20 옴니버스 (다중우주)', icon: '♾️', color: '#000000' };
    if (temp >= 4500) return { title: 'Lv.19 유니버스 (우주)', icon: '🌌', color: '#2c3e50' };
    if (temp >= 4000) return { title: 'Lv.18 초거대 퀘이사', icon: '✨', color: '#8e44ad' };
    if (temp >= 3600) return { title: 'Lv.17 은하단 (Galaxy Cluster)', icon: '🎆', color: '#9b59b6' };
    if (temp >= 3200) return { title: 'Lv.16 우리 은하 (Milky Way)', icon: '🌀', color: '#3498db' };
    if (temp >= 2800) return { title: 'Lv.15 초신성 (Supernova)', icon: '💥', color: '#e74c3c' };
    if (temp >= 2400) return { title: 'Lv.14 블랙홀', icon: '🕳️', color: '#2d3436' };
    if (temp >= 2100) return { title: 'Lv.13 적색 거성', icon: '🔴', color: '#c0392b' };
    if (temp >= 1800) return { title: 'Lv.12 태양 (The Sun)', icon: '☀️', color: '#f39c12' };
    if (temp >= 1500) return { title: 'Lv.11 목성 (가스 행성)', icon: '🪐', color: '#d35400' };
    if (temp >= 1200) return { title: 'Lv.10 푸른 지구', icon: '🌍', color: '#2ecc71' };
    if (temp >= 1050) return { title: 'Lv.9 샛별 (금성)', icon: '🌕', color: '#f1c40f' };
    if (temp >= 900) return { title: 'Lv.8 붉은 행성 (화성)', icon: '🪐', color: '#e67e22' };
    if (temp >= 750) return { title: 'Lv.7 달 (Satellite)', icon: '🌙', color: '#95a5a6' };
    if (temp >= 600) return { title: 'Lv.6 혜성 (Comet)', icon: '☄️', color: '#7f8c8d' };
    if (temp >= 450) return { title: 'Lv.5 운석 (Meteor)', icon: '🪨', color: '#636e72' };
    if (temp >= 300) return { title: 'Lv.4 별똥별', icon: '🌠', color: '#b2bec3' };
    if (temp >= 150) return { title: 'Lv.3 우주 먼지', icon: '🌫️', color: '#dfe6e9' };
    if (temp >= 50) return { title: 'Lv.2 원자 (Atom)', icon: '⚛️', color: '#74b9ff' };
    return { title: 'Lv.1 무 (Nothing)', icon: '⚫', color: '#b2bec3' };
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
