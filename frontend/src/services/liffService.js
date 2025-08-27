/**
 * LIFF Service
 * LINE Front-end Framework (LIFF) との連携処理
 */

class LiffService {
  constructor() {
    this.liff = null;
    this.isInitialized = false;
    this.liffId = process.env.REACT_APP_LIFF_ID || 'your-liff-id-here';
  }

  /**
   * LIFF初期化
   * @returns {Promise<boolean>} 初期化成功フラグ
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }

      if (typeof window === 'undefined' || !window.liff) {
        console.error('LIFF SDK is not loaded');
        return false;
      }

      this.liff = window.liff;
      
      await this.liff.init({
        liffId: this.liffId,
        withLoginOnExternalBrowser: true
      });

      this.isInitialized = true;
      console.log('LIFF initialized successfully');
      return true;

    } catch (error) {
      console.error('LIFF initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * ログイン状態をチェック
   * @returns {Promise<boolean>} ログイン状態
   */
  async isLoggedIn() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return this.liff?.isLoggedIn() || false;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * ログイン実行
   * @returns {Promise<void>}
   */
  async login() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.liff) {
        throw new Error('LIFF is not initialized');
      }

      this.liff.login({
        redirectUri: window.location.href
      });
    } catch (error) {
      console.error('LIFF login failed:', error);
      throw error;
    }
  }

  /**
   * ログアウト実行
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      if (!this.isInitialized || !this.liff) {
        return;
      }

      this.liff.logout();
      console.log('LIFF logout completed');
    } catch (error) {
      console.error('LIFF logout failed:', error);
      throw error;
    }
  }

  /**
   * ユーザープロフィール取得
   * @returns {Promise<Object>} ユーザープロフィール
   */
  async getProfile() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.liff?.isLoggedIn()) {
        throw new Error('User is not logged in');
      }

      const profile = await this.liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  /**
   * アクセストークン取得
   * @returns {Promise<string>} アクセストークン
   */
  async getAccessToken() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.liff?.isLoggedIn()) {
        throw new Error('User is not logged in');
      }

      return this.liff.getAccessToken();
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * LIFF環境チェック
   * @returns {Object} 環境情報
   */
  getEnvironment() {
    try {
      if (!this.isInitialized || !this.liff) {
        return {
          isInClient: false,
          isInExternalBrowser: true,
          isLoggedIn: false
        };
      }

      return {
        isInClient: this.liff.isInClient(),
        isInExternalBrowser: !this.liff.isInClient(),
        isLoggedIn: this.liff.isLoggedIn(),
        os: this.liff.getOS(),
        version: this.liff.getVersion(),
        language: this.liff.getLanguage(),
        isApiAvailable: this.liff.isApiAvailable('shareTargetPicker')
      };
    } catch (error) {
      console.error('Error getting environment:', error);
      return {
        isInClient: false,
        isInExternalBrowser: true,
        isLoggedIn: false
      };
    }
  }

  /**
   * メッセージ送信（LINE Talk への送信）
   * @param {string} text - 送信するテキスト
   * @returns {Promise<void>}
   */
  async sendMessages(text) {
    try {
      if (!this.isInitialized || !this.liff) {
        throw new Error('LIFF is not initialized');
      }

      if (!this.liff.isApiAvailable('sendMessages')) {
        throw new Error('sendMessages API is not available');
      }

      await this.liff.sendMessages([
        {
          type: 'text',
          text: text
        }
      ]);

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * 友達追加チェック
   * @returns {Promise<boolean>} 友達追加状態
   */
  async getFriendship() {
    try {
      if (!this.isInitialized || !this.liff) {
        throw new Error('LIFF is not initialized');
      }

      if (!this.liff.isApiAvailable('getFriendship')) {
        console.warn('getFriendship API is not available');
        return false;
      }

      const friendship = await this.liff.getFriendship();
      return friendship.friendFlag;
    } catch (error) {
      console.error('Error getting friendship:', error);
      return false;
    }
  }

  /**
   * QRコードリーダーを開く
   * @returns {Promise<string>} スキャン結果
   */
  async scanCode() {
    try {
      if (!this.isInitialized || !this.liff) {
        throw new Error('LIFF is not initialized');
      }

      if (!this.liff.isApiAvailable('scanCode')) {
        throw new Error('scanCode API is not available');
      }

      const result = await this.liff.scanCode();
      return result.value;
    } catch (error) {
      console.error('Error scanning code:', error);
      throw error;
    }
  }

  /**
   * クリップボードにコピー
   * @param {string} text - コピーするテキスト
   * @returns {Promise<void>}
   */
  async copyToClipboard(text) {
    try {
      if (!this.isInitialized || !this.liff) {
        throw new Error('LIFF is not initialized');
      }

      if (this.liff.isApiAvailable('clipboard')) {
        await this.liff.clipboard.writeText(text);
        console.log('Text copied to clipboard');
      } else {
        // フォールバック: 標準のClipboard API
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          console.log('Text copied to clipboard (fallback)');
        } else {
          throw new Error('Clipboard API is not available');
        }
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  }

  /**
   * LINEアプリで開く
   * @returns {Promise<void>}
   */
  async openInLineApp() {
    try {
      if (!this.isInitialized || !this.liff) {
        throw new Error('LIFF is not initialized');
      }

      if (this.liff.isInClient()) {
        console.log('Already in LINE app');
        return;
      }

      // LINEアプリで開くためのURL生成
      const currentUrl = window.location.href;
      const lineUrl = `https://line.me/R/app/${encodeURIComponent(currentUrl)}`;
      
      window.location.href = lineUrl;
    } catch (error) {
      console.error('Error opening in LINE app:', error);
      throw error;
    }
  }

  /**
   * ブラウザバックボタンの無効化
   * @returns {void}
   */
  disableBackButton() {
    try {
      if (!this.isInitialized || !this.liff) {
        return;
      }

      // LIFF内でのブラウザバック無効化
      if (this.liff.isInClient()) {
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', (e) => {
          history.go(1);
        });
      }
    } catch (error) {
      console.error('Error disabling back button:', error);
    }
  }

  /**
   * 初期化状態の取得
   * @returns {boolean}
   */
  getInitializationStatus() {
    return this.isInitialized;
  }
}

// シングルトンインスタンスをエクスポート
export const liffService = new LiffService();
export default liffService;