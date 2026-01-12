"use client";

import { useState } from "react";
import {
    ExternalLink as ExternalLinkIcon,
    Plus, X, Search, AlertTriangle, Check, Link2
} from "lucide-react";
import type { ExternalLink } from "@/types/external-links";
import {
    detectLinkService,
    validateExternalUrl,
    serviceConfigs,
    buildSearchQuery,
    type ExternalLinkService,
    type LinkTargetType
} from "@/types/external-links";

// Service icons (using emoji for simplicity, can replace with actual icons)
const serviceIcons: Record<ExternalLinkService, string> = {
    spotify: "🎵",
    youtube: "▶️",
    apple_music: "🍎",
    line_music: "💚",
    amazon_music: "📦",
    other: "🔗",
};

interface ExternalLinksEditorProps {
    links: ExternalLink[];
    onChange: (links: ExternalLink[]) => void;
    entityType: LinkTargetType;
    searchParams?: {
        title?: string;
        artist?: string;
        album?: string;
        year?: number;
    };
}

export function ExternalLinksEditor({
    links,
    onChange,
    entityType,
    searchParams,
}: ExternalLinksEditorProps) {
    const [newUrl, setNewUrl] = useState("");
    const [validationResult, setValidationResult] = useState<ReturnType<typeof validateExternalUrl> | null>(null);

    // Validate URL on change
    const handleUrlChange = (url: string) => {
        setNewUrl(url);
        if (url.trim()) {
            const result = validateExternalUrl(url, entityType);
            setValidationResult(result);
        } else {
            setValidationResult(null);
        }
    };

    // Add link
    const handleAdd = () => {
        if (!newUrl.trim() || !validationResult?.valid) return;

        const detected = detectLinkService(newUrl);
        const newLink: ExternalLink = {
            id: `link-${Date.now()}`,
            service: detected?.service || "other",
            targetType: detected?.targetType || "other",
            url: newUrl.trim(),
            serviceId: detected?.serviceId || undefined,
            verified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onChange([...links, newLink]);
        setNewUrl("");
        setValidationResult(null);
    };

    // Remove link
    const handleRemove = (id: string) => {
        onChange(links.filter(l => l.id !== id));
    };

    // Open search in service
    const openSearch = (service: ExternalLinkService) => {
        if (!searchParams) return;
        const query = buildSearchQuery(searchParams);
        const config = serviceConfigs[service];
        const url = config.searchUrlTemplate(query);
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-4">
            {/* Existing Links */}
            {links.length > 0 && (
                <div className="space-y-2">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg group"
                        >
                            <span className="text-lg">{serviceIcons[link.service]}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium" style={{ color: serviceConfigs[link.service].color }}>
                                    {serviceConfigs[link.service].name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {link.url}
                                </div>
                            </div>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                title="開く"
                            >
                                <ExternalLinkIcon size={16} />
                            </a>
                            <button
                                onClick={() => handleRemove(link.id)}
                                className="p-2 text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="削除"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new link */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="url"
                            value={newUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder="外部リンクURLを貼り付け..."
                            className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none pr-10 ${validationResult
                                    ? validationResult.valid
                                        ? "border-green-500/50 focus:border-green-500"
                                        : "border-red-500/50 focus:border-red-500"
                                    : "border-white/20 focus:border-primary"
                                }`}
                        />
                        {validationResult && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {validationResult.valid ? (
                                    <Check size={16} className="text-green-500" />
                                ) : (
                                    <AlertTriangle size={16} className="text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!newUrl.trim() || !validationResult?.valid}
                        className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Validation message */}
                {validationResult?.warning && (
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                        <AlertTriangle size={12} />
                        {validationResult.warning}
                    </div>
                )}

                {/* Detected service */}
                {validationResult?.detected && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{serviceIcons[validationResult.detected.service]}</span>
                        {serviceConfigs[validationResult.detected.service].name} - {validationResult.detected.targetType}
                    </div>
                )}
            </div>

            {/* Quick search buttons (FR-1603) */}
            {searchParams && links.length === 0 && (
                <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2">リンク未設定 - 外部サービスで検索:</p>
                    <div className="flex flex-wrap gap-2">
                        {(["spotify", "youtube", "apple_music"] as ExternalLinkService[]).map((service) => (
                            <button
                                key={service}
                                onClick={() => openSearch(service)}
                                className="flex items-center gap-1 px-3 py-1 text-xs border border-white/10 rounded-full hover:border-white/20 transition-colors"
                                style={{ color: serviceConfigs[service].color }}
                            >
                                <Search size={12} />
                                {serviceConfigs[service].name}で検索
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Display-only version (for detail pages)
interface ExternalLinksDisplayProps {
    links: ExternalLink[];
    showIcon?: boolean;
}

export function ExternalLinksDisplay({ links, showIcon = true }: ExternalLinksDisplayProps) {
    if (links.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link) => (
                <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-white/10 rounded-full hover:border-white/20 transition-colors"
                    style={{ color: serviceConfigs[link.service].color }}
                    title={`${serviceConfigs[link.service].name}で開く`}
                >
                    {showIcon && <span>{serviceIcons[link.service]}</span>}
                    <span>{serviceConfigs[link.service].name}</span>
                    <ExternalLinkIcon size={12} />
                </a>
            ))}
        </div>
    );
}

// Small icon for lists (FR-1605)
interface ExternalLinkBadgeProps {
    links: ExternalLink[];
}

export function ExternalLinkBadge({ links }: ExternalLinkBadgeProps) {
    if (links.length === 0) return null;

    // Show first service icon
    const firstLink = links[0];

    return (
        <span
            className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full"
            style={{ backgroundColor: `${serviceConfigs[firstLink.service].color}20` }}
            title={`${links.length}件の外部リンク`}
        >
            {serviceIcons[firstLink.service]}
        </span>
    );
}
