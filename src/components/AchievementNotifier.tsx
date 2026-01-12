"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

export type AchievementToastEvent = CustomEvent<{ title: string }>;

export const ACHIEVEMENT_EVENT_NAME = "achievement_unlocked";

export function notifyAchievement(title: string) {
    if (typeof window !== "undefined") {
        const event = new CustomEvent(ACHIEVEMENT_EVENT_NAME, {
            detail: { title },
        });
        window.dispatchEvent(event);
    }
}

export default function AchievementNotifier() {
    const [toast, setToast] = useState<{ title: string; visible: boolean } | null>(null);

    useEffect(() => {
        const handleUnlock = (e: Event) => {
            const detail = (e as AchievementToastEvent).detail;
            setToast({ title: detail.title, visible: true });

            // Hide after 4 seconds
            setTimeout(() => {
                setToast(prev => prev ? { ...prev, visible: false } : null);
            }, 4000);
        };

        window.addEventListener(ACHIEVEMENT_EVENT_NAME, handleUnlock);
        return () => window.removeEventListener(ACHIEVEMENT_EVENT_NAME, handleUnlock);
    }, []);

    if (!toast || !toast.visible) return null;

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
            <div className="bg-black/80 border border-yellow-500/50 text-white px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center gap-4 backdrop-blur-md">
                <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Trophy className="text-yellow-400" size={24} />
                </div>
                <div>
                    < p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Achievement Unlocked</p>
                    <p className="font-bold text-lg">{toast.title}</p>
                </div>
            </div>
        </div>
    );
}
