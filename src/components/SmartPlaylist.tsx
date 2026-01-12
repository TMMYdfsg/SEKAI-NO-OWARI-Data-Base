"use client";

import { useState, useMemo } from "react";
import { Sparkles, Music, Sun, Moon, Cloud, Zap, Heart, Car, Coffee, Bed, Headphones, Shuffle, Play, ChevronRight, X } from "lucide-react";

interface Track {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail?: string | null;
}

interface SmartPlaylistProps {
    localFiles: Track[];
    onPlayPlaylist: (tracks: Track[], startIndex?: number) => void;
}

// Mood/Situation definitions with matching keywords
const smartPlaylists = [
    {
        id: 'energetic',
        name: '元気になりたい時',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        keywords: ['Dragon Night', 'RPG', 'スターライトパレード', 'Habit', 'Fight Music', '炎と森のカーニバル', 'Hey Ho', 'ANTI-HERO', 'ファンタジー'],
        description: 'アップテンポでエネルギッシュな曲'
    },
    {
        id: 'emotional',
        name: 'しっとり聴きたい時',
        icon: Heart,
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-500/20',
        borderColor: 'border-pink-500/30',
        keywords: ['眠り姫', 'silent', 'RAIN', 'サザンカ', '幻の命', '虹色の戦争', 'プレゼント', 'Diary', 'umbrella', 'tears'],
        description: 'しっとりとした感動的な曲'
    },
    {
        id: 'chill',
        name: 'リラックスしたい時',
        icon: Cloud,
        color: 'from-sky-400 to-blue-500',
        bgColor: 'bg-sky-500/20',
        borderColor: 'border-sky-500/30',
        keywords: ['scent of memory', 'Utopia', 'Eve', 'イルミネーション', 'バードマン', 'ターコイズ', '深海魚', 'Blue Flower'],
        description: '落ち着いたメロディーの曲'
    },
    {
        id: 'drive',
        name: 'ドライブ用',
        icon: Car,
        color: 'from-emerald-400 to-teal-500',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        keywords: ['Dragon Night', 'RPG', 'スターライトパレード', 'ANTI-HERO', 'Hey Ho', 'Death Disco', 'ROBO', 'バタフライエフェクト'],
        description: '運転中に最適な曲'
    },
    {
        id: 'work',
        name: '作業用BGM',
        icon: Coffee,
        color: 'from-amber-400 to-yellow-500',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        keywords: ['インスタントラジオ', 'MAGIC', '銀河街の悪夢', 'ムーンライトステーション', 'Play', 'サラバ', 'タイムマシン', '最高到達点'],
        description: '集中力を高める曲'
    },
    {
        id: 'night',
        name: '夜のリスニング',
        icon: Moon,
        color: 'from-indigo-500 to-purple-600',
        bgColor: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/30',
        keywords: ['眠り姫', 'silent', 'RAIN', '深い森', 'スノーマジックファンタジー', 'ムーンライトステーション', '深海魚', 'Eve'],
        description: '夜にぴったりな曲'
    },
    {
        id: 'morning',
        name: '朝のスタート',
        icon: Sun,
        color: 'from-orange-400 to-red-500',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        keywords: ['RPG', 'スターライトパレード', 'Hey Ho', 'Habit', '炎と森のカーニバル', 'ファンタジー', 'タイムマシン'],
        description: '朝から元気になれる曲'
    },
    {
        id: 'nostalgia',
        name: '懐かしい気分',
        icon: Headphones,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-500/20',
        borderColor: 'border-violet-500/30',
        keywords: ['幻の命', '虹色の戦争', 'インスタントラジオ', '天使と悪魔', 'ファンタジー', '不死鳥', 'yume', '世界平和'],
        description: '初期の名曲コレクション'
    }
];

