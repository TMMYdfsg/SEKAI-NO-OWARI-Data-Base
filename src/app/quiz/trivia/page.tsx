"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Trophy, Play, RefreshCw, Home, Brain } from "lucide-react";
import { quizQuestions, getRank } from "@/data/quiz";
import { addBadge } from "@/lib/local-storage-data";

export default function TriviaQuizPage() {
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [finished, setFinished] = useState(false);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("sekaowa_quiz_highscore");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const handleStart = () => {
        setStarted(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFinished(false);
        setSelectedOption(null);
        setShowExplanation(false);
    };

    const handleAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return;

        setSelectedOption(optionIndex);
        setShowExplanation(true);

        if (optionIndex === quizQuestions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setFinished(true);
        if (score > highScore) {
            localStorage.setItem("sekaowa_quiz_highscore", score.toString());
            setHighScore(score);
        }

        if (score === 10) {
            addBadge("QUIZ_MASTER");
        } else if (score >= 8) {
            addBadge("QUIZ_EXPERT");
        }
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const rank = getRank(score);

    if (!started) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-background to-blue-900">
                <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                    <Link href="/quiz" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={16} />
                        クイズ選択に戻る
                    </Link>

                    <div className="mb-6">
                        <Brain size={64} className="mx-auto text-purple-400 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        <h1 className="text-4xl font-bold font-serif mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-500">
                            知識クイズ
                        </h1>
                        <p className="text-muted-foreground">セカオワの歴史・トリビアを10問出題</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <p className="text-sm text-gray-400 mb-2">最高スコア</p>
                        <p className="text-3xl font-bold text-white">{highScore} / {quizQuestions.length}</p>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full py-4 bg-primary hover:bg-primary/80 text-primary-foreground rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                        <Play size={24} fill="currentColor" />
                        クイズを始める
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-background to-blue-900">
                <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-2">結果発表</h2>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                        <p className="text-lg text-gray-300 mb-2">あなたのスコア</p>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-500 mb-4 drop-shadow-lg">
                            {score}
                            <span className="text-2xl text-white/50 ml-2">/ {quizQuestions.length}</span>
                        </div>

                        <div className="py-4 border-t border-white/10 border-b mb-6">
                            <p className="text-xl font-bold text-purple-300 mb-1">{rank.title}</p>
                            <p className="text-sm text-gray-400">{rank.message}</p>
                        </div>

                        {score === 10 && (
                            <div className="mb-6 bg-yellow-400/20 text-yellow-200 px-4 py-2 rounded-lg text-sm border border-yellow-400/30 animate-pulse">
                                🏆 Perfect Badge Unlocked!
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleStart}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            もう一度挑戦
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

    return (
        <div className="min-h-screen flex flex-col py-10 px-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => setStarted(false)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-lg font-bold text-white/80">
                    Q{currentQuestionIndex + 1} / {quizQuestions.length}
                </div>
                <div className="p-2 w-10" />
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/10 shadow-xl mb-8">
                    <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-white mb-8">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrect = index === currentQuestion.correctAnswer;
                            const showResult = showExplanation;

                            let buttonClass = "w-full p-4 rounded-xl text-left transition-all border border-white/10 hover:bg-white/5 relative overflow-hidden group ";

                            if (showResult) {
                                if (isCorrect) buttonClass = "w-full p-4 rounded-xl text-left bg-green-500/20 border-green-500 text-green-200 ";
                                else if (isSelected) buttonClass = "w-full p-4 rounded-xl text-left bg-red-500/20 border-red-500 text-red-200 ";
                                else buttonClass = "w-full p-4 rounded-xl text-left opacity-50 ";
                            } else {
                                buttonClass += "hover:border-primary/50 text-white ";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={showExplanation}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <span className="font-medium">{option}</span>
                                        {showResult && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                                        {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                                    </div>
                                    {!showExplanation && <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Explanation Area */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showExplanation ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-20 animate-fade-in-up">
                        <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                            解説
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                            {currentQuestion.explanation}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
                            >
                                {currentQuestionIndex < quizQuestions.length - 1 ? "次へ" : "結果を見る"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
