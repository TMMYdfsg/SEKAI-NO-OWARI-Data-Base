"use client";

import { useState, useMemo, useEffect } from "react";
import { Disc3, Calendar, Play, ExternalLink, Plus, AlertCircle, ArrowUpDown, Tag, X, ChevronDown, Grid3x3, LayoutList, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import type { Discography } from "@/types/discography";
import AlbumCard3D from "@/components/AlbumCard3D";
import VisualTimeline from "@/components/VisualTimeline";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail?: string | null;
}

type SortOption = 'release-desc' | 'release-asc' | 'name-asc' | 'name-desc' | 'type';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'release-desc', label: 'リリース日 (新しい順)' },
    { value: 'release-asc', label: 'リリース日 (古い順)' },
    { value: 'name-asc', label: '名前順 (A→Z)' },
    { value: 'name-desc', label: '名前順 (Z→A)' },
    { value: 'type', label: 'タイプ別' },
];

export default function DiscographyPage() {
    const router = useRouter();
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState<SortOption>('release-desc');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'3d' | 'list' | 'timeline'>('3d');
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [albums, setAlbums] = useState<Discography[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();

    // Fetch albums from API
    useEffect(() => {
        fetch("/api/db/discography")
            .then((res) => res.json())
            .then((data) => {
                setAlbums(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load discography:", err);
                setLoading(false);
            });
    }, []);

    // Fetch local files to match with tracks
    useEffect(() => {
        fetch("/api/files")
            .then((res) => res.json())
            .then((data) => setLocalFiles(data.files || []))
            .catch(console.error);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowSortDropdown(false);
        if (showSortDropdown) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showSortDropdown]);

    // Get all unique tags from albums
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        albums.forEach(album => {
            if (album.tags) {
                album.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [albums]);

    // Toggle tag selection
    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const filteredAlbums = useMemo(() => {
        let result = albums;

        // Filter by type
        if (filter !== "All") {
            result = result.filter(album => album.type === filter);
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            result = result.filter(album =>
                album.tags && selectedTags.every(tag => album.tags?.includes(tag))
            );
        }

        // Apply sort
        switch (sortBy) {
            case 'release-desc':
                result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
                break;
            case 'release-asc':
                result.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
                break;
            case 'name-asc':
                result.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
                break;
            case 'name-desc':
                result.sort((a, b) => b.title.localeCompare(a.title, 'ja'));
                break;
            case 'type':
                result.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }

        return result;
    }, [albums, filter, sortBy, selectedTags]);

    const filters = ["All", "Album", "Single", "Video", "Compilation"];

    // Find a local file matching the track name (Original category only)
    const findLocalFile = (trackTitle: string): LocalFile | null => {
        const normalizedTrack = trackTitle.toLowerCase().trim();
        // Only match files from "Original" category
        return localFiles.filter(file => file.category === "Original").find(file => {
            const fileName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().trim();
            return fileName === normalizedTrack || fileName.includes(normalizedTrack) || normalizedTrack.includes(fileName);
        }) || null;
    };

    const handlePlayTrack = (trackTitle: string, albumTitle: string) => {
        const localFile = findLocalFile(trackTitle);

        if (localFile) {
            const track: Track = {
                name: localFile.name,
                path: localFile.path,
                type: localFile.type,
                category: localFile.category,
                thumbnail: localFile.thumbnail,
                album: albumTitle,
            };
            playSong(track, localFiles.map(f => ({
                name: f.name,
                path: f.path,
                type: f.type,
                category: f.category,
                thumbnail: f.thumbnail,
            })));
        } else {
            console.warn(`Local file not found for track: ${trackTitle}`);
            alert(`"${trackTitle}" のローカルファイルが見つかりません。\nprograms/media フォルダにファイルを追加してください。`);
        }
    };

    const playAlbum = (album: Discography) => {
        // Collect tracks from the album
        const tracks: Track[] = [];
        album.discs?.forEach(disc => {
            disc.tracks?.forEach(t => {
                // Find matching local file
                const metadataMatch = localFiles.find(f =>
                    f.name.toLowerCase().includes(t.title.toLowerCase())
                );

                if (metadataMatch) {
                    tracks.push({
                        name: t.title,
                        path: metadataMatch.path,
                        category: metadataMatch.category,
                        thumbnail: album.coverImage
                    });
                }
            });
        });

        if (tracks.length > 0) {
            playSong(tracks[0], tracks);
        } else {
            console.warn("No playable tracks found for album:", album.title);
            // Could add UI notification here
        }
    };

    const handleCreateNew = async () => {
        try {
            const newAlbum: Partial<Discography> = {
                title: "新しいアルバム",
                type: "Album",
                discs: [{
                    discNumber: 1,
                    tracks: []
                }],
                tags: [],
                isFavorite: false,
                isComplete: false,
                missingFields: ["タイトル", "リリース日", "カバー画像", "トラックリスト"],
            };

            const res = await fetch("/api/db/discography", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAlbum),
            });

            if (res.ok) {
                const created = await res.json();
                router.push(`/discography/${created.id}`);
            } else {
                const error = await res.json();
                alert(`作成に失敗しました: ${error.error}`);
            }
        } catch (err) {
            console.error("Create error:", err);
            alert("作成中にエラーが発生しました");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="animate-pulse text-primary">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center fade-in-up">
                    <h1 className="text-5xl font-bold font-serif mb-4 flex items-center justify-center gap-4 text-primary drop-shadow-lg">
                        <Disc3 size={48} />
                        Discography
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        The musical journey of SEKAI NO OWARI
                    </p>
                </header>

                {/* Filters & Controls */}
                <div className="mb-8 flex flex-col items-center gap-6 fade-in-up delay-100">
                    <div className="flex flex-wrap justify-center gap-3">
                        {["All", "Single", "Album", "EP", "DVD/Blu-ray"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === type
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                    : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-white/5"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher, Sort & Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-4xl">
                        {/* View Switcher */}
                        <div className="flex bg-surface rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode('3d')}
                                className={`p-2 rounded-md transition-all ${viewMode === '3d' ? 'bg-white/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                                title="3D View"
                            >
                                <Grid3x3 size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                                title="List View"
                            >
                                <LayoutList size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                                title="Timeline View"
                            >
                                <Activity size={20} />
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSortDropdown(!showSortDropdown); }}
                                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-white/5 rounded-lg text-sm text-foreground transition-all"
                            >
                                <ArrowUpDown size={16} />
                                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                <ChevronDown size={14} />
                            </button>

                            {showSortDropdown && (
                                <div className="absolute z-20 mt-2 w-56 rounded-xl bg-card border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value
                                                        ? "bg-primary/20 text-primary"
                                                        : "text-foreground hover:bg-white/5"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Tag Filter */}
                    {allTags.length > 0 && (
                        <div className="bg-card/30 border border-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag size={14} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">タグフィルター</span>
                                {selectedTags.length > 0 && (
                                    <button
                                        onClick={() => setSelectedTags([])}
                                        className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                    >
                                        <X size={12} />
                                        クリア
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs border transition-all ${selectedTags.includes(tag)
                                            ? 'bg-primary/20 border-primary/50 text-primary'
                                            : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results count */}
                    <div className="text-sm text-muted-foreground">
                        {filteredAlbums.length}件表示中
                        {(filter !== "All" || selectedTags.length > 0) && (
                            <span className="ml-2">
                                (全{albums.length}件中)
                            </span>
                        )}
                    </div>
                </div>

                {albums.length === 0 ? (
                    <div className="text-center py-20">
                        <Disc3 size={64} className="mx-auto mb-4 text-white/20" />
                        <p className="text-muted-foreground mb-4">アルバムがまだありません</p>
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                        >
                            <Plus size={16} />
                            最初のアルバムを作成
                        </button>
                    </div>
                ) : viewMode === '3d' ? (
                    /* 3D Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAlbums.map((album) => (
                            <AlbumCard3D
                                key={album.id}
                                album={album}
                                localFiles={localFiles}
                                onPlayTrack={handlePlayTrack}
                                findLocalFile={findLocalFile}
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        {filteredAlbums.map((album) => {
                            const allTracks = album.discs.flatMap(disc => disc.tracks);
                            return (
                                <Link
                                    key={album.id}
                                    href={`/discography/${album.id}`}
                                    className="flex items-center gap-6 bg-card/70 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-all duration-300 group"
                                >
                                    {/* Album Cover Thumbnail */}
                                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                                        {album.coverImage ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                                                style={{ backgroundImage: `url(${album.coverImage})` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Disc3 size={32} className="text-white/20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Album Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-bold font-serif truncate group-hover:text-primary transition-colors">
                                                {album.title}
                                            </h2>
                                            {!album.isComplete && (
                                                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {album.releaseDate || "日付未設定"}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${album.type === "Single" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                                                album.type === "Video" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                                                    "bg-white/10 text-white/60 border-white/10"
                                                }`}>
                                                {album.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Disc3 size={12} />
                                                {allTracks.length} tracks
                                            </span>
                                        </div>
                                        {/* Tags */}
                                        {album.tags && album.tags.length > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {album.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="text-[10px] text-primary/60">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
