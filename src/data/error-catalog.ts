export type ErrorCategory = "GENERAL" | "NOT FOUND" | "PLAYBACK" | "LINKS" | "HIDDEN";

export interface ErrorCard {
    id: string; // e.g., E-404
    code: string; // e.g., 404
    title: string;
    category: ErrorCategory;
    shortDesc: string; // 1-line description
    longDesc: string; // Detail description
    relatedSongs?: {
        title: string;
        id?: string; // For linking to player or spotify if needed
    }[];
    fragments?: string[]; // Optional arbitrary text fragments
}

export const errorCatalog: ErrorCard[] = [
    // --- GENERAL ---
    {
        id: "E-000",
        code: "000",
        title: "SYSTEM_READY",
        category: "GENERAL",
        shortDesc: "システムは正常に稼働しています。",
        longDesc: "全てのセッションにおいて異常は検知されていません。しかし、正常であるという定義は誰が決めたのでしょうか。システムは常に観測されています。",
        fragments: [
            "正常とは、異常の欠如ではない。",
            "観測者がいなければ、エラーは存在しない。",
        ]
    },
    {
        id: "E-001",
        code: "001",
        title: "USER_UNKNOWN",
        category: "GENERAL",
        shortDesc: "ユーザープロファイルが特定できません。",
        longDesc: "アクセス元のユーザーIDはデータベースに存在しません。あなたはゲストですか？それとも、かつてここにいた誰かですか？",
    },

    // --- NOT FOUND ---
    {
        id: "E-404",
        code: "404",
        title: "NOT_FOUND",
        category: "NOT FOUND",
        shortDesc: "リクエストされたリソースは見つかりませんでした。",
        longDesc: "探しているページ、ファイル、あるいは記憶は、この座標には存在しません。削除されたか、移動したか、あるいは最初から幻だった可能性があります。",
        relatedSongs: [
            { title: "幻の命" },
            { title: "illusion" }
        ],
        fragments: [
            "ないものねだり。",
            "消えたのではなく、見えなくなっただけ。",
        ]
    },
    {
        id: "E-403",
        code: "403",
        title: "FORBIDDEN",
        category: "NOT FOUND",
        shortDesc: "アクセス権限がありません。",
        longDesc: "このエリアへの立ち入りは制限されています。許可されたキーを持つ者のみが、扉の向こう側を知ることができます。",
        relatedSongs: [
            { title: "ANTI-HERO" }
        ]
    },

    // --- PLAYBACK ---
    {
        id: "E-500",
        code: "500",
        title: "PLAYBACK_ERROR",
        category: "PLAYBACK",
        shortDesc: "再生中に予期せぬエラーが発生しました。",
        longDesc: "音声データのデコードに失敗しました。ノイズが混入しているか、ファイルが破損しています。あるいは、聞くべきではない音が記録されているのかもしれません。",
        relatedSongs: [
            { title: "Death Disco" }
        ]
    },

    // --- LINKS ---
    {
        id: "E-502",
        code: "502",
        title: "BAD_GATEWAY",
        category: "LINKS",
        shortDesc: "不正なゲートウェイです。",
        longDesc: "外部サーバーからの応答が無効です。接続された先は、あなたが意図した場所ではないかもしれません。",
        relatedSongs: [
            { title: "Dragon Night" }
        ]
    },

    // --- HIDDEN ---
    {
        id: "E-666",
        code: "666",
        title: "THE_ERROR",
        category: "HIDDEN",
        shortDesc: "致命的な矛盾が発生しました。",
        longDesc: "E -> R -> R -> O -> R。順序正しく積み上げられたエラーは、時に新たな正解への扉となります。あなたは隠された階層に到達しました。",
        relatedSongs: [
            { title: "Error" },
            { title: "Re:set" }
        ],
        fragments: [
            "終わりから始めてみよう。",
            "正解なんてない。あるのは問いだけだ。",
        ]
    },
    {
        id: "E-999",
        code: "999",
        title: "SECRET_WORLD",
        category: "HIDDEN",
        shortDesc: "未知の領域。",
        longDesc: "システムの監視外領域です。ここでは通常のルールは適用されません。自由に探索し、自分だけの答えを見つけてください。",
        relatedSongs: [
            { title: "Dropout" }
        ]
    }
];
