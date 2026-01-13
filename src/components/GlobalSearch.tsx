"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, Music, Disc, Calendar, User, Film, ChevronRight } from 'lucide-react';
import { useGlobalSearch, SearchResultItem } from '@/hooks/useGlobalSearch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRecentlyPlayed } from '@/lib/play-history'; // Import history helper

type GlobalSearchProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [recentItems, setRecentItems] = useState<SearchResultItem[]>([]); // State for recent items
    const inputRef = useRef<HTMLInputElement>(null);
    const { search } = useGlobalSearch();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Slight delay to ensure render
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';

            // Load recent items
            const history = getRecentlyPlayed(5);
            const items: SearchResultItem[] = history.map(h => ({
                id: h.songId,
                type: h.source?.type === 'discography' ? 'ALBUM' : 'SONG', // Map type roughly
                title: h.songName,
                subtitle: 'Recently Played',
                url: h.source?.type === 'discography' ? `/discography/${h.source.sourceId}` : `/songs?play=${encodeURIComponent(h.songId)}`,
                icon: undefined
            }));
            setRecentItems(items);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const hits = search(query);
        setResults(hits);
    }, [query, search]);

    const handleSelect = (url: string) => {
        router.push(url);
        onClose();
    };

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'SONG': return <Music size={16} />;
            case 'ALBUM': return <Disc size={16} />;
            case 'HISTORY': return <Calendar size={16} />;
            case 'MEMBER': return <User size={16} />;
            case 'VIDEO': return <Film size={16} />;
            default: return <Search size={16} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-black/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Search Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
                    <Search className="text-muted-foreground" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-muted-foreground"
                        placeholder="Search songs, albums, history..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') onClose();
                        }}
                    />
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {query === '' ? (
                        recentItems.length > 0 ? (
                            <div className="space-y-1">
                                <h3 className="text-xs text-muted-foreground px-3 py-2 font-medium">Recently Played</h3>
                                {recentItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.url}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/20 hover:text-white group transition-colors cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                                            <span className="text-white/60 group-hover:text-primary transition-colors">
                                                <Music size={16} />
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate group-hover:text-primary-foreground">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {item.subtitle}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                                <Search size={48} className="mb-4" />
                                <p>Type to search...</p>
                            </div>
                        )
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/20 hover:text-white group transition-colors cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                                        {item.icon ? (
                                            <img src={item.icon} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white/60 group-hover:text-primary transition-colors">
                                                {getIcon(item.type)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate group-hover:text-primary-foreground">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[10px] mr-2 uppercase tracking-wider border border-white/5">
                                                {item.type}
                                            </span>
                                            {item.subtitle}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-white/10 bg-white/5 text-[10px] text-muted-foreground flex justify-end gap-4 px-4">
                    <span><kbd className="bg-white/10 px-1 rounded">↑</kbd> <kbd className="bg-white/10 px-1 rounded">↓</kbd> to navigate</span>
                    <span><kbd className="bg-white/10 px-1 rounded">Enter</kbd> to select</span>
                    <span><kbd className="bg-white/10 px-1 rounded">Esc</kbd> to close</span>
                </div>
            </div>
        </div>
    );
}
