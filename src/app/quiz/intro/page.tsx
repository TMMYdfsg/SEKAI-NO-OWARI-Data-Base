"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Play,
    Pause,
    SkipForward,
    Volume2,
    VolumeX,
    RefreshCw,
    CheckCircle,
    XCircle,
    Music,
    Trophy,
    Clock,
    Zap
} from "lucide-react";
import {
    INTRO_DIFFICULTY_CONFIG,
    IntroDifficulty,
    getIntroQuizRank,
    QUIZ_ACHIEVEMENTS
} from "@/data/quiz-config";
import { addBadge } from "@/lib/local-storage-data";

interface LocalFile {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
}

interface IntroQuestion {
    file: LocalFile;
    options: string[];
    correctIndex: number;
}

export default function IntroQuizPage() {
    const [difficulty, setDifficulty] = useState<IntroDifficulty | null>(null);
    const [loading, setLoading] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [questions, setQuestions] = useState<IntroQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [finished, setFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canAnswer, setCanAnswer] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const config = difficulty ? INTRO_DIFFICULTY_CONFIG[difficulty] : null;
    const TOTAL_QUESTIONS = 10;

    // Fetch local files
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
    }, []);

    // Generate quiz questions
    const generateQuestions = useCallback(() => {
        if (localFiles.length < 4) return [];

        const shuffled = [...localFiles].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(TOTAL_QUESTIONS, shuffled.length));

        return selected.map(file => {
            // Get 3 wrong answers
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

    // Start quiz with selected difficulty
    const handleStart = (diff: IntroDifficulty) => {
        setDifficulty(diff);
        setLoading(true);

        setTimeout(() => {
            const newQuestions = generateQuestions();
            setQuestions(newQuestions);
            setCurrentIndex(0);
            setScore(0);
            setSelectedOption(null);
            setShowResult(false);
            setFinished(false);
            setLoading(false);

            // Auto-play first question
            if (newQuestions.length > 0) {
                playIntro(newQuestions[0].file);
            }
        }, 500);
    };

    // Play intro for current question
    const playIntro = (file: LocalFile) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(`/api/media?file=${encodeURIComponent(file.path)}`);
        audio.volume = isMuted ? 0 : 0.8;
        audioRef.current = audio;

        const playDuration = config?.playDurationSeconds || 5;
        setTimeLeft(playDuration);
        setCanAnswer(false);
        setIsPlaying(true);

        audio.play().catch(console.error);

        // Countdown timer
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

    // Replay current intro
    const handleReplay = () => {
        if (questions[currentIndex]) {
            playIntro(questions[currentIndex].file);
        }
    };

    // Handle answer selection
    const handleAnswer = (optionIndex: number) => {
        if (!canAnswer || selectedOption !== null) return;

        setSelectedOption(optionIndex);
        setShowResult(true);

        if (optionIndex === questions[currentIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    // Move to next question
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
            setCanAnswer(false);

            // Play next intro
            setTimeout(() => {
                playIntro(questions[currentIndex + 1].file);
            }, 300);
        } else {
            finishQuiz();
        }
    };

    // Finish quiz
    const finishQuiz = () => {
        setFinished(true);

        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Save high score
        const key = `sekaowa_intro_${difficulty}_highscore`;
        const saved = localStorage.getItem(key);
        if (!saved || score > parseInt(saved)) {
            localStorage.setItem(key, score.toString());
        }

        // Unlock achievements
        if (score === TOTAL_QUESTIONS) {
            addBadge(QUIZ_ACHIEVEMENTS.INTRO_MASTER);
        }
        if (difficulty === 'extreme' && score >= Math.floor(TOTAL_QUESTIONS * 0.7)) {
            addBadge(QUIZ_ACHIEVEMENTS.EXTREME_CLEAR);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const currentQuestion = questions[currentIndex];
    const rank = finished ? getIntroQuizRank(score, questions.length) : null;

    // Difficulty Selection Screen
    if (!difficulty) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-900/50 via-background to-teal-900/50">
                <div className="max-w-lg w-full text-center space-y-8">
                    <Link href="/quiz" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                        クイズ選択に戻る
                    </Link>

                    <div className="mb-8">
                        <Music size={64} className="mx-auto text-green-400 mb-4 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                        <h1 className="text-4xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-teal-400 mb-2">
                            イントロクイズ
                        </h1>
                        <p className="text-muted-foreground">
                            曲のイントロを聴いて曲名を当てよう
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            ※ ローカルライブラリの曲から出題されます ({localFiles.length}曲)
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
                                    w-full p-5 rounded-xl border border-white/10 
                                    bg-gradient-to-r hover:scale-[1.02] transition-all
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${cfg.difficulty === 'easy' ? 'from-green-500/20 to-green-600/20 hover:border-green-500/50' : ''}
                                    ${cfg.difficulty === 'normal' ? 'from-blue-500/20 to-blue-600/20 hover:border-blue-500/50' : ''}
                                    ${cfg.difficulty === 'hard' ? 'from-orange-500/20 to-orange-600/20 hover:border-orange-500/50' : ''}
                                    ${cfg.difficulty === 'extreme' ? 'from-red-500/20 to-red-600/20 hover:border-red-500/50' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-white">{cfg.labelJa}</div>
                                        <div className="text-xs text-white/50">{cfg.label}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-white/70">
                                            <Clock size={14} />
                                            {cfg.playDurationSeconds}秒
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900/50 via-background to-teal-900/50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-white/70">問題を準備中...</p>
                </div>
            </div>
        );
    }

    // Results Screen
    if (finished && rank) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-900/50 via-background to-teal-900/50">
                <div className="max-w-md w-full text-center space-y-8">
                    <h2 className="text-3xl font-bold text-white">結果発表</h2>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                        <div className={`
                            w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-black
                            ${rank.tier === 'S' ? 'bg-yellow-500 text-yellow-900' : ''}
                            ${rank.tier === 'A' ? 'bg-purple-500 text-purple-100' : ''}
                            ${rank.tier === 'B' ? 'bg-blue-500 text-blue-100' : ''}
                            ${rank.tier === 'C' ? 'bg-green-500 text-green-100' : ''}
                            ${rank.tier === 'D' ? 'bg-gray-500 text-gray-100' : ''}
                        `}>
                            {rank.tier}
                        </div>

                        <p className="text-lg text-gray-300 mb-2">スコア</p>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-teal-400 mb-4">
                            {score} / {questions.length}
                        </div>

                        <div className="py-4 border-t border-b border-white/10 mb-4">
                            <p className="text-xl font-bold text-green-300 mb-1">{rank.title}</p>
                            <p className="text-sm text-gray-400">{rank.message}</p>
                        </div>

                        <p className="text-xs text-white/50">
                            難易度: {config?.labelJa} ({config?.playDurationSeconds}秒)
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleStart(difficulty)}
                            className="w-full py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-full font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            もう一度挑戦
                        </button>
                        <button
                            onClick={() => setDifficulty(null)}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            難易度を変更
                        </button>
                        <Link
                            href="/quiz"
                            className="w-full py-3 text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            クイズ選択に戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Screen
    return (
        <div className="min-h-screen flex flex-col py-10 px-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setDifficulty(null)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-lg font-bold text-white/80">
                    Q{currentIndex + 1} / {questions.length}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                    <Zap size={16} className="text-yellow-400" />
                    {score}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Audio Player */}
            <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                    {isPlaying && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-white/70">再生中...</span>
                        </div>
                    )}
                    {!isPlaying && canAnswer && (
                        <div className="flex items-center gap-2 text-yellow-400">
                            <Music size={20} />
                            <span>回答してください！</span>
                        </div>
                    )}
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`
                        text-4xl font-mono font-bold
                        ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}
                    `}>
                        {timeLeft}s
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handleReplay}
                        disabled={isPlaying}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw size={20} className="text-white" />
                    </button>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                    </button>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
                {currentQuestion?.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === currentQuestion.correctIndex;

                    let buttonClass = "w-full p-4 rounded-xl text-left transition-all border ";

                    if (showResult) {
                        if (isCorrect) {
                            buttonClass += "bg-green-500/20 border-green-500 text-green-200";
                        } else if (isSelected) {
                            buttonClass += "bg-red-500/20 border-red-500 text-red-200";
                        } else {
                            buttonClass += "border-white/10 opacity-50";
                        }
                    } else {
                        buttonClass += canAnswer
                            ? "border-white/10 hover:border-primary/50 hover:bg-white/5 text-white cursor-pointer"
                            : "border-white/10 opacity-50 cursor-not-allowed";
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={!canAnswer || showResult}
                            className={buttonClass}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{option}</span>
                                {showResult && isCorrect && <CheckCircle size={20} className="text-green-400 shrink-0" />}
                                {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-400 shrink-0" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            {showResult && (
                <div className="mt-6">
                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {currentIndex < questions.length - 1 ? (
                            <>
                                <SkipForward size={20} />
                                次の問題
                            </>
                        ) : (
                            <>
                                <Trophy size={20} />
                                結果を見る
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
