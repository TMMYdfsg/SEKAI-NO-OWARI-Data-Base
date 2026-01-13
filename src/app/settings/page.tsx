"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, FolderOpen, Save, Check, AlertCircle, Palette, Globe, HardDrive, Smartphone, Download, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColor } from "@/lib/local-storage-data";
// import { createBackup, restoreBackup, clearCache } from "@/lib/database"; // Removed to fix build error
import { clearServerCache } from "@/app/actions/system"; // Use Server Action

const SETTINGS_KEY = "sekaowa_settings";

interface AppSettings {
    albumArtPath: string;
    language: "ja" | "en" | "zh";
}

export default function SettingsPage() {
    const { themeId, setTheme } = useTheme();
    const [settings, setSettings] = useState<AppSettings>({
        albumArtPath: "",
        language: "ja",
    });
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backupStatus, setBackupStatus] = useState<string | null>(null);
    const [fileInputKey, setFileInputKey] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            setError("設定の保存に失敗しました");
        }
    };

    const handleBackup = async () => {
        setBackupStatus("バックアップを作成中...");
        try {
            // Use API route instead of direct import
            const res = await fetch('/api/backup');
            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sekaowa-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setBackupStatus("バックアップをダウンロードしました");
        } catch (e) {
            console.error(e);
            setBackupStatus("バックアップ作成に失敗しました");
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setBackupStatus("復元中...");

        try {
            const text = await file.text();

            // Validate JSON
            try {
                JSON.parse(text);
            } catch {
                setBackupStatus("無効なJSONファイルです");
                return;
            }

            // Post to API
            const res = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: text
            });

            const result = await res.json();

            if (result.success) {
                setBackupStatus("データの復元が完了しました。ページをリロードします。");
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setBackupStatus("データの復元に失敗しました。");
            }
        } catch (e) {
            console.error(e);
            setBackupStatus("ファイルの読み込みに失敗しました");
        }

        // Reset file input
        setFileInputKey(prev => prev + 1);
    };

    const handleClearCache = async () => {
        if (confirm("キャッシュを削除しますか？\n（アプリケーションの動作が重い場合に有効です）")) {
            // Use Server Action
            await clearServerCache();
            alert("キャッシュを削除しました");
        }
    };

    const themeOptions: { value: ThemeColor; label: string; color: string; group?: string }[] = [
        // Member Color Themes
        { value: "default", label: "Default", color: "bg-purple-500", group: "member" },
        { value: "fukase", label: "Fukase", color: "bg-rose-500", group: "member" },
        { value: "nakajin", label: "Nakajin", color: "bg-sky-600", group: "member" },
        { value: "saori", label: "Saori", color: "bg-yellow-500", group: "member" },
        { value: "djlove", label: "DJ LOVE", color: "bg-fuchsia-500", group: "member" },
        // Album Themes
        { value: "twilight", label: "Twilight", color: "bg-gradient-to-r from-purple-500 to-pink-500", group: "album" },
        { value: "dragonNight", label: "Dragon Night", color: "bg-gradient-to-r from-blue-600 to-yellow-500", group: "album" },
        { value: "tree", label: "Tree", color: "bg-gradient-to-r from-emerald-500 to-amber-600", group: "album" },
        { value: "nautilus", label: "Nautilus", color: "bg-gradient-to-r from-blue-600 to-cyan-400", group: "album" },
    ];

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Settings size={40} className="text-primary" />
                    <h1 className="text-4xl font-bold font-serif text-primary">
                        設定
                    </h1>
                </div>

                <div className="space-y-8">
                    {/* Theme Settings */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Palette size={20} className="text-primary" />
                            <h2 className="text-lg font-medium">テーマ設定</h2>
                        </div>

                        {/* Member Color Themes */}
                        <div className="mb-6">
                            <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">メンバーカラー</h3>
                            <div className="flex flex-wrap gap-3">
                                {themeOptions.filter(o => o.group === "member").map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${themeId === option.value
                                            ? "border-primary bg-primary/10"
                                            : "border-transparent hover:bg-white/5"
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-full ${option.color} shadow-lg`} />
                                        <span className="text-xs font-medium text-muted-foreground">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Album Themes */}
                        <div>
                            <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">アルバムテーマ</h3>
                            <div className="flex flex-wrap gap-3">
                                {themeOptions.filter(o => o.group === "album").map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${themeId === option.value
                                            ? "border-primary bg-primary/10"
                                            : "border-transparent hover:bg-white/5"
                                            }`}
                                    >
                                        <span className={`w-10 h-6 rounded-md ${option.color} shadow-lg`} />
                                        <span className="text-xs font-medium text-muted-foreground">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Design Studio Link */}
                    <Link
                        href="/studio"
                        className="block bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Palette size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                <div>
                                    <h2 className="text-lg font-medium text-white">Design Studio</h2>
                                    <p className="text-sm text-muted-foreground">テーマ、タイポグラフィ、レイアウトをカスタマイズ</p>
                                </div>
                            </div>
                            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">NEW</span>
                        </div>
                    </Link>

                    {/* Language Settings (Mock) */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe size={20} className="text-primary" />
                            <h2 className="text-lg font-medium">言語設定 (Language)</h2>
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                                {(["ja", "en", "zh"] as const).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSettings({ ...settings, language: lang })}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${settings.language === lang
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-white"
                                            }`}
                                    >
                                        {lang === "ja" ? "日本語" : lang === "en" ? "English" : "中文"}
                                    </button>
                                ))}
                            </div>
                            {settings.language !== "ja" && (
                                <p className="text-xs text-yellow-500/80 flex items-center gap-1 mt-2">
                                    <AlertCircle size={12} />
                                    翻訳機能は現在開発中です。一部のコンテンツのみ適用されます。
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Sync & Backup */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <HardDrive size={20} className="text-primary" />
                            <h2 className="text-lg font-medium">データ管理・共有</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-6">
                            <Link
                                href="/settings/sync"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500/30">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">デバイス同期</h3>
                                    <p className="text-xs text-muted-foreground">スマホなど他の端末からアクセス</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleBackup}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group text-left"
                            >
                                <div className="p-3 bg-green-500/20 rounded-lg text-green-400 group-hover:bg-green-500/30">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-green-300 transition-colors">バックアップ</h3>
                                    <p className="text-xs text-muted-foreground">現在のデータをダウンロード</p>
                                </div>
                            </button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2 cursor-pointer hover:text-white transition-colors w-fit">
                                    <Upload size={16} />
                                    <span>バックアップから復元する</span>
                                    <input
                                        key={fileInputKey}
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleRestore}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={handleClearCache}
                                    className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12} />
                                    データベースのキャッシュをクリア
                                </button>
                            </div>

                            {backupStatus && (
                                <div className={`p-3 rounded-lg text-sm ${backupStatus.includes("失敗") || backupStatus.includes("無効") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                                    {backupStatus}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Media Folder Info */}
                    <div className="bg-card border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FolderOpen size={20} className="text-muted-foreground" />
                            <h2 className="text-lg font-medium">メディアフォルダ設定</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            アルバムアートのパスやフォルダ構成を確認できます。
                        </p>
                        <input
                            type="text"
                            value={settings.albumArtPath || ""}
                            onChange={(e) => setSettings({ ...settings, albumArtPath: e.target.value })}
                            placeholder="例: C:\Music\AlbumArt"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                        />
                        <div className="text-sm text-muted-foreground space-y-2 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
                            <div>programs/media/</div>
                            <div className="pl-4">├── <span className="text-green-400">*.mp3</span> (Original)</div>
                            <div className="pl-4">├── rare/</div>
                            <div className="pl-8">└── <span className="text-green-400">*.mp3</span> (Rare)</div>
                            <div className="pl-4">└── videos/...</div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${saved
                                ? "bg-green-500 text-white"
                                : "bg-primary text-primary-foreground hover:bg-primary/80"
                                }`}
                        >
                            {saved ? (
                                <>
                                    <Check size={18} />
                                    保存完了
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    設定を保存
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
