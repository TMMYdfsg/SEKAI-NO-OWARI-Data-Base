
import { songs, Song } from "@/data/songs";

export type RecommendationType = "discovery" | "re-engage" | "time-based" | "mood";

export interface Recommendation {
    type: RecommendationType;
    title: string;
    description: string;
    songs: Song[];
}

// Helper to get playback history from localStorage
const getHistory = (): Record<string, number> => { // songId -> count
    if (typeof window === "undefined") return {};
    try {
        const history = localStorage.getItem("sekaowa_playback_history");
        return history ? JSON.parse(history) : {};
    } catch {
        return {};
    }
};

const getLastPlayed = (): Record<string, number> => { // songId -> timestamp
    if (typeof window === "undefined") return {};
    try {
        const lastPlayed = localStorage.getItem("sekaowa_last_played");
        return lastPlayed ? JSON.parse(lastPlayed) : {};
    } catch {
        return {};
    }
};

export function getRecommendations(): Recommendation[] {
    const playCounts = getHistory();
    const lastPlayed = getLastPlayed();
    const allSongs = songs;
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

    const recommendations: Recommendation[] = [];

    // 1. Discovery (Songs never played or played very little)
    const discoverySongs = allSongs.filter(s => !playCounts[s.id] || playCounts[s.id] < 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    if (discoverySongs.length > 0) {
        recommendations.push({
            type: "discovery",
            title: "未開拓の名曲",
            description: "まだあまり聴いていない曲の中から、新たな発見を。",
            songs: discoverySongs
        });
    }

    // 2. Re-engage (Favorites not played recently)
    const reEngageSongs = allSongs.filter(s => {
        const count = playCounts[s.id] || 0;
        const lastTime = lastPlayed[s.id] || 0;
        return count > 5 && (now - lastTime > ONE_MONTH);
    })
        .sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0))
        .slice(0, 5);

    if (reEngageSongs.length > 0) {
        recommendations.push({
            type: "re-engage",
            title: "久しぶりの再会",
            description: "以前よく聴いていたお気に入りの曲たちです。",
            songs: reEngageSongs
        });
    }

    // 3. Time-based (Morning/Night context)
    const hours = new Date().getHours();
    let timeMood = "";
    let timeKeywords: string[] = [];

    if (hours >= 5 && hours < 11) {
        timeMood = "爽やかな朝に";
        timeKeywords = ["Bird", "RPG", "炎と森のカーニバル", "蜜の月", "Yume", "tururi"];
    } else if (hours >= 22 || hours < 4) {
        timeMood = "静かな夜に";
        timeKeywords = ["Starlight Parade", "K.", "眠り姫", "yume", "Fukai Mori", "Moonlight Station"];
    }

    if (timeKeywords.length > 0) {
        const timeSongs = allSongs.filter(s =>
            timeKeywords.some(k => s.title.toLowerCase().includes(k.toLowerCase())
                || (s.title && s.title.toLowerCase().includes(k.toLowerCase())))
        ).slice(0, 5);

        if (timeSongs.length > 0) {
            recommendations.push({
                type: "time-based",
                title: timeMood,
                description: "今の時間帯にぴったりの選曲です。",
                songs: timeSongs
            });
        }
    }

    return recommendations;
}

import { songTags, getSongTags } from "@/data/song-tags";

export function getMoodPlaylist(mood: "uplifting" | "calm" | "dark" | "fantasy"): Song[] {
    const allSongs = songs;

    return allSongs.filter(s => {
        const tags = getSongTags(s.id);

        // Filter logic based on tags
        switch (mood) {
            case "uplifting":
                // High Energy & Happiness
                return tags.energy >= 70 && tags.happiness >= 60;
            case "calm":
                // Low Energy or High Acousticness
                return tags.energy <= 40 || tags.acousticness >= 70;
            case "dark":
                // Low Happiness
                return tags.happiness <= 30;
            case "fantasy":
                // Magic keyword or "fantasy" mood approximation (High acousticness + keywords)
                return tags.keywords.includes("fantasy") || tags.keywords.includes("magic") || tags.keywords.includes("night");
            default:
                return false;
        }
    }).sort(() => Math.random() - 0.5).slice(0, 10);
}
