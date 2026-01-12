"use client";

import { useState } from "react";
import { Image as ImageIcon, X, Edit2 } from "lucide-react";

interface CoverImageEditorProps {
    currentImage: string | null;
    onSave: (imagePath: string) => void;
    onRemove?: () => void;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function CoverImageEditor({
    currentImage,
    onSave,
    onRemove,
    size = "md",
    className = "",
}: CoverImageEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [tempPreview, setTempPreview] = useState<string>("");

    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        // Check for text data (file path)
        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
        if (textData) {
            let cleanPath = textData.replace('file:///', '').replace('file://', '');
            cleanPath = decodeURIComponent(cleanPath);
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                setTempPreview(cleanPath);
                return;
            }
        }

        // Handle file drops
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setTempPreview(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = () => {
        if (tempPreview) {
            onSave(tempPreview);
        }
        setIsModalOpen(false);
        setTempPreview("");
    };

    const handleRemove = () => {
        if (onRemove) {
            onRemove();
        }
        setIsModalOpen(false);
        setTempPreview("");
    };

    const openModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
        setTempPreview(currentImage || "");
    };

    return (
        <>
            {/* Trigger Button */}
            <div
                className={`relative ${sizeClasses[size]} rounded-lg bg-white/10 overflow-hidden group cursor-pointer ${className}`}
                onClick={openModal}
            >
                {currentImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentImage})` }}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon size={size === "sm" ? 16 : size === "lg" ? 32 : 24} className="text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit2 size={16} className="text-white" />
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => { setIsModalOpen(false); setTempPreview(""); }}
                >
                    <div
                        className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">カバー画像を編集</h3>
                            <button
                                onClick={() => { setIsModalOpen(false); setTempPreview(""); }}
                                className="text-neutral-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drop Zone */}
                        <div
                            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${isDraggingOver ? 'border-primary bg-primary/20 scale-105' : 'border-white/20 bg-white/5'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {tempPreview ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${tempPreview})` }}
                                />
                            ) : null}
                            <div className="relative z-10 text-center p-4">
                                <ImageIcon size={40} className={`mx-auto mb-3 ${isDraggingOver ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                                <p className="text-xs text-muted-foreground">
                                    {isDraggingOver ? 'ドロップ!' : '画像をドラッグ＆ドロップ'}
                                </p>
                            </div>
                        </div>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={tempPreview}
                            onChange={(e) => setTempPreview(e.target.value)}
                            placeholder="または画像パスを入力..."
                            className="w-full mt-4 px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />

                        {/* Actions */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                                削除
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsModalOpen(false); setTempPreview(""); }}
                                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white bg-white/10 rounded-lg transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!tempPreview}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
