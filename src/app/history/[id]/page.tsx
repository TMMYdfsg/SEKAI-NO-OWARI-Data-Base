"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Save, Trash2, Edit3, X, Plus, Check,
    Music, Star, Mic2, Tv, Radio, Globe, BookOpen, Sparkles, Calendar as CalendarIcon,
    Volume2, ExternalLink, Eye, EyeOff, MessageSquare, MapPin, Play, Clock,
    Image as ImageIcon
} from "lucide-react";
import type { HistoryEvent, EventType, SetlistItem, BGMSetting } from "@/types/history";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import HistoryBGMEditor from "@/components/HistoryBGMEditor";
import FavoriteButton, { FavoriteReason } from "@/components/FavoriteButton";
import SetlistEditor from "@/components/SetlistEditor";

// Event type icons
const eventTypeIcons: Record<EventType, React.ReactNode> = {
    Live: <Mic2 size={16} className="text-red-400" />,
    Release: <Music size={16} className="text-green-400" />,
    TV: <Tv size={16} className="text-blue-400" />,
    Radio: <Radio size={16} className="text-purple-400" />,
    Magazine: <BookOpen size={16} className="text-amber-400" />,
    Web: <Globe size={16} className="text-cyan-400" />,
    Milestone: <Star size={16} className="text-yellow-400" />,
    Formation: <Sparkles size={16} className="text-pink-400" />,
    Other: <CalendarIcon size={16} className="text-gray-400" />,
};

const eventTypeOptions: { value: EventType; label: string }[] = [
    { value: "Live", label: "ライブ" },
    { value: "Release", label: "リリース" },
    { value: "TV", label: "テレビ" },
    { value: "Radio", label: "ラジオ" },
    { value: "Magazine", label: "雑誌" },
    { value: "Web", label: "Web" },
    { value: "Milestone", label: "マイルストーン" },
    { value: "Formation", label: "結成" },
    { value: "Other", label: "その他" },
];

// Format date for display
function formatDate(date: { year: number; month?: number; day?: number }): string {
    if (date.day && date.month) {
        return `${date.year}年${date.month}月${date.day}日`;
    }
    if (date.month) {
        return `${date.year}年${date.month}月`;
    }
    return `${date.year}年`;
}

