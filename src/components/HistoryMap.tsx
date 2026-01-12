"use client";

import { useMemo, useState } from "react";
import { HistoryEvent } from "@/data/history";
import { MapPin } from "lucide-react";

interface HistoryMapProps {
    events: HistoryEvent[];
}

// 簡易的な日本のSVGパス（デフォルメ）
// 座標変換ロジックが必要。
// Lat: ~30 (South) to ~46 (North)
// Lng: ~128 (West) to ~146 (East)
// Canvas size: 800x800

export default function HistoryMap({ events }: HistoryMapProps) {
    const [hoveredEvent, setHoveredEvent] = useState<HistoryEvent | null>(null);

    // Filter events with location
    const mapEvents = useMemo(() => events.filter(e => e.location), [events]);

    // Simple projection function (Mercator-ish adjustment for Japan)
    const project = (lat: number, lng: number) => {
        // Broad bounds for Japan mainly
        const minLat = 30;
        const maxLat = 46;
        const minLng = 128;
        const maxLng = 146;

        const width = 800;
        const height = 800;

        const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
        const x = ((lng - minLng) / (maxLng - minLng)) * width;

        return { x, y };
    };

    return (
        <div className="w-full aspect-square max-w-2xl mx-auto relative bg-card/30 rounded-2xl border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none" />

            <svg viewBox="0 0 800 800" className="w-full h-full">
                {/* 簡易日本地図シルエット (SVG Path) - 実際はもっと詳細なデータを使うか、imageで代用も可だが、ここではSVGパスで描くアート的な表現 */}
                <g className="opacity-30 stroke-white/20 fill-white/5">
                    {/* Kyushu */}
                    <path d="M150,600 Q180,580 200,600 T250,620 T200,680 T130,650 Z" />
                    {/* Shikoku */}
                    <path d="M260,600 Q300,580 340,590 T320,630 T270,620 Z" />
                    {/* Honshu (Main) */}
                    <path d="M220,580 Q250,550 300,550 Q400,500 450,450 Q500,400 550,300 Q580,250 560,200 Q550,250 500,300 Q450,350 350,500 Q300,550 250,580 Z" strokeWidth="2" />
                    {/* Hokkaido */}
                    <path d="M550,150 Q600,120 650,150 T620,220 T550,200 Z" />

                    {/* Abstract Japan Shape - using loose coordinates for visual style rather than strict geo */}
                    {/* Note: In a real production app we'd use GeoJSON. For this purpose, we create a stylized backdrop */}
                    <path d="
                        M 600 100 
                        L 680 150 L 650 220 L 580 200 Z 
                        M 550 220 
                        L 450 400 L 350 500 L 250 580 L 180 560 
                        M 260 600 L 350 590 L 330 630 L 270 630 Z
                        M 140 600 L 220 590 L 230 650 L 150 680 Z
                        " fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5"
                    />
                </g>

                {/* Plot Events */}
                {mapEvents.map((event, index) => {
                    const pos = project(event.location!.lat, event.location!.lng);
                    // Adjust if out of bounds (fallback)
                    if (pos.x < 0 || pos.x > 800 || pos.y < 0 || pos.y > 800) return null;

                    const isHovered = hoveredEvent === event;

                    return (
                        <g
                            key={index}
                            transform={`translate(${pos.x}, ${pos.y})`}
                            onMouseEnter={() => setHoveredEvent(event)}
                            onMouseLeave={() => setHoveredEvent(null)}
                            className="cursor-pointer transition-all duration-300"
                            style={{ opacity: hoveredEvent && !isHovered ? 0.3 : 1 }}
                        >
                            <circle
                                r={isHovered ? 12 : 6}
                                fill={event.type === "Live" ? "#eab308" : event.type === "Formation" ? "#ec4899" : "#3b82f6"}
                                className="transition-all duration-300"
                            />
                            <circle r={isHovered ? 20 : 10} fill="none" stroke={event.type === "Live" ? "#eab308" : event.type === "Formation" ? "#ec4899" : "#3b82f6"} strokeWidth="1" className={isHovered ? "animate-ping" : ""} opacity="0.5" />
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredEvent && (
                <div
                    className="absolute z-10 p-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
                    style={{
                        left: project(hoveredEvent.location!.lat, hoveredEvent.location!.lng).x,
                        top: project(hoveredEvent.location!.lat, hoveredEvent.location!.lng).y
                    }}
                >
                    <div className="text-xs font-mono text-primary mb-1">{hoveredEvent.year}</div>
                    <div className="font-bold text-sm mb-1">{hoveredEvent.location?.name}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{hoveredEvent.title}</div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 font-mono">
                Stylized Map View
            </div>
        </div>
    );
}
