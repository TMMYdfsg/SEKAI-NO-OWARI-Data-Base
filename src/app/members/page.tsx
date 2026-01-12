"use client";

import { useState, useEffect } from "react";
import { getMemberImage as getLocalStorageMemberImage, getProfileEdits, updateProfile, unlockAchievement } from "@/lib/local-storage-data";
import { members as defaultMembers, Member } from "@/data/members";
import { Mic, Music, Key, Headphones, Edit2, X, Image as ImageIcon, Upload, Save, Trash2 } from "lucide-react";
import MemberCustomizer from "@/components/MemberCustomizer";

const instrumentIcons: Record<string, any> = {
    "Vocal": Mic,
    "Guitar": Music,
    "Piano": Key,
    "DJ Controller": Headphones,
};

const CUSTOM_IMAGES_KEY = "sekaowa_member_custom_images";

export default function MembersPage() {
    const [customImages, setCustomImages] = useState<Record<string, string>>({});
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [tempPreview, setTempPreview] = useState("");
    const [showCustomizer, setShowCustomizer] = useState(false);

    // Load custom images from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(CUSTOM_IMAGES_KEY);
        if (saved) {
            try {
                setCustomImages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load custom member images", e);
            }
        }
    }, []);

    const getMemberImage = (member: Member): string => {
        return customImages[member.id] || member.image;
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
                setTempPreview(cleanPath);
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
                        setTempPreview(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSaveImage = (imgData: string) => {
        if (!editingMember) return;

        // Save to local state
        setCustomImages(prev => ({
            ...prev,
            [editingMember]: imgData
        }));

        // Persist to local storage
        updateProfile(editingMember, { customImage: imgData });

        // Unlock Achievement
        unlockAchievement(108);

        // Close
        setEditingMember(null);
        setTempPreview("");
        setShowCustomizer(false);
    };

    const handleRemoveImage = () => {
        if (editingMember) {
            const newImages = { ...customImages };
            delete newImages[editingMember];
            setCustomImages(newImages);
            localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(newImages));
        }
        setEditingMember(null);
        setTempPreview("");
    };

    const openEditor = (memberId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingMember(memberId);
        setTempPreview(customImages[memberId] || "");
    };

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold font-serif text-center mb-16 text-primary drop-shadow-lg">
                    Members
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {defaultMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 group flex flex-col md:flex-row"
                        >
                            <div
                                className="w-full md:w-2/5 h-64 md:h-auto bg-cover bg-center transition-transform duration-700 group-hover:scale-105 relative"
                                style={{
                                    backgroundColor: getMemberImage(member) ? 'transparent' : member.color,
                                    backgroundImage: getMemberImage(member) ? `url(${getMemberImage(member)})` : undefined,
                                }}
                            >
                                {!getMemberImage(member) && (
                                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-white/50">
                                        {member.name[0]}
                                    </div>
                                )}
                                {/* Edit Button */}
                                <button
                                    onClick={(e) => openEditor(member.id, e)}
                                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    title="プロフィール画像を編集"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <div className="p-8 md:w-3/5 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-3xl font-bold font-serif tracking-wide">{member.name}</h2>
                                    <div className="h-3 w-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: member.color }}></div>
                                </div>

                                <h3 className="text-primary/80 font-medium mb-4 tracking-wider uppercase text-sm">{member.role}</h3>

                                <p className="text-muted-foreground leading-relaxed mb-6 font-light">
                                    {member.bio}
                                </p>

                                <div className="mt-auto">
                                    <h4 className="text-xs text-white/40 uppercase tracking-widest mb-2">Instruments</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {member.instruments.map((inst) => (
                                            <span
                                                key={inst}
                                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1.5"
                                            >
                                                {/* Fallback to generic music icon if specific missing */}
                                                {instrumentIcons[inst] ? null : <Music size={10} />}
                                                {inst}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Edit Modal */}
            {/* Edit Modal (Drag & Drop or Customizer) */}
            {editingMember && !showCustomizer && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        className={`bg-card w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl transition-all ${isDraggingOver ? 'scale-105 border-primary ring-2 ring-primary/30' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-serif">
                                Customize {defaultMembers.find(m => m.id === editingMember)?.name}
                            </h3>
                            <button onClick={() => { setEditingMember(null); setTempPreview(""); }} className="text-muted-foreground hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6 aspect-square rounded-xl overflow-hidden bg-black/20 border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative group">
                            {tempPreview ? (
                                <img src={tempPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-8">
                                    <Upload size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground font-medium">Drag & Drop Image Here</p>
                                    <p className="text-xs text-muted-foreground/60 mt-2">or paste URL</p>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowCustomizer(true)}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Advanced Editor
                                </button>
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

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                onClick={handleRemoveImage}
                                className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Reset
                            </button>
                            <button
                                onClick={handleSaveImage}
                                disabled={!tempPreview}
                                className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Customizer */}
            {showCustomizer && editingMember && (
                <MemberCustomizer
                    memberId={editingMember}
                    memberName={defaultMembers.find(m => m.id === editingMember)?.name || ""}
                    initialImage={customImages[editingMember] || defaultMembers.find(m => m.id === editingMember)?.image || ""}
                    onSave={handleSaveImage}
                    onClose={() => setShowCustomizer(false)}
                />
            )}
        </div>
    );
}
