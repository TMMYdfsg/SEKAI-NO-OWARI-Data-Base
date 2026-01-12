"use client";

import { songs as songsData } from "@/data/songs";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Play, Sparkles, Lock, Home, Medal, Trophy } from "lucide-react";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import { getBadges } from "@/lib/local-storage-data";

type SortOption = "az" | "za" | "filename";

type LocalFile = {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
};

type MergedSong = {
    id: string;
    title: string;
    album: string;
    year: number | string;
    writer: string;
    composer: string;
    category: string;
    file: LocalFile;
};

function SecretHouseContent() {
    const searchParams = useSearchParams();
    const viewMode = searchParams.get("view"); // 'badges' or undefined

    const [query, setQuery] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("az");
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [badges, setBadges] = useState<string[]>([]);
    const { playSong } = usePlayer();

    useEffect(() => {
        fetch('/api/files')
            .then(res => res.json())
            .then(data => {
                setLocalFiles(data.files || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load files", err);
                setLoading(false);
            });

        setBadges(getBadges());
    }, []);

    // Filter to only Rare category files
    const rareFiles = useMemo(() => {
        return localFiles.filter(file => file.category.startsWith("Rare"));
    }, [localFiles]);

    const mergedSongs = useMemo(() => {
        return rareFiles.map(file => {
            const meta = songsData.find(s =>
                file.name.toLowerCase().includes(s.title.toLowerCase())
            );

            return {
                id: file.path,
                title: meta ? meta.title : file.name.replace(/\.[^/.]+$/, ""),
                album: meta ? meta.album : "Unknown",
                year: meta ? meta.year : "-",
                writer: meta ? meta.writer : "-",
                composer: meta ? meta.composer : "-",
                category: file.category,
                file: file
            };
        });
    }, [rareFiles]);

    const filteredSongs = useMemo(() => {
        return mergedSongs
            .filter(song => {
                const matchesSearch = song.title.toLowerCase().includes(query.toLowerCase());
                return matchesSearch;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case "az": return a.title.localeCompare(b.title, 'ja');
                    case "za": return b.title.localeCompare(a.title, 'ja');
                    case "filename": return a.file.name.localeCompare(b.file.name, 'ja');
                    default: return 0;
                }
            });
    }, [mergedSongs, query, sortOption]);

    const handlePlaySong = (song: MergedSong) => {
        const track: Track = {
            name: song.file.name,
            path: song.file.path,
            type: song.file.type,
            category: song.category,
            thumbnail: song.file.thumbnail,
            album: song.album,
        };
        const trackList: Track[] = filteredSongs.map(s => ({
            name: s.file.name,
            path: s.file.path,
            type: s.file.type,
            category: s.category,
            thumbnail: s.file.thumbnail,
            album: s.album,
        }));
        playSong(track, trackList);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading secret collection...</div>;
    }

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background to-background">
            {/* Decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <header className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="relative">
                            <Home size={48} className="text-purple-400/50" />
                            <Lock size={20} className="absolute -bottom-1 -right-1 text-purple-300" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold font-serif bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg mb-2">
                        SECRET HOUSE
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-purple-400/60 text-sm">
                        <Sparkles size={14} />
                        <span>隠された音源コレクション</span>
                        <Sparkles size={14} />
                    </div>
                    {viewMode !== 'badges' && (
                        <p className="text-muted-foreground mt-4">
                            {rareFiles.length} rare & unreleased tracks
                        </p>
                    )}
                </header>

                {/* View Mode: Badges */}
                {viewMode === 'badges' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-2">
                                <Trophy className="text-yellow-400" />
                                獲得したバッジ
                            </h2>
                            <p className="text-white/50">あなたの冒険の証</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Quiz Master Badge */}
                            <div className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${badges.includes("QUIZ_MASTER")
                                    ? "bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                                    : "bg-white/5 border-white/10 opacity-50 grayscale"
                                }`}>
                                <Medal size={48} className={badges.includes("QUIZ_MASTER") ? "text-yellow-400" : "text-white/20"} />
                                <h3 className="font-bold text-white mt-4 mb-1">QUIZ MASTER</h3>
                                <p className="text-xs text-white/50">クイズで全問正解する</p>
                            </div>

                            {/* Quiz Expert Badge */}
                            <div className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${badges.includes("QUIZ_EXPERT")
                                    ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                    : "bg-white/5 border-white/10 opacity-50 grayscale"
                                }`}>
                                <Trophy size={48} className={badges.includes("QUIZ_EXPERT") ? "text-blue-400" : "text-white/20"} />
                                <h3 className="font-bold text-white mt-4 mb-1">QUIZ EXPERT</h3>
                                <p className="text-xs text-white/50">クイズで高得点を取る</p>
                            </div>

                            {/* Placeholders for future badges */}
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="p-6 rounded-xl border bg-white/5 border-white/10 opacity-30 flex flex-col items-center text-center">
                                    <Lock size={48} className="text-white/20" />
                                    <h3 className="font-bold text-white mt-4 mb-1">???</h3>
                                    <p className="text-xs text-white/50">ロックされています</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Filters */}
                        <div className="max-w-4xl mx-auto mb-12 space-y-4">
                            {/* Search */}
                            <div className="relative w-full group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400/50 group-hover:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search secret collection..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-purple-500/5 border border-purple-500/20 rounded-full focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder:text-purple-300/30"
                                />
                            </div>

                            {/* Sort */}
                            <div className="flex justify-center items-center gap-2">
                                <span className="text-xs text-purple-300/50">並び順:</span>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="px-3 py-2 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="az">タイトル A-Z</option>
                                    <option value="za">タイトル Z-A</option>
                                    <option value="filename">ファイル名順</option>
                                </select>
                            </div>
                        </div>

                        {/* Songs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSongs.map((song) => (
                                <button
                                    key={song.id}
                                    onClick={() => handlePlaySong(song)}
                                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group text-left w-full"
                                >
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 overflow-hidden shrink-0 relative group-hover:ring-2 ring-purple-400 transition-all">
                                            {song.file.thumbnail ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(/api/media?file=${encodeURIComponent(song.file.thumbnail)})` }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Sparkles size={24} className="text-purple-300/50" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={24} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold font-serif text-white/90 group-hover:text-purple-300 transition-colors truncate">
                                                {song.title}
                                            </h3>
                                            <p className="text-xs text-purple-300/40 truncate flex items-center gap-1">
                                                <Lock size={10} />
                                                Secret Track
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {filteredSongs.length === 0 && (
                                <div className="col-span-full py-20 text-center text-purple-300/50 border border-dashed border-purple-500/20 rounded-xl">
                                    <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No secret tracks found.</p>
                                    <p className="text-xs opacity-50 mt-2">Add files to programs/media/rare/...</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SecretHousePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
            <SecretHouseContent />
        </Suspense>
    );
}
