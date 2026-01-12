"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Video, Play, Pause, Folder, X, FolderOpen, RefreshCw, AlertCircle, Calendar, SortAsc } from "lucide-react";

type VideoFile = {
    name: string;
    path: string;
    fullPath: string;
    type: string;
    category: string;
    thumbnail: string | null;
    thumbnailFullPath: string | null;
};

type SortOption = "year_asc" | "year_desc" | "name_az" | "name_za" | "category";

// Extract year from folder name like "(2023) Terminal" or "(2010)FACTORY LIVE"
function extractYear(category: string): number {
    const match = category.match(/\((\d{4})\)/);
    return match ? parseInt(match[1], 10) : 0;
}

const SETTINGS_KEY = "sekaowa_settings";
const DEFAULT_VIDEO_PATH = "F:\\セカオワの音源・ライブ・番組\\LIVE DVD";

export default function VideosPage() {
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortOption, setSortOption] = useState<SortOption>("year_desc");
    const [videoPath, setVideoPath] = useState<string>(DEFAULT_VIDEO_PATH);
    const [editingPath, setEditingPath] = useState(false);
    const [tempPath, setTempPath] = useState(DEFAULT_VIDEO_PATH);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Discography covers for fallback
    const [discographyCovers, setDiscographyCovers] = useState<Record<string, string>>({});

    // Load saved path from settings
    useEffect(() => {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.videoPath) {
                    setVideoPath(settings.videoPath);
                    setTempPath(settings.videoPath);
                }
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
    }, []);

    // Fetch discography covers
    useEffect(() => {
        fetch('/api/db/discography')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Start with an empty map
                    const covers: Record<string, string> = {};
                    // Keep track of the type for prioritization
                    const coverTypes: Record<string, string> = {};

                    data.forEach((album: any) => {
                        if (album.coverImage) {
                            const isSingle = album.type === 'Single';

                            // Map each track title to the album cover
                            album.discs?.forEach((disc: any) => {
                                disc.tracks?.forEach((track: any) => {
                                    const titleLower = track.title.toLowerCase();
                                    const existingType = coverTypes[titleLower];

                                    if (!existingType || (existingType !== 'Single' && isSingle)) {
                                        covers[titleLower] = album.coverImage;
                                        coverTypes[titleLower] = album.type || 'Album';
                                    }
                                });
                            });
                        }
                    });
                    setDiscographyCovers(covers);
                }
            })
            .catch(console.error);
    }, []);

    // Fetch videos when path changes
    useEffect(() => {
        fetchVideos();
    }, [videoPath]);

    const fetchVideos = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/videos?path=${encodeURIComponent(videoPath)}`);
            const data = await res.json();

            if (res.ok) {
                setVideos(data.files || []);
            } else {
                setError(data.error || "Failed to load videos");
                setVideos([]);
            }
        } catch (err) {
            console.error("Failed to load videos:", err);
            setError("ネットワークエラーが発生しました");
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const savePath = () => {
        setVideoPath(tempPath);

        // Save to localStorage
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        let settings = savedSettings ? JSON.parse(savedSettings) : {};
        settings.videoPath = tempPath;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

        setEditingPath(false);
    };

    // Extract unique categories and sort by year
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(videos.map(v => v.category)))
            .filter(c => c);

        // Sort categories by year extracted from folder name
        uniqueCats.sort((a, b) => {
            const yearA = extractYear(a);
            const yearB = extractYear(b);
            return yearB - yearA; // Newest first
        });

        return [
            { id: "all", label: "すべて", year: 0 },
            ...uniqueCats.map(c => ({
                id: c,
                label: c, // Show full folder name like "(2023) Terminal"
                year: extractYear(c)
            }))
        ];
    }, [videos]);

    // Filter and sort videos
    const filteredVideos = useMemo(() => {
        let result = selectedCategory === "all"
            ? [...videos]
            : videos.filter(v => v.category === selectedCategory || v.category.startsWith(selectedCategory + " /"));

        // Apply sorting
        result.sort((a, b) => {
            switch (sortOption) {
                case "year_desc":
                    return extractYear(b.category) - extractYear(a.category);
                case "year_asc":
                    return extractYear(a.category) - extractYear(b.category);
                case "name_az":
                    return a.name.localeCompare(b.name, 'ja');
                case "name_za":
                    return b.name.localeCompare(a.name, 'ja');
                case "category":
                    return a.category.localeCompare(b.category, 'ja');
                default:
                    return 0;
            }
        });

        return result;
    }, [videos, selectedCategory, sortOption]);

    const handleVideoSelect = (video: VideoFile) => {
        setSelectedVideo(video);
        setIsPlaying(false);
    };

    const closePlayer = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setSelectedVideo(null);
        setIsPlaying(false);
    };

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-bold font-serif text-primary drop-shadow-lg mb-4 flex items-center justify-center gap-4">
                        <Video size={48} />
                        Video Library
                    </h1>
                    <p className="text-muted-foreground">
                        {videos.length} videos found
                    </p>
                </header>

                {/* Path Configuration */}
                <div className="bg-card/50 border border-white/10 rounded-xl p-4 mb-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <FolderOpen size={18} className="text-primary" />
                        <span className="text-sm font-medium">参照フォルダ</span>
                    </div>

                    {editingPath ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tempPath}
                                onChange={(e) => setTempPath(e.target.value)}
                                placeholder="例: F:\セカオワの音源・ライブ・番組\LIVE DVD"
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-primary focus:outline-none"
                            />
                            <button
                                onClick={savePath}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
                            >
                                保存
                            </button>
                            <button
                                onClick={() => {
                                    setTempPath(videoPath);
                                    setEditingPath(false);
                                }}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
                            >
                                キャンセル
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm text-muted-foreground bg-black/30 px-3 py-2 rounded-lg truncate">
                                {videoPath}
                            </code>
                            <button
                                onClick={() => setEditingPath(true)}
                                className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                変更
                            </button>
                            <button
                                onClick={fetchVideos}
                                className="p-2 text-muted-foreground hover:text-white rounded-lg transition-colors"
                                title="再読み込み"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 max-w-4xl mx-auto flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-400 shrink-0" />
                        <div>
                            <p className="text-red-400 font-medium">{error}</p>
                            <p className="text-sm text-red-400/70 mt-1">
                                パスが正しいか確認してください: {videoPath}
                            </p>
                        </div>
                    </div>
                )}

                {/* Category Tabs and Sort */}
                {categories.length > 1 && (
                    <div className="mb-8 space-y-4">
                        {/* Sort Controls */}
                        <div className="flex justify-center items-center gap-4">
                            <span className="text-sm text-muted-foreground">並び順:</span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as SortOption)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary focus:outline-none cursor-pointer"
                            >
                                <optgroup label="年">
                                    <option value="year_desc">年 (新しい順)</option>
                                    <option value="year_asc">年 (古い順)</option>
                                </optgroup>
                                <optgroup label="名前">
                                    <option value="name_az">ファイル名 A-Z</option>
                                    <option value="name_za">ファイル名 Z-A</option>
                                </optgroup>
                                <optgroup label="その他">
                                    <option value="category">フォルダ順</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* Category Tabs (Tour/Year based) */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="animate-spin mr-3" size={24} />
                        <span className="text-muted-foreground">動画を読み込み中...</span>
                    </div>
                )}

                {/* Video Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVideos.map((video) => (
                            <button
                                key={video.fullPath}
                                onClick={() => handleVideoSelect(video)}
                                className="group bg-card/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-lg text-left w-full"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-black/50 relative overflow-hidden">
                                    {/* Logic: Discography Cover > File Thumbnail > Fallback */}
                                    {discographyCovers[video.name.replace(/\.[^/.]+$/, "").toLowerCase()] ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${discographyCovers[video.name.replace(/\.[^/.]+$/, "").toLowerCase()]})` }}
                                        />
                                    ) : video.thumbnailFullPath ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url(/api/videos/stream?file=${encodeURIComponent(video.thumbnailFullPath)})` }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                                            <Video size={48} className="text-white/20" />
                                        </div>
                                    )}

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                                            <Play size={32} className="text-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    {video.category && (
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white/80 backdrop-blur-sm">
                                                {video.category.includes(" / ") ? video.category.split(" / ").pop() : video.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors line-clamp-2">
                                        {video.name.replace(/\.[^/.]+$/, "")}
                                    </h3>
                                </div>
                            </button>
                        ))}

                        {!loading && filteredVideos.length === 0 && !error && (
                            <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                <Video size={48} className="mx-auto mb-4 opacity-20" />
                                <p>このカテゴリには動画がありません</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl">
                        {/* Close Button */}
                        <button
                            onClick={closePlayer}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        {/* Video Title */}
                        <h2 className="text-xl font-bold text-white mb-4 text-center truncate pr-12">
                            {selectedVideo.name.replace(/\.[^/.]+$/, "")}
                        </h2>

                        {/* Video Player */}
                        <video
                            ref={videoRef}
                            src={`/api/videos/stream?file=${encodeURIComponent(selectedVideo.fullPath)}`}
                            className="w-full rounded-lg bg-black aspect-video"
                            controls
                            autoPlay
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Video Info */}
                        {selectedVideo.category && (
                            <div className="mt-4 text-center text-sm text-muted-foreground">
                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary">
                                    {selectedVideo.category}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
