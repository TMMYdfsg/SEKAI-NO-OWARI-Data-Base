export type TypingGameSong = {
    id: string;
    title: string;
    artist: string;
    lyrics: {
        time: number; // Display time (seconds)
        text: string; // Japanese text
        romaji: string[]; // Acceptable romaji patterns
    }[];
};

export const TYPING_GAME_SONGS: TypingGameSong[] = [
    {
        id: "habit",
        title: "Habit",
        artist: "SEKAI NO OWARI",
        lyrics: [
            { time: 0, text: "君たちったら何でもかんでも", romaji: ["kimitacittararandemokandemo", "kimitachittaranandemokandemo"] },
            { time: 5, text: "分類 区別 ジャンル分けしたがる", romaji: ["bunrui kubetsu janruwakeshitagaru"] },
            // Add more lyrics...
        ]
    }
    // Add more songs...
];
