import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

/**
 * メッセージ入力ボックスコンポーネント
 * メッセージの入力・送信機能
 */

const Container = styled.div`
  background-color: white;
  border-top: 1px solid #e0e0e0;
  padding: 12px 16px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  position: sticky;
  bottom: 0;
  z-index: 100;
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 36px;
  max-height: 120px;
  padding: 10px 40px 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  font-family: 'Noto Sans JP', sans-serif;
  outline: none;
  resize: none;
  line-height: 1.4;
  
  &:focus {
    border-color: #06c755;
  }
  
  &::placeholder {
    color: #999;
  }
  
  /* iOS Safari対応 */
  -webkit-appearance: none;
  -webkit-border-radius: 20px;
`;

const SendButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.disabled ? '#ccc' : '#06c755'};
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: background-color 0.2s;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background-color: #05b04a;
  }
  
  &:active:not(:disabled) {
    background-color: #049c3f;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AttachButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CharacterCount = styled.div`
  position: absolute;
  bottom: -20px;
  right: 8px;
  font-size: 11px;
  color: ${props => props.isOverLimit ? '#ff4444' : '#999'};
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  position: absolute;
  top: -30px;
  left: 16px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #06c755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MessageBox = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力...",
  maxLength = 1000,
  disabled = false,
  loading = false,
  enableAttachment = true
}) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);

  // テキストエリアの高さを自動調整
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / 24), 1), 5);
      setRows(newRows);
      textarea.style.height = `${scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // メッセージ送信処理
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || loading) return;
    
    if (onSendMessage) {
      onSendMessage(trimmedMessage);
    }
    
    setMessage('');
    setRows(1);
  };

  // Enterキーでの送信（Shift+Enterで改行）
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // メッセージ入力処理
  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // ファイル添付処理（TODO: 実装）
  const handleAttachFile = () => {
    // TODO: ファイル選択ダイアログを開く
    console.log('File attachment - not implemented yet');
  };

  const isOverLimit = message.length > maxLength * 0.9;
  const canSend = message.trim().length > 0 && !disabled && !loading;

  return (
    <Container>
      {loading && (
        <LoadingIndicator>
          <Spinner />
          送信中...
        </LoadingIndicator>
      )}
      
      <InputContainer>
        <TextArea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={rows}
        />
        
        {enableAttachment && (
          <AttachButton
            type="button"
            onClick={handleAttachFile}
            disabled={disabled || loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </AttachButton>
        )}
        
        {maxLength && message.length > maxLength * 0.8 && (
          <CharacterCount isOverLimit={isOverLimit}>
            {message.length}/{maxLength}
          </CharacterCount>
        )}
      </InputContainer>
      
      <SendButton 
        type="button"
        onClick={handleSendMessage}
        disabled={!canSend}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </SendButton>
    </Container>
  );
};

export default MessageBox;