# クラウド同期 & 認証システム 実装計画書 (Draft)

## 1. 目的
現在の「SEKAI NO OWARI DATABASE」はローカルストレージに依存しており、以下の課題がある。
- 複数デバイス（PC/スマホ）間でデータ（お気に入り、再生履歴、クイズスコア）が同期されない。
- ブラウザのキャッシュクリア等でデータが消失するリスクがある。

本計画書は、これらの課題を解決するためのクラウド同期システムの要件と技術選定をまとめたものである。

## 2. 技術選定

### バックエンド・認証基盤: **Firebase (Google)**
- **選定理由**:
    - Next.js との親和性が高い。
    - Authentication（認証）と Firestore（DB）を一括で管理できる。
    - 無料枠（Sparkプラン）で十分な運用が可能。
    - リアルタイム同期機能が強力。

### データ管理の変更点

| データ種別 | 現在 (LocalStorage) | 将来 (Firestore) |
|---|---|---|
| ユーザー認証 | なし (全員ゲスト) | Firebase Auth (Googleログイン等) |
| 再生履歴 | `sekaowa_history` | `users/{uid}/history` コレクション |
| お気に入り | `sekaowa_favorites` | `users/{uid}/favorites` ドキュメント |
| プレイリスト | `sekaowa_playlists` | `users/{uid}/playlists` コレクション |
| クイズデータ | `sekaowa_quiz_data` | `quizzes` (global) & `users/{uid}/scores` |

## 3. 実装ロードマップ

### Phase 1: 認証基盤の導入
1.  **Firebase Project作成**: コンソールでのセットアップ。
2.  **SDK導入**: `firebase` パッケージのインストール。
3.  **Auth Context**: ログイン状態を管理する `AuthContext` の実装。
4.  **UI実装**: ログインボタン、プロフィールアイコンの作成。

### Phase 2: データ移行機能
1.  **初回ログイン時**: ローカルストレージのデータを検出し、クラウドへアップロードするか確認するダイアログを表示。
2.  **統合ロジック**: クラウド上のデータとローカルデータのマージ戦略（タイムスタンプベース）。

### Phase 3: リアルタイム同期
1.  **Listener実装**: `onSnapshot` を使用して、他デバイスでの変更を即座に反映。
2.  **オフライン対応**: Firestoreのオフライン永続化機能を有効化。

## 4. セキュリティルール案 (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー自身のデータのみ読み書き可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // 公開クイズデータなどは読み取り専用
    match /public_data/{document=**} {
      allow read: if true;
      allow write: if false; // 管理者のみ
    }
  }
}
```

## 5. 懸念事項・対応策
- **画像データの扱い**:
    - 現在ローカルパスやBase64で保存されているカスタム画像（メンバー着せ替え等）は容量が大きいため、Firestoreには適さない。
    - **対応**: Firebase Storage を併用し、DBにはアクセスURLのみ保存する設計に変更が必要。

---
作成日: 2026-01-13
作成者: AI Assistant
