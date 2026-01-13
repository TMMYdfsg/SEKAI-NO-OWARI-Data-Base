import useSWR from 'swr';
import { useState, useMemo, useCallback } from 'react';

// Define the shape of a search result item
export type SearchResultItem = {
    id: string;
    type: 'SONG' | 'ALBUM' | 'HISTORY' | 'MEMBER' | 'VIDEO';
    title: string;
    subtitle?: string;
    url: string;
    icon?: string; // URL for thumbnail or icon identifier
    metadata?: any;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGlobalSearch() {
    const { data: filesData, error: filesError } = useSWR('/api/files', fetcher);
    const { data: discographyData, error: discographyError } = useSWR('/api/db/discography', fetcher);
    const { data: historyData, error: historyError } = useSWR('/api/db/history', fetcher);

    // We assume videos are in filesData for now based on implementation

    const [isLoading, setIsLoading] = useState(true);

    const allItems: SearchResultItem[] = useMemo(() => {
        let items: SearchResultItem[] = [];

        // 1. Songs (from files)
        if (filesData?.files) {
            filesData.files.forEach((file: any) => {
                if (!['mp4', 'mkv', 'mov'].includes(file.type)) { // Filter audio only
                    items.push({
                        id: `song-${file.name}`,
                        type: 'SONG',
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        subtitle: file.category || 'Local Library',
                        url: `/songs?play=${encodeURIComponent(file.name)}`,
                        icon: file.thumbnail ? `/api/media?file=${encodeURIComponent(file.thumbnail)}` : undefined
                    });
                }
            });
        }

        // 2. Albums (from discography)
        if (Array.isArray(discographyData)) {
            discographyData.forEach((album: any) => {
                items.push({
                    id: `album-${album.id}`,
                    type: 'ALBUM',
                    title: album.title,
                    subtitle: `${album.validType || 'Album'} • ${album.releaseDate}`,
                    url: `/discography/${album.id}`,
                    icon: album.coverImage
                });
            });
        }

        // 3. History Events
        if (Array.isArray(historyData)) {
            historyData.forEach((event: any) => {
                const year = (event.date && typeof event.date === 'string') ? event.date.split('-')[0] : '????';
                items.push({
                    id: `history-${event.id}`,
                    type: 'HISTORY',
                    title: event.title,
                    subtitle: `${event.date || 'Unknown Date'} • ${event.category}`,
                    url: `/history?year=${year}#${event.id}`,
                });
            });
        }

        // 4. Videos (from files - if separately identified)
        if (filesData?.files) {
            filesData.files.forEach((file: any) => {
                if (['mp4', 'mkv', 'mov'].includes(file.type)) {
                    items.push({
                        id: `video-${file.name}`,
                        type: 'VIDEO',
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        subtitle: 'Video Library',
                        url: `/videos?play=${encodeURIComponent(file.name)}`,
                        icon: file.thumbnail ? `/api/media?file=${encodeURIComponent(file.thumbnail)}` : undefined
                    });
                }
            });
        }

        return items;
    }, [filesData, discographyData, historyData]);

    const search = useCallback((query: string) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return allItems.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.subtitle?.toLowerCase().includes(lowerQuery)
        );
    }, [allItems]);

    return {
        search,
        isLoading: !filesData && !discographyData && !historyData,
        allItems
    };
}
