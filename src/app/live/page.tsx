"use client";

import { songs as songsData } from "@/data/songs";
import { useState, useMemo, useEffect } from "react";
import { Search, Disc, User, SortAsc, Calendar, Folder, Play, Radio, ChevronDown } from "lucide-react";
import { usePlayer, Track } from "@/contexts/PlayerContext";

type SortOption = "az" | "za" | "year_asc" | "year_desc" | "folder_year_asc" | "folder_year_desc" | "filename";

// Extract year from folder name like "(2023) Terminal" or "(2010)FACTORY LIVE"
function extractFolderYear(category: string): number {
    const match = category.match(/\((\d{4})\)/);
    return match ? parseInt(match[1], 10) : 0;
}

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

export default function LivePage() {
    const [query, setQuery] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("folder_year_desc");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [loading, setLoading] = useState(true);
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
    }, []);

    // Filter to only LIVE REMIX category files
    const liveFiles = useMemo(() => {
        return localFiles.filter(file => file.category.startsWith("LIVE REMIX"));
    }, [localFiles]);

    const mergedSongs = useMemo(() => {
        return liveFiles.map(file => {
            const meta = songsData.find(s =>
                file.name.toLowerCase().includes(s.title.toLowerCase())
            );

            return {
                id: file.path,
                title: meta ? meta.title : file.name.replace(/\.[^/.]+$/, ""),
                album: meta ? meta.album : "Unknown Album",
                year: meta ? meta.year : "-",
                writer: meta ? meta.writer : "-",
                composer: meta ? meta.composer : "-",
                category: file.category,
                file: file
            };
        });
    }, [liveFiles]);

    // Extract unique categories
    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>();
        liveFiles.forEach(f => cats.add(f.category));
        return Array.from(cats).sort((a, b) => extractFolderYear(b) - extractFolderYear(a));
    }, [liveFiles]);

    const filteredSongs = useMemo(() => {
        return mergedSongs
            .filter(song => {
                const matchesSearch = song.title.toLowerCase().includes(query.toLowerCase()) ||
                    song.album.toLowerCase().includes(query.toLowerCase());

                let categoryMatch = true;
                if (selectedCategory !== "all") {
                    categoryMatch = song.category === selectedCategory;
                }

                return matchesSearch && categoryMatch;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case "az": return a.title.localeCompare(b.title, 'ja');
                    case "za": return b.title.localeCompare(a.title, 'ja');
                    case "year_asc":
                        if (typeof a.year === 'number' && typeof b.year === 'number') return a.year - b.year;
                        return 0;
                    case "year_desc":
                        if (typeof a.year === 'number' && typeof b.year === 'number') return b.year - a.year;
                        return 0;
                    case "folder_year_desc":
                        return extractFolderYear(b.category) - extractFolderYear(a.category);
                    case "folder_year_asc":
                        return extractFolderYear(a.category) - extractFolderYear(b.category);
                    case "filename":
                        return a.file.name.localeCompare(b.file.name, 'ja');
                    default: return 0;
                }
            });
    }, [mergedSongs, query, sortOption, selectedCategory]);

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
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading LIVE library...</div>;
    }

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Radio size={40} className="text-blue-400" />
                        <h1 className="text-5xl font-bold font-serif text-primary drop-shadow-lg">
                            LIVE REMIX
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {liveFiles.length} LIVE versions from {uniqueCategories.length} tours
                    </p>
                </header>

                {/* Filters */}
                <div className="max-w-4xl mx-auto mb-12 space-y-4">
                    {/* Search */}
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search LIVE tracks..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === "all"
                                ? "bg-blue-500 text-white shadow-lg"
                                : "bg-white/10 text-muted-foreground hover:text-white hover:bg-white/20"
                                }`}
                        >
                            すべて ({liveFiles.length})
                        </button>
                        {uniqueCategories.map(cat => {
                            const count = liveFiles.filter(f => f.category === cat).length;
                            const label = cat.replace("LIVE REMIX / ", "");
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? "bg-blue-500 text-white shadow-lg"
                                        : "bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                                        }`}
                                >
                                    {label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort */}
                    <div className="flex justify-center items-center gap-2">
                        <span className="text-xs text-muted-foreground">並び順:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value="folder_year_desc">ツアー年 (新しい順)</option>
                            <option value="folder_year_asc">ツアー年 (古い順)</option>
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
                            className="bg-card/40 backdrop-blur-md border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group shadow-lg text-left w-full"
                        >
                            <div className="p-4 bg-blue-500/5 flex items-center gap-4">
                                <div className="h-16 w-16 rounded-lg bg-blue-500/10 overflow-hidden shrink-0 relative group-hover:ring-2 ring-blue-500 transition-all">
                                    {song.file.thumbnail ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(/api/media?file=${encodeURIComponent(song.file.thumbnail)})` }}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Radio size={24} className="text-blue-400/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play size={24} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold font-serif text-white/90 group-hover:text-blue-400 transition-colors truncate">
                                        {song.title}
                                    </h3>
                                    <p className="text-xs text-blue-300/70 truncate">
                                        {song.category.replace("LIVE REMIX / ", "")}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}

                    {filteredSongs.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                            <Radio size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No LIVE tracks found.</p>
                            <p className="text-xs opacity-50 mt-2">Add files to programs/media/live_remix/...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
