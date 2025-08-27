import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * アプリケーションのエントリーポイント
 */

// React 18のcreateRoot APIを使用
const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictModeでアプリをレンダリング
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Workerの登録（プロダクション環境のみ）
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}