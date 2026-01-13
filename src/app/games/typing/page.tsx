"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RefreshCw, Trophy, Music, Keyboard } from "lucide-react";
import { TYPING_GAME_SONGS, TypingGameSong } from "@/data/typing-game-config";

// --- Advanced Romaji Logic ---
// This is a simplified mapping. For a production app, use a library like wanakana or a full heiwa-romaji map.
const KANA_ROMAJI_MAP: Record<string, string[]> = {
    "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
    "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
    "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
    "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
    "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
    "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ho": ["ho"],
    "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
    "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
    "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
    "わ": ["wa"], "を": ["wo"], "ん": ["n", "nn"],
    "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
    "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
    "だ": ["da"], "ぢ": ["ji", "di"], "づ": ["zu", "du"], "で": ["de"], "ど": ["do"],
    "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
    "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
    // Small kana and combinations are complex and would require a parser.
    // For this prototype, we rely on the config providing valid romaji strings for complex phrases.
};

export default function TypingGamePage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<TypingGameSong | null>(null);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [targetRomaji, setTargetRomaji] = useState("");
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [result, setResult] = useState<"NONE" | "CLEAR" | "GAME_OVER">("NONE");

    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (TYPING_GAME_SONGS.length > 0) {
            setCurrentSong(TYPING_GAME_SONGS[0]);
        }
    }, []);

    useEffect(() => {
        if (currentSong) {
            // Set initial target based on the first accepted pattern
            // Ideally we track multiple valid patterns simultaneously
            setTargetRomaji(currentSong.lyrics[currentLineIndex].romaji[0]);
        }
    }, [currentSong, currentLineIndex]);

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (isPlaying && timeLeft === 0) {
            finishGame(false);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, timeLeft]);

    const startGame = () => {
        setResult("NONE");
        setIsPlaying(true);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setCurrentLineIndex(0);
        setUserInput("");
        setTimeLeft(60); // 60 seconds limit
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isPlaying || !currentSong) return;

        const val = e.target.value;
        const currentLine = currentSong.lyrics[currentLineIndex];

        // Flexible matching mechanism
        // Check if the input is a valid prefix of ANY of the provided romaji variations
        const matchingPattern = currentLine.romaji.find(pattern => pattern.startsWith(val));

        if (matchingPattern) {
            setUserInput(val);
            setTargetRomaji(matchingPattern); // Lock onto the pattern the user is typing

            // Complete match?
            if (val === matchingPattern) {
                const lineScore = Math.ceil(matchingPattern.length * 10 * (1 + combo * 0.1));
                setScore(s => s + lineScore);
                setCombo(c => {
                    const newCombo = c + 1;
                    setMaxCombo(prev => Math.max(prev, newCombo));
                    return newCombo;
                });

                setUserInput("");

                if (currentLineIndex < currentSong.lyrics.length - 1) {
                    setCurrentLineIndex(i => i + 1);
                } else {
                    finishGame(true);
                }
            }
        } else {
            // Mistake / Breaking combo
            if (combo > 0) setCombo(0);

            // Visual feedback could be added here (e.g., flash red)
        }
    };

    const finishGame = (cleared: boolean) => {
        setIsPlaying(false);
        setResult(cleared ? "CLEAR" : "GAME_OVER");
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col items-center font-sans tracking-wide">

            <header className="mb-12 text-center animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl font-extrabold mb-3 flex items-center justify-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-lg">
                    <Keyboard className="text-pink-400" size={48} />
                    Lyric Typing
                </h1>
                <p className="text-slate-400 text-lg">Type the lyrics to the beat!</p>
            </header>

            {!isPlaying && result === "NONE" ? (
                <div className="bg-slate-800/60 backdrop-blur-md p-10 rounded-3xl border border-white/10 max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-white">Ready to Challenge?</h2>

                    {currentSong && (
                        <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Target Song</p>
                            <p className="text-2xl font-bold text-pink-400 mb-1">{currentSong.title}</p>
                            <p className="text-slate-300 font-medium">{currentSong.artist}</p>
                        </div>
                    )}

                    <button
                        onClick={startGame}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-pink-600 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 hover:bg-pink-500 w-full overflow-hidden"
                    >
                        <span className="absolute inset-0 transition-transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-pink-500 to-purple-600"></span>
                        <span className="relative flex items-center gap-2 text-lg">
                            <Play size={24} fill="currentColor" /> START GAME
                        </span>
                    </button>
                </div>
            ) : result !== "NONE" ? (
                <div className="bg-slate-800/60 backdrop-blur-md p-10 rounded-3xl border border-white/10 max-w-lg w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <h2 className={`text-4xl font-black mb-2 ${result === "CLEAR" ? "text-cyan-400" : "text-red-400"}`}>
                        {result === "CLEAR" ? "STAGE CLEARED!" : "TIME UP!"}
                    </h2>
                    <p className="text-slate-400 mb-8">Great effort!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-900/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Final Score</p>
                            <p className="text-3xl font-mono font-bold text-white">{score}</p>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase">Max Combo</p>
                            <p className="text-3xl font-mono font-bold text-yellow-400">{maxCombo}x</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setResult("NONE"); startGame(); }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} /> Play Again
                    </button>
                    <button
                        onClick={() => setResult("NONE")}
                        className="mt-4 text-slate-400 hover:text-white text-sm underline underline-offset-4"
                    >
                        Back to Menu
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in duration-300">
                    {/* HUD */}
                    <div className="flex justify-around w-full p-6 bg-slate-800/80 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-4xl font-mono font-bold text-cyan-400 tabular-nums">{score}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Combo</p>
                            <div className={`text-4xl font-mono font-bold tabular-nums transition-transform ${combo > 10 ? "text-yellow-400 scale-110" : "text-white"}`}>
                                {combo}<span className="text-lg ml-1">x</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Time</p>
                            <p className={`text-4xl font-mono font-bold tabular-nums ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-white"}`}>
                                {timeLeft}
                            </p>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="relative w-full aspect-[21/9] bg-black/60 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-12 overflow-hidden shadow-2xl">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${((currentLineIndex) / (currentSong?.lyrics.length || 1)) * 100}%` }}
                        />

                        {currentSong && (
                            <div className="z-10 text-center w-full max-w-3xl space-y-8">
                                {/* Japanese Lyrics */}
                                <div className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] tracking-wider leading-tight">
                                    {currentSong.lyrics[currentLineIndex].text}
                                </div>

                                {/* Romaji Display & Input */}
                                <div className="relative">
                                    {/* Ghost Text (Target) */}
                                    <div className="text-3xl md:text-4xl text-slate-600 font-mono tracking-[0.2em] absolute top-0 left-0 w-full text-center select-none">
                                        {targetRomaji}
                                    </div>

                                    {/* User Input Overlay */}
                                    <div className="text-3xl md:text-4xl text-pink-400 font-mono tracking-[0.2em] relative z-10 w-full text-center pointer-events-none">
                                        {userInput}
                                        <span className="animate-pulse border-r-2 border-pink-400 h-8 inline-block align-middle ml-1"></span>
                                    </div>

                                    {/* Hidden Input Field */}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={handleInputChange}
                                        className="opacity-0 absolute top-0 left-0 w-full h-full cursor-none"
                                        autoFocus
                                        onBlur={(e) => isPlaying && e.target.focus()}
                                    />
                                </div>

                                <div className="text-sm text-slate-500 mt-8 font-mono">
                                    {currentLineIndex + 1} / {currentSong.lyrics.length}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
