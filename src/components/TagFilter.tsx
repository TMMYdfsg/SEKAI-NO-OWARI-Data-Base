"use client";

import { useState, useEffect } from "react";
import { Filter, X, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { displayTagName } from "@/types/tags";

interface TagFilterProps {
    availableTags: string[];
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    mode?: 'AND' | 'OR';
    onModeChange?: (mode: 'AND' | 'OR') => void;
}

export default function TagFilter({
    availableTags,
    selectedTags,
    onChange,
    mode = 'OR',
    onModeChange
}: TagFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // タグの選択/解除
    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter(t => t !== tag));
        } else {
            onChange([...selectedTags, tag]);
        }
    };

    // 全てクリア
    const clearAll = () => {
        onChange([]);
    };

    // タグをカウント順でソート（よく使われるタグを先に）
    const sortedTags = [...availableTags].sort();

    if (availableTags.length === 0) {
        return null;
    }

    return (
        <div className="bg-card/50 border border-white/10 rounded-xl overflow-hidden">
            {/* ヘッダー */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-primary" />
                    <span className="font-medium">タグフィルター</span>
                    {selectedTags.length > 0 && (
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                            {selectedTags.length}件選択中
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* 選択中タグ（常に表示） */}
            {selectedTags.length > 0 && !isExpanded && (
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs"
                        >
                            {displayTagName(tag)}
                            <button onClick={() => toggleTag(tag)} className="hover:text-red-400">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        クリア
                    </button>
                </div>
            )}

            {/* 展開時のコンテンツ */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* AND/OR切り替え */}
                    {onModeChange && selectedTags.length > 1 && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">条件:</span>
                            <button
                                onClick={() => onModeChange('AND')}
                                className={`px-3 py-1 rounded-full text-xs transition-colors ${mode === 'AND'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                すべて含む (AND)
                            </button>
                            <button
                                onClick={() => onModeChange('OR')}
                                className={`px-3 py-1 rounded-full text-xs transition-colors ${mode === 'OR'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                いずれか含む (OR)
                            </button>
                        </div>
                    )}

                    {/* タグ一覧 */}
                    <div className="flex flex-wrap gap-2">
                        {sortedTags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${isSelected
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-foreground'
                                        }`}
                                >
                                    <Tag size={12} />
                                    {displayTagName(tag)}
                                </button>
                            );
                        })}
                    </div>

                    {/* 選択中タグ表示とクリアボタン */}
                    {selectedTags.length > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-sm text-muted-foreground">
                                {selectedTags.length}件のタグを選択中
                            </span>
                            <button
                                onClick={clearAll}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                すべてクリア
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
