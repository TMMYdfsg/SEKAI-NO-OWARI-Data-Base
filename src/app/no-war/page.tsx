"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Heart, Music2, Edit2, Play } from "lucide-react";
import Link from "next/link";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import { toggleFavorite, isFavorite } from "@/lib/local-storage-data";
import { ConfirmModal } from "@/components/ConfirmModal";

// Types
interface Fragment {
    id: string;
    text: string;
    createdAt: string;
}

const STORAGE_KEY_FRAGMENTS = "sekaowa_nowar_fragments";

const TRACKLIST = [
    { title: "虹色の戦争", id: "s-1-niji" },
    { title: "世界平和", id: "s-2-sekai" },
    { title: "Never Ending World", id: "s-3-never" },
    { title: "生物学的幻想曲", id: "s-4-seibutsu" },
    { title: "illusion", id: "s-5-illusion" },
    { title: "Love the warz", id: "s-6-lovewarz" },
];

export default function NoWarRoom() {
    const [fragments, setFragments] = useState<Fragment[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [localFiles, setLocalFiles] = useState<any[]>([]);
    const [favs, setFavs] = useState<Set<string>>(new Set());

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; targetId: string | null }>({
        isOpen: false,
        targetId: null,
    });

    const { playSong } = usePlayer();

    useEffect(() => {
        // Load Fragments
        const saved = localStorage.getItem(STORAGE_KEY_FRAGMENTS);
        if (saved) {
            setFragments(JSON.parse(saved));
        } else {
            setFragments([
                { id: "1", text: "争いはなくならない。", createdAt: new Date().toISOString() },
                { id: "2", text: "平和とは何だろうか。", createdAt: new Date().toISOString() },
            ]);
        }
        setIsLoading(false);

        // Load Files for playback
        fetch('/api/files')
            .then(res => res.json())
            .then(data => setLocalFiles(data.files || []))
            .catch(e => console.error(e));

        // Init Favs
        const currentFavs = new Set<string>();
        TRACKLIST.forEach(t => {
            if (isFavorite(t.title)) currentFavs.add(t.title);
        });
        setFavs(currentFavs);
    }, []);

    const saveFragments = (newFragments: Fragment[]) => {
        setFragments(newFragments);
        localStorage.setItem(STORAGE_KEY_FRAGMENTS, JSON.stringify(newFragments));
    };

    const handleAddFragment = () => {
        const newFragment: Fragment = {
            id: Date.now().toString(),
            text: "新しい断章...",
            createdAt: new Date().toISOString(),
        };
        saveFragments([newFragment, ...fragments]);
        setEditingId(newFragment.id);
        setEditText(newFragment.text);
    };

    const handleUpdateFragment = (id: string) => {
        const newFragments = fragments.map(f =>
            f.id === id ? { ...f, text: editText } : f
        );
        saveFragments(newFragments);
        setEditingId(null);
    };

    const handleDeleteFragment = (id: string) => {
        setDeleteModal({ isOpen: true, targetId: id });
    };

    const confirmDelete = () => {
        if (deleteModal.targetId) {
            saveFragments(fragments.filter(f => f.id !== deleteModal.targetId));
        }
        setDeleteModal({ isOpen: false, targetId: null });
    };

    const cancelDelete = () => {
        setDeleteModal({ isOpen: false, targetId: null });
    };

    const handlePlayTrack = (title: string) => {
        // Find file
        const file = localFiles.find(f => f.name.toLowerCase().includes(title.toLowerCase()));
        if (file) {
            const track: Track = {
                name: file.name,
                path: file.path,
                type: file.type,
                category: file.category,
                thumbnail: file.thumbnail,
                album: "NO WAR ROOM", // Virtual album context
            };
            playSong(track);
        } else {
            alert(`再生可能なファイルが見つかりません: ${title}`);
        }
    };

    const handleToggleFav = (title: string) => {
        const newState = toggleFavorite(title);
        setFavs(prev => {
            const next = new Set(prev);
            if (newState) next.add(title);
            else next.delete(title);
            return next;
        });
    };

    if (isLoading) return null;

    return (
        <>
            <div className="min-h-screen bg-neutral-900 text-neutral-300 font-serif selection:bg-red-900 selection:text-white pb-32">
                {/* Header */}
                <header className="fixed top-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-neutral-900 to-transparent z-40">
                    <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors">
                        <ArrowLeft />
                        <span className="tracking-widest text-sm">EXIT TO REALITY</span>
                    </Link>
                    <div className="text-red-900/50 font-bold tracking-[0.5em] text-xs">NO WAR ROOM</div>
                </header>

                <main className="container mx-auto px-4 py-24 max-w-5xl">

                    {/* Title Section */}
                    <div className="mb-24 text-center">
                        <h1 className="text-5xl md:text-7xl font-light text-neutral-100 mb-6 tracking-wider">
                            NO WAR
                        </h1>
                        <p className="text-neutral-500 text-sm tracking-widest leading-loose max-w-lg mx-auto">
                            戦うことの虚しさ。平和への祈り。<br />
                            終わりのない問い。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 md:gap-24">
                        {/* Left: Tracklist */}
                        <section className="space-y-12">
                            <div className="flex items-center gap-4 text-neutral-500 border-b border-neutral-800 pb-2">
                                <Music2 size={16} />
                                <h2 className="text-xs tracking-widest">REQUIEM TRACKS</h2>
                            </div>
                            <div className="space-y-6">
                                {TRACKLIST.map((track, idx) => {
                                    const isFav = favs.has(track.title);
                                    return (
                                        <div key={track.id} className="group relative pl-8 border-l border-neutral-800 hover:border-red-900/50 transition-colors duration-500">
                                            <span className="absolute -left-[5px] top-0 text-[10px] text-neutral-700 font-mono">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                            <h3
                                                onClick={() => handlePlayTrack(track.title)}
                                                className="text-2xl font-light text-neutral-300 group-hover:text-red-100 transition-colors cursor-pointer flex items-center gap-4"
                                            >
                                                {track.title}
                                                <Play size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-700" />
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <button
                                                    onClick={() => handlePlayTrack(track.title)}
                                                    className="text-xs text-neutral-500 hover:text-white"
                                                >
                                                    再生
                                                </button>
                                                <button className="text-xs text-neutral-500 hover:text-white">Spotify</button>
                                                <button
                                                    onClick={() => handleToggleFav(track.title)}
                                                    className={`text-xs hover:text-red-500 transition-colors ${isFav ? "text-red-600" : "text-neutral-500"}`}
                                                >
                                                    <Heart size={12} fill={isFav ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Right: Fragments */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-2">
                                <div className="flex items-center gap-4">
                                    <Edit2 size={16} />
                                    <h2 className="text-xs tracking-widest">FRAGMENTS of MEMORY</h2>
                                </div>
                                <button onClick={handleAddFragment} className="hover:text-white transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {fragments.map((frag) => (
                                    <div key={frag.id} className="bg-neutral-800/30 p-6 rounded-sm border border-neutral-800 backdrop-blur-sm">
                                        {editingId === frag.id ? (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full bg-black/20 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-red-900/50 min-h-[100px] resize-none"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateFragment(frag.id)}
                                                        className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group relative">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-400">
                                                    {frag.text}
                                                </p>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <span className="text-[10px] text-neutral-700 font-mono">
                                                        {new Date(frag.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(frag.id);
                                                                setEditText(frag.text);
                                                            }}
                                                            className="text-neutral-500 hover:text-white"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFragment(frag.id)}
                                                            className="text-neutral-500 hover:text-red-500"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="断章の削除"
                message="この断章を消去しますか？この操作は取り消せません。"
                confirmText="削除"
                cancelText="キャンセル"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
}
