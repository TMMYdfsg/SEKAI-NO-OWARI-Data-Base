
import { albums } from "@/data/discography";

// --- Types ---

export type ThemeCategory = "Album" | "Single" | "Tour" | "Motif" | "Special";
export type YearFormat = "in" | "paren" | "range" | "none"; // in 2013, (2013), 2010-2011, none
export type AnimationRecipeId = "default" | "forest" | "ocean" | "city" | "fantasy" | "starlight" | "party" | "toxic" | "snow" | "rain";

export interface AnimationRecipe {
    id: AnimationRecipeId;
    overlayColor: string; // "rgba(0,0,0,0.5)"
    particleType?: "fire" | "snow" | "dust" | "star" | "bubble";
    fogColor?: string;
    silhouetteType?: "tree" | "city" | "ring" | "gate" | "none";
    mergeTarget?: "border" | "background" | "logo";
}

export interface ThemeDefinition {
    id: string;
    displayName: string;
    category: ThemeCategory;
    year: string | null; // "2013", "2010-2011"
    yearFormat: YearFormat;
    paletteKey: string; // map to CSS variables in ThemeContext
    motif: string; // for icon or small decoration
    animationRecipeId: AnimationRecipeId;
    tags: string[];
}

// --- Manual Theme Definitions ---

const SPECIAL_THEMES: ThemeDefinition[] = [
    // Member Themes (Legacy/Standard)
    { id: "default", displayName: "Standard", category: "Motif", year: null, yearFormat: "none", paletteKey: "default", motif: "logo", animationRecipeId: "default", tags: ["standard"] },
    { id: "fukase", displayName: "Fukase", category: "Motif", year: null, yearFormat: "none", paletteKey: "fukase", motif: "mic", animationRecipeId: "default", tags: ["member"] },
    { id: "nakajin", displayName: "Nakajin", category: "Motif", year: null, yearFormat: "none", paletteKey: "nakajin", motif: "guitar", animationRecipeId: "default", tags: ["member"] },
    { id: "saori", displayName: "Saori", category: "Motif", year: null, yearFormat: "none", paletteKey: "saori", motif: "piano", animationRecipeId: "default", tags: ["member"] },
    { id: "djlove", displayName: "DJ LOVE", category: "Motif", year: null, yearFormat: "none", paletteKey: "djlove", motif: "mask", animationRecipeId: "default", tags: ["member"] },

    // 2020s
    {
        id: "shinkai",
        displayName: "深海",
        category: "Special",
        year: "2024",
        yearFormat: "paren",
        paletteKey: "nautilus", // reusing existing
        motif: "sea",
        animationRecipeId: "ocean",
        tags: ["tour", "live", "deep_sea"]
    },
    {
        id: "phoenix",
        displayName: "Phoenix",
        category: "Special",
        year: "2025",
        yearFormat: "none", // Assuming ongoing or future
        paletteKey: "fukase", // Placeholder
        motif: "fire",
        animationRecipeId: "default",
        tags: ["live", "future"]
    },
    {
        id: "terminal",
        displayName: "Terminal",
        category: "Special",
        year: "2024",
        yearFormat: "paren",
        paletteKey: "nakajin", // Placeholder
        motif: "city",
        animationRecipeId: "city",
        tags: ["tour"]
    },
    {
        id: "instant_radio_2025",
        displayName: "FANCLUB TOUR 2025「INSTANT RADIO」",
        category: "Tour",
        year: "2025",
        yearFormat: "none",
        paletteKey: "saori", // Placeholder
        motif: "radio",
        animationRecipeId: "party",
        tags: ["fc", "live"]
    },
    {
        id: "fafrotskies_2023",
        displayName: "FANCLUB TOUR 2023「Fafrotskies 〜The Fan〜」",
        category: "Tour",
        year: "2023",
        yearFormat: "none",
        paletteKey: "saori",
        motif: "umbrella",
        animationRecipeId: "rain",
        tags: ["fc", "live"]
    },
    {
        id: "du_gara_di_du",
        displayName: "Du Gara Di Du",
        category: "Tour",
        year: "2022",
        yearFormat: "paren",
        paletteKey: "djlove",
        motif: "amusement_park",
        animationRecipeId: "fantasy",
        tags: ["tour", "live"]
    },
    {
        id: "blue_planet",
        displayName: "BLUE PLANET ORCHESTRA",
        category: "Tour",
        year: "2021-2022",
        yearFormat: "range",
        paletteKey: "nakajin",
        motif: "orchestra",
        animationRecipeId: "starlight",
        tags: ["tour", "live", "space"]
    },
    // 2010s
    {
        id: "the_colors",
        displayName: "The Colors",
        category: "Tour",
        year: "2019",
        yearFormat: "paren",
        paletteKey: "dragonNight", // reusing
        motif: "frame",
        animationRecipeId: "toxic",
        tags: ["tour", "live", "art"]
    },
    {
        id: "insomnia_train",
        displayName: "INSOMNIA TRAIN",
        category: "Tour",
        year: "2018",
        yearFormat: "paren",
        paletteKey: "fukase",
        motif: "train",
        animationRecipeId: "fantasy",
        tags: ["tour", "live", "outdoor"]
    },
    {
        id: "tarkus",
        displayName: "タルカス",
        category: "Tour",
        year: "2017",
        yearFormat: "paren",
        paletteKey: "tree",
        motif: "story",
        animationRecipeId: "fantasy",
        tags: ["tour", "live", "story"]
    },
    {
        id: "the_dinner",
        displayName: "The Dinner",
        category: "Tour",
        year: "2016",
        yearFormat: "paren",
        paletteKey: "twilight", // reusing
        motif: "mansion",
        animationRecipeId: "fantasy", // Should be dark/foresty
        tags: ["tour", "live", "dark"]
    },
    {
        id: "twilight_city",
        displayName: "Twilight City",
        category: "Special",
        year: "2015",
        yearFormat: "paren",
        paletteKey: "twilight",
        motif: "city",
        animationRecipeId: "city",
        tags: ["live", "stadium"]
    },
    {
        id: "tokyo_fantasy",
        displayName: "TOKYO FANTASY",
        category: "Special",
        year: "2014",
        yearFormat: "paren",
        paletteKey: "twilight",
        motif: "cat",
        animationRecipeId: "fantasy",
        tags: ["live", "fujiq"]
    },
    {
        id: "bonfire_starland",
        displayName: "炎と森のカーニバル -スターランド編-",
        category: "Special",
        year: "2014",
        yearFormat: "paren",
        paletteKey: "tree",
        motif: "tree",
        animationRecipeId: "forest",
        tags: ["tour", "live"]
    },
    {
        id: "bonfire_2013",
        displayName: "炎と森のカーニバル",
        category: "Special",
        year: "2013",
        yearFormat: "in",
        paletteKey: "tree",
        motif: "tree",
        animationRecipeId: "forest",
        tags: ["live", "fujiq"]
    },
    {
        id: "entertainment_tour",
        displayName: "ENTERTAINMENT",
        category: "Tour",
        year: "2012",
        yearFormat: "paren",
        paletteKey: "saori",
        motif: "circus",
        animationRecipeId: "party",
        tags: ["tour", "live"]
    },
    {
        id: "zepp_tour_2011",
        displayName: "SEKAI NO OWARI TOUR 2011",
        category: "Tour",
        year: "2011",
        yearFormat: "none", // Already in title
        paletteKey: "nakajin",
        motif: "earth",
        animationRecipeId: "default",
        tags: ["tour", "live"]
    },
    {
        id: "budokan_2011",
        displayName: "SEKAI NO OWARI at 武道館",
        category: "Special",
        year: "2011",
        yearFormat: "paren",
        paletteKey: "fukase",
        motif: "bird",
        animationRecipeId: "default",
        tags: ["live", "milestone"]
    },
    // 2010 and older
    {
        id: "autumn_tour_2010",
        displayName: "世界の終わり 秋のワンマンツアー 2010",
        category: "Tour",
        year: "2010",
        yearFormat: "none",
        paletteKey: "default",
        motif: "earth",
        animationRecipeId: "default",
        tags: ["tour", "live", "indies"]
    },
    {
        id: "heart_the_earth",
        displayName: "世界の終わり Heart the eartH Tour",
        category: "Tour",
        year: "2010",
        yearFormat: "paren",
        paletteKey: "default",
        motif: "earth",
        animationRecipeId: "default",
        tags: ["tour", "live", "indies"]
    },
    {
        id: "club_earth",
        displayName: "club EARTH",
        category: "Special",
        year: null,
        yearFormat: "none",
        paletteKey: "default",
        motif: "basement",
        animationRecipeId: "default",
        tags: ["origin"]
    },
    {
        id: "starlight_ring_motif",
        displayName: "スターライトリングモチーフ",
        category: "Motif",
        year: null,
        yearFormat: "none",
        paletteKey: "twilight",
        motif: "ring",
        animationRecipeId: "starlight",
        tags: ["item", "motif"]
    },
];

