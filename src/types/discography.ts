// Discography Types - Extended Data Model

export type AlbumType = 'Album' | 'Single' | 'EP' | 'Compilation' | 'Video' | 'Other';

export interface TrackInfo {
    id: string;
    trackNumber: number;
    songId?: string;       // Songsへの紐付け
    title: string;         // 曲名（songIdがない場合の表示用）
    duration?: number;     // 秒数
    versionNote?: string;  // バージョン違いのメモ
    isBonus?: boolean;     // ボーナストラック
}

export interface DiscItem {
    discNumber: number;
    discTitle?: string;  // Disc 1: "Day" など
    tracks: TrackInfo[];
}

export interface Discography {
    id: string;

    // 基本情報
    title: string;
    releaseDate?: string;  // YYYY-MM-DD
    type: AlbumType;

    // トラック情報
    discs: DiscItem[];     // マルチディスク対応

    // ジャケット画像
    coverImage?: string;

    // 詳細情報
    description?: string;
    productionNotes?: string;  // 制作裏話

    // タグ
    tags: string[];

    // 評価
    rating?: number;       // 1-5
    ratingMemo?: string;

    // お気に入り
    isFavorite: boolean;
    favoriteReason?: string;

    // 関連ヒストリー
    relatedHistoryIds?: string[];

    // 抜け項目警告用
    isComplete: boolean;  // 必須項目が埋まっているか
    missingFields?: string[];

    // メタデータ
    createdAt: string;
    updatedAt: string;
}

// 互換用の簡易型
export interface LegacyAlbum {
    id: string;
    title: string;
    releaseDate: string;
    type: "Album" | "Single" | "EP" | "Compilation" | "Video";
    coverImage: string;
    tracks: string[];
}

// 変換ヘルパー
export function convertLegacyAlbum(legacy: LegacyAlbum): Discography {
    const tracks: TrackInfo[] = legacy.tracks.map((title, index) => ({
        id: `${legacy.id}-track-${index + 1}`,
        trackNumber: index + 1,
        title
    }));

    return {
        id: legacy.id,
        title: legacy.title,
        releaseDate: legacy.releaseDate,
        type: legacy.type,
        discs: [{
            discNumber: 1,
            tracks
        }],
        coverImage: legacy.coverImage,
        tags: [],
        isFavorite: false,
        isComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
