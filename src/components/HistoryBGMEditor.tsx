"use client";

import { useState, useEffect, useCallback } from "react";
import { Music, Plus, Trash2, GripVertical, Play, Settings, Volume2, Search } from "lucide-react";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import type { BGMSetting } from "@/types/history";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
}

interface HistoryBGMEditorProps {
    bgm?: BGMSetting;
    onChange: (bgm: BGMSetting) => void;
}

export default function HistoryBGMEditor({ bgm, onChange }: HistoryBGMEditorProps) {
    const { playSong } = usePlayer();
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSettings, setShowSettings] = useState(false);

    // 現在のBGM設定
    const [enabled, setEnabled] = useState(bgm?.enabled ?? true);
    const [autoPlay, setAutoPlay] = useState(bgm?.autoPlay ?? true);
    const [tracks, setTracks] = useState<{ songId: string; order: number }[]>(bgm?.tracks ?? []);
    const [categories, setCategories] = useState<('Original' | 'LIVE' | 'Rare')[]>(bgm?.categories ?? ['Original']);
    const [random, setRandom] = useState(bgm?.random ?? false);
    const [fadeTime, setFadeTime] = useState(bgm?.fadeTime ?? 3);

    // ローカルファイル読み込み
    useEffect(() => {
        fetch('/api/files')
            .then(res => res.json())
            .then(data => {
                setLocalFiles(data.files || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load files:", err);
                setLoading(false);
            });
    }, []);

    // 変更を親に通知 - useCallbackで安定化
    const notifyChange = useCallback(() => {
        onChange({
            enabled,
            autoPlay,
            tracks,
            categories,
            random,
            fadeTime,
        });
    }, [enabled, autoPlay, tracks, categories, random, fadeTime, onChange]);

    useEffect(() => {
        notifyChange();
    }, [notifyChange]);

    // 曲を追加
    const addTrack = (file: LocalFile) => {
        const newTrack = {
            songId: file.name,
            order: tracks.length,
        };
        setTracks([...tracks, newTrack]);
    };

    // 曲を削除
    const removeTrack = (index: number) => {
        const newTracks = tracks.filter((_, i) => i !== index);
        setTracks(newTracks.map((t, i) => ({ ...t, order: i })));
    };

    // 曲を再生プレビュー
    const previewTrack = (songId: string) => {
        const file = localFiles.find(f => f.name === songId);
        if (file) {
            const track: Track = {
                name: file.name,
                path: file.path,
                type: file.type,
                category: file.category,
                thumbnail: file.thumbnail,
            };
            playSong(track);
        }
    };

    // 検索フィルター - 拡張子でオーディオファイル判定
    const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'];
    const filteredFiles = localFiles.filter(file => {
        const matchesSearch = !searchQuery ||
            file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categories.length === 0 ||
            categories.some(cat => file.category.includes(cat));
        const isAudio = audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        return matchesSearch && matchesCategory && isAudio;
    });

    // カテゴリトグル
    const toggleCategory = (cat: 'Original' | 'LIVE' | 'Rare') => {
        setCategories(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        );
    };

    return (
        <div className="bg-card/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Music size={20} className="text-primary" />
                    BGM設定
                </h3>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="sr-only"
                        />
                        <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-white/20'
                            }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </span>
                        <span className="text-sm text-muted-foreground">有効</span>
                    </label>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                            }`}
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            {/* 設定パネル */}
            {showSettings && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">自動再生</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoPlay}
                                onChange={(e) => setAutoPlay(e.target.checked)}
                                className="sr-only"
                            />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoPlay ? 'bg-green-500' : 'bg-white/20'
                                }`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoPlay ? 'translate-x-5' : 'translate-x-1'
                                    }`} />
                            </span>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">シャッフル</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={random}
                                onChange={(e) => setRandom(e.target.checked)}
                                className="sr-only"
                            />
                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${random ? 'bg-purple-500' : 'bg-white/20'
                                }`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${random ? 'translate-x-5' : 'translate-x-1'
                                    }`} />
                            </span>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                            <Volume2 size={14} />
                            フェード時間
                        </span>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={0}
                                max={10}
                                value={fadeTime}
                                onChange={(e) => setFadeTime(parseInt(e.target.value))}
                                className="w-20"
                            />
                            <span className="text-xs text-muted-foreground w-8">{fadeTime}秒</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm block mb-2">カテゴリ</span>
                        <div className="flex gap-2">
                            {(['Original', 'LIVE', 'Rare'] as const).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${categories.includes(cat)
                                            ? cat === 'Original' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : cat === 'LIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-white/5 text-muted-foreground border border-white/10'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 現在のプレイリスト */}
            <div className="mb-4">
                <h4 className="text-sm text-muted-foreground mb-2">プレイリスト ({tracks.length}曲)</h4>
                {tracks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground/50 border border-dashed border-white/10 rounded-lg">
                        <Music size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">曲を追加してください</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tracks.map((track, index) => {
                            const file = localFiles.find(f => f.name === track.songId);
                            return (
                                <div
                                    key={`${track.songId}-${index}`}
                                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg group"
                                >
                                    <GripVertical size={16} className="text-muted-foreground/30" />
                                    <span className="w-6 text-xs text-muted-foreground">{index + 1}</span>
                                    <span className="flex-1 text-sm truncate">
                                        {file?.name.replace(/\.[^/.]+$/, "") || track.songId}
                                    </span>
                                    <button
                                        onClick={() => previewTrack(track.songId)}
                                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Play size={14} />
                                    </button>
                                    <button
                                        onClick={() => removeTrack(index)}
                                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 曲検索・追加 */}
            <div>
                <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="曲を検索..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-white/20 rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                    {loading ? (
                        <p className="text-center text-muted-foreground py-4">読み込み中...</p>
                    ) : filteredFiles.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">曲が見つかりません</p>
                    ) : (
                        filteredFiles.slice(0, 20).map(file => (
                            <button
                                key={file.path}
                                onClick={() => addTrack(file)}
                                className="w-full flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                            >
                                <Music size={14} className="text-primary/50" />
                                <span className="flex-1 text-sm truncate">
                                    {file.name.replace(/\.[^/.]+$/, "")}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${file.category.includes('LIVE') ? 'bg-green-500/20 text-green-400' :
                                        file.category.includes('Rare') ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {file.category.includes('LIVE') ? 'LIVE' :
                                        file.category.includes('Rare') ? 'Rare' : 'Original'}
                                </span>
                                <Plus size={14} className="text-muted-foreground" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
