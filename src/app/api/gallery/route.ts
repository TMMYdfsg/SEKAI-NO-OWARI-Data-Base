import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_ROOT, IMAGE_EXTENSIONS } from '@/lib/media-config';

interface GalleryFolder {
    name: string;
    path: string;
    imageCount: number;
}

interface GalleryImage {
    name: string;
    path: string;
    folder: string;
}

function scanGalleryFolders(): GalleryFolder[] {
    const folders: GalleryFolder[] = [];

    if (!fs.existsSync(GALLERY_ROOT)) {
        console.warn('Gallery root does not exist:', GALLERY_ROOT);
        return folders;
    }

    try {
        const entries = fs.readdirSync(GALLERY_ROOT, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const folderPath = path.join(GALLERY_ROOT, entry.name);
                let imageCount = 0;

                try {
                    const files = fs.readdirSync(folderPath);
                    imageCount = files.filter(f =>
                        IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
                    ).length;
                } catch (e) {
                    console.error(`Error reading folder ${folderPath}:`, e);
                }

                if (imageCount > 0) {
                    folders.push({
                        name: entry.name,
                        path: entry.name, // フォルダ名はそのままpathとして使用（トップレベルなので）
                        imageCount
                    });
                }
            }
        }
    } catch (e) {
        console.error('Error scanning gallery root:', e);
    }

    return folders.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

function getImagesInFolder(folderName: string): GalleryImage[] {
    const images: GalleryImage[] = [];
    const folderPath = path.join(GALLERY_ROOT, folderName);

    if (!fs.existsSync(folderPath)) {
        return images;
    }

    try {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
                images.push({
                    name: file,
                    path: path.join(folderName, file).split(path.sep).join('/'), // Windowsパス対策: バックスラッシュをスラッシュに置換
                    folder: folderName
                });
            }
        }
    } catch (e) {
        console.error(`Error reading images from ${folderPath}:`, e);
    }

    return images;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder');
    const file = searchParams.get('file');

    try {
        // Return image file
        if (file) {
            // URLフレンドリーなパス（スラッシュ区切り）をOS標準パスに変換
            const normalizedFile = file.split('/').join(path.sep);
            const filePath = path.join(GALLERY_ROOT, normalizedFile);

            // Security check - ensure path is within GALLERY_ROOT
            if (!filePath.startsWith(GALLERY_ROOT)) {
                return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
            }

            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }

            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' :
                ext === '.webp' ? 'image/webp' :
                    ext === '.gif' ? 'image/gif' : 'image/jpeg';

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': mimeType,
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        // Return images in a specific folder
        if (folder) {
            const images = getImagesInFolder(folder);
            return NextResponse.json({ images });
        }

        // Return list of folders
        const folders = scanGalleryFolders();
        return NextResponse.json({ folders });
    } catch (error) {
        console.error('Gallery API error:', error);
        return NextResponse.json({ error: 'Failed to access gallery' }, { status: 500 });
    }
}
