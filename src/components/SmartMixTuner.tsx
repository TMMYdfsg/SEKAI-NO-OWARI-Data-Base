"use client";

import { useState, useEffect } from "react";
import { songs, Song } from "@/data/songs";
import { getSongTags } from "@/data/song-tags";
import { Play, Sliders, RefreshCw, Music } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { motion } from "framer-motion";

export default function SmartMixTuner() {
    const [energy, setEnergy] = useState(50);
    const [happiness, setHappiness] = useState(50);
    const [acousticness, setAcousticness] = useState(50);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const { playSong } = usePlayer();

    const generateMix = () => {
        const scoredSongs = songs.map(song => {
            const tags = getSongTags(song.id);
            // Calculate Euclidean distance (smaller is better match)
            const distance = Math.sqrt(
                Math.pow(tags.energy - energy, 2) +
                Math.pow(tags.happiness - happiness, 2) +
                Math.pow(tags.acousticness - acousticness, 2)
            );
            return { song, distance };
        });

        const sorted = scoredSongs.sort((a, b) => a.distance - b.distance);
        setPlaylist(sorted.slice(0, 10).map(item => item.song));
    };

    // Generate initial mix
    useEffect(() => {
        generateMix();
    }, []);

    const toTrack = (song: Song) => ({
        name: song.id,
        path: `${song.id}.mp3`,
        type: "audio/mp3",
        category: song.category,
        thumbnail: `/api/album-art/${encodeURIComponent(song.album)}`,
        album: song.album
    });

    const playAll = () => {
        if (playlist.length > 0) {
            playSong(toTrack(playlist[0]), playlist.map(toTrack));
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sliders className="text-primary" />
                        Smart Mix Tuner
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        パラメータを調整して、今の気分にぴったりのミックスを作成します。
                    </p>
                </div>
                <button
                    onClick={generateMix}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Sliders */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-blue-400">Calm</span>
                            <span>Energy</span>
                            <span className="text-red-400">Hype</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={energy}
                            onChange={(e) => setEnergy(Number(e.target.value))}
                            onMouseUp={generateMix}
                            onTouchEnd={generateMix}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-400">Dark</span>
                            <span>Happiness</span>
                            <span className="text-yellow-400">Happy</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={happiness}
                            onChange={(e) => setHappiness(Number(e.target.value))}
                            onMouseUp={generateMix}
                            onTouchEnd={generateMix}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-purple-400">Electronic</span>
                            <span>Acousticness</span>
                            <span className="text-green-400">Organic</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={acousticness}
                            onChange={(e) => setAcousticness(Number(e.target.value))}
                            onMouseUp={generateMix}
                            onTouchEnd={generateMix}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500"
                        />
                    </div>
                </div>

                {/* Playlist Preview */}
                <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Preview Results
                        </div>
                        <button
                            onClick={playAll}
                            className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/80 transition-colors"
                        >
                            <Play size={12} fill="currentColor" />
                            Play All
                        </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                        {playlist.map((song, i) => (
                            <motion.div
                                key={`${song.id}-${energy}-${happiness}-${acousticness}`} // Key change triggers animation
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors group cursor-pointer"
                                onClick={() => playSong(toTrack(song))}
                            >
                                <div className="w-10 h-10 rounded bg-white/5 overflow-hidden shrink-0 relative">
                                    {song.album ? (
                                        <img src={`/api/album-art/${encodeURIComponent(song.album)}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Music size={16} className="text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{song.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">{song.album}</div>
                                </div>
                                <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
