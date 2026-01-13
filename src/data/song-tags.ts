export interface SongTags {
    energy: number; // 0-100: 激しさ、テンション
    happiness: number; // 0-100: 明るさ、ポジティブ度
    acousticness: number; // 0-100: アコースティック度（高いほど生楽器/静か、低いほど電子音/激しい）
    keywords: string[]; // シチュエーション、季節、天気など
}

export const songTags: Record<string, SongTags> = {
    // EARTH
    "maboroshi-no-inochi": { energy: 30, happiness: 20, acousticness: 80, keywords: ["night", "sad", "emotional", "winter", "death"] },
    "instant-radio": { energy: 90, happiness: 90, acousticness: 10, keywords: ["pop", "party", "drive", "debut", "morning"] },
    "nijiiro-no-senso": { energy: 80, happiness: 70, acousticness: 40, keywords: ["conflict", "pop", "message", "biological"] },
    "shi-no-maho": { energy: 20, happiness: 10, acousticness: 60, keywords: ["dark", "question", "life"] },

    // ENTERTAINMENT
    "starlight-parade": { energy: 70, happiness: 60, acousticness: 20, keywords: ["night", "fantasy", "stars", "drive", "radio"] },
    "nemurihime": { energy: 50, happiness: 60, acousticness: 40, keywords: ["fantasy", "love", "night", "sleep"] },
    "rpg": { energy: 95, happiness: 100, acousticness: 10, keywords: ["adventure", "friends", "pop", "summer", "ocean"] },
    "fight-music": { energy: 90, happiness: 80, acousticness: 20, keywords: ["cheer", "work", "study", "muscle"] },
    "fukai-mori": { energy: 20, happiness: 10, acousticness: 30, keywords: ["english", "dark", "fantasy", "forest"] },
    "love-the-warz": { energy: 85, happiness: 30, acousticness: 10, keywords: ["rap", "edm", "dark", "message"] },

    // Tree
    "honoo-to-mori-no-carnival": { energy: 85, happiness: 90, acousticness: 20, keywords: ["fantasy", "night", "festival", "party", "yokohama"] },
    "dragon-night": { energy: 90, happiness: 85, acousticness: 10, keywords: ["edm", "party", "winter", "dance", "friends"] },
    "snow-magic-fantasy": { energy: 60, happiness: 70, acousticness: 30, keywords: ["winter", "snow", "love", "fantasy"] },
    "moonlight-station": { energy: 70, happiness: 60, acousticness: 20, keywords: ["night", "train", "fantasy", "japanese", "summer"] },
    "mermaid-rhapsody": { energy: 50, happiness: 40, acousticness: 50, keywords: ["sea", "bubbles", "fantasy"] },

    // Eye / Lip
    "anti-hero": { energy: 60, happiness: 20, acousticness: 20, keywords: ["dark", "cool", "english", "movies", "villain"] },
    "sos": { energy: 10, happiness: 10, acousticness: 90, keywords: ["quiet", "beautiful", "english", "calm"] },
    "sazanka": { energy: 40, happiness: 40, acousticness: 70, keywords: ["cheer", "winter", "ballad", "emotional", "sports"] },
    "rain": { energy: 50, happiness: 50, acousticness: 60, keywords: ["rain", "piano", "emotional", "movie", "summer"] },
    "hey-ho": { energy: 60, happiness: 70, acousticness: 80, keywords: ["charity", "folk", "animals", "forest"] },

    // Chameleon
    "habit": { energy: 80, happiness: 60, acousticness: 30, keywords: ["dance", "cool", "cynical", "viral"] },
    "tears": { energy: 40, happiness: 30, acousticness: 50, keywords: ["sad", "emotional", "diary"] },

    // Nautilus / Scents of Memory
    "umbrella": { energy: 50, happiness: 40, acousticness: 40, keywords: ["rain", "drama"] },
    "silent": { energy: 50, happiness: 60, acousticness: 50, keywords: ["christmas", "winter", "snow", "love"] },
    "birdman": { energy: 60, happiness: 80, acousticness: 60, keywords: ["morning", "cheer", "walk"] },
    "diary": { energy: 55, happiness: 70, acousticness: 50, keywords: ["love", "pop", "drama"] },

    // Others
    "saraba": { energy: 65, happiness: 50, acousticness: 40, keywords: ["farewell", "new start", "spring"] },
    "tururi": { energy: 70, happiness: 60, acousticness: 30, keywords: ["instrumental", "game", "retro"] }
};

export const getSongTags = (songId: string): SongTags => {
    return songTags[songId] || {
        energy: 50,
        happiness: 50,
        acousticness: 50,
        keywords: []
    };
};
