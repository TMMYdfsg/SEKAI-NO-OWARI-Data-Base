"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Save, X, Plus, Trash2,
    Music, Star, Mic2, Tv, Radio, Globe, BookOpen, Sparkles, Calendar as CalendarIcon
} from "lucide-react";
import type { HistoryEvent, EventType, LiveInfo, SetlistItem, ReleaseInfo, TVInfo } from "@/types/history";

const eventTypeOptions: { value: EventType; label: string; icon: React.ReactNode }[] = [
    { value: "Live", label: "ライブ", icon: <Mic2 size={16} className="text-red-400" /> },
    { value: "Release", label: "リリース", icon: <Music size={16} className="text-green-400" /> },
    { value: "TV", label: "テレビ", icon: <Tv size={16} className="text-blue-400" /> },
    { value: "Radio", label: "ラジオ", icon: <Radio size={16} className="text-purple-400" /> },
    { value: "Magazine", label: "雑誌", icon: <BookOpen size={16} className="text-amber-400" /> },
    { value: "Web", label: "Web", icon: <Globe size={16} className="text-cyan-400" /> },
    { value: "Milestone", label: "マイルストーン", icon: <Star size={16} className="text-yellow-400" /> },
    { value: "Formation", label: "結成", icon: <Sparkles size={16} className="text-pink-400" /> },
    { value: "Other", label: "その他", icon: <CalendarIcon size={16} className="text-gray-400" /> },
];

const releaseTypes = ["Single", "Album", "EP", "Video", "Other"] as const;

