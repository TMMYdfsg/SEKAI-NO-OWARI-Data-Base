// Quiz Data Types and Intro Quiz Configuration
import { albums, Album } from '@/data/discography';

// ==========================
// Base Quiz Types
// ==========================

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category?: 'history' | 'member' | 'song' | 'trivia';
}

// ==========================
// Intro Quiz Types
// ==========================

export type IntroDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface IntroQuizConfig {
    difficulty: IntroDifficulty;
    playDurationSeconds: number;  // 音起点からの再生時間
    aiResponseTimeSeconds: number; // AI応答時間（対戦モード用）
    label: string;
    labelJa: string;
}

export const INTRO_DIFFICULTY_CONFIG: Record<IntroDifficulty, IntroQuizConfig> = {
    easy: {
        difficulty: 'easy',
        playDurationSeconds: 10,
        aiResponseTimeSeconds: 10,
        label: 'Easy',
        labelJa: '初級',
    },
    normal: {
        difficulty: 'normal',
        playDurationSeconds: 7,
        aiResponseTimeSeconds: 5,
        label: 'Normal',
        labelJa: '中級',
    },
    hard: {
        difficulty: 'hard',
        playDurationSeconds: 5,
        aiResponseTimeSeconds: 5,
        label: 'Hard',
        labelJa: '上級',
    },
    extreme: {
        difficulty: 'extreme',
        playDurationSeconds: 1,
        aiResponseTimeSeconds: 3,
        label: 'Extreme',
        labelJa: '超上級',
    },
};

// 曲のイントロ起点時間（音が鳴り始めるタイミング）
// 無音部分をスキップするための設定
export interface IntroSongData {
    songName: string;
    filePath?: string;           // ローカルファイルパス
    introStartTime: number;      // イントロ起点（秒）
    difficulty: 1 | 2 | 3 | 4;   // 1=簡単, 4=難しい
    albumHint?: string;          // ヒント用アルバム名
}

// デフォルトのイントロ起点（音源が無音から始まらない場合）
export const DEFAULT_INTRO_START = 0;

// ==========================
// Quiz Mode Types
// ==========================

export type QuizMode = 'trivia' | 'intro' | 'marathon' | 'endless' | 'battle';

export interface QuizModeConfig {
    id: QuizMode;
    name: string;
    nameJa: string;
    description: string;
    icon: string; // Lucide icon name
    color: string;
    available: boolean;
}

export const QUIZ_MODES: QuizModeConfig[] = [
    {
        id: 'trivia',
        name: 'Trivia Quiz',
        nameJa: '知識クイズ',
        description: 'セカオワの歴史や豆知識を10問出題',
        icon: 'Brain',
        color: 'from-purple-500 to-pink-500',
        available: true,
    },
    {
        id: 'intro',
        name: 'Intro Quiz',
        nameJa: 'イントロクイズ',
        description: '曲のイントロを聴いて曲名を当てよう',
        icon: 'Music',
        color: 'from-green-500 to-teal-500',
        available: true,
    },
    {
        id: 'marathon',
        name: 'Marathon',
        nameJa: 'マラソン',
        description: '10/30/50曲を連続で挑戦',
        icon: 'Timer',
        color: 'from-orange-500 to-red-500',
        available: true,
    },
    {
        id: 'endless',
        name: 'Endless',
        nameJa: 'エンドレス',
        description: 'ミスするまで永遠に続く',
        icon: 'Infinity',
        color: 'from-blue-500 to-indigo-500',
        available: true,
    },
    {
        id: 'battle',
        name: 'Rival Battle',
        nameJa: 'ライバル対戦',
        description: '仮想ライバルとイントロ対決',
        icon: 'Swords',
        color: 'from-red-600 to-orange-600',
        available: true,
    },
];

// ==========================
// Rival Battle Types
// ==========================

export interface RivalConfig {
    id: string;
    name: string;
    difficulty: IntroDifficulty;
    avatar: string;  // Emoji or image path
    winBadge: string;
    description: string;
}

export const RIVALS: RivalConfig[] = [
    {
        id: 'dj_love',
        name: 'DJ LOVE級',
        difficulty: 'easy',
        avatar: '🎭',
        winBadge: 'RIVAL_DJ_LOVE',
        description: '初心者向けの優しいライバル',
    },
    {
        id: 'saori',
        name: 'Saori級',
        difficulty: 'normal',
        avatar: '🎹',
        winBadge: 'RIVAL_SAORI',
        description: 'バランスの取れた中級ライバル',
    },
    {
        id: 'nakajin',
        name: 'Nakajin級',
        difficulty: 'normal',
        avatar: '🎸',
        winBadge: 'RIVAL_NAKAJIN',
        description: 'マルチな知識を持つライバル',
    },
    {
        id: 'fukase',
        name: 'Fukase級',
        difficulty: 'hard',
        avatar: '🎤',
        winBadge: 'RIVAL_FUKASE',
        description: '素早い反応の上級ライバル',
    },
    {
        id: 'ender',
        name: 'ENDer級',
        difficulty: 'extreme',
        avatar: '👑',
        winBadge: 'RIVAL_ENDER',
        description: '究極のファン。最強のライバル',
    },
];

// ==========================
// Score & Ranking
// ==========================

export const getIntroQuizRank = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return { title: 'イントロの神', message: '完璧！あなたの耳は本物です。', tier: 'S' };
    if (percentage >= 90) return { title: '耳が記憶している', message: '驚異的な認識力！', tier: 'A' };
    if (percentage >= 70) return { title: '音の残像', message: '素晴らしい！もう少しで完璧。', tier: 'B' };
    if (percentage >= 50) return { title: 'リスナー見習い', message: 'もっと聴き込もう！', tier: 'C' };
    return { title: '初心者', message: 'これからたくさん聴いていこう！', tier: 'D' };
};

// ==========================
// Achievement IDs for Quiz
// ==========================

export const QUIZ_ACHIEVEMENTS = {
    INTRO_MASTER: 'intro_master',           // イントロクイズ満点
    MARATHON_10: 'marathon_10',              // マラソン10曲クリア
    MARATHON_30: 'marathon_30',              // マラソン30曲クリア
    MARATHON_50: 'marathon_50',              // マラソン50曲クリア
    ENDLESS_20: 'endless_20',                // エンドレス20問連続正解
    ENDLESS_50: 'endless_50',                // エンドレス50問連続正解
    RIVAL_FIRST_WIN: 'rival_first_win',      // 初めてのライバル撃破
    RIVAL_ALL_CLEAR: 'rival_all_clear',      // 全ライバル撃破
    EXTREME_CLEAR: 'extreme_clear',          // 超上級クリア
} as const;
