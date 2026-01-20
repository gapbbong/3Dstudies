
import { NextResponse } from 'next/server';
import practiceData from '@/data/data_practice';

export async function GET() {
    // Only return titles and IDs, NO QUESTIONS
    const chapters = practiceData.chapters.map((ch: any, index: number) => ({
        id: ch.id || `ch-${index}`,
        title: ch.title || `Chapter ${index + 1}`,
        type: (ch.id?.startsWith('part9') || index >= 8) ? 'practice' : 'basic',
    }));

    return NextResponse.json(chapters);
}
