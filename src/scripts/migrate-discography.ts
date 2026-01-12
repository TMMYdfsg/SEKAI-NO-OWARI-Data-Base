// Data Migration Script: Discography (Legacy to New)
// Run this script to migrate existing discography data to the new database format

import { albums } from '../data/discography';
import type { Album } from '../data/discography';
import type { Discography, TrackInfo } from '../types/discography';

export function migrateDiscographyData(): Discography[] {
    return albums.map((album: Album) => {
        const tracks: TrackInfo[] = album.tracks.map((title, index) => ({
            id: `${album.id}-track-${index + 1}`,
            trackNumber: index + 1,
            title,
            isBonus: false,
        }));

        // Check completion
        const missingFields: string[] = [];
        if (!album.title) missingFields.push("タイトル");
        if (!album.releaseDate) missingFields.push("リリース日");
        if (!album.coverImage) missingFields.push("カバー画像");
        if (tracks.length === 0) missingFields.push("トラックリスト");

        const discography: Discography = {
            id: album.id,
            title: album.title,
            releaseDate: album.releaseDate,
            type: album.type,
            discs: [{
                discNumber: 1,
                tracks
            }],
            coverImage: album.coverImage || undefined,
            tags: [],
            isFavorite: false,
            isComplete: missingFields.length === 0,
            missingFields: missingFields.length > 0 ? missingFields : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return discography;
    });
}

// Example usage:
// const migratedData = migrateDiscographyData();
// console.log(JSON.stringify(migratedData, null, 2));

// To save to file:
// import fs from 'fs';
// fs.writeFileSync('data/db/discography.json', JSON.stringify(migratedData, null, 2));
