// Generic Database API Route
import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/database';
import type { CollectionName } from '@/lib/database';

// 許可されたコレクション
const ALLOWED_COLLECTIONS: CollectionName[] = [
    'history', 'songs', 'discography', 'tags', 'members', 'settings', 'playHistory', 'favorites', 'goods', 'gallery_metadata'
];

function isValidCollection(name: string): name is CollectionName {
    return ALLOWED_COLLECTIONS.includes(name as CollectionName);
}

type RouteParams = {
    params: Promise<{ collection: string }>;
}

// GET: データ取得（全件 or ID指定）
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { collection } = await params;

        if (!isValidCollection(collection)) {
            return NextResponse.json(
                { error: `Invalid collection: ${collection}` },
                { status: 400 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            // ID指定取得
            const item = await db.getById(collection, id);
            if (!item) {
                return NextResponse.json(
                    { error: `Item not found: ${id}` },
                    { status: 404 }
                );
            }
            return NextResponse.json(item);
        }

        // 全件取得
        const data = await db.loadData(collection);
        return NextResponse.json(data);

    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: 新規作成
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { collection } = await params;

        if (!isValidCollection(collection)) {
            return NextResponse.json(
                { error: `Invalid collection: ${collection}` },
                { status: 400 }
            );
        }

        const body = await request.json();

        if (!body.id) {
            // IDが未指定の場合は自動生成
            body.id = `${collection}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }

        // タイムスタンプ追加
        body.createdAt = new Date().toISOString();
        body.updatedAt = new Date().toISOString();

        const created = await db.create(collection, body);
        return NextResponse.json(created, { status: 201 });

    } catch (error) {
        console.error('POST error:', error);
        if (error instanceof Error && error.message.includes('already exists')) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT: 更新
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { collection } = await params;

        if (!isValidCollection(collection)) {
            return NextResponse.json(
                { error: `Invalid collection: ${collection}` },
                { status: 400 }
            );
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const { id, ...updates } = body;
        const updated = await db.update(collection, id, updates);

        return NextResponse.json(updated);

    } catch (error) {
        console.error('PUT error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE: 削除
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { collection } = await params;

        if (!isValidCollection(collection)) {
            return NextResponse.json(
                { error: `Invalid collection: ${collection}` },
                { status: 400 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const soft = searchParams.get('soft') === 'true';

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        if (soft) {
            // 論理削除
            const deleted = await db.softDelete(collection, id);
            return NextResponse.json(deleted);
        }

        // 物理削除
        const success = await db.remove(collection, id);
        if (!success) {
            return NextResponse.json(
                { error: `Item not found: ${id}` },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
