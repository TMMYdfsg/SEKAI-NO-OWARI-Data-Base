"use client";

import { usePlayer, useCurrentTrack } from "@/contexts/PlayerContext";
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
    Volume2, VolumeX, ChevronUp, ChevronDown, Music2, Maximize2, Minimize2,
    ListMusic, Mic2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AudioVisualizer from "./AudioVisualizer";

function formatTime(seconds: number): string {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTrackName(name: string): string {
    return name.replace(/\.[^/.]+$/, "");
}

export default function GlobalPlayer() {
    const {
        isPlaying,
        isShuffle,
        isLoop,
        isLoopAll,
        currentTime,
        duration,
        volume,
        togglePlay,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleLoop,
        seek,
        setVolume,
        playlist,
        audioRef
    } = usePlayer();

    const currentTrack = useCurrentTrack();
    const [isExpanded, setIsExpanded] = useState(false); // Mobile playlist expansion
    const [isImmersive, setIsImmersive] = useState(false); // Full screen immersive mode
    const [showVolume, setShowVolume] = useState(false);
    const [showLyrics, setShowLyrics] = useState(true); // Toggle between Visualizer/Lyrics in immersive

    // Data state
    const [discographyCovers, setDiscographyCovers] = useState<Record<string, string>>({});
    const [customCovers, setCustomCovers] = useState<Record<string, string>>({});
    const [lyrics, setLyrics] = useState<string>("");

    // Refs for auto-scroll
    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    const CUSTOM_COVERS_KEY = "sekaowa_song_custom_covers";
    const SONGS_LYRICS_KEY = "sekaowa_songs_lyrics";

    useEffect(() => {
        // Load custom covers
        const savedCovers = localStorage.getItem(CUSTOM_COVERS_KEY);
        if (savedCovers) {
            try {
                setCustomCovers(JSON.parse(savedCovers));
            } catch (e) {
                console.error("Failed to load custom covers", e);
            }
        }

        // Load discography covers
        fetch('/api/db/discography')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const covers: Record<string, string> = {};
                    const coverTypes: Record<string, string> = {};

                    data.forEach((album: any) => {
                        if (album.coverImage) {
                            const isSingle = album.type === 'Single';
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

    // Load lyrics when track changes
    useEffect(() => {
        if (!currentTrack) {
            setLyrics("");
            return;
        }

        const savedLyricsJson = localStorage.getItem(SONGS_LYRICS_KEY);
        if (savedLyricsJson) {
            try {
                const parsedLyrics = JSON.parse(savedLyricsJson);
                const trackLyrics = parsedLyrics[currentTrack.path];
                setLyrics(trackLyrics || "");
            } catch (e) {
                console.error("Failed to load lyrics", e);
                setLyrics("");
            }
        } else {
            setLyrics("");
        }
    }, [currentTrack]);

    // Format lyrics for display
    const formattedLyrics = lyrics ? lyrics.split('\n') : ["No lyrics available"];

    // Auto-scroll lyrics (Simple linear interpolation based on progress)
    useEffect(() => {
        if (isImmersive && showLyrics && lyricsContainerRef.current && duration > 0) {
            const container = lyricsContainerRef.current;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            if (scrollHeight > 0) {
                const progress = currentTime / duration;
                // Add some padding/offset so it doesn't scroll to the very end too quickly
                // or start scrolling immediately for long intros.
                // This is a naive implementation; proper sync requires LRC data.
                const targetScroll = scrollHeight * progress;

                container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentTime, duration, isImmersive, showLyrics]);

    // Don't render if no track
    if (!currentTrack && playlist.length === 0) {
        return null;
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        seek(percentage * duration);
    };

    // Determine cover image
    let thumbnailUrl = null;
    if (currentTrack) {
        if (customCovers[currentTrack.path]) {
            thumbnailUrl = customCovers[currentTrack.path];
        } else {
            const titleLower = formatTrackName(currentTrack.name).toLowerCase();
            if (discographyCovers[titleLower]) {
                thumbnailUrl = discographyCovers[titleLower];
            } else if (currentTrack.thumbnail) {
                thumbnailUrl = `/api/media?file=${encodeURIComponent(currentTrack.thumbnail)}`;
            }
        }
    }

    // Immersive Mode Render
    if (isImmersive) {
        return (
            <div className="fixed inset-0 z-[100] bg-background text-white flex flex-col overflow-hidden">
                {/* Background Blur */}
                <div
                    className="absolute inset-0 z-0 opacity-30 bg-cover bg-center blur-3xl scale-125 transition-all duration-1000"
                    style={{ backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none' }}
                />
                <div className="absolute inset-0 z-0 bg-black/60" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6">
                    <button
                        onClick={() => setIsImmersive(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <Minimize2 size={24} />
                    </button>
                    <div className="text-center">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                            IMMERSIVE MODE
                        </span>
                    </div>
                    <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className={`p-2 rounded-full transition-colors ${showLyrics ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20'}`}
                        title="Toggle Lyrics"
                    >
                        {showLyrics ? <Mic2 size={24} /> : <ListMusic size={24} />}
                    </button>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 lg:p-12 min-h-0">
                    {/* Visualizer / Artwork Area */}
                    <div className={`flex flex-col items-center justify-center w-full ${showLyrics ? 'lg:w-1/2 h-1/2 lg:h-full' : 'h-full'}`}>
                        <div className="aspect-square w-full max-w-[300px] lg:max-w-[500px] relative rounded-2xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Music2 size={64} className="text-white/20" />
                                </div>
                            )}
                        </div>

                        {/* Always show visualizer in immersive mode, positioned below art or integrated */}
                        <div className="w-full max-w-[600px] h-[100px]">
                            <AudioVisualizer
                                audioElement={audioRef.current}
                                isPlaying={isPlaying}
                                trackTitle={formatTrackName(currentTrack?.name || "")}
                            />
                        </div>
                    </div>

                    {/* Lyrics Area */}
                    {showLyrics && (
                        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div
                                ref={lyricsContainerRef}
                                className="w-full h-full overflow-y-auto custom-scrollbar px-4 mask-image-gradient py-12"
                            >
                                {lyrics ? (
                                    <div className="space-y-6">
                                        {formattedLyrics.map((line, i) => (
                                            <p key={i} className="text-lg lg:text-2xl font-serif text-white/90 leading-relaxed transition-opacity duration-300 hover:text-white hover:scale-105 origin-left">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <Mic2 size={48} className="mb-4" />
                                        <p>歌詞データがありません</p>
                                        <p className="text-sm mt-2">詳細編集から歌詞を追加できます</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls (Immersive) */}
                <div className="relative z-10 p-8 pb-12 w-full max-w-4xl mx-auto space-y-6">
                    {/* Track Info */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif mb-1">{currentTrack ? formatTrackName(currentTrack.name) : ""}</h2>
                        <p className="text-muted-foreground">{currentTrack?.category}</p>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                        <div
                            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute h-full bg-primary rounded-full group-hover:bg-primary/80 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${progress}%`, marginLeft: '-6px' }}
                            />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10">{formatTime(duration)}</span>
                    </div>

                    {/* Main Buttons */}
                    <div className="flex items-center justify-center gap-8">
                        <button onClick={toggleShuffle} className={`${isShuffle ? "text-primary" : "text-white/40"} hover:text-white transition-colors`}><Shuffle size={20} /></button>
                        <button onClick={prevTrack} className="text-white hover:scale-110 transition-transform"><SkipBack size={32} /></button>
                        <button
                            onClick={togglePlay}
                            className="h-16 w-16 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={nextTrack} className="text-white hover:scale-110 transition-transform"><SkipForward size={32} /></button>
                        <button onClick={toggleLoop} className={`${isLoop || isLoopAll ? "text-primary" : "text-white/40"} hover:text-white transition-colors`}><Repeat size={20} /></button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Mini Player Render
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10">
            {/* Progress bar (clickable) */}
            <div
                className="h-1 bg-white/10 cursor-pointer group"
                onClick={handleSeek}
            >
                <div
                    className="h-full bg-primary transition-all duration-150 group-hover:bg-primary/80"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4">
                    {/* Track Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-lg bg-white/10 overflow-hidden shrink-0 relative group">
                            {thumbnailUrl ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Music2 size={20} className="text-white/30" />
                                </div>
                            )}
                            <div
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={() => setIsImmersive(true)}
                            >
                                <Maximize2 size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate cursor-pointer hover:underline" onClick={() => setIsImmersive(true)}>
                                {currentTrack ? formatTrackName(currentTrack.name) : "再生待機中..."}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {currentTrack?.category || ""}
                            </div>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleShuffle}
                            className={`p-2 rounded-full transition-colors ${isShuffle ? "text-primary bg-primary/20" : "text-white/60 hover:text-white"
                                }`}
                            title="シャッフル"
                        >
                            <Shuffle size={18} />
                        </button>

                        <button
                            onClick={prevTrack}
                            className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
                            title="前の曲"
                        >
                            <SkipBack size={22} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="p-3 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors shadow-lg"
                            title={isPlaying ? "一時停止" : "再生"}
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button
                            onClick={nextTrack}
                            className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
                            title="次の曲"
                        >
                            <SkipForward size={22} />
                        </button>

                        <button
                            onClick={toggleLoop}
                            className={`p-2 rounded-full transition-colors ${isLoop || isLoopAll ? "text-primary bg-primary/20" : "text-white/60 hover:text-white"
                                }`}
                            title={isLoop ? "1曲リピート" : isLoopAll ? "全曲リピート" : "リピート"}
                        >
                            {isLoop ? <Repeat1 size={18} /> : <Repeat size={18} />}
                        </button>
                    </div>

                    {/* Time & Volume & Expand */}
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="text-xs text-muted-foreground hidden sm:block">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setShowVolume(!showVolume)}
                                className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
                            >
                                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>

                            {showVolume && (
                                <div className="absolute bottom-full right-0 mb-2 p-3 bg-black/90 rounded-lg border border-white/10">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-24 accent-primary"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsImmersive(true)}
                            className="p-2 rounded-full text-white/60 hover:text-primary transition-colors"
                            title="Immersive Mode"
                        >
                            <Maximize2 size={18} />
                        </button>

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-full text-white/60 hover:text-white transition-colors lg:hidden"
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                    </div>
                </div>

                {/* Expanded Playlist View (Mobile) */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 max-h-64 overflow-y-auto">
                        <h4 className="text-xs text-muted-foreground mb-2">プレイリスト ({playlist.length}曲)</h4>
                        {playlist.map((track, idx) => (
                            <div
                                key={track.path}
                                className={`text-sm py-2 px-2 rounded cursor-pointer transition-colors ${currentTrack?.path === track.path
                                    ? "bg-primary/20 text-primary"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {formatTrackName(track.name)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