export default function NewHistoryPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Form state
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number | "">("");
    const [day, setDay] = useState<number | "">("");
    const [title, setTitle] = useState("");
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [detailsOfficial, setDetailsOfficial] = useState("");
    const [detailsBehindTheScenes, setDetailsBehindTheScenes] = useState("");
    const [detailsPersonalMemo, setDetailsPersonalMemo] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [visibility, setVisibility] = useState<"public" | "hidden" | "private">("public");

    // Live-specific
    const [venue, setVenue] = useState("");
    const [city, setCity] = useState("");
    const [tourName, setTourName] = useState("");
    const [setlist, setSetlist] = useState<SetlistItem[]>([]);

    // Release-specific
    const [releaseType, setReleaseType] = useState<typeof releaseTypes[number]>("Single");

    // TV-specific
    const [programName, setProgramName] = useState("");
    const [broadcaster, setBroadcaster] = useState("");

    // Toggle event type
    const toggleEventType = (type: EventType) => {
        setEventTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    // Add tag
    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
            setTags([...tags, newTag.trim().toLowerCase()]);
            setNewTag("");
        }
    };

    // Remove tag
    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    // Add setlist item
    const addSetlistItem = () => {
        const newItem: SetlistItem = {
            id: `setlist-${Date.now()}`,
            type: "song",
            songTitle: "",
            order: setlist.length + 1,
        };
        setSetlist([...setlist, newItem]);
    };

    // Update setlist item
    const updateSetlistItem = (index: number, updates: Partial<SetlistItem>) => {
        setSetlist((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
        );
    };

    // Remove setlist item
    const removeSetlistItem = (index: number) => {
        setSetlist((prev) => prev.filter((_, i) => i !== index));
    };

    // Save
    const handleSave = async () => {
        if (!title.trim()) {
            alert("タイトルは必須です");
            return;
        }

        if (eventTypes.length === 0) {
            alert("イベント種別を1つ以上選択してください");
            return;
        }

        setSaving(true);

        const event: Partial<HistoryEvent> = {
            date: {
                year,
                ...(month ? { month: month as number } : {}),
                ...(day ? { day: day as number } : {}),
            },
            title: title.trim(),
            eventTypes,
            details: {
                official: detailsOfficial || undefined,
                behindTheScenes: detailsBehindTheScenes || undefined,
                personalMemo: detailsPersonalMemo || undefined,
            },
            tags,
            visibility,
        };

        // Add Live info
        if (eventTypes.includes("Live") && (venue || setlist.length > 0)) {
            event.liveInfo = {
                venue: { name: venue, city: city || undefined },
                tourName: tourName || undefined,
                setlist: setlist.filter((s) => s.songTitle?.trim()),
            };
        }

        // Add Release info
        if (eventTypes.includes("Release")) {
            event.releaseInfo = {
                releaseType,
            };
        }

        // Add TV info
        if (eventTypes.includes("TV") && programName) {
            event.tvInfo = {
                programName,
                broadcaster: broadcaster || undefined,
            };
        }

        try {
            const res = await fetch("/api/db/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event),
            });

            if (res.ok) {
                router.push("/history");
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

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={20} />
                        キャンセル
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? "保存中..." : "保存"}
                    </button>
                </div>

                <h1 className="text-3xl font-bold font-serif text-primary mb-8">
                    新規ヒストリー追加
                </h1>

                <div className="space-y-8">
                    {/* Date Input */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CalendarIcon size={20} className="text-primary" />
                            日付
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    年 <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                                    min={1990}
                                    max={2030}
                                    className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    月 <span className="text-muted-foreground/50">(任意)</span>
                                </label>
                                <input
                                    type="number"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : "")}
                                    min={1}
                                    max={12}
                                    placeholder="--"
                                    className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">
                                    日 <span className="text-muted-foreground/50">(任意)</span>
                                </label>
                                <input
                                    type="number"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value ? parseInt(e.target.value) : "")}
                                    min={1}
                                    max={31}
                                    placeholder="--"
                                    className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            日付不明の場合は年のみ、または年月のみでも登録できます
                        </p>
                    </section>

                    {/* Title */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">
                            タイトル <span className="text-red-400">*</span>
                        </h2>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例: DOME TOUR 2024 'Phoenix'"
                            maxLength={120}
                            className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {title.length}/120
                        </p>
                    </section>

                    {/* Event Types */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">
                            イベント種別 <span className="text-red-400">*</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {eventTypeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggleEventType(option.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${eventTypes.includes(option.value)
                                            ? "bg-primary/20 border-primary/50 text-primary"
                                            : "bg-background border-white/20 text-muted-foreground hover:border-white/40"
                                        }`}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            複数選択可能です（例: ライブ+テレビ）
                        </p>
                    </section>

                    {/* Details (Multiple Layers) */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">詳細テキスト</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                    公式情報
                                </label>
                                <textarea
                                    value={detailsOfficial}
                                    onChange={(e) => setDetailsOfficial(e.target.value)}
                                    placeholder="出典情報や客観的な事実..."
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
                                    value={detailsBehindTheScenes}
                                    onChange={(e) => setDetailsBehindTheScenes(e.target.value)}
                                    placeholder="裏設定、推測、考察..."
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
                                    value={detailsPersonalMemo}
                                    onChange={(e) => setDetailsPersonalMemo(e.target.value)}
                                    placeholder="自分の思い出、日記..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Live-specific options */}
                    {eventTypes.includes("Live") && (
                        <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Mic2 size={20} className="text-red-400" />
                                ライブ情報
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">会場名</label>
                                    <input
                                        type="text"
                                        value={venue}
                                        onChange={(e) => setVenue(e.target.value)}
                                        placeholder="例: 東京ドーム"
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">都市</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="例: 東京"
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-muted-foreground mb-1">ツアー名（任意）</label>
                                <input
                                    type="text"
                                    value={tourName}
                                    onChange={(e) => setTourName(e.target.value)}
                                    placeholder="例: DOME TOUR 2024 'Phoenix'"
                                    className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Setlist */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm text-muted-foreground">セットリスト</label>
                                    <button
                                        type="button"
                                        onClick={addSetlistItem}
                                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                                    >
                                        <Plus size={14} /> 曲を追加
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {setlist.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                                            <select
                                                value={item.type}
                                                onChange={(e) => updateSetlistItem(index, { type: e.target.value as SetlistItem["type"] })}
                                                className="px-2 py-1 bg-background border border-white/20 rounded text-sm"
                                            >
                                                <option value="song">曲</option>
                                                <option value="mc">MC</option>
                                                <option value="se">SE</option>
                                                <option value="encore">アンコール</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={item.songTitle || item.text || ""}
                                                onChange={(e) =>
                                                    updateSetlistItem(index, {
                                                        songTitle: item.type === "song" ? e.target.value : undefined,
                                                        text: item.type !== "song" ? e.target.value : undefined,
                                                    })
                                                }
                                                placeholder={item.type === "song" ? "曲名" : "内容"}
                                                className="flex-1 px-3 py-1 bg-background border border-white/20 rounded focus:outline-none focus:border-primary text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSetlistItem(index)}
                                                className="text-red-400/50 hover:text-red-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Release-specific options */}
                    {eventTypes.includes("Release") && (
                        <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Music size={20} className="text-green-400" />
                                リリース情報
                            </h2>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">リリース種別</label>
                                <div className="flex flex-wrap gap-2">
                                    {releaseTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setReleaseType(type)}
                                            className={`px-4 py-2 rounded-lg border transition-colors ${releaseType === type
                                                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                                                    : "bg-background border-white/20 text-muted-foreground hover:border-white/40"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TV-specific options */}
                    {eventTypes.includes("TV") && (
                        <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Tv size={20} className="text-blue-400" />
                                テレビ情報
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">番組名</label>
                                    <input
                                        type="text"
                                        value={programName}
                                        onChange={(e) => setProgramName(e.target.value)}
                                        placeholder="例: ミュージックステーション"
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-1">放送局</label>
                                    <input
                                        type="text"
                                        value={broadcaster}
                                        onChange={(e) => setBroadcaster(e.target.value)}
                                        placeholder="例: テレビ朝日"
                                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Tags */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">タグ</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map((tag) => (
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
                                className="flex-1 px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary/20"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </section>

                    {/* Visibility */}
                    <section className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">公開設定</h2>
                        <div className="flex gap-4">
                            {(["public", "hidden", "private"] as const).map((v) => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={visibility === v}
                                        onChange={() => setVisibility(v)}
                                        className="accent-primary"
                                    />
                                    <span className={visibility === v ? "text-foreground" : "text-muted-foreground"}>
                                        {v === "public" ? "公開" : v === "hidden" ? "一覧から非表示" : "完全非公開"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Bottom save button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? "保存中..." : "ヒストリーを保存"}
                    </button>
                </div>
            </div>
        </div>
    );
}
