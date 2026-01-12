import { NextResponse } from "next/server";
import { loadData, saveData, CollectionName, clearCache } from "@/lib/database";

const COLLECTIONS: CollectionName[] = [
    'history', 'songs', 'discography', 'tags', 'members', 'settings',
    'playHistory', 'favorites', 'goods', 'gallery_metadata'
];

export async function GET() {
    try {
        const backupData: Record<string, any> = {};

        for (const collection of COLLECTIONS) {
            const data = await loadData(collection);
            backupData[collection] = data;
        }

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="sekaowa-db-backup-${new Date().toISOString().slice(0, 10)}.json"`
            }
        });
    } catch (error) {
        console.error("Backup failed:", error);
        return NextResponse.json({ success: false, message: "Backup failed" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate basic structure
        if (typeof data !== 'object' || data === null) {
            return NextResponse.json({ success: false, message: "Invalid format" }, { status: 400 });
        }

        for (const collection of COLLECTIONS) {
            if (Array.isArray(data[collection])) {
                await saveData(collection, data[collection]);
            }
        }

        clearCache();

        return NextResponse.json({ success: true, message: "Restore successful" });
    } catch (error) {
        console.error("Restore failed:", error);
        return NextResponse.json({ success: false, message: "Restore failed" }, { status: 500 });
    }
}
