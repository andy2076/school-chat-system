import io from 'socket.io-client';

/**
 * Socket.IO Service
 * リアルタイム通信の管理
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = new Map();
  }

  /**
   * Socket.IO接続を初期化
   * @param {string} authToken - 認証トークン
   * @returns {Promise<boolean>}
   */
  async connect(authToken) {
    try {
      if (this.isConnected) {
        console.log('Socket is already connected');
        return true;
      }

      // Socket.IO接続オプション
      const options = {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      };

      this.socket = io(this.serverUrl, options);

      // 接続イベントの設定
      this.setupConnectionEvents();

      // 接続完了を待つ
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('Socket connection timeout');
          resolve(false);
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Socket connected:', this.socket.id);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Socket connection error:', error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error('Error connecting socket:', error);
      return false;
    }
  }

  /**
   * Socket接続イベントの設定
   */
  setupConnectionEvents() {
    if (!this.socket) return;

    // 接続完了
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Socket connected:', this.socket.id);
      this.emit('connection-status', { connected: true });
    });

    // 切断
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Socket disconnected:', reason);
      this.emit('connection-status', { connected: false, reason });

      // 自動再接続
      if (reason === 'io server disconnect') {
        // サーバー側からの切断の場合は手動再接続
        this.handleReconnection();
      }
    });

    // 接続エラー
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnection();
    });

    // 再接続試行
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt: ${attemptNumber}`);
      this.emit('reconnecting', { attempt: attemptNumber });
    });

    // 再接続成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnected', { attempts: attemptNumber });
    });

    // 再接続失敗
    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
      this.emit('reconnect-failed');
    });
  }

  /**
   * 再接続処理
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * Socket切断
   */
  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.isConnected = false;
      this.eventListeners.clear();
      console.log('Socket disconnected manually');
    } catch (error) {
      console.error('Error disconnecting socket:', error);
    }
  }

  /**
   * ルームに参加
   * @param {string} roomId
   */
  joinRoom(roomId) {
    if (!this.isConnected || !this.socket) {
      console.warn('Socket is not connected');
      return;
    }

    this.socket.emit('join-room', { roomId });
    console.log(`Joined room: ${roomId}`);
  }

  /**
   * ルームから退出
   * @param {string} roomId
   */
  leaveRoom(roomId) {
    if (!this.isConnected || !this.socket) {
      console.warn('Socket is not connected');
      return;
    }

    this.socket.emit('leave-room', { roomId });
    console.log(`Left room: ${roomId}`);
  }

  /**
   * メッセージ送信
   * @param {Object} messageData
   */
  sendMessage(messageData) {
    if (!this.isConnected || !this.socket) {
      console.warn('Socket is not connected');
      return;
    }

    this.socket.emit('send-message', messageData);
    console.log('Message sent via socket:', messageData);
  }

  /**
   * 入力中状態を送信
   * @param {string} roomId
   * @param {boolean} isTyping
   */
  sendTyping(roomId, isTyping) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    if (isTyping) {
      this.socket.emit('typing', { roomId });
    } else {
      this.socket.emit('stop-typing', { roomId });
    }
  }

  /**
   * イベントリスナーを追加
   * @param {string} event
   * @param {function} callback
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket is not initialized');
      return;
    }

    // 既存のリスナーを削除してから追加
    this.off(event);
    
    this.socket.on(event, callback);
    this.eventListeners.set(event, callback);
    console.log(`Event listener added: ${event}`);
  }

  /**
   * イベントリスナーを削除
   * @param {string} event
   */
  off(event) {
    if (!this.socket) {
      return;
    }

    const existingCallback = this.eventListeners.get(event);
    if (existingCallback) {
      this.socket.off(event, existingCallback);
      this.eventListeners.delete(event);
      console.log(`Event listener removed: ${event}`);
    }
  }

  /**
   * 一度だけ実行されるイベントリスナーを追加
   * @param {string} event
   * @param {function} callback
   */
  once(event, callback) {
    if (!this.socket) {
      console.warn('Socket is not initialized');
      return;
    }

    this.socket.once(event, callback);
    console.log(`One-time event listener added: ${event}`);
  }

  /**
   * イベントを発生させる
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket is not initialized');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * 接続状態を取得
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Socket IDを取得
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * リアルタイムメッセージイベントの設定
   * @param {function} onNewMessage
   * @param {function} onTyping
   * @param {function} onStopTyping
   */
  setupMessageEvents(onNewMessage, onTyping, onStopTyping) {
    // 新しいメッセージ受信
    this.on('new-message', (messageData) => {
      console.log('New message received:', messageData);
      if (onNewMessage) {
        onNewMessage(messageData);
      }
    });

    // 誰かが入力中
    this.on('user-typing', (data) => {
      console.log('User typing:', data);
      if (onTyping) {
        onTyping(data);
      }
    });

    // 入力停止
    this.on('user-stop-typing', (data) => {
      console.log('User stop typing:', data);
      if (onStopTyping) {
        onStopTyping(data);
      }
    });

    // メッセージ既読通知
    this.on('message-read', (data) => {
      console.log('Message read:', data);
      // TODO: 既読状態の更新処理
    });

    // ルーム更新通知
    this.on('room-updated', (data) => {
      console.log('Room updated:', data);
      // TODO: ルーム情報の更新処理
    });
  }

  /**
   * 接続テスト
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    return new Promise((resolve) => {
      if (!this.isConnected || !this.socket) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      this.socket.emit('ping', { timestamp: Date.now() });
      
      this.once('pong', () => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }
}

// シングルトンインスタンスをエクスポート
export const socketService = new SocketService();
export default socketService;