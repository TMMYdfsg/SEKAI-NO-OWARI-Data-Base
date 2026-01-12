"use client";

import { useState, useRef, useEffect } from "react";
import { Wrench, Layout, Image as ImageIcon, ChevronDown } from "lucide-react";

interface ToolsMenuProps {
    onOpenCollage: () => void;
    onOpenWallpaper: () => void;
}

export default function ToolsMenu({ onOpenCollage, onOpenWallpaper }: ToolsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isOpen
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface hover:bg-surface-hover border-white/5 text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Wrench size={16} />
                <span>Creative Tools</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-white/10 shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                        <button
                            onClick={() => {
                                onOpenCollage();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg hover:bg-white/5 transition-colors text-left group"
                        >
                            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                <Layout size={18} />
                            </div>
                            <div>
                                <div className="font-medium text-white/90">Collage Creator</div>
                                <div className="text-[10px] text-muted-foreground">Combine images into grids</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                onOpenWallpaper();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg hover:bg-white/5 transition-colors text-left group"
                        >
                            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <div className="font-medium text-white/90">Wallpaper Gen</div>
                                <div className="text-[10px] text-muted-foreground">Create custom wallpapers</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
