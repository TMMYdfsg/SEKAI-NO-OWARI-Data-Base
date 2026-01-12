export type Member = {
    id: string;
    name: string;
    role: string;
    instruments: string[];
    color: string;
    bio: string;
    image: string;
};

export const members: Member[] = [
    {
        id: "fukase",
        name: "Fukase",
        role: "Vocal / Concept Creator",
        instruments: ["Vocal", "Guitar", "Bass"],
        color: "#E60033", // Red-ish
        bio: "SEKAI NO OWARIのボーカルかつ楽曲の多くの作詞・作曲を手がける。独特な歌声と世界観を持つ。",
        image: "/images/members/fukase.jpg",
    },
    {
        id: "nakajin",
        name: "Nakajin",
        role: "Leader / Sound Produce",
        instruments: ["Guitar", "Sound Programming", "Percussion", "Chorus"],
        color: "#F39800", // Orange-ish
        bio: "リーダーであり、バンドのサウンドプロデュースを担当。多くの楽器を演奏するマルチプレイヤー。",
        image: "/images/members/nakajin.jpg",
    },
    {
        id: "saori",
        name: "Saori",
        role: "Piano / Show Produce",
        instruments: ["Piano", "Accordion", "Keyboards"],
        color: "#E4007F", // Pink-ish
        bio: "ピアノ演奏に加え、ライブの演出も手がける。小説家としても活動。",
        image: "/images/members/saori.jpg",
    },
    {
        id: "djlove",
        name: "DJ LOVE",
        role: "DJ / Sound Select",
        instruments: ["DJ Controller", "Manipulator"],
        color: "#00A0E9", // Blue-ish
        bio: "ピエロのマスクがトレードマーク。サウンドの選択やお笑い担当（？）としてバンドを支える。",
        image: "/images/members/djlove.jpg",
    },
];
