import type { Metadata } from "next";
import { Cinzel, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalPlayer from "@/components/GlobalPlayer";
import { AuthProvider } from "@/contexts/AuthContext";

// ... existing code ...

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
          </LanguageProvider >
        </ThemeProvider >
      </body >
    </html >
  );
}
