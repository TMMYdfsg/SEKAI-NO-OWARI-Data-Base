"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getAllThemes, ThemeCategory, ThemeDefinition, getThemeFullLabel } from "@/lib/theme-definitions";
import { Search, Monitor, Music, Disc, Tent, Star, Users, Check, LayoutGrid, Filter, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: { id: ThemeCategory | "All" | "Member", label: string, icon: any }[] = [
    { id: "All", label: "All", icon: LayoutGrid },
    { id: "Member", label: "Members", icon: Users },
    { id: "Album", label: "Albums", icon: Disc },
    { id: "Single", label: "Singles", icon: Music },
    { id: "Tour", label: "Tours", icon: Tent },
    { id: "Special", label: "Special", icon: Star },
    { id: "Motif", label: "Motifs", icon: Monitor },
];

export default function ThemeGalleryPage() {
    const { themeId, setTheme, animationSettings, setAnimationSettings } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<ThemeCategory | "All" | "Member">("All");

    // Custom text state (max 20 chars)
    const [customText, setCustomText] = useState(animationSettings.customText || "");
    const MAX_TEXT_LENGTH = 20;

    const allThemes = useMemo(() => getAllThemes(), []);

    const filteredThemes = useMemo(() => {
        return allThemes.filter(t => {
            // Filter by Category
            if (activeCategory !== "All") {
                if (activeCategory === "Member") {
                    if (!t.tags.includes("member") && !t.tags.includes("standard")) return false;
                } else if (t.category !== activeCategory) {
                    return false;
                }
            }

            // Filter by Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = t.displayName.toLowerCase().includes(q);
                const matchYear = t.year?.includes(q) || false;
                const matchTag = t.tags.some(tag => tag.includes(q));
                if (!matchName && !matchYear && !matchTag) return false;
            }

            return true;
        });
    }, [allThemes, activeCategory, searchQuery]);

    return (
        <div className="min-h-screen pb-24 pt-24 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Theme Gallery
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        歴代のツアーや名盤の世界観で、アプリケーションを着せ替えることができます。
                        テーマを変更すると、起動時や画面遷移時の演出も切り替わります。
                    </p>
                </div>

                {/* Custom Launch Text Editor */}
                <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Edit3 size={18} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">起動テキスト</h3>
                                <p className="text-xs text-muted-foreground">テーマ変更時に表示される文字</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => {
                                        const value = e.target.value.slice(0, MAX_TEXT_LENGTH);
                                        setCustomText(value);
                                    }}
                                    placeholder="SEKAOWA"
                                    maxLength={MAX_TEXT_LENGTH}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                />
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${customText.length >= MAX_TEXT_LENGTH ? 'text-red-400' : 'text-muted-foreground'}`}>
                                    {customText.length}/{MAX_TEXT_LENGTH}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setAnimationSettings({
                                        ...animationSettings,
                                        customText: customText || undefined
                                    });
                                }}
                                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-surface/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm sticky top-20 z-10 shadow-xl">

                    {/* Filter Tabs */}
                    <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2 lg:pb-0 mask-gradient-r">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-72 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="テーマ名、年号で検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredThemes.map((theme) => {
                            const isActive = themeId === theme.id;
                            const fullLabel = getThemeFullLabel(theme);

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={theme.id}
                                    onClick={() => setTheme(theme.id)}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${isActive
                                        ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                        : "bg-surface/40 border-white/5 hover:border-white/20 hover:bg-surface/60"
                                        }`}
                                >
                                    {/* Preview Area (Abstract Representation) */}
                                    <div className="h-32 w-full relative overflow-hidden bg-black/40">
                                        {/* Dynamic Gradient based on paletteKey roughly */}
                                        <div className={`absolute inset-0 opacity-50 theme-preview-${theme.paletteKey}`}
                                            style={{ background: getMockGradient(theme.paletteKey) }}
                                        />

                                        {/* Status Badge */}
                                        {isActive && (
                                            <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Check size={12} />
                                                Active
                                            </div>
                                        )}

                                        {/* Theme Motif Icon (Placeholder logic) */}
                                        <div className="absolute bottom-3 left-3 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
                                            <ThemeIcon category={theme.category} />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                            {theme.displayName}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{theme.year || theme.category}</span>
                                            {theme.animationRecipeId !== "default" && (
                                                <span className="flex items-center gap-1 text-purple-400">
                                                    <Star size={10} fill="currentColor" />
                                                    Special FX
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {filteredThemes.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Filter className="mx-auto mb-4 opacity-50" size={48} />
                        <p>条件に一致するテーマが見つかりませんでした。</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ThemeIcon({ category }: { category: ThemeCategory }) {
    switch (category) {
        case "Album": return <Disc size={20} className="text-blue-400" />;
        case "Single": return <Music size={20} className="text-green-400" />;
        case "Tour": return <Tent size={20} className="text-amber-400" />;
        case "Special": return <Star size={20} className="text-purple-400" />;
        case "Motif": return <Monitor size={20} className="text-pink-400" />;
        default: return <LayoutGrid size={20} />;
    }
}

// Helper to generate a CSS gradient string based on palette key for preview
// This is an approximation since effective CSS variables are on :root
function getMockGradient(paletteKey: string): string {
    switch (paletteKey) {
        case "fukase": return "linear-gradient(135deg, #F43F5E 0%, #881337 100%)";
        case "nakajin": return "linear-gradient(135deg, #0686C5 0%, #0C4A6E 100%)";
        case "saori": return "linear-gradient(135deg, #EAB308 0%, #713F12 100%)";
        case "djlove": return "linear-gradient(135deg, #D946EF 0%, #701A75 100%)";
        case "twilight": return "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)";
        case "dragonNight": return "linear-gradient(135deg, #F59E0B 0%, #1E3A8A 100%)";
        case "tree": return "linear-gradient(135deg, #10B981 0%, #064E3B 100%)";
        case "nautilus": return "linear-gradient(135deg, #0EA5E9 0%, #0F172A 100%)";
        default: return "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)";
    }
}
