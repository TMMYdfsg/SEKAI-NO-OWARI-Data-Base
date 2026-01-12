"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Terminal, Lock, Unlock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { hiddenCommandList } from "@/data/command-master";
// We will need a way to check if a command is "unlocked".
// For now, let's assume if the USER has the achievement corresponding to the command, it is unlocked.
// Or we can track "Command Unlocked" state separately. The user requirement says "sync command master".
// Ideally `local-storage-data` should track `unlockedCommandIds`.
// For Phase 11 MVP, let's reuse `achievements` to verify unlock, OR simply check if the user has input it before.
// Requirement 5.3: Sync unlock state. 
// I'll update `local-storage-data.ts` to include `unlockedCommands`.

import { hasUnlockedCommand, hasErrorHiddenUnlocked } from "@/lib/local-storage-data";

export default function CommandsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
                            <Terminal className="text-primary" />
                            隠しコマンド一覧
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            これまでに発見した世界の秘密 (System / Hidden)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hiddenCommandList.map((cmd) => {
                        // For now we default to unlocked only if logic exists. 
                        // I will add `hasUnlockedCommand` to imports. 
                        // Since I haven't implemented that function yet, this compile will fail if I don't provide it or mock it.
                        // I will assume the function exists and implement it in the next step.
                        const isUnlocked = hasUnlockedCommand(cmd.id);

                        return (
                            <div
                                key={cmd.id}
                                className={`p-4 rounded-xl border transition-all ${isUnlocked
                                    ? "bg-primary/5 border-primary/30"
                                    : "bg-card border-white/5"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${isUnlocked ? "text-primary" : "text-white/50"}`}>
                                        {cmd.displayName}
                                    </h3>
                                    {isUnlocked ? (
                                        <Unlock size={16} className="text-primary" />
                                    ) : (
                                        <Lock size={16} className="text-muted-foreground/50" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="bg-black/40 p-2 rounded border border-white/5 font-mono text-lg text-center tracking-widest">
                                        {isUnlocked ? (
                                            <span className="text-green-400">{cmd.command}</span>
                                        ) : (
                                            <span className="text-white/20">???</span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                                        <HelpCircle size={14} className="mt-0.5 shrink-0" />
                                        <span>ヒント: {cmd.hint}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* ERROR Sequence Special Entry */}
                    {(() => {
                        const isUnlocked = hasErrorHiddenUnlocked();
                        return (
                            <div className={`p-4 rounded-xl border transition-all ${isUnlocked
                                ? "bg-red-900/10 border-red-500/30"
                                : "bg-card border-white/5"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${isUnlocked ? "text-red-500" : "text-white/50"}`}>
                                        ERROR ARCHIVE
                                    </h3>
                                    {isUnlocked ? (
                                        <Unlock size={16} className="text-red-500" />
                                    ) : (
                                        <Lock size={16} className="text-muted-foreground/50" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="bg-black/40 p-2 rounded border border-white/5 font-mono text-lg text-center tracking-widest">
                                        {isUnlocked ? (
                                            <div className="flex flex-col items-center text-sm">
                                                <span className="text-red-400">E → R → R → O → R</span>
                                                <span className="text-[10px] text-neutral-500">(R: 赤 → 青 → 黄)</span>
                                            </div>
                                        ) : (
                                            <span className="text-white/20">???</span>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                                        <HelpCircle size={14} className="mt-0.5 shrink-0" />
                                        <span>ヒント: {isUnlocked ? "ERROR特設ページヘッダー" : "Eから始まる。Rは3回。"}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
