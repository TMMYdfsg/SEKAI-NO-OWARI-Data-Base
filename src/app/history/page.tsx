"use client";

import { useState, useRef, useEffect } from "react";
import {
    BookOpen, Mic2, Music, Tv, Radio, Star, Sparkles, Calendar as CalendarIcon,
    ChevronDown, ChevronUp
} from "lucide-react";
import { history, HistoryEvent } from "@/data/history";
import { unlockAchievement } from "@/lib/local-storage-data";
import dynamic from "next/dynamic";
const HistoryMap = dynamic(() => import("@/components/HistoryMap"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-800/50 animate-pulse rounded-xl" />
});
import HistoryStats from "@/components/HistoryStats";

type ViewMode = "Timeline" | "Map" | "Stats";

const eventTypeIcons: Record<string, React.ReactNode> = {
    Live: <Mic2 size={16} />,
    Release: <Music size={16} />,
    Milestone: <Star size={16} />,
    Formation: <Sparkles size={16} />,
    Other: <CalendarIcon size={16} />,
};

const typeColors: Record<string, string> = {
    Live: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
    Release: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    Milestone: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    Formation: "text-pink-400 border-pink-500/20 bg-pink-500/10",
};

export default function HistoryPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("Timeline");
    const [filterType, setFilterType] = useState<string | "All">("All");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    // Get unique years
    const years = Array.from(new Set(history.map(e => parseInt(e.year)))).sort((a, b) => b - a);
    const minYear = years[years.length - 1];
    const maxYear = years[0];

    // Filter events
    const filteredEvents = history.filter(event => {
        if (filterType !== "All" && event.type !== filterType) return false;
        return true;
    });

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const year = parseInt(e.target.value);
        setSelectedYear(year);
        const element = document.getElementById(`year-${year}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30 text-foreground">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 text-center fade-in-up">
                    <h1 className="text-5xl font-bold font-serif mb-4 flex items-center justify-center gap-4 text-primary drop-shadow-lg">
                        <BookOpen size={48} />
                        History
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        The Journey of SEKAI NO OWARI
                    </p>

                    {/* View Switcher */}
                    <div className="inline-flex bg-card/50 backdrop-blur border border-white/10 rounded-xl p-1 mb-8 shadow-lg">
                        {(["Timeline", "Map", "Stats"] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setViewMode(mode);
                                    if (mode === "Map") unlockAchievement(111);
                                    if (mode === "Stats") unlockAchievement(112);
                                }}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === mode
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Type Filter (Timeline & Map only) */}
                    {viewMode !== "Stats" && (
                        <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                            {["All", "Live", "Release", "Milestone", "Formation"].map((type) => {
                                const isSelected = filterType === type;
                                const colorClass = type === "All" ? "text-white border-white/20 bg-white/5" : typeColors[type];

                                return (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isSelected ? "ring-2 ring-offset-2 ring-offset-background opacity-100" : "opacity-60 hover:opacity-90"
                                            } ${colorClass.replace("border-", "border-opacity-50 ")}`} // Adjust border opacity for unselected state
                                    >
                                        {type !== "All" && eventTypeIcons[type]}
                                        <span className="text-sm font-medium">{type}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </header>

                <main className="relative min-h-[500px]">
                    {/* Timeline View */}
                    {viewMode === "Timeline" && (
                        <div className="relative fade-in-up delay-100 pb-20">
                            {/* Center Line */}
                            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

                            <div className="space-y-12">
                                {filteredEvents.map((event, index) => {
                                    const isEven = index % 2 === 0;
                                    const colorStyle = typeColors[event.type] || typeColors["Other"];

                                    return (
                                        <div
                                            key={`${event.year}-${index}`}
                                            id={`year-${event.year}`}
                                            className={`relative flex flex-col md:flex-row items-start md:items-center justify-between group md:gap-8 ${isEven ? "md:flex-row-reverse" : ""
                                                }`}
                                        >
                                            {/* Date Marker (Mobile: Left, Desktop: Center) */}
                                            <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 group-hover:scale-150 group-hover:bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] mt-6 md:mt-0"></div>

                                            {/* Content Card */}
                                            <div className="w-full md:w-[calc(50%-2rem)] pl-12 md:pl-0">
                                                <div className={`p-6 rounded-2xl border bg-card/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-card/60 hover:shadow-xl group-hover:border-primary/30 relative overflow-hidden ${colorStyle.split(" ")[1]}`}>

                                                    {/* Decorative glow */}
                                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-opacity opacity-0 group-hover:opacity-100`} />

                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`text-3xl font-bold font-serif ${colorStyle.split(" ")[0]}`}>
                                                            {event.year}
                                                        </span>
                                                        <div className="h-px flex-1 bg-white/10" />
                                                        <span className={`p-1.5 rounded-lg bg-black/20 ${colorStyle.split(" ")[0]}`}>
                                                            {eventTypeIcons[event.type]}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {event.description}
                                                    </p>

                                                    {event.location && (
                                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-muted-foreground">
                                                            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                                                            {event.location.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Empty Space for alignment */}
                                            <div className="hidden md:block w-[calc(50%-2rem)]" />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Floating Year Slider (Desktop) */}
                            <div className="fixed right-8 top-1/2 transform -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 bg-black/40 backdrop-blur p-4 rounded-full border border-white/10 shadow-2xl z-50">
                                <span className="text-xs font-bold text-muted-foreground">{maxYear}</span>
                                <input
                                    type="range"
                                    min={minYear}
                                    max={maxYear}
                                    value={selectedYear || maxYear}
                                    onChange={handleSliderChange}
                                    className="h-64 w-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-primary [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                                />
                                <span className="text-xs font-bold text-muted-foreground">{minYear}</span>
                            </div>
                        </div>
                    )}

                    {/* Map View */}
                    {viewMode === "Map" && (
                        <div className="fade-in-up flex flex-col items-center">
                            <HistoryMap events={filteredEvents} />

                            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                                {["Live", "Release", "Milestone", "Formation"].map(type => {
                                    const count = history.filter(e => e.type === type).length;
                                    const style = typeColors[type];
                                    return (
                                        <div key={type} className={`p-4 rounded-xl border ${style.split(" ")[1]} ${style.split(" ")[2]} flex flex-col items-center justify-center gap-1`}>
                                            <span className={`text-2xl font-bold ${style.split(" ")[0]}`}>{count}</span>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{type} Events</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stats View */}
                    {viewMode === "Stats" && (
                        <div className="fade-in-up">
                            <HistoryStats events={history} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
