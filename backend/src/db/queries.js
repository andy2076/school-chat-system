/**
 * データベースクエリ集
 * - 各テーブルのCRUD操作
 * - 複合クエリ
 * - インデックス最適化されたクエリ
 */

const dbClient = require('./client');

/**
 * ユーザー関連のクエリ
 */
const userQueries = {
  /**
   * LINEユーザーIDでユーザーを検索
   * @param {string} lineUserId - LINEユーザーID
   * @returns {Promise<Object>} ユーザー情報
   */
  async findByLineUserId(lineUserId) {
    // TODO: 実際のクエリ実装
    const query = `
      SELECT u.*, s.student_number, s.class_name, s.grade
      FROM users u
      LEFT JOIN students s ON u.student_id = s.id
      WHERE u.line_user_id = $1 AND u.deleted_at IS NULL
    `;
    // return await dbClient.query(query, [lineUserId]);
    throw new Error('Not implemented yet');
  },

  /**
   * 認証コードでユーザーを検索
   * @param {string} authCode - 認証コード
   * @returns {Promise<Object>} ユーザー情報
   */
  async findByAuthCode(authCode) {
    // TODO: 実際のクエリ実装
    const query = `
      SELECT s.*, ac.code
      FROM students s
      JOIN auth_codes ac ON s.id = ac.student_id
      WHERE ac.code = $1 AND ac.used_at IS NULL AND ac.expires_at > NOW()
    `;
    // return await dbClient.query(query, [authCode]);
    throw new Error('Not implemented yet');
  },

  /**
   * 新しいユーザーを作成
   * @param {Object} userData - ユーザーデータ
   * @returns {Promise<Object>} 作成されたユーザー
   */
  async create(userData) {
    // TODO: 実際のクエリ実装
    const query = `
      INSERT INTO users (line_user_id, display_name, user_type, student_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    // const { lineUserId, displayName, userType, studentId } = userData;
    // return await dbClient.query(query, [lineUserId, displayName, userType, studentId]);
    throw new Error('Not implemented yet');
  }
};

/**
 * ルーム関連のクエリ
 */
const roomQueries = {
  /**
   * ユーザーが参加しているルーム一覧を取得
   * @param {string} userId - ユーザーID
   * @returns {Promise<Array>} ルーム一覧
   */
  async findUserRooms(userId) {
    // TODO: 実際のクエリ実装
    const query = `
      SELECT r.*, 
             COUNT(CASE WHEN m.read_at IS NULL AND m.sender_id != $1 THEN 1 END) as unread_count,
             (SELECT content FROM messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM rooms r
      JOIN room_members rm ON r.id = rm.room_id
      LEFT JOIN messages m ON r.id = m.room_id
      WHERE rm.user_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id
      ORDER BY r.updated_at DESC
    `;
    // return await dbClient.query(query, [userId]);
    throw new Error('Not implemented yet');
  },

  /**
   * ルーム詳細を取得
   * @param {string} roomId - ルームID
   * @returns {Promise<Object>} ルーム詳細
   */
  async findById(roomId) {
    // TODO: 実際のクエリ実装
    const query = `
      SELECT r.*, 
             JSON_AGG(JSON_BUILD_OBJECT(
               'user_id', u.id,
               'display_name', u.display_name,
               'user_type', u.user_type
             )) as members
      FROM rooms r
      JOIN room_members rm ON r.id = rm.room_id
      JOIN users u ON rm.user_id = u.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id
    `;
    // return await dbClient.query(query, [roomId]);
    throw new Error('Not implemented yet');
  },

  /**
   * 新しいルームを作成
   * @param {Object} roomData - ルームデータ
   * @returns {Promise<Object>} 作成されたルーム
   */
  async create(roomData) {
    // TODO: 実際のクエリ実装
    const query = `
      INSERT INTO rooms (name, room_type, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    // const { name, roomType, createdBy } = roomData;
    // return await dbClient.query(query, [name, roomType, createdBy]);
    throw new Error('Not implemented yet');
  }
};

/**
 * メッセージ関連のクエリ
 */
const messageQueries = {
  /**
   * ルームのメッセージ履歴を取得
   * @param {string} roomId - ルームID
   * @param {number} page - ページ番号
   * @param {number} limit - 取得件数
   * @returns {Promise<Array>} メッセージ一覧
   */
  async findByRoomId(roomId, page = 1, limit = 50) {
    // TODO: 実際のクエリ実装
    const offset = (page - 1) * limit;
    const query = `
      SELECT m.*, u.display_name as sender_name, u.user_type as sender_type
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    // return await dbClient.query(query, [roomId, limit, offset]);
    throw new Error('Not implemented yet');
  },

  /**
   * 新しいメッセージを作成
   * @param {Object} messageData - メッセージデータ
   * @returns {Promise<Object>} 作成されたメッセージ
   */
  async create(messageData) {
    // TODO: 実際のクエリ実装
    const query = `
      INSERT INTO messages (room_id, sender_id, content, message_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    // const { roomId, senderId, content, messageType } = messageData;
    // return await dbClient.query(query, [roomId, senderId, content, messageType]);
    throw new Error('Not implemented yet');
  },

  /**
   * メッセージを既読にする
   * @param {string} messageId - メッセージID
   * @param {string} userId - ユーザーID
   * @returns {Promise<boolean>} 更新結果
   */
  async markAsRead(messageId, userId) {
    // TODO: 実際のクエリ実装
    const query = `
      INSERT INTO message_reads (message_id, user_id, read_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NOW()
    `;
    // return await dbClient.query(query, [messageId, userId]);
    throw new Error('Not implemented yet');
  }
};

/**
 * 管理者用のクエリ
 */
const adminQueries = {
  /**
   * システム統計情報を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getSystemStatistics() {
    // TODO: 実際のクエリ実装
    const queries = {
      totalUsers: 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL',
      activeUsers: 'SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\' AND deleted_at IS NULL',
      totalMessages: 'SELECT COUNT(*) FROM messages WHERE deleted_at IS NULL',
      totalRooms: 'SELECT COUNT(*) FROM rooms WHERE deleted_at IS NULL'
    };
    
    // const results = {};
    // for (const [key, query] of Object.entries(queries)) {
    //   const result = await dbClient.query(query);
    //   results[key] = parseInt(result.rows[0].count);
    // }
    // return results;
    throw new Error('Not implemented yet');
  },

  /**
   * 全ルーム一覧を取得（管理者用）
   * @param {number} page - ページ番号
   * @param {number} limit - 取得件数
   * @returns {Promise<Array>} ルーム一覧
   */
  async findAllRooms(page = 1, limit = 20) {
    // TODO: 実際のクエリ実装
    const offset = (page - 1) * limit;
    const query = `
      SELECT r.*, 
             u.display_name as creator_name,
             COUNT(rm.user_id) as member_count,
             COUNT(m.id) as message_count
      FROM rooms r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN room_members rm ON r.id = rm.room_id
      LEFT JOIN messages m ON r.id = m.room_id
      WHERE r.deleted_at IS NULL
      GROUP BY r.id, u.display_name
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    // return await dbClient.query(query, [limit, offset]);
    throw new Error('Not implemented yet');
  }
};

/**
 * 通知関連のクエリ
 */
const notificationQueries = {
  /**
   * ユーザーのプッシュサブスクリプションを保存
   * @param {string} userId - ユーザーID
   * @param {Object} subscription - サブスクリプション
   * @returns {Promise<Object>} 保存結果
   */
  async saveSubscription(userId, subscription) {
    // TODO: 実際のクエリ実装
    const query = `
      INSERT INTO push_subscriptions (user_id, endpoint, keys, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET 
        endpoint = $2, keys = $3, updated_at = NOW()
      RETURNING *
    `;
    // return await dbClient.query(query, [userId, subscription.endpoint, JSON.stringify(subscription.keys)]);
    throw new Error('Not implemented yet');
  },

  /**
   * ユーザーの通知設定を取得
   * @param {string} userId - ユーザーID
   * @returns {Promise<Object>} 通知設定
   */
  async findNotificationSettings(userId) {
    // TODO: 実際のクエリ実装
    const query = `
      SELECT * FROM notification_settings 
      WHERE user_id = $1
    `;
    // return await dbClient.query(query, [userId]);
    throw new Error('Not implemented yet');
  }
};

module.exports = {
  userQueries,
  roomQueries,
  messageQueries,
  adminQueries,
  notificationQueries
};