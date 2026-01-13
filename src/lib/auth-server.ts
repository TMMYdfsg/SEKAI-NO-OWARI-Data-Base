import * as db from './database';

export interface AppUser {
    id: string;
    name: string;
    email?: string;
    isAnonymous: boolean;
    avatarUrl?: string;
    createdAt: string;
    password?: string;
}

const COLLECTION_NAME = 'users';

export const authServer = {
    async getUserById(userId: string): Promise<AppUser | null> {
        try {
            // @ts-ignore
            return await db.getById<AppUser>(COLLECTION_NAME, userId);
        } catch (e) {
            console.error('Failed to get user from DB', e);
            return null;
        }
    },

    async createGuestUser(): Promise<AppUser> {
        const newUser: AppUser = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            name: 'Guest User',
            isAnonymous: true,
            createdAt: new Date().toISOString()
        };

        // @ts-ignore
        await db.create(COLLECTION_NAME, newUser);
        return newUser;
    }
};
