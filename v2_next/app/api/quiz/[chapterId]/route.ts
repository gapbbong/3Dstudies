
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    try {
        const { chapterId } = await params;
        const chapter = await db.chapter.findUnique(chapterId);

        if (!chapter) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }

        // Security: Remove answers and full_block from questions before sending to client
        const safeQuestions = chapter.questions.map((q) => ({
            year: q.year,
            number: q.number,
            question: q.question,
            choices: q.choices,
            image: q.image,
            // answer is NOT included
            // full_block is NOT included (it contained the answer)
        }));

        return NextResponse.json({
            id: chapter.id,
            title: chapter.title,
            theoryContent: chapter.theoryContent,
            questions: safeQuestions,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
