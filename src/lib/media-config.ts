import path from 'path';

// Default to a folder named 'programs/media' in the project root
export const MEDIA_ROOT = path.join(process.cwd(), 'programs', 'media');

// Album art folder (relative to project or absolute)
export const ALBUM_ART_ROOT = path.join(process.cwd(), 'programs', 'album_art');

// Gallery folder - external drive
export const GALLERY_ROOT = 'F:\\セカオワの音源・ライブ・番組\\セカオワ　写真';

// Member images folder
export const MEMBER_IMAGES_ROOT = path.join(process.cwd(), 'public', 'images', 'members');

export const PLAYABLE_EXTENSIONS = ['.mp3', '.mp4', '.wav', '.m4a', '.m4v'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const ALLOWED_EXTENSIONS = [...PLAYABLE_EXTENSIONS, ...IMAGE_EXTENSIONS];
