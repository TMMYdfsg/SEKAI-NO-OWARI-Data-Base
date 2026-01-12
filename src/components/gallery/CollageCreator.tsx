"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, Layout, Image as ImageIcon, RefreshCw } from "lucide-react";
import { unlockAchievement } from "@/lib/local-storage-data";

interface GalleryImage {
    name: string;
    path: string;
    folder: string;
}

interface CollageCreatorProps {
    images: GalleryImage[];
    onClose: () => void;
}

type GridSize = 2 | 3 | 4;

export default function CollageCreator({ images, onClose }: CollageCreatorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedImages, setSelectedImages] = useState<(GalleryImage | null)[]>(Array(4).fill(null));
    const [gridSize, setGridSize] = useState<GridSize>(2);
    const [gap, setGap] = useState(10);
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize grid when size changes
    useEffect(() => {
        setSelectedImages(prev => {
            const newSize = gridSize * gridSize;
            const newArray = Array(newSize).fill(null);
            // Copy existing selections as much as possible
            for (let i = 0; i < Math.min(prev.length, newSize); i++) {
                newArray[i] = prev[i];
            }
            return newArray;
        });
    }, [gridSize]);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Canvas dimensions (high resolution for download)
        const size = 1200;
        canvas.width = size;
        canvas.height = size;

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Calculate cell size
        const totalGap = gap * (gridSize + 1);
        const cellSize = (size - totalGap) / gridSize;

        // Draw images
        selectedImages.forEach((img, index) => {
            if (!img) return;

            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const x = gap + col * (cellSize + gap);
            const y = gap + row * (cellSize + gap);

            const image = new Image();
            image.src = `/api/media?file=${encodeURIComponent(img.path)}`;
            image.crossOrigin = "anonymous";

            // We need to wait for image load to draw, but since this is happening in render cycle,
            // we use a simple loading strategy. In a real app, we'd pre-load or use a better state.
            // For now, attaching onload handler
            image.onload = () => {
                // Aspect ratio crop (cover)
                const ratio = image.width / image.height;
                let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;

                if (ratio > 1) { // Landscape
                    sWidth = image.height;
                    sx = (image.width - image.height) / 2;
                } else { // Portrait
                    sHeight = image.width;
                    sy = (image.height - image.width) / 2;
                }

                ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, cellSize, cellSize);
            };
        });
    }, [selectedImages, gridSize, gap, backgroundColor]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsGenerating(true);
        // Add specific timestamp to filename
        const link = document.createElement('a');
        link.download = `sekaowa-collage-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Unlock Achievement
        unlockAchievement(109);
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const handleImageSelect = (img: GalleryImage, index: number) => {
        const newSelection = [...selectedImages];
        newSelection[index] = img;
        setSelectedImages(newSelection);
    };

    const handleClearCell = (index: number) => {
        const newSelection = [...selectedImages];
        newSelection[index] = null;
        setSelectedImages(newSelection);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-6xl h-[90vh] rounded-2xl border border-white/10 flex overflow-hidden shadow-2xl">

                {/* Left Panel: Controls & Image Picker */}
                <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                            <Layout size={24} className="text-primary" />
                            Collage Creator
                        </h2>
                    </div>

                    <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Grid Settings */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground">Grid Layout</label>
                            <div className="flex gap-2">
                                {[2, 3, 4].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setGridSize(size as GridSize)}
                                        className={`flex-1 py-2 px-3 rounded-lg border transition-all ${gridSize === size
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                            }`}
                                    >
                                        {size}x{size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gap & Background */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                    <span>Gap Size</span>
                                    <span>{gap}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={gap}
                                    onChange={(e) => setGap(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Background Color</label>
                                <div className="flex gap-2">
                                    {["#000000", "#1a1a1a", "#ffffff", "#f0f0f0", "#1e3a8a", "#4c1d95"].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setBackgroundColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${backgroundColor === color ? "border-primary scale-110" : "border-transparent hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image Picker */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground">Select Images</label>
                            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {images.map((img) => (
                                    <div
                                        key={img.path}
                                        draggable
                                        className="aspect-square rounded-md overflow-hidden bg-white/5 cursor-move hover:opacity-80 transition-opacity border border-white/5"
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("image", JSON.stringify(img));
                                        }}
                                    >
                                        <img
                                            src={`/api/media?file=${encodeURIComponent(img.path)}`}
                                            alt={img.name}
                                            className="w-full h-full object-cover pointer-events-none"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Drag and drop images into the grid cells on the right.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="w-full py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            {isGenerating ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <Download size={20} />
                            )}
                            Save Collage
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full mt-2 py-2 text-muted-foreground hover:text-white transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Right Panel: Canvas Preview */}
                <div className="flex-1 bg-[url('/grid-pattern.png')] bg-repeat bg-center flex items-center justify-center p-8 bg-neutral-900/50 relative">
                    <div className="relative shadow-2xl rounded-lg overflow-hidden border border-white/10" style={{ maxHeight: 'calc(100vh - 100px)', aspectRatio: '1/1' }}>

                        {/* Interactive Grid Overlay for Drop Zones */}
                        <div
                            className="absolute inset-0 z-10 grid"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                padding: `${gap * (500 / 1200)}px`, // Scaling gap for preview size (approx 500px)
                                gap: `${gap * (500 / 1200)}px`
                            }}
                        >
                            {selectedImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`relative group border-2 border-dashed ${img ? 'border-transparent' : 'border-white/20 hover:border-primary/50'} rounded transition-colors flex items-center justify-center`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const data = e.dataTransfer.getData("image");
                                        if (data) {
                                            handleImageSelect(JSON.parse(data), idx);
                                        }
                                    }}
                                >
                                    {!img && (
                                        <div className="text-white/20 pointer-events-none">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    {img && (
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleClearCell(idx)}
                                                className="p-1 bg-black/70 rounded-full text-white hover:text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Actual Canvas */}
                        <canvas
                            ref={canvasRef}
                            className="max-h-full max-w-full object-contain bg-white"
                            style={{ height: '500px', width: '500px' }} // Fixed preview size
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
