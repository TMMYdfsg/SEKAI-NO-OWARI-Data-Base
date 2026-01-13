import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

const COLLECTIONS = {
    FAVORITES: "favorites",
    HISTORY: "history",
    PLAYLISTS: "playlists"
};

const STORAGE_KEYS = {
    FAVORITES: "sekaowa_favorites",
    HISTORY: "sekaowa_history",
    PLAYLISTS: "sekaowa_custom_playlists"
};

/**
 * Pushes local data to Firestore (Backup)
 */
export async function pushToCloud(user: User) {
    if (!user) return;

    try {
        const batch = {
            updatedAt: Timestamp.now(),
            favorites: JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || "[]"),
            history: JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"),
            playlists: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS) || "[]"),
        };

        await setDoc(doc(db, "users", user.uid), batch, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Failed to push data to cloud:", error);
        throw error;
    }
}

/**
 * Pulls data from Firestore to local storage (Restore)
 * Warning: This overwrites local data
 */
export async function pullFromCloud(user: User) {
    if (!user) return;

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.favorites) localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
            if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
            if (data.playlists) localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(data.playlists));

            // Reload the page to reflect changes or dispatch custom event
            // window.location.reload(); 
            return { success: true, data };
        } else {
            return { success: false, message: "No cloud data found" };
        }
    } catch (error) {
        console.error("Failed to pull data from cloud:", error);
        throw error;
    }
}
