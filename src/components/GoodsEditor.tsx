"use client";

import { useState } from "react";
import { Plus, X, Trash2, Star, Calendar, DollarSign, MapPin, Image as ImageIcon } from "lucide-react";
import TagManager from "./TagManager";
import type { GoodsType } from "@/types/gallery";

interface GoodsEditorProps {
    initialData?: {
        name?: string;
        type?: GoodsType;
        acquisitionDate?: string;
        description?: string;
        imagePaths?: string[];
        tags?: string[];
        price?: number;
        purchaseLocation?: string;
        condition?: 'mint' | 'excellent' | 'good' | 'fair' | 'poor';
        notes?: string;
        rating?: number;
    };
    onChange: (data: {
        name: string;
        type: GoodsType;
        acquisitionDate: string;
        description: string;
        imagePaths: string[];
        tags: string[];
        price?: number;
        purchaseLocation?: string;
        condition?: 'mint' | 'excellent' | 'good' | 'fair' | 'poor';
        notes?: string;
        rating?: number;
    }) => void;
}

const goodsTypeOptions: { value: GoodsType; label: string }[] = [
    { value: 'CD', label: 'CD' },
    { value: 'DVD', label: 'DVD' },
    { value: 'Blu-ray', label: 'Blu-ray' },
    { value: 'Book', label: '書籍' },
    { value: 'Clothing', label: '衣類' },
    { value: 'Accessory', label: 'アクセサリー' },
    { value: 'Poster', label: 'ポスター' },
    { value: 'Ticket', label: 'チケット' },
    { value: 'Other', label: 'その他' },
];

const conditionOptions = [
    { value: 'mint' as const, label: '新品同様' },
    { value: 'excellent' as const, label: '優良' },
    { value: 'good' as const, label: '良好' },
    { value: 'fair' as const, label: '可' },
    { value: 'poor' as const, label: '要修理' },
];

export default function GoodsEditor({ initialData, onChange }: GoodsEditorProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [type, setType] = useState<GoodsType>(initialData?.type || 'Other');
    const [acquisitionDate, setAcquisitionDate] = useState(initialData?.acquisitionDate || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [imagePaths, setImagePaths] = useState<string[]>(initialData?.imagePaths || []);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [purchaseLocation, setPurchaseLocation] = useState(initialData?.purchaseLocation || "");
    const [condition, setCondition] = useState<'mint' | 'excellent' | 'good' | 'fair' | 'poor' | undefined>(initialData?.condition);
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [newImagePath, setNewImagePath] = useState("");
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // Call onChange whenever data changes
    const handleChange = () => {
        onChange({
            name,
            type,
            acquisitionDate,
            description,
            imagePaths,
            tags,
            price: price ? parseFloat(price) : undefined,
            purchaseLocation: purchaseLocation || undefined,
            condition,
            notes: notes || undefined,
            rating: rating || undefined,
        });
    };

    const addImagePath = () => {
        if (newImagePath.trim()) {
            setImagePaths([...imagePaths, newImagePath.trim()]);
            setNewImagePath("");
            handleChange();
        }
    };

    const removeImagePath = (index: number) => {
        setImagePaths(imagePaths.filter((_, i) => i !== index));
        handleChange();
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

        const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
        if (textData) {
            let cleanPath = textData.replace('file:///', '').replace('file://', '');
            cleanPath = decodeURIComponent(cleanPath);
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                setImagePaths([...imagePaths, cleanPath]);
                handleChange();
                return;
            }
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImagePaths([...imagePaths, event.target.result as string]);
                        handleChange();
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Name */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">名前 *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); handleChange(); }}
                    placeholder="グッズ名を入力..."
                    className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-lg font-bold"
                />
            </div>

            {/* Type */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">種別 *</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {goodsTypeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { setType(option.value); handleChange(); }}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${type === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Acquisition Date & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar size={14} />
                        取得日
                    </label>
                    <input
                        type="date"
                        value={acquisitionDate}
                        onChange={(e) => { setAcquisitionDate(e.target.value); handleChange(); }}
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Star size={14} />
                        評価
                    </label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => { setRating(star); handleChange(); }}
                                className="p-2 transition-colors"
                            >
                                <Star
                                    size={20}
                                    className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <DollarSign size={14} />
                        価格 (円)
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => { setPrice(e.target.value); handleChange(); }}
                        placeholder="0"
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <MapPin size={14} />
                        購入場所
                    </label>
                    <input
                        type="text"
                        value={purchaseLocation}
                        onChange={(e) => { setPurchaseLocation(e.target.value); handleChange(); }}
                        placeholder="購入した場所..."
                        className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Condition */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">状態</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => { setCondition(undefined); handleChange(); }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${!condition
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                            }`}
                    >
                        未設定
                    </button>
                    {conditionOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { setCondition(option.value); handleChange(); }}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${condition === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">説明</label>
                <textarea
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); handleChange(); }}
                    rows={4}
                    placeholder="グッズの詳細説明..."
                    className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">個人メモ</label>
                <textarea
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); handleChange(); }}
                    rows={3}
                    placeholder="個人的なメモ..."
                    className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                />
            </div>

            {/* Image Paths */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">画像</label>

                {/* Image Grid Preview */}
                {imagePaths.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {imagePaths.map((path, index) => (
                            <div key={index} className="relative aspect-square bg-white/5 rounded-lg overflow-hidden group">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${path.startsWith('data:') ? path : `/api/gallery?file=${encodeURIComponent(path)}`})` }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImagePath(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${isDraggingOver ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <ImageIcon size={32} className={`mb-2 ${isDraggingOver ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                    <p className="text-xs text-muted-foreground mb-3">
                        {isDraggingOver ? '画像をドロップ!' : '画像をドラッグ＆ドロップ'}
                    </p>
                    <div className="flex gap-2 w-full max-w-md">
                        <input
                            type="text"
                            value={newImagePath}
                            onChange={(e) => setNewImagePath(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImagePath())}
                            placeholder="または画像パスを入力..."
                            className="flex-1 px-3 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <button
                            type="button"
                            onClick={addImagePath}
                            className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm text-muted-foreground mb-2">タグ</label>
                <TagManager
                    tags={tags}
                    onChange={(newTags) => { setTags(newTags); handleChange(); }}
                    placeholder="タグを追加..."
                />
            </div>
        </div>
    );
}
