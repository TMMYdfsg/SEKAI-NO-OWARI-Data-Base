// ERROR Archive Tracklist - Songs associated with the ERROR theme
// These tracks are unlocked by solving puzzles in the ERROR page

export interface ErrorTrack {
    id: string;
    title: string;
    subTitle?: string;
    theme?: string;
}

export const ERROR_TRACKLIST: ErrorTrack[] = [
    {
        id: "e-track-1",
        title: "Error",
        subTitle: "システムの崩壊",
        theme: "glitch"
    },
    {
        id: "e-track-2",
        title: "Re:set",
        subTitle: "再起動の試み",
        theme: "reset"
    },
    {
        id: "e-track-3",
        title: "Dropout",
        subTitle: "接続の断絶",
        theme: "disconnect"
    },
    {
        id: "e-track-4",
        title: "illusion",
        subTitle: "偽りの信号",
        theme: "glitch"
    },
    {
        id: "e-track-5",
        title: "ANTI-HERO",
        subTitle: "禁断のアクセス",
        theme: "forbidden"
    },
    {
        id: "e-track-6",
        title: "Death Disco",
        subTitle: "終末のダンス",
        theme: "chaos"
    },
];

// Puzzle conditions for tracklist unlock
export const TRACKLIST_UNLOCK_CONDITION = {
    requiredClicks: 3,  // Click 3 specific error cards
    targetCards: ["E-404", "E-500", "E-666"],  // Error card IDs to click
};
