"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, AppUser } from "@/lib/auth-service";

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInGuest: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 初期化時にセッション復元
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Session restore failed", error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const signInWithGoogle = async () => {
        // 現在はローカル版のため、疑似的にゲストログインを使用するか、実装予定としてアラートを出す
        console.warn("Google Sign-In is not supported in local mode. Falling back to guest login.");
        await signInGuest();
    };

    const signInGuest = async () => {
        try {
            setLoading(true);
            const newUser = await authService.loginAsGuest();
            setUser(newUser);
        } catch (error) {
            console.error("Error signing in as guest", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signInGuest,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
