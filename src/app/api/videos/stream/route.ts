import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('file');

        if (!filePath) {
            return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }

        // This endpoint accepts absolute paths for video streaming
        const normalizedPath = filePath.replace(/\//g, path.sep);

        if (!fs.existsSync(normalizedPath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const stat = fs.statSync(normalizedPath);
        const fileSize = stat.size;
        const ext = path.extname(normalizedPath).toLowerCase();

        // Determine content type
        const mimeTypes: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.m4v': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Handle range requests for video seeking
        const range = request.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const fileStream = fs.createReadStream(normalizedPath, { start, end });
            const chunks: Buffer[] = [];

            for await (const chunk of fileStream) {
                chunks.push(Buffer.from(chunk));
            }

            const buffer = Buffer.concat(chunks);

            return new NextResponse(buffer, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize.toString(),
                    'Content-Type': contentType,
                },
            });
        }

        // Full file response
        const fileBuffer = fs.readFileSync(normalizedPath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Length': fileSize.toString(),
                'Content-Type': contentType,
            },
        });
    } catch (error) {
        console.error('Error streaming video:', error);
        return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
    }
}
