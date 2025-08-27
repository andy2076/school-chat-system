const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * 認証関連のビジネスロジック
 * - LINEログイン処理
 * - 認証コードによる紐づけ
 * - JWTトークン管理
 */

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * LINEユーザーのログイン処理
   * @param {string} lineUserId - LINEユーザーID
   * @param {string} displayName - LINE表示名
   * @param {string} authCode - 認証コード（初回のみ）
   * @returns {Promise<Object>} ログイン結果
   */
  async processLineLogin(lineUserId, displayName, authCode = null) {
    try {
      // TODO: データベース操作の実装
      // 1. LINEユーザーIDでユーザー検索
      // 2. 初回の場合は認証コードで生徒情報との紐づけ
      // 3. ユーザー情報の作成・更新
      // 4. JWTトークンの発行
      
      throw new Error('Not implemented yet');
    } catch (error) {
      console.error('Error in processLineLogin:', error);
      throw error;
    }
  }

  /**
   * 認証コードの検証
   * @param {string} authCode - 認証コード
   * @returns {Promise<Object>} 生徒情報
   */
  async validateAuthCode(authCode) {
    try {
      // TODO: データベースで認証コードを検証
      // 1. 認証コードの存在確認
      // 2. 使用済みでないかチェック
      // 3. 生徒情報の取得
      
      throw new Error('Not implemented yet');
    } catch (error) {
      console.error('Error in validateAuthCode:', error);
      throw error;
    }
  }

  /**
   * JWTトークンの生成
   * @param {Object} user - ユーザー情報
   * @returns {string} JWTトークン
   */
  generateToken(user) {
    try {
      const payload = {
        userId: user.id,
        lineUserId: user.lineUserId,
        userType: user.userType, // parent, teacher, admin
        studentId: user.studentId || null
      };

      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN
      });
    } catch (error) {
      console.error('Error in generateToken:', error);
      throw error;
    }
  }

  /**
   * JWTトークンの検証
   * @param {string} token - JWTトークン
   * @returns {Object} デコードされたトークンデータ
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      console.error('Error in verifyToken:', error);
      throw error;
    }
  }

  /**
   * パスワードのハッシュ化（教職員用）
   * @param {string} password - プレーンテキストパスワード
   * @returns {Promise<string>} ハッシュ化されたパスワード
   */
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error in hashPassword:', error);
      throw error;
    }
  }

  /**
   * パスワードの検証（教職員用）
   * @param {string} password - プレーンテキストパスワード
   * @param {string} hashedPassword - ハッシュ化されたパスワード
   * @returns {Promise<boolean>} 検証結果
   */
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      throw error;
    }
  }

  /**
   * ユーザーの権限チェック
   * @param {Object} user - ユーザー情報
   * @param {string} requiredRole - 必要な権限
   * @returns {boolean} 権限チェック結果
   */
  checkPermission(user, requiredRole) {
    try {
      const roleHierarchy = {
        'admin': 3,
        'teacher': 2,
        'parent': 1
      };

      const userRole = roleHierarchy[user.userType] || 0;
      const required = roleHierarchy[requiredRole] || 0;

      return userRole >= required;
    } catch (error) {
      console.error('Error in checkPermission:', error);
      return false;
    }
  }
}

module.exports = new AuthService();