export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct option (0-3)
    explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
    {
        id: 1,
        question: "SEKAI NO OWARIの結成年は？",
        options: ["2005年", "2006年", "2007年", "2010年"],
        correctAnswer: 2,
        explanation: "2007年に結成され、自分たちでライブハウス「club EARTH」を作り始めました。",
    },
    {
        id: 2,
        question: "Fukaseが「SEKAI NO OWARI」というバンド名を思いついたきっかけは？",
        options: [
            "世界の終わりに希望を見出すため",
            "世界が終わるような絶望から始めたため",
            "好きな小説のタイトルから",
            "夢の中で見た景色から",
        ],
        correctAnswer: 1,
        explanation: "「世界が終わったような生活を送っていた頃に残されていたのが音楽と今の仲間だったので、終わりから始めてみよう」という想いが込められています。",
    },
    {
        id: 3,
        question: "DJ LOVEの仮面、現在のLOVEは何代目？",
        options: ["初代", "2代目", "3代目", "4代目"],
        correctAnswer: 1,
        explanation: "現在のDJ LOVEは2代目です。初代はバンド結成初期に脱退しています。",
    },
    {
        id: 4,
        question: "Saoriがライブ演出を担当するようになったきっかけのツアーは？",
        options: [
            "Heart the eartH",
            "ENTERTAINMENT",
            "炎と森のカーニバル",
            "The Dinner",
        ],
        correctAnswer: 2,
        explanation: "2013年の「炎と森のカーニバル」から、本格的にSaoriがライブ演出の総合プロデュースを手掛けるようになりました。",
    },
    {
        id: 5,
        question: "Nakajinの得意楽器ではないものは？",
        options: ["ギター", "ベース", "ドラム", "サックス"],
        correctAnswer: 3,
        explanation: "Nakajinはギター、ベース、ドラム、ピアノ、三味線など多才ですが、サックスを演奏する機会は稀です。",
    },
    {
        id: 6,
        question: "「RPG」のMV撮影場所は？",
        options: ["学校", "遊園地", "教会", "森"],
        correctAnswer: 0,
        explanation: "「RPG」のMVは、川崎市内の廃校で撮影されました。",
    },
    {
        id: 7,
        question: "Fukaseが愛用しているマイクの通称は？",
        options: ["スターマイク", "ムーンスティック", "スカルマイク", "ラビットワンド"],
        correctAnswer: 0,
        explanation: "星型の装飾が施されたマイクスタンドを使用していることから、ファンの間でそう呼ばれることがあります（公式名称ではありませんが、特徴的なアイテムです）。※正答は「デザインされた特注マイク」の文脈で。",
    },
    {
        id: 8,
        question: "「Dragon Night」でFukaseが持っているアイテムは？",
        options: ["剣", "トランシーバー", "旗", "ランタン"],
        correctAnswer: 1,
        explanation: "ライブパフォーマンスやMVで、トランシーバー型のマイクを使用しています。",
    },
    {
        id: 9,
        question: "インディーズデビューシングルのタイトルは？",
        options: ["幻の命", "天使と悪魔", "ファンタジー", "死の魔法"],
        correctAnswer: 0,
        explanation: "2010年2月10日に「幻の命」でインディーズデビューしました。",
    },
    {
        id: 10,
        question: "彼らの共同生活ハウスの名前は？",
        options: ["SEKAI HOUSE", "OWARI ROOM", "club EARTH", "セカオワハウス"],
        correctAnswer: 3,
        explanation: "メンバーが共同生活を送っているシェアハウスは「セカオワハウス」と呼ばれています。「club EARTH」は彼らが作ったライブハウスです。",
    },
];

export const getRank = (score: number) => {
    if (score === 10) return { title: "SEKAI NO OWARI マスター", message: "完璧です！あなたは真のメンバーかもしれません。" };
    if (score >= 8) return { title: "Fukase レベル", message: "素晴らしい知識！相当なファンですね。" };
    if (score >= 6) return { title: "Nakajin レベル", message: "なかなかの知識です。あと一歩！" };
    if (score >= 4) return { title: "Saori レベル", message: "基本は押さえていますね。もっと深く知りましょう！" };
    return { title: "DJ LOVE レベル", message: "これからもっと詳しくなっていきましょう！" };
};
