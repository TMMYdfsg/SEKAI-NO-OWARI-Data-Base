import { getAchievement } from "@/data/achievements-list";

// Local Storage Data Management for User Edits

const STORAGE_KEYS = {
    historyEdits: "sekaowa_history_edits",
    profileEdits: "sekaowa_profile_edits",
    discographyEdits: "sekaowa_discography_edits",
    gallerySecret: "sekaowa_gallery_secret",
    themeColor: "sekaowa_theme_color",
    badges: "sekaowa_badges",
    achievements: "sekaowa_achievements",
    unlockedCommands: "sekaowa_unlocked_commands",
    favorites: "sekaowa_favorites",
    errorHidden: "sekaowa_error_hidden_unlocked",
    errorLogs: "sekaowa_error_logs",
    errorTracklist: "sekaowa_error_tracklist_unlocked",
} as const;

// Favorites
export function getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.favorites);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function toggleFavorite(id: string): boolean {
    if (typeof window === 'undefined') return false;
    const current = getFavorites();
    let isFav = false;

    if (current.includes(id)) {
        // Remove
        const newVal = current.filter(x => x !== id);
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(newVal));
        isFav = false;
    } else {
        // Add
        current.push(id);
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(current));
        isFav = true;
    }
    return isFav;
}

export function isFavorite(id: string): boolean {
    const current = getFavorites();
    return current.includes(id);
}

// History Edits
export interface HistoryEdit {
    eventDetails?: string;
    setlist?: string[];
    venues?: string[];
    notes?: string;
    bgm?: {
        path: string;
        name: string;
    };
    backgroundImage?: string;
    customEvents?: {
        date: string;
        title: string;
        description: string;
    }[];
}

export function getHistoryEdits(): Record<string, HistoryEdit> {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEYS.historyEdits);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse history edits:", e);
            return {};
        }
    }
    return {};
}

export function saveHistoryEdits(edits: Record<string, HistoryEdit>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.historyEdits, JSON.stringify(edits));
}

export function updateHistoryEvent(eventKey: string, edit: Partial<HistoryEdit>): void {
    const current = getHistoryEdits();
    current[eventKey] = { ...current[eventKey], ...edit };
    saveHistoryEdits(current);
}

// Profile Edits
export interface ProfileEdit {
    customBio?: string;
    customNotes?: string;
    customImage?: string;
}

export function getProfileEdits(): Record<string, ProfileEdit> {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEYS.profileEdits);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse profile edits:", e);
            return {};
        }
    }
    return {};
}

export function saveProfileEdits(edits: Record<string, ProfileEdit>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.profileEdits, JSON.stringify(edits));
}

export function updateProfile(memberId: string, edit: Partial<ProfileEdit>): void {
    const current = getProfileEdits();
    current[memberId] = { ...current[memberId], ...edit };
    saveProfileEdits(current);
}

// Discography Edits
export interface DiscographyEdit {
    customNotes?: string;
    customTracks?: string[];
    rating?: number;
}

export function getDiscographyEdits(): Record<string, DiscographyEdit> {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEYS.discographyEdits);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse discography edits:", e);
            return {};
        }
    }
    return {};
}

export function saveDiscographyEdits(edits: Record<string, DiscographyEdit>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.discographyEdits, JSON.stringify(edits));
}

export function updateDiscography(albumId: string, edit: Partial<DiscographyEdit>): void {
    const current = getDiscographyEdits();
    current[albumId] = { ...current[albumId], ...edit };
    saveDiscographyEdits(current);
}

// Gallery Secret Access
export function hasGallerySecretAccess(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.gallerySecret) === "true";
}

export function setGallerySecretAccess(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    if (enabled) {
        localStorage.setItem(STORAGE_KEYS.gallerySecret, "true");
    } else {
        localStorage.removeItem(STORAGE_KEYS.gallerySecret);
    }
}

export function grantGallerySecretAccess(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.gallerySecret, "true");
}

export function revokeGallerySecretAccess(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.gallerySecret);
}

// Theme Color
export type ThemeColor = "fukase" | "nakajin" | "saori" | "djlove" | "default" | "twilight" | "dragonNight" | "tree" | "nautilus";

const validThemes: ThemeColor[] = ["fukase", "nakajin", "saori", "djlove", "default", "twilight", "dragonNight", "tree", "nautilus"];

