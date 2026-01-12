// Data Migration Script
// Converts existing hardcoded TypeScript data to JSON database files

import { history as legacyHistory, type HistoryEvent as LegacyHistoryEvent } from '../src/data/history';
import { albums as legacyAlbums, type Album as LegacyAlbum } from '../src/data/discography';
import { songs as legacySongs, type Song as LegacySong } from '../src/data/songs';
import { members } from '../src/data/members';

import type { HistoryEvent, EventType } from '../src/types/history';
import type { Song } from '../src/types/song';
import type { Discography, TrackInfo } from '../src/types/discography';
import type { Tag } from '../src/types/tags';

import * as fs from 'fs';
import * as path from 'path';

// 出力ディレクトリ
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'db');

// ディレクトリ作成
function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// JSONファイルに書き込み
function writeJson(filename: string, data: unknown): void {
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Created: ${filePath}`);
}

// ヒストリーデータの変換
function migrateHistory(): HistoryEvent[] {
    const eventTypeMap: Record<string, EventType> = {
        'Live': 'Live',
        'Release': 'Release',
        'Milestone': 'Milestone',
        'Formation': 'Formation'
    };

    return legacyHistory.map((legacy: LegacyHistoryEvent, index: number) => ({
        id: `history-${legacy.year}-${index}`,
        date: {
            year: parseInt(legacy.year, 10),
        },
        title: legacy.title,
        details: {
            official: legacy.description
        },
        eventTypes: [eventTypeMap[legacy.type] || 'Other'],
        tags: [legacy.type.toLowerCase()],
        visibility: 'public' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
}

// Songsデータの変換
function migrateSongs(): Song[] {
    const categoryMap: Record<string, Song['category']> = {
        'original': 'Original',
        'live_remix': 'LIVE REMIX',
        'rare': 'Rare'
    };

    return legacySongs.map((legacy: LegacySong) => ({
        id: legacy.id,
        title: legacy.title,
        album: legacy.album,
        year: legacy.year,
        composer: legacy.composer,
        writer: legacy.writer,
        category: categoryMap[legacy.category] || 'Original',
        tags: [],
        playCount: 0,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
}

// Discographyデータの変換
function migrateDiscography(): Discography[] {
    return legacyAlbums.map((legacy: LegacyAlbum) => {
        const tracks: TrackInfo[] = legacy.tracks.map((title, index) => ({
            id: `${legacy.id}-track-${index + 1}`,
            trackNumber: index + 1,
            title
        }));

        return {
            id: legacy.id,
            title: legacy.title,
            releaseDate: legacy.releaseDate,
            type: legacy.type,
            discs: [{
                discNumber: 1,
                tracks
            }],
            coverImage: legacy.coverImage,
            tags: [legacy.type.toLowerCase()],
            isFavorite: false,
            isComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    });
}

// 初期タグの作成
function createInitialTags(): Tag[] {
    const tagDefs = [
        { name: 'live', description: 'ライブイベント' },
        { name: 'release', description: 'リリース関連' },
        { name: 'milestone', description: '節目となる出来事' },
        { name: 'formation', description: '結成・設立関連' },
        { name: 'album', description: 'アルバム' },
        { name: 'single', description: 'シングル' },
        { name: 'video', description: '映像作品' },
        { name: 'ep', description: 'EP' },
        { name: 'compilation', description: 'コンピレーション' },
    ];

    return tagDefs.map((def, index) => ({
        id: `tag-${index}`,
        name: def.name,
        description: def.description,
        usageCount: 0,
        applicableTo: ['history', 'song', 'discography', 'image', 'goods', 'member'] as const,
        isAutoTag: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
}

// メイン処理
function main(): void {
    console.log('=== Data Migration Script ===\n');

    ensureDir(OUTPUT_DIR);

    // History
    const historyData = migrateHistory();
    writeJson('history.json', historyData);
    console.log(`  → ${historyData.length} history events migrated`);

    // Songs
    const songsData = migrateSongs();
    writeJson('songs.json', songsData);
    console.log(`  → ${songsData.length} songs migrated`);

    // Discography
    const discographyData = migrateDiscography();
    writeJson('discography.json', discographyData);
    console.log(`  → ${discographyData.length} discography items migrated`);

    // Tags
    const tagsData = createInitialTags();
    writeJson('tags.json', tagsData);
    console.log(`  → ${tagsData.length} tags created`);

    // Members (直接コピー、拡張は後のフェーズで)
    writeJson('members.json', members);
    console.log(`  → ${members.length} members migrated`);

    // 初期設定
    const settings = {
        theme: 'default',
        language: 'ja',
        autoPlayBGM: false,
        crossfadeDuration: 2,
        lightweightMode: false
    };
    writeJson('settings.json', settings);

    console.log('\n✓ Migration completed successfully!');
    console.log(`  Output directory: ${OUTPUT_DIR}`);
}

main();
