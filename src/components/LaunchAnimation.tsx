"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimationRecipeId } from "@/lib/theme-definitions";

interface LaunchAnimationProps {
    recipeId: AnimationRecipeId;
    onComplete: () => void;
    intensity?: "low" | "normal" | "high";
    durationMode?: "short" | "normal";
    customText?: string;
    customDuration?: number;
}

export default function LaunchAnimation({
    recipeId,
    onComplete,
    intensity = "normal",
    durationMode = "normal",
    customText,
    customDuration
}: LaunchAnimationProps) {
    const [phase, setPhase] = useState<0 | 1 | 2>(0);

    useEffect(() => {
        // Timeline configuration
        // If customDuration is provided, use it as total duration (approx 1s base)
        let DURATION_SCALE = 1.0;

        if (customDuration) {
            DURATION_SCALE = customDuration; // Base is 1.0s, so scale is just the seconds
        } else {
            DURATION_SCALE = durationMode === "short" ? 0.5 : 1.0;
        }

        // Phase 0: Entry (0s - 10%)
        // Phase 1: Motif (10% - 60%)
        // Phase 2: Merge (60% - 100%)

        const timer1 = setTimeout(() => setPhase(1), 100 * DURATION_SCALE);
        const timer2 = setTimeout(() => setPhase(2), 600 * DURATION_SCALE);
        const timer3 = setTimeout(() => {
            onComplete();
        }, 1000 * DURATION_SCALE);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [durationMode, onComplete, customDuration]);

    // Recipe Definitions (Hardcoded for now based on ID)
    const getRecipeStyles = (id: AnimationRecipeId) => {
        switch (id) {
            case "ocean": return { bg: "bg-blue-950", accent: "text-cyan-400", particle: "🫧" };
            case "forest": return { bg: "bg-green-950", accent: "text-emerald-400", particle: "🍃" };
            case "city": return { bg: "bg-slate-900", accent: "text-amber-400", particle: "🌃" };
            case "fantasy": return { bg: "bg-purple-950", accent: "text-pink-400", particle: "✨" };
            case "toxic": return { bg: "bg-fuchsia-950", accent: "text-purple-500", particle: "☠️" };
            case "rain": return { bg: "bg-slate-800", accent: "text-blue-300", particle: "💧" };
            case "party": return { bg: "bg-indigo-950", accent: "text-yellow-300", particle: "🎉" };
            default: return { bg: "bg-black", accent: "text-white", particle: "✨" };
        }
    };

    const styles = getRecipeStyles(recipeId);

    return (
        <AnimatePresence>
            {phase < 2 && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden ${styles.bg}`}
                >
                    {/* Phase 1: Motif */}
                    {phase >= 1 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className="relative"
                        >
                            {/* Central Motif (Placeholder Text/Icon) */}
                            <div className={`text-6xl font-bold tracking-widest ${styles.accent} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
                                {customText || (recipeId === "default" ? "SEKAOWA" : recipeId.toUpperCase())}
                            </div>

                            {/* Particles */}
                            {intensity !== "low" && (
                                <div className="absolute inset-0 -m-20">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ y: 0, x: 0, opacity: 0 }}
                                            animate={{
                                                y: Math.random() * 100 - 50,
                                                x: Math.random() * 100 - 50,
                                                opacity: [0, 1, 0]
                                            }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className="absolute text-2xl"
                                            style={{
                                                top: `${50 + Math.random() * 20 - 10}%`,
                                                left: `${50 + Math.random() * 20 - 10}%`
                                            }}
                                        >
                                            {styles.particle}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
