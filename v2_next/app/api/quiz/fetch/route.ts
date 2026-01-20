
import { NextRequest, NextResponse } from 'next/server';
import practiceData from '@/data/data_practice';
import { obfuscate, GOOGLE_SCRIPT_URL } from '@/lib/security';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
        return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    // 1. Find the specific chapter in the server-side data
    const chapter = practiceData.chapters.find((ch: any) => ch.id === chapterId);

    if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // 2. Fetch Overwrites from Google Sheets
    let questions = JSON.parse(JSON.stringify(chapter.questions)); // Deep clone
    try {
        const gasResponse = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_overwrites`);
        const overwrites = await gasResponse.json();

        if (overwrites && overwrites.length > 0) {
            overwrites.forEach((ow: any) => {
                if (ow.chapterId === chapterId) {
                    const qIdx = questions.findIndex((q: any) => q.number === ow.questionId);
                    if (qIdx !== -1) {
                        // Apply specific fields
                        if (ow.question) questions[qIdx].question = ow.question;
                        if (ow.answer) questions[qIdx].answer = ow.answer;
                        if (ow.explanation) questions[qIdx].explanation = ow.explanation;
                        for (let i = 1; i <= 4; i++) {
                            if (ow[`choice${i}`]) {
                                questions[qIdx].choices[i - 1] = ow[`choice${i}`];
                            }
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error("Failed to fetch overwrites:", e);
    }

    // 3. Obfuscate the data before sending
    const secureData = obfuscate({ ...chapter, questions });

    return NextResponse.json({ payload: secureData });
}
