"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, Monitor, Smartphone, Type, Sliders, Image as ImageIcon, Loader, Eye, EyeOff, RefreshCw } from "lucide-react";
import { unlockAchievement } from "@/lib/local-storage-data";

interface GalleryImage {
    name: string;
    path: string;
    folder: string;
}

interface WallpaperGeneratorProps {
    images: GalleryImage[];
    onClose: () => void;
}

export default function WallpaperGenerator({ images, onClose }: WallpaperGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Settings
    const [aspectRatio, setAspectRatio] = useState<"mobile" | "desktop">("mobile");
    const [filterBrightness, setFilterBrightness] = useState(100);
    const [filterContrast, setFilterContrast] = useState(100);
    const [filterBlur, setFilterBlur] = useState(0);

    // Text Layer
    const [text, setText] = useState("");
    const [showText, setShowText] = useState(true);
    const [textX, setTextX] = useState(50);
    const [textY, setTextY] = useState(90);
    const [textSize, setTextSize] = useState(40);
    const [textColor, setTextColor] = useState("#ffffff");
    const [font, setFont] = useState("serif"); // 'serif' for Cinzel-like look

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set dimensions based on aspect ratio (high res)
        let width, height;
        if (aspectRatio === "mobile") {
            width = 1080;
            height = 1920;
        } else {
            width = 1920;
            height = 1080;
        }

        canvas.width = width;
        canvas.height = height;

        // Clear
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        if (!selectedImage) {
            // Draw placeholder text
            ctx.fillStyle = "#333";
            ctx.font = "bold 60px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Select an Image", width / 2, height / 2);
            return;
        }

        const image = new Image();
        image.src = `/api/media?file=${encodeURIComponent(selectedImage.path)}`;
        image.crossOrigin = "anonymous";

        image.onload = () => {
            // Apply filtering context
            ctx.filter = `brightness(${filterBrightness}%) contrast(${filterContrast}%) blur(${filterBlur}px)`;

            // Draw image (cover)
            const ratio = width / height;
            const imgRatio = image.width / image.height;

            let sx, sy, sWidth, sHeight;

            if (imgRatio > ratio) {
                // Image is wider than canvas
                sHeight = image.height;
                sWidth = image.height * ratio;
                sx = (image.width - sWidth) / 2;
                sy = 0;
            } else {
                // Image is taller than canvas
                sWidth = image.width;
                sHeight = image.width / ratio;
                sx = 0;
                sy = (image.height - sHeight) / 2;
            }

            ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, width, height);

            // Reset filter for text
            ctx.filter = "none";

            // Draw Overlay (Vignette)
            const gradient = ctx.createRadialGradient(width / 2, height / 2, height / 3, width / 2, height / 2, height);
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            gradient.addColorStop(1, "rgba(0,0,0,0.4)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Text
            if (showText && text) {
                ctx.save();
                ctx.fillStyle = textColor;
                ctx.textAlign = "center";
                // Simple font mapping
                const fontFamily = font === "serif" ? "Times New Roman, serif" : "Arial, sans-serif";
                ctx.font = `bold ${textSize * 2}px ${fontFamily}`; // Scale size for high res
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Position percent to pixel
                const x = (textX / 100) * width;
                const y = (textY / 100) * height;

                // Multiline support (simple split by newline)
                const lines = text.split('\n');
                const lineHeight = textSize * 2.5;

                lines.forEach((line, i) => {
                    ctx.fillText(line, x, y + i * lineHeight);
                });

                ctx.restore();
            }
        };
    }, [selectedImage, aspectRatio, filterBrightness, filterContrast, filterBlur, text, showText, textX, textY, textSize, textColor, font]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsGenerating(true);
        const link = document.createElement('a');
        link.download = `sekaowa-wallpaper-${aspectRatio}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Unlock Achievement
        unlockAchievement(110);

        setTimeout(() => setIsGenerating(false), 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-7xl h-[90vh] rounded-2xl border border-white/10 flex overflow-hidden shadow-2xl">

                {/* Left Panel: Controls */}
                <div className="w-[400px] border-r border-white/10 flex flex-col bg-black/20 shrink-0">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                            <ImageIcon size={24} className="text-primary" />
                            Wallpaper Generator
                        </h2>
                    </div>

                    <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Aspect Ratio */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Monitor size={16} /> Device Type
                            </label>
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                                <button
                                    onClick={() => setAspectRatio("mobile")}
                                    className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all ${aspectRatio === "mobile"
                                        ? "bg-primary text-primary-foreground shadow"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Smartphone size={16} /> Mobile
                                </button>
                                <button
                                    onClick={() => setAspectRatio("desktop")}
                                    className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all ${aspectRatio === "desktop"
                                        ? "bg-primary text-primary-foreground shadow"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Monitor size={16} /> Desktop
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Sliders size={16} /> Filters
                            </label>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Brightness</span>
                                    <span>{filterBrightness}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="200" value={filterBrightness}
                                    onChange={(e) => setFilterBrightness(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Blur</span>
                                    <span>{filterBlur}px</span>
                                </div>
                                <input
                                    type="range" min="0" max="20" value={filterBlur}
                                    onChange={(e) => setFilterBlur(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-primary"
                                />
                            </div>
                        </div>

                        {/* Text Overlay */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Type size={16} /> Text Overlay
                                </label>
                                <button onClick={() => setShowText(!showText)} className="text-muted-foreground hover:text-white">
                                    {showText ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>

                            {showText && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter your favorite lyrics..."
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none h-24 resize-none"
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">Size</span>
                                            <input
                                                type="range" min="10" max="100" value={textSize}
                                                onChange={(e) => setTextSize(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-lg accent-primary"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">Position Y</span>
                                            <input
                                                type="range" min="0" max="100" value={textY}
                                                onChange={(e) => setTextY(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-lg accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating || !selectedImage}
                            className="w-full py-3 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            {isGenerating ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <Download size={20} />
                            )}
                            Download Wallpaper
                        </button>
                    </div>
                </div>

                {/* Middle: Canvas Preview */}
                <div className="flex-1 bg-black/50 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none"></div>

                    {/* Preview container with shadow */}
                    <div className="relative shadow-2xl shadow-black/50 border border-white/10 transition-all duration-300"
                        style={{
                            height: aspectRatio === "mobile" ? 'calc(100% - 40px)' : 'auto',
                            width: aspectRatio === "desktop" ? 'calc(100% - 40px)' : 'auto',
                            aspectRatio: aspectRatio === "mobile" ? '9/16' : '16/9'
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full object-contain bg-black"
                        />
                    </div>
                </div>

                {/* Right: Image Selector */}
                <div className="w-[200px] border-l border-white/10 bg-black/30 flex flex-col shrink-0">
                    <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Source Images</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {images.map((img) => (
                            <button
                                key={img.path}
                                onClick={() => setSelectedImage(img)}
                                className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage?.path === img.path
                                    ? "border-primary opacity-100 ring-2 ring-primary/30"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <img
                                    src={`/api/media?file=${encodeURIComponent(img.path)}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                    <div className="p-3 border-t border-white/10">
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        >
                            Close Tool
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
