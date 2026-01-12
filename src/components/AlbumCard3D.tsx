"use client";

import { useState } from "react";
import Link from "next/link";
import { Disc3, Calendar, Play, ExternalLink, AlertCircle, RotateCcw, Star, Clock, Music } from "lucide-react";
import type { Discography } from "@/types/discography";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail?: string | null;
}

interface AlbumCard3DProps {
    album: Discography;
    localFiles: LocalFile[];
    onPlayTrack: (trackTitle: string, albumTitle: string) => void;
    findLocalFile: (trackTitle: string) => LocalFile | null;
}

export default function AlbumCard3D({ album, localFiles, onPlayTrack, findLocalFile }: AlbumCard3DProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const allTracks = album.discs.flatMap(disc => disc.tracks);

    // Calculate total duration if available
    const totalDuration = allTracks.reduce((acc, track) => acc + (track.duration || 0), 0);
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins}分`;
    };

    return (
        <div
            className="relative h-[480px] perspective-1000"
            style={{ perspective: "1000px" }}
        >
            <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""
                    }`}
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >
                {/* Front Side - Album Cover */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Completion warning */}
                    {!album.isComplete && (
                        <div className="absolute top-4 left-4 z-10 p-1.5 bg-amber-500/90 rounded-full" title="未入力項目あり">
                            <AlertCircle size={16} className="text-white" />
                        </div>
                    )}

                    {/* Flip Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all hover:bg-primary/70 hover:rotate-180"
                        title="裏面を見る"
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                    >
                        <RotateCcw size={16} className="text-white" />
                    </button>

                    {/* Album Cover */}
                    <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-secondary/20">
                        {album.coverImage ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                                style={{ backgroundImage: `url(${album.coverImage})` }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Disc3 size={80} className="text-white/10 animate-spin-slow" />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pt-24">
                            <h2 className="text-2xl font-bold font-serif text-white drop-shadow-lg">{album.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-white/70 mt-2">
                                <Calendar size={14} />
                                <span>{album.releaseDate || "日付未設定"}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ml-auto border ${album.type === "Single" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                                    album.type === "Video" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                                        album.type === "Compilation" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                                            "bg-white/20 text-white border-white/10"
                                    }`}>
                                    {album.type}
                                </span>
                            </div>
                        </div>

                        {/* Favorite Badge */}
                        {album.isFavorite && (
                            <div className="absolute top-4 left-4 z-10 p-1.5 bg-yellow-500/90 rounded-full">
                                <Star size={16} className="text-white fill-white" />
                            </div>
                        )}
                    </div>

                    {/* Track Preview */}
                    <div className="p-4 bg-card/95">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Disc3 size={12} />
                                {allTracks.length} Tracks
                            </span>
                            {totalDuration > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDuration(totalDuration)}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-white/60 line-clamp-2">
                            {allTracks.slice(0, 3).map(t => t.title).join(" / ")}
                            {allTracks.length > 3 && ` +${allTracks.length - 3}曲`}
                        </div>
                    </div>
                </div>

                {/* Back Side - Track List & Details */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg rotate-y-180"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold font-serif">{album.title}</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                title="表面に戻る"
                            >
                                <RotateCcw size={16} className="text-white" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{album.releaseDate}</p>
                    </div>

                    {/* Track List */}
                    <div className="p-4 max-h-[280px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Music size={12} />
                            Tracklist
                        </h4>
                        <div className="space-y-1">
                            {allTracks.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">トラックリストが未設定です</p>
                            ) : (
                                allTracks.map((track) => {
                                    const hasLocalFile = findLocalFile(track.title) !== null;
                                    return (
                                        <button
                                            key={track.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPlayTrack(track.title, album.title);
                                            }}
                                            className={`w-full flex items-center gap-3 text-sm text-left py-1.5 px-2 rounded transition-colors group/track ${hasLocalFile
                                                ? "hover:bg-primary/20 hover:text-primary cursor-pointer"
                                                : "text-white/40 cursor-not-allowed"
                                                }`}
                                            disabled={!hasLocalFile}
                                        >
                                            <span className="text-white/30 font-mono text-xs w-5 shrink-0">
                                                {String(track.trackNumber).padStart(2, '0')}
                                            </span>
                                            <span className="leading-tight flex-1 truncate">{track.title}</span>
                                            {hasLocalFile && (
                                                <Play size={14} className="opacity-0 group-hover/track:opacity-100 transition-opacity shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Description & Notes */}
                    {(album.description || album.productionNotes) && (
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            {album.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {album.description}
                                </p>
                            )}
                            {album.productionNotes && (
                                <p className="text-xs text-primary/70 italic line-clamp-2">
                                    📝 {album.productionNotes}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {album.tags && album.tags.length > 0 && (
                        <div className="px-4 pb-4">
                            <div className="flex flex-wrap gap-1">
                                {album.tags.slice(0, 4).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary/70 border border-primary/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detail Link */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-card to-transparent">
                        <Link
                            href={`/discography/${album.id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={14} />
                            詳細を見る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
