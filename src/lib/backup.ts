export interface BackupData {
    version: number;
    timestamp: string;
    data: Record<string, any>;
}

const BACKUP_VERSION = 1;
const APP_PREFIX = "sekaowa_";

export function exportData(): void {
    if (typeof window === 'undefined') return;

    const data: Record<string, any> = {};

    // Collect all keys starting with the app prefix
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    data[key] = JSON.parse(value);
                }
            } catch (e) {
                console.warn(`Failed to parse key ${key} for backup`, e);
                // If not JSON, save as string
                data[key] = localStorage.getItem(key);
            }
        }
    }

    const backup: BackupData = {
        version: BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        data: data
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sekaowa_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
        try {
            const backup: BackupData = JSON.parse(jsonString);

            // Basic validation
            if (!backup.data || typeof backup.data !== 'object') {
                resolve({ success: false, message: "Invalid backup file format." });
                return;
            }

            // Restore data
            Object.entries(backup.data).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, String(value));
                }
            });

            resolve({ success: true, message: "Data restored successfully. content will reload." });

            // Reload to apply changes (simplest way to sync state)
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (e) {
            console.error("Import failed:", e);
            resolve({ success: false, message: "Failed to parse backup file." });
        }
    });
}
