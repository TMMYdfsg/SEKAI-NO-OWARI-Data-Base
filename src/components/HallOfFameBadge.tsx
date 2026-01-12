"use client";

import { Trophy, Crown, Star, Award } from "lucide-react";

type HallOfFameLevel = 'gold' | 'silver' | 'bronze' | null;

interface HallOfFameCriteria {
    playCount?: number;
    favoriteCount?: number;
    daysAsFavorite?: number;
}

/**
 * 殿堂入り判定ロジック
 */
export function getHallOfFameLevel(criteria: HallOfFameCriteria): HallOfFameLevel {
    const { playCount = 0, favoriteCount = 0, daysAsFavorite = 0 } = criteria;

    // Gold: 再生100回以上 または お気に入り365日以上
    if (playCount >= 100 || daysAsFavorite >= 365) {
        return 'gold';
    }

    // Silver: 再生50回以上 または お気に入り180日以上
    if (playCount >= 50 || daysAsFavorite >= 180) {
        return 'silver';
    }

    // Bronze: 再生20回以上 または お気に入り30日以上
    if (playCount >= 20 || daysAsFavorite >= 30) {
        return 'bronze';
    }

    return null;
}

/**
 * お気に入りからの日数計算
 */
export function getDaysAsFavorite(favoritedAt?: string): number {
    if (!favoritedAt) return 0;
    const date = new Date(favoritedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface HallOfFameBadgeProps {
    level: HallOfFameLevel;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default function HallOfFameBadge({
    level,
    size = "md",
    showLabel = false
}: HallOfFameBadgeProps) {
    if (!level) return null;

    const iconSize = size === "sm" ? 14 : size === "md" ? 18 : 24;

    const config = {
        gold: {
            icon: Crown,
            label: "殿堂入り Gold",
            bgClass: "bg-amber-500/20",
            textClass: "text-amber-400",
            borderClass: "border-amber-500/30",
        },
        silver: {
            icon: Trophy,
            label: "殿堂入り Silver",
            bgClass: "bg-slate-300/20",
            textClass: "text-slate-300",
            borderClass: "border-slate-300/30",
        },
        bronze: {
            icon: Award,
            label: "殿堂入り Bronze",
            bgClass: "bg-orange-600/20",
            textClass: "text-orange-500",
            borderClass: "border-orange-600/30",
        },
    };

    const { icon: Icon, label, bgClass, textClass, borderClass } = config[level];

    if (showLabel) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2 py-1 ${bgClass} ${textClass} border ${borderClass} rounded-full text-xs`}
                title={label}
            >
                <Icon size={iconSize} className="fill-current" />
                {label}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center justify-center w-6 h-6 ${bgClass} ${textClass} border ${borderClass} rounded-full`}
            title={label}
        >
            <Icon size={iconSize} className="fill-current" />
        </span>
    );
}

// 星評価コンポーネント（殿堂入りのための再生回数可視化）
export function PlayCountStars({ playCount }: { playCount: number }) {
    const stars = Math.min(5, Math.floor(playCount / 10));

    if (stars === 0) return null;

    return (
        <div className="flex items-center gap-0.5" title={`${playCount}回再生`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={12}
                    className={`${i < stars
                            ? 'text-amber-400 fill-current'
                            : 'text-white/20'
                        }`}
                />
            ))}
        </div>
    );
}
