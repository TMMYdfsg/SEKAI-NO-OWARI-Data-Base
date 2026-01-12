"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Layers, Save, Trash2, Move, RotateCw, ZoomIn, ArrowUp, ArrowDown } from "lucide-react";

interface Layer {
    id: string;
    name: string;
    image: string; // Data URL or path
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
}

interface MemberCustomizerProps {
    memberId: string;
    memberName: string;
    initialImage?: string;
    onSave: (imageData: string) => void;
    onClose: () => void;
}

export default function MemberCustomizer({ memberId, memberName, initialImage, onSave, onClose }: MemberCustomizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Initialize with base image if available
    useEffect(() => {
        if (initialImage && layers.length === 0) {
            const baseLayer: Layer = {
                id: "base",
                name: "Base Image",
                image: initialImage,
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                zIndex: 0
            };
            setLayers([baseLayer]);
            setSelectedLayerId("base");
        }
    }, [initialImage]);

    // Draw Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set dimensions (fixed size for standardization)
        canvas.width = 600;
        canvas.height = 800;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sort layers by zIndex
        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

        sortedLayers.forEach(layer => {
            const img = new Image();
            img.src = layer.image.startsWith("/api") ? layer.image : layer.image;
            img.crossOrigin = "anonymous";

            // Note: In a real app, we need to handle image loading state.
            // Here assuming images load fast or are data URLs.
            // For robustness, we could pre-load images.

            if (img.complete) {
                drawImage(ctx, img, layer);
            } else {
                img.onload = () => drawImage(ctx, img, layer);
            }
        });
    }, [layers]);

    const drawImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, layer: Layer) => {
        ctx.save();

        // Transform
        const centerX = layer.x + 300; // Center offset
        const centerY = layer.y + 400;

        ctx.translate(centerX, centerY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        // Draw centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Selection indicator
        if (selectedLayerId === layer.id) {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2 / layer.scale;
            ctx.strokeRect(-img.width / 2, -img.height / 2, img.width, img.height);
        }

        ctx.restore();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newLayer: Layer = {
                    id: Date.now().toString(),
                    name: file.name,
                    image: event.target.result as string,
                    x: 0,
                    y: 0,
                    scale: 0.5, // Default scale down a bit
                    rotation: 0,
                    zIndex: layers.length
                };
                setLayers(prev => [...prev, newLayer]);
                setSelectedLayerId(newLayer.id);
            }
        };
        reader.readAsDataURL(file);
    };

    const updateLayer = (id: string, updates: Partial<Layer>) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    // Canvas Mouse Interaction
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedLayerId) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedLayerId) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer) {
            updateLayer(selectedLayerId, {
                x: layer.x + dx,
                y: layer.y + dy
            });
        }

        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");
        onSave(dataUrl);
        onClose();
    };

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-6xl h-[90vh] rounded-2xl border border-white/10 flex overflow-hidden shadow-2xl">

                {/* Left Panel: Layers & Controls */}
                <div className="w-[350px] border-r border-white/10 flex flex-col bg-black/20 shrink-0">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                            <Layers size={24} className="text-primary" />
                            Customize {memberName}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {/* Add Layer */}
                        <div className="space-y-2">
                            <label className="block w-full cursor-pointer group">
                                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                                    <Upload size={20} className="text-muted-foreground group-hover:text-primary" />
                                    <span className="text-sm text-muted-foreground group-hover:text-white">Add Image Layer</span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>

                        {/* Layer List */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Layers</h3>
                            <div className="space-y-2">
                                {[...layers].reverse().map((layer) => (
                                    <div
                                        key={layer.id}
                                        onClick={() => setSelectedLayerId(layer.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedLayerId === layer.id
                                                ? "bg-primary/20 border-primary/50"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded bg-black/50 overflow-hidden shrink-0">
                                            <img src={layer.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{layer.name}</div>
                                            <div className="text-xs text-muted-foreground">Z: {layer.zIndex}</div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.filter(l => l.id !== layer.id)); }}
                                            className="p-1 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls for Selected Layer */}
                        {selectedLayer && (
                            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <Settings size={16} /> Layer Properties
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <ZoomIn size={12} /> Scale: {selectedLayer.scale.toFixed(2)}
                                        </label>
                                        <input
                                            type="range" min="0.1" max="3" step="0.1"
                                            value={selectedLayer.scale}
                                            onChange={(e) => updateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-white/10 rounded-lg accent-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <RotateCw size={12} /> Rotation: {selectedLayer.rotation}°
                                        </label>
                                        <input
                                            type="range" min="0" max="360"
                                            value={selectedLayer.rotation}
                                            onChange={(e) => updateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-white/10 rounded-lg accent-primary"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateLayer(selectedLayer.id, { zIndex: selectedLayer.zIndex + 1 })}
                                            className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center justify-center gap-1"
                                        >
                                            <ArrowUp size={12} /> Bring Fwd
                                        </button>
                                        <button
                                            onClick={() => updateLayer(selectedLayer.id, { zIndex: Math.max(0, selectedLayer.zIndex - 1) })}
                                            className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center justify-center gap-1"
                                        >
                                            <ArrowDown size={12} /> Send Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            <Save size={20} />
                            Save Customization
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full mt-2 py-2 text-muted-foreground hover:text-white transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Right: Canvas Preview */}
                <div className="flex-1 bg-black/50 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none"></div>

                    <div className="relative shadow-2xl shadow-black/50 border border-white/10">
                        <canvas
                            ref={canvasRef}
                            className="max-h-[85vh] object-contain bg-neutral-900 cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/70 pointer-events-none">
                            Draft Mode
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
