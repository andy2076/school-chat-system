import axios from 'axios';

/**
 * API Service
 * バックエンドAPIとの通信を管理
 */

class ApiService {
  constructor() {
    // ベースURL設定
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    // Axios インスタンス作成
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * リクエスト・レスポンスインターセプターの設定
   */
  setupInterceptors() {
    // リクエストインターセプター
    this.api.interceptors.request.use(
      (config) => {
        // 認証トークンを自動付与
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // リクエストログ
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    this.api.interceptors.response.use(
      (response) => {
        // レスポンスログ
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        // エラーログ
        console.error(`❌ API Error: ${error.response?.status} - ${error.config?.url}`, error.response?.data);
        
        // 401エラー（認証エラー）の場合はログアウト処理
        if (error.response?.status === 401) {
          this.handleAuthError();
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * 認証トークン取得
   * @returns {string|null}
   */
  getAuthToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * 認証トークン設定
   * @param {string} token
   */
  setAuthToken(token) {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  /**
   * 認証エラー処理
   */
  handleAuthError() {
    try {
      // トークンを削除
      this.setAuthToken(null);
      
      // ログインページにリダイレクト
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  }

  /**
   * エラー情報のフォーマット
   * @param {Object} error
   * @returns {Object}
   */
  formatError(error) {
    return {
      message: error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status || 500,
      data: error.response?.data || null,
      originalError: error
    };
  }

  // ==================== 認証関連 API ====================

  /**
   * LINEログイン
   * @param {Object} loginData
   * @returns {Promise<Object>}
   */
  async loginWithLine(loginData) {
    try {
      const response = await this.api.post('/auth/line-login', loginData);
      
      // トークンを保存
      if (response.data.token) {
        this.setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 認証コードでログイン
   * @param {Object} loginData
   * @returns {Promise<Object>}
   */
  async loginWithAuthCode(loginData) {
    try {
      const response = await this.api.post('/auth/line-login', loginData);
      
      // トークンを保存
      if (response.data.token) {
        this.setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * トークン検証
   * @returns {Promise<Object>}
   */
  async verifyToken() {
    try {
      const response = await this.api.post('/auth/verify-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ログアウト
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      const response = await this.api.post('/auth/logout');
      this.setAuthToken(null);
      return response.data;
    } catch (error) {
      // ログアウトはエラーが出てもトークンを削除
      this.setAuthToken(null);
      throw error;
    }
  }

  /**
   * ユーザー存在確認
   * @param {string} lineUserId
   * @returns {Promise<Object>}
   */
  async checkUser(lineUserId) {
    try {
      const response = await this.api.get(`/auth/check-user/${lineUserId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ルーム関連 API ====================

  /**
   * ユーザーのルーム一覧取得
   * @returns {Promise<Object>}
   */
  async getRooms() {
    try {
      const response = await this.api.get('/rooms');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ルーム詳細取得
   * @param {string} roomId
   * @returns {Promise<Object>}
   */
  async getRoomDetails(roomId) {
    try {
      const response = await this.api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== メッセージ関連 API ====================

  /**
   * メッセージ履歴取得
   * @param {string} roomId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getMessages(roomId, page = 1, limit = 50) {
    try {
      const response = await this.api.get(`/messages/room/${roomId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * メッセージ送信
   * @param {Object} messageData
   * @returns {Promise<Object>}
   */
  async sendMessage(messageData) {
    try {
      const response = await this.api.post('/messages/send', messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * メッセージ既読処理
   * @param {string} messageId
   * @returns {Promise<Object>}
   */
  async markMessageAsRead(messageId) {
    try {
      const response = await this.api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 通知関連 API ====================

  /**
   * プッシュ通知サブスクリプション登録
   * @param {Object} subscription
   * @returns {Promise<Object>}
   */
  async subscribeNotifications(subscription) {
    try {
      const response = await this.api.post('/notifications/subscribe', {
        subscription: subscription
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 通知設定取得
   * @returns {Promise<Object>}
   */
  async getNotificationSettings() {
    try {
      const response = await this.api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 通知設定更新
   * @param {Object} settings
   * @returns {Promise<Object>}
   */
  async updateNotificationSettings(settings) {
    try {
      const response = await this.api.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ヘルスチェック ====================

  /**
   * APIヘルスチェック
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ファイルアップロード ====================

  /**
   * ファイルアップロード
   * @param {File} file
   * @param {string} roomId
   * @returns {Promise<Object>}
   */
  async uploadFile(file, roomId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const response = await this.api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // アップロード進捗の監視
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ユーティリティ ====================

  /**
   * APIの接続状態をテスト
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * 認証状態のチェック
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    return !!token;
  }
}

// シングルトンインスタンスをエクスポート
export const apiService = new ApiService();
export default apiService;