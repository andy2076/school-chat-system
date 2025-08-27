const express = require('express');
const router = express.Router();

/**
 * 認証関連のAPIエンドポイント
 * - LINEログイン連携
 * - 認証コード（生徒番号）による紐づけ
 * - JWTトークン発行・検証
 */

// TODO: 認証サービスの読み込み
// const authService = require('../core/authService');

/**
 * POST /api/auth/line-login
 * LINEログイン後の認証処理
 * @body {string} lineUserId - LINEユーザーID
 * @body {string} displayName - LINE表示名
 * @body {string} authCode - 学校から配布された認証コード（初回のみ）
 */
router.post('/line-login', async (req, res) => {
  try {
    // TODO: LINEユーザー情報の検証
    // TODO: 認証コードによる生徒情報との紐づけ
    // TODO: JWTトークンの発行
    
    res.status(501).json({ 
      message: 'LINE login endpoint - not implemented yet',
      data: req.body
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-token
 * JWTトークンの検証
 * @header {string} Authorization - Bearer token
 */
router.post('/verify-token', async (req, res) => {
  try {
    // TODO: JWTトークンの検証処理
    
    res.status(501).json({ 
      message: 'Token verification endpoint - not implemented yet'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * ログアウト処理
 * @header {string} Authorization - Bearer token
 */
router.post('/logout', async (req, res) => {
  try {
    // TODO: ログアウト処理（トークン無効化など）
    
    res.status(501).json({ 
      message: 'Logout endpoint - not implemented yet'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;