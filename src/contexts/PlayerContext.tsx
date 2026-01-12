"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { addToPlayHistory } from "@/lib/play-history";

export interface Track {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail?: string | null;
    album?: string;
}

interface PlayerState {
    playlist: Track[];
    currentIndex: number;
    isPlaying: boolean;
    isShuffle: boolean;
    isLoop: boolean; // Loop single track
    isLoopAll: boolean; // Loop entire playlist
    currentTime: number;
    duration: number;
}

interface PlayerContextType extends PlayerState {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playSong: (track: Track, playlist?: Track[]) => void;
    playPlaylist: (playlist: Track[], startIndex?: number) => void;
    togglePlay: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    toggleShuffle: () => void;
    toggleLoop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    volume: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}

const STORAGE_KEY = "sekaowa_player_state";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [isLoopAll, setIsLoopAll] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.playlist && parsed.playlist.length > 0) {
                    setPlaylist(parsed.playlist);
                    setCurrentIndex(parsed.currentIndex || 0);
                    setCurrentTime(parsed.currentTime || 0);
                    setIsShuffle(parsed.isShuffle || false);
                    setIsLoop(parsed.isLoop || false);
                    setVolumeState(parsed.volume ?? 1);
                }
            } catch (e) {
                console.error("Failed to parse saved player state:", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (!isInitialized) return;
        const stateToSave = {
            playlist,
            currentIndex,
            currentTime,
            isShuffle,
            isLoop,
            volume,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [playlist, currentIndex, currentTime, isShuffle, isLoop, volume, isInitialized]);

    // Set initial audio time when track loads
    useEffect(() => {
        if (audioRef.current && isInitialized && playlist.length > 0) {
            const track = playlist[currentIndex];
            if (track) {
                audioRef.current.src = `/api/media?file=${encodeURIComponent(track.path)}`;
                audioRef.current.currentTime = currentTime;
                audioRef.current.volume = volume;
            }
        }
    }, [isInitialized]);

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (isLoop) {
                audio.currentTime = 0;
                audio.play();
            } else if (isLoopAll || currentIndex < playlist.length - 1) {
                nextTrack();
            } else {
                setIsPlaying(false);
            }
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, [isLoop, isLoopAll, currentIndex, playlist.length]);

    const playSong = useCallback((track: Track, newPlaylist?: Track[]) => {
        if (newPlaylist) {
            setPlaylist(newPlaylist);
            const idx = newPlaylist.findIndex(t => t.path === track.path);
            setCurrentIndex(idx >= 0 ? idx : 0);
        } else {
            setPlaylist([track]);
            setCurrentIndex(0);
        }

        // Record to play history
        addToPlayHistory({
            songId: track.name,
            songName: track.name.replace(/\.[^/.]+$/, ""),
            category: track.category,
            source: { type: 'songs' },
        });

        if (audioRef.current) {
            audioRef.current.src = `/api/media?file=${encodeURIComponent(track.path)}`;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    }, []);

    const playPlaylist = useCallback((newPlaylist: Track[], startIndex = 0) => {
        setPlaylist(newPlaylist);
        setCurrentIndex(startIndex);

        const track = newPlaylist[startIndex];
        if (track) {
            // Record to play history
            addToPlayHistory({
                songId: track.name,
                songName: track.name.replace(/\.[^/.]+$/, ""),
                category: track.category,
                source: { type: 'playlist' },
            });
        }

        if (audioRef.current && track) {
            audioRef.current.src = `/api/media?file=${encodeURIComponent(track.path)}`;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
    }, [isPlaying]);

    const nextTrack = useCallback(() => {
        if (playlist.length === 0) return;

        let nextIndex: number;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
            nextIndex = (currentIndex + 1) % playlist.length;
        }

        const track = playlist[nextIndex];
        if (track) {
            addToPlayHistory({
                songId: track.name,
                songName: track.name.replace(/\.[^/.]+$/, ""),
                category: track.category,
                source: { type: 'playlist' },
            });
        }

        setCurrentIndex(nextIndex);
        if (audioRef.current && track) {
            audioRef.current.src = `/api/media?file=${encodeURIComponent(track.path)}`;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    }, [playlist, currentIndex, isShuffle]);

    const prevTrack = useCallback(() => {
        if (playlist.length === 0) return;

        // If more than 3 seconds into the track, restart it
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);
        if (audioRef.current && playlist[prevIndex]) {
            audioRef.current.src = `/api/media?file=${encodeURIComponent(playlist[prevIndex].path)}`;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    }, [playlist, currentIndex]);

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => !prev);
    }, []);

    const toggleLoop = useCallback(() => {
        // Cycle: Off -> Loop Single -> Loop All -> Off
        if (!isLoop && !isLoopAll) {
            setIsLoop(true);
        } else if (isLoop) {
            setIsLoop(false);
            setIsLoopAll(true);
        } else {
            setIsLoopAll(false);
        }
    }, [isLoop, isLoopAll]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    const setVolume = useCallback((vol: number) => {
        setVolumeState(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    }, []);

    const currentTrack = playlist[currentIndex] || null;

    return (
        <PlayerContext.Provider
            value={{
                playlist,
                currentIndex,
                isPlaying,
                isShuffle,
                isLoop,
                isLoopAll,
                currentTime,
                duration,
                volume,
                audioRef,
                playSong,
                playPlaylist,
                togglePlay,
                nextTrack,
                prevTrack,
                toggleShuffle,
                toggleLoop,
                seek,
                setVolume,
            }}
        >
            {children}
            <audio ref={audioRef} preload="metadata" />
        </PlayerContext.Provider>
    );
}

export function useCurrentTrack() {
    const { playlist, currentIndex } = usePlayer();
    return playlist[currentIndex] || null;
}
