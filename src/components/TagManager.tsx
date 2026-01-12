"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Tag, X, Plus, Sparkles } from "lucide-react";
import { normalizeTagName, displayTagName, AUTO_TAG_SUGGESTIONS, MEMORY_TAG_PRESETS } from "@/types/tags";

interface TagManagerProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    eventTypes?: string[];  // イベントタイプからの自動提案用
    showMemoryTags?: boolean;  // 記憶タグを表示するか
    placeholder?: string;
}

export default function TagManager({
    tags,
    onChange,
    eventTypes = [],
    showMemoryTags = false,
    placeholder = "タグを追加..."
}: TagManagerProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 自動タグ提案を生成 (useMemo to prevent infinite loops)
    const suggestions = useMemo(() => {
        const autoSuggestions: string[] = [];

        // イベントタイプから提案
        eventTypes.forEach(type => {
            const suggested = AUTO_TAG_SUGGESTIONS[type];
            if (suggested) {
                suggested.forEach(tag => {
                    if (!tags.includes(tag) && !autoSuggestions.includes(tag)) {
                        autoSuggestions.push(tag);
                    }
                });
            }
        });

        return autoSuggestions;
    }, [eventTypes, tags]);

    // 入力からの提案（部分一致）
    const getInputSuggestions = (): string[] => {
        if (!inputValue.trim()) return [];

        const normalized = normalizeTagName(inputValue);
        const allSuggestions = Object.values(AUTO_TAG_SUGGESTIONS).flat();

        return allSuggestions
            .filter(tag => tag.includes(normalized) && !tags.includes(tag))
            .slice(0, 5);
    };

    // タグを追加
    const addTag = (tagName: string) => {
        const normalized = normalizeTagName(tagName);
        if (normalized && !tags.includes(normalized)) {
            onChange([...tags, normalized]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    // タグを削除
    const removeTag = (tagName: string) => {
        onChange(tags.filter(t => t !== tagName));
    };

    // キー入力処理
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    // 外部クリックで提案を閉じる
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const inputSuggestions = getInputSuggestions();

    return (
        <div className="space-y-3" ref={containerRef}>
            {/* タグ一覧 */}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                        <Tag size={12} />
                        {displayTagName(tag)}
                        <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>

            {/* 入力フィールド */}
            <div className="relative">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-white/20 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        onClick={() => inputValue.trim() && addTag(inputValue)}
                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* 入力中の提案 */}
                {showSuggestions && inputSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-white/20 rounded-lg shadow-lg overflow-hidden">
                        {inputSuggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => addTag(suggestion)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <Tag size={12} className="text-muted-foreground" />
                                {displayTagName(suggestion)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 自動提案（イベントタイプから） */}
            {suggestions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles size={12} />
                        おすすめタグ
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => addTag(suggestion)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-muted-foreground rounded-full text-xs hover:bg-white/10 hover:text-foreground transition-colors border border-white/10"
                            >
                                <Plus size={10} />
                                {displayTagName(suggestion)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 記憶タグ（曲専用） */}
            {showMemoryTags && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">記憶タグ</p>
                    <div className="flex flex-wrap gap-2">
                        {MEMORY_TAG_PRESETS.map(preset => {
                            const isSelected = tags.includes(preset.name);
                            return (
                                <button
                                    key={preset.name}
                                    onClick={() => isSelected ? removeTag(preset.name) : addTag(preset.name)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${isSelected
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span>{preset.emoji}</span>
                                    {preset.displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
