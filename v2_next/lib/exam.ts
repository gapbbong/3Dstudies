
export interface ExamConfig {
    timeLimit: number;
    passScore: number;
    showExplanationAfter: boolean;
}

export const EXAM_CONFIGS: Record<string, ExamConfig> = {
    'default': {
        timeLimit: 3600, // 60 minutes
        passScore: 60,   // out of 100
        showExplanationAfter: true
    },
    'mock_1': {
        timeLimit: 3600,
        passScore: 60,
        showExplanationAfter: false
    }
};
