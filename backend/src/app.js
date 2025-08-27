const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());

// CORS設定
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // リクエスト数の上限
});
app.use(limiter);

// リクエストボディのパース
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// TODO: データベース接続の設定
// const dbClient = require('./db/client');

// TODO: ミドルウェアの読み込み
// const authMiddleware = require('./middleware/authMiddleware');
// const errorMiddleware = require('./middleware/errorMiddleware');

// ヘルスチェック用エンドポイント
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'School Chat System API is running',
    timestamp: new Date().toISOString()
  });
});

// API ルーターの設定（TODO: 各ルーターファイル作成後に有効化）
// app.use('/api/auth', require('./api/auth'));
// app.use('/api/messages', require('./api/messages'));
// app.use('/api/rooms', require('./api/rooms'));
// app.use('/api/admin', require('./api/admin'));

// 404エラーハンドリング
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Path ${req.originalUrl} not found`
  });
});

// TODO: エラーミドルウェアの適用
// app.use(errorMiddleware);

// TODO: Socket.IOの設定（リアルタイムチャット用）
// const http = require('http');
// const socketIo = require('socket.io');
// const server = http.createServer(app);
// const io = socketIo(server);

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 School Chat System API server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;