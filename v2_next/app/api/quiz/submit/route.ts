
import { db, Question } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { chapterId, answers } = await request.json(); // answers: { [number]: selectedChoiceIndex }

        if (!chapterId || !answers) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const chapter = await db.chapter.findUnique(chapterId);
        if (!chapter) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }

        interface QuestionResult {
            number: string;
            isCorrect: boolean;
            correctAnswer: number; // The actual correct answer index (as a number)
            explanation: string | undefined;
        }

        const results: QuestionResult[] = chapter.questions.map((q: Question) => {
            const userAnswer = answers[q.number];
            const correctAnswer = Number(q.answer); // Convert q.answer to number once
            const isCorrect = Number(userAnswer) === correctAnswer;

            return {
                number: q.number,
                isCorrect,
                correctAnswer,
                explanation: q.explanation,
            };
        });

        // Add type to the filter function's parameter 'r'
        const score = results.filter((r: QuestionResult) => r.isCorrect).length;
        const total = results.length;
        const passed = score / total >= 0.8; // Example threshold

        return NextResponse.json({
            score,
            total,
            passed,
            results,
        });
    } catch (error) {
        console.error('Submission API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
