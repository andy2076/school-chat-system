import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

/**
 * トークルーム一覧コンポーネント
 * ユーザーが参加しているルームの一覧を表示
 */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
`;

const Header = styled.div`
  padding: 16px 20px;
  background-color: #06c755;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SearchContainer = styled.div`
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  background-color: white;
  
  &:focus {
    border-color: #06c755;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const RoomListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:active {
    background-color: #e8e8e8;
  }
`;

const RoomAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.roomType === 'teacher' ? '#ff6b6b' : '#4ecdc4'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoomMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 12px;
  flex-shrink: 0;
`;

const LastTime = styled.div`
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
`;

const UnreadBadge = styled.div`
  background-color: #ff4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
  display: ${props => props.count > 0 ? 'block' : 'none'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 14px;
  color: #666;
`;

const RoomList = ({ 
  rooms = [], 
  loading = false, 
  onRoomSelect,
  searchQuery = '',
  onSearchChange 
}) => {
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(room => 
        room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [rooms, searchQuery]);

  // ルーム名の頭文字を取得（アバター用）
  const getRoomInitial = (roomName) => {
    if (!roomName) return '?';
    return roomName.charAt(0);
  };

  // 最終メッセージ時刻のフォーマット
  const formatLastTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / 36e5;
    
    if (diffInHours < 1) {
      return format(messageTime, 'HH:mm');
    } else if (diffInHours < 24) {
      return format(messageTime, 'HH:mm');
    } else {
      return format(messageTime, 'MM/dd');
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <Container>
        <Header>トークルーム</Header>
        <LoadingState>読み込み中...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>トークルーム</Header>
      
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="ルームを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </SearchContainer>
      
      <RoomListContainer>
        {filteredRooms.length === 0 ? (
          <EmptyState>
            {searchQuery ? '検索結果がありません' : 'トークルームがありません'}
          </EmptyState>
        ) : (
          filteredRooms.map((room) => (
            <RoomItem
              key={room.id}
              onClick={() => onRoomSelect && onRoomSelect(room)}
            >
              <RoomAvatar roomType={room.roomType}>
                {getRoomInitial(room.name)}
              </RoomAvatar>
              
              <RoomInfo>
                <RoomName>{room.name || 'Unknown Room'}</RoomName>
                <LastMessage>
                  {room.lastMessage || 'メッセージがありません'}
                </LastMessage>
              </RoomInfo>
              
              <RoomMeta>
                <LastTime>
                  {formatLastTime(room.updatedAt || room.lastMessageTime)}
                </LastTime>
                <UnreadBadge count={room.unreadCount || 0}>
                  {room.unreadCount || 0}
                </UnreadBadge>
              </RoomMeta>
            </RoomItem>
          ))
        )}
      </RoomListContainer>
    </Container>
  );
};

export default RoomList;