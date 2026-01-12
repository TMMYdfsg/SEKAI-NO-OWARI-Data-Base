"use client";

import { useState, useEffect, useMemo } from "react";
import { errorCatalog, ErrorCard, ErrorCategory } from "@/data/error-catalog";
import { ERROR_TRACKLIST, TRACKLIST_UNLOCK_CONDITION } from "@/data/error-tracklist";
import {
    hasErrorHiddenUnlocked,
    unlockErrorHidden,
    hasErrorTracklistUnlocked,
    unlockErrorTracklist,
    getErrorLogs,
    ErrorLogEntry,
    toggleFavorite,
    isFavorite,
} from "@/lib/local-storage-data";
import { NoiseEffect } from "@/components/NoiseEffect";
import {
    ArrowLeft,
    Lock,
    Unlock,
    Music2,
    FileText,
    Play,
    Heart,
    Terminal,
    Clock,
    AlertCircle,
    Zap,
    Skull
} from "lucide-react";
import Link from "next/link";
import { usePlayer, Track } from "@/contexts/PlayerContext";

const CATEGORIES: { id: ErrorCategory; label: string }[] = [
    { id: "GENERAL", label: "GENERAL" },
    { id: "NOT FOUND", label: "NOT FOUND" },
    { id: "PLAYBACK", label: "PLAYBACK" },
    { id: "LINKS", label: "LINKS" },
    { id: "HIDDEN", label: "HIDDEN" },
];

