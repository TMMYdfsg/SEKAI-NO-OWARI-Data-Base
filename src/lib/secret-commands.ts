// Secret Commands System
// Lyrics-based commands that trigger special actions

import { albums } from "@/data/discography";

export interface SecretCommand {
    command: string;           // The trigger phrase (lyrics or keyword)
    songTitle: string;         // Song to play
    albumId?: string;          // Album to highlight
    action: "play_song" | "show_discovery" | "show_gallery" | "special";
    description: string;       // Description of what happens
}

// Lyrics-based commands - partial matches are supported
export const lyricsCommands: SecretCommand[] = [
    {
        command: "太陽が沈んで夜が訪れる日",
        songTitle: "Dragon Night",
        albumId: "a-3-tree",
        action: "show_discovery",
        description: "Dragon Night - 夜の魔法が始まる",
    },
    {
        command: "説教するってぶっちゃけ快楽",
        songTitle: "Habit",
        albumId: "a-7-nautilus",
        action: "show_discovery",
        description: "Habit - 癖になる中毒性",
    },
    {
        command: "空は青く澄み渡り",
        songTitle: "RPG",
        albumId: "a-3-tree",
        action: "show_discovery",
        description: "RPG - 冒険の始まり",
    },
    {
        command: "深い深い森の中で",
        songTitle: "深い森",
        albumId: "a-2-entertainment",
        action: "show_discovery",
        description: "深い森 - 森の奥へ",
    },
    {
        command: "夢を見ていた",
        songTitle: "幻の命",
        albumId: "a-1-earth",
        action: "show_discovery",
        description: "幻の命 - すべての始まり",
    },
    {
        command: "眠り姫は静かに眠る",
        songTitle: "眠り姫",
        albumId: "s-3-nemurihime",
        action: "show_discovery",
        description: "眠り姫 - 静寂の美",
    },
    {
        command: "スターライトパレードが始まる",
        songTitle: "スターライトパレード",
        albumId: "a-2-entertainment",
        action: "show_discovery",
        description: "スターライトパレード - 星降る夜のパレード",
    },
    {
        command: "炎と森のカーニバル",
        songTitle: "炎と森のカーニバル",
        albumId: "s-6-honoo-to-mori",
        action: "show_discovery",
        description: "炎と森のカーニバル - 幻想の祭典",
    },
    {
        command: "雨が降っている",
        songTitle: "RAIN",
        albumId: "s-11-rain",
        action: "show_discovery",
        description: "RAIN - 雨に濡れる世界",
    },
    {
        command: "サザンカの花が咲く頃に",
        songTitle: "サザンカ",
        albumId: "s-12-sazanka",
        action: "show_discovery",
        description: "サザンカ - 冬を彩る花",
    },
];

// Keyword commands
export const keywordCommands: SecretCommand[] = [
    {
        command: "SECRET",
        songTitle: "",
        action: "show_gallery",
        description: "シークレットハウスへようこそ",
    },
    {
        command: "レア音源",
        songTitle: "",
        action: "special",
        description: "レア音源コレクション",
    },
    {
        command: "SHUFFLE",
        songTitle: "",
        action: "special",
        description: "シャッフル再生開始",
    },
    {
        command: "QUIZ",
        songTitle: "",
        action: "special",
        description: "セカオワクイズ",
    },
    {
        command: "DJ LOVE",
        songTitle: "",
        action: "special",
        description: "Clown of Hope",
    },
    {
        command: "QUIZ MASTER",
        songTitle: "",
        action: "special",
        description: "Show my badges",
    },
];

// Song performance data - which songs were performed at which tours
export const songPerformances: Record<string, string[]> = {
    "Dragon Night": [
        "ARENA TOUR 2014 '炎と森のカーニバル'",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "The Dinner",
        "INSOMNIA TRAIN",
        "The Colors",
        "Du Gara Di Du",
        "深海",
    ],
    "Habit": [
        "DOME TOUR 2022 'Du Gara Di Du'",
        "ARENA TOUR 2024 '深海'",
    ],
    "RPG": [
        "ARENA TOUR 2013 '炎と森のカーニバル'",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "The Dinner",
        "INSOMNIA TRAIN",
        "The Colors",
        "Du Gara Di Du",
        "深海",
    ],
    "深い森": [
        "ARENA TOUR 2012",
        "炎と森のカーニバル 2013",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "The Dinner",
    ],
    "幻の命": [
        "TOUR 2010 'EARTH'",
        "武道館 2011",
        "ARENA TOUR 2012",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "Du Gara Di Du",
    ],
    "眠り姫": [
        "武道館 2011",
        "ARENA TOUR 2012",
        "炎と森のカーニバル 2013",
        "Twilight City at NISSAN STADIUM",
    ],
    "スターライトパレード": [
        "武道館 2011",
        "ARENA TOUR 2012",
        "炎と森のカーニバル 2013",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "The Dinner",
        "INSOMNIA TRAIN",
        "The Colors",
        "Du Gara Di Du",
        "深海",
    ],
    "炎と森のカーニバル": [
        "炎と森のカーニバル 2013",
        "Twilight City at NISSAN STADIUM",
        "DOME TOUR 2017 'Tarkus'",
        "The Dinner",
        "INSOMNIA TRAIN",
        "The Colors",
    ],
    "RAIN": [
        "DOME TOUR 2017 'Tarkus'",
        "INSOMNIA TRAIN",
        "The Colors",
        "Du Gara Di Du",
    ],
    "サザンカ": [
        "INSOMNIA TRAIN",
        "The Colors",
        "Du Gara Di Du",
        "深海",
    ],
};

// Find matching command
export function findCommand(input: string): SecretCommand | null {
    const normalizedInput = input.toLowerCase().trim();

    // Check lyrics commands (partial match)
    for (const cmd of lyricsCommands) {
        if (normalizedInput.includes(cmd.command.toLowerCase()) ||
            cmd.command.toLowerCase().includes(normalizedInput)) {
            return cmd;
        }
    }

    // Check keyword commands (exact match)
    for (const cmd of keywordCommands) {
        if (normalizedInput === cmd.command.toLowerCase()) {
            return cmd;
        }
    }

    return null;
}

// Get performances for a song
export function getSongPerformances(songTitle: string): string[] {
    return songPerformances[songTitle] || [];
}

// Find album by song title
export function findAlbumBySong(songTitle: string): typeof albums[0] | null {
    return albums.find(album =>
        album.tracks.some(track =>
            track.toLowerCase().includes(songTitle.toLowerCase()) ||
            songTitle.toLowerCase().includes(track.toLowerCase())
        )
    ) || null;
}

// Get random song for shuffle
export function getRandomSong(songList: string[]): string | null {
    if (songList.length === 0) return null;
    return songList[Math.floor(Math.random() * songList.length)];
}
