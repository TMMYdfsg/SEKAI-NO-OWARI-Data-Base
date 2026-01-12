"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, RefreshCw, Calendar as CalendarIcon, Lightbulb, Trophy, Medal, Settings, Eye, EyeOff, GripVertical } from "lucide-react";
import MediaPlayer from "@/components/MediaPlayer";
import { getBadges, getUnlockedAchievements } from "@/lib/local-storage-data";

type MediaFile = {
  name: string;
  path: string;
  type: string;
  thumbnail: string | null;
};

type WidgetConfig = {
  id: string;
  label: string;
  visible: boolean;
  order: number;
};

// Mock Trivia Data (Japanese)
const trivias = [
  "バンド名の由来は、Fukaseが閉鎖病棟への入院などの絶望的な経験を経て、「世界の終わりから始めてみよう」というポジティブな意味が込められています。",
  "2011年のメジャーデビュー時に、表記を「世界の終わり」から現在の「SEKAI NO OWARI」に変更しました。",
  "メンバーとスタッフは「セカオワハウス」と呼ばれるシェアハウスで共同生活を送っていました。",
  "FukaseとNakajinは中学校の同級生で、上履きにゆずの絵が描いてあったことがきっかけで仲良くなりました。",
  "初代DJ LOVEが脱退後、Fukaseが高校時代の友人に「一生のお願い」と頼み込み、現在のDJ LOVEが加入しました。",
  "DJ LOVE以外のメンバーは、2012年のアルバム『ENTERTAINMENT』以降、本名を伏せて活動しています。",
  "SaoriはFukaseの1学年後輩で、幼稚園から高校まで同じ学校に通っていました。",
  "Nakajinはストイックな性格で知られ、編曲の主導や多くの楽器演奏を担当しています。",
  "ライブハウス『club EARTH』は、印刷工場だった地下空間をメンバー自らの手で作りました。",
  "『club EARTH』の制作費は当初6万円の予算でしたが、最終的に約100倍の費用がかかり、メンバーが借金を背負いました。",
  "インディーズデビュー曲『幻の命』は、タワーレコード限定シングルとしてリリースされました。",
  "2014年の『国立競技場 FINAL WEEK JAPAN NIGHT』に出演し、海外活動への意欲を見せました。",
  "映画『TOKYO FANTASY』では、メンバーのステージや楽曲制作の裏側がドキュメンタリーとして描かれています。",
  "「Dragon Night」はニッキー・ロメロがプロデュースし、アメリカでレコーディングされました。",
  "2015年の日産スタジアム公演『Twilight City』では、2日間で約14万人を動員しました。",
  "動物殺処分ゼロプロジェクト「ブレーメン」を立ち上げ、支援活動を行っています。",
  "End of the World名義での活動も行っており、海外アーティストとのコラボレーションも多数発表しています。",
  "Fukaseはライブで「特注のマイク」を使用しています。",
  "DJ LOVEは「二代目」であり、初代とは今でも親交があります。",
  "Saoriは小説「ふたご」で直木賞候補になりました。"
];

export default function Home() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [randomTrivia, setRandomTrivia] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [achievementCount, setAchievementCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Default widget configuration
  const defaultWidgets: WidgetConfig[] = [
    { id: 'media', label: '最近のメディア', visible: true, order: 0 },
    { id: 'trivia', label: '今日の豆知識', visible: true, order: 1 },
    { id: 'calendar', label: 'カレンダー', visible: true, order: 2 },
    { id: 'recommendation', label: 'おすすめ', visible: true, order: 3 },
  ];

  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const WIDGETS_KEY = 'sekaowa_home_widgets';

  useEffect(() => {
    // Load Files
    fetch('/api/files')
      .then(res => res.json())
      .then(data => setMediaFiles(data.files || []))
      .catch(err => console.error(err));

    // Load User Data
    setBadges(getBadges());
    setAchievementCount(getUnlockedAchievements().length);

    // Load widget settings
    const saved = localStorage.getItem(WIDGETS_KEY);
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load widget settings", e);
      }
    }

    // Initial Trivia
    refreshTrivia();
  }, []);

  const toggleWidget = (id: string) => {
    const updated = widgets.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    setWidgets(updated);
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(updated));
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);



  const refreshTrivia = () => {
    const random = trivias[Math.floor(Math.random() * trivias.length)];
    setRandomTrivia(random);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header Area */}
      <div className="pt-24 px-6 mb-8 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-5xl font-thin tracking-wider font-serif text-white/90">HOME</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="ウィジェット設定"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Badges & Achievements Display */}
        <div className="flex flex-col items-end gap-3 translate-y-[-8px]">
          <Link href="/achievements" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all border border-white/5 hover:border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500/70 group-hover:text-yellow-400 transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">Achievements</span>
            </div>
            <span className="text-sm font-mono text-white/90">
              <span className="text-yellow-500">{achievementCount}</span> <span className="text-muted-foreground">/</span> 105
            </span>
          </Link>

          {badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 max-w-[300px]">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300">
                  <Medal size={10} />
                  {badge}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 px-4 max-w-2xl mx-auto">

        {/* Widget Settings Panel */}
        {showSettings && (
          <div className="bg-card/50 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Settings size={14} />
              ウィジェット設定
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${widget.visible
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                    }`}
                >
                  {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {widget.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Media Section */}
        {sortedWidgets.find(w => w.id === 'media')?.visible && (
          <div className="bg-card/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-sm text-white/80 font-medium">最近のメディア</h2>
                <p className="text-xs text-muted-foreground">MP3 / MP4 (Local)</p>
              </div>
              <Link href="/songs" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <span className="text-xs">View All</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {mediaFiles.length > 0 ? (
                mediaFiles.slice(0, 5).map((file) => (
                  <div key={file.name} className="p-4 hover:bg-white/5 transition-colors">
                    <MediaPlayer filename={file.name} type={file.type} thumbnail={file.thumbnail} />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No media files found in programs/media
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trivia Widget */}
        {sortedWidgets.find(w => w.id === 'trivia')?.visible && (
          <div className="bg-card/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm group">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-primary" />
                <h2 className="text-sm text-white/80 font-medium">今日の豆知識</h2>
              </div>
              <button onClick={refreshTrivia} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <RefreshCw size={14} className="text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/90 leading-relaxed font-light">
                {randomTrivia}
              </p>
              <div className="mt-4 text-xs text-muted-foreground text-right">
                sekainoowari_trivia
              </div>
            </div>
          </div>
        )}

        {/* Calendar Widget */}
        {sortedWidgets.find(w => w.id === 'calendar')?.visible && (
          <Link href="/history" className="block bg-card/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-primary/30 transition-colors">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-sm text-white/80 font-medium tracking-wide">SEKAOWA CALENDAR</h2>
                <p className="text-xs text-muted-foreground">[タップして年表を見る]</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
            <div className="p-6 pt-2">
              <div className="flex items-end gap-3">
                <CalendarIcon size={32} className="text-primary/80 mb-1" />
                <span className="text-3xl font-light text-white">{dateStr}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Recommendation Widget (Placeholder) */}
        {sortedWidgets.find(w => w.id === 'recommendation')?.visible && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <h2 className="text-sm text-muted-foreground mb-4 relative z-10">Today's Recommendation</h2>
            <div className="text-xl font-serif text-white tracking-widest relative z-10">
              SCENT OF MEMORY
            </div>
            <Link href="/discography" className="mt-4 inline-block text-xs text-primary underline underline-offset-4 relative z-10">
              View Details
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
