// JSON File-based Database Manager
import { promises as fs } from 'fs';
import path from 'path';

// データディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data', 'db');

// コレクション名の型定義
// コレクション名の型定義
export type CollectionName = 'history' | 'songs' | 'discography' | 'tags' | 'members' | 'settings' | 'playHistory' | 'favorites' | 'goods' | 'gallery_metadata';

// メモリキャッシュ
const cache: Map<string, unknown[]> = new Map();
const cacheTimestamps: Map<string, number> = new Map();
const CACHE_TTL = 5000; // 5秒

// データディレクトリの確保
async function ensureDataDir(): Promise<void> {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// ファイルパスの取得
function getFilePath(collection: CollectionName): string {
    return path.join(DATA_DIR, `${collection}.json`);
}

// キャッシュの有効性チェック
function isCacheValid(collection: string): boolean {
    const timestamp = cacheTimestamps.get(collection);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
}

/**
 * コレクションの全データを読み込む
 */
export async function loadData<T>(collection: CollectionName): Promise<T[]> {
    // キャッシュチェック
    if (isCacheValid(collection) && cache.has(collection)) {
        return cache.get(collection) as T[];
    }

    await ensureDataDir();
    const filePath = getFilePath(collection);

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content) as T[];

        // キャッシュ更新
        cache.set(collection, data);
        cacheTimestamps.set(collection, Date.now());

        return data;
    } catch (error) {
        // ファイルが存在しない場合は空配列を返す
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * コレクションにデータを保存する
 */
export async function saveData<T>(collection: CollectionName, data: T[]): Promise<void> {
    await ensureDataDir();
    const filePath = getFilePath(collection);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // キャッシュ更新
    cache.set(collection, data);
    cacheTimestamps.set(collection, Date.now());
}

/**
 * IDでアイテムを取得
 */
export async function getById<T extends { id: string }>(
    collection: CollectionName,
    id: string
): Promise<T | null> {
    const data = await loadData<T>(collection);
    return data.find(item => item.id === id) || null;
}

/**
 * 新規アイテムを作成
 */
export async function create<T extends { id: string }>(
    collection: CollectionName,
    item: T
): Promise<T> {
    const data = await loadData<T>(collection);

    // 重複チェック
    if (data.some(existing => existing.id === item.id)) {
        throw new Error(`Item with id "${item.id}" already exists`);
    }

    data.push(item);
    await saveData(collection, data);

    return item;
}

/**
 * アイテムを更新
 */
export async function update<T extends { id: string }>(
    collection: CollectionName,
    id: string,
    updates: Partial<T>
): Promise<T> {
    const data = await loadData<T>(collection);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        throw new Error(`Item with id "${id}" not found`);
    }

    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() } as T;
    await saveData(collection, data);

    return data[index];
}

/**
 * アイテムを削除（物理削除）
 */
export async function remove(
    collection: CollectionName,
    id: string
): Promise<boolean> {
    const data = await loadData<{ id: string }>(collection);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return false;
    }

    data.splice(index, 1);
    await saveData(collection, data);

    return true;
}

/**
 * 論理削除（推奨）
 */
export async function softDelete<T extends { id: string; deletedAt?: string }>(
    collection: CollectionName,
    id: string
): Promise<T> {
    return update<T>(collection, id, { deletedAt: new Date().toISOString() } as Partial<T>);
}

/**
 * クエリでフィルタ
 */
export async function query<T>(
    collection: CollectionName,
    predicate: (item: T) => boolean
): Promise<T[]> {
    const data = await loadData<T>(collection);
    return data.filter(predicate);
}

/**
 * 一括更新
 */
export async function bulkUpdate<T extends { id: string }>(
    collection: CollectionName,
    updates: { id: string; data: Partial<T> }[]
): Promise<void> {
    const data = await loadData<T>(collection);

    for (const { id, data: updateData } of updates) {
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updateData, updatedAt: new Date().toISOString() } as T;
        }
    }

    await saveData(collection, data);
}

/**
 * キャッシュをクリア
 */
export function clearCache(collection?: CollectionName): void {
    if (collection) {
        cache.delete(collection);
        cacheTimestamps.delete(collection);
    } else {
        cache.clear();
        cacheTimestamps.clear();
    }
}

/**
 * データのバックアップを作成
 */
export async function createBackup(): Promise<string> {
    await ensureDataDir();

    const backupDir = path.join(DATA_DIR, 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });

    // 全コレクションをコピー
    const collections: CollectionName[] = [
        'history', 'songs', 'discography', 'tags', 'members', 'settings',
        'playHistory', 'favorites', 'goods', 'gallery_metadata'
    ];

    for (const collection of collections) {
        try {
            const data = await loadData(collection);
            await fs.writeFile(
                path.join(backupPath, `${collection}.json`),
                JSON.stringify(data, null, 2),
                'utf-8'
            );
        } catch {
            // ファイルがない場合はスキップ
        }
    }

    return backupPath;
}

/**
 * バックアップから復元
 */
export async function restoreFromBackup(backupPath: string): Promise<void> {
    const collections: CollectionName[] = [
        'history', 'songs', 'discography', 'tags', 'members', 'settings',
        'playHistory', 'favorites', 'goods', 'gallery_metadata'
    ];

    for (const collection of collections) {
        try {
            const content = await fs.readFile(
                path.join(backupPath, `${collection}.json`),
                'utf-8'
            );
            const data = JSON.parse(content);
            await saveData(collection, data);
        } catch {
            // ファイルがない場合はスキップ
        }
    }

    clearCache();
}
