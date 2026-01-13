import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'path-config.json');

interface PathSettings {
    mediaRoot: string;
    galleryRoot: string;
    albumArtRoot: string;
}

export async function GET() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return NextResponse.json(JSON.parse(data));
        }

        // Return default paths
        return NextResponse.json({
            mediaRoot: 'programs/media',
            galleryRoot: 'F:\\セカオワの音源・ライブ・番組\\セカオワ　写真',
            albumArtRoot: 'programs/album_art'
        });
    } catch (error) {
        console.error('Error reading path config:', error);
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const paths: PathSettings = await request.json();

        // Save to config file
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(paths, null, 2), 'utf-8');

        return NextResponse.json({
            success: true,
            message: 'Paths saved. Please restart the server to apply changes.',
            paths
        });
    } catch (error) {
        console.error('Error saving path config:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
