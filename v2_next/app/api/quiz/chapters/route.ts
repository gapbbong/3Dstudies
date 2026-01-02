import { NextResponse } from 'next/server';
import { db, Chapter } from '@/lib/db';

export async function GET() {
    try {
        const chapters = await db.chapter.findMany();

        // Map to simplified structure for dashboard
        const dashboardChapters = chapters.map((ch: Chapter) => ({
            id: ch.id,
            title: ch.title,
            type: ch.type || 'basic',
            questionCount: ch.questions.length
        }));

        return NextResponse.json(dashboardChapters);
    } catch (error) {
        console.error('Failed to fetch chapters:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
