// Tag System Types

export interface Tag {
    id: string;
    name: string;           // タグ名（#なしで保存）
    description?: string;   // タグの説明

    // 階層構造（任意）
    parentId?: string;

    // 使用統計
    usageCount: number;

    // 分類（どのエンティティで使われるか）
    applicableTo: ('history' | 'song' | 'discography' | 'image' | 'goods' | 'member')[];

    // 自動タグかどうか
    isAutoTag: boolean;

    // メタデータ
    createdAt: string;
    updatedAt: string;
}

// タグの正規化
export function normalizeTagName(input: string): string {
    // #を除去し、前後の空白を削除、小文字化
    return input.replace(/^#/, '').trim().toLowerCase();
}

// 表示用のタグ名
export function displayTagName(name: string): string {
    return `#${name}`;
}

// 自動タグ提案のマッピング
export const AUTO_TAG_SUGGESTIONS: Record<string, string[]> = {
    'Live': ['live', 'concert'],
    'Release': ['release', 'single', 'album'],
    'TV': ['tv', 'television'],
    'Radio': ['radio'],
    'Magazine': ['magazine', 'interview'],
    'Web': ['web', 'online'],
    'Milestone': ['milestone', 'achievement'],
    'Formation': ['formation', 'history']
};

// 記憶タグの定義（曲専用）
export const MEMORY_TAG_PRESETS = [
    { name: 'first-listen', displayName: '初聴', emoji: '👂' },
    { name: 'live', displayName: '現地', emoji: '🎤' },
    { name: 'tears', displayName: '泣いた', emoji: '😢' },
    { name: 'god-arrange', displayName: '神アレンジ', emoji: '✨' },
    { name: 'nostalgia', displayName: '懐かしい', emoji: '🥹' },
    { name: 'motivation', displayName: '元気出る', emoji: '💪' },
];
