// Song Types - Extended Data Model

export type SongCategory = 'Original' | 'LIVE REMIX' | 'Rare' | 'Demo' | 'Cover' | 'Other';

export interface Song {
    id: string;

    // 基本情報
    title: string;
    album?: string;
    year?: number;

    // クレジット
    composer?: string;
    writer?: string;
    arranger?: string;

    // カテゴリ・分類
    category: SongCategory;
    liveYear?: number;  // LIVE REMIXの場合の年

    // ファイルパス
    filePath?: string;

    // タグ
    tags: string[];
    memoryTags?: string[];  // 記憶タグ（#初聴 #現地 等）

    // 再生統計
    playCount: number;
    lastPlayedAt?: string;

    // お気に入り
    isFavorite: boolean;
    favoriteReason?: string;
    favoritedAt?: string;
    isHallOfFame?: boolean;  // 殿堂入り

    // 関連情報
    relatedDiscographyIds?: string[];
    relatedLiveIds?: string[];  // この曲が演奏されたライブ

    // 制作情報
    productionNotes?: string;
    demoVersionOf?: string;  // デモ版の場合、元曲ID
    isUnreleased?: boolean;
    completionRate?: number;  // 未発表曲の完成度 0-100
    status?: 'concept' | 'inProgress' | 'frozen' | 'completed';

    // サムネイル
    thumbnail?: string;

    // メタデータ
    createdAt: string;
    updatedAt: string;
}

// 互換用の簡易型
export interface LegacySong {
    id: string;
    title: string;
    album: string;
    year: number;
    composer: string;
    writer: string;
    category: SongCategory;
}

// 変換ヘルパー
export function convertLegacySong(legacy: LegacySong): Song {
    return {
        id: legacy.id,
        title: legacy.title,
        album: legacy.album,
        year: legacy.year,
        composer: legacy.composer,
        writer: legacy.writer,
        category: legacy.category,
        tags: [],
        playCount: 0,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
