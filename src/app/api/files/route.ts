import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MEDIA_ROOT, ALLOWED_EXTENSIONS } from '@/lib/media-config';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function scanDirectory(dirPath: string, category: string, relativePath: string = ''): any[] {
    const files: any[] = [];

    if (!fs.existsSync(dirPath)) {
        return files;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            // Recurse into subdirectories, updating category to include folder name
            const subCategory = category === 'LIVE REMIX'
                ? `LIVE REMIX / ${entry.name}`
                : `${category} / ${entry.name}`;
            files.push(...scanDirectory(entryPath, subCategory, entryRelativePath));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();

            // Skip image files in the main loop (they are used as thumbnails)
            if (IMAGE_EXTENSIONS.includes(ext)) {
                continue;
            }

            if (ALLOWED_EXTENSIONS.includes(ext)) {
                const baseName = path.basename(entry.name, ext);

                // Look for a matching image file in the same directory
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
                    type: ext.replace('.', ''),
                    category: category,
                    thumbnail: thumbnail
                });
            }
        }
    }

    return files;
}

export async function GET() {
    try {
        if (!fs.existsSync(MEDIA_ROOT)) {
            fs.mkdirSync(MEDIA_ROOT, { recursive: true });
            return NextResponse.json({ files: [] });
        }

        // Define root directories to scan
        const rootDirs = [
            { path: '', category: 'Original' },
            { path: 'live_remix', category: 'LIVE REMIX' },
            { path: 'rare', category: 'Rare / Unreleased' },
            { path: 'videos', category: 'Videos' }
        ];

        let allFiles: any[] = [];

        for (const dir of rootDirs) {
            const dirPath = path.join(MEDIA_ROOT, dir.path);

            // For root (Original), only scan files directly in MEDIA_ROOT, not subfolders
            if (dir.path === '') {
                // Scan only files in root, not subdirectories
                if (fs.existsSync(dirPath)) {
                    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isFile()) {
                            const ext = path.extname(entry.name).toLowerCase();
                            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) continue;
                            if (ALLOWED_EXTENSIONS.includes(ext)) {
                                const baseName = path.basename(entry.name, ext);
                                let thumbnail = null;
                                for (const imgExt of ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
                                    if (fs.existsSync(path.join(dirPath, baseName + imgExt))) {
                                        thumbnail = baseName + imgExt;
                                        break;
                                    }
                                }
                                allFiles.push({
                                    name: entry.name,
                                    path: entry.name,
                                    type: ext.replace('.', ''),
                                    category: 'Original',
                                    thumbnail: thumbnail
                                });
                            }
                        }
                    }
                }
            } else {
                // For subfolders, use recursive scanning
                const files = scanDirectory(dirPath, dir.category, dir.path);
                allFiles = [...allFiles, ...files];
            }
        }

        return NextResponse.json({ files: allFiles });
    } catch (error) {
        console.error('Error reading media directory:', error);
        return NextResponse.json({ error: 'Failed to read media files' }, { status: 500 });
    }
}
