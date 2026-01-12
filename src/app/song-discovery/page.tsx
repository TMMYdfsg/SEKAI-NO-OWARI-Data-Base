"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Disc, Radio, Calendar, MapPin, Music, Sparkles } from "lucide-react";
import { albums } from "@/data/discography";
import { findAlbumBySong, getSongPerformances, lyricsCommands } from "@/lib/secret-commands";
import { usePlayer, Track } from "@/contexts/PlayerContext";

type LocalFile = {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
};

function SongDiscoveryContent() {
    const searchParams = useSearchParams();
    const songTitle = searchParams.get("song") || "";
    const description = searchParams.get("desc") || "";
    const albumId = searchParams.get("album") || "";

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
            .catch(() => setLoading(false));
    }, []);

    // Find the album for this song
    const album = useMemo(() => {
        if (albumId) {
            return albums.find(a => a.id === albumId);
        }
        return findAlbumBySong(songTitle);
    }, [songTitle, albumId]);

    // Get performances
    const performances = useMemo(() => getSongPerformances(songTitle), [songTitle]);

    // Find local file for this song
    const localFile = useMemo(() => {
        return localFiles.find(f =>
            f.name.toLowerCase().includes(songTitle.toLowerCase())
        );
    }, [localFiles, songTitle]);

    // Auto-play the song when page loads
    useEffect(() => {
        if (localFile && !loading) {
            const track: Track = {
                name: localFile.name,
                path: localFile.path,
                type: localFile.type,
                category: localFile.category,
                thumbnail: localFile.thumbnail,
                album: album?.title,
            };
            playSong(track);
        }
    }, [localFile, loading, album]);

    // Get command info
    const commandInfo = useMemo(() =>
        lyricsCommands.find(c => c.songTitle === songTitle),
        [songTitle]
    );

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-950/50 via-background to-background">
            {/* Magic particles effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-4xl mx-auto relative">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>ホームに戻る</span>
                </Link>

                {/* Header with discovery message */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Sparkles size={32} className="text-purple-400 animate-pulse" />
                        <span className="text-purple-300/70 text-sm tracking-widest">SECRET DISCOVERED</span>
                        <Sparkles size={32} className="text-purple-400 animate-pulse" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold font-serif bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-4">
                        {songTitle}
                    </h1>
                    {description && (
                        <p className="text-xl text-white/60 italic">
                            {description}
                        </p>
                    )}
                </div>

                {/* Play Button */}
                {localFile && (
                    <div className="flex justify-center mb-12">
                        <button
                            onClick={() => {
                                const track: Track = {
                                    name: localFile.name,
                                    path: localFile.path,
                                    type: localFile.type,
                                    category: localFile.category,
                                    thumbnail: localFile.thumbnail,
                                    album: album?.title,
                                };
                                playSong(track);
                            }}
                            className="group flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full hover:border-purple-500/50 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                        >
                            <Play size={28} className="text-purple-300 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-medium text-white">再生中...</span>
                        </button>
                    </div>
                )}

                {/* Album Info */}
                {album && (
                    <div className="mb-12">
                        <h2 className="text-sm font-medium text-purple-300/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Disc size={16} />
                            収録アルバム
                        </h2>
                        <Link
                            href={`/discography/${album.id}`}
                            className="block bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                                    <Disc size={40} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {album.title}
                                    </h3>
                                    <p className="text-white/50 flex items-center gap-2 mt-1">
                                        <Calendar size={14} />
                                        {album.releaseDate}
                                    </p>
                                    <p className="text-white/40 text-sm mt-2">
                                        {album.tracks.length} tracks
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Live Performances */}
                {performances.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-sm font-medium text-blue-300/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Radio size={16} />
                            演奏されたライブ ({performances.length}公演)
                        </h2>
                        <div className="grid gap-3">
                            {performances.map((tour, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white group-hover:text-blue-300 transition-colors">
                                            {tour}
                                        </p>
                                    </div>
                                    <Link
                                        href="/history"
                                        className="text-xs text-blue-400/50 hover:text-blue-400 transition-colors"
                                    >
                                        詳細 →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Commands */}
                <div className="mt-16 pt-8 border-t border-white/10">
                    <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Music size={16} />
                        他の秘密のコマンド
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {lyricsCommands.filter(c => c.songTitle !== songTitle).slice(0, 5).map((cmd, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/40"
                            >
                                &quot;{cmd.command.slice(0, 10)}...&quot;
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-white/30 mt-4">
                        💡 メニューの隠し入力欄に歌詞の一部を入力してみてください
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SongDiscoveryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SongDiscoveryContent />
        </Suspense>
    );
}
