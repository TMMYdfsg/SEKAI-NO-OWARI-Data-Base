// History Event Types - Extended Data Model

export type EventType = 'Live' | 'Release' | 'TV' | 'Radio' | 'Magazine' | 'Web' | 'Milestone' | 'Formation' | 'Other';

export interface DateInfo {
    year: number;
    month?: number;      // 1-12
    day?: number;        // 1-31
    sortOrder?: number;  // 同日内順序
    unknownPosition?: 'start' | 'end';  // 不明な場合の並び位置
}

export interface EmotionParams {
    heat: number;        // 熱量 0-100
    sadness: number;     // 切なさ 0-100
    festivity: number;   // 祝祭感 0-100
    experimental: number; // 実験性 0-100
}

export interface BGMSetting {
    enabled: boolean;
    autoPlay: boolean;
    tracks: {
        songId: string;
        order: number;
    }[];
    categories?: ('Original' | 'LIVE' | 'Rare')[];
    random?: boolean;
    fadeTime?: number;  // seconds
}

export interface LiveInfo {
    setlist: SetlistItem[];
    venue: {
        name: string;
        city?: string;
        country?: string;
    };
    tourName?: string;
    openTime?: string;
    startTime?: string;
    productionNotes?: string;
    rating?: number;      // 1-5
    ratingMemo?: string;
}

export interface SetlistItem {
    id: string;
    type: 'song' | 'mc' | 'se' | 'encore';
    songId?: string;      // type === 'song' の場合
    songTitle?: string;   // 仮登録用
    text?: string;        // MC等のテキスト
    duration?: number;    // 秒数
    order: number;
}

export interface ReleaseInfo {
    releaseType: 'Single' | 'Album' | 'EP' | 'Video' | 'Other';
    discographyId?: string;  // Discographyとの紐付け
    trackIds?: string[];      // 収録曲との紐付け
}

export interface TVInfo {
    programName: string;
    broadcaster?: string;
    episodeInfo?: string;
    appearanceNotes?: string;
}

export interface HistoryEvent {
    id: string;

    // 日付（柔軟入力対応）
    date: DateInfo;

    // 基本情報
    title: string;

    // 詳細テキスト（複数レイヤー）
    details: {
        official?: string;        // 公式
        behindTheScenes?: string; // 裏話・考察
        personalMemo?: string;    // 個人メモ
    };

    // イベント種別（複数選択可）
    eventTypes: EventType[];

    // 種別別情報
    liveInfo?: LiveInfo;
    releaseInfo?: ReleaseInfo;
    tvInfo?: TVInfo;
    otherInfo?: string;

    // BGM設定
    bgm?: BGMSetting;

    // 背景画像（ローカルパス）
    backgroundImage?: string;

    // ギャラリー画像（複数画像）
    imagePaths?: string[];

    // カスタムアイコン
    icon?: string;

    // タグ
    tags: string[];

    // 感情パラメータ
    emotionParams?: EmotionParams;

    // 公開設定
    visibility: 'public' | 'hidden' | 'private';

    // IFルート（非公式分岐）
    isIfRoute?: boolean;
    ifRouteParentId?: string;

    // メタデータ
    createdAt: string;
    updatedAt: string;
}

// 簡易版（旧形式との互換用）
export interface LegacyHistoryEvent {
    year: string;
    title: string;
    description: string;
    type: "Live" | "Release" | "Milestone" | "Formation";
}

// 変換ヘルパー
export function convertLegacyToNew(legacy: LegacyHistoryEvent, index: number): HistoryEvent {
    const eventTypeMap: Record<string, EventType> = {
        'Live': 'Live',
        'Release': 'Release',
        'Milestone': 'Milestone',
        'Formation': 'Formation'
    };

    return {
        id: `history-${legacy.year}-${index}`,
        date: {
            year: parseInt(legacy.year, 10),
        },
        title: legacy.title,
        details: {
            official: legacy.description
        },
        eventTypes: [eventTypeMap[legacy.type] || 'Other'],
        tags: [],
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
