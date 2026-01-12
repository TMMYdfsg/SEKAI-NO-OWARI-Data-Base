"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeColor, getThemeColor, setThemeColor as saveThemeColor } from "@/lib/local-storage-data";

interface ThemeContextType {
    theme: ThemeColor;
    setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeColor>("default");

    useEffect(() => {
        const saved = getThemeColor();
        setThemeState(saved);
        applyTheme(saved);
    }, []);

    const setTheme = (newTheme: ThemeColor) => {
        setThemeState(newTheme);
        saveThemeColor(newTheme);
        applyTheme(newTheme);
    };

    const applyTheme = (t: ThemeColor) => {
        const root = document.documentElement;

        // Reset to defaults first
        // Assuming global.css defines defaults in :root

        switch (t) {
            case "fukase": // Red/Crimson
                root.style.setProperty("--primary", "346 84% 61%"); // #F43F5E
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "nakajin": // Blue/Teal
                root.style.setProperty("--primary", "200 95% 45%"); // #0686C5 (Nakajin-ish blue)
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "saori": // Yellow/Amber
                root.style.setProperty("--primary", "45 93% 47%"); // #EAB308
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "djlove": // Pink/Purple (Clown)
                root.style.setProperty("--primary", "300 70% 60%"); // #D946EF
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            // Album Themes
            case "twilight": // Purple/Pink gradient
                root.style.setProperty("--primary", "280 70% 60%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "270 50% 5%");
                root.style.setProperty("--card", "270 40% 10%");
                root.style.setProperty("--secondary", "320 50% 25%");
                document.body.setAttribute("data-theme", "twilight");
                break;
            case "dragonNight": // Blue/Gold
                root.style.setProperty("--primary", "45 90% 55%");
                root.style.setProperty("--primary-foreground", "220 60% 10%");
                root.style.setProperty("--background", "220 60% 5%");
                root.style.setProperty("--card", "220 50% 10%");
                root.style.setProperty("--secondary", "220 50% 20%");
                document.body.setAttribute("data-theme", "dragonNight");
                break;
            case "tree": // Green/Brown
                root.style.setProperty("--primary", "140 60% 45%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "150 30% 5%");
                root.style.setProperty("--card", "140 25% 10%");
                root.style.setProperty("--secondary", "30 40% 20%");
                document.body.setAttribute("data-theme", "tree");
                break;
            case "nautilus": // Deep Blue/Cyan
                root.style.setProperty("--primary", "200 80% 50%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "210 60% 4%");
                root.style.setProperty("--card", "210 50% 8%");
                root.style.setProperty("--secondary", "210 50% 15%");
                document.body.setAttribute("data-theme", "nautilus");
                break;
            default: // Default Purple
                root.style.removeProperty("--primary");
                root.style.removeProperty("--primary-foreground");
                root.style.removeProperty("--background");
                root.style.removeProperty("--card");
                root.style.removeProperty("--secondary");
                document.body.removeAttribute("data-theme");
                break;
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    };
    return context;
}
