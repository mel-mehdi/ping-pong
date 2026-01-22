import React, { useState, useEffect, useRef, startTransition } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../utils/api';
import { buildWsUrl, wsLog, safeCloseSocket } from '../utils/wss';
import { getAvatarUrl } from '../utils/avatar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/chat.css';

const MessageItem = React.memo(({ msg }) => (
  <div className={`chat-message ${msg.isOwn ? 'own-message' : 'other-message'} ${msg.isNotification ? 'notification-message' : ''}`}>
    {!msg.isOwn && !msg.isNotification && (
      <div className="chat-message-avatar">
        {msg.avatar ? (
          <img src={getAvatarUrl(msg.avatar)} alt={msg.sender} className="avatar-img" />
        ) : (
          <div className="avatar-circle">{msg.sender ? msg.sender[0] : '?'}</div>
        )}
      </div>
    )}
    <div className="chat-message-content">
      <div className="chat-message-text">{msg.text}</div>
      <div className="chat-message-time">{msg.time}</div>
    </div>
  </div>
));

const ChatPage = () => {
  const { userData, isBackendAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [pageAlert, setPageAlert] = useState(null);
  const [pageAlertType, setPageAlertType] = useState('danger');

  // WebSocket connection management
  useEffect(() => {
    if (!currentConversationId || !isBackendAuthenticated) {
      if (wsRef.current) {
        safeCloseSocket(wsRef.current);
        wsRef.current = null;
      }
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      safeCloseSocket(wsRef.current);
    }

    // Create WebSocket connection
    const wsUrl = buildWsUrl(`/ws/chat/${currentConversationId}/`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      wsLog('[WSS][Chat] open', wsUrl);
    };

    ws.onerror = (err) => {
      wsLog('[WSS][Chat] error', err);
    };

    ws.onclose = (ev) => {
      wsLog('[WSS][Chat] close', ev);
    };

    ws.onmessage = (event) => {
      // Use MessageChannel to defer processing to the next microtask
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat_message' && data.message) {
            const newMsg = {
              id: data.message.id || Date.now(),
              sender: data.message.sender?.username || data.message.sender_name || 'Unknown',
              text: data.message.content || data.message.text || '',
              time: new Date(data.message.created_at || Date.now()).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              isOwn: data.message.sender?.id === userData.userId || data.message.sender_id === userData.userId,
              created_at: data.message.created_at || new Date().toISOString(),
              avatar: data.message.sender?.avatar || null,
            };
            
            startTransition(() => {
              setMessages(prev => {
                // Avoid duplicates - fast path
                if (prev.some(m => m.id === newMsg.id)) return prev;
                
                // Append new message (assume chronological order from server)
                return [...prev, newMsg];
              });
            });
          }
        } catch (err) {
          // Failed to parse WebSocket message
        }
        const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        if (typeof wsLog !== 'undefined' && (t1 - t0) > 50) wsLog('[WSS][Chat] processMessage took', (t1 - t0).toFixed(1), 'ms');
      };
      channel.port2.postMessage(null);
    };

    ws.onerror = () => {
      // WebSocket connection error
    };

    ws.onclose = () => {
      // WebSocket closed
    };

    return () => {
      safeCloseSocket(ws);
    };
  }, [currentConversationId, isBackendAuthenticated, userData]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData || !selectedChat) return;

    const msg = newMessage.trim();
    setNewMessage('');

    if (!isBackendAuthenticated) {
      // Local-only message when not authenticated
      setMessages([...messages, {
        id: Date.now(),
        sender: 'You',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      }]);
      return;
    }

    try {
      // Get or create conversation
      const conversation = await apiClient.getOrCreateConversation(userData.userId, selectedChat.id);
      
      if (conversation?.id) {
        // Update current conversation ID if needed
        if (currentConversationId !== conversation.id) {
          setCurrentConversationId(conversation.id);
          
          // Wait a bit for WebSocket to connect
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Send message via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'chat_message',
            message: msg,
          }));
        } else {
          // Fallback: show message locally if WebSocket not connected
          setMessages([...messages, {
            id: Date.now(),
            sender: userData.username || 'You',
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
          }]);
        }
      }
    } catch (err) {
      // Show message locally on error
      setMessages([...messages, {
        id: Date.now(),
        sender: userData.username || 'You',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      }]);
    }
  };

  useEffect(() => {
    if (!userData?.userId || !isBackendAuthenticated) {
      setConversations([]);
      setSelectedChat(null);
      return;
    }

    const loadFriends = async () => {
      try {
        // Get friends from friendships endpoint
        const friendsList = await apiClient.getMyFriends();
        
        // Map friends to conversation list
        const friends = (friendsList || []).map(friend => ({
          id: friend.id || friend.userId,
          name: friend.username || 'Unknown',
          lastMessage: '',
          time: '',
          unread: 0,
          online: friend.online_status || false,
          avatar: friend.avatar
        }));
        
        setConversations(friends);
        if (!selectedChat && friends.length) setSelectedChat(friends[0]);
      } catch (err) {
        setConversations([]);
      }
    };

    loadFriends();
    
    // Refresh friends list every 5 seconds to catch newly accepted friendships
    const interval = setInterval(loadFriends, 5000);
    
    // Listen for custom friend refresh event
    const handleFriendRefresh = () => {
      loadFriends();
    };
    window.addEventListener('friendAccepted', handleFriendRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('friendAccepted', handleFriendRefresh);
    };
  }, [userData, isBackendAuthenticated]);

  useEffect(() => {
    if (!userData?.userId || !selectedChat) {
      setMessages([]);
      setCurrentConversationId(null);
      return;
    }

    (async () => {
      try {
        if (!isBackendAuthenticated) {
          setMessages([]);
          setCurrentConversationId(null);
          return;
        }

        // Get or create conversation
        const conversation = await apiClient.getOrCreateConversation(userData.userId, selectedChat.id);
        
        if (conversation?.id) {
          setCurrentConversationId(conversation.id);
          
          // Load existing messages
          const msgs = await apiClient.getConversationMessages(conversation.id);
          const formattedMsgs = (msgs || []).map(m => ({
            id: m.id,
            sender: m.sender?.username || 'Unknown',
            text: m.content || m.text || '',
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.sender?.id === userData.userId,
            created_at: m.created_at || new Date().toISOString(),
            avatar: m.sender?.avatar || null,
          })).sort((a, b) => {
            // Sort by created_at timestamp
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          });
          setMessages(formattedMsgs);
        } else {
          setMessages([]);
          setCurrentConversationId(null);
        }
      } catch (err) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    })();
  }, [selectedChat, userData, isBackendAuthenticated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendGameInvite = async () => {
    if (!selectedChat || !isBackendAuthenticated) return;
    
    try {
      await apiClient.sendGameInvitation(
        selectedChat.id, 
        'match', 
        `${userData.username || 'A player'} invited you to play Pong!`
      );
      
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          text: `🎮 Game invitation sent to ${selectedChat.name}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          isNotification: true,
        },
      ]);
    } catch (err) {
      // Error sending game invitation
      setPageAlert(t('chat.inviteFailed') || 'Failed to send game invitation');
      setPageAlertType('danger');
      setTimeout(() => setPageAlert(null), 4000);
    }
    setShowMenu(false);
  };

  // Block user functionality removed — using standard conversation flow without local blocking.

  return (
    <>
      <Navbar />
      <main className="chat-main-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-4 col-md-4 mb-3">
              <div className="card chat-conversations-card">
                <div className="card-header">
                  <h5 className="mb-0">{t('chat.conversations')}</h5>
                </div>
                <div className="card-body">
                  {pageAlert && (
                    <div className={`alert alert-${pageAlertType} mt-2`} role="status">{pageAlert}</div>
                  )}
                  <div className="chat-users-list-body">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`chat-user-item ${selectedChat?.id === conv.id ? 'active' : ''}`}
                        onClick={() => setSelectedChat(conv)}
                      >
                        <div className="chat-user-avatar">
                          {conv.avatar ? (
                            <img src={getAvatarUrl(conv.avatar)} alt={conv.name} className="avatar-img" />
                          ) : (
                            <div className="avatar-circle">{conv.name[0]}</div>
                          )}
                          {conv.online && <span className="online-status"></span>}
                        </div>
                        <div className="chat-user-info">
                          <div className="chat-user-name">{conv.name}</div>
                          <div className="chat-user-last-message">{conv.lastMessage}</div>
                        </div>
                        <div className="chat-user-meta">
                          <div className="chat-user-time">{conv.time}</div>
                          {conv.unread > 0 && (
                            <span className="chat-unread-badge">{conv.unread}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8 col-md-8">
              <div className="card chat-messages-card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="chat-user-avatar me-3">
                        {selectedChat?.avatar ? (
                          <img src={getAvatarUrl(selectedChat.avatar)} alt={selectedChat.name} className="avatar-img" />
                        ) : (
                          <div className="avatar-circle">
                            {selectedChat?.name ? selectedChat.name[0] : ''}
                          </div>
                        )}
                        {selectedChat?.online && <span className="online-status"></span>}
                      </div>
                      <div>
                        <h5 className="chat-header-title mb-0">{selectedChat?.name}</h5>
                        <span className="chat-header-status">
                          {selectedChat?.online ? t('status.online') : t('status.offline')}
                        </span>
                      </div>
                    </div>
                    <div className="chat-actions">
                      <button className="chat-menu-btn" onClick={() => setShowMenu(!showMenu)}>
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      {showMenu && (
                        <div className="chat-dropdown-menu">
                          <button onClick={sendGameInvite} className="menu-item">
                            <i className="fas fa-gamepad"></i> {t('chat.send_game_invite')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chat-messages-body">
                    {messages.map((msg) => (
                      <MessageItem key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <div className="card-footer">
                  <form onSubmit={sendMessage} className="chat-input-form">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={t('chat.type_message')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ChatPage;

/* end of ChatPage */
