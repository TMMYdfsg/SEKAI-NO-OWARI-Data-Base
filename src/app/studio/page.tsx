"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Palette, Layout, Type, Image, Sparkles, Save, RotateCcw, Eye, Columns, Grid3x3, Moon, Sun, Check } from "lucide-react";
import Link from "next/link";
import { getThemeColor, setThemeColor, ThemeColor } from "@/lib/local-storage-data";

// Studio Settings Interface
interface StudioSettings {
    // Theme
    themeColor: ThemeColor;
    darkMode: boolean;
    accentColor: string;

    // Typography
    fontFamily: "default" | "serif" | "mono" | "rounded";
    fontSize: "small" | "medium" | "large";

    // Layout
    navPosition: "top" | "left" | "right";
    cardStyle: "minimal" | "bordered" | "elevated";
    gridDensity: "compact" | "normal" | "spacious";

    // Effects
    enableAnimations: boolean;
    enableGlassEffect: boolean;
    enableGradients: boolean;
}

const DEFAULT_SETTINGS: StudioSettings = {
    themeColor: "default",
    darkMode: true,
    accentColor: "#D4AF37",
    fontFamily: "default",
    fontSize: "medium",
    navPosition: "top",
    cardStyle: "bordered",
    gridDensity: "normal",
    enableAnimations: true,
    enableGlassEffect: true,
    enableGradients: false,
};

const STORAGE_KEY = "sekaowa_studio_settings";

const THEME_COLORS: { id: ThemeColor; label: string; color: string }[] = [
    { id: "default", label: "Default", color: "#D4AF37" },
    { id: "fukase", label: "Fukase", color: "#FF4B4B" },
    { id: "nakajin", label: "Nakajin", color: "#4B8BFF" },
    { id: "saori", label: "Saori", color: "#FF69B4" },
    { id: "djlove", label: "DJ LOVE", color: "#9B59B6" },
];

const FONT_OPTIONS = [
    { id: "default", label: "デフォルト", sample: "SEKAI NO OWARI" },
    { id: "serif", label: "セリフ体", sample: "SEKAI NO OWARI" },
    { id: "mono", label: "モノスペース", sample: "SEKAI NO OWARI" },
    { id: "rounded", label: "丸ゴシック", sample: "SEKAI NO OWARI" },
];

