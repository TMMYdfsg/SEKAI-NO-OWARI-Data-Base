import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.webm', '.mov', '.avi', '.mkv'];

function scanVideoDirectory(dirPath: string, category: string, relativePath: string = ''): any[] {
    const files: any[] = [];

    if (!fs.existsSync(dirPath)) {
        return files;
    }

    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry.name);
            const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                // Recurse into subdirectories
                const subCategory = category ? `${category} / ${entry.name}` : entry.name;
                files.push(...scanVideoDirectory(entryPath, subCategory, entryRelativePath));
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();

                // Skip non-video files
                if (!VIDEO_EXTENSIONS.includes(ext)) {
                    continue;
                }

                const baseName = path.basename(entry.name, ext);

                // Look for a matching thumbnail image
                let thumbnail = null;
                for (const imgExt of IMAGE_EXTENSIONS) {
                    const imgName = baseName + imgExt;
                    if (fs.existsSync(path.join(dirPath, imgName))) {
                        thumbnail = relativePath ? `${relativePath}/${imgName}` : imgName;
                        break;
                    }
                }

                files.push({
                    name: entry.name,
                    path: entryRelativePath,
                    fullPath: entryPath, // Full absolute path for streaming
                    type: ext.replace('.', ''),
                    category: category || 'Videos',
                    thumbnail: thumbnail,
                    thumbnailFullPath: thumbnail ? path.join(dirPath, baseName + path.extname(thumbnail)) : null
                });
            }
        }
    } catch (error) {
        console.error('Error scanning directory:', dirPath, error);
    }

    return files;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customPath = searchParams.get('path');

        if (!customPath) {
            return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
        }

        // Normalize path for Windows
        const normalizedPath = customPath.replace(/\//g, path.sep);

        if (!fs.existsSync(normalizedPath)) {
            return NextResponse.json({
                error: 'Directory not found',
                path: normalizedPath,
                files: []
            }, { status: 404 });
        }

        const files = scanVideoDirectory(normalizedPath, '');

        return NextResponse.json({
            files,
            basePath: normalizedPath,
            count: files.length
        });
    } catch (error) {
        console.error('Error reading video directory:', error);
        return NextResponse.json({ error: 'Failed to read video files' }, { status: 500 });
    }
}
