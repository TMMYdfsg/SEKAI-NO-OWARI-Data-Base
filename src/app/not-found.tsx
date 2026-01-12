"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NoiseEffect } from "@/components/NoiseEffect";
import { addErrorLog } from "@/lib/local-storage-data";
import { AlertTriangle, Skull } from "lucide-react";

export default function NotFound() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [glitchText, setGlitchText] = useState("404");

    useEffect(() => {
        // Log this 404 error
        addErrorLog({
            code: "404",
            path: typeof window !== 'undefined' ? window.location.pathname : "/unknown",
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            message: "Page not found",
        });

        // Glitch text effect
        const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        const glitchInterval = setInterval(() => {
            const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            const randomPos = Math.floor(Math.random() * 3);
            const newText = "404".split("");
            newText[randomPos] = randomChar;
            setGlitchText(newText.join(""));
        }, 100);

        // Reset to normal occasionally
        const resetInterval = setInterval(() => {
            setGlitchText("404");
        }, 500);

        // Automatically start redirect sequence
        const timer = setTimeout(() => {
            setIsRedirecting(true);
        }, 4000);

        return () => {
            clearInterval(glitchInterval);
            clearInterval(resetInterval);
            clearTimeout(timer);
        };
    }, []);

    const handleComplete = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white overflow-hidden">
            {/* Background Matrix Effect */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-black" />
            </div>

            {/* Floating Error Symbols */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-red-500/20 font-mono text-xs animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    >
                        {["ERROR", "404", "NULL", "VOID", "???"][Math.floor(Math.random() * 5)]}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="text-center z-10 relative">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6 animate-bounce">
                    <Skull size={48} className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                </div>

                {/* Glitch 404 */}
                <h1
                    className="text-8xl md:text-9xl font-bold mb-4 font-mono text-red-500 tracking-widest relative"
                    style={{
                        textShadow: "0 0 30px rgba(255,0,0,0.8), 3px 0 0 cyan, -3px 0 0 yellow",
                    }}
                >
                    <span className="relative inline-block">
                        {glitchText}
                        <span className="absolute inset-0 text-cyan-500 opacity-50 animate-pulse" style={{ transform: "translateX(2px)" }}>
                            {glitchText}
                        </span>
                        <span className="absolute inset-0 text-yellow-500 opacity-50 animate-pulse" style={{ transform: "translateX(-2px)" }}>
                            {glitchText}
                        </span>
                    </span>
                </h1>

                {/* Sub Text */}
                <p className="text-2xl text-neutral-400 tracking-widest mb-2 font-mono">
                    PAGE NOT FOUND
                </p>
                <p className="text-sm text-neutral-600 tracking-wider mb-8 font-mono">
                    REALITY_COLLAPSED // MEMORY_CORRUPTED
                </p>

                {/* Warning Message */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs mb-8">
                    <AlertTriangle size={14} className="animate-pulse" />
                    <span>This error has been logged to the ERROR ARCHIVE</span>
                </div>

                {/* Redirect Message */}
                <div className="text-xs text-neutral-600 animate-pulse font-mono">
                    {isRedirecting ? "INITIATING_RECOVERY..." : "ANALYZING_CORRUPTION..."}
                </div>
                <div className="mt-4 text-[10px] text-neutral-700 font-mono">
                    AUTO_REDIRECT_IN_PROGRESS
                </div>
            </div>

            {/* Noise Effect Overlay */}
            <NoiseEffect
                isActive={true}
                duration={4000}
                intensity="high"
                onComplete={handleComplete}
            />
        </div>
    );
}

