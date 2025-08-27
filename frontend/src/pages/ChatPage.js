import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChatBubble from '../components/ChatBubble';
import MessageBox from '../components/MessageBox';
import RoomList from '../components/RoomList';
import { apiService } from '../services/api';
import { socketService } from '../services/socketService';

/**
 * チャットページコンポーネント
 * メインのチャット画面
 */

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Sidebar = styled.div`
  width: ${props => props.isOpen ? '300px' : '0'};
  min-width: ${props => props.isOpen ? '300px' : '0'};
  background-color: white;
  border-right: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    width: ${props => props.isOpen ? '100%' : '0'};
    min-width: ${props => props.isOpen ? '100%' : '0'};
  }
`;

const MainChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  position: relative;
`;

const ChatHeader = styled.div`
  padding: 12px 16px;
  background-color: #06c755;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const RoomName = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const OnlineStatus = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  background-color: #f8f8f8;
  position: relative;
`;

const LoadingMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
`;

const EmptyChat = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #f0f0f0;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #e8e8e8;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TypingIndicator = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  font-style: italic;
`;

const SidebarOverlay = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NoRoomSelected = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 16px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ChatPage = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    rooms: false,
    messages: false,
    sending: false,
    loadMore: false
  });
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    loadRooms();
    initializeSocket();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      joinRoom(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ウィンドウリサイズ対応
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ルーム一覧の読み込み
  const loadRooms = async () => {
    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      // TODO: 実際のAPI呼び出し
      // const response = await apiService.getRooms();
      // setRooms(response.data);
      
      // ダミーデータ
      const dummyRooms = [
        {
          id: 'room_1',
          name: '担任の先生',
          roomType: 'teacher',
          lastMessage: 'お疲れ様でした',
          unreadCount: 2,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'room_2',
          name: '事務室',
          roomType: 'admin',
          lastMessage: '資料をお送りします',
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setTimeout(() => {
        setRooms(dummyRooms);
        setLoading(prev => ({ ...prev, rooms: false }));
      }, 1000);
      
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('ルーム一覧の読み込みに失敗しました');
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  // メッセージ履歴の読み込み
  const loadMessages = async (roomId, page = 1) => {
    try {
      if (page === 1) {
        setLoading(prev => ({ ...prev, messages: true }));
        setMessages([]);
      } else {
        setLoading(prev => ({ ...prev, loadMore: true }));
      }

      // TODO: 実際のAPI呼び出し
      // const response = await apiService.getMessages(roomId, page);
      // const newMessages = response.data.messages;
      // setHasMoreMessages(response.data.hasMore);

      // ダミーデータ
      const dummyMessages = [
        {
          id: 'msg_1',
          content: 'こんにちは！お疲れ様です。',
          senderName: '田中先生',
          senderId: 'teacher_1',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg_2',
          content: 'ありがとうございます。質問があるのですが...',
          senderName: user.displayName,
          senderId: user.id,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg_3',
          content: 'はい、何でもお気軽にどうぞ！',
          senderName: '田中先生',
          senderId: 'teacher_1',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          messageType: 'text',
          isRead: false
        }
      ];

      setTimeout(() => {
        if (page === 1) {
          setMessages(dummyMessages);
        } else {
          setMessages(prev => [...dummyMessages, ...prev]);
        }
        setHasMoreMessages(false);
        setLoading(prev => ({ ...prev, messages: false, loadMore: false }));
      }, 1000);

    } catch (error) {
      console.error('Error loading messages:', error);
      setError('メッセージの読み込みに失敗しました');
      setLoading(prev => ({ ...prev, messages: false, loadMore: false }));
    }
  };

  // Socket.IO初期化
  const initializeSocket = async () => {
    try {
      // TODO: 実際のSocket.IO接続
      console.log('Initializing socket connection...');
      
      // socketService.on('newMessage', handleNewMessage);
      // socketService.on('typing', handleTyping);
      // socketService.on('stopTyping', handleStopTyping);
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  };

  // ルーム参加
  const joinRoom = (roomId) => {
    // TODO: Socket.IOでルームに参加
    console.log('Joining room:', roomId);
    // socketService.joinRoom(roomId);
  };

  // メッセージ送信
  const handleSendMessage = async (messageContent) => {
    if (!selectedRoom || !messageContent.trim()) return;

    const tempMessage = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderName: user.displayName,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      messageType: 'text',
      isRead: false
    };

    // 楽観的アップデート
    setMessages(prev => [...prev, tempMessage]);

    try {
      setLoading(prev => ({ ...prev, sending: true }));
      
      // TODO: 実際のAPI呼び出し
      // const response = await apiService.sendMessage({
      //   roomId: selectedRoom.id,
      //   content: messageContent
      // });
      
      // ダミーレスポンス
      setTimeout(() => {
        const sentMessage = {
          ...tempMessage,
          id: `msg_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        ));
        
        setLoading(prev => ({ ...prev, sending: false }));
      }, 500);

    } catch (error) {
      console.error('Error sending message:', error);
      // エラー時は楽観的アップデートを取り消し
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setError('メッセージの送信に失敗しました');
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  // ルーム選択
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // メッセージ末尾へスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // より多くのメッセージを読み込み
  const loadMoreMessages = () => {
    if (selectedRoom && !loading.loadMore) {
      // TODO: ページネーション実装
      console.log('Loading more messages...');
    }
  };

  return (
    <Container>
      <SidebarOverlay 
        isOpen={sidebarOpen} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <Sidebar isOpen={sidebarOpen}>
        <RoomList
          rooms={rooms}
          loading={loading.rooms}
          onRoomSelect={handleRoomSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </Sidebar>

      <MainChat>
        {selectedRoom ? (
          <>
            <ChatHeader>
              <HeaderLeft>
                <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                  ☰
                </MenuButton>
                <div>
                  <RoomName>{selectedRoom.name}</RoomName>
                  <OnlineStatus>オンライン</OnlineStatus>
                </div>
              </HeaderLeft>
              <HeaderRight>
                <HeaderButton title="設定">⚙️</HeaderButton>
                <HeaderButton onClick={onLogout} title="ログアウト">
                  🚪
                </HeaderButton>
              </HeaderRight>
            </ChatHeader>

            <MessagesContainer ref={messagesContainerRef}>
              {loading.messages ? (
                <LoadingMessages>メッセージを読み込み中...</LoadingMessages>
              ) : (
                <>
                  {hasMoreMessages && (
                    <LoadMoreButton
                      onClick={loadMoreMessages}
                      disabled={loading.loadMore}
                    >
                      {loading.loadMore ? '読み込み中...' : '以前のメッセージを読み込む'}
                    </LoadMoreButton>
                  )}

                  {messages.length === 0 ? (
                    <EmptyChat>
                      <div>📝</div>
                      <div>メッセージがありません</div>
                      <div>最初のメッセージを送信してみましょう！</div>
                    </EmptyChat>
                  ) : (
                    messages.map((message, index) => (
                      <ChatBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === user.id}
                        showAvatar={index === 0 || messages[index - 1]?.senderId !== message.senderId}
                        showSenderName={message.senderId !== user.id}
                        showTime={true}
                        showReadStatus={message.senderId === user.id}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}

              {typingUsers.length > 0 && (
                <TypingIndicator>
                  {typingUsers.join(', ')}が入力中...
                </TypingIndicator>
              )}
            </MessagesContainer>

            <MessageBox
              onSendMessage={handleSendMessage}
              loading={loading.sending}
              disabled={!selectedRoom}
            />
          </>
        ) : (
          <NoRoomSelected>
            <div>💬</div>
            <div>トークルームを選択してください</div>
          </NoRoomSelected>
        )}
      </MainChat>
    </Container>
  );
};

export default ChatPage;