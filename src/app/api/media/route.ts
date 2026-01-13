import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MEDIA_ROOT, GALLERY_ROOT, IMAGE_EXTENSIONS } from '@/lib/media-config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('file');
    const source = searchParams.get('source'); // 'gallery' or default to 'media'

    if (!filename) {
        return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
    }

    // Determine the root directory based on source
    const rootDir = source === 'gallery' ? GALLERY_ROOT : MEDIA_ROOT;

    // Normalize filename to handle Windows backslashes if passed in URL
    const normalizedFilename = filename.replace(/\\/g, '/');

    // Securely resolve the file path, allowing subdirectories
    const filePath = path.resolve(rootDir, normalizedFilename);

    // Ensure the resolved path is within the allowed directory
    // Also check if it's in GALLERY_ROOT for gallery images without explicit source param
    const isInMediaRoot = filePath.startsWith(MEDIA_ROOT);
    const isInGalleryRoot = filePath.startsWith(GALLERY_ROOT);

    // If the file path contains gallery folder name pattern, use gallery root
    let finalPath = filePath;
    if (!isInMediaRoot && !isInGalleryRoot) {
        // Try gallery root as fallback for image files
        const ext = path.extname(normalizedFilename).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
            const galleryPath = path.resolve(GALLERY_ROOT, filename);
            console.log(`[Debug] Checking fallback gallery path: ${galleryPath}`);
            if (fs.existsSync(galleryPath)) {
                finalPath = galleryPath;
            }
        }
    }

    // Security check
    console.log(`[Debug] Request: ${filename}, Source: ${source}`);
    console.log(`[Debug] Final path: ${finalPath}`);
    console.log(`[Debug] Roots: Media=${MEDIA_ROOT}, Gallery=${GALLERY_ROOT}`);

    if (!finalPath.startsWith(MEDIA_ROOT) && !finalPath.startsWith(GALLERY_ROOT)) {
        console.error(`[Error] Access denied for path: ${finalPath}`);
        return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    if (!fs.existsSync(finalPath)) {
        console.error(`[Error] File not found: ${finalPath}`);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stat = fs.statSync(finalPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Determine MIME type based on extension
    const ext = path.extname(finalPath).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.mp4' || ext === '.m4v') mimeType = 'video/mp4';
    else if (ext === '.mp3') mimeType = 'audio/mpeg';
    else if (ext === '.wav') mimeType = 'audio/wav';
    else if (ext === '.m4a') mimeType = 'audio/mp4';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(finalPath, { start, end });

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
        headers.set('Content-Type', mimeType);

        return new NextResponse(webStream, { status: 206, headers });
    } else {
        const file = fs.createReadStream(finalPath);

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
        headers.set('Content-Type', mimeType);
        headers.set('Cache-Control', 'public, max-age=3600');

        return new NextResponse(webStream, { status: 200, headers });
    }
}
