export type HistoryEvent = {
    year: string;
    title: string;
    description: string;
    type: "Live" | "Release" | "Milestone" | "Formation";
    location?: {
        lat: number;
        lng: number;
        name: string;
    };
};

export const history: HistoryEvent[] = [
    {
        year: "2026",
        title: "DOME TOUR 2026 'THE CINEMA'",
        description: "全2都市4公演のドームツアー開催予定（7月～8月）。",
        type: "Live",
    },
    {
        year: "2025",
        title: "シングル『琥珀/図鑑』リリース",
        description: "映画『少年と犬』主題歌「琥珀」とアニメ主題歌「図鑑」の両A面シングル。",
        type: "Release",
    },
    {
        year: "2025",
        title: "ASIA TOUR 2025 'Phoenix'",
        description: "約6年ぶりとなるアジアツアーを開催（9月～11月）。",
        type: "Live",
        location: { lat: 35.6586, lng: 139.7454, name: "Asia (Start)" } // 便宜上東京
    },
    {
        year: "2024",
        title: "ARENA TOUR 2024 '深海'",
        description: "バンド史上最大規模のアリーナツアー（3月～8月）。",
        type: "Live",
        location: { lat: 35.6698, lng: 139.7088, name: "Yoyogi National Stadium" }
    },
    {
        year: "2024",
        title: "アルバム『Nautilus』リリース",
        description: "7thオリジナルアルバム。",
        type: "Release",
    },
    {
        year: "2023",
        title: "レコード大賞受賞 (2022)",
        description: "「Habit」で第64回日本レコード大賞を受賞（授賞式は2022年末）。",
        type: "Milestone",
        location: { lat: 35.6888, lng: 139.6917, name: "New National Theatre" }
    },
    {
        year: "2022",
        title: "DOME TOUR 2022 'Du Gara Di Du'",
        description: "自身初のドームツアー。テーマパークのような世界観。",
        type: "Live",
        location: { lat: 35.1856, lng: 136.9474, name: "Vantelin Dome Nagoya" } // スタート地など
    },
    {
        year: "2021",
        title: "アルバム『scent of memory』リリース",
        description: "香りをテーマにした6thアルバム。",
        type: "Release",
    },
    {
        year: "2020",
        title: "ベストアルバム『SEKAI NO OWARI 2010-2019』",
        description: "デビュー10周年を記念した初のベストアルバム。",
        type: "Release",
    },
    {
        year: "2019",
        title: "TOUR 2019 'The Colors'",
        description: "アジア展開も含めた大規模ツアー。",
        type: "Live",
        location: { lat: 36.6433, lng: 138.1887, name: "Nagano Big Hat" } // ツアー初日等の例
    },
    {
        year: "2019",
        title: "アルバム『Eye』『Lip』同時リリース",
        description: "対となるコンセプトの2枚のアルバムを同時発売。",
        type: "Release",
    },
    {
        year: "2018",
        title: "野外ツアー 'INSOMNIA TRAIN'",
        description: "巨大な移動式列車セットを用いた野外ツアー。",
        type: "Live",
        location: { lat: 32.9688, lng: 131.02, name: "Kumamoto Country Park" } // スタート地
    },
    {
        year: "2017",
        title: "ドーム・スタジアムツアー 'Tarkus'",
        description: "動物の語り部による物語形式のライブ。",
        type: "Live",
        location: { lat: 35.8453, lng: 139.6389, name: "Saitama Super Arena" }
    },
    {
        year: "2016",
        title: "全国ツアー 'The Dinner'",
        description: "ダークファンタジーな世界観の演出。",
        type: "Live",
        location: { lat: 35.6491, lng: 140.0437, name: "Makuhari Messe" }
    },
    {
        year: "2015",
        title: "アルバム『Tree』リリース",
        description: "オリコン週間1位を獲得した3rdアルバム。",
        type: "Release",
    },
    {
        year: "2015",
        title: "日産スタジアム公演 'Twilight City'",
        description: "2日間で約14万人を動員した大規模ライブ。",
        type: "Live",
        location: { lat: 35.5100, lng: 139.6062, name: "Nissan Stadium" }
    },
    {
        year: "2014",
        title: "映画『TOKYO FANTASY』公開",
        description: "バンドのドキュメンタリー映画が公開。",
        type: "Milestone",
    },
    {
        year: "2014",
        title: "「Dragon Night」リリース",
        description: "ニッキー・ロメロ プロデュースのヒット曲。",
        type: "Release",
    },
    {
        year: "2013",
        title: "野外企画 '炎と森のカーニバル'",
        description: "自身初の野外自主企画イベント。",
        type: "Live",
        location: { lat: 35.3486, lng: 138.7497, name: "Fujikyu Highland Conifer Forest" }
    },
    {
        year: "2012",
        title: "アルバム『ENTERTAINMENT』リリース",
        description: "メジャー1stアルバム。レコ大優秀アルバム賞受賞。",
        type: "Release",
    },
    {
        year: "2011",
        title: "日本武道館公演",
        description: "メジャーデビューからわずか3ヶ月での武道館公演。",
        type: "Live",
        location: { lat: 35.6933, lng: 139.7497, name: "Nippon Budokan" }
    },
    {
        year: "2011",
        title: "メジャーデビュー",
        description: "シングル『INORI』でメジャーデビュー。「SEKAI NO OWARI」に改名。",
        type: "Milestone",
    },
    {
        year: "2010",
        title: "インディーズデビュー",
        description: "シングル『幻の命』、アルバム『EARTH』をリリース。",
        type: "Release",
    },
    {
        year: "2007",
        title: "結成",
        description: "前身バンドを経て「世界の終わり」を結成。club EARTHを設立。",
        type: "Formation",
        location: { lat: 35.5552, lng: 139.6953, name: "club EARTH" }
    },
    {
        year: "2006",
        title: "club EARTH 設立",
        description: "印刷工場跡地を自分たちで改装しライブハウスを作る。",
        type: "Formation",
        location: { lat: 35.5552, lng: 139.6953, name: "club EARTH" }
    },
];
