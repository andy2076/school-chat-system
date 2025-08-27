const express = require('express');
const router = express.Router();

/**
 * トークルーム関連のAPIエンドポイント
 * - ルーム一覧取得
 * - ルーム作成・管理
 * - ルームメンバー管理
 */

// TODO: チャットサービスの読み込み
// const chatService = require('../core/chatService');
// TODO: 認証ミドルウェアの読み込み
// const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/rooms
 * ユーザーが参加しているルーム一覧を取得
 * @header {string} Authorization - Bearer token
 */
router.get('/', async (req, res) => {
  try {
    // TODO: 認証チェック
    // TODO: ユーザーが参加しているルーム一覧の取得
    // TODO: 各ルームの未読メッセージ数も含める
    
    res.status(501).json({ 
      message: 'Get user rooms endpoint - not implemented yet'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rooms/:roomId
 * 指定したルームの詳細情報を取得
 * @param {string} roomId - ルームID
 */
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // TODO: 認証チェック
    // TODO: ルームへのアクセス権限チェック
    // TODO: ルーム詳細情報の取得
    
    res.status(501).json({ 
      message: 'Get room details endpoint - not implemented yet',
      roomId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/create
 * 新しいルームを作成（管理者・教職員用）
 * @body {string} roomName - ルーム名
 * @body {string} roomType - ルームタイプ（individual/group）
 * @body {array} memberIds - 参加メンバーのID一覧
 */
router.post('/create', async (req, res) => {
  try {
    const { roomName, roomType, memberIds } = req.body;
    
    // TODO: 管理者または教職員権限チェック
    // TODO: 入力値の検証
    // TODO: ルーム作成
    // TODO: メンバー追加
    
    res.status(501).json({ 
      message: 'Create room endpoint - not implemented yet',
      data: { roomName, roomType, memberIds }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/rooms/:roomId/members
 * ルームメンバーを追加・削除（管理者・教職員用）
 * @param {string} roomId - ルームID
 * @body {string} action - 操作（add/remove）
 * @body {array} memberIds - 対象メンバーのID一覧
 */
router.put('/:roomId/members', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { action, memberIds } = req.body;
    
    // TODO: 管理者または教職員権限チェック
    // TODO: ルームへのアクセス権限チェック
    // TODO: メンバーの追加・削除処理
    
    res.status(501).json({ 
      message: 'Update room members endpoint - not implemented yet',
      roomId,
      action,
      memberIds
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/rooms/:roomId
 * ルームを削除（管理者用）
 * @param {string} roomId - ルームID
 */
router.delete('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // TODO: 管理者権限チェック
    // TODO: ルーム削除（論理削除）
    // TODO: 関連メッセージの処理
    
    res.status(501).json({ 
      message: 'Delete room endpoint - not implemented yet',
      roomId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;