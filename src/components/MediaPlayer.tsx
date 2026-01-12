"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, AlertCircle } from "lucide-react";

type MediaType = "mp3" | "mp4" | "wav" | "m4a";

interface MediaPlayerProps {
    filename: string;
    type: MediaType | string;
    thumbnail?: string | null;
}

export default function MediaPlayer({ filename, type, thumbnail }: MediaPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

    const isVideo = type === "mp4" || type === "m4v";
    const src = `/api/media?file=${encodeURIComponent(filename)}`;

    const togglePlay = () => {
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
            } else {
                mediaRef.current.play().catch(e => {
                    console.error("Playback failed:", e);
                    setError("Playback failed. Format may not be supported.");
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (mediaRef.current) {
            mediaRef.current.onpause = () => setIsPlaying(false);
            mediaRef.current.onplay = () => setIsPlaying(true);
            mediaRef.current.onerror = () => setError("Error loading media.");
        }
    }, []);

    if (error) {
        return (
            <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 p-2 rounded">
                <AlertCircle size={14} />
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            {isVideo ? (
                <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={src}
                    className="w-full rounded-lg bg-black aspect-video mb-2"
                    controls
                />
            ) : (
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10 relative overflow-hidden group">
                    {/* Background Thumbnail (Blurred) */}
                    {thumbnail && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-20 blur-md transition-opacity group-hover:opacity-30"
                            style={{ backgroundImage: `url('/api/media?file=${encodeURIComponent(thumbnail)}')` }}
                        />
                    )}

                    <div className="relative z-10 flex items-center justify-center h-10 w-10 shrink-0">
                        {/* Thumbnail behind play button (Circle) */}
                        {thumbnail && (
                            <div
                                className="absolute inset-0 rounded-full bg-cover bg-center opacity-60"
                                style={{ backgroundImage: `url('/api/media?file=${encodeURIComponent(thumbnail)}')` }}
                            />
                        )}
                        <button
                            onClick={togglePlay}
                            className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/80 text-white hover:bg-primary transition-colors shadow-lg relative z-20 backdrop-blur-sm"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                    </div>

                    <div className="flex-grow overflow-hidden relative z-10">
                        <div className="text-sm font-medium truncate text-white/90 drop-shadow-md">{filename}</div>
                        <div className="text-xs text-muted-foreground uppercase">{type}</div>
                    </div>
                    <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
                </div>
            )}
        </div>
    );
}
