"use client";

import { useEffect, useRef, useState } from "react";
import type { Discography } from "@/types/discography";
import { Chevronright, Calendar, Disc } from "lucide-react";
import Link from "next/link";

interface VisualTimelineProps {
    albums: Discography[];
}

export default function VisualTimeline({ albums }: VisualTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<Discography | null>(null);

    // Sort albums by release date (oldest first)
    const sortedAlbums = [...albums].sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

    // Group by year
    const albumsByYear: { year: string; albums: Discography[] }[] = [];
    sortedAlbums.forEach(album => {
        const year = new Date(album.releaseDate).getFullYear().toString();
        const lastGroup = albumsByYear[albumsByYear.length - 1];
        if (lastGroup && lastGroup.year === year) {
            lastGroup.albums.push(album);
        } else {
            albumsByYear.push({ year, albums: [album] });
        }
    });

    const handleWheel = (e: React.WheelEvent) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="relative w-full h-[70vh] bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

            <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl font-bold font-serif text-white/90">Visual Timeline</h2>
                    <p className="text-sm text-muted-foreground">SEKAI NO OWARI History</p>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>SCROLL OR DRAG</span>
                    <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-primary animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar flex items-center px-10"
                onWheel={handleWheel}
            >
                {/* Center Line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-[3000px] z-0"></div>

                <div className="flex gap-20 py-20 z-10 pl-20 pr-40 relative">
                    {albumsByYear.map((group, groupIdx) => (
                        <div key={group.year} className="flex relative">
                            {/* Year Marker */}
                            <div className="absolute -top-16 left-0 text-6xl font-black text-white/5 select-none pointer-events-none z-0 font-serif">
                                {group.year}
                            </div>

                            <div className="flex gap-16 relative z-10">
                                {group.albums.map((album, idx) => {
                                    // Alternating up/down pattern
                                    const isUp = (groupIdx + idx) % 2 === 0;

                                    return (
                                        <div
                                            key={album.id}
                                            className={`relative flex flex-col items-center group w-64 transition-all duration-500 hover:z-50 ${isUp ? '-mt-32' : 'mt-32'}`}
                                            onClick={() => setSelectedAlbum(album)}
                                        >
                                            {/* Connection Line */}
                                            <div className={`absolute left-1/2 w-px bg-white/20 group-hover:bg-primary/50 transition-colors h-24 ${isUp ? 'top-full' : 'bottom-full'}`}></div>

                                            {/* Date Dot */}
                                            <div className={`absolute left-1/2 w-3 h-3 rounded-full border-2 border-background transform -translate-x-1/2 ${isUp ? 'top-[calc(100%+6rem-6px)] bg-primary' : 'bottom-[calc(100%+6rem-6px)] bg-primary'
                                                }`}></div>

                                            {/* Card Content */}
                                            <div className="bg-card/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl transform transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/50 w-full cursor-pointer">
                                                <div className="aspect-square relative overflow-hidden">
                                                    {album.coverImage ? (
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                            style={{ backgroundImage: `url(${album.coverImage})` }}
                                                        ></div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                                            <Disc className="text-white/10 w-20 h-20" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                                                            View Details
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 relative">
                                                    <div className="text-xs text-primary font-mono mb-1">{album.releaseDate}</div>
                                                    <h3 className="text-base font-bold text-white line-clamp-1 mb-1">{album.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${album.type === 'Single'
                                                                ? 'border-blue-500/30 text-blue-300 bg-blue-500/10'
                                                                : 'border-purple-500/30 text-purple-300 bg-purple-500/10'
                                                            }`}>
                                                            {album.type}
                                                        </span>
                                                        {album.tracks && (
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                <Disc size={10} /> {album.tracks} Songs
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Album Details Overlay */}
            {selectedAlbum && (
                <div
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl transition-all duration-300 flex items-center justify-center p-8"
                    onClick={() => setSelectedAlbum(null)}
                >
                    <div className="max-w-4xl w-full bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex max-h-[80vh]" onClick={e => e.stopPropagation()}>
                        <div className="w-1/2 relative bg-black">
                            {selectedAlbum.coverImage ? (
                                <div
                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${selectedAlbum.coverImage})` }}
                                ></div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Disc className="text-white/20 w-32 h-32" />
                                </div>
                            )}
                        </div>
                        <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-sm text-primary mb-1 font-mono">{selectedAlbum.releaseDate}</div>
                                    <h2 className="text-3xl font-bold font-serif mb-2">{selectedAlbum.title}</h2>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">{selectedAlbum.type}</span>
                                        {selectedAlbum.tags?.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAlbum(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <XIcon />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b border-white/10 pb-2">Tracklist</h3>
                                <div className="space-y-1">
                                    {selectedAlbum.discs?.[0]?.tracks?.map((track, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer">
                                            <span className="text-xs text-muted-foreground w-6 font-mono group-hover:text-primary">{i + 1}</span>
                                            <span className="text-sm text-white/90">{track.title}</span>
                                        </div>
                                    )) || (
                                            <div className="text-sm text-muted-foreground italic">No tracklist available</div>
                                        )}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link
                                    href={`/songs?search=${encodeURIComponent(selectedAlbum.title)}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors w-full justify-center font-medium"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Play Album
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 18 18" />
        </svg>
    )
}
