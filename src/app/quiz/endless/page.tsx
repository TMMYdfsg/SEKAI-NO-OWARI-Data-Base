"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Infinity,
    Trophy,
    Zap,
    Skull,
    Volume2,
    VolumeX,
    Flame
} from "lucide-react";
import { INTRO_DIFFICULTY_CONFIG, IntroDifficulty, QUIZ_ACHIEVEMENTS } from "@/data/quiz-config";
import { addBadge } from "@/lib/local-storage-data";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
}

export default function EndlessQuizPage() {
    const [difficulty, setDifficulty] = useState<IntroDifficulty | null>(null);
    const [loading, setLoading] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [usedFiles, setUsedFiles] = useState<Set<string>>(new Set());
    const [currentFile, setCurrentFile] = useState<LocalFile | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canAnswer, setCanAnswer] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const config = difficulty ? INTRO_DIFFICULTY_CONFIG[difficulty] : null;

    // Fetch files
    useEffect(() => {
        fetch('/api/files')
            .then(res => res.json())
            .then(data => {
                const audioFiles = (data.files || []).filter((f: LocalFile) =>
                    ['mp3', 'm4a', 'wav'].includes(f.type.toLowerCase())
                );
                setLocalFiles(audioFiles);
            })
            .catch(console.error);

        // Load best streak
        const saved = localStorage.getItem('sekaowa_endless_best');
        if (saved) setBestStreak(parseInt(saved));
    }, []);

    // Generate next question (without repeating)
    const generateNextQuestion = useCallback(() => {
        const available = localFiles.filter(f => !usedFiles.has(f.path));

        if (available.length < 1) {
            // All songs used, reset
            setUsedFiles(new Set());
            return generateNextQuestion();
        }

        const file = available[Math.floor(Math.random() * available.length)];
        setUsedFiles(prev => new Set([...prev, file.path]));

        const others = localFiles.filter(f => f.name !== file.name);
        const wrongAnswers = others
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(f => f.name.replace(/\.[^/.]+$/, ''));

        const correctAnswer = file.name.replace(/\.[^/.]+$/, '');
        const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

        setCurrentFile(file);
        setOptions(allOptions);
        setCorrectIndex(allOptions.indexOf(correctAnswer));

        return file;
    }, [localFiles, usedFiles]);

    // Start game
    const handleStart = (diff: IntroDifficulty) => {
        setDifficulty(diff);
        setLoading(true);
        setUsedFiles(new Set());
        setStreak(0);
        setGameOver(false);
        setSelectedOption(null);
        setShowResult(false);

        setTimeout(() => {
            const file = generateNextQuestion();
            setLoading(false);
            if (file) playIntro(file);
        }, 500);
    };

    // Play intro
    const playIntro = (file: LocalFile) => {
        if (audioRef.current) audioRef.current.pause();

        const audio = new Audio(`/api/media?file=${encodeURIComponent(file.path)}`);
        audio.volume = isMuted ? 0 : 0.8;
        audioRef.current = audio;

        const playDuration = config?.playDurationSeconds || 5;
        setTimeLeft(playDuration);
        setCanAnswer(false);
        setIsPlaying(true);

        audio.play().catch(console.error);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    audio.pause();
                    setIsPlaying(false);
                    setCanAnswer(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Handle answer
    const handleAnswer = (optionIndex: number) => {
        if (!canAnswer || selectedOption !== null) return;

        setSelectedOption(optionIndex);
        setShowResult(true);

        if (optionIndex === correctIndex) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            // Save best
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
                localStorage.setItem('sekaowa_endless_best', newStreak.toString());
            }

            // Achievements
            if (newStreak === 20) addBadge(QUIZ_ACHIEVEMENTS.ENDLESS_20);
            if (newStreak === 50) addBadge(QUIZ_ACHIEVEMENTS.ENDLESS_50);
        } else {
            // Game Over
            setGameOver(true);
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Next question
    const handleNext = () => {
        setSelectedOption(null);
        setShowResult(false);
        setCanAnswer(false);

        const file = generateNextQuestion();
        if (file) {
            setTimeout(() => playIntro(file), 300);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Difficulty Selection
    if (!difficulty) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-900/50 via-background to-indigo-900/50">
                <div className="max-w-lg w-full text-center space-y-8">
                    <Link href="/quiz" className="inline-flex items-center gap-2 text-white/50 hover:text-white">
                        <ArrowLeft size={16} />
                        クイズ選択に戻る
                    </Link>

                    <div className="mb-8">
                        <Infinity size={64} className="mx-auto text-blue-400 mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                        <h1 className="text-4xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-400 mb-2">
                            エンドレス
                        </h1>
                        <p className="text-muted-foreground">ミスするまで永遠に続く</p>
                        <p className="text-xs text-muted-foreground mt-2">同じ曲は出題されません</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-6">
                        <p className="text-sm text-gray-400 mb-2">最高連続正解</p>
                        <p className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                            <Flame size={28} className="text-orange-400" />
                            {bestStreak}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm text-white/60 uppercase tracking-wider mb-4">難易度を選択</h2>
                        {Object.values(INTRO_DIFFICULTY_CONFIG).map((cfg) => (
                            <button
                                key={cfg.difficulty}
                                onClick={() => handleStart(cfg.difficulty)}
                                disabled={localFiles.length < 4}
                                className={`
                                    w-full p-4 rounded-xl border border-white/10 transition-all
                                    hover:border-blue-500/50 hover:bg-blue-500/10
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-white">{cfg.labelJa}</span>
                                    <span className="text-sm text-white/50">{cfg.playDurationSeconds}秒</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/50 via-background to-indigo-900/50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    // Game Over
    if (gameOver) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900/50 via-background to-black">
                <div className="max-w-md w-full text-center space-y-8">
                    <Skull size={64} className="mx-auto text-red-400 mb-4 animate-pulse" />
                    <h2 className="text-3xl font-bold text-red-400">GAME OVER</h2>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
                        <p className="text-lg text-gray-300 mb-2">連続正解</p>
                        <div className="text-6xl font-black text-white mb-4 flex items-center justify-center gap-2">
                            <Flame size={40} className="text-orange-400" />
                            {streak}
                        </div>

                        {streak >= bestStreak && streak > 0 && (
                            <div className="bg-yellow-400/20 text-yellow-200 px-4 py-2 rounded-lg text-sm border border-yellow-400/30 animate-pulse">
                                🏆 新記録！
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleStart(difficulty)}
                            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            リトライ
                        </button>
                        <button
                            onClick={() => setDifficulty(null)}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            難易度を変更
                        </button>
                        <Link href="/quiz" className="w-full py-3 text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft size={20} />
                            クイズ選択に戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz
    return (
        <div className="min-h-screen flex flex-col py-10 px-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Flame size={24} className="text-orange-400" />
                    {streak}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-white/50">
                        Best: {bestStreak}
                    </div>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/50 hover:text-white">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
                <div className={`text-5xl font-mono font-bold ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                </div>
                {isPlaying && <p className="text-white/50 text-sm mt-1">再生中...</p>}
                {canAnswer && <p className="text-yellow-400 text-sm mt-1">回答してください！</p>}
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
                {options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === correctIndex;

                    let cls = "w-full p-4 rounded-xl text-left transition-all border ";
                    if (showResult) {
                        if (isCorrect) cls += "bg-green-500/20 border-green-500 text-green-200";
                        else if (isSelected) cls += "bg-red-500/20 border-red-500 text-red-200";
                        else cls += "border-white/10 opacity-50";
                    } else {
                        cls += canAnswer ? "border-white/10 hover:border-blue-500/50 hover:bg-white/5 text-white" : "border-white/10 opacity-50 cursor-not-allowed";
                    }

                    return (
                        <button key={index} onClick={() => handleAnswer(index)} disabled={!canAnswer || showResult} className={cls}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{option}</span>
                                {showResult && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                                {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && !gameOver && (
                <button onClick={handleNext} className="mt-6 w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <Zap size={20} />
                    次へ
                </button>
            )}
        </div>
    );
}
