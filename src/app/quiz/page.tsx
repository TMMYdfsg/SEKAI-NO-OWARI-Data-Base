"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Brain,
    Music,
    Timer,
    Infinity,
    Swords,
    Trophy,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { QUIZ_MODES, RIVALS } from "@/data/quiz-config";

const iconMap: Record<string, React.ElementType> = {
    Brain,
    Music,
    Timer,
    Infinity,
    Swords,
};

export default function QuizHubPage() {
    const [hoveredMode, setHoveredMode] = useState<string | null>(null);

    return (
        <div className="min-h-screen py-24 px-4 bg-gradient-to-br from-purple-900/50 via-background to-blue-900/50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy size={48} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                    </div>
                    <h1 className="text-5xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-yellow-200 mb-4">
                        QUIZ CENTER
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        あなたのセカオワ愛が試される
                    </p>
                </div>

                {/* Mode Cards */}
                <div className="grid gap-4 mb-12">
                    {QUIZ_MODES.map((mode) => {
                        const Icon = iconMap[mode.icon] || Brain;
                        const isHovered = hoveredMode === mode.id;

                        // Route mapping
                        const href = mode.id === 'trivia'
                            ? '/quiz/trivia'
                            : `/quiz/${mode.id}`;

                        return (
                            <Link
                                key={mode.id}
                                href={href}
                                onMouseEnter={() => setHoveredMode(mode.id)}
                                onMouseLeave={() => setHoveredMode(null)}
                                className={`
                                    group relative overflow-hidden rounded-2xl border border-white/10 
                                    bg-gradient-to-r ${mode.color} bg-opacity-10 
                                    hover:bg-opacity-20 transition-all duration-300
                                    ${isHovered ? 'scale-[1.02] shadow-2xl' : ''}
                                    ${!mode.available ? 'opacity-50 pointer-events-none' : ''}
                                `}
                            >
                                {/* Background Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                                <div className="relative p-6 flex items-center gap-6">
                                    {/* Icon */}
                                    <div className={`
                                        w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} 
                                        flex items-center justify-center shadow-lg
                                        group-hover:scale-110 transition-transform duration-300
                                    `}>
                                        <Icon size={32} className="text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-white">
                                                {mode.nameJa}
                                            </h3>
                                            <span className="text-xs text-white/50 font-mono">
                                                {mode.name}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/70">
                                            {mode.description}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight
                                        size={24}
                                        className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all"
                                    />
                                </div>

                                {/* New Badge for Intro Quiz */}
                                {mode.id === 'intro' && (
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <Sparkles size={10} />
                                        NEW
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Rival Preview */}
                <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Swords size={20} className="text-red-400" />
                        ライバル一覧
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {RIVALS.map((rival) => (
                            <div
                                key={rival.id}
                                className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="text-3xl mb-2">{rival.avatar}</div>
                                <div className="text-sm font-bold text-white">{rival.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase">
                                    {rival.difficulty}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        ホームに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
