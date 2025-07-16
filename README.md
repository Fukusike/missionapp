
# 学習ミッションアプリ（StudyQuest）

学習管理とゲーミフィケーションを組み合わせた、友達と一緒に学習を進められるWebアプリケーションです。

## 概要

StudyQuestは、日々の学習を楽しいミッションに変える学習管理アプリです。友達と競い合いながら、課題提出やランキング機能を通じて学習のモチベーションを向上させます。

## 主な機能

### 🎯 コア機能
- **ユーザー認証**: ログイン・ログアウト・新規登録
- **課題提出**: 画像付きで課題を提出し、ポイント獲得
- **友達機能**: 友達申請・承認・ランキング表示
- **講義管理**: 講義の登録・編集・削除
- **通知システム**: リアルタイム通知とメール通知
- **ランキング**: 友達間でのポイントランキング

### 📧 通知機能
- **友達申請通知**: 友達申請時の通知
- **友達承認通知**: 申請承認時の通知
- **ランキング変動通知**: 順位変動時の通知
- **メール通知**: 各種イベントのメール配信

### 🎮 ゲーミフィケーション
- **ポイント制**: 課題提出でポイント獲得
- **ランキング**: 友達間でのリアルタイム順位表示
- **バッジシステム**: 達成度に応じたバッジ機能

## 技術構成

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React

### バックエンド
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: 直接SQL（pg）
- **File Upload**: Next.js built-in

### インフラ・デプロイ
- **Platform**: Replit
- **Database**: Replit PostgreSQL
- **Static Files**: Public directory
- **Port**: 3000 (開発), 5000 (本番推奨)

## データベース構成

### 主要テーブル
- `users`: ユーザー情報
- `friendships`: 友達関係
- `submissions`: 課題提出履歴
- `notifications`: 通知管理
- `courses`: 講義管理
- `email_templates`: メールテンプレート
- `email_logs`: メール送信ログ
- `notification_templates`: 通知文言テンプレート

## セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local`ファイルを作成し、以下を設定：
```bash
DATABASE_URL=your_postgresql_connection_string
```

### 3. データベース初期化
```bash
npx tsx scripts/init-db.ts
```

### 4. 初期データの登録
```bash
# メールテンプレート初期データ
psql $DATABASE_URL -f scripts/init-email-templates.sql

# 通知テンプレート初期データ
psql $DATABASE_URL -f scripts/init-notification-templates.sql
```

### 5. 開発サーバー起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 でアクセス可能です。

## デプロイ手順

### Replitでのデプロイ
1. Replit上でプロジェクトを開く
2. Deploymentタブを開く
3. Static DeploymentまたはAutoscale Deploymentを選択
4. Build Command: `npm run build`
5. Run Command: `npm start`
6. Port: 5000を設定
7. 環境変数`DATABASE_URL`を設定
8. Deployボタンをクリック

## 開発ガイド

### ディレクトリ構成
```
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   ├── (pages)/         # ページコンポーネント
│   └── globals.css      # グローバルスタイル
├── components/          # 再利用可能コンポーネント
├── utils/              # ユーティリティ関数
├── scripts/            # データベース初期化スクリプト
└── public/             # 静的ファイル
```

### 主要な設定ファイル
- `next.config.mjs`: Next.js設定
- `tailwind.config.ts`: Tailwind CSS設定
- `tsconfig.json`: TypeScript設定
- `package.json`: 依存関係とスクリプト

## API エンドポイント

### 認証
- `POST /api/auth/login`: ログイン
- `POST /api/auth/logout`: ログアウト
- `GET /api/auth/session`: セッション確認

### ユーザー
- `GET /api/users`: ユーザー一覧
- `GET /api/users/[id]`: ユーザー詳細
- `PUT /api/users/[id]`: ユーザー更新

### 友達
- `POST /api/friends`: 友達申請
- `GET /api/friends`: 友達一覧・申請一覧

### 課題提出
- `POST /api/submissions`: 課題提出
- `GET /api/submissions`: 提出履歴

### 講義管理
- `GET /api/courses`: 講義一覧
- `POST /api/courses`: 講義作成
- `PUT /api/courses/[id]`: 講義更新
- `DELETE /api/courses/[id]`: 講義削除

### 通知
- `GET /api/notifications`: 通知一覧

## トラブルシューティング

### データベース接続エラー
- 環境変数`DATABASE_URL`が正しく設定されているか確認
- PostgreSQLサービスが起動しているか確認

### メール送信エラー
- メールテンプレートが正しく登録されているか確認
- メール送信設定が適切に構成されているか確認

### 通知が表示されない
- 通知テンプレートが正しく登録されているか確認
- Zustandストアの状態を確認

## 貢献

プルリクエストやイシューの報告を歓迎します。開発に参加される場合は、まずイシューを作成してディスカッションを行ってください。
