"use client";

import { useState, useEffect } from "react";
import {
    Shield, Database, Activity, AlertTriangle, CheckCircle,
    FileText, User, Music, MapPin, Package, RefreshCw, Trash2, Download
} from "lucide-react";
import { songs } from "@/data/songs";
import { history } from "@/data/history";
import { goods } from "@/data/goods";
import { exportData } from "@/lib/backup";
import { achievements } from "@/data/achievements-list";
import {
    getErrorLogs, clearErrorLogs, ErrorLogEntry,
    getHistoryEdits, getProfileEdits,
    getAuditLogs, AuditLogEntry
} from "@/lib/local-storage-data";

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "health" | "logs" | "audit">("overview");
    const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [healthStatus, setHealthStatus] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        setLogs(getErrorLogs());
        setAuditLogs(getAuditLogs());
        runHealthCheck();
    }, []);

    const runHealthCheck = () => {
        const issues = [];
        // Basic Integrity Checks

        // 1. Check for duplicate Song IDs
        const songIds = songs.map(s => s.id);
        const uniqueSongIds = new Set(songIds);
        if (songIds.length !== uniqueSongIds.size) {
            issues.push({ type: 'warning', message: `Found ${songIds.length - uniqueSongIds.size} duplicate Song IDs` });
        }

        // 2. Check for duplicate History Entries (Year + Title)
        const historyKeys = history.map(h => `${h.year}-${h.title}`);
        const uniqueHistoryKeys = new Set(historyKeys);
        if (historyKeys.length !== uniqueHistoryKeys.size) {
            issues.push({ type: 'warning', message: `Found ${historyKeys.length - uniqueHistoryKeys.size} duplicate History Entries` });
        }

        // 3. Local Storage Size Estimate (Rough)
        let totalSize = 0;
        if (typeof window !== 'undefined') {
            for (let x in localStorage) {
                if (localStorage.hasOwnProperty(x)) {
                    totalSize += ((localStorage[x].length * 2) / 1024 / 1024);
                }
            }
        }
        if (totalSize > 4.5) {
            issues.push({ type: 'critical', message: `Local Storage is nearly full (${totalSize.toFixed(2)} MB)` });
        }

        if (issues.length === 0) {
            setHealthStatus([{ type: 'success', message: 'System Integrity Verified: No issues found.' }]);
        } else {
            setHealthStatus(issues);
        }
    };

    const handleClearLogs = () => {
        if (confirm("Are you sure you want to clear all error logs?")) {
            clearErrorLogs();
            setLogs([]);
        }
    };

    if (!mounted) return null;

    const stats = [
        { label: "Songs", value: songs.length, icon: Music, color: "text-blue-400" },
        { label: "History Events", value: history.length, icon: MapPin, color: "text-green-400" },
        { label: "Goods", value: goods.length, icon: Package, color: "text-purple-400" },
        { label: "Achievements", value: achievements.length, icon: Shield, color: "text-yellow-400" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 p-6 sticky top-0 z-10 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Shield className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-serif">System Admin Console</h1>
                            <p className="text-xs text-muted-foreground">Database Management & System Health</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { runHealthCheck(); setLogs(getErrorLogs()); setAuditLogs(getAuditLogs()); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-card border border-white/5 p-4 rounded-xl flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 overflow-x-auto">
                    {["overview", "health", "audit", "logs"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === "logs" && logs.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full">
                                    {logs.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-card border border-white/5 rounded-xl p-6 min-h-[400px]">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Activity size={20} className="text-primary" />
                                Recent Activity & Stats
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase">User Edits (Local Storage)</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>History Edits</span>
                                            <span className="font-mono">{Object.keys(getHistoryEdits()).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Profile Edits</span>
                                            <span className="font-mono">{Object.keys(getProfileEdits()).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Audit Logs</span>
                                            <span className="font-mono">{auditLogs.length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase">Database Info</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Songs</span>
                                            <span className="font-mono">{songs.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Goods</span>
                                            <span className="font-mono">{goods.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Backup Card */}
                                <div className="bg-white/5 rounded-lg p-4 col-span-1 md:col-span-2 flex items-center justify-between border border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Full System Backup</h3>
                                            <p className="text-xs text-muted-foreground">Export all application data to JSON</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => exportData()}
                                        className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <Download size={16} />
                                        Download Backup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "health" && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Shield size={20} className="text-green-400" />
                                Health Check Results
                            </h2>
                            <div className="space-y-2">
                                {healthStatus.map((status, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-lg border flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                            status.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            }`}
                                    >
                                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                        <span className="text-sm font-medium">{status.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "audit" && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FileText size={20} className="text-purple-400" />
                                Audit Logs (Last 100 Actions)
                            </h2>
                            {auditLogs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No audit logs found.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {auditLogs.map((log, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded border border-white/5 text-xs font-mono">
                                            <div className="flex justify-between text-muted-foreground mb-1">
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                <span className="text-primary font-bold">{log.action}</span>
                                            </div>
                                            <div className="text-white">
                                                {log.details}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-red-400" />
                                    Error Logs
                                </h2>
                                {logs.length > 0 && (
                                    <button
                                        onClick={handleClearLogs}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs transition-colors"
                                    >
                                        <Trash2 size={14} /> Clear Logs
                                    </button>
                                )}
                            </div>

                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="inline-block p-4 bg-white/5 rounded-full mb-3">
                                        <CheckCircle size={24} className="text-green-500/50" />
                                    </div>
                                    <p>No error logs found. System is running smoothly.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {logs.map((log, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded border border-white/5 text-xs font-mono">
                                            <div className="flex justify-between text-muted-foreground mb-1">
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                <span className="text-red-400 font-bold">{log.code}</span>
                                            </div>
                                            <div className="text-white break-all">
                                                {log.path && <span className="text-blue-400 mr-2">[{log.path}]</span>}
                                                {log.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
