import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { liffService } from '../services/liffService';
import { apiService } from '../services/api';

/**
 * ログインページコンポーネント
 * LIFF認証と学校認証コード入力
 */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #06c755 0%, #04b04a 100%);
  color: white;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #06c755;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const SchoolName = styled.div`
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
`;

const WelcomeText = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const AuthCodeSection = styled.div`
  margin: 24px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const AuthCodeLabel = styled.label`
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: left;
`;

const AuthCodeInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #06c755;
  }
  
  &::placeholder {
    color: #999;
    letter-spacing: normal;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #06c755;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;
  
  &:hover:not(:disabled) {
    background-color: #05b04a;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffe6e6;
  color: #d63031;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  border: 1px solid #fab1a0;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 16px;
  text-align: left;
  line-height: 1.4;
`;

const StatusMessage = styled.div`
  font-size: 14px;
  color: #666;
  margin: 16px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const LoginPage = ({ onLoginSuccess }) => {
  const [loginStep, setLoginStep] = useState('initializing'); // initializing, line-auth, auth-code, logging-in
  const [lineProfile, setLineProfile] = useState(null);
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeLiff();
  }, []);

  // LIFF初期化
  const initializeLiff = async () => {
    try {
      setLoading(true);
      const isInitialized = await liffService.initialize();
      
      if (isInitialized) {
        const isLoggedIn = await liffService.isLoggedIn();
        
        if (isLoggedIn) {
          const profile = await liffService.getProfile();
          setLineProfile(profile);
          
          // 既存ユーザーかチェック
          const existingUser = await checkExistingUser(profile.userId);
          if (existingUser) {
            // 既存ユーザーの場合、直接ログイン
            await handleExistingUserLogin(existingUser);
          } else {
            // 新規ユーザーの場合、認証コード入力へ
            setLoginStep('auth-code');
          }
        } else {
          setLoginStep('line-auth');
        }
      } else {
        setError('LIFFの初期化に失敗しました');
        setLoginStep('line-auth');
      }
    } catch (err) {
      console.error('LIFF initialization error:', err);
      setError('アプリの初期化中にエラーが発生しました');
      setLoginStep('line-auth');
    } finally {
      setLoading(false);
    }
  };

  // 既存ユーザーのチェック
  const checkExistingUser = async (lineUserId) => {
    try {
      // TODO: APIで既存ユーザーをチェック
      // const response = await apiService.checkUser(lineUserId);
      // return response.data.user;
      
      console.log('Checking existing user for:', lineUserId);
      return null; // 暫定的にnullを返す
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  };

  // 既存ユーザーのログイン
  const handleExistingUserLogin = async (user) => {
    try {
      setLoading(true);
      // TODO: 既存ユーザーのログイン処理
      console.log('Existing user login:', user);
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      console.error('Existing user login error:', error);
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // LINEログイン処理
  const handleLineLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      await liffService.login();
    } catch (err) {
      console.error('LINE login error:', err);
      setError('LINEログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 認証コードでのログイン処理
  const handleAuthCodeLogin = async () => {
    if (!authCode.trim()) {
      setError('認証コードを入力してください');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setLoginStep('logging-in');

      // TODO: APIで認証コードを検証してユーザー登録
      const loginData = {
        lineUserId: lineProfile.userId,
        displayName: lineProfile.displayName,
        authCode: authCode.trim()
      };

      console.log('Login with auth code:', loginData);
      
      // TODO: 実際のAPI呼び出し
      // const response = await apiService.loginWithAuthCode(loginData);
      
      // 暫定的にダミーレスポンス
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user = {
        id: 'user_123',
        displayName: lineProfile.displayName,
        userType: 'parent',
        studentId: 'student_456'
      };
      
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      
    } catch (err) {
      console.error('Auth code login error:', err);
      setError('認証コードが正しくありません');
      setLoginStep('auth-code');
    } finally {
      setLoading(false);
    }
  };

  // ログインステップに応じた表示内容
  const renderContent = () => {
    switch (loginStep) {
      case 'initializing':
        return (
          <StatusMessage>
            <LoadingSpinner />
            アプリを初期化しています...
          </StatusMessage>
        );

      case 'line-auth':
        return (
          <>
            <WelcomeText>
              学校チャットシステムへようこそ！<br />
              LINEでログインして始めましょう。
            </WelcomeText>
            <LoginButton onClick={handleLineLogin} disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  処理中...
                </>
              ) : (
                'LINEでログイン'
              )}
            </LoginButton>
          </>
        );

      case 'auth-code':
        return (
          <>
            <WelcomeText>
              こんにちは、{lineProfile?.displayName}さん！
            </WelcomeText>
            <AuthCodeSection>
              <AuthCodeLabel htmlFor="auth-code">
                学校から配布された認証コードを入力してください
              </AuthCodeLabel>
              <AuthCodeInput
                id="auth-code"
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                placeholder="例: ABC123"
                maxLength={10}
                disabled={loading}
              />
            </AuthCodeSection>
            <LoginButton onClick={handleAuthCodeLogin} disabled={loading || !authCode.trim()}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  処理中...
                </>
              ) : (
                'ログイン'
              )}
            </LoginButton>
            <HelpText>
              認証コードは学校から配布された書類に記載されています。<br />
              不明な場合は学校にお問い合わせください。
            </HelpText>
          </>
        );

      case 'logging-in':
        return (
          <StatusMessage>
            <LoadingSpinner />
            ログイン中です。しばらくお待ちください...
          </StatusMessage>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <LoginCard>
        <Logo>
          📚 学校チャット
        </Logo>
        <SchoolName>○○小学校</SchoolName>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {renderContent()}
      </LoginCard>
    </Container>
  );
};

export default LoginPage;