"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Disc3, Calendar, Play, Music, AlertCircle, Edit3, Save, Trash2, X, Image as ImageIcon
} from "lucide-react";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import type { Discography, TrackInfo, AlbumType } from "@/types/discography";
import TracklistEditor from "@/components/TracklistEditor";
import CompletionStatus from "@/components/CompletionStatus";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail?: string | null;
}

const albumTypeOptions: { value: AlbumType; label: string }[] = [
    { value: "Album", label: "アルバム" },
    { value: "Single", label: "シングル" },
    { value: "EP", label: "EP" },
    { value: "Compilation", label: "ベスト/コンピレーション" },
    { value: "Video", label: "映像作品" },
    { value: "Other", label: "その他" },
];

export default function AlbumDetailPage() {
    const params = useParams();
    const router = useRouter();
    const albumId = params.id as string;
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const { playSong } = usePlayer();

    const [album, setAlbum] = useState<Discography | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editReleaseDate, setEditReleaseDate] = useState("");
    const [editType, setEditType] = useState<AlbumType>("Album");
    const [editDescription, setEditDescription] = useState("");
    const [editProductionNotes, setEditProductionNotes] = useState("");
    const [editCoverImage, setEditCoverImage] = useState("");
    const [editTracks, setEditTracks] = useState<TrackInfo[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // Load album
    useEffect(() => {
        fetch(`/api/db/discography?id=${albumId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setAlbum(null);
                } else {
                    setAlbum(data);
                    initEditState(data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load album:", err);
                setLoading(false);
            });
    }, [albumId]);

    useEffect(() => {
        fetch("/api/files")
            .then((res) => res.json())
            .then((data) => setLocalFiles(data.files || []))
            .catch(console.error);
    }, []);

    const songSuggestions = useMemo(() =>
        localFiles.map(f => f.name.replace(/\.[^/.]+$/, "")),
        [localFiles]
    );

    const initEditState = (a: Discography) => {
        setEditTitle(a.title);
        setEditReleaseDate(a.releaseDate || "");
        setEditType(a.type);
        setEditDescription(a.description || "");
        setEditProductionNotes(a.productionNotes || "");
        setEditCoverImage(a.coverImage || "");
        // Flatten multi-disc to single disc for simplicity (first disc only)
        setEditTracks(a.discs.length > 0 ? a.discs[0].tracks : []);
    };

    // Find a local file matching the track name (Original category only)
    const findLocalFile = (trackTitle: string): LocalFile | null => {
        const normalizedTrack = trackTitle.toLowerCase().trim();
        return localFiles.filter(file => file.category === "Original").find(file => {
            const fileName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().trim();
            return fileName === normalizedTrack || fileName.includes(normalizedTrack) || normalizedTrack.includes(fileName);
        }) || null;
    };

    const handlePlayTrack = (trackTitle: string) => {
        const localFile = findLocalFile(trackTitle);

        if (localFile && album) {
            const track: Track = {
                name: localFile.name,
                path: localFile.path,
                type: localFile.type,
                category: localFile.category,
                thumbnail: localFile.thumbnail,
                album: album.title,
            };
            // Build playlist from album tracks that have local files
            const trackList: Track[] = (album.discs[0]?.tracks || [])
                .map(t => findLocalFile(t.title))
                .filter((f): f is LocalFile => f !== null)
                .map(f => ({
                    name: f.name,
                    path: f.path,
                    type: f.type,
                    category: f.category,
                    thumbnail: f.thumbnail,
                    album: album.title,
                }));
            playSong(track, trackList);
        }
    };

    const handleSave = async () => {
        if (!editTitle.trim()) {
            alert("タイトルは必須です");
            return;
        }

        setSaving(true);

        // Check completion
        const missingFields: string[] = [];
        if (!editTitle) missingFields.push("タイトル");
        if (!editReleaseDate) missingFields.push("リリース日");
        if (!editCoverImage) missingFields.push("カバー画像");
        if (editTracks.length === 0) missingFields.push("トラックリスト");

        const updates: Partial<Discography> = {
            id: albumId,
            title: editTitle.trim(),
            releaseDate: editReleaseDate || undefined,
            type: editType,
            description: editDescription || undefined,
            productionNotes: editProductionNotes || undefined,
            coverImage: editCoverImage || undefined,
            discs: [{
                discNumber: 1,
                tracks: editTracks,
            }],
            isComplete: missingFields.length === 0,
            missingFields: missingFields.length > 0 ? missingFields : undefined,
        };

        try {
            const res = await fetch("/api/db/discography", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (res.ok) {
                const updated = await res.json();
                setAlbum(updated);
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

    // Drag & Drop handlers for cover image
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        // First, check for text data (file path from file explorer)
        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
        if (textData) {
            // Clean up file:// prefix if present
            let cleanPath = textData.replace('file:///', '').replace('file://', '');
            // Decode URI components
            cleanPath = decodeURIComponent(cleanPath);
            // Check if it's an image path
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                setEditCoverImage(cleanPath);
                return;
            }
        }

        // Handle file drops
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Use FileReader to create a data URL for preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setEditCoverImage(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert('画像ファイルをドロップしてください');
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm("このアルバムを削除しますか？")) return;

        try {
            const res = await fetch(`/api/db/discography?id=${albumId}&soft=true`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/discography");
            } else {
                alert("削除に失敗しました");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("削除中にエラーが発生しました");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="animate-pulse text-primary">読み込み中...</div>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-muted-foreground mb-4">アルバムが見つかりません</h1>
                    <Link href="/discography" className="text-primary hover:underline">
                        ディスコグラフィに戻る
                    </Link>
                </div>
            </div>
        );
    }

    const typeColor = album.type.includes("Single") ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
        album.type.includes("Video") ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
            album.type.includes("Compilation") ? "bg-green-500/20 text-green-300 border-green-500/30" :
                "bg-white/20 text-white border-white/10";

    const allTracks = album.discs.flatMap(disc => disc.tracks);

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/discography"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>ディスコグラフィに戻る</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        initEditState(album);
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

                {/* Completion Status */}
                {!album.isComplete && !isEditing && (
                    <div className="mb-6">
                        <CompletionStatus isComplete={album.isComplete} missingFields={album.missingFields} />
                    </div>
                )}

                {/* Album Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Album Art */}
                    <div
                        className={`w-full md:w-80 aspect-square bg-card border-2 border-dashed rounded-xl overflow-hidden shrink-0 transition-all ${isDraggingOver ? 'border-primary bg-primary/10 scale-105' : 'border-white/10'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isEditing ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                                {editCoverImage ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-50"
                                        style={{ backgroundImage: `url(${editCoverImage})` }}
                                    />
                                ) : null}
                                <div className="relative z-10 text-center">
                                    <ImageIcon size={40} className={`mx-auto mb-4 ${isDraggingOver ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {isDraggingOver ? '画像をドロップ!' : '画像をドラッグ＆ドロップ'}
                                    </p>
                                    <input
                                        type="text"
                                        value={editCoverImage}
                                        onChange={(e) => setEditCoverImage(e.target.value)}
                                        placeholder="または画像パスを入力..."
                                        className="w-full px-4 py-2 bg-background/80 backdrop-blur border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm text-center"
                                    />
                                    {editCoverImage && (
                                        <button
                                            onClick={() => setEditCoverImage('')}
                                            className="mt-2 text-xs text-red-400 hover:text-red-300"
                                        >
                                            画像をクリア
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : album.coverImage ? (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${album.coverImage})` }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Disc3 size={80} className="text-white/20" />
                            </div>
                        )}
                    </div>

                    {/* Album Info */}
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">タイプ</label>
                                    <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value as AlbumType)}
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    >
                                        {albumTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">タイトル</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">リリース日</label>
                                    <input
                                        type="date"
                                        value={editReleaseDate}
                                        onChange={(e) => setEditReleaseDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${typeColor} mb-4`}>
                                    {albumTypeOptions.find(o => o.value === album.type)?.label || album.type}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">
                                    {album.title}
                                </h1>
                                {album.releaseDate && (
                                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                                        <Calendar size={16} />
                                        <span>{album.releaseDate}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Music size={16} />
                                    <span>{allTracks.length} tracks</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Description & Production Notes */}
                {(isEditing || album.description || album.productionNotes) && (
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6 mb-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">説明</label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">制作裏話</label>
                                    <textarea
                                        value={editProductionNotes}
                                        onChange={(e) => setEditProductionNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {album.description && (
                                    <div className="mb-4">
                                        <h3 className="text-sm text-muted-foreground mb-2">説明</h3>
                                        <p className="text-foreground whitespace-pre-wrap">{album.description}</p>
                                    </div>
                                )}
                                {album.productionNotes && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground mb-2">制作裏話</h3>
                                        <p className="text-foreground whitespace-pre-wrap">{album.productionNotes}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Track List */}
                <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Disc3 size={20} className="text-primary" />
                        トラックリスト
                    </h2>

                    {isEditing ? (
                        <TracklistEditor
                            tracks={editTracks}
                            onChange={setEditTracks}
                            suggestions={songSuggestions}
                        />
                    ) : (
                        <div className="space-y-2">
                            {allTracks.map((track) => {
                                const hasLocalFile = findLocalFile(track.title) !== null;
                                return (
                                    <div
                                        key={track.id}
                                        className={`flex items-center gap-4 p-4 rounded-lg transition-all ${hasLocalFile
                                            ? "hover:bg-primary/10 cursor-pointer group"
                                            : "bg-white/5"
                                            }`}
                                        onClick={() => hasLocalFile && handlePlayTrack(track.title)}
                                    >
                                        <span className="text-white/30 font-mono text-sm w-8 shrink-0">
                                            {String(track.trackNumber).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-base ${hasLocalFile ? "text-white group-hover:text-primary" : "text-white/50"} transition-colors`}>
                                                    {track.title}
                                                </span>
                                                {track.isBonus && (
                                                    <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded uppercase font-bold">Bonus</span>
                                                )}
                                            </div>
                                            {track.versionNote && (
                                                <span className="text-xs text-muted-foreground italic">{track.versionNote}</span>
                                            )}
                                            {!hasLocalFile && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle size={12} className="text-amber-500/70" />
                                                    <span className="text-xs text-amber-500/70">この曲は未収録です</span>
                                                </div>
                                            )}
                                        </div>
                                        {hasLocalFile && (
                                            <Play size={18} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
