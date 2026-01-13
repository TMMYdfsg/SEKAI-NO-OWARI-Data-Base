"use client";

import { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Music, Zap, CloudRain, Skull, Wand2, Play } from "lucide-react";
import { getRecommendations, getMoodPlaylist, Recommendation } from "@/lib/recommendation";
import SmartMixTuner from "@/components/SmartMixTuner";
import { Song } from "@/data/songs";
import { usePlayer } from "@/contexts/PlayerContext";
import { motion } from "framer-motion";

export default function RecommendationPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [moodPlaylist, setMoodPlaylist] = useState<Song[]>([]);
    const [activeMood, setActiveMood] = useState<string | null>(null);
    const [localFiles, setLocalFiles] = useState<any[]>([]); // Add localFiles state
    const { playSong } = usePlayer();

    useEffect(() => {
        setRecommendations(getRecommendations());
        // Fetch local files
        fetch("/api/files")
            .then(res => res.json())
            .then(data => setLocalFiles(data.files || []))
            .catch(console.error);
    }, []);

    const handleMoodSelect = (mood: "uplifting" | "calm" | "dark" | "fantasy", label: string) => {
        setActiveMood(label);
        setMoodPlaylist(getMoodPlaylist(mood));
    };

    const toTrack = (song: Song) => {
        // Find matching local file
        const normalizedTitle = song.title.toLowerCase().replace(/[\s\u3000]+/g, '');
        const match = localFiles.find(f => {
            const fName = f.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[\s\u3000]+/g, '');
            return fName.includes(normalizedTitle) || normalizedTitle.includes(fName) || f.name.includes(song.id);
        });

        return {
            name: song.title,
            path: match ? match.path : `${song.id}.mp3`, // Fallback
            type: match ? match.type : "audio/mp3",
            category: match ? match.category : song.category,
            thumbnail: `/api/album-art/${encodeURIComponent(song.album)}`,
            album: song.album
        };
    };

    const playAll = (songs: Song[]) => {
        if (songs.length > 0) {
            playSong(toTrack(songs[0]), songs.map(toTrack));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-black">
            {/* Header */}
            <div className="pt-24 px-6 md:px-12 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-7xl mx-auto text-center"
                >
                    <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
                        <Sparkles size={32} className="text-primary animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        AI Assistant
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        あなたの視聴履歴と今の時間帯から、最適な楽曲を提案します。
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">

                {/* AI DJ Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <a href="/recommend/dj" className="block relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-black hover:border-primary/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="absolute -right-10 -bottom-10 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                            <Wand2 size={200} />
                        </div>

                        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                                    <Sparkles size={12} />
                                    New Feature
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">
                                    AI DJ "Love" に相談する
                                </h2>
                                <p className="text-muted-foreground max-w-lg">
                                    チャット形式であなたの今の気分やシチュエーションを伝えてください。
                                    AIがあなたのためだけの特別なセットリストを作成します。
                                </p>
                            </div>

                            <div className="shrink-0">
                                <span className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-xl shadow-primary/10">
                                    <Zap size={20} className="fill-current" />
                                    Start Chat
                                </span>
                            </div>
                        </div>
                    </a>
                </motion.div>

                {/* Personalized Recommendations */}
                {recommendations.length > 0 && (
                    <motion.section
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-3 border-l-4 border-primary pl-4">
                            <Music className="text-primary" />
                            For You
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        {rec.type === "time-based" ? <Sun size={64} /> :
                                            rec.type === "re-engage" ? <Sparkles size={64} /> :
                                                <Wand2 size={64} />}
                                    </div>

                                    <div className="p-6">
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                            {rec.type === "time-based" ? "Time Context" :
                                                rec.type === "re-engage" ? "Rediscover" : "Discovery"}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{rec.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                            {rec.description}
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            {rec.songs.slice(0, 3).map(song => (
                                                <div
                                                    key={song.id}
                                                    onClick={() => playSong(toTrack(song))}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded bg-black/50 overflow-hidden shrink-0">
                                                        {song.album ? (
                                                            <img src={`/api/album-art/${encodeURIComponent(song.album)}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-white/20">
                                                                <Music size={12} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{song.title}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{song.album}</div>
                                                    </div>
                                                    <Play size={12} className="text-white/0 group-hover:text-white/50" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Mood Selector */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                        <Wand2 className="text-purple-500" />
                        Mood Mix
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { id: "uplifting", label: "Energy / 元気", icon: Zap, color: "text-yellow-400", bg: "hover:bg-yellow-500/10 hover:border-yellow-500/30" },
                            { id: "calm", label: "Calm / 癒し", icon: CloudRain, color: "text-blue-400", bg: "hover:bg-blue-500/10 hover:border-blue-500/30" },
                            { id: "dark", label: "Dark / 世界観", icon: Skull, color: "text-red-400", bg: "hover:bg-red-500/10 hover:border-red-500/30" },
                            { id: "fantasy", label: "Fantasy / 魔法", icon: Moon, color: "text-purple-400", bg: "hover:bg-purple-500/10 hover:border-purple-500/30" },
                        ].map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id as any, mood.label)}
                                className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 group ${mood.bg} ${activeMood === mood.label ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                            >
                                <div className={`p-4 rounded-full bg-black/20 group-hover:scale-110 transition-transform ${mood.color}`}>
                                    <mood.icon size={32} />
                                </div>
                                <span className="font-medium text-lg text-white/80 group-hover:text-white">{mood.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mood Playlist Result */}
                    {moodPlaylist.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-card border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Generated Playlist</div>
                                    <h3 className="text-2xl font-bold">{activeMood} Selection</h3>
                                </div>
                                <button
                                    onClick={() => playAll(moodPlaylist)}
                                    className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-full font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/20"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Play Mix
                                </button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {moodPlaylist.map((song, i) => (
                                    <div
                                        key={`${song.id}-${i}`}
                                        className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => playSong(toTrack(song))}
                                    >
                                        <div className="w-8 text-center text-muted-foreground text-sm font-mono">{i + 1}</div>
                                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden shrink-0">
                                            {song.album && <img src={`/api/album-art/${encodeURIComponent(song.album)}`} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium group-hover:text-primary transition-colors">{song.title}</div>
                                            <div className="text-xs text-muted-foreground">{song.album}</div>
                                        </div>
                                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-all">
                                            <Play size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </section>

                {/* Smart Mix Tuner */}
                <section>
                    <SmartMixTuner />
                </section>
            </div>
        </div>
    );
}
