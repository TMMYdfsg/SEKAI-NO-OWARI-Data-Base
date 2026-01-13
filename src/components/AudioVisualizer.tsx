"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Waves, Sparkles, Music2, Minimize2, Maximize2 } from "lucide-react";

interface AudioVisualizerProps {
    audioElement?: HTMLAudioElement | null;
    isPlaying: boolean;
    trackTitle?: string;
    trackAlbum?: string;
}

type VisualizerMode = 'bars' | 'wave' | 'particles' | 'minimal';

const modeNames: Record<VisualizerMode, string> = {
    bars: 'バー',
    wave: 'ウェーブ',
    particles: 'パーティクル',
    minimal: 'ミニマル',
};

export default function AudioVisualizer({
    audioElement,
    isPlaying,
    trackTitle = '',
    trackAlbum = ''
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    const [mode, setMode] = useState<VisualizerMode>('bars');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Colors based on mode
    const getColors = useCallback(() => {
        switch (mode) {
            case 'bars':
                return { primary: '#d4af37', secondary: '#8b7355', glow: 'rgba(212, 175, 55, 0.5)' };
            case 'wave':
                return { primary: '#00bcd4', secondary: '#0097a7', glow: 'rgba(0, 188, 212, 0.5)' };
            case 'particles':
                return { primary: '#e040fb', secondary: '#7c4dff', glow: 'rgba(224, 64, 251, 0.5)' };
            case 'minimal':
                return { primary: '#ffffff', secondary: '#888888', glow: 'rgba(255, 255, 255, 0.3)' };
        }
    }, [mode]);

    // Connect to audio element
    useEffect(() => {
        if (!audioElement || isConnected) return;

        try {
            // Reuse existing context if available
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;

            // Create analyzer
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 256;

            // Only create source once per audio element
            if (!sourceRef.current) {
                sourceRef.current = ctx.createMediaElementSource(audioElement);
            }

            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(ctx.destination);

            setIsConnected(true);
        } catch (e) {
            console.warn('Audio visualizer connection failed:', e);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioElement, isConnected]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || !analyserRef.current || !canvasRef.current) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const colors = getColors();

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;

            // Clear with fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);

            switch (mode) {
                case 'bars':
                    drawBars(ctx, dataArray, bufferLength, width, height, colors);
                    break;
                case 'wave':
                    drawWave(ctx, dataArray, bufferLength, width, height, colors);
                    break;
                case 'particles':
                    drawParticles(ctx, dataArray, bufferLength, width, height, colors);
                    break;
                case 'minimal':
                    drawMinimal(ctx, dataArray, bufferLength, width, height, colors);
                    break;
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, mode, getColors]);

    // Drawing functions
    const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array, length: number, w: number, h: number, colors: ReturnType<typeof getColors>) => {
        const barWidth = w / length * 2.5;
        let x = 0;

        for (let i = 0; i < length; i++) {
            const barHeight = (data[i] / 255) * h * 0.8;

            const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
            gradient.addColorStop(0, colors.secondary);
            gradient.addColorStop(1, colors.primary);

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.glow;
            ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    };

    const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array, length: number, w: number, h: number, colors: ReturnType<typeof getColors>) => {
        ctx.beginPath();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.glow;

        const sliceWidth = w / length;
        let x = 0;

        ctx.moveTo(0, h / 2);

        for (let i = 0; i < length; i++) {
            const v = data[i] / 128.0;
            const y = (v * h) / 2;
            ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Mirror wave
        ctx.beginPath();
        ctx.strokeStyle = colors.secondary;
        ctx.globalAlpha = 0.5;
        x = 0;
        ctx.moveTo(0, h / 2);

        for (let i = 0; i < length; i++) {
            const v = data[i] / 128.0;
            const y = h - (v * h) / 2;
            ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    const drawParticles = (ctx: CanvasRenderingContext2D, data: Uint8Array, length: number, w: number, h: number, colors: ReturnType<typeof getColors>) => {
        const centerX = w / 2;
        const centerY = h / 2;

        for (let i = 0; i < length; i += 2) {
            const amplitude = data[i] / 255;
            const angle = (i / length) * Math.PI * 2;
            const radius = 50 + amplitude * 100;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const size = 2 + amplitude * 8;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = amplitude > 0.5 ? colors.primary : colors.secondary;
            ctx.shadowBlur = 20;
            ctx.shadowColor = colors.glow;
            ctx.fill();
        }
    };

    const drawMinimal = (ctx: CanvasRenderingContext2D, data: Uint8Array, length: number, w: number, h: number, colors: ReturnType<typeof getColors>) => {
        // Simple center line with pulse
        const avg = data.reduce((a, b) => a + b, 0) / length;
        const pulse = (avg / 255) * 50;

        ctx.beginPath();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2 + pulse * 0.1;
        ctx.shadowBlur = pulse;
        ctx.shadowColor = colors.glow;

        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 30 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = colors.secondary;
        ctx.stroke();
    };

    if (!audioElement) {
        return (
            <div className="flex items-center justify-center h-20 bg-black/30 rounded-lg text-muted-foreground text-sm">
                <Music2 size={16} className="mr-2" />
                オーディオ再生中にビジュアライザーが表示されます
            </div>
        );
    }

    return (
        <div className={`relative bg-black/50 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'h-64' : 'h-32'}`}>
            <canvas
                ref={canvasRef}
                width={800}
                height={isExpanded ? 256 : 128}
                className="w-full h-full"
            />

            {/* Track Info Overlay */}
            <div className="absolute bottom-2 left-3 text-white/60 text-xs">
                {trackTitle && <span className="font-medium">{trackTitle}</span>}
                {trackAlbum && <span className="ml-2 text-white/40">- {trackAlbum}</span>}
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
                {/* Mode Switcher */}
                <div className="flex items-center gap-0.5 bg-black/50 rounded-lg p-0.5">
                    {(Object.keys(modeNames) as VisualizerMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-2 py-1 rounded text-[10px] transition-colors ${mode === m
                                ? 'bg-white/20 text-white'
                                : 'text-white/50 hover:text-white/80'
                                }`}
                        >
                            {modeNames[m]}
                        </button>
                    ))}
                </div>

                {/* Expand Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 bg-black/50 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            {/* Playing indicator */}
            {isPlaying && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] text-white/60">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                </div>
            )}
        </div>
    );
}
