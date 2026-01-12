"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Edit3, Save, Trash2, Star, Calendar, DollarSign, MapPin,
    Tag as TagIcon, ExternalLink
} from "lucide-react";
import type { GoodsItem } from "@/types/gallery";
import GoodsEditor from "@/components/GoodsEditor";

export default function GoodsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const goodsId = params.id as string;

    const [goods, setGoods] = useState<GoodsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // Load goods
    useEffect(() => {
        fetch(`/api/db/goods?id=${goodsId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setGoods(null);
                } else {
                    setGoods(data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load goods:", err);
                setLoading(false);
            });
    }, [goodsId]);

    const handleSave = async () => {
        if (!editData || !editData.name.trim()) {
            alert("名前は必須です");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/db/goods", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: goodsId, ...editData }),
            });

            if (res.ok) {
                const updated = await res.json();
                setGoods(updated);
                setIsEditing(false);
            } else {
                const error = await res.json();
                alert(`保存に失敗しました: ${error.error}`);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("保存中にエラーが発生しました");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("このグッズを削除しますか？")) return;

        try {
            const res = await fetch(`/api/db/goods?id=${goodsId}&soft=true`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/goods");
            } else {
                alert("削除に失敗しました");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("削除中にエラーが発生しました");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="animate-pulse text-primary">読み込み中...</div>
            </div>
        );
    }

    if (!goods) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-muted-foreground mb-4">グッズが見つかりません</h1>
                    <Link href="/goods" className="text-primary hover:underline">
                        グッズ一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/goods"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>グッズ一覧に戻る</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? "保存中..." : "保存"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
                                >
                                    <Edit3 size={16} />
                                    編集
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                        <GoodsEditor
                            initialData={goods}
                            onChange={setEditData}
                        />
                    </div>
                ) : (
                    <>
                        {/* Images */}
                        {goods.imagePaths.length > 0 && (
                            <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {goods.imagePaths.map((path, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-card border border-white/10 rounded-lg overflow-hidden"
                                    >
                                        <img
                                            src={`/api/gallery?file=${encodeURIComponent(path)}`}
                                            alt={`${goods.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Main Info */}
                        <div className="bg-card/50 border border-white/10 rounded-xl p-6 mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs rounded-full mb-2">
                                        {goods.type}
                                    </span>
                                    <h1 className="text-3xl font-bold font-serif">{goods.name}</h1>
                                </div>
                                {goods.isFavorite && (
                                    <Star size={24} className="text-yellow-400 fill-yellow-400" />
                                )}
                            </div>

                            {goods.rating && (
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={star <= goods.rating! ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {goods.acquisitionDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-muted-foreground" />
                                        <span className="text-muted-foreground">取得日:</span>
                                        <span>{goods.acquisitionDate}</span>
                                    </div>
                                )}
                                {goods.price && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign size={16} className="text-muted-foreground" />
                                        <span className="text-muted-foreground">価格:</span>
                                        <span>¥{goods.price.toLocaleString()}</span>
                                    </div>
                                )}
                                {goods.purchaseLocation && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} className="text-muted-foreground" />
                                        <span className="text-muted-foreground">購入場所:</span>
                                        <span>{goods.purchaseLocation}</span>
                                    </div>
                                )}
                                {goods.condition && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">状態:</span>
                                        <span>{goods.condition}</span>
                                    </div>
                                )}
                            </div>

                            {goods.description && (
                                <p className="text-foreground whitespace-pre-wrap mb-4">{goods.description}</p>
                            )}

                            {goods.notes && (
                                <div className="p-4 bg-pink-500/10 border-l-4 border-pink-500 rounded-r-lg">
                                    <span className="text-xs text-pink-400 mb-1 block">個人メモ</span>
                                    <p className="text-foreground whitespace-pre-wrap text-sm">{goods.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {goods.tags.length > 0 && (
                            <div className="bg-card/50 border border-white/10 rounded-xl p-6 mb-6">
                                <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <TagIcon size={14} />
                                    タグ
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {goods.tags.map((tag) => (
                                        <span key={tag} className="text-primary/80 text-sm">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Events */}
                        {goods.relatedEventIds && goods.relatedEventIds.length > 0 && (
                            <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                                <h2 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <ExternalLink size={14} />
                                    関連イベント
                                </h2>
                                <div className="space-y-2">
                                    {goods.relatedEventIds.map((eventId) => (
                                        <Link
                                            key={eventId}
                                            href={`/history/${eventId}`}
                                            className="block px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                                        >
                                            {eventId}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
