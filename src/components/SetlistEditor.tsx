"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, Mic2, Music, Sparkles, Volume2 } from "lucide-react";
import { SetlistItem } from "@/types/history";

// Sortable Item Component
function SortableItem({
    item,
    index,
    onRemove,
    onUpdate
}: {
    item: SetlistItem;
    index: number;
    onRemove: () => void;
    onUpdate: (updates: Partial<SetlistItem>) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    const getTypeIcon = (type: SetlistItem['type']) => {
        switch (type) {
            case 'song': return <Music size={16} className="text-blue-400" />;
            case 'mc': return <Mic2 size={16} className="text-green-400" />;
            case 'se': return <Volume2 size={16} className="text-gray-400" />;
            case 'encore': return <Sparkles size={16} className="text-pink-400" />;
            default: return <Music size={16} />;
        }
    };

    if (item.type === 'encore') {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                className="my-4 flex items-center gap-4 group"
            >
                <div {...listeners} className="cursor-grab hover:text-white transition-colors text-white/30">
                    <GripVertical size={20} />
                </div>
                <div className="flex-1 border-t border-pink-500/50 flex items-center justify-center relative">
                    <span className="absolute bg-background px-4 text-pink-400 text-sm font-bold flex items-center gap-1">
                        <Sparkles size={14} />
                        Encore
                    </span>
                </div>
                <button
                    onClick={onRemove}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 bg-card/50 border border-white/5 rounded-lg p-3 mb-2 group hover:border-white/20 transition-colors"
        >
            {/* Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
                <GripVertical size={20} />
            </div>

            {/* Index */}
            <span className="text-white/30 text-sm font-mono w-6 text-center">
                {item.type === 'song' ? index + 1 : '-'}
            </span>

            {/* Type Icon */}
            <div className="flex-shrink-0" title={item.type.toUpperCase()}>
                {getTypeIcon(item.type)}
            </div>

            {/* Inputs */}
            <div className="flex-1 flex gap-2">
                {item.type === 'song' ? (
                    <input
                        type="text"
                        value={item.songTitle || ''}
                        onChange={(e) => onUpdate({ songTitle: e.target.value })}
                        placeholder="曲名を入力..."
                        list="song-suggestions"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
                    />
                ) : (
                    <input
                        type="text"
                        value={item.text || ''}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        placeholder={item.type === 'mc' ? "MCの内容..." : "SEのタイトル..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-muted-foreground placeholder:text-muted-foreground/50 text-sm italic"
                    />
                )}
            </div>

            {/* Delete */}
            <button
                onClick={onRemove}
                className="p-2 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

interface SetlistEditorProps {
    setlist: SetlistItem[];
    onChange: (newSetlist: SetlistItem[]) => void;
    suggestions?: string[];
}

export default function SetlistEditor({ setlist, onChange, suggestions = [] }: SetlistEditorProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = setlist.findIndex((item) => item.id === active.id);
            const newIndex = setlist.findIndex((item) => item.id === over.id);

            const newSetlist = arrayMove(setlist, oldIndex, newIndex);
            // orderupdate
            onChange(newSetlist.map((item, index) => ({ ...item, order: index + 1 })));
        }
    };

    const addItem = (type: SetlistItem['type']) => {
        const newItem: SetlistItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            order: setlist.length + 1,
            songTitle: type === 'song' ? '' : undefined,
            text: type === 'mc' || type === 'se' ? '' : undefined,
        };
        onChange([...setlist, newItem]);
    };

    const removeItem = (id: string) => {
        onChange(setlist.filter(item => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<SetlistItem>) => {
        onChange(setlist.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    // Calculate song numbers (excluding MC, SE, Encore) for display
    let songCount = 0;
    const itemsWithDisplayIndex = setlist.map(item => {
        if (item.type === 'song') {
            songCount++;
            return { ...item, displayIndex: songCount };
        }
        return { ...item, displayIndex: 0 };
    });

    return (
        <div className="space-y-4">
            {suggestions.length > 0 && (
                <datalist id="song-suggestions">
                    {suggestions.map((s) => (
                        <option key={s} value={s} />
                    ))}
                </datalist>
            )}

            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Music size={18} className="text-primary" />
                    セットリスト編集
                </h3>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={setlist.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-1">
                        {itemsWithDisplayIndex.map((item) => (
                            <SortableItem
                                key={item.id}
                                item={item}
                                index={item.displayIndex - 1} // 0-indexed for display calculation logic within component
                                onRemove={() => removeItem(item.id)}
                                onUpdate={(updates) => updateItem(item.id, updates)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                    onClick={() => addItem('song')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                    <Plus size={14} />
                    <Music size={14} />
                    曲を追加
                </button>
                <button
                    onClick={() => addItem('mc')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                >
                    <Plus size={14} />
                    <Mic2 size={14} />
                    MC
                </button>
                <button
                    onClick={() => addItem('se')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                >
                    <Plus size={14} />
                    <Volume2 size={14} />
                    SE
                </button>
                <button
                    onClick={() => addItem('encore')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors text-sm"
                >
                    <Plus size={14} />
                    <Sparkles size={14} />
                    アンコール
                </button>
            </div>
        </div>
    );
}