type LocalFile = {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
};

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const { playSong, playPlaylist } = usePlayer();

    const [event, setEvent] = useState<HistoryEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
    const [editMonth, setEditMonth] = useState<number | "">("");
    const [editDay, setEditDay] = useState<number | "">("");
    const [editEventTypes, setEditEventTypes] = useState<EventType[]>([]);
    const [editDetailsOfficial, setEditDetailsOfficial] = useState("");
    const [editDetailsBehind, setEditDetailsBehind] = useState("");
    const [editDetailsMemo, setEditDetailsMemo] = useState("");
    const [editTags, setEditTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [editBgm, setEditBgm] = useState<BGMSetting | undefined>(undefined);
    const [editSetlist, setEditSetlist] = useState<SetlistItem[]>([]);
    const [editVenue, setEditVenue] = useState("");
    const [editTourName, setEditTourName] = useState("");
    const [editOpenTime, setEditOpenTime] = useState("");
    const [editStartTime, setEditStartTime] = useState("");
    const [editBackgroundImage, setEditBackgroundImage] = useState("");
    const [isDraggingBackground, setIsDraggingBackground] = useState(false);
    const [editImagePaths, setEditImagePaths] = useState<string[]>([]);
    const [newImagePath, setNewImagePath] = useState("");
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    // Layer visibility
    const [showOfficial, setShowOfficial] = useState(true);
    const [showBehind, setShowBehind] = useState(true);
    const [showMemo, setShowMemo] = useState(true);

    // Load event
    useEffect(() => {
        fetch(`/api/db/history?id=${eventId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setEvent(null);
                } else {
                    setEvent(data);
                    initEditState(data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load event:", err);
                setLoading(false);
            });
    }, [eventId]);

    // Load local files for BGM
    useEffect(() => {
        fetch('/api/files')
            .then(res => res.json())
            .then(data => setLocalFiles(data.files || []))
            .catch(console.error);
    }, []);

    // Auto-play BGM when event loads
    useEffect(() => {
        if (!event || !localFiles.length || isEditing) return;
        if (!event.bgm || !event.bgm.enabled || !event.bgm.autoPlay) return;
        if (event.bgm.tracks.length === 0) return;

        // Build playlist from BGM tracks
        const playlist: Track[] = event.bgm.tracks
            .sort((a, b) => a.order - b.order)
            .map(t => {
                const file = localFiles.find(f => f.name === t.songId);
                if (!file) return null;
                return {
                    name: file.name,
                    path: file.path,
                    type: file.type,
                    category: file.category,
                    thumbnail: file.thumbnail || undefined,
                } as Track;
            })
            .filter((t): t is Track => t !== null);

        if (playlist.length > 0) {
            // Shuffle if random is enabled
            if (event.bgm.random) {
                for (let i = playlist.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
                }
            }
            playPlaylist(playlist, 0);
        }
    }, [event, localFiles, isEditing, playPlaylist]);

    // Memoize song suggestions
    const songSuggestions = useMemo(() =>
        localFiles.map(f => f.name.replace(/\.[^/.]+$/, "")),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [localFiles]
    );

    const initEditState = (e: HistoryEvent) => {
        setEditTitle(e.title);
        setEditYear(e.date.year);
        setEditMonth(e.date.month || "");
        setEditDay(e.date.day || "");
        setEditEventTypes(e.eventTypes);
        setEditDetailsOfficial(e.details?.official || "");
        setEditDetailsBehind(e.details?.behindTheScenes || "");
        setEditDetailsMemo(e.details?.personalMemo || "");
        setEditTags(e.tags || []);
        setEditBgm(e.bgm);
        setEditSetlist(e.liveInfo?.setlist || []);
        setEditVenue(e.liveInfo?.venue?.name || "");
        setEditTourName(e.liveInfo?.tourName || "");
        setEditOpenTime(e.liveInfo?.openTime || "");
        setEditStartTime(e.liveInfo?.startTime || "");
        setEditBackgroundImage(e.backgroundImage || "");
        setEditImagePaths(e.imagePaths || []);
    };

    // Toggle event type
    const toggleEventType = (type: EventType) => {
        setEditEventTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    // Tags
    const addTag = () => {
        if (newTag.trim() && !editTags.includes(newTag.trim().toLowerCase())) {
            setEditTags([...editTags, newTag.trim().toLowerCase()]);
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setEditTags(editTags.filter((t) => t !== tag));
    };

    // Image handlers
    const addImagePath = () => {
        if (newImagePath.trim() && !editImagePaths.includes(newImagePath.trim())) {
            setEditImagePaths([...editImagePaths, newImagePath.trim()]);
            setNewImagePath("");
        }
    };

    const removeImagePath = (index: number) => {
        setEditImagePaths(editImagePaths.filter((_, i) => i !== index));
    };

    const handleImageDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(true);
    };

    const handleImageDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);
    };

    const handleImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);

        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
        if (textData) {
            let cleanPath = textData.replace('file:///', '').replace('file://', '');
            cleanPath = decodeURIComponent(cleanPath);
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                setEditImagePaths([...editImagePaths, cleanPath]);
                return;
            }
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setEditImagePaths([...editImagePaths, event.target.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    // Background Image handlers
    const handleBgDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingBackground(true);
    };

    const handleBgDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingBackground(false);
    };

    const handleBgDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingBackground(false);

        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
        if (textData) {
            let cleanPath = textData.replace('file:///', '').replace('file://', '');
            cleanPath = decodeURIComponent(cleanPath);
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                setEditBackgroundImage(cleanPath);
                return;
            }
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setEditBackgroundImage(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    // Save
    const handleSave = async () => {
        if (!editTitle.trim()) {
            alert("タイトルは必須です");
            return;
        }

        setSaving(true);

        const updates: Partial<HistoryEvent> = {
            id: eventId,
            title: editTitle.trim(),
            date: {
                year: editYear,
                ...(editMonth ? { month: editMonth as number } : {}),
                ...(editDay ? { day: editDay as number } : {}),
            },
            eventTypes: editEventTypes,
            details: {
                official: editDetailsOfficial || undefined,
                behindTheScenes: editDetailsBehind || undefined,
                personalMemo: editDetailsMemo || undefined,
            },
            tags: editTags,
            bgm: editBgm,
            backgroundImage: editBackgroundImage || undefined,
            imagePaths: editImagePaths.length > 0 ? editImagePaths : undefined,
            liveInfo: editEventTypes.includes("Live") ? {
                ...event?.liveInfo,
                setlist: editSetlist,
                venue: { name: editVenue },
                tourName: editTourName,
                openTime: editOpenTime || undefined,
                startTime: editStartTime || undefined,
            } : undefined,
        };

        try {
            const res = await fetch("/api/db/history", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (res.ok) {
                const updated = await res.json();
                setEvent(updated);
                setIsEditing(false);
            } else {
                const error = await res.json();
                alert(`保存に失敗しました: ${error.error}`);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("保存中にエラーが発生しました");
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!confirm("このヒストリーを削除しますか？")) return;

        try {
            const res = await fetch(`/api/db/history?id=${eventId}&soft=true`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/history");
            } else {
                alert("削除に失敗しました");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("削除中にエラーが発生しました");
        }
    };

    // Play BGM
    const playBgm = () => {
        if (event?.bgm?.tracks && event.bgm.tracks.length > 0) {
            const songId = event.bgm.tracks[0].songId;
            const file = localFiles.find(f => f.name.includes(songId));
            if (file) {
                const track: Track = {
                    name: file.name,
                    path: file.path,
                    type: file.type,
                    category: file.category,
                    thumbnail: file.thumbnail || undefined,
                };
                playSong(track);
            }
        }
    };

    // Play Setlist
    const playSetlist = () => {
        if (!event?.liveInfo?.setlist) return;

        const songs = event.liveInfo.setlist.filter(item => item.type === 'song' && item.songTitle);
        if (songs.length === 0) {
            alert("再生可能な曲がありません");
            return;
        }

        const playlist: Track[] = songs.map(song => {
            // Fuzzy match logic: Try to find file containing song title
            // This is simple for now, can be improved with dedicated matching UI
            const match = localFiles.find(f =>
                f.name.toLowerCase().includes(song.songTitle!.toLowerCase()) ||
                song.songTitle!.toLowerCase().includes(f.name.replace(/\.[^/.]+$/, "").toLowerCase())
            );

            if (match) {
                return {
                    name: match.name,
                    path: match.path,
                    type: match.type,
                    category: match.category,
                    thumbnail: match.thumbnail || undefined,
                } as Track;
            }
            return null;
        }).filter((t): t is Track => t !== null);

        if (playlist.length > 0) {
            playPlaylist(playlist, 0);
        } else {
            alert("一致する音楽ファイルが見つかりませんでした。ファイル名と曲名が一致しているか確認してください。");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="animate-pulse text-primary">読み込み中...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-muted-foreground mb-4">
                        ヒストリーが見つかりません
                    </h1>
                    <Link href="/history" className="text-primary hover:underline">
                        ヒストリーに戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: event.backgroundImage
                    ? `url(${event.backgroundImage.startsWith('data:') ? event.backgroundImage : `/api/gallery?file=${encodeURIComponent(event.backgroundImage)}`})`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" style={{ zIndex: 0 }} />

            <div className="max-w-3xl mx-auto relative" style={{ zIndex: 1 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={20} />
                        ヒストリーに戻る
                    </Link>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        initEditState(event);
                                    }}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? "保存中..." : "保存"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
                                >
                                    <Edit3 size={16} />
                                    編集
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div className="space-y-6">
                    {/* Date & Title */}
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        {isEditing ? (
                            <>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-1">年</label>
                                        <input
                                            type="number"
                                            value={editYear}
                                            onChange={(e) => setEditYear(parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-1">月</label>
                                        <input
                                            type="number"
                                            value={editMonth}
                                            onChange={(e) => setEditMonth(e.target.value ? parseInt(e.target.value) : "")}
                                            min={1}
                                            max={12}
                                            placeholder="--"
                                            className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-1">日</label>
                                        <input
                                            type="number"
                                            value={editDay}
                                            onChange={(e) => setEditDay(e.target.value ? parseInt(e.target.value) : "")}
                                            min={1}
                                            max={31}
                                            placeholder="--"
                                            className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-xl font-bold"
                                />
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground mb-2">{formatDate(event.date)}</p>
                                <h1 className="text-3xl font-bold font-serif">{event.title}</h1>
                            </>
                        )}
                    </div>

                    {/* Background Image */}
                    {isEditing && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                            <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                <ImageIcon size={14} />
                                背景画像
                            </h2>
                            <div className="flex gap-4">
                                {/* Preview */}
                                <div
                                    className={`w-32 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${isDraggingBackground ? 'border-primary bg-primary/20 scale-105' : 'border-white/20 bg-white/5'
                                        }`}
                                    onDragOver={handleBgDragOver}
                                    onDragLeave={handleBgDragLeave}
                                    onDrop={handleBgDrop}
                                >
                                    {editBackgroundImage ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${editBackgroundImage.startsWith('data:') ? editBackgroundImage : `/api/gallery?file=${encodeURIComponent(editBackgroundImage)}`})` }}
                                        />
                                    ) : (
                                        <ImageIcon size={24} className={`${isDraggingBackground ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                        画像をドラッグ＆ドロップ、または下にパスを入力
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editBackgroundImage}
                                            onChange={(e) => setEditBackgroundImage(e.target.value)}
                                            placeholder="背景画像パス..."
                                            className="flex-1 px-3 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                        {editBackgroundImage && (
                                            <button
                                                type="button"
                                                onClick={() => setEditBackgroundImage("")}
                                                className="px-3 py-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Types */}
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-sm text-muted-foreground mb-3">イベント種別</h2>
                        {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {eventTypeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleEventType(option.value)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm transition-colors ${editEventTypes.includes(option.value)
                                            ? "bg-primary/20 border-primary/50 text-primary"
                                            : "bg-background border-white/20 text-muted-foreground hover:border-white/40"
                                            }`}
                                    >
                                        {eventTypeIcons[option.value]}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {event.eventTypes.map((type) => (
                                    <span
                                        key={type}
                                        className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm"
                                    >
                                        {eventTypeIcons[type]}
                                        {eventTypeOptions.find(o => o.value === type)?.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details (Layered) */}
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">詳細</h2>
                            {!isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowOfficial(!showOfficial)}
                                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${showOfficial ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-muted-foreground"}`}
                                    >
                                        {showOfficial ? <Eye size={12} /> : <EyeOff size={12} />} 公式
                                    </button>
                                    <button
                                        onClick={() => setShowBehind(!showBehind)}
                                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${showBehind ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-muted-foreground"}`}
                                    >
                                        {showBehind ? <Eye size={12} /> : <EyeOff size={12} />} 裏話
                                    </button>
                                    <button
                                        onClick={() => setShowMemo(!showMemo)}
                                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${showMemo ? "bg-pink-500/20 text-pink-400" : "bg-white/5 text-muted-foreground"}`}
                                    >
                                        {showMemo ? <Eye size={12} /> : <EyeOff size={12} />} メモ
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                                        公式情報
                                    </label>
                                    <textarea
                                        value={editDetailsOfficial}
                                        onChange={(e) => setEditDetailsOfficial(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-500" />
                                        裏話・考察
                                    </label>
                                    <textarea
                                        value={editDetailsBehind}
                                        onChange={(e) => setEditDetailsBehind(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-pink-500" />
                                        個人メモ
                                    </label>
                                    <textarea
                                        value={editDetailsMemo}
                                        onChange={(e) => setEditDetailsMemo(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {showOfficial && event.details?.official && (
                                    <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                                        <span className="text-xs text-blue-400 mb-1 block">公式情報</span>
                                        <p className="text-foreground whitespace-pre-wrap">{event.details.official}</p>
                                    </div>
                                )}
                                {showBehind && event.details?.behindTheScenes && (
                                    <div className="p-4 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg">
                                        <span className="text-xs text-purple-400 mb-1 block">裏話・考察</span>
                                        <p className="text-foreground whitespace-pre-wrap">{event.details.behindTheScenes}</p>
                                    </div>
                                )}
                                {showMemo && event.details?.personalMemo && (
                                    <div className="p-4 bg-pink-500/10 border-l-4 border-pink-500 rounded-r-lg">
                                        <span className="text-xs text-pink-400 mb-1 block">個人メモ</span>
                                        <p className="text-foreground whitespace-pre-wrap">{event.details.personalMemo}</p>
                                    </div>
                                )}
                                {!event.details?.official && !event.details?.behindTheScenes && !event.details?.personalMemo && (
                                    <p className="text-muted-foreground">詳細情報はありません</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Live Info */}
                    {/* Only show if editing AND 'Live' is selected, OR if viewing and 'Live' is an event type */}
                    {((isEditing && editEventTypes.includes("Live")) || (!isEditing && event.eventTypes.includes("Live"))) && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Mic2 size={20} className="text-red-400" />
                                ライブ情報
                            </h2>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-1">会場名</label>
                                            <input
                                                type="text"
                                                value={editVenue}
                                                onChange={(e) => setEditVenue(e.target.value)}
                                                placeholder="○○アリーナ"
                                                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-1">ツアー名</label>
                                            <input
                                                type="text"
                                                value={editTourName}
                                                onChange={(e) => setEditTourName(e.target.value)}
                                                placeholder="ツアー名"
                                                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-1">開場時間</label>
                                            <input
                                                type="time"
                                                value={editOpenTime}
                                                onChange={(e) => setEditOpenTime(e.target.value)}
                                                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-1">開演時間</label>
                                            <input
                                                type="time"
                                                value={editStartTime}
                                                onChange={(e) => setEditStartTime(e.target.value)}
                                                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <SetlistEditor
                                            setlist={editSetlist}
                                            onChange={setEditSetlist}
                                            suggestions={songSuggestions}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {event.liveInfo && (
                                        <>
                                            {event.liveInfo.venue && (
                                                <p className="text-foreground mb-2 flex items-center gap-2">
                                                    <MapPin size={16} className="text-red-400" />
                                                    {event.liveInfo.venue.name}
                                                    {event.liveInfo.venue.city && ` (${event.liveInfo.venue.city})`}
                                                </p>
                                            )}

                                            {event.liveInfo.tourName && (
                                                <p className="text-muted-foreground mb-2 ml-6 text-sm">
                                                    ツアー: {event.liveInfo.tourName}
                                                </p>
                                            )}

                                            {(event.liveInfo.openTime || event.liveInfo.startTime) && (
                                                <p className="text-muted-foreground mb-4 ml-6 text-sm flex items-center gap-4">
                                                    {event.liveInfo.openTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            開場: {event.liveInfo.openTime}
                                                        </span>
                                                    )}
                                                    {event.liveInfo.startTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            開演: {event.liveInfo.startTime}
                                                        </span>
                                                    )}
                                                </p>
                                            )}

                                            {event.liveInfo.setlist && event.liveInfo.setlist.length > 0 && (
                                                <div className="mt-6">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-sm text-muted-foreground font-bold">セットリスト</h3>
                                                        <button
                                                            onClick={playSetlist}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-bold"
                                                        >
                                                            <Play size={12} />
                                                            セトリを再生
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1 bg-black/20 rounded-lg p-4">
                                                        {event.liveInfo.setlist.map((item, i) => (
                                                            <div key={item.id || i} className="flex items-center gap-3 text-sm py-1 border-b border-white/5 last:border-0">
                                                                <span className="text-muted-foreground w-6 text-right font-mono text-xs">
                                                                    {item.type === 'song' ? item.order : ''}
                                                                </span>

                                                                <div className="flex-1">
                                                                    {item.type === "encore" && (
                                                                        <div className="flex items-center gap-2 my-2">
                                                                            <span className="h-px bg-pink-500/50 flex-1"></span>
                                                                            <span className="text-pink-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                                                <Sparkles size={10} /> Encore
                                                                            </span>
                                                                            <span className="h-px bg-pink-500/50 flex-1"></span>
                                                                        </div>
                                                                    )}

                                                                    {/* Display content based on type */}
                                                                    {item.type !== "encore" && (
                                                                        <div className="flex items-center gap-2">
                                                                            {item.type === "mc" && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded uppercase font-bold">MC</span>}
                                                                            {item.type === "se" && <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] rounded uppercase font-bold">SE</span>}

                                                                            <span className={item.type === 'song' ? "font-medium" : "text-muted-foreground italic text-xs"}>
                                                                                {item.songTitle || item.text}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Image Gallery */}
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <ImageIcon size={14} />
                            ギャラリー
                        </h2>
                        {isEditing ? (
                            <>
                                {/* Image Grid Preview */}
                                {editImagePaths.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                        {editImagePaths.map((path, index) => (
                                            <div key={index} className="relative aspect-square bg-white/5 rounded-lg overflow-hidden group">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${path.startsWith('data:') ? path : `/api/gallery?file=${encodeURIComponent(path)}`})` }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImagePath(index)}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Drop Zone */}
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${isDraggingImage ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/20 bg-white/5 hover:border-white/40'
                                        }`}
                                    onDragOver={handleImageDragOver}
                                    onDragLeave={handleImageDragLeave}
                                    onDrop={handleImageDrop}
                                >
                                    <ImageIcon size={32} className={`mb-2 ${isDraggingImage ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {isDraggingImage ? '画像をドロップ!' : '画像をドラッグ＆ドロップ'}
                                    </p>
                                    <div className="flex gap-2 w-full max-w-md">
                                        <input
                                            type="text"
                                            value={newImagePath}
                                            onChange={(e) => setNewImagePath(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImagePath())}
                                            placeholder="または画像パスを入力..."
                                            className="flex-1 px-3 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={addImagePath}
                                            className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : event.imagePaths && event.imagePaths.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {event.imagePaths.map((path, index) => (
                                    <div key={index} className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${path.startsWith('data:') ? path : `/api/gallery?file=${encodeURIComponent(path)}`})` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">画像はありません</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-sm text-muted-foreground mb-3">タグ</h2>
                        {isEditing ? (
                            <>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {editTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/30 text-primary rounded-full text-sm"
                                        >
                                            #{tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                        placeholder="タグを追加..."
                                        className="flex-1 px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-3 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary/20"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {event.tags && event.tags.length > 0 ? (
                                    event.tags.map((tag) => (
                                        <span key={tag} className="text-primary/80 text-sm">#{tag}</span>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm">タグなし</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BGM Settings */}
                    {isEditing && (
                        <HistoryBGMEditor
                            bgm={editBgm}
                            onChange={setEditBgm}
                        />
                    )}

                    {/* BGM Display (View Mode) */}
                    {!isEditing && event.bgm && event.bgm.enabled && event.bgm.tracks.length > 0 && (
                        <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Music size={16} className="text-primary" />
                                <h2 className="text-sm text-muted-foreground">BGM</h2>
                                {event.bgm.autoPlay && (
                                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                                        自動再生
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                {event.bgm.tracks.map((track, i) => (
                                    <div key={track.songId} className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                                        <span>{track.songId.replace(/\.[^/.]+$/, "")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* External Search */}
                    <div className="flex justify-center">
                        <a
                            href={`https://www.google.com/search?q=SEKAI+NO+OWARI+${encodeURIComponent(event.title)}+${event.date.year}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink size={14} />
                            関連情報を検索
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
