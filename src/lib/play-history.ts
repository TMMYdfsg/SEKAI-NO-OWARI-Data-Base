// Play History Management
// ローカルストレージに再生履歴を保存

const STORAGE_KEY = "sekaowa_play_history";
const MAX_HISTORY_ITEMS = 500;

export interface PlayHistoryEntry {
    id: string;
    songId: string;
    songName: string;
    category: string;
    playedAt: string;
    source?: {
        type: 'history' | 'songs' | 'discography' | 'playlist';
        sourceId?: string;
        sourceName?: string;
    };
    duration?: number;      // 再生時間（秒）
    completed?: boolean;    // 最後まで再生したか
}

// 再生履歴の取得
export function getPlayHistory(): PlayHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse play history:", e);
            return [];
        }
    }
    return [];
}

// 再生履歴に追加
export function addToPlayHistory(entry: Omit<PlayHistoryEntry, 'id' | 'playedAt'>): PlayHistoryEntry {
    const newEntry: PlayHistoryEntry = {
        ...entry,
        id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        playedAt: new Date().toISOString(),
    };

    const history = getPlayHistory();
    history.unshift(newEntry);

    // 最大件数を超えたら古いものを削除
    if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
    }

    savePlayHistory(history);
    return newEntry;
}

// 再生履歴を保存
export function savePlayHistory(history: PlayHistoryEntry[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 再生履歴をクリア
export function clearPlayHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

// 特定の曲の再生回数を取得
export function getPlayCount(songId: string): number {
    const history = getPlayHistory();
    return history.filter(entry => entry.songId === songId).length;
}

// 最近再生した曲を取得（ユニーク）
export function getRecentlyPlayed(limit: number = 10): PlayHistoryEntry[] {
    const history = getPlayHistory();
    const seen = new Set<string>();
    const unique: PlayHistoryEntry[] = [];

    for (const entry of history) {
        if (!seen.has(entry.songId)) {
            seen.add(entry.songId);
            unique.push(entry);
            if (unique.length >= limit) break;
        }
    }

    return unique;
}

// よく再生する曲を取得
export function getMostPlayed(limit: number = 10): { songId: string; songName: string; count: number }[] {
    const history = getPlayHistory();
    const countMap = new Map<string, { songName: string; count: number }>();

    for (const entry of history) {
        const existing = countMap.get(entry.songId);
        if (existing) {
            existing.count++;
        } else {
            countMap.set(entry.songId, { songName: entry.songName, count: 1 });
        }
    }

    return Array.from(countMap.entries())
        .map(([songId, data]) => ({ songId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

// 日付範囲で再生履歴を取得
export function getPlayHistoryByDateRange(startDate: Date, endDate: Date): PlayHistoryEntry[] {
    const history = getPlayHistory();
    return history.filter(entry => {
        const playedAt = new Date(entry.playedAt);
        return playedAt >= startDate && playedAt <= endDate;
    });
}

// 今日の再生履歴を取得
export function getTodayPlayHistory(): PlayHistoryEntry[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getPlayHistoryByDateRange(today, tomorrow);
}
