import { useState, useRef, useEffect } from 'react';
import { X, Download, Upload, Database, Settings as SettingsIcon, AlertTriangle, Languages, FolderOpen, Save, Check, Trash2, Sparkles } from 'lucide-react';
import { exportData, importData } from '@/lib/backup';
import { clearApiCache } from '@/lib/api-cache';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

// Path settings keys
const PATHS_STORAGE_KEY = 'sekaowa_path_settings';

interface PathSettings {
    mediaRoot: string;
    galleryRoot: string;
    albumArtRoot: string;
}

const defaultPaths: PathSettings = {
    mediaRoot: 'programs/media',
    galleryRoot: 'F:\\セカオワの音源・ライブ・番組\\セカオワ　写真',
    albumArtRoot: 'programs/album_art'
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t, language, setLanguage } = useTranslation();
    const { animationSettings, setAnimationSettings, customColors, setCustomColors, setTheme, themeId } = useTheme();

    // Path settings state
    const [paths, setPaths] = useState<PathSettings>(defaultPaths);
    const [pathsSaved, setPathsSaved] = useState(false);

    // Load saved paths on mount
    useEffect(() => {
        const savedPaths = localStorage.getItem(PATHS_STORAGE_KEY);
        if (savedPaths) {
            try {
                setPaths(JSON.parse(savedPaths));
            } catch (e) {
                console.error('Failed to parse paths', e);
            }
        }
    }, []);

    if (!isOpen) return null;

    const handleExport = () => {
        exportData();
        setMessage({ type: 'success', text: 'Backup file downloaded.' });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const result = event.target?.result as string;
            const res = await importData(result);
            if (res.success) {
                setMessage({ type: 'success', text: res.message });
            } else {
                setMessage({ type: 'error', text: res.message });
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const handleSavePaths = async () => {
        localStorage.setItem(PATHS_STORAGE_KEY, JSON.stringify(paths));

        // Call API to update server-side paths
        try {
            const res = await fetch('/api/settings/paths', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paths)
            });

            if (res.ok) {
                setPathsSaved(true);
                setTimeout(() => setPathsSaved(false), 2000);
            }
        } catch (e) {
            console.error('Failed to save paths to server', e);
        }

        setPathsSaved(true);
        setTimeout(() => setPathsSaved(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <button
                        onClick={() => {
                            onClose();
                            window.location.href = "/settings";
                        }}
                        className="flex items-center gap-2 text-white font-medium hover:text-primary transition-colors group"
                    >
                        <div className="p-1 rounded bg-white/5 group-hover:bg-primary/20 transition-colors">
                            <SettingsIcon size={20} className="group-hover:text-primary transition-colors" />
                        </div>
                        <span>{t('settings.title')}</span>
                    </button>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        {t('settings.general')}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'paths' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
                        onClick={() => setActiveTab('paths')}
                    >
                        パス設定
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'data' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
                        onClick={() => setActiveTab('data')}
                    >
                        {t('settings.data')}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'theme' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
                        onClick={() => setActiveTab('theme')}
                    >
                        テーマ
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'animation' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
                        onClick={() => setActiveTab('animation')}
                    >
                        演出設定
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* ... other tabs ... */}

                    {activeTab === 'theme' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-white/10 rounded-lg p-4 flex items-start gap-3">
                                <Sparkles className="text-pink-400 shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="text-white font-medium text-sm">カスタムテーマ作成</h3>
                                    <p className="text-xs text-white/60 mt-1">
                                        あなただけのオリジナルカラーテーマを作成できます。
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">プライマリカラー (Main)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={customColors.primary}
                                            onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                                            className="h-10 w-20 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs font-mono text-white/70">{customColors.primary}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">背景色 (Background)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={customColors.background}
                                            onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                                            className="h-10 w-20 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs font-mono text-white/70">{customColors.background}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">セカンダリ/カード色 (Accent)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={customColors.secondary}
                                            onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                                            className="h-10 w-20 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs font-mono text-white/70">{customColors.secondary}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setTheme('custom')}
                                        className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${themeId === 'custom'
                                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {themeId === 'custom' ? (
                                            <>
                                                <Check size={18} />
                                                適用中
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                カスタムテーマを適用
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="space-y-6">

                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Languages className="text-primary shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-white font-medium text-sm">{t('common.language')}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{t('settings.language_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => setLanguage('ja')}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'ja' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                                    >
                                        日本語
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'en' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'paths' && (
                        <div className="space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                                <FolderOpen className="text-amber-400 shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="text-white font-medium text-sm">メディアパス設定</h3>
                                    <p className="text-xs text-white/60 mt-1">
                                        音源・ギャラリー画像のフォルダパスを指定します。変更後はサーバーの再起動が必要です。
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">
                                        メディアフォルダ（音源）
                                    </label>
                                    <input
                                        type="text"
                                        value={paths.mediaRoot}
                                        onChange={(e) => setPaths({ ...paths, mediaRoot: e.target.value })}
                                        placeholder="例: F:\Music\SEKAOWA"
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">
                                        ギャラリーフォルダ（写真）
                                    </label>
                                    <input
                                        type="text"
                                        value={paths.galleryRoot}
                                        onChange={(e) => setPaths({ ...paths, galleryRoot: e.target.value })}
                                        placeholder="例: F:\Photos\SEKAOWA"
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">
                                        アルバムアートフォルダ
                                    </label>
                                    <input
                                        type="text"
                                        value={paths.albumArtRoot}
                                        onChange={(e) => setPaths({ ...paths, albumArtRoot: e.target.value })}
                                        placeholder="例: programs/album_art"
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSavePaths}
                                className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${pathsSaved
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-primary hover:bg-primary/80 text-white'
                                    }`}
                            >
                                {pathsSaved ? (
                                    <>
                                        <Check size={18} />
                                        保存しました
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        パス設定を保存
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-muted-foreground text-center">
                                ※ パス変更を反映するにはサーバーを再起動してください
                            </p>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                                <Database className="text-primary shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="text-white font-medium text-sm">{t('settings.backup_restore')}</h3>
                                    <p className="text-xs text-white/60 mt-1">
                                        {t('settings.backup_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Export */}
                                <button
                                    onClick={handleExport}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
                                >
                                    <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                                        <Download size={24} className="text-white group-hover:text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-white">{t('settings.download_backup')}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">JSON</div>
                                    </div>
                                </button>

                                {/* Import */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={importing}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
                                >
                                    <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-white group-hover:text-emerald-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-white">{t('settings.restore_data')}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">JSON</div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".json"
                                        className="hidden"
                                    />
                                    {importing && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">ストレージ最適化</h3>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Database size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-white">アプリケーションキャッシュ</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                一時的なAPIデータを削除して、問題を解決したり空き容量を確保します。
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            clearApiCache();
                                            setMessage({ type: 'success', text: 'キャッシュを削除しました' });
                                            setTimeout(() => setMessage(null), 3000);
                                        }}
                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-all flex items-center gap-2 text-xs"
                                    >
                                        <Trash2 size={14} />
                                        削除
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded border text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {message.type === 'error' && <AlertTriangle size={14} />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'animation' && (
                        <div className="space-y-6">
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex items-start gap-3">
                                <Sparkles className="text-purple-400 shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="text-white font-medium text-sm">起動アニメーション設定</h3>
                                    <p className="text-xs text-white/60 mt-1">
                                        アプリ起動時やテーマ変更時の演出をカスタマイズします。
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div>
                                        <div className="text-sm font-medium text-white">アニメーションを有効にする</div>
                                        <div className="text-xs text-muted-foreground">起動時・テーマ変更時の演出</div>
                                    </div>
                                    <button
                                        onClick={() => setAnimationSettings({ ...animationSettings, enabled: !animationSettings.enabled })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${animationSettings.enabled ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${animationSettings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">演出強度 (Intensity)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["low", "normal", "high"] as const).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setAnimationSettings({ ...animationSettings, intensity: level })}
                                                className={`py-2 px-3 rounded-md text-xs font-medium border transition-all ${animationSettings.intensity === level
                                                    ? 'bg-primary/20 border-primary text-primary'
                                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                    }`}
                                            >
                                                {level.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Low: 控えめ (酔いにくい), High: 派手な演出
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">演出時間 (Duration)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(["short", "normal"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setAnimationSettings({ ...animationSettings, duration: mode })}
                                                className={`py-2 px-3 rounded-md text-xs font-medium border transition-all ${animationSettings.duration === mode
                                                    ? 'bg-primary/20 border-primary text-primary'
                                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                    }`}
                                            >
                                                {mode === "short" ? "SHORT (0.5s)" : "NORMAL (1.0s)"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="space-y-3">
                                        <label className="text-sm text-muted-foreground">カスタム表示テキスト</label>
                                        <input
                                            type="text"
                                            value={animationSettings.customText || ""}
                                            onChange={(e) => setAnimationSettings({ ...animationSettings, customText: e.target.value })}
                                            placeholder="Default: SEKAOWA / Theme Name"
                                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            未入力の場合はテーマ名が表示されます。
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <label className="text-sm text-muted-foreground">カスタム表示時間 (秒)</label>
                                            <span className="text-sm font-mono text-primary">
                                                {animationSettings.customDuration ? `${animationSettings.customDuration.toFixed(1)}s` : "Default"}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="5.0"
                                            step="0.1"
                                            value={animationSettings.customDuration || 1.0}
                                            onChange={(e) => setAnimationSettings({ ...animationSettings, customDuration: parseFloat(e.target.value) })}
                                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>0.5s</span>
                                            <span>5.0s</span>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setAnimationSettings({ ...animationSettings, customDuration: undefined })}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                デフォルトに戻す
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
