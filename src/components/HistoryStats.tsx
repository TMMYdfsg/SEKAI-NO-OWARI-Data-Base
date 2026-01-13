"use client";

import { useMemo } from "react";
import { HistoryEvent } from "@/data/history";
import { BarChart2, PieChart, TrendingUp, Calendar, Activity } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";

interface HistoryStatsProps {
    events: HistoryEvent[];
}

const COLORS = ["#eab308", "#22d3ee", "#c084fc", "#f472b6", "#94a3b8"];

export default function HistoryStats({ events }: HistoryStatsProps) {

    // Stats Calculations
    const stats = useMemo(() => {
        // Years data for Chart
        const yearsData: Record<string, number> = {};
        events.forEach(e => {
            yearsData[e.year] = (yearsData[e.year] || 0) + 1;
        });

        const yearsChartData = Object.entries(yearsData)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort ascending for chart

        // Type data for Pie Chart
        const typeCounts: Record<string, number> = {
            "Live": 0,
            "Release": 0,
            "Milestone": 0,
            "Formation": 0,
            "Other": 0
        };
        events.forEach(e => {
            const type = e.type || "Other";
            if (typeCounts[type] !== undefined) {
                typeCounts[type]++;
            } else {
                typeCounts["Other"]++;
            }
        });

        const typesChartData = Object.entries(typeCounts)
            .filter(([_, count]) => count > 0)
            .map(([name, value]) => ({ name, value }));

        // Most active year
        let maxYear = "";
        let maxCount = 0;
        Object.entries(yearsData).forEach(([year, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxYear = year;
            }
        });

        return { yearsChartData, typesChartData, maxYear, maxCount };
    }, [events]);

    const totalEvents = events.length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Overview Cards */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{totalEvents}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Events</div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.maxYear}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">Most Active Year</div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.yearsChartData.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">Active Years</div>
                    </div>
                </div>
            </div>

            {/* Activity Chart (Years) */}
            <div className="bg-card/30 border border-white/5 rounded-2xl p-6 min-h-[400px]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <BarChart2 size={20} className="text-primary" />
                    Activity Timeline
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.yearsChartData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="year"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#ffffff20' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-card/30 border border-white/5 rounded-2xl p-6 min-h-[400px]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-cyan-400" />
                    Event Type Distribution
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={stats.typesChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {stats.typesChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {stats.typesChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
