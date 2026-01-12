"use client";

import { Star, Calendar, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { GoodsItem } from "@/types/gallery";

interface GoodsCardProps {
    goods: GoodsItem;
    onClick?: () => void;
}

const goodsTypeColors: Record<string, string> = {
    'CD': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'DVD': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Blu-ray': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Book': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Clothing': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Accessory': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Poster': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Ticket': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Other': 'bg-white/20 text-white border-white/10',
};

export default function GoodsCard({ goods, onClick }: GoodsCardProps) {
    const typeColor = goodsTypeColors[goods.type] || goodsTypeColors['Other'];
    const primaryImage = goods.imagePaths[0];

    return (
        <div
            className="bg-card border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group shadow-lg hover:shadow-primary/10 relative cursor-pointer"
            onClick={onClick}
        >
            {/* Favorite Badge */}
            {goods.isFavorite && (
                <div className="absolute top-3 left-3 z-10 p-1.5 bg-yellow-500/90 rounded-full">
                    <Star size={14} className="text-white fill-white" />
                </div>
            )}

            {/* Detail Link */}
            <Link
                href={`/goods/${goods.id}`}
                className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/70"
                onClick={(e) => e.stopPropagation()}
            >
                <ExternalLink size={14} className="text-white" />
            </Link>

            {/* Image */}
            <div className="relative aspect-square bg-muted">
                {primaryImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(/api/gallery?file=${encodeURIComponent(primaryImage)})` }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Tag size={48} className="text-white/20" />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold text-white truncate">{goods.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                        <span className={`px-2 py-0.5 rounded-full border ${typeColor}`}>
                            {goods.type}
                        </span>
                        {goods.acquisitionDate && (
                            <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {goods.acquisitionDate}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-card/95 backdrop-blur-sm">
                {goods.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {goods.description}
                    </p>
                )}
                {goods.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {goods.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-primary/80">
                                #{tag}
                            </span>
                        ))}
                        {goods.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{goods.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
