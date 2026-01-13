"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
    user: User | null;
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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signInGuest = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error signing in as guest", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
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
