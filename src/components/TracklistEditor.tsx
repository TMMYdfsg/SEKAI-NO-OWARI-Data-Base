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
import { Plus, GripVertical, Trash2, Music, Star } from "lucide-react";
import { TrackInfo } from "@/types/discography";

// Sortable Track Item Component
function SortableTrackItem({
    track,
    onRemove,
    onUpdate,
    suggestions = []
}: {
    track: TrackInfo;
    onRemove: () => void;
    onUpdate: (updates: Partial<TrackInfo>) => void;
    suggestions?: string[];
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

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

            {/* Track Number */}
            <span className="text-white/30 text-sm font-mono w-8 text-center">
                {track.trackNumber}
            </span>

            {/* Title Input */}
            <div className="flex-1">
                <input
                    type="text"
                    value={track.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="曲名を入力..."
                    list="track-suggestions"
                    className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* Version Note */}
            <div className="flex-1">
                <input
                    type="text"
                    value={track.versionNote || ''}
                    onChange={(e) => onUpdate({ versionNote: e.target.value })}
                    placeholder="バージョンメモ (オプション)"
                    className="w-full bg-transparent border-none focus:ring-0 text-muted-foreground text-sm placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Bonus Track Toggle */}
            <button
                onClick={() => onUpdate({ isBonus: !track.isBonus })}
                className={`p-2 rounded transition-colors ${track.isBonus ? "text-yellow-400" : "text-white/20 hover:text-white/50"
                    }`}
                title={track.isBonus ? "ボーナストラック" : "通常トラック"}
            >
                <Star size={16} />
            </button>

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

interface TracklistEditorProps {
    tracks: TrackInfo[];
    onChange: (newTracks: TrackInfo[]) => void;
    suggestions?: string[];
}

export default function TracklistEditor({ tracks, onChange, suggestions = [] }: TracklistEditorProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tracks.findIndex((track) => track.id === active.id);
            const newIndex = tracks.findIndex((track) => track.id === over.id);

            const newTracks = arrayMove(tracks, oldIndex, newIndex);
            // Update track numbers
            onChange(newTracks.map((track, index) => ({ ...track, trackNumber: index + 1 })));
        }
    };

    const addTrack = () => {
        const newTrack: TrackInfo = {
            id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            trackNumber: tracks.length + 1,
            title: '',
            isBonus: false,
        };
        onChange([...tracks, newTrack]);
    };

    const removeTrack = (id: string) => {
        const newTracks = tracks.filter(track => track.id !== id);
        // Renumber tracks
        onChange(newTracks.map((track, index) => ({ ...track, trackNumber: index + 1 })));
    };

    const updateTrack = (id: string, updates: Partial<TrackInfo>) => {
        onChange(tracks.map(track =>
            track.id === id ? { ...track, ...updates } : track
        ));
    };

    return (
        <div className="space-y-4">
            {suggestions.length > 0 && (
                <datalist id="track-suggestions">
                    {suggestions.map((s) => (
                        <option key={s} value={s} />
                    ))}
                </datalist>
            )}

            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Music size={18} className="text-primary" />
                    トラックリスト編集
                </h3>
                <span className="text-sm text-muted-foreground">
                    {tracks.length} tracks
                </span>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tracks.map(track => track.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-1">
                        {tracks.map((track) => (
                            <SortableTrackItem
                                key={track.id}
                                track={track}
                                onRemove={() => removeTrack(track.id)}
                                onUpdate={(updates) => updateTrack(track.id, updates)}
                                suggestions={suggestions}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Track Button */}
            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={addTrack}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm w-full justify-center"
                >
                    <Plus size={16} />
                    <Music size={16} />
                    トラックを追加
                </button>
            </div>
        </div>
    );
}
