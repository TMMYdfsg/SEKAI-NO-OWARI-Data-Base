"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AlertTriangle, Skull, Zap } from "lucide-react";

interface NoiseEffectProps {
    isActive: boolean;
    onComplete?: () => void;
    noiseImageSrc?: string;
    errorAudioSrc?: string;
    duration?: number;
    intensity?: "low" | "medium" | "high";
}

const DEFAULT_ERROR_AUDIO = "/effects/not-found.mp3";
const DEFAULT_NOISE_IMAGE = "/effects/not-found.png";

const INTENSITY_SETTINGS = {
    low: { opacity: 0.3, shake: 2, audioPitch: 1.0, particles: 15 },
    medium: { opacity: 0.5, shake: 4, audioPitch: 1.0, particles: 30 },
    high: { opacity: 0.8, shake: 8, audioPitch: 1.2, particles: 50 },
};

// Matrix rain characters
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ERROR";

// Glitch text variations
const GLITCH_TEXTS = ["ERROR", "E̴R̸R̷O̶R̸", "εяяσя", "3RR0R", "ĘŔŔŐŔ"];

/**
 * Enhanced Noise Effect with Matrix-style digital rain,
 * glitch text effects, and pulse wave animations
 */
export function NoiseEffect({
    isActive,
    onComplete,
    noiseImageSrc = DEFAULT_NOISE_IMAGE,
    errorAudioSrc = DEFAULT_ERROR_AUDIO,
    duration = 3000,
    intensity = "medium",
}: NoiseEffectProps) {
    const [phase, setPhase] = useState<"idle" | "glitch" | "fade">("idle");
    const [imageOpacity, setImageOpacity] = useState(0);
    const [glitchText, setGlitchText] = useState("ERROR");
    const [pulseScale, setPulseScale] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const settings = INTENSITY_SETTINGS[intensity];

    // Generate matrix rain columns
    const matrixColumns = useMemo(() => {
        return Array.from({ length: settings.particles }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            speed: 0.5 + Math.random() * 1.5,
            delay: Math.random() * 2,
            chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
                MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
            ).join(""),
        }));
    }, [settings.particles]);

    // Glitch text animation
    useEffect(() => {
        if (!isActive || phase !== "glitch") return;

        const interval = setInterval(() => {
            setGlitchText(GLITCH_TEXTS[Math.floor(Math.random() * GLITCH_TEXTS.length)]);
        }, 100);

        return () => clearInterval(interval);
    }, [isActive, phase]);

    // Pulse animation
    useEffect(() => {
        if (!isActive || phase !== "glitch") {
            setPulseScale(0);
            return;
        }

        let animationFrame: number;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const cycle = (elapsed % 1000) / 1000;
            setPulseScale(cycle);
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [isActive, phase]);

    // Main effect lifecycle
    useEffect(() => {
        if (!isActive) {
            setPhase("idle");
            setImageOpacity(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            return;
        }

        setPhase("glitch");
        setImageOpacity(settings.opacity);

        if (audioRef.current) {
            audioRef.current.playbackRate = settings.audioPitch;
            audioRef.current.volume = 0.7;
            audioRef.current.play().catch(console.error);
        }

        const fadeTimeout = setTimeout(() => {
            setPhase("fade");
            setImageOpacity(0);
        }, duration - 500);

        const completeTimeout = setTimeout(() => {
            setPhase("idle");
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            onComplete?.();
        }, duration);

        return () => {
            clearTimeout(fadeTimeout);
            clearTimeout(completeTimeout);
        };
    }, [isActive, duration, settings, onComplete]);

    if (!isActive && phase === "idle") return null;

    return (
        <>
            <audio
                ref={audioRef}
                src={errorAudioSrc}
                preload="auto"
            />

            {/* Main Overlay */}
            <div
                className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-300 ${phase === "fade" || phase === "idle" ? "opacity-0" : "opacity-100"
                    }`}
                style={{
                    animation: phase === "glitch" ? `shake ${0.08}s infinite` : "none",
                }}
            >
                {/* Black base */}
                <div className="absolute inset-0 bg-black/80" />

                {/* Noise Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
                    style={{
                        backgroundImage: `url(${noiseImageSrc})`,
                        opacity: imageOpacity,
                        filter: "contrast(1.5) brightness(0.8)",
                    }}
                />

                {/* Matrix Digital Rain */}
                {phase === "glitch" && (
                    <div className="absolute inset-0 overflow-hidden">
                        {matrixColumns.map((col) => (
                            <div
                                key={col.id}
                                className="absolute text-green-500/30 font-mono text-xs whitespace-pre leading-tight"
                                style={{
                                    left: `${col.x}%`,
                                    top: "-100%",
                                    writingMode: "vertical-rl",
                                    animation: `matrixFall ${col.speed}s linear infinite`,
                                    animationDelay: `${col.delay}s`,
                                }}
                            >
                                {col.chars}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pulse Wave Effect */}
                {phase === "glitch" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            className="rounded-full border-2 border-red-500/50"
                            style={{
                                width: `${pulseScale * 200}vw`,
                                height: `${pulseScale * 200}vw`,
                                opacity: 1 - pulseScale,
                                transition: "none",
                            }}
                        />
                    </div>
                )}

                {/* Scanlines */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
                        opacity: phase === "glitch" ? 0.6 : 0.2,
                    }}
                />

                {/* Horizontal Glitch Lines */}
                {phase === "glitch" && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-1 bg-red-500/30"
                                style={{
                                    left: 0,
                                    right: 0,
                                    top: `${20 + i * 15 + Math.random() * 5}%`,
                                    animation: `glitchLine ${0.2 + Math.random() * 0.3}s steps(1) infinite`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            />
                        ))}
                    </>
                )}

                {/* RGB Separation */}
                {phase === "glitch" && (
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 bg-red-500/15"
                            style={{ transform: `translateX(-${settings.shake}px)` }}
                        />
                        <div
                            className="absolute inset-0 bg-cyan-500/15"
                            style={{ transform: `translateX(${settings.shake}px)` }}
                        />
                        <div
                            className="absolute inset-0 bg-blue-500/10"
                            style={{ transform: `translateY(${settings.shake / 2}px)` }}
                        />
                    </div>
                )}

                {/* Glitch Error Text */}
                {phase === "glitch" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {/* Main Error Text */}
                        <div className="relative mb-8">
                            <Skull size={64} className="text-red-500 animate-bounce mb-4 mx-auto"
                                style={{ filter: "drop-shadow(0 0 20px rgba(239,68,68,0.8))" }} />

                            <span
                                className="text-7xl md:text-9xl font-bold text-red-500 tracking-widest relative block"
                                style={{
                                    textShadow: `
                                        0 0 30px rgba(255,0,0,0.8),
                                        ${settings.shake}px 0 0 cyan,
                                        -${settings.shake}px 0 0 yellow
                                    `,
                                    animation: "glitchText 0.3s steps(1) infinite",
                                }}
                            >
                                {glitchText}
                            </span>

                            {/* Ghost layers */}
                            <span
                                className="absolute inset-0 text-7xl md:text-9xl font-bold text-cyan-500/50 tracking-widest"
                                style={{ transform: `translate(${settings.shake}px, -2px)` }}
                            >
                                {glitchText}
                            </span>
                            <span
                                className="absolute inset-0 text-7xl md:text-9xl font-bold text-yellow-500/50 tracking-widest"
                                style={{ transform: `translate(-${settings.shake}px, 2px)` }}
                            >
                                {glitchText}
                            </span>
                        </div>

                        {/* Sub messages */}
                        <div className="space-y-2 text-center">
                            <p className="text-red-400 text-sm font-mono tracking-widest animate-pulse">
                                SYSTEM_FAILURE_DETECTED
                            </p>
                            <p className="text-neutral-500 text-xs font-mono">
                                ATTEMPTING_RECOVERY...
                            </p>
                        </div>
                    </div>
                )}

                {/* Corner Decorations */}
                {phase === "glitch" && (
                    <>
                        <div className="absolute top-8 left-8 text-red-500/50">
                            <Zap size={24} className="animate-pulse" />
                        </div>
                        <div className="absolute top-8 right-8 text-red-500/50">
                            <AlertTriangle size={24} className="animate-pulse" />
                        </div>
                        <div className="absolute bottom-8 left-8 text-xs font-mono text-red-900/50">
                            ERR_CODE: 0x{Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}
                        </div>
                        <div className="absolute bottom-8 right-8 text-xs font-mono text-red-900/50">
                            MEM_ADDR: 0x{Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}
                        </div>
                    </>
                )}

                {/* Warning Icon */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-400">
                    <AlertTriangle size={20} className="animate-pulse" />
                    <span className="text-sm font-mono tracking-wider">INVALID_COMMAND</span>
                </div>

                {/* Vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "radial-gradient(ellipse at center, transparent 20%, black 100%)",
                    }}
                />
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-${settings.shake}px, ${settings.shake / 2}px); }
                    50% { transform: translate(${settings.shake}px, -${settings.shake / 2}px); }
                    75% { transform: translate(-${settings.shake / 2}px, ${settings.shake}px); }
                }
                @keyframes matrixFall {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(200vh); }
                }
                @keyframes glitchLine {
                    0%, 100% { opacity: 0; transform: translateX(0); }
                    50% { opacity: 1; transform: translateX(${Math.random() > 0.5 ? '' : '-'}${settings.shake * 2}px); }
                }
                @keyframes glitchText {
                    0%, 100% { clip-path: inset(0 0 0 0); }
                    20% { clip-path: inset(10% 0 60% 0); }
                    40% { clip-path: inset(40% 0 20% 0); }
                    60% { clip-path: inset(80% 0 5% 0); }
                    80% { clip-path: inset(25% 0 35% 0); }
                }
            `}</style>
        </>
    );
}