export default function SmartPlaylist({ localFiles, onPlayPlaylist }: SmartPlaylistProps) {
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

    // Match files to playlists based on keywords
    const getPlaylistTracks = (playlistId: string): Track[] => {
        const playlist = smartPlaylists.find(p => p.id === playlistId);
        if (!playlist) return [];

        return localFiles.filter(file => {
            const fileName = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
            return playlist.keywords.some(keyword =>
                fileName.includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(fileName)
            );
        });
    };

    // Get all original tracks (not live remixes)
    const originalTracks = useMemo(() =>
        localFiles.filter(f => f.category === "Original"),
        [localFiles]
    );

    const handlePlayPlaylist = (playlistId: string, shuffle: boolean = false) => {
        let tracks = getPlaylistTracks(playlistId);

        // If no matching tracks, fall back to some original tracks
        if (tracks.length === 0) {
            tracks = originalTracks.slice(0, 10);
        }

        if (shuffle) {
            tracks = [...tracks].sort(() => Math.random() - 0.5);
        }

        onPlayPlaylist(tracks, 0);
    };

    const selectedPlaylistData = smartPlaylists.find(p => p.id === selectedPlaylist);
    const selectedTracks = selectedPlaylist ? getPlaylistTracks(selectedPlaylist) : [];

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <Sparkles size={20} className="text-primary" />
                <h2 className="text-lg font-bold">スマートプレイリスト</h2>
            </div>

            {/* Playlist Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {smartPlaylists.map((playlist) => {
                    const Icon = playlist.icon;
                    const trackCount = getPlaylistTracks(playlist.id).length;

                    return (
                        <button
                            key={playlist.id}
                            onClick={() => setSelectedPlaylist(playlist.id)}
                            className={`relative p-4 rounded-xl border transition-all duration-300 text-left group hover:scale-[1.02] ${playlist.bgColor} ${playlist.borderColor} hover:border-white/30`}
                        >
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${playlist.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                            <div className="relative z-10">
                                <Icon size={24} className="mb-2 text-white/80" />
                                <h3 className="font-medium text-sm">{playlist.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {trackCount > 0 ? `${trackCount}曲` : '準備中'}
                                </p>
                            </div>
                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-white/60 transition-colors" />
                        </button>
                    );
                })}
            </div>

            {/* Selected Playlist Modal */}
            {selectedPlaylist && selectedPlaylistData && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedPlaylist(null)}
                >
                    <div
                        className={`bg-neutral-900 border ${selectedPlaylistData.borderColor} rounded-2xl p-6 max-w-md w-full shadow-2xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedPlaylistData.color}`}>
                                    {(() => {
                                        const Icon = selectedPlaylistData.icon;
                                        return <Icon size={20} className="text-white" />;
                                    })()}
                                </div>
                                <div>
                                    <h3 className="font-bold">{selectedPlaylistData.name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedPlaylistData.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPlaylist(null)}
                                className="p-2 text-neutral-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Track List */}
                        <div className="max-h-64 overflow-y-auto mb-4 custom-scrollbar">
                            {selectedTracks.length > 0 ? (
                                <div className="space-y-1">
                                    {selectedTracks.map((track, index) => (
                                        <div
                                            key={track.path}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => onPlayPlaylist(selectedTracks, index)}
                                        >
                                            <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                                            <Music size={14} className="text-muted-foreground" />
                                            <span className="text-sm truncate flex-1">
                                                {track.name.replace(/\.[^/.]+$/, "")}
                                            </span>
                                            <Play size={14} className="text-primary opacity-0 group-hover:opacity-100" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Music size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">該当する曲が見つかりません</p>
                                    <p className="text-xs mt-1">音楽ファイルを追加してください</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedTracks.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePlayPlaylist(selectedPlaylist, false)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r ${selectedPlaylistData.color} text-white font-medium hover:opacity-90 transition-opacity`}
                                >
                                    <Play size={16} />
                                    再生
                                </button>
                                <button
                                    onClick={() => handlePlayPlaylist(selectedPlaylist, true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <Shuffle size={16} />
                                    シャッフル
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
