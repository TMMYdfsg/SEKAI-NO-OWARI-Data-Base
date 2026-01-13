"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut, User as UserIcon, Cloud, CloudOff, Loader2, Upload, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { pushToCloud, pullFromCloud } from "@/lib/sync";

export default function AuthStatus() {
    const auth = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!auth) return null;
    const { user, signInWithGoogle, logout, loading } = auth;

    const handleBackup = async () => {
        if (!user) return;
        setIsSyncing(true);
        setMessage(null);
        try {
            await pushToCloud(user);
            setMessage({ type: 'success', text: 'Data backed up to cloud!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Backup failed. Check network.' });
        } finally {
            setIsSyncing(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleRestore = async () => {
        if (!user) return;
        if (!confirm("This will overwrite your local data with cloud data. Continue?")) return;

        setIsSyncing(true);
        setMessage(null);
        try {
            const res = await pullFromCloud(user);
            if (res?.success) {
                setMessage({ type: 'success', text: 'Data restored! Reloading...' });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: res?.message || 'Restore failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Restore failed. Check network.' });
        } finally {
            setIsSyncing(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-white/5 rounded-xl">
                <Loader2 className="animate-spin" size={20} />
                <span>Loading auth state...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <CloudOff className="text-muted-foreground" size={24} />
                    <div>
                        <h3 className="font-bold">Not Signed In</h3>
                        <p className="text-xs text-muted-foreground">Sign in to sync your data across devices.</p>
                    </div>
                </div>

                <button
                    onClick={() => signInWithGoogle()}
                    className="w-full py-2 px-4 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                    <LogIn size={20} />
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <UserIcon size={120} />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/50">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="text-primary" size={24} />
                    )}
                </div>
                <div>
                    <h3 className="font-bold">{user.displayName || "Guest User"}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{user.email || "Anonymous"}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded relative z-10">
                <Cloud size={14} />
                <span>Cloud Sync Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                    onClick={handleBackup}
                    disabled={isSyncing}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                >
                    <Upload size={20} className="text-blue-400" />
                    <span className="text-xs font-medium">Backup to Cloud</span>
                </button>
                <button
                    onClick={handleRestore}
                    disabled={isSyncing}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                >
                    <Download size={20} className="text-orange-400" />
                    <span className="text-xs font-medium">Restore from Cloud</span>
                </button>
            </div>

            {message && (
                <div className={`p-2 rounded text-xs text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} relative z-10`}>
                    {message.text}
                </div>
            )}

            <button
                onClick={() => logout()}
                className="w-full py-2 px-4 bg-red-500/10 text-red-400 border border-red-500/20 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors relative z-10"
            >
                <LogOut size={18} />
                Sign Out
            </button>
        </div>
    );
}
