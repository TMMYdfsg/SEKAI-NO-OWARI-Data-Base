"use client";

import { useState } from "react";
import { X, Save, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import TagManager from "./TagManager";

interface ImageMetadataEditorProps {
    imagePath: string;
    initialMetadata?: {
        tags?: string[];
        description?: string;
        captureDate?: string;
        type?: 'photo' | 'artwork' | 'screenshot' | 'other';
    };
    onSave: (metadata: {
        tags: string[];
        description: string;
        captureDate: string;
        type: 'photo' | 'artwork' | 'screenshot' | 'other';
    }) => void;
    onClose: () => void;
}

const imageTypeOptions = [
    { value: 'photo' as const, label: '写真' },
    { value: 'artwork' as const, label: 'アートワーク' },
    { value: 'screenshot' as const, label: 'スクリーンショット' },
    { value: 'other' as const, label: 'その他' },
];

export default function ImageMetadataEditor({ imagePath, initialMetadata, onSave, onClose }: ImageMetadataEditorProps) {
    const [tags, setTags] = useState<string[]>(initialMetadata?.tags || []);
    const [description, setDescription] = useState(initialMetadata?.description || "");
    const [captureDate, setCaptureDate] = useState(initialMetadata?.captureDate || "");
    const [type, setType] = useState<'photo' | 'artwork' | 'screenshot' | 'other'>(initialMetadata?.type || 'photo');

    const handleSave = () => {
        onSave({
            tags,
            description,
            captureDate,
            type,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-card border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ImageIcon size={20} className="text-primary" />
                        画像メタデータ編集
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Preview */}
                <div className="p-6 border-b border-white/10">
                    <div className="aspect-video bg-black/20 rounded-lg overflow-hidden">
                        <img
                            src={`/api/gallery?file=${encodeURIComponent(imagePath)}`}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{imagePath}</p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">種別</label>
                        <div className="flex flex-wrap gap-2">
                            {imageTypeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setType(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${type === option.value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Capture Date */}
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                            <Calendar size={14} />
                            撮影日
                        </label>
                        <input
                            type="date"
                            value={captureDate}
                            onChange={(e) => setCaptureDate(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="この画像についての説明..."
                            className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                            <Tag size={14} />
                            タグ
                        </label>
                        <TagManager
                            tags={tags}
                            onChange={setTags}
                            placeholder="タグを追加..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
                    >
                        <Save size={16} />
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}
