import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/chat.css';

const ChatPage = () => {
  const { userData, isBackendAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      (async () => {
        try {
          if (!userData || !selectedChat) return;
          if (!isBackendAuthenticated) {
            // local-only send
            setMessages([
              ...messages,
              {
                id: messages.length + 1,
                sender: 'You',
                text: newMessage.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true,
              },
            ]);
            setNewMessage('');
            return;
          }
          await apiClient.sendMessage(userData.userId, selectedChat.id, newMessage.trim());
          const updated = await apiClient.getMessages(userData.userId, selectedChat.id);
          setMessages(updated || []);
        } catch (err) {
          console.error('Error sending message:', err);
        }
      })();
      setNewMessage('');
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      if (!userData?.userId) return;
      // If not backend auth, skip loading conversations
      if (!isBackendAuthenticated) {
        setConversations([]);
        setSelectedChat(null);
        return;
      }

      // include selectedChat in dependencies to satisfy hooks linter

      try {
        const users = await apiClient.getAllUsers();
        const others = (users || [])
          .filter((u) => u.id !== userData.userId)
          .map((u) => ({
            id: u.id,
            name: u.username,
            lastMessage: '',
            time: '',
            unread: 0,
            online: false,
          }));
        setConversations(others);
        if (!selectedChat && others.length > 0) setSelectedChat(others[0]);
      } catch (err) {
        console.error('Error loading users for conversations:', err);
        setConversations([]);
        setSelectedChat(null);
      }
    };
    loadConversations();
  }, [userData, isBackendAuthenticated, selectedChat]);

  useEffect(() => {
    const loadMessagesForSelected = async () => {
      if (!userData?.userId || !selectedChat) return;
      try {
        if (!isBackendAuthenticated) {
          setMessages([]);
        } else {
          const msgs = await apiClient.getMessages(userData.userId, selectedChat.id);
          setMessages(msgs || []);
        }
      } catch (err) {
        console.error('Error loading messages for conversation:', err);
      }
    };
    loadMessagesForSelected();
  }, [selectedChat, userData, isBackendAuthenticated]);

  const sendGameInvite = () => {
    if (!selectedChat) return;
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
    setShowMenu(false);
  };

  const blockUser = () => {
    if (!selectedChat) return;
    if (!blockedUsers.includes(selectedChat.id)) {
      setBlockedUsers([...blockedUsers, selectedChat.id]);
      console.info(`${selectedChat.name} has been blocked`);
    }
    setShowMenu(false);
  };

  const unblockUser = () => {
    if (!selectedChat) return;
    setBlockedUsers(blockedUsers.filter((id) => id !== selectedChat.id));
    console.info(`${selectedChat.name} has been unblocked`);
    setShowMenu(false);
  };

  const selectedChatId = selectedChat?.id;
  const isBlocked = selectedChatId ? blockedUsers.includes(selectedChatId) : false;

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
                  <div className="chat-users-list-body">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`chat-user-item ${selectedChatId === conv.id ? 'active' : ''}`}
                        onClick={() => setSelectedChat(conv)}
                      >
                        <div className="chat-user-avatar">
                          <div className="avatar-circle">{conv.name[0]}</div>
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
                        <div className="avatar-circle">
                          {selectedChat?.name ? selectedChat.name[0] : ''}
                        </div>
                        {selectedChat?.online && <span className="online-status"></span>}
                      </div>
                      <div>
                        <h5 className="chat-header-title mb-0">
                          {selectedChat?.name}
                          {isBlocked && (
                            <span className="blocked-badge">🚫 {t('chat.blocked')}</span>
                          )}
                        </h5>
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
                          {!isBlocked ? (
                            <button onClick={blockUser} className="menu-item danger">
                              <i className="fas fa-ban"></i> {t('chat.block_user')}
                            </button>
                          ) : (
                            <button onClick={unblockUser} className="menu-item">
                              <i className="fas fa-check"></i> {t('chat.unblock_user')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chat-messages-body">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.isOwn ? 'own-message' : 'other-message'} ${msg.isNotification ? 'notification-message' : ''}`}
                      >
                        <div className="chat-message-content">
                          <div className="chat-message-text">{msg.text}</div>
                          <div className="chat-message-time">{msg.time}</div>
                        </div>
                      </div>
                    ))}
                    {isBlocked && (
                      <div className="chat-blocked-notice">
                        <i className="fas fa-ban"></i> {t('chat.blocked_notice')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <form onSubmit={sendMessage} className="chat-input-form">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={isBlocked ? t('chat.user_blocked') : t('chat.type_message')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isBlocked}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isBlocked}>
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
