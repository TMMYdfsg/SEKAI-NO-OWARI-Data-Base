/**
 * 外部リンク定義（FR-1601〜FR-1605）
 * Spotify, YouTube, Apple Music など複数サービスに対応
 */

// サポートするサービス
export type ExternalLinkService =
    | "spotify"
    | "youtube"
    | "apple_music"
    | "line_music"
    | "amazon_music"
    | "other";

// リンクタイプ
export type LinkTargetType =
    | "track"
    | "album"
    | "artist"
    | "playlist"
    | "video"
    | "channel"
    | "other";

// 外部リンク情報
export interface ExternalLink {
    id: string;
    service: ExternalLinkService;
    targetType: LinkTargetType;
    url: string;                    // フルURL (https://...)
    serviceId?: string;             // サービス固有ID (spotify:track:xxx の xxx部分)
    verified: boolean;              // リンク有効性確認済みか
    createdAt: string;
    updatedAt: string;
}

// 外部リンク付きエンティティ（ミックスイン用）
export interface WithExternalLinks {
    externalLinks?: ExternalLink[];
}

// サービス設定
export interface ServiceConfig {
    name: string;
    icon: string;
    color: string;
    urlPattern: RegExp;
    idExtractor: (url: string) => string | null;
    searchUrlTemplate: (query: string) => string;
}

// サービス設定マップ
export const serviceConfigs: Record<ExternalLinkService, ServiceConfig> = {
    spotify: {
        name: "Spotify",
        icon: "spotify",
        color: "#1DB954",
        urlPattern: /^https?:\/\/open\.spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/,
        idExtractor: (url: string) => {
            const match = url.match(/\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/);
            return match ? match[2] : null;
        },
        searchUrlTemplate: (query: string) =>
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
    },
    youtube: {
        name: "YouTube",
        icon: "youtube",
        color: "#FF0000",
        urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|)([a-zA-Z0-9_-]+)/,
        idExtractor: (url: string) => {
            const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        },
        searchUrlTemplate: (query: string) =>
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    },
    apple_music: {
        name: "Apple Music",
        icon: "apple",
        color: "#FA243C",
        urlPattern: /^https?:\/\/music\.apple\.com\/[a-z]{2}\/(album|artist|playlist)\/[^\/]+\/(\d+)/,
        idExtractor: (url: string) => {
            const match = url.match(/\/(\d+)(?:\?|$)/);
            return match ? match[1] : null;
        },
        searchUrlTemplate: (query: string) =>
            `https://music.apple.com/search?term=${encodeURIComponent(query)}`,
    },
    line_music: {
        name: "LINE MUSIC",
        icon: "music",
        color: "#00C300",
        urlPattern: /^https?:\/\/music\.line\.me\/(track|album|artist)\/([a-z0-9]+)/,
        idExtractor: (url: string) => {
            const match = url.match(/\/(track|album|artist)\/([a-z0-9]+)/);
            return match ? match[2] : null;
        },
        searchUrlTemplate: (query: string) =>
            `https://music.line.me/search?query=${encodeURIComponent(query)}`,
    },
    amazon_music: {
        name: "Amazon Music",
        icon: "amazon",
        color: "#FF9900",
        urlPattern: /^https?:\/\/music\.amazon\.co\.jp\/(albums|tracks|artists)\/([A-Z0-9]+)/,
        idExtractor: (url: string) => {
            const match = url.match(/\/(albums|tracks|artists)\/([A-Z0-9]+)/);
            return match ? match[2] : null;
        },
        searchUrlTemplate: (query: string) =>
            `https://music.amazon.co.jp/search/${encodeURIComponent(query)}`,
    },
    other: {
        name: "その他",
        icon: "link",
        color: "#666666",
        urlPattern: /^https?:\/\/.+/,
        idExtractor: () => null,
        searchUrlTemplate: (query: string) =>
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    },
};

/**
 * URLからサービスと種別を自動判定（FR-1604）
 */
export function detectLinkService(url: string): {
    service: ExternalLinkService;
    targetType: LinkTargetType;
    serviceId: string | null;
} | null {
    for (const [serviceName, config] of Object.entries(serviceConfigs)) {
        const match = url.match(config.urlPattern);
        if (match) {
            // 種別を判定
            let targetType: LinkTargetType = "other";
            if (url.includes("/track")) targetType = "track";
            else if (url.includes("/album")) targetType = "album";
            else if (url.includes("/artist")) targetType = "artist";
            else if (url.includes("/playlist")) targetType = "playlist";
            else if (url.includes("/watch") || url.includes("youtu.be")) targetType = "video";
            else if (url.includes("/channel") || url.includes("/@")) targetType = "channel";

            return {
                service: serviceName as ExternalLinkService,
                targetType,
                serviceId: config.idExtractor(url),
            };
        }
    }
    return null;
}

/**
 * 検索クエリを生成（FR-1603）
 */
export function buildSearchQuery(params: {
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
}): string {
    const parts = [];
    if (params.title) parts.push(params.title);
    if (params.artist) parts.push(params.artist);
    if (params.album) parts.push(params.album);
    if (params.year) parts.push(String(params.year));
    return parts.join(" ");
}

/**
 * URLバリデーション
 */
export function validateExternalUrl(url: string, expectedType?: LinkTargetType): {
    valid: boolean;
    warning?: string;
    detected?: ReturnType<typeof detectLinkService>;
} {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return { valid: false, warning: "URLはhttp://またはhttps://で始まる必要があります" };
    }

    const detected = detectLinkService(url);
    if (!detected) {
        return { valid: true, warning: "認識されないサービスです（保存は可能）" };
    }

    if (expectedType && detected.targetType !== expectedType && detected.targetType !== "other") {
        return {
            valid: true,
            warning: `このURLは${detected.targetType}のリンクです（${expectedType}とは異なります）`,
            detected,
        };
    }

    return { valid: true, detected };
}
