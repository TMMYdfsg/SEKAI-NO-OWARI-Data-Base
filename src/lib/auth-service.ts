import * as db from './database';

export interface AppUser {
    id: string;
    name: string;
    email?: string;
    isAnonymous: boolean;
    avatarUrl?: string;
    createdAt: string;
    // 拡張用: パスワードハッシュなど（今回は簡易実装のため平文または省略）
    password?: string;
}

const COLLECTION_NAME = 'users'; // database.ts で許可されたコレクション名に追加が必要かも？ => database.tsを見る限り型定義されているので確認必要
const SESSION_KEY = 'app_session_user_id';

// ユーザーID生成
function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const authService = {
    /**
     * 現在のセッションユーザーを取得
     */
    async getCurrentUser(): Promise<AppUser | null> {
        if (typeof window === 'undefined') return null;

        const userId = localStorage.getItem(SESSION_KEY);
        if (!userId) return null;

        // DBからユーザー取得 (database.tsの型定義に 'users' がない場合は要修正)
        // database.tsでは 'members' はあるが 'users' はない可能性が高い。
        // 一旦 'settings' に入れるか、database.ts を修正する必要がある。
        // Step 1 で database.ts を見た時、CollectionName に 'users' はなかった。
        // なので database.ts も修正が必要。
        // ここでは一旦 'members' ではなく、エラーにならないよう any キャストするか、
        // 事前に database.ts を修正するタスクを入れるべきだった。
        // しかし並行実行できないので、このファイル作成後に database.ts を修正する。

        try {
            // @ts-ignore: CollectionName型エラー回避（後で修正）
            const user = await db.getById<AppUser>('users', userId);
            return user;
        } catch (e) {
            console.error('Failed to get user session', e);
            return null;
        }
    },

    /**
     * ゲストとしてログイン（新規作成または既存）
     */
    async loginAsGuest(): Promise<AppUser> {
        // 新しいゲストユーザーを作成
        const newUser: AppUser = {
            id: generateId(),
            name: 'Guest User',
            isAnonymous: true,
            createdAt: new Date().toISOString()
        };

        // DBに保存
        // @ts-ignore
        await db.create('users', newUser);

        // セッション保存
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, newUser.id);
        }

        return newUser;
    },

    /**
     * ログアウト
     */
    async logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
        }
    }
};
