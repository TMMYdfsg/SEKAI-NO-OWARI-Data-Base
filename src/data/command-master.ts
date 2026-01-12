export interface HiddenCommand {
    id: string; // Unique ID
    displayName: string;
    command: string; // The actual command string
    hint: string;
    isSecret: boolean; // If true, only show ??? when locked
}

export const hiddenCommandList: HiddenCommand[] = [
    { id: "cmd_radio", displayName: "ラジオ", command: "RADIO", hint: "終わりのない放送局", isSecret: true },
    { id: "cmd_phoenix", displayName: "白い太陽", command: "PHOENIX", hint: "何度も蘇る鳥", isSecret: true },
    { id: "cmd_lovewarz", displayName: "平和の処刑", command: "LOVEWARZ", hint: "僕らの平和を守るため", isSecret: true },
    { id: "cmd_carnival", displayName: "死の女神", command: "CARNIVAL", hint: "炎と森のパレード", isSecret: true },
    { id: "cmd_death", displayName: "神への問い", command: "DEATH", hint: "クエスチョン", isSecret: true },
    { id: "cmd_anti", displayName: "正義の味方", command: "ANTI", hint: "悪党になる選択", isSecret: true },
    { id: "cmd_sos", displayName: "救難信号", command: "...---...", hint: "モールス信号", isSecret: true },
    { id: "cmd_witch", displayName: "魔女", command: "WITCH", hint: "法廷に立つ", isSecret: true },
    { id: "cmd_rafflesia", displayName: "悪臭の花", command: "RAFFLESIA", hint: "美しい花の香り", isSecret: true },
    { id: "cmd_scent", displayName: "トラウマ", command: "SCENT", hint: "強烈な匂いの記憶", isSecret: true },
    { id: "cmd_utopia", displayName: "理想郷", command: "UTOPIA", hint: "完璧な管理社会", isSecret: true },
    { id: "cmd_whitecd", displayName: "時間停止", command: "WHITECD", hint: "白い時計", isSecret: true },
    { id: "cmd_nautilus", displayName: "深海", command: "NAUTILUS", hint: "潜水艦", isSecret: true },
    { id: "cmd_nowar", displayName: "NO WARの扉", command: "NOWAR", hint: "赤い5文字、順番がある", isSecret: true },
    { id: "cmd_complete", displayName: "終わりの始まり", command: "sekai NO oWARi", hint: "世界の終わり (完全一致)", isSecret: true },

    // Lyrics based (simplified for list)
    { id: "lyric_fantasy", displayName: "現実逃避", command: "FANTASY", hint: "Let's dance", isSecret: true },
    { id: "lyric_sleep", displayName: "眠り姫", command: "SLEEP", hint: "死ぬまで眠らない", isSecret: true },
    { id: "lyric_magic", displayName: "告白", command: "MAGIC", hint: "カフェミケランジェロ", isSecret: true },
    { id: "cmd_error", displayName: "禁断のプログラム", command: "ERROR", hint: "3回失敗した後に", isSecret: true },
    { id: "lyric_scent", displayName: "残り香の追憶", command: "LIKE A SCENT", hint: "匂いのように", isSecret: true },
];
