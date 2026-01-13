"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
    getThemeColor, setThemeColor as saveThemeId, // Renamed for clarity in context
    getAnimationSettings, saveAnimationSettings, AnimationSettings
} from "@/lib/local-storage-data";
import { ThemeDefinition, getThemeById, AnimationRecipeId } from "@/lib/theme-definitions";
import LaunchAnimation from "@/components/LaunchAnimation";

interface ThemeContextType {
    themeId: string;
    currentTheme: ThemeDefinition | undefined;
    setTheme: (themeId: string) => void;
    animationSettings: AnimationSettings;
    setAnimationSettings: (settings: AnimationSettings) => void;
    triggerAnimation: () => void;
    isAnimating: boolean;
    customColors: CustomThemeColors;
    setCustomColors: (colors: CustomThemeColors) => void;
}

export interface CustomThemeColors {
    primary: string; // Hex
    background: string; // Hex
    secondary: string; // Hex
}

// Helper: Hex to HSL string (e.g. "0 0% 100%")
function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;

    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeIdState] = useState<string>("default");
    const [currentTheme, setCurrentTheme] = useState<ThemeDefinition | undefined>(undefined);
    const [animationSettings, setAnimationSettingsState] = useState<AnimationSettings>({
        enabled: true, intensity: "normal", duration: "normal"
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const [mountAnimationPlayed, setMountAnimationPlayed] = useState(false);

    // Custom Colors State
    const [customColors, setCustomColorsState] = useState<CustomThemeColors>({
        primary: "#d4af37", // Gold default
        background: "#0a0a0a",
        secondary: "#2a2a2a"
    });

    // Initial Load
    useEffect(() => {
        const savedId = getThemeColor();
        const savedSettings = getAnimationSettings();

        // Load custom colors
        const savedCustomColors = localStorage.getItem("sekaowa_custom_theme_colors");
        if (savedCustomColors) {
            try {
                setCustomColorsState(JSON.parse(savedCustomColors));
            } catch (e) { console.error(e); }
        }

        setThemeIdState(savedId);
        setAnimationSettingsState(savedSettings);

        const themeDef = getThemeById(savedId);
        if (savedId === 'custom') {
            // Apply custom immediately if selected
            // We need to wait for state, but in useEffect we can use the loaded value directly or re-apply in a separate effect
            // For now, let's rely on the separate effect or apply here if we had the value.
            // Since customColors is state, we'll use a separate effect to apply it when it changes.
        } else if (themeDef) {
            setCurrentTheme(themeDef);
            applyThemePalette(themeDef.paletteKey);
        } else {
            // Fallback for unknown IDs or old data
            applyThemePalette(savedId);
        }

        // Trigger mount animation if enabled
        if (savedSettings.enabled) {
            setIsAnimating(true);
        }
        setMountAnimationPlayed(true);
    }, []);

    // Effect to apply custom colors when they change OR when theme is set to custom
    useEffect(() => {
        if (themeId === 'custom') {
            applyThemePalette('custom');
        }
    }, [themeId, customColors]);

    const setTheme = useCallback((newId: string) => {
        setThemeIdState(newId);
        saveThemeId(newId);

        if (newId === 'custom') {
            setCurrentTheme({
                id: 'custom',
                displayName: 'Custom Theme',
                category: 'Motif',
                year: null,
                yearFormat: 'none',
                paletteKey: 'custom',
                motif: 'palette',
                animationRecipeId: 'default',
                tags: ['custom']
            });
            applyThemePalette('custom');
        } else {
            const themeDef = getThemeById(newId);
            setCurrentTheme(themeDef);

            if (themeDef) {
                applyThemePalette(themeDef.paletteKey);
            } else {
                applyThemePalette(newId); // Fallback
            }
        }

        // Trigger animation on theme change if enabled
        if (animationSettings.enabled) {
            setIsAnimating(true);
        }
    }, [animationSettings.enabled]);

    const setCustomColors = useCallback((colors: CustomThemeColors) => {
        setCustomColorsState(colors);
        localStorage.setItem("sekaowa_custom_theme_colors", JSON.stringify(colors));
    }, []);

    const setAnimationSettings = useCallback((settings: AnimationSettings) => {
        setAnimationSettingsState(settings);
        saveAnimationSettings(settings);
    }, []);

    const triggerAnimation = useCallback(() => {
        setIsAnimating(true);
    }, []);

    const applyThemePalette = (paletteKey: string) => {
        const root = document.documentElement;

        // Reset
        document.body.removeAttribute("data-theme");

        if (paletteKey === 'custom') {
            const p = hexToHsl(customColors.primary);
            const b = hexToHsl(customColors.background);
            const s = hexToHsl(customColors.secondary);

            root.style.setProperty("--primary", p);
            root.style.setProperty("--background", b);
            root.style.setProperty("--secondary", s);
            root.style.setProperty("--primary-foreground", "0 0% 100%"); // Assume white text for primary
            // Card usually derived from background or secondary
            root.style.setProperty("--card", s);

            document.body.setAttribute("data-theme", "custom");
            return;
        }

        switch (paletteKey) {
            case "fukase": // Red/Crimson
                root.style.setProperty("--primary", "346 84% 61%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "nakajin": // Blue/Teal
                root.style.setProperty("--primary", "200 95% 45%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "saori": // Yellow/Amber
                root.style.setProperty("--primary", "45 93% 47%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            case "djlove": // Pink/Purple
                root.style.setProperty("--primary", "300 70% 60%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "240 10% 4%");
                break;
            // Album & Special Themes
            case "twilight":
                root.style.setProperty("--primary", "280 70% 60%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "270 50% 5%");
                root.style.setProperty("--card", "270 40% 10%");
                root.style.setProperty("--secondary", "320 50% 25%");
                document.body.setAttribute("data-theme", "twilight");
                break;
            case "dragonNight":
                root.style.setProperty("--primary", "45 90% 55%");
                root.style.setProperty("--primary-foreground", "220 60% 10%");
                root.style.setProperty("--background", "220 60% 5%");
                root.style.setProperty("--card", "220 50% 10%");
                root.style.setProperty("--secondary", "220 50% 20%");
                document.body.setAttribute("data-theme", "dragonNight");
                break;
            case "tree":
                root.style.setProperty("--primary", "140 60% 45%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "150 30% 5%");
                root.style.setProperty("--card", "140 25% 10%");
                root.style.setProperty("--secondary", "30 40% 20%");
                document.body.setAttribute("data-theme", "tree");
                break;
            case "nautilus":
                root.style.setProperty("--primary", "200 80% 50%");
                root.style.setProperty("--primary-foreground", "0 0% 100%");
                root.style.setProperty("--background", "210 60% 4%");
                root.style.setProperty("--card", "210 50% 8%");
                root.style.setProperty("--secondary", "210 50% 15%");
                document.body.setAttribute("data-theme", "nautilus");
                break;
            default: // Default Purple / Standard
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
        <ThemeContext.Provider value={{
            themeId,
            currentTheme,
            setTheme,
            animationSettings,
            setAnimationSettings,
            triggerAnimation,
            isAnimating,
            customColors,
            setCustomColors
        }}>
            {children}

            {/* Launch Animation Layer */}
            {mountAnimationPlayed && isAnimating && (
                <LaunchAnimation
                    recipeId={currentTheme?.animationRecipeId || "default"}
                    onComplete={() => setIsAnimating(false)}
                    intensity={animationSettings.intensity}
                    durationMode={animationSettings.duration}
                    customText={animationSettings.customText}
                    customDuration={animationSettings.customDuration}
                />
            )}
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
