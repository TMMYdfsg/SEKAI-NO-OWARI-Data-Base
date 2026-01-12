"use client";

import { songs as songsData } from "@/data/songs";
import { useState, useMemo, useEffect } from "react";
import { Search, Disc, User, SortAsc, SortDesc, Calendar, Layers, Folder, Play, Edit2, Image as ImageIcon, X, FileText, Settings, Pencil, Youtube, Music, Link as LinkIcon, ExternalLink as ExternalIcon } from "lucide-react";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import SmartPlaylist from "@/components/SmartPlaylist";
import { detectLinkService, buildSearchQuery, serviceConfigs, type ExternalLinkService } from "@/types/external-links";

type SortOption = "az" | "za" | "year_asc" | "year_desc" | "album_az" | "album_za" | "writer" | "composer" | "category" | "filename" | "folder_year_asc" | "folder_year_desc";

// フォルダ名から年を抽出 (例: "(2023) Terminal" or "(2010)FACTORY LIVE")
function extractFolderYear(category: string): number {
    const match = category.match(/\((\d{4})\)/);
    return match ? parseInt(match[1], 10) : 0;
}

type LocalFile = {
    name: string;
    path: string;
    type: string;
    category: string;
    thumbnail: string | null;
};

type MergedSong = {
    id: string;
    title: string;
    album: string;
    year: number | string;
    writer: string;
    composer: string;
    category: string; // File system information
    file: LocalFile;
};

// 曲の詳細情報（ユーザー編集可能）
type SongDetails = {
    writer?: string;      // L: 作詞者
    composer?: string;    // C: 作曲者
    memo?: string;        // メモ
    links?: {
        spotify?: string;
        youtube?: string;
        apple?: string;
    };
};

