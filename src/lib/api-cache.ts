
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Fetches data with localStorage caching
 * @param key Unique cache key
 * @param fetcher Async function to fetch data if cache misses
 * @param ttl Time to live in milliseconds (default: 1 hour)
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> {
    if (typeof window === 'undefined') return fetcher();

    const cacheKey = `sekaowa_cache_${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const entry: CacheEntry<T> = JSON.parse(cached);
            const age = Date.now() - entry.timestamp;

            if (age < ttl) {
                // console.log(`[Cache Hit] ${key}`);
                return entry.data;
            } else {
                // console.log(`[Cache Expired] ${key}`);
            }
        } catch (e) {
            console.warn('Cache parse error, refetching:', e);
        }
    }

    // Fetch fresh data
    const data = await fetcher();

    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
        console.warn('Failed to write to cache (likely quota exceeded):', e);
    }

    return data;
}

/**
 * Clear specific cache or all app caches
 * @param keyPrefix Optional prefix to clear specific group of keys
 */
export function clearApiCache(keyPrefix?: string) {
    if (typeof window === 'undefined') return;

    const prefix = `sekaowa_cache_${keyPrefix || ''}`;

    // Iterate backwards to avoid index issues when removing
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    }
}
