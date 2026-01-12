"use client";

import { useMemo } from "react";
import { HistoryEvent } from "@/data/history";
import { BarChart2, PieChart, TrendingUp } from "lucide-react";

interface HistoryStatsProps {
    events: HistoryEvent[];
}

export default function HistoryStats({ events }: HistoryStatsProps) {

    // Stats Calculations
    const stats = useMemo(() => {
        // Years distribution
        const years: Record<string, number> = {};
        events.forEach(e => {
            years[e.year] = (years[e.year] || 0) + 1;
        });

        // Type distribution
        const types: Record<string, number> = {
            "Live": 0,
            "Release": 0,
            "Milestone": 0,
            "Formation": 0
        };
        events.forEach(e => {
            if (types[e.type] !== undefined) {
                types[e.type]++;
            }
        });

        // Most active year
        let maxYear = "";
        let maxCount = 0;
        Object.entries(years).forEach(([year, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxYear = year;
            }
        });

        return { years, types, maxYear, maxCount };
    }, [events]);

    const sortedYears = Object.keys(stats.years).sort().reverse();
    const totalEvents = events.length;

    // Helper for bar height percentage
    const getBarHeight = (count: number) => {
        return Math.max(10, (count / stats.maxCount) * 100);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Overview Card */}
            <div className="col-span-full bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-wrap justify-around items-center gap-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">{totalEvents}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Events</div>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">{stats.maxYear}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Most Active Year</div>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-1">{stats.types["Live"]}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Live Shows</div>
                </div>
            </div>

            {/* Activity Chart (Years) */}
            <div className="bg-card/30 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <BarChart2 size={20} className="text-primary" />
                    Activity by Year
                </h3>

                <div className="flex items-end justify-between h-48 gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {sortedYears.map((year) => (
                        <div key={year} className="flex flex-col items-center gap-2 group min-w-[30px] flex-1">
                            <div className="w-full relative flex items-end justify-center h-full">
                                <div
                                    className="w-full max-w-[20px] bg-white/10 rounded-t-sm hover:bg-primary transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                    style={{ height: `${getBarHeight(stats.years[year])}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black py-1 px-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        {stats.years[year]}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground -rotate-45 origin-top-left translate-y-2">{year}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-card/30 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-purple-400" />
                    Event Types
                </h3>

                <div className="space-y-4">
                    {Object.entries(stats.types).map(([type, count]) => {
                        const loadingWidth = (count / totalEvents) * 100;
                        let colorClass = "bg-gray-500";
                        if (type === "Live") colorClass = "bg-yellow-500";
                        if (type === "Release") colorClass = "bg-blue-500";
                        if (type === "Milestone") colorClass = "bg-purple-500";
                        if (type === "Formation") colorClass = "bg-pink-500";

                        return (
                            <div key={type} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{type}</span>
                                    <span className="text-muted-foreground">{count} ({Math.round(loadingWidth)}%)</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${loadingWidth}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
