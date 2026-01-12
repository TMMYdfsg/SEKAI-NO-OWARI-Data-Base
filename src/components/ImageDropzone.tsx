"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";

interface ImageDropzoneProps {
    onUploadComplete: (url: string) => void;
    className?: string;
    label?: string;
}

export default function ImageDropzone({ onUploadComplete, className = "", label = "画像をアップロード" }: ImageDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = async (file: File) => {
        setError(null);

        // Validation
        if (!file.type.startsWith("image/")) {
            setError("画像ファイルのみアップロード可能です");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("ファイルサイズは5MB以下にしてください");
            return;
        }

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                onUploadComplete(data.url);
            } else {
                setError(data.message || "アップロードに失敗しました");
            }
        } catch (err) {
            setError("通信エラーが発生しました");
        } finally {
            setIsUploading(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={`w-full ${className}`}>
            {!preview ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                        ${isDragging ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
                        ${error ? "border-red-500/50 bg-red-500/5" : ""}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <Upload size={32} className={isDragging ? "text-primary" : "text-muted-foreground"} />
                        <div className="space-y-1">
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">ドラッグ＆ドロップ または クリック</p>
                            <p className="text-[10px] text-white/30">MAX 5MB (jpg, png, webp)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden group border border-white/10 bg-black/50">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover opacity-80" />

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-t-primary border-white/20 animate-spin" />
                                <span className="text-xs font-bold">Uploading...</span>
                            </div>
                        </div>
                    )}

                    {!isUploading && !error && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            <div className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                                <CheckCircle size={16} />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                className="bg-black/80 hover:bg-red-500 text-white p-1 rounded-full shadow-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}
        </div>
    );
}