export default function StudioPage() {
    const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeSection, setActiveSection] = useState<"theme" | "typography" | "layout" | "effects">("theme");

    useEffect(() => {
        // Load saved settings
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load studio settings", e);
            }
        }
        // Also sync with global theme
        const globalTheme = getThemeColor();
        setSettings(prev => ({ ...prev, themeColor: globalTheme }));
    }, []);

    const updateSetting = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);

        // Apply theme color immediately
        if (key === "themeColor") {
            setThemeColor(value as ThemeColor);
        }
    };

    const saveSettings = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setHasChanges(false);
        alert("設定を保存しました！");
    };

    const resetSettings = () => {
        if (confirm("設定をデフォルトに戻しますか？")) {
            setSettings(DEFAULT_SETTINGS);
            setHasChanges(true);
        }
    };

    const sections = [
        { id: "theme", label: "テーマ", icon: Palette },
        { id: "typography", label: "タイポグラフィ", icon: Type },
        { id: "layout", label: "レイアウト", icon: Layout },
        { id: "effects", label: "エフェクト", icon: Sparkles },
    ] as const;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Palette className="text-primary" />
                                Design Studio
                            </h1>
                            <p className="text-xs text-muted-foreground">カスタマイズでお気に入りのデザインに</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <span className="text-xs text-yellow-500 animate-pulse">未保存の変更があります</span>
                        )}
                        <button
                            onClick={resetSettings}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RotateCcw size={14} />
                            リセット
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={!hasChanges}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${hasChanges
                                    ? "bg-primary text-white hover:bg-primary/80"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                                }`}
                        >
                            <Save size={14} />
                            保存
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all ${activeSection === section.id
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-transparent"
                                        }`}
                                >
                                    <section.icon size={18} />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Theme Section */}
                        {activeSection === "theme" && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Palette size={20} className="text-primary" />
                                    テーマカラー
                                </h2>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {THEME_COLORS.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateSetting("themeColor", theme.id)}
                                            className={`relative p-4 rounded-xl border transition-all ${settings.themeColor === theme.id
                                                    ? "border-white bg-white/10"
                                                    : "border-white/10 bg-white/5 hover:border-white/30"
                                                }`}
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg"
                                                style={{ backgroundColor: theme.color }}
                                            />
                                            <p className="text-sm text-center">{theme.label}</p>
                                            {settings.themeColor === theme.id && (
                                                <div className="absolute top-2 right-2 text-primary">
                                                    <Check size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Dark Mode Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                                        <div>
                                            <p className="font-medium">ダークモード</p>
                                            <p className="text-xs text-muted-foreground">画面の明暗を切り替えます</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSetting("darkMode", !settings.darkMode)}
                                        className={`w-14 h-8 rounded-full transition-colors ${settings.darkMode ? "bg-primary" : "bg-neutral-700"
                                            }`}
                                    >
                                        <div
                                            className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.darkMode ? "translate-x-7" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Typography Section */}
                        {activeSection === "typography" && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Type size={20} className="text-primary" />
                                    タイポグラフィ
                                </h2>

                                <div className="space-y-4">
                                    <h3 className="text-sm text-muted-foreground">フォントファミリー</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {FONT_OPTIONS.map((font) => (
                                            <button
                                                key={font.id}
                                                onClick={() => updateSetting("fontFamily", font.id as StudioSettings["fontFamily"])}
                                                className={`p-4 rounded-xl border text-left transition-all ${settings.fontFamily === font.id
                                                        ? "border-primary bg-primary/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/30"
                                                    }`}
                                            >
                                                <p className="text-xs text-muted-foreground mb-2">{font.label}</p>
                                                <p className={`text-lg ${font.id === "serif" ? "font-serif" :
                                                        font.id === "mono" ? "font-mono" : ""
                                                    }`}>
                                                    {font.sample}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm text-muted-foreground">フォントサイズ</h3>
                                    <div className="flex gap-4">
                                        {(["small", "medium", "large"] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => updateSetting("fontSize", size)}
                                                className={`flex-1 p-4 rounded-xl border text-center transition-all ${settings.fontSize === size
                                                        ? "border-primary bg-primary/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/30"
                                                    }`}
                                            >
                                                <span className={`${size === "small" ? "text-sm" :
                                                        size === "large" ? "text-xl" : "text-base"
                                                    }`}>
                                                    {size === "small" ? "小" : size === "large" ? "大" : "中"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Layout Section */}
                        {activeSection === "layout" && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Layout size={20} className="text-primary" />
                                    レイアウト
                                </h2>

                                <div className="space-y-4">
                                    <h3 className="text-sm text-muted-foreground">カードスタイル</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {(["minimal", "bordered", "elevated"] as const).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => updateSetting("cardStyle", style)}
                                                className={`p-4 rounded-xl transition-all ${settings.cardStyle === style
                                                        ? "ring-2 ring-primary"
                                                        : ""
                                                    } ${style === "minimal" ? "bg-transparent border border-dashed border-white/20" :
                                                        style === "bordered" ? "bg-white/5 border border-white/10" :
                                                            "bg-white/10 shadow-xl"
                                                    }`}
                                            >
                                                <p className="text-sm mb-2">
                                                    {style === "minimal" ? "ミニマル" :
                                                        style === "bordered" ? "ボーダー" : "エレベート"}
                                                </p>
                                                <div className={`h-12 rounded ${style === "minimal" ? "border border-dashed border-white/30" :
                                                        style === "bordered" ? "border border-white/20 bg-white/5" :
                                                            "bg-white/10 shadow-lg"
                                                    }`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm text-muted-foreground">グリッド密度</h3>
                                    <div className="flex gap-4">
                                        {(["compact", "normal", "spacious"] as const).map((density) => (
                                            <button
                                                key={density}
                                                onClick={() => updateSetting("gridDensity", density)}
                                                className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${settings.gridDensity === density
                                                        ? "border-primary bg-primary/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/30"
                                                    }`}
                                            >
                                                <Grid3x3 size={20} className={density === "compact" ? "scale-75" : density === "spacious" ? "scale-125" : ""} />
                                                <span className="text-xs">
                                                    {density === "compact" ? "コンパクト" :
                                                        density === "spacious" ? "ゆったり" : "標準"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Effects Section */}
                        {activeSection === "effects" && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles size={20} className="text-primary" />
                                    エフェクト
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { key: "enableAnimations" as const, label: "アニメーション", desc: "ホバー時やページ遷移のアニメーション" },
                                        { key: "enableGlassEffect" as const, label: "グラスエフェクト", desc: "半透明のぼかし効果" },
                                        { key: "enableGradients" as const, label: "グラデーション", desc: "背景やボタンにグラデーション" },
                                    ].map((effect) => (
                                        <div
                                            key={effect.key}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                                        >
                                            <div>
                                                <p className="font-medium">{effect.label}</p>
                                                <p className="text-xs text-muted-foreground">{effect.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => updateSetting(effect.key, !settings[effect.key])}
                                                className={`w-14 h-8 rounded-full transition-colors ${settings[effect.key] ? "bg-primary" : "bg-neutral-700"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-6 h-6 bg-white rounded-full transition-transform ${settings[effect.key] ? "translate-x-7" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Preview Section */}
                        <section className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Eye size={16} className="text-muted-foreground" />
                                <h3 className="text-sm text-muted-foreground">プレビュー</h3>
                            </div>
                            <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
                                <h4 className="text-2xl font-bold" style={{ color: THEME_COLORS.find(t => t.id === settings.themeColor)?.color }}>
                                    サンプルタイトル
                                </h4>
                                <p className="text-muted-foreground">これはサンプルテキストです。設定が反映されたプレビューを確認できます。</p>
                                <div className="flex gap-3">
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                        style={{ backgroundColor: THEME_COLORS.find(t => t.id === settings.themeColor)?.color }}
                                    >
                                        プライマリボタン
                                    </button>
                                    <button className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors">
                                        セカンダリボタン
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
