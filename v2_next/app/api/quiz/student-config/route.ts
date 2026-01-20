
import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_SCRIPT_URL } from '@/lib/security';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_student_configs&name=${encodeURIComponent(name)}`);
        const result = await response.json();

        if (result.status === 'success') {
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
        }
    } catch (e) {
        console.error("Failed to fetch student config:", e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
