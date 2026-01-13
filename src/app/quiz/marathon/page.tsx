"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Play,
    RefreshCw,
    CheckCircle,
    XCircle,
    Timer,
    Trophy,
    Zap,
    Target,
    SkipForward,
    Volume2,
    VolumeX
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

interface MarathonQuestion {
    file: LocalFile;
    options: string[];
    correctIndex: number;
}

type MarathonLength = 10 | 30 | 50;

export default function MarathonQuizPage() {
    const [marathonLength, setMarathonLength] = useState<MarathonLength | null>(null);
    const [difficulty, setDifficulty] = useState<IntroDifficulty>('normal');
    const [loading, setLoading] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [questions, setQuestions] = useState<MarathonQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [finished, setFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canAnswer, setCanAnswer] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [totalTime, setTotalTime] = useState<number>(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const config = INTRO_DIFFICULTY_CONFIG[difficulty];

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

    // Generate questions
    const generateQuestions = useCallback((count: number) => {
        if (localFiles.length < 4) return [];

        const shuffled = [...localFiles].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

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

    // Start marathon
    const handleStart = () => {
        if (!marathonLength) return;

        setLoading(true);
        setStartTime(Date.now());

        setTimeout(() => {
            const newQuestions = generateQuestions(marathonLength);
            setQuestions(newQuestions);
            setCurrentIndex(0);
            setScore(0);
            setSelectedOption(null);
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

        const audio = new Audio(`/api/media?file=${encodeURIComponent(file.path)}`);
        audio.volume = isMuted ? 0 : 0.8;
        audioRef.current = audio;

        setTimeLeft(config.playDurationSeconds);
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

        if (optionIndex === questions[currentIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    // Next question
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
            setCanAnswer(false);

            setTimeout(() => {
                playIntro(questions[currentIndex + 1].file);
            }, 300);
        } else {
            finishQuiz();
        }
    };

    // Finish
    const finishQuiz = () => {
        setFinished(true);
        setTotalTime(Math.floor((Date.now() - startTime) / 1000));

        if (audioRef.current) audioRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);

        // Achievements
        if (marathonLength === 10 && score >= 8) addBadge(QUIZ_ACHIEVEMENTS.MARATHON_10);
        if (marathonLength === 30 && score >= 24) addBadge(QUIZ_ACHIEVEMENTS.MARATHON_30);
        if (marathonLength === 50 && score >= 40) addBadge(QUIZ_ACHIEVEMENTS.MARATHON_50);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const currentQuestion = questions[currentIndex];

    // Selection Screen
    if (!marathonLength) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-900/50 via-background to-red-900/50">
                <div className="max-w-lg w-full text-center space-y-8">
                    <Link href="/quiz" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                        クイズ選択に戻る
                    </Link>

                    <div className="mb-8">
                        <Timer size={64} className="mx-auto text-orange-400 mb-4 drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]" />
                        <h1 className="text-4xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-red-400 mb-2">
                            マラソンモード
                        </h1>
                        <p className="text-muted-foreground">連続でイントロクイズに挑戦</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            ※ セーブ機能なし・途中離脱不可
                        </p>
                    </div>

                    {/* Length Selection */}
                    <div className="space-y-3">
                        <h2 className="text-sm text-white/60 uppercase tracking-wider mb-4">問題数を選択</h2>
                        {([10, 30, 50] as MarathonLength[]).map((len) => (
                            <button
                                key={len}
                                onClick={() => setMarathonLength(len)}
                                disabled={localFiles.length < len}
                                className={`
                                    w-full p-5 rounded-xl border transition-all
                                    ${marathonLength === len
                                        ? 'border-orange-500 bg-orange-500/20'
                                        : 'border-white/10 hover:border-orange-500/50 hover:bg-white/5'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Target size={24} className="text-orange-400" />
                                        <span className="text-xl font-bold text-white">{len}曲</span>
                                    </div>
                                    <span className="text-sm text-white/50">
                                        {len === 10 && '入門'}
                                        {len === 30 && '挑戦'}
                                        {len === 50 && '究極'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-3">
                        <h2 className="text-sm text-white/60 uppercase tracking-wider mb-4">難易度</h2>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.values(INTRO_DIFFICULTY_CONFIG).map((cfg) => (
                                <button
                                    key={cfg.difficulty}
                                    onClick={() => setDifficulty(cfg.difficulty)}
                                    className={`
                                        p-3 rounded-lg border text-sm font-bold transition-all
                                        ${difficulty === cfg.difficulty
                                            ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                                            : 'border-white/10 text-white/60 hover:bg-white/5'}
                                    `}
                                >
                                    {cfg.labelJa}
                                </button>
                            ))}
                        </div>
                    </div>

                    {marathonLength && (
                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Play size={24} fill="currentColor" />
                            スタート
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900/50 via-background to-red-900/50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
                    <p className="text-white/70">{marathonLength}問を準備中...</p>
                </div>
            </div>
        );
    }

    // Results
    if (finished) {
        const percentage = Math.round((score / questions.length) * 100);
        const avgTime = Math.round(totalTime / questions.length);

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-900/50 via-background to-red-900/50">
                <div className="max-w-md w-full text-center space-y-8">
                    <Trophy size={64} className="mx-auto text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                    <h2 className="text-3xl font-bold text-white">マラソン完走！</h2>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-red-400 mb-2">
                            {score} / {questions.length}
                        </div>
                        <p className="text-lg text-white/70 mb-4">{percentage}% 正解</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50">総時間</p>
                                <p className="text-xl font-bold text-white">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50">平均</p>
                                <p className="text-xl font-bold text-white">{avgTime}秒/問</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => { setMarathonLength(null); }}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-full font-bold transition-colors"
                        >
                            <RefreshCw size={20} className="inline mr-2" />
                            もう一度
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
                <div className="text-lg font-bold text-white/80">
                    Q{currentIndex + 1} / {questions.length}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Zap size={16} className="text-yellow-400" />
                        {score}
                    </div>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/50 hover:text-white">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
                <div className={`text-4xl font-mono font-bold ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                </div>
                {isPlaying && <p className="text-white/50 text-sm mt-1">再生中...</p>}
                {canAnswer && <p className="text-yellow-400 text-sm mt-1">回答してください！</p>}
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
                {currentQuestion?.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === currentQuestion.correctIndex;

                    let cls = "w-full p-4 rounded-xl text-left transition-all border ";
                    if (showResult) {
                        if (isCorrect) cls += "bg-green-500/20 border-green-500 text-green-200";
                        else if (isSelected) cls += "bg-red-500/20 border-red-500 text-red-200";
                        else cls += "border-white/10 opacity-50";
                    } else {
                        cls += canAnswer ? "border-white/10 hover:border-orange-500/50 hover:bg-white/5 text-white" : "border-white/10 opacity-50 cursor-not-allowed";
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

            {showResult && (
                <button onClick={handleNext} className="mt-6 w-full py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    {currentIndex < questions.length - 1 ? <><SkipForward size={20} />次へ</> : <><Trophy size={20} />完走！</>}
                </button>
            )}
        </div>
    );
}
