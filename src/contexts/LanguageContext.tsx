"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ja, Dictionary } from '@/locales/ja';
import { en } from '@/locales/en';

type Language = 'ja' | 'en';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isReady: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const dictionaries: Record<Language, Dictionary> = {
    ja,
    en,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Always start with 'ja' to match server-side render
    const [language, setLanguageState] = useState<Language>('ja');
    const [isReady, setIsReady] = useState(false);

    // Load saved language preference on client side only
    useEffect(() => {
        const savedLang = localStorage.getItem('sekaowa_language') as Language;
        if (savedLang && dictionaries[savedLang]) {
            setLanguageState(savedLang);
        }
        setIsReady(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('sekaowa_language', lang);
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dictionaries[language];

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                // Silent fallback - don't warn during SSR/hydration
                return path;
            }
        }

        return typeof current === 'string' ? current : path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