export default function SongsPage() {
    const [query, setQuery] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("year_desc");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong, playlist } = usePlayer();

    // カスタムカバー画像
    const [customCovers, setCustomCovers] = useState<Record<string, string>>({});
    const [coverEditModal, setCoverEditModal] = useState<{ isOpen: boolean; songId: string; songTitle: string } | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [tempCoverPreview, setTempCoverPreview] = useState<string>("");

    // ディスコグラフィーデータ（カバー画像とリリース年）
    const [discographyCovers, setDiscographyCovers] = useState<Record<string, string>>({});
    const [discographyYears, setDiscographyYears] = useState<Record<string, number>>({});

    // 歌詞データ
    const [songsLyrics, setSongsLyrics] = useState<Record<string, string>>({});
    const [lyricsModal, setLyricsModal] = useState<{ isOpen: boolean; songId: string; songTitle: string } | null>(null);
    const [tempLyrics, setTempLyrics] = useState<string>("");

    // 曲の詳細情報 (ユーザー編集可能なクレジットなど)
    const [songDetails, setSongDetails] = useState<Record<string, SongDetails>>({});
    const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; songId: string; songTitle: string; currentDetails: SongDetails } | null>(null);
    const [tempWriter, setTempWriter] = useState("");
    const [tempComposer, setTempComposer] = useState("");
    const [tempMemo, setTempMemo] = useState("");
    const [tempSpotify, setTempSpotify] = useState("");
    const [tempYoutube, setTempYoutube] = useState("");
    const [tempApple, setTempApple] = useState("");

    const CUSTOM_COVERS_KEY = "sekaowa_song_custom_covers";
    const SONGS_LYRICS_KEY = "sekaowa_songs_lyrics";
    const SONG_DETAILS_KEY = "sekaowa_song_details";

    useEffect(() => {
        fetch('/api/files')
            .then(res => res.json())
            .then(data => {
                setLocalFiles(data.files || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load files", err);
                setLoading(false);
            });

        // LocalStorageからカスタムカバーをロード
        const savedCovers = localStorage.getItem(CUSTOM_COVERS_KEY);
        if (savedCovers) {
            try {
                setCustomCovers(JSON.parse(savedCovers));
            } catch (e) {
                console.error("Failed to load custom covers", e);
            }
        }

        // LocalStorageから歌詞をロード
        const savedLyrics = localStorage.getItem(SONGS_LYRICS_KEY);
        if (savedLyrics) {
            try {
                setSongsLyrics(JSON.parse(savedLyrics));
            } catch (e) {
                console.error("Failed to load lyrics", e);
            }
        }

        // LocalStorageから詳細情報をロード
        const savedDetails = localStorage.getItem(SONG_DETAILS_KEY);
        if (savedDetails) {
            try {
                setSongDetails(JSON.parse(savedDetails));
            } catch (e) {
                console.error("Failed to load song details", e);
            }
        }

        // ディスコグラフィーからリリース年とカバーをロード
        fetch('/api/db/discography')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const covers: Record<string, string> = {};
                    const years: Record<string, number> = {};
                    const coverTypes: Record<string, string> = {};

                    data.forEach((album: any) => {
                        const isSingle = album.type === 'Single';
                        const releaseYear = album.releaseDate ? parseInt(album.releaseDate.substring(0, 4), 10) : 0;

                        album.discs?.forEach((disc: any) => {
                            disc.tracks?.forEach((track: any) => {
                                const titleLower = track.title.toLowerCase();
                                const existingType = coverTypes[titleLower];

                                if (!existingType || (existingType !== 'Single' && isSingle)) {
                                    if (album.coverImage) {
                                        covers[titleLower] = album.coverImage;
                                    }
                                    if (releaseYear > 0) {
                                        years[titleLower] = releaseYear;
                                    }
                                    coverTypes[titleLower] = album.type || 'Album';
                                }
                            });
                        });

                        album.tracks?.forEach((trackTitle: string) => {
                            const titleLower = trackTitle.toLowerCase();
                            const existingType = coverTypes[titleLower];

                            if (!existingType || (existingType !== 'Single' && isSingle)) {
                                if (album.coverImage) {
                                    covers[titleLower] = album.coverImage;
                                }
                                if (releaseYear > 0) {
                                    years[titleLower] = releaseYear;
                                }
                                coverTypes[titleLower] = album.type || 'Album';
                            }
                        });
                    });
                    setDiscographyCovers(covers);
                    setDiscographyYears(years);
                }
            })
            .catch(console.error);
    }, []);

    const mergedSongs = useMemo(() => {
        return localFiles
            .filter(file => file.category === "Original")
            .map(file => {
                const meta = songsData.find(s =>
                    file.name.toLowerCase().includes(s.title.toLowerCase())
                );

                const songId = file.path;
                const title = meta ? meta.title : file.name.replace(/\.[^/.]+$/, "");
                const titleLower = title.toLowerCase();

                const discographyYear = discographyYears[titleLower];
                const metaYear = meta ? meta.year : undefined;
                const year = discographyYear || metaYear || null;

                const details = songDetails[songId];
                const writer = details?.writer || (meta ? meta.writer : "-");
                const composer = details?.composer || (meta ? meta.composer : "-");

                return {
                    id: songId,
                    title: title,
                    album: meta ? meta.album : "Unknown Album",
                    year: year,
                    writer: writer,
                    composer: composer,
                    category: file.category,
                    file: file
                };
            });
    }, [localFiles, discographyYears, songDetails]);

    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>();
        localFiles.forEach(f => cats.add(f.category));
        return Array.from(cats).sort();
    }, [localFiles]);

    const filteredSongs = useMemo(() => {
        return mergedSongs
            .filter(song => {
                const lyrics = songsLyrics[song.id] || "";
                const matchesSearch = song.title.toLowerCase().includes(query.toLowerCase()) ||
                    song.album.toLowerCase().includes(query.toLowerCase()) ||
                    lyrics.toLowerCase().includes(query.toLowerCase());

                let categoryMatch = true;
                if (selectedCategory !== "all") {
                    categoryMatch = song.category === selectedCategory;
                }

                return matchesSearch && categoryMatch;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case "az": return a.title.localeCompare(b.title, 'ja');
                    case "za": return b.title.localeCompare(a.title, 'ja');
                    case "year_asc":
                        if (typeof a.year === 'number' && typeof b.year === 'number') return a.year - b.year;
                        if (typeof a.year === 'number') return -1;
                        if (typeof b.year === 'number') return 1;
                        return 0;
                    case "year_desc":
                        if (typeof a.year === 'number' && typeof b.year === 'number') return b.year - a.year;
                        if (typeof a.year === 'number') return -1;
                        if (typeof b.year === 'number') return 1;
                        return 0;
                    case "album_az": return a.album.localeCompare(b.album, 'ja');
                    case "album_za": return b.album.localeCompare(a.album, 'ja');
                    case "writer": return a.writer.localeCompare(b.writer, 'ja');
                    case "composer": return a.composer.localeCompare(b.composer, 'ja');
                    case "category": return a.category.localeCompare(b.category, 'ja');
                    case "filename": return a.file.name.localeCompare(b.file.name, 'ja');
                    case "folder_year_desc":
                        return extractFolderYear(b.category) - extractFolderYear(a.category);
                    case "folder_year_asc":
                        return extractFolderYear(a.category) - extractFolderYear(b.category);
                    default: return 0;
                }
            });
    }, [mergedSongs, query, sortOption, selectedCategory]);

    const categories = useMemo(() => {
        const mainCats = [
            { id: "all", label: "すべて", year: 0, group: "main" },
        ];
        const hasOriginal = uniqueCategories.includes("Original");
        if (hasOriginal) {
            mainCats.push({ id: "Original", label: "Original", year: 0, group: "main" });
        }
        return mainCats;
    }, [uniqueCategories]);

    const handlePlaySong = (song: MergedSong) => {
        const track: Track = {
            name: song.file.name,
            path: song.file.path,
            type: song.file.type,
            category: song.category,
            thumbnail: song.file.thumbnail,
            album: song.album,
        };
        const trackList: Track[] = filteredSongs.map(s => ({
            name: s.file.name,
            path: s.file.path,
            type: s.file.type,
            category: s.category,
            thumbnail: s.file.thumbnail,
            album: s.album,
        }));
        playSong(track, trackList);
    };

    const handleOpenDetails = (e: React.MouseEvent, songId: string, songTitle: string) => {
        e.stopPropagation();
        const currentDetails = songDetails[songId] || {};
        setDetailsModal({ isOpen: true, songId, songTitle, currentDetails });
        setTempWriter(currentDetails.writer || "");
        setTempComposer(currentDetails.composer || "");
        setTempMemo(currentDetails.memo || "");
        setTempSpotify(currentDetails.links?.spotify || "");
        setTempYoutube(currentDetails.links?.youtube || "");
        setTempApple(currentDetails.links?.apple || "");
    };

    const handleSaveDetails = () => {
        if (detailsModal) {
            const newDetails: SongDetails = {
                writer: tempWriter || undefined,
                composer: tempComposer || undefined,
                memo: tempMemo || undefined,
                links: {
                    spotify: tempSpotify || undefined,
                    youtube: tempYoutube || undefined,
                    apple: tempApple || undefined,
                }
            };
            const updatedSongDetails = { ...songDetails, [detailsModal.songId]: newDetails };
            setSongDetails(updatedSongDetails);
            localStorage.setItem(SONG_DETAILS_KEY, JSON.stringify(updatedSongDetails));
        }
        setDetailsModal(null);
        setTempWriter("");
        setTempComposer("");
        setTempMemo("");
        setTempSpotify("");
        setTempYoutube("");
        setTempApple("");
    };

    const handleClearDetails = () => {
        if (detailsModal) {
            const updatedSongDetails = { ...songDetails };
            delete updatedSongDetails[detailsModal.songId];
            setSongDetails(updatedSongDetails);
            localStorage.setItem(SONG_DETAILS_KEY, JSON.stringify(updatedSongDetails));
        }
        setDetailsModal(null);
        setTempWriter("");
        setTempComposer("");
        setTempMemo("");
        setTempSpotify("");
        setTempYoutube("");
        setTempApple("");
    };

    const getCoverImage = (song: MergedSong): string | null => {
        if (customCovers[song.id]) return customCovers[song.id];
        const titleLower = song.title.toLowerCase();
        if (discographyCovers[titleLower]) return discographyCovers[titleLower];
        if (song.file.thumbnail) return `/api/media?file=${encodeURIComponent(song.file.thumbnail)}`;
        return null;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading local library...</div>;
    }

    return (
        <>
            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
                <div className="max-w-6xl mx-auto">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-bold font-serif text-primary drop-shadow-lg mb-4">
                            Local Library
                        </h1>
                        <p className="text-muted-foreground">
                            {localFiles.length} tracks found on device
                        </p>
                    </header>

                    <SmartPlaylist
                        localFiles={localFiles.map(f => ({
                            name: f.name,
                            path: f.path,
                            type: f.type,
                            category: f.category,
                            thumbnail: f.thumbnail,
                        }))}
                        onPlayPlaylist={(tracks, startIndex) => {
                            if (tracks.length > 0) {
                                const trackList: Track[] = tracks.map(t => ({
                                    name: t.name,
                                    path: t.path,
                                    type: t.type,
                                    category: t.category,
                                    thumbnail: t.thumbnail,
                                }));
                                playSong(trackList[startIndex || 0], trackList);
                            }
                        }}
                    />

                    <div className="max-w-4xl mx-auto mb-12 space-y-4">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search local library..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2 justify-center items-center">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "bg-white/10 text-muted-foreground hover:text-white hover:bg-white/20"
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center md:justify-end items-center gap-2">
                                <span className="text-xs text-muted-foreground">並び替え:</span>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary focus:outline-none cursor-pointer"
                                >
                                    <optgroup label="タイトル">
                                        <option value="az">タイトル A-Z</option>
                                        <option value="za">タイトル Z-A</option>
                                    </optgroup>
                                    <optgroup label="リリース年">
                                        <option value="year_desc">リリース年 (新しい順)</option>
                                        <option value="year_asc">リリース年 (古い順)</option>
                                    </optgroup>
                                    <optgroup label="フォルダ年">
                                        <option value="folder_year_desc">フォルダ年 (新しい順)</option>
                                        <option value="folder_year_asc">フォルダ年 (古い順)</option>
                                    </optgroup>
                                    <optgroup label="アルバム">
                                        <option value="album_az">アルバム A-Z</option>
                                        <option value="album_za">アルバム Z-A</option>
                                    </optgroup>
                                    <optgroup label="クレジット">
                                        <option value="writer">作詞者順</option>
                                        <option value="composer">作曲者順</option>
                                    </optgroup>
                                    <optgroup label="その他">
                                        <option value="category">カテゴリー順</option>
                                        <option value="filename">ファイル名順</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSongs.map((song) => {
                            const details = songDetails[song.id] || {};
                            const links = details.links || {};

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handlePlaySong(song)}
                                    className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group shadow-lg text-left w-full cursor-pointer"
                                >
                                    <div className="p-4 bg-black/20 flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-lg bg-white/10 overflow-hidden shrink-0 relative group-hover:ring-2 ring-primary transition-all">
                                            {getCoverImage(song) ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${getCoverImage(song)})` }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Disc size={24} className="text-white/30" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold font-serif text-white/90 group-hover:text-primary transition-colors truncate">
                                                {song.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate">{song.album}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleOpenDetails(e, song.id, song.title)}
                                            className="ml-auto p-3 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-xl transition-all shrink-0 group/edit"
                                            title="詳細を編集"
                                        >
                                            <Pencil size={20} className="text-white/50 group-hover/edit:text-primary transition-colors" />
                                        </button>
                                    </div>

                                    <div className="p-4 pt-3 relative">
                                        <div className="absolute top-3 right-4 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${song.year ? 'border-green-500/30 text-green-300 bg-green-500/10' : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                                                }`}>
                                                {song.year ? song.year : "未設定"}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${song.category === 'Original' ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' :
                                                'border-amber-500/30 text-amber-300 bg-amber-500/10'
                                                }`}>
                                                {song.category}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/80 font-mono">
                                            <User size={12} className="text-primary/70 shrink-0" />
                                            <span className="truncate">L: {song.writer} / C: {song.composer}</span>
                                        </div>

                                        {/* External Service Links */}
                                        <div className="flex gap-2 mt-3">
                                            {/* Spotify */}
                                            {links.spotify ? (
                                                <a
                                                    href={links.spotify.startsWith('http') ? links.spotify : `https://open.spotify.com/track/${links.spotify}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 rounded-lg hover:bg-[#1DB954]/40 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Listen on Spotify"
                                                >
                                                    <Music size={14} />
                                                </a>
                                            ) : (
                                                <a
                                                    href={serviceConfigs.spotify.searchUrlTemplate(buildSearchQuery({ title: song.title, artist: "SEKAI NO OWARI" }))}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-white/5 text-white/30 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Search on Spotify"
                                                >
                                                    <Music size={14} />
                                                </a>
                                            )}

                                            {/* YouTube */}
                                            {links.youtube ? (
                                                <a
                                                    href={links.youtube.startsWith('http') ? links.youtube : `https://www.youtube.com/watch?v=${links.youtube}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30 rounded-lg hover:bg-[#FF0000]/40 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Watch on YouTube"
                                                >
                                                    <Youtube size={14} />
                                                </a>
                                            ) : (
                                                <a
                                                    href={serviceConfigs.youtube.searchUrlTemplate(buildSearchQuery({ title: song.title, artist: "SEKAI NO OWARI" }))}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-white/5 text-white/30 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Search on YouTube"
                                                >
                                                    <Youtube size={14} />
                                                </a>
                                            )}

                                            {/* Apple Music */}
                                            {links.apple ? (
                                                <a
                                                    href={links.apple}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-[#FA243C]/20 text-[#FA243C] border border-[#FA243C]/30 rounded-lg hover:bg-[#FA243C]/40 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Listen on Apple Music"
                                                >
                                                    <Music size={14} className="scale-x-[-1]" />
                                                </a>
                                            ) : (
                                                <a
                                                    href={serviceConfigs.apple_music.searchUrlTemplate(buildSearchQuery({ title: song.title, artist: "SEKAI NO OWARI" }))}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-white/5 text-white/30 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Search on Apple Music"
                                                >
                                                    <Music size={14} className="scale-x-[-1]" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredSongs.length === 0 && (
                            <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                <Layers size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No local media files found matching your criteria.</p>
                                <p className="text-xs opacity-50 mt-2">Add files to programs/media/...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Song Details Edit Modal */}
                {detailsModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => { setDetailsModal(null); }}>
                        <div
                            className="bg-card border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6 shrink-0">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Pencil size={20} className="text-primary" />
                                    詳細情報を編集
                                </h3>
                                <button
                                    onClick={() => { setDetailsModal(null); }}
                                    className="p-1 text-muted-foreground hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 truncate shrink-0">{detailsModal.songTitle}</p>

                            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-4">
                                {/* Cover Image Section */}
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                        <ImageIcon size={12} />
                                        カバー画像
                                    </label>
                                    <div
                                        className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer ${isDraggingOver ? 'border-primary bg-primary/20 scale-[1.02]' : 'border-white/20 bg-white/5 hover:border-white/40'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDraggingOver(false);
                                            const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
                                            if (textData) {
                                                let cleanPath = textData.replace('file:///', '').replace('file://', '');
                                                cleanPath = decodeURIComponent(cleanPath);
                                                if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanPath)) {
                                                    const newCovers = { ...customCovers, [detailsModal.songId]: cleanPath };
                                                    setCustomCovers(newCovers);
                                                    localStorage.setItem(CUSTOM_COVERS_KEY, JSON.stringify(newCovers));
                                                    return;
                                                }
                                            }
                                            const files = e.dataTransfer.files;
                                            if (files.length > 0 && files[0].type.startsWith('image/')) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    if (event.target?.result) {
                                                        const newCovers = { ...customCovers, [detailsModal.songId]: event.target.result as string };
                                                        setCustomCovers(newCovers);
                                                        localStorage.setItem(CUSTOM_COVERS_KEY, JSON.stringify(newCovers));
                                                    }
                                                };
                                                reader.readAsDataURL(files[0]);
                                            }
                                        }}
                                    >
                                        {customCovers[detailsModal.songId] ? (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${customCovers[detailsModal.songId]})` }}
                                            />
                                        ) : null}
                                        <div className="relative z-10 text-center p-4">
                                            <ImageIcon size={24} className={`mx-auto mb-2 ${isDraggingOver ? 'text-primary animate-bounce' : 'text-white/30'}`} />
                                            <p className="text-xs text-muted-foreground">
                                                画像をドラッグ＆ドロップ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* External Links Section */}
                                <div className="space-y-4 pt-2 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-primary/80 uppercase tracking-wider flex items-center gap-2">
                                        <ExternalIcon size={12} />
                                        外部リンク
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1.5">
                                                <Music size={10} className="text-[#1DB954]" />
                                                Spotify URL / ID
                                            </label>
                                            <input
                                                type="text"
                                                value={tempSpotify}
                                                onChange={(e) => setTempSpotify(e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none transition-all"
                                                placeholder="https://open.spotify.com/track/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1.5">
                                                <Youtube size={10} className="text-[#FF0000]" />
                                                YouTube URL / ID
                                            </label>
                                            <input
                                                type="text"
                                                value={tempYoutube}
                                                onChange={(e) => setTempYoutube(e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none transition-all"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1.5">
                                                <Music size={10} className="text-[#FA243C] scale-x-[-1]" />
                                                Apple Music URL
                                            </label>
                                            <input
                                                type="text"
                                                value={tempApple}
                                                onChange={(e) => setTempApple(e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none transition-all"
                                                placeholder="https://music.apple.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Credits Section */}
                                <div className="space-y-4 pt-2 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-primary/80 uppercase tracking-wider">クレジット</h4>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-2">L: 作詞者</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {["Fukase", "Nakajin", "Saori", "DJ LOVE"].map((member) => {
                                                const isSelected = tempWriter.toLowerCase().includes(member.toLowerCase());
                                                return (
                                                    <button
                                                        key={member}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                const parts = tempWriter.split(/[,、・]+/).map(s => s.trim()).filter(s => s.toLowerCase() !== member.toLowerCase());
                                                                setTempWriter(parts.join(", "));
                                                            } else {
                                                                const current = tempWriter.trim();
                                                                setTempWriter(current ? `${current}, ${member}` : member);
                                                            }
                                                        }}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-all ${isSelected
                                                            ? "bg-primary/20 border-primary text-primary"
                                                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {member}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <input
                                            type="text"
                                            value={tempWriter}
                                            onChange={(e) => setTempWriter(e.target.value)}
                                            placeholder="その他（自由入力）"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-2">C: 作曲者</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {["Fukase", "Nakajin", "Saori", "DJ LOVE"].map((member) => {
                                                const isSelected = tempComposer.toLowerCase().includes(member.toLowerCase());
                                                return (
                                                    <button
                                                        key={member}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                const parts = tempComposer.split(/[,、・]+/).map(s => s.trim()).filter(s => s.toLowerCase() !== member.toLowerCase());
                                                                setTempComposer(parts.join(", "));
                                                            } else {
                                                                const current = tempComposer.trim();
                                                                setTempComposer(current ? `${current}, ${member}` : member);
                                                            }
                                                        }}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-all ${isSelected
                                                            ? "bg-primary/20 border-primary text-primary"
                                                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {member}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <input
                                            type="text"
                                            value={tempComposer}
                                            onChange={(e) => setTempComposer(e.target.value)}
                                            placeholder="その他（自由入力）"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Memo Section */}
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">メモ</label>
                                    <textarea
                                        value={tempMemo}
                                        onChange={(e) => setTempMemo(e.target.value)}
                                        placeholder="ノート、コメントなど..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none resize-none"
                                    />
                                </div>

                                {/* Lyrics Section */}
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-2">
                                        <FileText size={12} />
                                        歌詞
                                    </label>
                                    <textarea
                                        value={songsLyrics[detailsModal.songId] || ""}
                                        onChange={(e) => {
                                            const newLyrics = { ...songsLyrics, [detailsModal.songId]: e.target.value };
                                            setSongsLyrics(newLyrics);
                                            localStorage.setItem(SONGS_LYRICS_KEY, JSON.stringify(newLyrics));
                                        }}
                                        placeholder="歌詞を入力..."
                                        rows={5}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none font-mono leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 shrink-0">
                                <button
                                    onClick={handleClearDetails}
                                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    リセット
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setDetailsModal(null); }}
                                        className="px-4 py-2 text-sm text-neutral-400 hover:text-white bg-white/10 rounded-lg transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleSaveDetails}
                                        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 shadow-lg shadow-primary/20 transition-colors"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
