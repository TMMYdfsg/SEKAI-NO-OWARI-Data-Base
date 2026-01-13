"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Swords,
    Trophy,
    Zap,
    Crown,
    Volume2,
    VolumeX,
    User,
    Timer
} from "lucide-react";
import { INTRO_DIFFICULTY_CONFIG, RIVALS, RivalConfig, QUIZ_ACHIEVEMENTS } from "@/data/quiz-config";
import { addBadge } from "@/lib/local-storage-data";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
}

interface BattleQuestion {
    file: LocalFile;
    options: string[];
    correctIndex: number;
}

export default function BattlePage() {
    const [selectedRival, setSelectedRival] = useState<RivalConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [questions, setQuestions] = useState<BattleQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [rivalScore, setRivalScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [rivalAnswer, setRivalAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [finished, setFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canAnswer, setCanAnswer] = useState(false);
    const [rivalAnswering, setRivalAnswering] = useState(false);
    const [defeatedRivals, setDefeatedRivals] = useState<string[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const rivalTimerRef = useRef<NodeJS.Timeout | null>(null);

    const BATTLE_ROUNDS = 5;
    const config = selectedRival ? INTRO_DIFFICULTY_CONFIG[selectedRival.difficulty] : null;

    // Fetch files and defeated rivals
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

        const saved = localStorage.getItem('sekaowa_defeated_rivals');
        if (saved) setDefeatedRivals(JSON.parse(saved));
    }, []);

    // Generate questions
    const generateQuestions = useCallback(() => {
        if (localFiles.length < 4) return [];

        const shuffled = [...localFiles].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, BATTLE_ROUNDS);

        return selected.map(file => {
            const others = localFiles.filter(f => f.name !== file.name);
            const wrongAnswers = others
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(f => f.name.replace(/\.[^/.]+$/, ''));

            const correctAnswer = file.name.replace(/\.[^/.]+$/, '');
            const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

            return {
                file,
                options,
                correctIndex: options.indexOf(correctAnswer),
            };
        });
    }, [localFiles]);

    // Start battle
    const handleStart = (rival: RivalConfig) => {
        setSelectedRival(rival);
        setLoading(true);

        setTimeout(() => {
            const newQuestions = generateQuestions();
            setQuestions(newQuestions);
            setCurrentIndex(0);
            setPlayerScore(0);
            setRivalScore(0);
            setSelectedOption(null);
            setRivalAnswer(null);
            setShowResult(false);
            setFinished(false);
            setLoading(false);

            if (newQuestions.length > 0) {
                playIntro(newQuestions[0].file);
            }
        }, 500);
    };

    // Play intro
    const playIntro = (file: LocalFile) => {
        if (audioRef.current) audioRef.current.pause();
        if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);

        const audio = new Audio(`/api/media?file=${encodeURIComponent(file.path)}`);
        audio.volume = isMuted ? 0 : 0.8;
        audioRef.current = audio;

        const playDuration = config?.playDurationSeconds || 5;
        setTimeLeft(playDuration);
        setCanAnswer(false);
        setIsPlaying(true);
        setRivalAnswering(false);

        audio.play().catch(console.error);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    audio.pause();
                    setIsPlaying(false);
                    setCanAnswer(true);
                    startRivalTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Rival AI timer
    const startRivalTimer = () => {
        if (!config || !selectedRival) return;

        setRivalAnswering(true);
        const aiTime = config.aiResponseTimeSeconds * 1000;

        rivalTimerRef.current = setTimeout(() => {
            // AI makes a decision
            const currentQ = questions[currentIndex];
            // Rival has ~70% base accuracy, adjusted by difficulty
            const accuracy = selectedRival.difficulty === 'easy' ? 0.5
                : selectedRival.difficulty === 'normal' ? 0.7
                    : selectedRival.difficulty === 'hard' ? 0.85
                        : 0.95;

            const isCorrect = Math.random() < accuracy;
            const answer = isCorrect
                ? currentQ.correctIndex
                : [0, 1, 2, 3].filter(i => i !== currentQ.correctIndex)[Math.floor(Math.random() * 3)];

            setRivalAnswer(answer);

            // If player hasn't answered yet, force show result
            if (selectedOption === null) {
                handleTimeout();
            }
        }, aiTime);
    };

    // Handle timeout (player didn't answer)
    const handleTimeout = () => {
        setShowResult(true);
        const currentQ = questions[currentIndex];

        // Rival scores if correct
        if (rivalAnswer === currentQ.correctIndex) {
            setRivalScore(prev => prev + 1);
        }
    };

    // Handle player answer
    const handleAnswer = (optionIndex: number) => {
        if (!canAnswer || selectedOption !== null) return;

        setSelectedOption(optionIndex);

        // Clear rival timer if still running
        if (rivalTimerRef.current) {
            clearTimeout(rivalTimerRef.current);
            // Rival answers now (player beat them)
            const currentQ = questions[currentIndex];
            const accuracy = selectedRival?.difficulty === 'easy' ? 0.5
                : selectedRival?.difficulty === 'normal' ? 0.7
                    : selectedRival?.difficulty === 'hard' ? 0.85
                        : 0.95;
            const isCorrect = Math.random() < accuracy;
            setRivalAnswer(isCorrect ? currentQ.correctIndex : [0, 1, 2, 3].filter(i => i !== currentQ.correctIndex)[0]);
        }

        setShowResult(true);

        const currentQ = questions[currentIndex];
        if (optionIndex === currentQ.correctIndex) {
            setPlayerScore(prev => prev + 1);
        }
        // Rival also gets checked
        if (rivalAnswer === currentQ.correctIndex) {
            setRivalScore(prev => prev + 1);
        }
    };

    // Next question
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setRivalAnswer(null);
            setShowResult(false);
            setCanAnswer(false);

            setTimeout(() => {
                playIntro(questions[currentIndex + 1].file);
            }, 300);
        } else {
            finishBattle();
        }
    };

    // Finish battle
    const finishBattle = () => {
        setFinished(true);

        if (audioRef.current) audioRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
        if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);

        // Check win
        if (playerScore > rivalScore && selectedRival) {
            // First win against any rival
            if (!defeatedRivals.includes(selectedRival.id)) {
                const newDefeated = [...defeatedRivals, selectedRival.id];
                setDefeatedRivals(newDefeated);
                localStorage.setItem('sekaowa_defeated_rivals', JSON.stringify(newDefeated));
                addBadge(selectedRival.winBadge);

                if (defeatedRivals.length === 0) {
                    addBadge(QUIZ_ACHIEVEMENTS.RIVAL_FIRST_WIN);
                }
                if (newDefeated.length === RIVALS.length) {
                    addBadge(QUIZ_ACHIEVEMENTS.RIVAL_ALL_CLEAR);
                }
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
            if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);
        };
    }, []);

    const currentQuestion = questions[currentIndex];

    // Rival Selection
    if (!selectedRival) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900/50 via-background to-orange-900/50">
                <div className="max-w-lg w-full text-center space-y-8">
                    <Link href="/quiz" className="inline-flex items-center gap-2 text-white/50 hover:text-white">
                        <ArrowLeft size={16} />
                        クイズ選択に戻る
                    </Link>

                    <div className="mb-8">
                        <Swords size={64} className="mx-auto text-red-400 mb-4 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]" />
                        <h1 className="text-4xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-orange-400 mb-2">
                            ライバル対戦
                        </h1>
                        <p className="text-muted-foreground">仮想ライバルとイントロ対決</p>
                    </div>

                    <div className="space-y-3">
                        {RIVALS.map((rival) => {
                            const isDefeated = defeatedRivals.includes(rival.id);
                            const cfg = INTRO_DIFFICULTY_CONFIG[rival.difficulty];

                            return (
                                <button
                                    key={rival.id}
                                    onClick={() => handleStart(rival)}
                                    disabled={localFiles.length < 4}
                                    className={`
                                        w-full p-5 rounded-xl border transition-all
                                        ${isDefeated ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/10 hover:border-red-500/50 hover:bg-white/5'}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{rival.avatar}</div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-white">{rival.name}</span>
                                                {isDefeated && <Crown size={16} className="text-yellow-400" />}
                                            </div>
                                            <p className="text-xs text-white/50">{rival.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-white/70">{cfg.labelJa}</div>
                                            <div className="text-xs text-white/50">{cfg.playDurationSeconds}秒</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-xs text-white/40">
                        撃破済み: {defeatedRivals.length} / {RIVALS.length}
                    </p>
                </div>
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900/50 via-background to-orange-900/50">
                <div className="text-center">
                    <div className="text-6xl mb-4">{selectedRival.avatar}</div>
                    <p className="text-white/70">{selectedRival.name} が待ち構えている...</p>
                </div>
            </div>
        );
    }

    // Results
    if (finished) {
        const playerWon = playerScore > rivalScore;
        const tie = playerScore === rivalScore;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900/50 via-background to-orange-900/50">
                <div className="max-w-md w-full text-center space-y-8">
                    {playerWon ? (
                        <>
                            <Trophy size={64} className="mx-auto text-yellow-400 animate-bounce" />
                            <h2 className="text-3xl font-bold text-yellow-400">勝利！</h2>
                        </>
                    ) : tie ? (
                        <>
                            <Swords size={64} className="mx-auto text-gray-400" />
                            <h2 className="text-3xl font-bold text-gray-400">引き分け</h2>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl">{selectedRival.avatar}</div>
                            <h2 className="text-3xl font-bold text-red-400">敗北...</h2>
                        </>
                    )}

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <div>
                                <User size={32} className="mx-auto text-blue-400 mb-2" />
                                <p className="text-xs text-white/50">あなた</p>
                                <p className="text-3xl font-bold text-white">{playerScore}</p>
                            </div>
                            <div className="text-2xl text-white/30">VS</div>
                            <div>
                                <div className="text-3xl mb-2">{selectedRival.avatar}</div>
                                <p className="text-xs text-white/50">{selectedRival.name}</p>
                                <p className="text-3xl font-bold text-white">{rivalScore}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleStart(selectedRival)}
                            className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-full font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            再戦
                        </button>
                        <button
                            onClick={() => setSelectedRival(null)}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            別のライバルを選ぶ
                        </button>
                        <Link href="/quiz" className="w-full py-3 text-white/50 hover:text-white flex items-center justify-center gap-2">
                            <ArrowLeft size={20} />
                            クイズ選択に戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Battle
    return (
        <div className="min-h-screen flex flex-col py-10 px-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <User size={20} className="text-blue-400" />
                    <span className="text-2xl font-bold text-white">{playerScore}</span>
                </div>
                <div className="text-sm text-white/50">
                    Round {currentIndex + 1} / {BATTLE_ROUNDS}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{rivalScore}</span>
                    <div className="text-2xl">{selectedRival.avatar}</div>
                </div>
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${((currentIndex + 1) / BATTLE_ROUNDS) * 100}%` }} />
            </div>

            {/* Timer & Status */}
            <div className="text-center mb-6">
                <div className={`text-4xl font-mono font-bold ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                </div>
                {isPlaying && <p className="text-white/50 text-sm">再生中...</p>}
                {canAnswer && !showResult && (
                    <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm mt-1">
                        {rivalAnswering && <Timer size={14} className="animate-spin" />}
                        回答してください！
                    </div>
                )}
            </div>

            {/* Mute button */}
            <div className="text-center mb-4">
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/50 hover:text-white">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
                {currentQuestion?.options.map((option, index) => {
                    const isPlayerSelected = selectedOption === index;
                    const isRivalSelected = rivalAnswer === index;
                    const isCorrect = index === currentQuestion.correctIndex;

                    let cls = "w-full p-4 rounded-xl text-left transition-all border ";
                    if (showResult) {
                        if (isCorrect) cls += "bg-green-500/20 border-green-500 text-green-200";
                        else if (isPlayerSelected) cls += "bg-red-500/20 border-red-500 text-red-200";
                        else cls += "border-white/10 opacity-50";
                    } else {
                        cls += canAnswer ? "border-white/10 hover:border-red-500/50 hover:bg-white/5 text-white" : "border-white/10 opacity-50 cursor-not-allowed";
                    }

                    return (
                        <button key={index} onClick={() => handleAnswer(index)} disabled={!canAnswer || showResult} className={cls}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{option}</span>
                                <div className="flex items-center gap-2">
                                    {showResult && isPlayerSelected && <User size={16} className="text-blue-400" />}
                                    {showResult && isRivalSelected && <span className="text-lg">{selectedRival.avatar}</span>}
                                    {showResult && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                                    {showResult && (isPlayerSelected || isRivalSelected) && !isCorrect && <XCircle size={20} className="text-red-400" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <button onClick={handleNext} className="mt-6 w-full py-4 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    {currentIndex < BATTLE_ROUNDS - 1 ? <><Zap size={20} />次へ</> : <><Trophy size={20} />結果を見る</>}
                </button>
            )}
        </div>
    );
}