// --- Generator ---

export function getAllThemes(): ThemeDefinition[] {
    const generatedThemes: ThemeDefinition[] = albums.map(album => {
        // Skip if a Special theme already exists for this (rough check by title similarity could be added, but for now just map all)
        // Ideally we filter out those that overlap with SPECIAL_THEMES, but SPECIAL_THEMES are mostly Tours.

        // Determine category
        let cat: ThemeCategory = "Album";
        if (album.type === "Single" || album.type === "EP") cat = "Single";
        // Videos are typically Tours, but let's stick to Album/Single categories for discography items unless manually mapped.

        return {
            id: `generated_${album.id}`,
            displayName: album.title,
            category: cat,
            year: album.releaseDate.split("-")[0],
            yearFormat: "paren",
            paletteKey: "default", // Would need logic to pick color based on album art (future) or predetermined map
            motif: "disc",
            animationRecipeId: "default",
            tags: ["generated", album.type.toLowerCase()]
        };
    });

    return [...SPECIAL_THEMES, ...generatedThemes];
}

export function getThemeById(id: string): ThemeDefinition | undefined {
    return getAllThemes().find(t => t.id === id);
}

// Helper to format the full title with year
export function getThemeFullLabel(theme: ThemeDefinition): string {
    if (!theme.year || theme.yearFormat === "none") return theme.displayName;

    switch (theme.yearFormat) {
        case "in":
            return `${theme.displayName} in ${theme.year}`;
        case "paren":
            return `${theme.displayName} (${theme.year})`;
        case "range":
            return `${theme.displayName} ${theme.year}`;
        default:
            return theme.displayName;
    }
}
