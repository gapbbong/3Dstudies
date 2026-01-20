
import { deobfuscate } from '@/lib/security';

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
            // Note: This might still be needed for the dashboard list, 
            // but we want to avoid sending all questions at once.
            // For now, we fetch a minimal chapter list.
            try {
                const response = await fetch('/api/quiz/chapters');
                return await response.json();
            } catch (e) {
                console.error("Failed to fetch chapters:", e);
                return [];
            }
        },
        findUnique: async (id: string): Promise<Chapter | null> => {
            try {
                const response = await fetch(`/api/quiz/fetch?chapterId=${id}`);
                const json = await response.json();
                if (json.payload) {
                    const chapter = deobfuscate(json.payload);
                    return {
                        id: chapter.id,
                        title: chapter.title,
                        type: 'practice', // Default for now
                        questions: chapter.questions as unknown as Question[],
                        theoryContent: chapter.theoryContent
                    };
                }
                return null;
            } catch (e) {
                console.error("Failed to fetch chapter:", e);
                return null;
            }
        }
    }
};
