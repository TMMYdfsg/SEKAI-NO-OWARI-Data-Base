export type UserQuizQuestion = {
    id: string;
    question: string;
    options: string[]; // 4 options
    correctAnswerIndex: number;
    explanation?: string;
};

export type UserQuiz = {
    id: string;
    title: string;
    description: string;
    creator: string;
    createdAt: string; // ISO String
    questions: UserQuizQuestion[];
    tags: string[];
};

// Initial empty state or sample data
export const USER_QUIZZES: UserQuiz[] = [
    {
        id: "sample-quiz-1",
        title: "ライブMCクイズ",
        description: "ライブでのMCに関するマニアックなクイズです。",
        creator: "Admin",
        createdAt: new Date().toISOString(),
        tags: ["Live", "MC"],
        questions: [
            {
                id: "q1",
                question: "2013年の炎と森のカーニバルで、DJ LOVEがMCで話した内容は？",
                options: ["ラーメンを食べた話", "高いところから落ちた話", "迷子になった話", "衣装が破れた話"],
                correctAnswerIndex: 1,
                explanation: "高いステージから落下したエピソードを話していました。"
            }
        ]
    }
];
