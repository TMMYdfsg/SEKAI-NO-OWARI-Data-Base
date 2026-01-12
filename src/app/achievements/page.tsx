"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Trophy, Lock, Unlock, Search, Filter, ChevronDown, ArrowUpDown, CheckCircle, Circle, X, Calendar, Star, Info } from "lucide-react";
import Link from "next/link";
import { achievements, Achievement } from "@/data/achievements-list";
import { getUnlockedAchievements, UnlockedAchievement } from "@/lib/local-storage-data";

type FilterOption = 'all' | 'unlocked' | 'locked';
type SortOption = 'id-asc' | 'id-desc' | 'unlocked-first' | 'locked-first';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'id-asc', label: 'ID順 (昇順)' },
    { value: 'id-desc', label: 'ID順 (降順)' },
    { value: 'unlocked-first', label: 'アンロック済み優先' },
    { value: 'locked-first', label: '未アンロック優先' },
];

export default function AchievementsPage() {
    const [mounted, setMounted] = useState(false);
    const [unlockedData, setUnlockedData] = useState<UnlockedAchievement[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [sortBy, setSortBy] = useState<SortOption>('id-asc');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        setMounted(true);
        setUnlockedData(getUnlockedAchievements());
    }, []);

    const unlockedMap = useMemo(() => {
        const map = new Map<number, string>(); // ID -> UnlockedAt string
        unlockedData.forEach(u => map.set(u.id, u.unlockedAt));
        return map;
    }, [unlockedData]);

    if (!mounted) return null;

    const total = achievements.filter(a => a.id < 900).length; // Exclude platinum for count if needed, or include all
    const unlockedCount = unlockedMap.size;
    const progress = Math.round((unlockedCount / achievements.length) * 100);

    // Filter and sort achievements
    const filteredAchievements = useMemo(() => {
        let result = [...achievements];

        // Filter by search
        if (searchQuery) {
            result = result.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (a.id === 900 && "platinum".includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by status
        if (filterBy === 'unlocked') {
            result = result.filter(a => unlockedMap.has(a.id));
        } else if (filterBy === 'locked') {
            result = result.filter(a => !unlockedMap.has(a.id));
        }

        // Sort
        switch (sortBy) {
            case 'id-asc':
                result.sort((a, b) => a.id - b.id);
                break;
            case 'id-desc':
                result.sort((a, b) => b.id - a.id);
                break;
            case 'unlocked-first':
                result.sort((a, b) => {
                    const aUnlocked = unlockedMap.has(a.id) ? 0 : 1;
                    const bUnlocked = unlockedMap.has(b.id) ? 0 : 1;
                    return aUnlocked - bUnlocked || a.id - b.id;
                });
                break;
            case 'locked-first':
                result.sort((a, b) => {
                    const aUnlocked = unlockedMap.has(a.id) ? 1 : 0;
                    const bUnlocked = unlockedMap.has(b.id) ? 1 : 0;
                    return aUnlocked - bUnlocked || a.id - b.id;
                });
                break;
        }

        return result;
    }, [searchQuery, filterBy, sortBy, unlockedMap]);

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 fade-in-up">
                    <Link
                        href="/"
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-serif flex items-center gap-3 text-primary">
                            <Trophy className="text-yellow-500" />
                            Achievements
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Collection Progress: {unlockedCount} / {achievements.length} ({progress}%)
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 fade-in-up delay-100">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center fade-in-up delay-200">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-lg focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-card border border-white/10 rounded-lg">
                        <button
                            onClick={() => setFilterBy('all')}
                            className={`px-3 py-1.5 rounded text-sm transition-colors ${filterBy === 'all' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterBy('unlocked')}
                            className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${filterBy === 'unlocked' ? 'bg-yellow-500/20 text-yellow-400' : 'text-muted-foreground hover:text-white'}`}
                        >
                            <CheckCircle size={14} /> Unlocked
                        </button>
                        <button
                            onClick={() => setFilterBy('locked')}
                            className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${filterBy === 'locked' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                        >
                            <Circle size={14} /> Locked
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
                        >
                            <ArrowUpDown size={16} />
                            <span className="text-sm">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                            <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showSortDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-white/5 text-foreground'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 fade-in-up delay-300">
                    {filteredAchievements.map((ach) => {
                        const isUnlocked = unlockedMap.has(ach.id);
                        const isPlatinum = ach.category === 'Platinum';

                        return (
                            <div
                                key={ach.id}
                                onClick={() => setSelectedAchievement(ach)}
                                className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${isUnlocked
                                    ? isPlatinum
                                        ? "bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        : "bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                                    : "bg-card border-white/5 opacity-70 hover:opacity-100 hover:border-white/20"
                                    }`}
                            >
                                {isUnlocked && isPlatinum && (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)]" />
                                )}

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${isUnlocked
                                                    ? isPlatinum ? "border-cyan-500/50 text-cyan-400 bg-cyan-950/30" : "border-yellow-500/30 text-yellow-500 bg-yellow-500/10"
                                                    : "border-white/10 text-muted-foreground"
                                                }`}>
                                                #{ach.id.toString().padStart(3, '0')}
                                            </span>
                                            <h3 className={`font-bold transition-colors ${isUnlocked
                                                    ? isPlatinum ? "text-cyan-100" : "text-yellow-100"
                                                    : "text-white/50 group-hover:text-white/80"
                                                }`}>
                                                {ach.secret && !isUnlocked ? "???" : ach.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {ach.secret && !isUnlocked ? "Unlock conditions are hidden..." : ach.condition}
                                        </p>
                                    </div>
                                    <div className="shrink-0 pl-4">
                                        {isUnlocked ? (
                                            <Unlock size={20} className={isPlatinum ? "text-cyan-400" : "text-yellow-500"} />
                                        ) : (
                                            <Lock size={20} className="text-muted-foreground group-hover:text-white/50 transition-colors" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedAchievement && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedAchievement(null)}
                >
                    <div
                        className={`w-full max-w-lg bg-card border p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 ${unlockedMap.has(selectedAchievement.id)
                                ? selectedAchievement.category === 'Platinum'
                                    ? "border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                                    : "border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                                : "border-white/10"
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setSelectedAchievement(null)}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className={`p-6 rounded-full ${unlockedMap.has(selectedAchievement.id)
                                    ? selectedAchievement.category === 'Platinum'
                                        ? "bg-cyan-500/10 text-cyan-400 border-2 border-cyan-500/50"
                                        : "bg-yellow-500/10 text-yellow-500 border-2 border-yellow-500/50"
                                    : "bg-white/5 text-muted-foreground border-2 border-white/10"
                                }`}>
                                {unlockedMap.has(selectedAchievement.id) ? (
                                    <Trophy size={48} />
                                ) : (
                                    <Lock size={48} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-serif">
                                    {selectedAchievement.secret && !unlockedMap.has(selectedAchievement.id)
                                        ? "Hidden Achievement"
                                        : selectedAchievement.title}
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-mono">
                                    <span>#{selectedAchievement.id.toString().padStart(3, '0')}</span>
                                    <span>•</span>
                                    <span>{selectedAchievement.type}</span>
                                    {selectedAchievement.category && (
                                        <>
                                            <span>•</span>
                                            <span className={selectedAchievement.category === 'Platinum' ? "text-cyan-400" : "text-yellow-400"}>
                                                {selectedAchievement.category}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl w-full">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Condition</h3>
                                <p className="text-lg">
                                    {selectedAchievement.secret && !unlockedMap.has(selectedAchievement.id)
                                        ? "This achievement's requirements are a mystery."
                                        : selectedAchievement.condition}
                                </p>
                            </div>

                            {unlockedMap.has(selectedAchievement.id) && (
                                <div className="flex items-center gap-2 text-sm text-yellow-500/80 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                                    <Calendar size={16} />
                                    <span>
                                        Unlocked on {new Date(unlockedMap.get(selectedAchievement.id)!).toLocaleDateString()} at {new Date(unlockedMap.get(selectedAchievement.id)!).toLocaleTimeString()}
                                    </span>
                                </div>
                            )}

                            {!unlockedMap.has(selectedAchievement.id) && (
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Info size={16} />
                                    <span>Locked</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