/**
 * Secret Command Input with integrated noise effect
 */
interface SecretCommandInputProps {
    onValidCommand: (command: string) => void;
    onInvalidCommand: () => void;
    validateCommand: (input: string) => boolean;
    noiseImageSrc?: string;
    errorAudioSrc?: string;
}

export function SecretCommandInput({
    onValidCommand,
    onInvalidCommand,
    validateCommand,
    noiseImageSrc,
    errorAudioSrc = DEFAULT_ERROR_AUDIO,
}: SecretCommandInputProps) {
    const [input, setInput] = useState("");
    const [showNoise, setShowNoise] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        if (validateCommand(input.trim())) {
            onValidCommand(input.trim());
            setInput("");
            setAttempts(0);
        } else {
            setShowNoise(true);
            setAttempts(prev => prev + 1);
            onInvalidCommand();
        }
    };

    const handleNoiseComplete = () => {
        setShowNoise(false);
        setInput("");
    };

    const noiseIntensity = attempts >= 3 ? "high" : attempts >= 2 ? "medium" : "low";

    return (
        <>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="秘密のコマンドを入力..."
                    className={`w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-sm focus:outline-none transition-colors ${attempts > 0
                        ? "border-red-500/50 text-red-400"
                        : "border-white/20 focus:border-primary"
                        }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                    {attempts > 0 && (
                        <span className="text-xs text-red-400/50">
                            {attempts}回失敗
                        </span>
                    )}
                </div>
            </form>

            <NoiseEffect
                isActive={showNoise}
                onComplete={handleNoiseComplete}
                noiseImageSrc={noiseImageSrc}
                errorAudioSrc={errorAudioSrc}
                duration={attempts >= 3 ? 4000 : 2500}
                intensity={noiseIntensity}
            />
        </>
    );
}
