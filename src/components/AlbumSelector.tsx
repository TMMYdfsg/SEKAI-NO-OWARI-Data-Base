"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { X, Search, Disc, Music, Check, ChevronDown } from "lucide-react";
import { albums, Album } from "@/data/discography";

interface AlbumSelectorProps {
    selectedAlbumIds: string[];
    onSelectionChange: (albumIds: string[]) => void;
    onClose: () => void;
    songTitle: string;
}

export default function AlbumSelector({
    selectedAlbumIds,
    onSelectionChange,
    onClose,
    songTitle,
}: AlbumSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "Album" | "Single" | "EP">("all");
    const [localSelection, setLocalSelection] = useState<string[]>(selectedAlbumIds);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Animation trigger
    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    // Filter albums
    const filteredAlbums = useMemo(() => {
        return albums.filter((album) => {
            // Exclude Video type
            if (album.type === "Video") return false;

            // Type filter
            if (filterType !== "all" && album.type !== filterType) return false;

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    album.title.toLowerCase().includes(query) ||
                    album.tracks.some((track) => track.toLowerCase().includes(query))
                );
            }
            return true;
        });
    }, [searchQuery, filterType]);

    // Group by type
    const groupedAlbums = useMemo(() => {
        const groups: Record<string, Album[]> = {
            Album: [],
            Single: [],
            EP: [],
            Compilation: [],
        };
        filteredAlbums.forEach((album) => {
            if (groups[album.type]) {
                groups[album.type].push(album);
            }
        });
        return groups;
    }, [filteredAlbums]);

    const toggleSelection = (albumId: string) => {
        setLocalSelection((prev) =>
            prev.includes(albumId)
                ? prev.filter((id) => id !== albumId)
                : [...prev, albumId]
        );
    };

    const handleSave = () => {
        onSelectionChange(localSelection);
        handleClose();
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    // Check if song is in album's track list
    const isSongInAlbum = (album: Album) => {
        const normalizedTitle = songTitle.replace(/\.[^/.]+$/, "").toLowerCase();
        return album.tracks.some(
            (track) => track.toLowerCase() === normalizedTitle
        );
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
                }`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`bg-card w-full max-w-3xl max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${isVisible
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4"
                    }`}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold font-serif flex items-center gap-3">
                                <Disc className="text-primary" size={28} />
                                アルバム・シングル選択
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                「{songTitle.replace(/\.[^/.]+$/, "")}」の収録作品を選択
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                placeholder="アルバム名・曲名で検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary text-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="appearance-none bg-background border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary cursor-pointer"
                            >
                                <option value="all">すべて</option>
                                <option value="Album">アルバム</option>
                                <option value="Single">シングル</option>
                                <option value="EP">EP</option>
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                {/* Album List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {Object.entries(groupedAlbums).map(([type, albumList]) => {
                        if (albumList.length === 0) return null;
                        return (
                            <div key={type}>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Music size={14} />
                                    {type === "Album" ? "アルバム" : type === "Single" ? "シングル" : type}
                                    <span className="text-primary">({albumList.length})</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {albumList.map((album) => {
                                        const isSelected = localSelection.includes(album.id);
                                        const isAutoDetected = isSongInAlbum(album);

                                        return (
                                            <button
                                                key={album.id}
                                                onClick={() => toggleSelection(album.id)}
                                                className={`group relative p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                                        ? "bg-primary/20 border-primary ring-2 ring-primary/30"
                                                        : isAutoDetected
                                                            ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-white/10 text-white/60"
                                                            }`}
                                                    >
                                                        {isSelected ? (
                                                            <Check size={24} />
                                                        ) : (
                                                            album.title[0]
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold truncate group-hover:text-primary transition-colors">
                                                            {album.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {album.releaseDate} · {album.tracks.length}曲
                                                        </p>
                                                        {isAutoDetected && !isSelected && (
                                                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                                ✓ 曲名一致
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Selection indicator */}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                        <Check size={14} className="text-primary-foreground" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {filteredAlbums.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Disc size={48} className="mx-auto mb-4 opacity-30" />
                            <p>該当するアルバムが見つかりません</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {localSelection.length > 0 ? (
                            <span>
                                <span className="text-primary font-bold">{localSelection.length}</span>
                                件選択中
                            </span>
                        ) : (
                            "収録作品を選択してください"
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                        >
                            <Check size={16} />
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
