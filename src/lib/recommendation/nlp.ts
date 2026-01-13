import { songs, Song } from "@/data/songs";
import { songTags, getSongTags } from "@/data/song-tags";

export interface DJResponse {
    playlist: Song[];
    comment: string;
    matchedKeywords: string[];
}

// Simple synonyms map for Japanese input
const SYNONYMS: Record<string, string[]> = {
    "元気": ["energy", "cheer", "pop", "party", "fight", "勇気", "明るい"],
    "のれる": ["energy", "dance", "edm", "party", "ドライブ"],
    "落ち着く": ["calm", "quiet", "sleep", "ballad", "sos", "眠れる", "静か"],
    "泣ける": ["sad", "emotional", "tears", "ballad", "感動"],
    "雨": ["rain", "umbrella", "梅雨", "天気"],
    "夜": ["night", "stars", "moon", "sleep", "dark", "ドライブ"],
    "朝": ["morning", "bird", "start", "walk", "目覚め"],
    "冬": ["winter", "snow", "christmas", "cold"],
    "夏": ["summer", "ocean", "festival", "hot"],
    "春": ["spring", "sakura", "farewell", "new start", "出会い"],
    "ファンタジー": ["fantasy", "magic", "sekai", "story"],
    "ドライブ": ["drive", "car", "speed", "night"],
    "英語": ["english", "western"]
};

export function analyzeRequest(input: string): DJResponse {
    const normalizedInput = input.toLowerCase();
    const matchedKeywords: string[] = [];
    let targetEnergy: number | null = null;
    let targetHappiness: number | null = null;

    // 1. Keyword Extraction & Sentiment Analysis
    Object.entries(SYNONYMS).forEach(([key, values]) => {
        if (normalizedInput.includes(key) || values.some(v => normalizedInput.includes(v))) {
            matchedKeywords.push(...values);
            matchedKeywords.push(key); // Add the key itself as a tag candidate
        }
    });

    // Detect basic sentiment adjustments
    if (normalizedInput.includes("激し") || normalizedInput.includes("アップテン")) {
        targetEnergy = 80;
    } else if (normalizedInput.includes("静か") || normalizedInput.includes("ゆっくり")) {
        targetEnergy = 20;
    }

    if (normalizedInput.includes("明るい") || normalizedInput.includes("ハッピー")) {
        targetHappiness = 80;
    } else if (normalizedInput.includes("暗い") || normalizedInput.includes("ダーク")) {
        targetHappiness = 20;
    }

    // 2. Scoring Songs
    const scoredSongs = songs.map(song => {
        const tags = getSongTags(song.id);
        let score = 0;

        // Keyword Match
        // Check if any of the song's keywords match the extracted keywords
        const keywordMatchCount = tags.keywords.filter(k =>
            matchedKeywords.some(mk => mk.includes(k) || k.includes(mk))
        ).length;
        score += keywordMatchCount * 10;

        // Title Match (Bonus)
        if (normalizedInput.includes(song.title.toLowerCase())) {
            score += 50;
        }

        // Tag Similarity (if targets are set)
        if (targetEnergy !== null) {
            score += 20 - Math.abs(targetEnergy - tags.energy) * 0.2;
        }
        if (targetHappiness !== null) {
            score += 20 - Math.abs(targetHappiness - tags.happiness) * 0.2;
        }

        return { song, score };
    });

    // 3. Sort and Filter
    const resultSongs = scoredSongs
        .filter(item => item.score > 10) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.song);

    // Filter duplicates if any (though song IDs are unique in data, better safe)
    const uniqueSongs = Array.from(new Set(resultSongs));

    // Consolation prize if no matches
    if (uniqueSongs.length === 0) {
        return {
            playlist: songs.sort(() => Math.random() - 0.5).slice(0, 5),
            comment: "うーん、ピッタリな曲が見つからなかったから、私の気分でランダムに選んでみたよ。どうかな？",
            matchedKeywords: []
        };
    }

    // 4. Generate Comment
    let comment = "リクエストありがとうございます！";
    if (matchedKeywords.includes("rain") || matchedKeywords.includes("雨")) {
        comment = "雨の日は少しセンチメンタルになりますよね。そんな日に寄り添う曲を選びました。";
    } else if (matchedKeywords.includes("night") || matchedKeywords.includes("夜")) {
        comment = "夜の静寂や、きらめく星空に似合うプレイリストです。";
    } else if (targetEnergy && targetEnergy > 60) {
        comment = "テンションを上げたい時におすすめ！エネルギー全開のセットリストです！";
    } else if (targetHappiness && targetHappiness < 40) {
        comment = "少し落ち込んでいる時や、ダークな世界観に浸りたい時にどうぞ。";
    } else {
        comment = "そのキーワードからインスピレーションを受けて、こんな曲たちを選んでみました。";
    }

    return {
        playlist: uniqueSongs,
        comment,
        matchedKeywords: Array.from(new Set(matchedKeywords))
    };
}
