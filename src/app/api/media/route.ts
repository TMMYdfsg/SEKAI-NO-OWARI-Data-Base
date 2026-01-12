import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MEDIA_ROOT } from '@/lib/media-config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('file');

    if (!filename) {
        return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
    }

    // Securely resolve the file path, allowing subdirectories
    const filePath = path.resolve(MEDIA_ROOT, filename);

    // Ensure the resolved path is within the MEDIA_ROOT directory
    if (!filePath.startsWith(MEDIA_ROOT)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        // Convert fs.ReadStream to Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                file.on('data', (chunk) => controller.enqueue(chunk));
                file.on('end', () => controller.close());
                file.on('error', (err) => controller.error(err));
            }
        });

        const headers = new Headers();
        headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', chunksize.toString());
        headers.set('Content-Type', 'video/mp4'); // Generic fallback, browser often auto-detects or we can map extensions

        return new NextResponse(webStream, { status: 206, headers });
    } else {
        const file = fs.createReadStream(filePath);

        // Convert fs.ReadStream to Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                file.on('data', (chunk) => controller.enqueue(chunk));
                file.on('end', () => controller.close());
                file.on('error', (err) => controller.error(err));
            }
        });

        const headers = new Headers();
        headers.set('Content-Length', fileSize.toString());
        headers.set('Content-Type', 'video/mp4');

        return new NextResponse(webStream, { status: 200, headers });
    }
}
