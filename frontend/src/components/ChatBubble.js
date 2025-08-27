import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

/**
 * チャットバブルコンポーネント
 * メッセージを吹き出し形式で表示
 */

const BubbleContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
  align-items: flex-end;
  margin-bottom: 12px;
  padding: 0 16px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.isOwn ? '#06c755' : '#ddd'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin: ${props => props.isOwn ? '0 0 0 8px' : '0 8px 0 0'};
  flex-shrink: 0;
`;

const MessageContainer = styled.div`
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const SenderName = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
  padding: 0 4px;
  display: ${props => props.isOwn ? 'none' : 'block'};
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isOwn ? '#06c755' : '#ffffff'};
  color: ${props => props.isOwn ? '#ffffff' : '#333333'};
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-${props => props.isOwn ? 'right' : 'left'}-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  position: relative;
  
  /* メッセージタイプに応じたスタイル */
  ${props => props.messageType === 'system' && `
    background-color: #f0f0f0;
    color: #666;
    font-size: 12px;
    text-align: center;
    border-radius: 12px;
    margin: 8px 0;
  `}
`;

const MessageContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  
  /* リンクのスタイリング */
  a {
    color: ${props => props.isOwn ? '#ffffff' : '#06c755'};
    text-decoration: underline;
  }
  
  /* 改行の処理 */
  white-space: pre-wrap;
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const ReadStatus = styled.div`
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  text-align: right;
  display: ${props => props.isOwn ? 'block' : 'none'};
`;

const ChatBubble = ({ 
  message, 
  isOwn = false, 
  showAvatar = true, 
  showSenderName = true,
  showTime = true,
  showReadStatus = false
}) => {
  // TODO: 実際のデータ構造に合わせて調整
  const {
    content = '',
    senderName = 'Unknown',
    createdAt = new Date(),
    messageType = 'text',
    isRead = false
  } = message || {};

  // システムメッセージの場合は特別な表示
  if (messageType === 'system') {
    return (
      <BubbleContainer>
        <MessageBubble messageType="system">
          <MessageContent>{content}</MessageContent>
          {showTime && (
            <MessageTime>{format(new Date(createdAt), 'HH:mm')}</MessageTime>
          )}
        </MessageBubble>
      </BubbleContainer>
    );
  }

  // 送信者の頭文字を取得（アバター用）
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // メッセージ内容の処理（URLリンク化など）
  const processMessageContent = (content) => {
    // TODO: URLの自動リンク化、絵文字の処理など
    return content;
  };

  return (
    <BubbleContainer isOwn={isOwn}>
      {showAvatar && (
        <Avatar isOwn={isOwn}>
          {getInitials(senderName)}
        </Avatar>
      )}
      
      <MessageContainer isOwn={isOwn}>
        {showSenderName && (
          <SenderName isOwn={isOwn}>{senderName}</SenderName>
        )}
        
        <MessageBubble isOwn={isOwn} messageType={messageType}>
          <MessageContent isOwn={isOwn}>
            {processMessageContent(content)}
          </MessageContent>
        </MessageBubble>
        
        {showTime && (
          <MessageTime isOwn={isOwn}>
            {format(new Date(createdAt), 'HH:mm')}
          </MessageTime>
        )}
        
        {showReadStatus && (
          <ReadStatus isOwn={isOwn}>
            {isRead ? '既読' : '未読'}
          </ReadStatus>
        )}
      </MessageContainer>
    </BubbleContainer>
  );
};

export default ChatBubble;