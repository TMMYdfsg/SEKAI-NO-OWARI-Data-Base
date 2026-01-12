import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ALBUM_ART_ROOT, IMAGE_EXTENSIONS } from '@/lib/media-config';
import { albums } from '@/data/discography';

// Find album art by album title
function findAlbumArt(albumTitle: string): string | null {
    if (!fs.existsSync(ALBUM_ART_ROOT)) {
        return null;
    }

    // Try exact match first
    for (const ext of IMAGE_EXTENSIONS) {
        const filePath = path.join(ALBUM_ART_ROOT, albumTitle + ext);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }

    // Try normalized match (remove special characters)
    const normalizedTitle = albumTitle.replace(/[\/\\:*?"<>|]/g, '').trim();
    for (const ext of IMAGE_EXTENSIONS) {
        const filePath = path.join(ALBUM_ART_ROOT, normalizedTitle + ext);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }

    return null;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const albumTitle = searchParams.get('album');
    const songTitle = searchParams.get('song');

    try {
        // If album title is provided, find it directly
        if (albumTitle) {
            const artPath = findAlbumArt(albumTitle);
            if (artPath) {
                const buffer = fs.readFileSync(artPath);
                const ext = path.extname(artPath).toLowerCase();
                const mimeType = ext === '.png' ? 'image/png' :
                    ext === '.webp' ? 'image/webp' :
                        ext === '.gif' ? 'image/gif' : 'image/jpeg';
                return new NextResponse(buffer, {
                    headers: { 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=86400' }
                });
            }
        }

        // If song title is provided, find the album containing it
        if (songTitle) {
            const album = albums.find(a =>
                a.tracks.some(t => t.toLowerCase().includes(songTitle.toLowerCase()))
            );
            if (album) {
                const artPath = findAlbumArt(album.title);
                if (artPath) {
                    const buffer = fs.readFileSync(artPath);
                    const ext = path.extname(artPath).toLowerCase();
                    const mimeType = ext === '.png' ? 'image/png' :
                        ext === '.webp' ? 'image/webp' :
                            ext === '.gif' ? 'image/gif' : 'image/jpeg';
                    return new NextResponse(buffer, {
                        headers: { 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=86400' }
                    });
                }
            }
        }

        // Return 404 if no art found
        return NextResponse.json({ error: 'Album art not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching album art:', error);
        return NextResponse.json({ error: 'Failed to fetch album art' }, { status: 500 });
    }
}
