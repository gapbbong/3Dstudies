
import practiceData from '@/data/data_practice';

export interface Question {
    year: string;
    number: string;
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
    full_block: string;
    image: string | null;
}

export interface Chapter {
    id: string;
    title: string;
    type: 'basic' | 'practice' | 'advanced';
    questions: Question[];
    theoryContent?: string;
}

// Simulate Database Calls
export const db = {
    chapter: {
        findMany: async (): Promise<Chapter[]> => {
            if (!practiceData || !practiceData.chapters) {
                console.error('practiceData is missing or invalid');
                return [];
            }

            // Dynamically map all chapters from practiceData
            return practiceData.chapters.map((ch: any, index: number) => {
                // Determine type based on ID or index
                let type: 'basic' | 'practice' | 'advanced' = 'basic';
                if (ch.id?.startsWith('part9') || index >= 8) {
                    type = 'practice';
                }

                return {
                    id: ch.id || `ch-${index}`,
                    title: ch.title || `Chapter ${index + 1}`,
                    type,
                    questions: (ch.questions || []) as unknown as Question[],
                    theoryContent: ch.theoryContent || "이 챕터의 이론 내용이 아직 준비되지 않았습니다."
                };
            });
        },
        findUnique: async (id: string): Promise<Chapter | null> => {
            const all = await db.chapter.findMany();
            return all.find(ch => ch.id === id) || null;
        }
    }
};
