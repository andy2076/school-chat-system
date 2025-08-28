# 📚 School Chat System

LINEのLIFFアプリとNode.jsを使った学校向けチャットシステム

## 🌟 主な機能

- 📱 **LIFFアプリ**: LINE内で動作するWebアプリ
- 🔐 **二段階認証**: LINE認証 + 学校認証コード
- 💬 **リアルタイムチャット**: Socket.IO によるリアルタイム通信
- 📧 **プッシュ通知**: Webプッシュ通知対応
- 👨‍💼 **管理者機能**: 全ルーム閲覧・ユーザー管理
- 📱 **レスポンシブ**: スマホ・タブレット・PC対応

## 🏗️ プロジェクト構成

```
school-chat-system/
├── backend/           # Node.js/Express API サーバー
│   ├── src/
│   │   ├── api/       # API エンドポイント
│   │   ├── core/      # ビジネスロジック
│   │   ├── db/        # データベース関連
│   │   ├── middleware/# ミドルウェア
│   │   └── app.js     # メインサーバー
│   └── package.json
├── frontend/          # React/LIFF アプリ
│   ├── src/
│   │   ├── components/# UI コンポーネント
│   │   ├── pages/     # ページコンポーネント
│   │   ├── services/  # API・LIFF 連携
│   │   └── App.js     # メインアプリ
│   └── package.json
├── package.json       # ルートレベル設定
├── deploy.sh          # デプロイスクリプト
├── Dockerfile         # Docker設定
└── render.yaml        # Render デプロイ設定
```

## 🚀 ローカル開発環境のセットアップ

### 1. リポジトリをクローン
```bash
git clone <your-repo-url>
cd school-chat-system
```

### 2. 依存関係をインストール
```bash
# 全体の依存関係をインストール
npm run install:all
```

### 3. 環境変数を設定
```bash
# バックエンドの環境変数
cd backend
cp .env.example .env
# .env ファイルを編集して必要な値を設定
```

### 4. 開発サーバーを起動
```bash
# ルートディレクトリで実行（バックエンド・フロントエンド同時起動）
npm run dev
```

### 5. アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **ヘルスチェック**: http://localhost:3001/api/health

## 📦 デプロイ方法

### Render でのデプロイ

#### 方法1: render.yaml を使用（推奨）
1. Renderでリポジトリを接続
2. `render.yaml`が自動で検出される
3. 環境変数を設定
4. デプロイ実行

#### 方法2: 手動設定
1. **Web Service** を作成
2. 以下の設定を入力:
   - **Build Command**: `npm run deploy:prepare`
   - **Start Command**: `npm start`
   - **Node Version**: 18以上

#### 必要な環境変数
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-jwt-secret-key
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

### Heroku でのデプロイ
```bash
# Heroku CLI でデプロイ
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# 他の環境変数も設定
git push heroku main
```

### Docker でのデプロイ
```bash
# イメージをビルド
docker build -t school-chat-system .

# コンテナを実行
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  school-chat-system

# または docker-compose を使用
docker-compose up -d
```

## 🔧 デプロイエラーの解決方法

### エラー: `package.json が見つからない`
**原因**: デプロイサービスがプロジェクト構造を認識できない

**解決方法**:
1. ルートレベルの `package.json` が作成済み ✅
2. デプロイコマンドを確認:
   ```bash
   # Build Command
   npm run deploy:prepare
   
   # Start Command  
   npm start
   ```

### エラー: `モジュールが見つからない`
**解決方法**:
```bash
# 依存関係を再インストール
npm run install:all
```

### エラー: `ポートが利用できない`
**解決方法**: 環境変数 `PORT` を設定
```bash
# Render の場合
PORT=10000

# Heroku の場合（自動設定）
PORT=$PORT
```

## 🗄️ データベース設定

### PostgreSQL（推奨）
```bash
# 接続設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_chat_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### テーブル作成（TODO）
```sql
-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- その他のテーブルは実装時に追加
```

## 📋 開発タスク

### 現在の状態
- ✅ プロジェクト構造作成
- ✅ バックエンド雛形
- ✅ フロントエンド雛形  
- ✅ デプロイ設定
- ⏳ データベース実装
- ⏳ 認証機能実装
- ⏳ チャット機能実装
- ⏳ 通知機能実装

### 次のステップ
1. データベーススキーマ設計・実装
2. LINE LIFF設定・認証機能実装
3. リアルタイムチャット機能実装
4. 通知機能実装
5. 管理者機能実装

## 🛠️ 開発コマンド

```bash
# 開発環境での起動
npm run dev

# バックエンドのみ起動  
npm run dev:backend

# フロントエンドのみ起動
npm run dev:frontend

# ビルド（本番用）
npm run build

# テスト実行
npm run test

# コードチェック
npm run lint

# 依存関係インストール
npm run install:all
```

## 🤝 貢献方法

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📧 サポート

質問や問題がある場合は、以下の方法でお問い合わせください:

- GitHub Issues: [プロジェクトのIssues](https://github.com/your-username/school-chat-system/issues)
- Email: your-email@example.com

---

**School Chat System** - 学校コミュニケーションをより便利に 🎓