import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/chat.css';

const ChatPage = () => {
    const [conversations] = useState([
        { id: 1, name: 'Player One', lastMessage: 'Good game!', time: '2m ago', unread: 2, online: true, blocked: false },
        { id: 2, name: 'Player Two', lastMessage: 'Want to play again?', time: '15m ago', unread: 0, online: true, blocked: false },
        { id: 3, name: 'Player Three', lastMessage: 'See you tomorrow', time: '1h ago', unread: 0, online: false, blocked: false },
    ]);
    
    const [selectedChat, setSelectedChat] = useState(conversations[0]);
    const [showMenu, setShowMenu] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Player One', text: 'Hey! Ready for a match?', time: '10:30 AM', isOwn: false },
        { id: 2, sender: 'You', text: 'Sure! Let\'s play', time: '10:31 AM', isOwn: true },
        { id: 3, sender: 'Player One', text: 'Good game!', time: '10:45 AM', isOwn: false },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, {
                id: messages.length + 1,
                sender: 'You',
                text: newMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true
            }]);
            setNewMessage('');
        }
    };

    const sendGameInvite = () => {
        setMessages([...messages, {
            id: messages.length + 1,
            sender: 'You',
            text: `🎮 Game invitation sent to ${selectedChat.name}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            isNotification: true
        }]);
        setShowMenu(false);
    };

    const blockUser = () => {
        if (!blockedUsers.includes(selectedChat.id)) {
            setBlockedUsers([...blockedUsers, selectedChat.id]);
            console.log(`${selectedChat.name} has been blocked`);
        }
        setShowMenu(false);
    };

    const unblockUser = () => {
        setBlockedUsers(blockedUsers.filter(id => id !== selectedChat.id));
        console.log(`${selectedChat.name} has been unblocked`);
        setShowMenu(false);
    };

    const isBlocked = blockedUsers.includes(selectedChat.id);

    return (
        <>
            <Navbar />
            <main className="chat-main-container">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-4 col-md-4 mb-3">
                            <div className="card chat-conversations-card">
                                <div className="card-header">
                                    <h5 className="mb-0">Conversations</h5>
                                </div>
                                <div className="card-body">
                                    <div className="chat-users-list-body">
                                        {conversations.map(conv => (
                                            <div 
                                                key={conv.id}
                                                className={`chat-user-item ${selectedChat.id === conv.id ? 'active' : ''}`}
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
                                                <div className="avatar-circle">{selectedChat.name[0]}</div>
                                                {selectedChat.online && <span className="online-status"></span>}
                                            </div>
                                            <div>
                                                <h5 className="chat-header-title mb-0">
                                                    {selectedChat.name}
                                                    {isBlocked && <span className="blocked-badge">🚫 Blocked</span>}
                                                </h5>
                                                <span className="chat-header-status">
                                                    {selectedChat.online ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chat-actions">
                                            <button 
                                                className="chat-menu-btn"
                                                onClick={() => setShowMenu(!showMenu)}
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            {showMenu && (
                                                <div className="chat-dropdown-menu">
                                                    <button onClick={sendGameInvite} className="menu-item">
                                                        <i className="fas fa-gamepad"></i> Send Game Invite
                                                    </button>
                                                    {!isBlocked ? (
                                                        <button onClick={blockUser} className="menu-item danger">
                                                            <i className="fas fa-ban"></i> Block User
                                                        </button>
                                                    ) : (
                                                        <button onClick={unblockUser} className="menu-item">
                                                            <i className="fas fa-check"></i> Unblock User
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="chat-messages-body">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own-message' : 'other-message'} ${msg.isNotification ? 'notification-message' : ''}`}>
                                                <div className="chat-message-content">
                                                    <div className="chat-message-text">{msg.text}</div>
                                                    <div className="chat-message-time">{msg.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {isBlocked && (
                                            <div className="chat-blocked-notice">
                                                <i className="fas fa-ban"></i> You have blocked this user. Messages cannot be sent.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <form onSubmit={sendMessage} className="chat-input-form">
                                        <input
                                            type="text"
                                            className="chat-input"
                                            placeholder={isBlocked ? "User is blocked" : "Type a message..."}
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
