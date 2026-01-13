import path from 'path';
import fs from 'fs';

// Config file path
const CONFIG_FILE = path.join(process.cwd(), 'path-config.json');

// Load paths from config file or use defaults
function loadPaths() {
    const defaults = {
        mediaRoot: path.join(process.cwd(), 'programs', 'media'),
        galleryRoot: 'F:\\セカオワの音源・ライブ・番組\\セカオワ　写真',
        albumArtRoot: path.join(process.cwd(), 'programs', 'album_art')
    };

    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            const config = JSON.parse(data);

            // Resolve relative paths to absolute
            const resolveIfRelative = (p: string, defaultPath: string) => {
                if (!p) return defaultPath;
                // Check if path is absolute (Windows: has drive letter, Unix: starts with /)
                if (path.isAbsolute(p)) return p;
                return path.resolve(process.cwd(), p);
            };

            return {
                mediaRoot: resolveIfRelative(config.mediaRoot, defaults.mediaRoot),
                galleryRoot: resolveIfRelative(config.galleryRoot, defaults.galleryRoot),
                albumArtRoot: resolveIfRelative(config.albumArtRoot, defaults.albumArtRoot)
            };
        }
    } catch (e) {
        console.error('Failed to load path config:', e);
    }

    return defaults;
}

const paths = loadPaths();

// Export paths
export const MEDIA_ROOT = paths.mediaRoot;
export const GALLERY_ROOT = paths.galleryRoot;
export const ALBUM_ART_ROOT = paths.albumArtRoot;

// Member images folder
export const MEMBER_IMAGES_ROOT = path.join(process.cwd(), 'public', 'images', 'members');

export const PLAYABLE_EXTENSIONS = ['.mp3', '.mp4', '.wav', '.m4a', '.m4v'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const ALLOWED_EXTENSIONS = [...PLAYABLE_EXTENSIONS, ...IMAGE_EXTENSIONS];

