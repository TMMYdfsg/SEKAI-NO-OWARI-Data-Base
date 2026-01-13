"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AppUser {
    id: string;
    name: string;
    email?: string;
    isAnonymous: boolean;
    avatarUrl?: string;
    createdAt: string;
    password?: string;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInGuest: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = 'app_session_user_id';

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (typeof window === 'undefined') return;

            const userId = localStorage.getItem(SESSION_KEY);
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/auth?userId=${userId}`);
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (error) {
                console.error("Session restore failed", error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const signInWithGoogle = async () => {
        console.warn("Google Sign-In is not supported in local mode. Falling back to guest login.");
        await signInGuest();
    };

    const signInGuest = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth', { method: 'POST' });
            const data = await response.json();

            if (data.user) {
                setUser(data.user);
                localStorage.setItem(SESSION_KEY, data.user.id);
            }
        } catch (error) {
            console.error("Error signing in as guest", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem(SESSION_KEY);
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
            {children}
        </AuthContext.Provider>
    );
}
