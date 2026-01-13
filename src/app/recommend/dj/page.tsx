"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User as UserIcon, Bot, Music, Play, ArrowLeft, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { analyzeRequest, DJResponse } from "@/lib/recommendation/nlp";
import { usePlayer } from "@/contexts/PlayerContext";
import { Song } from "@/data/songs";

type Message = {
    id: string;
    sender: "user" | "dj";
    text: string;
    playlist?: Song[];
    timestamp: Date;
};

export default function AIDJPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "dj",
            text: "こんにちは！AI DJの Love です。今の気分や、聴きたいシチュエーションを教えてください。「雨の日のドライブ」や「とにかく元気が出る曲」など、なんでもOKです！",
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { playSong } = usePlayer();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        // Simulate thinking time
        setTimeout(() => {
            const result: DJResponse = analyzeRequest(userMsg.text);

            const djMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "dj",
                text: result.comment,
                playlist: result.playlist,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, djMsg]);
            setIsThinking(false);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toTrack = (song: Song) => ({
        name: song.title,
        path: `${song.id}.mp3`,
        type: "audio/mp3",
        category: song.category,
        thumbnail: `/api/album-art/${encodeURIComponent(song.album)}`,
        album: song.album
    });

    const playPlaylist = (songs: Song[]) => {
        if (songs.length > 0) {
            playSong(toTrack(songs[0]), songs.map(toTrack));
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col pt-16">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center gap-4 sticky top-16 z-10 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                        <Terminal size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm md:text-base">AI DJ Console</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[90%] md:max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.sender === "user" ? "bg-white/10" : "bg-primary/20 border border-primary/30"
                                    }`}>
                                    {msg.sender === "user" ? <UserIcon size={16} /> : <Bot size={16} className="text-primary" />}
                                </div>

                                <div className="space-y-2">
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-white/10 text-white rounded-tl-sm border border-white/5"
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {/* Playlist Card */}
                                    {msg.playlist && msg.playlist.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="bg-black/40 border border-white/10 rounded-xl overflow-hidden mt-2"
                                        >
                                            <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                    <Music size={14} />
                                                    <span>Generated Playlist ({msg.playlist.length} songs)</span>
                                                </div>
                                                <button
                                                    onClick={() => playPlaylist(msg.playlist!)}
                                                    className="p-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-full transition-all"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {msg.playlist.map((song) => (
                                                    <div
                                                        key={song.id}
                                                        onClick={() => playSong(toTrack(song))}
                                                        className="p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors group"
                                                    >
                                                        <div className="w-10 h-10 rounded bg-white/5 overflow-hidden shrink-0">
                                                            {song.album && <img src={`/api/album-art/${encodeURIComponent(song.album)}`} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{song.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{song.album}</div>
                                                        </div>
                                                        <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className={`text-[10px] text-muted-foreground opacity-50 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                                <Bot size={16} className="text-primary" />
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-white/10 p-4 pb-8 md:pb-4 z-20">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="どんな曲が聴きたいですか？"
                        className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="p-3 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:hover:bg-primary text-white rounded-full transition-all flex items-center justify-center aspect-square shadow-lg shadow-primary/20"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
