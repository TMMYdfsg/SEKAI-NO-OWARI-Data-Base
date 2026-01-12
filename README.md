# SEKAI NO OWARI Data Base

A comprehensive fan-made database and media player application dedicated to the band **SEKAI NO OWARI**. This project allows users to manage a local music library, explore discography, view history, and customize their experience with a rich, interactive UI.

## 🌟 Key Features

### 🎵 Immersive Music Player
-   **Global Player**: A persistent mini-player with an expandable "Immersive Mode".
-   **Visualizer**: Real-time audio visualization with multiple modes (Bars, Wave, Particles, Minimal).
-   **Lyrics Sync**: Auto-scrolling lyrics display synced to playback progress.
-   **Background**: Dynamic blurred background based on the current track's album art.

### 🏠 Interactive Home Dashboard
-   **Today's Pick Up**: A daily random song recommendation selected from your library.
-   **Trivia Widget**: Displays random trivia about the band.
-   **Recent Media**: Quick access to recently added songs and videos.
-   **Calendar**: Visual shortcut to the band's history timeline.

### 📚 Media Library
-   **Songs**: Filterable list of local audio files with detailed metadata.
    -   Integration with **Spotify**, **YouTube**, and **Apple Music**.
    -   Customizable song details (Lyrics, Credits, External Links).
-   **Videos**: Video library management with thumbnail support.
-   **Discography**: visual timeline of albums and singles with 3D cover art flip effects.

### 🕰️ History & Achievements
-   **Timeline**: A chronological view of the band's history.
-   **Map View**: Visualization of live venues and key locations.
-   **Achievements**: Unlockable badges and milestones based on user interaction (e.g., listening habits, puzzles).

### 🎨 Customization
-   **Themes**: Switch between different visual themes.
-   **Member Styles**: Customize member avatars with a layer-based dressing system.
-   **Gallery**: View and manage images, create collages, and generate wallpapers.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Data Storage**: Local Storage & File System (via API routes)

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/TMMYdfsg/SEKAI-NO-OWARI-Data-Base.git
    cd SEKAI-NO-OWARI-Data-Base
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

-   `src/app`: Next.js App Router pages and API routes.
-   `src/components`: Reusable React components (Player, Visualizer, Cards, etc.).
-   `src/contexts`: Global state logic (PlayerContext).
-   `src/lib`: Utility functions and static data.
-   `programs/media`: Default directory for storing local media files.

---

*This project is a fan creation and is not officially affiliated with SEKAI NO OWARI.*
