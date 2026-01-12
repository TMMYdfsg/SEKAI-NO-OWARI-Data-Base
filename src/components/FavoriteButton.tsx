"use client";

import { useState } from "react";
import { Heart, X, MessageSquare } from "lucide-react";

interface FavoriteButtonProps {
    isFavorite: boolean;
    reason?: string;
    onChange: (isFavorite: boolean, reason?: string) => void;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default function FavoriteButton({
    isFavorite,
    reason,
    onChange,
    size = "md",
    showLabel = false
}: FavoriteButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [editReason, setEditReason] = useState(reason || "");

    const iconSize = size === "sm" ? 14 : size === "md" ? 18 : 24;

    const handleToggle = () => {
        if (isFavorite) {
            onChange(false);
        } else {
            setShowModal(true);
        }
    };

    const handleSave = () => {
        onChange(true, editReason.trim() || undefined);
        setShowModal(false);
    };

    const handleCancel = () => {
        setEditReason(reason || "");
        setShowModal(false);
    };

    return (
        <>
            <button
                onClick={handleToggle}
                className={`group inline-flex items-center gap-1.5 transition-all ${isFavorite
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-muted-foreground hover:text-red-400'
                    }`}
                title={isFavorite ? (reason || "お気に入りから削除") : "お気に入りに追加"}
            >
                <Heart
                    size={iconSize}
                    className={`transition-transform group-hover:scale-110 ${isFavorite ? 'fill-current' : ''
                        }`}
                />
                {showLabel && (
                    <span className="text-sm">
                        {isFavorite ? 'お気に入り' : 'お気に入りに追加'}
                    </span>
                )}
            </button>

            {/* 理由入力モーダル */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-card border border-white/20 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
                        {/* ヘッダー */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Heart size={20} className="text-red-400 fill-current" />
                                <h3 className="font-bold">お気に入りに追加</h3>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* コンテンツ */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                    <MessageSquare size={14} />
                                    お気に入りの理由（任意）
                                </label>
                                <textarea
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    placeholder="なぜお気に入りなのか、思い出やエピソードを書いてみましょう..."
                                    className="w-full h-32 px-4 py-3 bg-background border border-white/20 rounded-lg text-sm resize-none focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* フッター */}
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10 bg-white/5">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Heart size={14} className="fill-current" />
                                お気に入りに追加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// お気に入り理由表示コンポーネント
export function FavoriteReason({ reason }: { reason?: string }) {
    if (!reason) return null;

    return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2">
            <p className="text-sm text-red-400/80 flex items-start gap-2">
                <Heart size={14} className="fill-current flex-shrink-0 mt-0.5" />
                <span className="italic">&ldquo;{reason}&rdquo;</span>
            </p>
        </div>
    );
}
