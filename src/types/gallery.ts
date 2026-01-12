// Gallery and Goods Types

export interface GalleryImageMetadata {
    id: string;
    path: string;              // Relative path from gallery root
    folder: string;            // Folder name
    tags: string[];
    description?: string;
    captureDate?: string;      // YYYY-MM-DD
    type?: 'photo' | 'artwork' | 'screenshot' | 'other';
    relatedEventIds?: string[]; // Link to history events
    relatedGoodsIds?: string[]; // Link to goods items
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

export type GoodsType = 'CD' | 'DVD' | 'Blu-ray' | 'Book' | 'Clothing' | 'Accessory' | 'Poster' | 'Ticket' | 'Other';

export interface GoodsItem {
    id: string;
    name: string;
    type: GoodsType;
    acquisitionDate?: string;  // YYYY-MM-DD
    description?: string;
    imagePaths: string[];      // Gallery image paths
    tags: string[];
    relatedEventIds?: string[]; // Link to history events
    relatedDiscographyIds?: string[]; // Link to albums
    isFavorite: boolean;
    rating?: number;           // 1-5
    price?: number;
    purchaseLocation?: string;
    condition?: 'mint' | 'excellent' | 'good' | 'fair' | 'poor';
    notes?: string;            // Personal notes
    createdAt: string;
    updatedAt: string;
}
