"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Image as ImageIcon, Folder, X, ChevronLeft, ChevronRight, Grid, Loader, Lock, Sparkles, Eye, EyeOff, Search, ArrowUpDown, ChevronDown, Check, ImagePlus, RefreshCw } from "lucide-react";
import { hasGallerySecretAccess, setGallerySecretAccess, unlockAchievement } from "@/lib/local-storage-data";
import { fetchWithCache, clearApiCache } from "@/lib/api-cache";
import ToolsMenu from "@/components/gallery/ToolsMenu";
import CollageCreator from "@/components/gallery/CollageCreator";
import WallpaperGenerator from "@/components/gallery/WallpaperGenerator";

interface GalleryFolder {
    name: string;
    path: string;
    imageCount: number;
}

interface GalleryImage {
    name: string;
    path: string;
    folder: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'count-desc' | 'count-asc';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: '名前順 (A→Z)' },
    { value: 'name-desc', label: '名前順 (Z→A)' },
    { value: 'count-desc', label: '枚数 (多い順)' },
    { value: 'count-asc', label: '枚数 (少ない順)' },
];

const COVER_IMAGES_KEY = "sekaowa_gallery_covers";

export default function GalleryPage() {
    const [folders, setFolders] = useState<GalleryFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasSecretAccess, setHasSecretAccess] = useState(false);
    const [coverImages, setCoverImages] = useState<Record<string, string>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sort and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Tools state
    const [showCollageCreator, setShowCollageCreator] = useState(false);
    const [showWallpaperGenerator, setShowWallpaperGenerator] = useState(false);

    // Initial Load
    const loadFolders = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        if (forceRefresh) {
            clearApiCache('gallery_folders');
            setIsRefreshing(true);
        }

        try {
            const data = await fetchWithCache('gallery_folders', async () => {
                const res = await fetch('/api/gallery');
                return res.json();
            }, 1000 * 60 * 60); // 1 hour cache

            if (data.error) {
                setError(data.error);
            } else {
                setFolders(data.folders || []);
            }
        } catch (err) {
            console.error("Failed to load gallery:", err);
            setError("ギャラリーの読み込みに失敗しました");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setHasSecretAccess(hasGallerySecretAccess());

        // Load covers
        const savedCovers = localStorage.getItem(COVER_IMAGES_KEY);
        if (savedCovers) {
            try {
                setCoverImages(JSON.parse(savedCovers));
            } catch (e) {
                console.error("Failed to load covers", e);
            }
        }

        // Load sort preference
        const savedSort = localStorage.getItem('sekaowa_gallery_sort');
        if (savedSort && sortOptions.some(o => o.value === savedSort)) {
            setSortBy(savedSort as SortOption);
        }

        loadFolders();
    }, [loadFolders]);

    // Filter and Sort Folders
    const visibleFolders = folders.filter(folder => {
        if (folder.name === "シークレットハウス" || folder.name.toLowerCase().includes("secret")) {
            return hasSecretAccess;
        }
        return true;
    });

    const filteredFolders = useMemo(() => {
        let result = [...visibleFolders];

        if (searchQuery) {
            result = result.filter(folder =>
                folder.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
                break;
            case 'count-desc':
                result.sort((a, b) => b.imageCount - a.imageCount);
                break;
            case 'count-asc':
                result.sort((a, b) => a.imageCount - b.imageCount);
                break;
        }

        return result;
    }, [visibleFolders, searchQuery, sortBy]);

    const isSecretHouseSelected = selectedFolder &&
        (selectedFolder.includes("シークレットハウス") || selectedFolder.toLowerCase().includes("secret"));

    // Load Images
    const loadImages = useCallback(async (folderPath: string, forceRefresh = false) => {
        setImagesLoading(true);
        if (forceRefresh) {
            clearApiCache(`gallery_images_${folderPath}`);
            setIsRefreshing(true);
        }

        try {
            const data = await fetchWithCache(`gallery_images_${folderPath}`, async () => {
                const res = await fetch(`/api/gallery?folder=${encodeURIComponent(folderPath)}`);
                return res.json();
            }); // Default cache TTL

            setImages(data.images || []);
        } catch (err) {
            console.error("Failed to load images:", err);
        } finally {
            setImagesLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!selectedFolder) {
            setImages([]);
            return;
        }
        loadImages(selectedFolder);
    }, [selectedFolder, loadImages]);

    // Lightbox Logic
    const navigateLightbox = (direction: 'prev' | 'next') => {
        if (!lightboxImage || images.length === 0) return;
        const currentIndex = images.findIndex(img => img.path === lightboxImage.path);
        if (currentIndex === -1) return;
        let newIndex = direction === 'prev'
            ? (currentIndex === 0 ? images.length - 1 : currentIndex - 1)
            : (currentIndex === images.length - 1 ? 0 : currentIndex + 1);
        setLightboxImage(images[newIndex]);
    };



    const handleSetCover = (folderPath: string, imagePath: string) => {
        const newCovers = { ...coverImages, [folderPath]: imagePath };
        setCoverImages(newCovers);
        localStorage.setItem(COVER_IMAGES_KEY, JSON.stringify(newCovers));

        // Unlock achievement
        unlockAchievement(107);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!lightboxImage) return;
        if (e.key === "ArrowLeft") navigateLightbox('prev');
        if (e.key === "ArrowRight") navigateLightbox('next');
        if (e.key === "Escape") setLightboxImage(null);
    };

    useEffect(() => {
        if (lightboxImage) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxImage]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                <Loader className="animate-spin mr-2" /> Loading gallery...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <ImageIcon size={64} className="mx-auto mb-4 text-white/20" />
                    <h1 className="text-2xl font-bold text-muted-foreground mb-4">Error</h1>
                    <p className="text-muted-foreground/50">{error}</p>
                    <button
                        onClick={() => loadFolders(true)}
                        className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center fade-in-up">
                    <h1 className="text-5xl font-bold font-serif mb-4 flex items-center justify-center gap-4 text-primary drop-shadow-lg">
                        <ImageIcon size={48} /> Gallery
                    </h1>
                    <p className="text-xl text-muted-foreground">Memories and Collection</p>
                </header>

                {selectedFolder ? (
                    // Folder View
                    <div className="fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedFolder(null)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform active:scale-95 duration-200"
                                >
                                    <ChevronLeft size={20} /> Back to Folders
                                </button>
                                <button
                                    onClick={() => loadImages(selectedFolder, true)}
                                    disabled={isRefreshing}
                                    className={`p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                                    title="Refresh Images"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
                                <Folder className="text-primary" />
                                {selectedFolder.split(/[\\/]/).pop()}
                                {isSecretHouseSelected && <Lock size={16} className="text-purple-400" />}
                            </h2>
                            <div className="flex gap-2">
                                <ToolsMenu
                                    onOpenCollage={() => setShowCollageCreator(true)}
                                    onOpenWallpaper={() => setShowWallpaperGenerator(true)}
                                />
                            </div>
                        </div>

                        {imagesLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader className="animate-spin text-primary" size={40} />
                            </div>
                        ) : images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {images.map((img) => (
                                    <div
                                        key={img.path}
                                        className="group relative aspect-square bg-card/50 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                                        onClick={() => setLightboxImage(img)}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('/api/media?file=${encodeURIComponent(img.path)}')` }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            <p className="text-xs text-white truncate">{img.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-2xl border border-white/5 border-dashed">
                                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No images found in this folder.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Folder List
                    <div className="fade-in-up delay-100">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search folders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 text-sm"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-card/70 border border-white/10 rounded-lg text-sm transition-colors min-w-[180px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown size={16} className="text-muted-foreground" />
                                        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`} />
                                </button>

                                {showSortDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="py-1">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        localStorage.setItem('sekaowa_gallery_sort', option.value);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${sortBy === option.value
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-white/5 text-foreground"
                                                        }`}
                                                >
                                                    {option.label}
                                                    {sortBy === option.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Folder Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFolders.map((folder) => {
                                const coverImage = coverImages[folder.path];
                                const isSecret = folder.name.includes("シークレットハウス");

                                return (
                                    <div
                                        key={folder.path}
                                        onClick={() => setSelectedFolder(folder.path)}
                                        className={`group relative p-6 bg-card/60 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden ${isSecret ? "border-purple-500/20 bg-purple-500/5" : ""
                                            }`}
                                    >
                                        {/* Background Cover Image */}
                                        {coverImage && (
                                            <div
                                                className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center"
                                                style={{ backgroundImage: `url('/api/media?file=${encodeURIComponent(coverImage)}')` }}
                                            />
                                        )}
                                        {/* Gradient Overlay for Readability */}
                                        {coverImage && (
                                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 to-black/40" />
                                        )}

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`p-4 rounded-full transition-colors duration-300 shrink-0 ${isSecret ? "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white"
                                                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                                }`}>
                                                {isSecret ? <Lock size={28} /> :
                                                    coverImage ? <ImagePlus size={28} /> : <Folder size={28} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-bold text-lg truncate transition-colors ${isSecret ? "group-hover:text-purple-400" : "group-hover:text-primary"
                                                    }`}>
                                                    {folder.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    {folder.imageCount} items
                                                    {isSecret && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Secret</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredFolders.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No folders found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Shared Lightbox */}
                {lightboxImage && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center fade-in duration-200"
                        onClick={() => setLightboxImage(null)}
                    >
                        {/* Controls */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                            <div className="text-white/80 font-medium truncate max-w-lg">
                                {lightboxImage.name}
                            </div>
                            <div className="flex gap-4">
                                {selectedFolder && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetCover(selectedFolder, lightboxImage.path);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${coverImages[selectedFolder] === lightboxImage.path
                                            ? "bg-primary text-white"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                            }`}
                                    >
                                        {coverImages[selectedFolder] === lightboxImage.path ? (
                                            <> <Check size={16} /> Cover Set </>
                                        ) : (
                                            <> <ImagePlus size={16} /> Set as Cover </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => setLightboxImage(null)}
                                    className="p-2 text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                            className="absolute left-6 p-4 text-white/60 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all hover:scale-110"
                        >
                            <ChevronLeft size={36} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                            className="absolute right-6 p-4 text-white/60 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all hover:scale-110"
                        >
                            <ChevronRight size={36} />
                        </button>

                        {/* Image */}
                        <img
                            src={`/api/media?file=${encodeURIComponent(lightboxImage.path)}`}
                            alt={lightboxImage.name}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-[95vw] max-h-[85vh] object-contain drop-shadow-2xl"
                        />

                        {/* Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            {images.findIndex(img => img.path === lightboxImage.path) + 1} / {images.length}
                        </div>
                    </div>
                )}

                {/* Tools Modals */}
                {showCollageCreator && (
                    <CollageCreator
                        images={images}
                        onClose={() => setShowCollageCreator(false)}
                    />
                )}

                {showWallpaperGenerator && (
                    <WallpaperGenerator
                        images={images}
                        onClose={() => setShowWallpaperGenerator(false)}
                    />
                )}
            </div>
        </div >
    );
}
