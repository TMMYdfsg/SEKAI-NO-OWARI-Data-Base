import type { Metadata } from "next";
import { Cinzel, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalPlayer from "@/components/GlobalPlayer";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AchievementNotifier from "@/components/AchievementNotifier";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const noto = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "SEKAI NO OWARI Database",
  description: "A comprehensive database for SEKAI NO OWARI fans.",
  manifest: "/manifest.json",
  themeColor: "#a855f7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SEKAOWA DB",
  },
  icons: {
    icon: "/icons/icon-192x192.svg",
    apple: "/icons/icon-192x192.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${cinzel.variable} ${noto.variable} font-sans min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <PlayerProvider>
              <AuthProvider>
                <ServiceWorkerRegistration />
                <AchievementNotifier />
                <Navbar />
                <main className="flex-grow pt-16 pb-24">
                  {children}
                </main>
                <GlobalPlayer />
                <footer className="border-t border-white/10 py-6 text-center text-sm text-muted-foreground bg-background/50">
                  <p>© {new Date().getFullYear()} SEKAI NO OWARI Database / Unofficial Fan Site</p>
                </footer>
              </AuthProvider>
            </PlayerProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