export default function ErrorArchivePage() {
    const [activeTab, setActiveTab] = useState<ErrorCategory>("GENERAL");
    const [isHiddenUnlocked, setIsHiddenUnlocked] = useState(false);
    const [isTracklistUnlocked, setIsTracklistUnlocked] = useState(false);

    // Gimmick State
    const [sequence, setSequence] = useState<string[]>([]);
    const [showNoise, setShowNoise] = useState(false);
    const [noiseIntensity, setNoiseIntensity] = useState<"low" | "medium" | "high">("medium");
    const [successAnimation, setSuccessAnimation] = useState(false);

    // Tracklist Puzzle State
    const [clickedCards, setClickedCards] = useState<string[]>([]);
    const [tracklistPuzzleActive, setTracklistPuzzleActive] = useState(false);

    // Error Display State
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Error Logs
    const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
    const [showLogs, setShowLogs] = useState(true);

    // Favorites for tracklist
    const [favs, setFavs] = useState<Set<string>>(new Set());

    // Local Files for playback
    const [localFiles, setLocalFiles] = useState<any[]>([]);

    const { playSong } = usePlayer();

    useEffect(() => {
        setIsHiddenUnlocked(hasErrorHiddenUnlocked());
        setIsTracklistUnlocked(hasErrorTracklistUnlocked());
        setErrorLogs(getErrorLogs());

        // Load files for playback
        fetch('/api/files')
            .then(res => res.json())
            .then(data => setLocalFiles(data.files || []))
            .catch(e => console.error(e));

        // Init favorites
        const currentFavs = new Set<string>();
        ERROR_TRACKLIST.forEach(t => {
            if (isFavorite(t.title)) currentFavs.add(t.title);
        });
        setFavs(currentFavs);
    }, []);

    // Activate tracklist puzzle after HIDDEN is unlocked
    useEffect(() => {
        if (isHiddenUnlocked && !isTracklistUnlocked) {
            setTracklistPuzzleActive(true);
        }
    }, [isHiddenUnlocked, isTracklistUnlocked]);

    // Filter Logic
    const filteredCards = useMemo(() => {
        return errorCatalog.filter(card => card.category === activeTab);
    }, [activeTab]);

    // E-R-R-O-R Gimmick Logic
    const TARGET_SEQ = ['E', 'R', 'R', 'O', 'R'];

    const handleLetterClick = (char: string, index: number) => {
        const currentIndex = sequence.length;

        if (index === currentIndex && char === TARGET_SEQ[currentIndex]) {
            const newSeq = [...sequence, char];
            setSequence(newSeq);

            if (newSeq.length === TARGET_SEQ.length) {
                // Success!
                setSuccessAnimation(true);
                setTimeout(() => {
                    unlockErrorHidden();
                    setIsHiddenUnlocked(true);
                    setSuccessAnimation(false);
                    setSequence([]);
                }, 1500);
            }
        } else {
            triggerFailure();
        }
    };

    const triggerFailure = () => {
        setShowNoise(true);
        setSequence([]);
        setNoiseIntensity("high");

        // Display error message
        const messages = [
            "SEQUENCE_ERROR: 順番が違います",
            "ACCESS_DENIED: 正しい順序で入力してください",
            "FATAL_ERROR: シーケンス異常検出",
            "SYNTAX_ERROR: 無効な入力順序",
            "RUNTIME_ERROR: 予期しない文字入力",
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setErrorMessage(randomMsg);

        // Clear error message after a delay
        setTimeout(() => setErrorMessage(null), 2500);
    };

    // Tracklist Puzzle: Click specific error cards
    const handleCardClick = (cardId: string) => {
        if (!tracklistPuzzleActive || isTracklistUnlocked) return;

        if (TRACKLIST_UNLOCK_CONDITION.targetCards.includes(cardId)) {
            if (!clickedCards.includes(cardId)) {
                const newClicked = [...clickedCards, cardId];
                setClickedCards(newClicked);

                if (newClicked.length >= TRACKLIST_UNLOCK_CONDITION.requiredClicks) {
                    // Unlock tracklist!
                    unlockErrorTracklist();
                    setIsTracklistUnlocked(true);
                    setTracklistPuzzleActive(false);
                }
            }
        }
    };

    const getCharColor = (index: number) => {
        const isPast = index < sequence.length;
        if (!isPast) return "text-neutral-600 hover:text-neutral-400";

        if (TARGET_SEQ[index] === 'E' || TARGET_SEQ[index] === 'O') {
            return "text-neutral-200";
        }

        if (TARGET_SEQ[index] === 'R') {
            if (index === 1) return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]";
            if (index === 2) return "text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]";
            if (index === 4) return "text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]";
        }
        return "text-neutral-200";
    };

    const handlePlayTrack = (title: string) => {
        const file = localFiles.find(f => f.name.toLowerCase().includes(title.toLowerCase()));
        if (file) {
            const track: Track = {
                name: file.name,
                path: file.path,
                type: file.type,
                category: file.category,
                thumbnail: file.thumbnail,
                album: "ERROR ARCHIVE",
            };
            playSong(track);
        }
    };

    const handleToggleFav = (title: string) => {
        const newState = toggleFavorite(title);
        setFavs(prev => {
            const next = new Set(prev);
            if (newState) next.add(title);
            else next.delete(title);
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-black text-neutral-400 font-mono pb-24 selection:bg-red-900 selection:text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-black to-black" />
                {/* Scanlines */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)",
                    }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 pt-24 pb-12 px-6 border-b border-neutral-900">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-red-900/50">
                            {isHiddenUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                            <span className="text-xs tracking-[0.3em]">
                                {isHiddenUnlocked ? "ACCESS GRANTED" : "RESTRICTED AREA"}
                            </span>
                        </div>

                        {/* Interactive ERROR Gimmick */}
                        <h1 className={`text-6xl md:text-8xl font-black tracking-widest select-none flex gap-4 transition-all duration-300 ${successAnimation ? "animate-pulse scale-110" : ""}`}>
                            {['E', 'R', 'R', 'O', 'R'].map((char, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleLetterClick(char, index)}
                                    className={`transition-all duration-300 hover:scale-110 active:scale-95 ${getCharColor(index)} ${successAnimation ? "text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]" : ""}`}
                                    style={{
                                        textShadow: successAnimation ? "0 0 30px rgba(34,197,94,0.8)" : undefined,
                                    }}
                                >
                                    {char}
                                </button>
                            ))}
                        </h1>
                        <p className="mt-4 text-sm text-neutral-600 tracking-widest">
                            SYSTEM_FAILURE_LOG // ARCHIVE
                        </p>

                        {/* Puzzle Hint */}
                        {!isHiddenUnlocked && (
                            <p className="mt-2 text-xs text-red-900/50 animate-pulse">
                                HINT: 文字を正しい順序でクリック...
                            </p>
                        )}
                        {isHiddenUnlocked && !isTracklistUnlocked && (
                            <p className="mt-2 text-xs text-yellow-900/50 animate-pulse">
                                PHASE 2: 特定のエラーカードを発見せよ... ({clickedCards.length}/{TRACKLIST_UNLOCK_CONDITION.requiredClicks})
                            </p>
                        )}

                        {/* Error Message Display */}
                        {errorMessage && (
                            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg animate-pulse">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <span className="text-red-400 text-sm font-mono tracking-wider">
                                        {errorMessage}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                            if (cat.id === "HIDDEN" && !isHiddenUnlocked) return null;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`px-4 py-2 text-xs tracking-wider border transition-all ${activeTab === cat.id
                                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 text-neutral-600"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-16">

                {/* SYSTEM LOG Section */}
                <section>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-6">
                        <div className="flex items-center gap-3">
                            <Terminal size={16} className="text-red-500" />
                            <h2 className="text-sm tracking-widest text-neutral-500">SYSTEM_LOG</h2>
                            <span className="text-[10px] bg-red-900/30 text-red-500 px-2 py-0.5 rounded">
                                {errorLogs.length} ENTRIES
                            </span>
                        </div>
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className="text-xs text-neutral-600 hover:text-white transition-colors"
                        >
                            {showLogs ? "COLLAPSE" : "EXPAND"}
                        </button>
                    </div>

                    {showLogs && (
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 max-h-64 overflow-auto">
                            {errorLogs.length > 0 ? (
                                <div className="space-y-2">
                                    {errorLogs.slice(0, 10).map((log, i) => (
                                        <div key={i} className="flex items-center gap-4 text-xs text-neutral-500 py-2 border-b border-neutral-800/50 last:border-0">
                                            <AlertCircle size={12} className="text-red-500 shrink-0" />
                                            <span className="text-red-400 font-bold w-12">{log.code}</span>
                                            <span className="text-neutral-400 truncate flex-1 font-mono">{log.path}</span>
                                            <span className="text-neutral-600 shrink-0">
                                                <Clock size={10} className="inline mr-1" />
                                                {new Date(log.timestamp).toLocaleString('ja-JP')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-600 text-xs">
                                    <Skull size={24} className="mx-auto mb-2 opacity-50" />
                                    NO_ERRORS_RECORDED
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* TRACKLIST Section */}
                <section>
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-2 mb-6">
                        <Music2 size={16} className={isTracklistUnlocked ? "text-green-500" : "text-neutral-700"} />
                        <h2 className="text-sm tracking-widest text-neutral-500">ERROR_TRACKLIST</h2>
                        {isTracklistUnlocked ? (
                            <span className="text-[10px] bg-green-900/30 text-green-500 px-2 py-0.5 rounded flex items-center gap-1">
                                <Unlock size={10} /> UNLOCKED
                            </span>
                        ) : (
                            <span className="text-[10px] bg-neutral-800 text-neutral-600 px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock size={10} /> LOCKED
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ERROR_TRACKLIST.map((track, idx) => {
                            const isLocked = !isTracklistUnlocked;
                            const isFav = favs.has(track.title);

                            return (
                                <div
                                    key={track.id}
                                    className={`group relative p-4 border transition-all duration-300 ${isLocked
                                        ? "border-neutral-800 bg-neutral-900/30 opacity-50"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-red-900/50 hover:bg-neutral-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-neutral-700 font-mono w-6">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>

                                        {isLocked ? (
                                            <>
                                                <Lock size={14} className="text-neutral-700" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-neutral-800 rounded w-32 mb-1" />
                                                    <div className="h-3 bg-neutral-800/50 rounded w-24" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handlePlayTrack(track.title)}
                                                    className="p-2 bg-red-900/20 rounded-full hover:bg-red-900/40 transition-colors"
                                                >
                                                    <Play size={14} className="text-red-400" />
                                                </button>
                                                <div className="flex-1">
                                                    <h3
                                                        onClick={() => handlePlayTrack(track.title)}
                                                        className="text-neutral-200 font-medium cursor-pointer hover:text-red-400 transition-colors"
                                                    >
                                                        {track.title}
                                                    </h3>
                                                    <p className="text-xs text-neutral-600">{track.subTitle}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleFav(track.title)}
                                                    className={`p-2 transition-colors ${isFav ? "text-red-500" : "text-neutral-700 hover:text-red-400"}`}
                                                >
                                                    <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Theme indicator */}
                                    {!isLocked && track.theme && (
                                        <div className="absolute top-2 right-2">
                                            <Zap size={10} className="text-yellow-500/50" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!isTracklistUnlocked && (
                        <p className="mt-4 text-center text-xs text-neutral-700">
                            トラックリストを解放するには、まずHIDDENカテゴリを発見してください
                        </p>
                    )}
                </section>

                {/* ERROR CATALOG Section */}
                <section>
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-2 mb-6">
                        <FileText size={16} className="text-red-500" />
                        <h2 className="text-sm tracking-widest text-neutral-500">ERROR_CATALOG</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCards.map((card) => {
                            const isTargetCard = TRACKLIST_UNLOCK_CONDITION.targetCards.includes(card.id);
                            const isClicked = clickedCards.includes(card.id);

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className={`group relative bg-neutral-900/50 border p-6 transition-all duration-500 overflow-hidden cursor-pointer ${isClicked
                                        ? "border-green-500/50 bg-green-900/10"
                                        : isTargetCard && tracklistPuzzleActive
                                            ? "border-yellow-900/50 hover:border-yellow-500/50"
                                            : "border-neutral-800 hover:border-red-900/30"
                                        }`}
                                >
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 p-4 text-[10px] text-neutral-800 font-mono group-hover:text-red-900/20 transition-colors">
                                        {card.id}
                                    </div>

                                    {/* Puzzle Indicator */}
                                    {isTargetCard && tracklistPuzzleActive && !isClicked && (
                                        <div className="absolute top-2 left-2">
                                            <Zap size={12} className="text-yellow-500 animate-pulse" />
                                        </div>
                                    )}
                                    {isClicked && (
                                        <div className="absolute top-2 left-2">
                                            <Unlock size={12} className="text-green-500" />
                                        </div>
                                    )}

                                    {/* Main Content */}
                                    <div className="mb-6">
                                        <h2 className="text-4xl font-bold text-neutral-700 group-hover:text-neutral-300 transition-colors mb-2">
                                            {card.code}
                                        </h2>
                                        <h3 className="text-sm tracking-widest text-red-900/70 group-hover:text-red-500/70 transition-colors">
                                            {card.title}
                                        </h3>
                                    </div>

                                    <p className="text-xs text-neutral-500 leading-relaxed mb-6 border-l-2 border-neutral-800 pl-3 group-hover:border-red-900/30 transition-colors">
                                        {card.shortDesc}
                                    </p>

                                    {/* Hover Reveal: Long Desc */}
                                    <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                        <p className="text-xs text-neutral-400 leading-loose mb-6">
                                            {card.longDesc}
                                        </p>

                                        {/* Links/Fragments */}
                                        {(card.relatedSongs || card.fragments) && (
                                            <div className="space-y-3 pt-4 border-t border-neutral-800/50">
                                                {card.relatedSongs?.map(song => (
                                                    <div key={song.title} className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <Music2 size={12} />
                                                        <span
                                                            className="hover:text-white cursor-pointer transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePlayTrack(song.title);
                                                            }}
                                                        >
                                                            {song.title}
                                                        </span>
                                                    </div>
                                                ))}
                                                {card.fragments?.map((frag, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-[10px] text-neutral-600 italic">
                                                        <FileText size={10} className="mt-0.5 shrink-0" />
                                                        <span>{frag}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredCards.length === 0 && (
                        <div className="py-24 text-center">
                            <p className="text-neutral-700 text-xs tracking-widest">NO_DATA_AVAILABLE</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Back Link */}
            <div className="fixed bottom-8 left-8 z-50">
                <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-white transition-colors text-xs tracking-widest">
                    <ArrowLeft size={16} />
                    RETURN_TO_ROOT
                </Link>
            </div>

            {/* Noise Effect */}
            <NoiseEffect
                isActive={showNoise}
                onComplete={() => setShowNoise(false)}
                intensity={noiseIntensity}
                duration={1500}
            />
        </div>
    );
}
