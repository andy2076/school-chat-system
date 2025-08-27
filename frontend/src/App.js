import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { liffService } from './services/liffService';
import { apiService } from './services/api';
import { socketService } from './services/socketService';

/**
 * メインアプリケーションコンポーネント
 * ルーティングと全体的な状態管理
 */

// React Query クライアント設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
      cacheTime: 10 * 60 * 1000, // 10分間キャッシュを保持
    },
  },
});

// テーマ設定
const theme = {
  colors: {
    primary: '#06c755',
    primaryDark: '#05b04a',
    secondary: '#f8f9fa',
    background: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#ff4444',
    success: '#06c755',
    warning: '#ffc107'
  },
  fonts: {
    main: "'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  }
};

// グローバルスタイル
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.fonts.main};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* スクロールバーのスタイル */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* フォーカス時のアウトライン */
  button:focus,
  input:focus,
  textarea:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* リンクのデフォルトスタイル */
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

// ローディングコンポーネント
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

// プライベートルートコンポーネント
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// パブリックルートコンポーネント（認証済みの場合はメインページへ）
const PublicRoute = ({ children, isAuthenticated }) => {
  return !isAuthenticated ? children : <Navigate to="/chat" replace />;
};

// メインAppコンポーネント
const App = () => {
  const [appState, setAppState] = useState({
    loading: true,
    user: null,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * アプリケーション初期化
   */
  const initializeApp = async () => {
    try {
      setAppState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      // LIFF初期化
      console.log('🚀 Initializing LIFF...');
      const liffInitialized = await liffService.initialize();

      if (!liffInitialized) {
        throw new Error('LIFF initialization failed');
      }

      // ログイン状態確認
      const isLoggedIn = await liffService.isLoggedIn();
      
      if (isLoggedIn) {
        console.log('👤 User is logged in to LIFF');
        
        // 既存の認証トークンをチェック
        const authToken = apiService.getAuthToken();
        
        if (authToken) {
          console.log('🔐 Auth token found, verifying...');
          
          try {
            // トークン検証
            const userInfo = await apiService.verifyToken();
            await handleSuccessfulLogin(userInfo.user, authToken);
          } catch (error) {
            console.warn('🔒 Token verification failed, need re-authentication');
            // トークン無効の場合は再認証が必要
            apiService.setAuthToken(null);
            setAppState(prev => ({ 
              ...prev, 
              loading: false, 
              isAuthenticated: false,
              user: null 
            }));
          }
        } else {
          console.log('🔑 No auth token, need authentication');
          setAppState(prev => ({ 
            ...prev, 
            loading: false, 
            isAuthenticated: false,
            user: null 
          }));
        }
      } else {
        console.log('👻 User not logged in to LIFF');
        setAppState(prev => ({ 
          ...prev, 
          loading: false, 
          isAuthenticated: false,
          user: null 
        }));
      }

    } catch (error) {
      console.error('❌ App initialization error:', error);
      setAppState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message,
        isAuthenticated: false,
        user: null 
      }));
    }
  };

  /**
   * ログイン成功時の処理
   * @param {Object} user ユーザー情報
   * @param {string} authToken 認証トークン
   */
  const handleSuccessfulLogin = async (user, authToken) => {
    try {
      console.log('✅ Login successful:', user);

      // 認証トークンを保存
      apiService.setAuthToken(authToken);

      // Socket.IO接続
      const socketConnected = await socketService.connect(authToken);
      if (!socketConnected) {
        console.warn('⚠️ Socket connection failed, but continuing...');
      }

      // Web Push通知の設定
      await requestNotificationPermission();

      // ユーザー状態を更新
      setAppState(prev => ({
        ...prev,
        loading: false,
        user: user,
        isAuthenticated: true,
        error: null
      }));

    } catch (error) {
      console.error('Error in handleSuccessfulLogin:', error);
      setAppState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'ログイン後の初期化に失敗しました'
      }));
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');

      // Socket接続を切断
      socketService.disconnect();

      // API経由でログアウト
      try {
        await apiService.logout();
      } catch (error) {
        console.warn('API logout failed, but continuing...', error);
      }

      // LIFF ログアウト
      try {
        await liffService.logout();
      } catch (error) {
        console.warn('LIFF logout failed, but continuing...', error);
      }

      // 状態をリセット
      setAppState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: null
      }));

      console.log('✅ Logout completed');

    } catch (error) {
      console.error('Logout error:', error);
      // エラーが出てもログアウト状態にする
      setAppState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: null
      }));
    }
  };

  /**
   * Web Push通知の許可要求
   */
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          
          // Service Workerの登録を確認してからプッシュ通知サブスクリプションを作成
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            // TODO: プッシュ通知サブスクリプションの作成と送信
            console.log('📱 Push notification setup - TODO: implement subscription');
          }
        } else {
          console.log('🔕 Notification permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // ローディング表示
  if (appState.loading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>学校チャットを起動中...</LoadingText>
          <LoadingSubtext>しばらくお待ちください</LoadingSubtext>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <Routes>
            {/* パブリックルート */}
            <Route 
              path="/login" 
              element={
                <PublicRoute isAuthenticated={appState.isAuthenticated}>
                  <LoginPage onLoginSuccess={handleSuccessfulLogin} />
                </PublicRoute>
              } 
            />
            
            {/* プライベートルート */}
            <Route 
              path="/chat" 
              element={
                <PrivateRoute isAuthenticated={appState.isAuthenticated}>
                  <ChatPage 
                    user={appState.user} 
                    onLogout={handleLogout}
                  />
                </PrivateRoute>
              } 
            />
            
            {/* デフォルトルート */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={appState.isAuthenticated ? "/chat" : "/login"} 
                  replace 
                />
              } 
            />
            
            {/* 404ページ */}
            <Route 
              path="*" 
              element={
                <Navigate 
                  to={appState.isAuthenticated ? "/chat" : "/login"} 
                  replace 
                />
              } 
            />
          </Routes>
        </Router>
        
        {/* 通知トースト */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: theme.colors.success,
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: theme.colors.error,
                secondary: '#fff',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;