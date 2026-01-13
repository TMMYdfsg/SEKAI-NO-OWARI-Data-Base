import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ user: null });
    }

    const user = await authServer.getUserById(userId);
    return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
    try {
        const user = await authServer.createGuestUser();
        return NextResponse.json({ user });
    } catch (error) {
        console.error('API Auth POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
