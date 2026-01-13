"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, Search, Tag as TagIcon, ArrowUpDown, ChevronDown } from "lucide-react";
import GoodsCard from "@/components/GoodsCard";
import type { GoodsItem } from "@/types/gallery";

type SortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'favorite';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: '名前順 (A→Z)' },
    { value: 'name-desc', label: '名前順 (Z→A)' },
    { value: 'date-desc', label: '追加日 (新しい順)' },
    { value: 'date-asc', label: '追加日 (古い順)' },
    { value: 'favorite', label: 'お気に入り優先' },
];

export default function GoodsPage() {
    const router = useRouter();
    const [goods, setGoods] = useState<GoodsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Fetch goods
    useEffect(() => {
        fetch("/api/db/goods")
            .then((res) => res.json())
            .then((data) => {
                // データ検証とデフォルト値の設定
                const validatedData = Array.isArray(data) ? data.map(item => ({
                    ...item,
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: item.updatedAt || new Date().toISOString(),
                    isFavorite: item.isFavorite ?? false,
                    tags: item.tags || [],
                    imagePaths: item.imagePaths || []
                })) : [];
                setGoods(validatedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load goods:", err);
                setLoading(false);
            });
    }, []);

    const allTypes = useMemo(() => {
        const types = new Set(goods.map(g => g.type));
        return ["All", ...Array.from(types).sort()];
    }, [goods]);

    const allTags = useMemo(() => {
        const tags = new Set(goods.flatMap(g => g.tags));
        return Array.from(tags).sort();
    }, [goods]);

    const filteredGoods = useMemo(() => {
        let result = goods.filter(g => {
            if (filterType !== "All" && g.type !== filterType) return false;
            // query検索
            if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            // タグフィルタ（tagsが存在しない場合に対応）
            if (selectedTags.length > 0) {
                const itemTags = Array.isArray(g.tags) ? g.tags : [];
                if (!selectedTags.some(tag => itemTags.includes(tag))) return false;
            }
            return true;
        });

        // Apply sort
        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
                break;
            case 'date-desc':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'date-asc':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateA - dateB;
                });
                break;
            case 'favorite':
                result.sort((a, b) => ((b.isFavorite ?? false) ? 1 : 0) - ((a.isFavorite ?? false) ? 1 : 0));
                break;
        }

        return result;
    }, [goods, filterType, searchQuery, selectedTags, sortBy]);

    const handleCreateNew = async () => {
        try {
            const newGoods: Partial<GoodsItem> = {
                name: "新しいグッズ",
                type: 'Other',
                imagePaths: [],
                tags: [],
                isFavorite: false,
            };

            const res = await fetch("/api/db/goods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newGoods),
            });

            if (res.ok) {
                const created = await res.json();
                router.push(`/goods/${created.id}`);
            } else {
                const error = await res.json();
                alert(`作成に失敗しました: ${error.error}`);
            }
        } catch (err) {
            console.error("Create error:", err);
            alert("作成中にエラーが発生しました");
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="animate-pulse text-primary">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-5xl font-bold font-serif text-primary drop-shadow-lg">
                        Goods Collection
                    </h1>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
                    >
                        <Plus size={20} />
                        新規作成
                    </button>
                </div>

                {/* Search and Sort */}
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="グッズを検索..."
                            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-3 bg-card/50 border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
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
                                            ? 'bg-primary/20 text-primary'
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

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    {/* Type Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Filter size={16} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">種別</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterType === type
                                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                        : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tag Filter */}
                    {allTags.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <TagIcon size={16} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">タグ</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag)
                                            ? "bg-primary/20 text-primary border border-primary/50"
                                            : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Goods Grid */}
                {goods.length === 0 ? (
                    <div className="text-center py-20">
                        <TagIcon size={64} className="mx-auto mb-4 text-white/20" />
                        <p className="text-muted-foreground mb-4">グッズがまだありません</p>
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                        >
                            <Plus size={16} />
                            最初のグッズを登録
                        </button>
                    </div>
                ) : filteredGoods.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>該当するグッズが見つかりません</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredGoods.map((item) => (
                            <GoodsCard
                                key={item.id}
                                goods={item}
                                onClick={() => router.push(`/goods/${item.id}`)}
                            />
                        ))}
                    </div>
                )}

                {/* Summary */}
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {filteredGoods.length} / {goods.length} 件を表示中
                </div>
            </div>
        </div>
    );
}