export function getThemeColor(): ThemeColor {
    if (typeof window === 'undefined') return "default";
    const saved = localStorage.getItem(STORAGE_KEYS.themeColor);
    if (saved && validThemes.includes(saved as ThemeColor)) {
        return saved as ThemeColor;
    }
    return "default";
}

export function setThemeColor(color: ThemeColor): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.themeColor, color);
}

// Badges
export function getBadges(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.badges);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function addBadge(badge: string): void {
    if (typeof window === 'undefined') return;
    const current = getBadges();
    if (!current.includes(badge)) {
        current.push(badge);
        localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(current));
    }
}

export function hasBadge(badge: string): boolean {
    const current = getBadges();
    return current.includes(badge);
}

// Achievements
export interface UnlockedAchievement {
    id: number;
    unlockedAt: string; // ISO date string
}

export function getUnlockedAchievements(): UnlockedAchievement[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.achievements);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function unlockAchievement(id: number): boolean {
    if (typeof window === 'undefined') return false;
    const current = getUnlockedAchievements();
    if (!current.some(a => a.id === id)) {
        current.push({ id, unlockedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(current));

        // Dispatch event for notification
        const achievement = getAchievement(id);
        if (achievement) {
            window.dispatchEvent(new CustomEvent('achievement_unlocked', {
                detail: { title: achievement.title }
            }));
        }

        return true; // Newly unlocked
    }
    return false; // Already unlocked
}

// Error Hidden Category
export interface ErrorHiddenStatus {
    unlocked: boolean;
    unlockedAt: string | null;
}

export function hasErrorHiddenUnlocked(): boolean {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(STORAGE_KEYS.errorHidden);
    if (!saved) return false;
    try {
        const parsed = JSON.parse(saved);
        return parsed.unlocked === true;
    } catch {
        return false;
    }
}

export function unlockErrorHidden(): void {
    if (typeof window === 'undefined') return;
    const status: ErrorHiddenStatus = {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.errorHidden, JSON.stringify(status));
}

// Clear all edits

// Commands
export function getUnlockedCommands(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.unlockedCommands);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function unlockCommand(id: string): void {
    if (typeof window === 'undefined') return;
    const current = getUnlockedCommands();
    if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(STORAGE_KEYS.unlockedCommands, JSON.stringify(current));
    }
}

export function hasUnlockedCommand(id: string): boolean {
    const current = getUnlockedCommands();
    return current.includes(id);
}

// Clear all edits
export function clearAllEdits(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.historyEdits);
    localStorage.removeItem(STORAGE_KEYS.profileEdits);
    localStorage.removeItem(STORAGE_KEYS.discographyEdits);
    localStorage.removeItem(STORAGE_KEYS.badges);
    localStorage.removeItem(STORAGE_KEYS.achievements);
    localStorage.removeItem(STORAGE_KEYS.unlockedCommands);
}

// Error Logs - Capture actual errors (404, etc.)
const MAX_ERROR_LOGS = 100;

export interface ErrorLogEntry {
    code: string;           // e.g., "404", "500"
    path: string;           // URL path where error occurred
    timestamp: string;      // ISO date string
    userAgent?: string;     // Browser info
    message?: string;       // Optional error message
}

export function getErrorLogs(): ErrorLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.errorLogs);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function addErrorLog(entry: ErrorLogEntry): void {
    if (typeof window === 'undefined') return;
    const current = getErrorLogs();

    // Add new entry at the beginning
    current.unshift(entry);

    // Keep only the latest MAX_ERROR_LOGS entries
    const trimmed = current.slice(0, MAX_ERROR_LOGS);

    localStorage.setItem(STORAGE_KEYS.errorLogs, JSON.stringify(trimmed));
}

export function clearErrorLogs(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.errorLogs);
}

// Error Tracklist Unlock Status
export interface ErrorTracklistStatus {
    unlocked: boolean;
    unlockedAt: string | null;
}

export function hasErrorTracklistUnlocked(): boolean {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(STORAGE_KEYS.errorTracklist);
    if (!saved) return false;
    try {
        const parsed = JSON.parse(saved);
        return parsed.unlocked === true;
    } catch {
        return false;
    }
}

export function unlockErrorTracklist(): void {
    if (typeof window === 'undefined') return;
    const status: ErrorTracklistStatus = {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.errorTracklist, JSON.stringify(status));
}

