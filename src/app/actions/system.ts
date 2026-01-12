"use server";

import { clearCache } from "@/lib/database";

export async function clearServerCache() {
    clearCache();
    return { success: true };
}
