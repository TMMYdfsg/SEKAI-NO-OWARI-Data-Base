"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { findCommand } from "@/lib/secret-commands";
import { NoiseEffect } from "@/components/NoiseEffect";
import { unlockCommand, unlockAchievement } from "@/lib/local-storage-data";
import { notifyAchievement } from "@/components/AchievementNotifier";
import { hiddenCommandList } from "@/data/command-master";
import { getAchievement } from "@/data/achievements-list";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [secretCommand, setSecretCommand] = useState("");
    const [libraryMode, setLibraryMode] = useState<"SONGS" | "LIVE">("SONGS");
    const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
    const [showNoiseEffect, setShowNoiseEffect] = useState(false);
    const [noiseAttempts, setNoiseAttempts] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
        setSecretCommand("");
        setCommandFeedback(null);
    }, [pathname]);

    // Load library mode preference
    useEffect(() => {
        const saved = localStorage.getItem("sekaowa_library_mode");
        if (saved === "SONGS" || saved === "LIVE") {
            setLibraryMode(saved);
        }
    }, []);

    // Load gallery secret access
    useEffect(() => {
        const hasAccess = localStorage.getItem("sekaowa_gallery_secret");
        if (hasAccess) {
            // Already has access
        }
    }, []);

    const toggleLibraryMode = () => {
        const newMode = libraryMode === "SONGS" ? "LIVE" : "SONGS";
        setLibraryMode(newMode);
        localStorage.setItem("sekaowa_library_mode", newMode);
    };

    // ... inside component
    const [noWarSeq, setNoWarSeq] = useState<string[]>([]);
    const [errorSeq, setErrorSeq] = useState<string[]>([]); // E-R-R-O-R sequence

    // NO WAR Logic
    useEffect(() => {
        if (noWarSeq.join("") === "NOWAR") {
            unlockCommand("cmd_nowar");
            unlockAchievement(105);
            notifyAchievement("NO WARの扉");
            setCommandFeedback("隠し扉が開かれました: NO WAR");
            setNoWarSeq([]);
        }
    }, [noWarSeq]);

    const handleLetterClick = (char: string) => {
        // === NOWAR Sequence: N-O-W-A-R ===
        const nowarTarget = "NOWAR";
        const nowarCurrentLen = noWarSeq.length;

        if (char === nowarTarget[nowarCurrentLen]) {
            const newSeq = [...noWarSeq, char];
            setNoWarSeq(newSeq);
            if (newSeq.join("") === "NOWAR") {
                unlockCommand("cmd_nowar");
                unlockAchievement(106);
                router.push("/no-war");
            }
        } else if (noWarSeq.length > 0) {
            // NOWAR sequence failure - show noise effect!
            setShowNoiseEffect(true);
            setNoiseAttempts(prev => prev + 1);
            setNoWarSeq([]);
        }

        // === ERROR Sequence: E-R-R-O-R ===
        // Special handling: R is clicked multiple times (stages)
        const errorTarget = "ERROR";
        const errorCurrentLen = errorSeq.length;
        const expectedChar = errorTarget[errorCurrentLen];

        if (char === expectedChar) {
            const newSeq = [...errorSeq, char];
            setErrorSeq(newSeq);
            if (newSeq.join("") === "ERROR") {
                unlockCommand("cmd_error");
                unlockAchievement(107); // ERROR unlock achievement
                router.push("/error");
            }
        } else if (errorSeq.length > 0 && char !== expectedChar) {
            // ERROR sequence failure - show noise effect!
            setShowNoiseEffect(true);
            setNoiseAttempts(prev => prev + 1);
            setErrorSeq([]);
        }
    };

    const [extraMenuMode, setExtraMenuMode] = useState<"ACHIEVEMENTS" | "HIDDEN COMMANDS">("ACHIEVEMENTS");

    const toggleExtraMenuMode = () => {
        const newMode = extraMenuMode === "ACHIEVEMENTS" ? "HIDDEN COMMANDS" : "ACHIEVEMENTS";
        setExtraMenuMode(newMode);
    };

    const navItems = [
        { name: "HOME", href: "/" },
        { name: "DISCOGRAPHY", href: "/discography" },
        { name: "PROFILE", href: "/members" },
        { name: "HISTORY", href: "/history" },
        { name: libraryMode, href: libraryMode === "SONGS" ? "/songs" : "/live", isToggle: true, isLibraryToggle: true },
        { name: "VIDEOS", href: "/videos" },
        { name: "GALLERY", href: "/gallery" },
        { name: "GOODS", href: "/goods" },
        { name: "SETTINGS", href: "/settings" },
        { name: extraMenuMode, href: extraMenuMode === "ACHIEVEMENTS" ? "/achievements" : "/settings/commands", isToggle: true, isMenuToggle: true },
    ];

    // Imports moved to top

    const handleSecretCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && secretCommand.trim()) {
            const command = findCommand(secretCommand);

            if (command) {
                setCommandFeedback(command.description);

                // --- Phase 11: Unlock Command & Achievements ---
                // 1. Find ID in master list
                const masterCmd = hiddenCommandList.find(c =>
                    c.command.toUpperCase() === command.command.toUpperCase()
                    || command.command.toUpperCase().includes(c.command.toUpperCase()) // For lyrics roughly
                );

                if (masterCmd) {
                    unlockCommand(masterCmd.id);
                }

                // 2. Check Specific Achievements
                const upperCmd = command.command.toUpperCase();
                // Map command text to Achievement ID
                const achMap: Record<string, number> = {
                    "RADIO": 3,
                    "PHOENIX": 12,
                    "LOVEWARZ": 14,
                    "CARNIVAL": 24,
                    "DEATH": 31,
                    "ANTI": 37,
                    "...---...": 39,
                    "WITCH": 52,
                    "RAFFLESIA": 60,
                    "SCENT": 65,
                    "UTOPIA": 78,
                    "WHITECD": 98,
                    "SEKAI NO OWARI": 99,
                    "NAUTILUS": 104,
                    "FANTASY": 10,
                    "SLEEP": 22,
                    "MAGIC": 36, // Also 5 for puzzle
                    //"LIKE A SCENT": 66, // Needs to be added to lyricsCommands
                };

                // Check direct match or if it's a lyric command that matches the key
                let achId = achMap[upperCmd];
                // For lyrics, `command.command` in `secret-commands.ts` are the lyrics themselves.
                // We need to match the "keyword" represented by the lyric.
                // This is a bit tricky. 
                // Let's rely on the `action` or `description`? 
                // Or checking `masterCmd?.id`.
                if (masterCmd) {
                    if (masterCmd.id === "lyric_fantasy") achId = 10;
                    if (masterCmd.id === "lyric_sleep") achId = 22;
                    if (masterCmd.id === "lyric_magic") achId = 36;
                    if (masterCmd.id === "cmd_sos") achId = 39;
                    // ... map others via ID
                }

                if (achId) {
                    if (unlockAchievement(achId)) {
                        const ach = getAchievement(achId);
                        if (ach) notifyAchievement(ach.title);
                    }
                }
                // ---------------------------------------------

                switch (command.action) {
                    case "show_discovery":
                        // Navigate to song discovery page
                        router.push(
                            `/song-discovery?song=${encodeURIComponent(command.songTitle)}&desc=${encodeURIComponent(command.description)}${command.albumId ? `&album=${command.albumId}` : ''}`
                        );
                        break;

                    case "show_gallery":
                        // Grant secret access and go to gallery
                        localStorage.setItem("sekaowa_gallery_secret", "true");
                        router.push("/gallery");
                        break;

                    case "special":
                        if (command.command.toLowerCase() === "レア音源" || command.command.toLowerCase() === "secret") {
                            localStorage.setItem("sekaowa_gallery_secret", "true");
                            router.push("/rare");
                        } else if (command.command.toLowerCase() === "shuffle") {
                            // Trigger shuffle mode - will be handled by player
                            router.push("/songs?shuffle=true");
                        } else if (command.command.toLowerCase() === "quiz") {
                            router.push("/quiz");
                        } else if (command.command.toLowerCase() === "dj love") {
                            router.push("/members?member=djlove");
                        } else if (command.command.toLowerCase() === "quiz master") {
                            localStorage.setItem("sekaowa_gallery_secret", "true");
                            router.push("/rare?view=badges");
                        }
                        break;
                }

                setTimeout(() => {
                    setIsOpen(false);
                    setSecretCommand("");
                    setCommandFeedback(null);
                }, 500);
            } else {
                // Check for year commands (e.g., "2015" plays songs from that year)
                const yearMatch = secretCommand.match(/^(20[0-2][0-9])$/);
                if (yearMatch) {
                    router.push(`/songs?year=${yearMatch[1]}`);
                    setIsOpen(false);
                    setSecretCommand("");
                } else {
                    // 不正コマンド → ノイズ演出発動！
                    setShowNoiseEffect(true);
                    setNoiseAttempts(prev => prev + 1);
                }
            }
        }
    };

    const handleNoiseComplete = () => {
        setShowNoiseEffect(false);
        setSecretCommand("");
    };

    return (
        <>
            {/* Fixed Header with Hamburger */}
            <nav className="fixed top-0 right-0 z-50 p-6 flex justify-end w-full pointer-events-none">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="pointer-events-auto text-white hover:text-primary transition-colors focus:outline-none z-50"
                >
                    {isOpen ? <X size={32} /> : <Menu size={32} className="text-white/80" />}
                </button>
            </nav>

            {/* Full-screen Overlay */}
            <div
                className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-all duration-500 ease-in-out flex flex-col justify-center px-12 md:px-24 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left: Branding */}
                    <div className="hidden md:flex flex-col justify-center border-r border-white/10 pr-12">
                        <h1 className="text-7xl font-thin tracking-wider font-serif text-white/90 leading-tight select-none">
                            S
                            <span
                                className={`transition-all cursor-pointer active:scale-95 inline-block ${errorSeq.length > 0 && errorSeq[0] === 'E' ? "text-red-500 scale-110" : "hover:text-red-500"}`}
                                onClick={() => handleLetterClick('E')}
                            >E</span>
                            KAI<br />
                            <span
                                className={`transition-colors cursor-pointer active:scale-95 inline-block ${noWarSeq.length > 0 ? "text-red-600 scale-110" : "hover:text-red-600"}`}
                                onClick={() => handleLetterClick('N')}
                            >N</span>
                            <span
                                className={`transition-all cursor-pointer active:scale-95 inline-block ${noWarSeq.length > 1 ? "text-red-600 scale-110" : ""} ${errorSeq.length === 4 ? "text-yellow-500 scale-110" : "hover:text-primary"}`}
                                onClick={() => handleLetterClick('O')}
                            >O</span><br />
                            <span
                                className={`transition-all cursor-pointer active:scale-95 inline-block ${errorSeq.length === 4 ? "text-yellow-500" : ""} ${noWarSeq.length > 1 ? "text-red-600" : ""}`}
                                onClick={() => handleLetterClick('O')}
                            >O</span>
                            <span
                                className={`transition-colors cursor-pointer active:scale-95 inline-block ${noWarSeq.length > 2 ? "text-red-600 scale-110" : "hover:text-red-600"}`}
                                onClick={() => handleLetterClick('W')}
                            >W</span>
                            <span
                                className={`transition-colors cursor-pointer active:scale-95 inline-block ${noWarSeq.length > 3 ? "text-red-600 scale-110" : "hover:text-red-600"}`}
                                onClick={() => handleLetterClick('A')}
                            >A</span>
                            <span
                                className={`transition-all cursor-pointer active:scale-95 inline-block 
                                    ${noWarSeq.length > 4 ? "text-red-600 scale-110" : ""}
                                    ${errorSeq.length === 1 ? "text-red-500" : ""}
                                    ${errorSeq.length === 2 ? "text-blue-500" : ""}
                                    ${errorSeq.includes('R') && errorSeq.length >= 4 ? "text-yellow-500" : ""}
                                    hover:text-primary
                                `}
                                onClick={() => handleLetterClick('R')}
                            >R</span>
                            I
                        </h1>
                        <p className="mt-8 text-muted-foreground tracking-widest text-sm">
                            DATABASE / FAN SITE
                        </p>
                    </div>

                    {/* Right: Menu Items */}
                    <div className="flex flex-col justify-center space-y-6">
                        <h2 className="text-muted-foreground text-sm tracking-widest mb-4">CONTENTS:</h2>
                        {navItems.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <Link
                                    href={item.href}
                                    className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-wide hover:text-white hover:pl-4 transition-all duration-300 font-sans ${
                                        // @ts-ignore
                                        item.isLibraryToggle && libraryMode === "LIVE"
                                            ? "text-blue-400/70 hover:text-blue-400"
                                            : "text-white/50"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                                {item.isToggle && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // @ts-ignore
                                            if (item.isLibraryToggle) {
                                                toggleLibraryMode();
                                                // @ts-ignore
                                            } else if (item.isMenuToggle) {
                                                toggleExtraMenuMode();
                                            }
                                        }}
                                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
                                        title={
                                            // @ts-ignore
                                            item.isLibraryToggle ? "SONGS/LIVE 切り替え" : "表示切り替え"
                                        }
                                    >
                                        <RefreshCw
                                            size={20}
                                            className="text-white/30 group-hover:text-white/70 transition-all group-hover:rotate-180 duration-300"
                                        />
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="mt-12 pt-12 border-t border-white/10 flex gap-6 text-sm text-muted-foreground">
                            <span>CONTACT</span>
                            <span>CREDITS</span>
                        </div>

                        {/* Hidden Command Input */}
                        <div className="mt-4">
                            <input
                                type="text"
                                value={secretCommand}
                                onChange={(e) => setSecretCommand(e.target.value)}
                                onKeyDown={handleSecretCommand}
                                placeholder="🔮"
                                className={`w-48 px-3 py-2 text-sm bg-white/5 border rounded-lg transition-all focus:outline-none ${commandFeedback
                                    ? "border-purple-500/50 text-purple-300 bg-purple-500/10"
                                    : "border-white/5 text-white/30 hover:border-white/10 focus:border-purple-500/30"
                                    }`}
                                style={{ caretColor: 'rgba(168, 85, 247, 0.5)' }}
                            />
                            {commandFeedback && (
                                <p className="text-xs text-purple-400 mt-2 animate-pulse">
                                    ✨ {commandFeedback}
                                </p>
                            )}
                            <p className="text-xs text-white/10 mt-2">
                                💡 歌詞を入力してみて...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ノイズ演出 (FR-1006) */}
            <NoiseEffect
                isActive={showNoiseEffect}
                onComplete={handleNoiseComplete}
                intensity={noiseAttempts >= 3 ? "high" : noiseAttempts >= 2 ? "medium" : "low"}
                duration={noiseAttempts >= 3 ? 4000 : 2500}
            />
        </>
    );
}
