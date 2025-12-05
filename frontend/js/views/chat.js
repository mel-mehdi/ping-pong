

import { renderNavbar } from '../components/navbar.js';
import api from '../utils/api.js';

export class ChatView {
    constructor(app) {
        this.app = app;
        this.currentUser = 'Alice';
        this.messagePollingInterval = null;
        this.lastMessageTimestamp = 0;
    }

    render() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Player';

        this.app.appContainer.innerHTML = `
            ${renderNavbar('chat')}

            <main class="main-container">
                <div class="chat-view">
                    <div class="chat-container">
                        <!-- Chat Sidebar -->
                        <aside class="chat-sidebar">
                            <div class="chat-sidebar-header">
                                <h3>Conversations</h3>
                            </div>
                            <ul class="chat-users-list" id="chatUsersList">
                                <li class="text-muted" style="padding: 1rem; text-align: center;">No conversations yet</li>
                            </ul>
                        </aside>

                        <!-- Main Chat Area -->
                        <section class="chat-main">
                            <div class="chat-header">
                                <div class="chat-header-info">
                                    <div class="chat-user-avatar">?</div>
                                    <div>
                                        <div class="chat-header-title">Select a conversation</div>
                                        <div class="chat-header-status">No active chat</div>
                                    </div>
                                </div>
                            </div>

                            <div class="chat-messages" id="chatMessages">
                                <div class="text-muted" style="text-align: center; padding: 2rem;">
                                    <p>No messages yet. Start a conversation!</p>
                                </div>
                            </div>

                            <div class="chat-input-area">
                                <div class="chat-input-wrapper">
                                    <textarea 
                                        class="chat-input" 
                                        id="chatInput" 
                                        placeholder="Type a message..."
                                        rows="1"
                                    ></textarea>
                                    <button class="chat-send-btn" id="chatSendBtn">
                                        <span>Send</span>
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <!-- Search Users Modal -->
            <div class="modal-overlay hidden" id="searchModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Add Friends</h3>
                        <button class="modal-close" id="closeSearchModal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="search-input-wrapper">
                            
                            <input 
                                type="text" 
                                class="search-input" 
                                id="userSearchInput"
                                placeholder="Search for users..."
                            />
                        </div>
                        <div class="user-search-results" id="searchResults">
                            <!-- Search results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initChat();
        this.initUserSearch();

        window.addEventListener('friendsUpdated', () => {
            console.log('Friends updated, reloading conversations...');
            this.loadConversations();
        });

        this.conversationInterval = setInterval(() => {
            this.loadConversations();
        }, 5000);

        if (isLoggedIn) {
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.stopMessagePolling();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            });
        }
    }

    cleanup() {
        if (this.conversationInterval) {
            clearInterval(this.conversationInterval);
        }
        this.stopMessagePolling();
    }

    initChat() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatMessages = document.getElementById('chatMessages');
        const chatUsersList = document.getElementById('chatUsersList');
        const username = localStorage.getItem('username') || 'Player';

        this.loadConversations();

        this.currentChatFriend = null;

        if (chatInput) {
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatSendBtn.click();
                }
            });
        }

        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', async () => {
                const message = chatInput.value.trim();
                
                if (message && this.currentChatFriend) {
                    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
                    
                    try {
                        await api.sendMessage(currentUser.userId, this.currentChatFriend.id, message);
                        
                        chatInput.value = '';
                        chatInput.style.height = 'auto';

                        await this.loadMessages(this.currentChatFriend.id, true);
                        
                        console.log('✅ Message sent successfully!');
                    } catch (error) {
                        console.error('❌ Error sending message:', error);
                    }
                } else if (!this.currentChatFriend) {
                    console.log('⚠️ Please select a friend to chat with!');
                }
            });
        }

        if (chatUsersList) {
            chatUsersList.addEventListener('click', async (e) => {
                const userItem = e.target.closest('.chat-user-item');
                if (userItem) {
                    
                    document.querySelectorAll('.chat-user-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    userItem.classList.add('active');

                    const friendId = userItem.dataset.userId;
                    const friendName = userItem.querySelector('.chat-user-name').textContent;
                    const friendAvatar = userItem.querySelector('.chat-user-avatar').textContent;
                    
                    this.currentChatFriend = {
                        id: friendId,
                        name: friendName,
                        avatar: friendAvatar
                    };

                    document.querySelector('.chat-header-title').textContent = friendName;
                    document.querySelector('.chat-header-status').textContent = 'Online';
                    document.querySelector('.chat-header .chat-user-avatar').textContent = friendAvatar;

                    this.lastMessageTimestamp = 0;
                    await this.loadMessages(friendId, true);

                    this.startMessagePolling();
                }
            });
        }
    }

    startMessagePolling() {
        
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
        }

        this.messagePollingInterval = setInterval(async () => {
            if (this.currentChatFriend) {
                await this.loadMessages(this.currentChatFriend.id, false);
            }
        }, 3000);
    }

    stopMessagePolling() {
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
            this.messagePollingInterval = null;
        }
    }

    async loadMessages(friendId, forceUpdate = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        try {
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const messages = await api.getMessages(currentUser.userId, friendId);

            const latestTimestamp = messages.length > 0 ? Math.max(...messages.map(m => m.timestamp)) : 0;

            if (!forceUpdate && latestTimestamp === this.lastMessageTimestamp) {
                return; 
            }
            
            this.lastMessageTimestamp = latestTimestamp;
            
            if (messages.length === 0) {
                chatMessages.innerHTML = `
                    <div class="text-muted" style="text-align: center; padding: 2rem;">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                `;
                return;
            }

            const messagesHTML = messages.map(msg => {
                const isOwn = msg.fromId === currentUser.userId;
                const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                });
                const avatar = isOwn ? currentUser.username.charAt(0).toUpperCase() : this.currentChatFriend.avatar;

                return `
                    <div class="chat-message ${isOwn ? 'own' : ''}">
                        <div class="chat-message-avatar">${avatar}</div>
                        <div class="chat-message-content">
                            <div class="chat-message-bubble">
                                <p class="chat-message-text">${this.escapeHtml(msg.message)}</p>
                            </div>
                            <div class="chat-message-time">${time}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            chatMessages.innerHTML = messagesHTML;
            chatMessages.scrollTop = chatMessages.scrollHeight;

            await api.markMessagesAsRead(currentUser.userId, friendId);
        } catch (error) {
            console.error('Error loading messages:', error);
            chatMessages.innerHTML = `
                <div class="text-muted" style="text-align: center; padding: 2rem;">
                    <p>Error loading messages</p>
                </div>
            `;
        }
    }

    initUserSearch() {
        const searchBtn = document.getElementById('searchUsersBtn');
        const searchModal = document.getElementById('searchModal');
        const closeModal = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('searchResults');

        let allUsers = [];
        
        async function loadUsers() {
            try {
                const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
                const users = await api.getAllUsers();
                allUsers = users
                    .filter(user => user.id !== currentUser.userId)
                    .map(user => ({
                        id: user.id,
                        name: user.username,
                        status: 'Online',
                        avatar: user.username[0].toUpperCase()
                    }));
                console.log('Loaded users for chat:', allUsers);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }
        
        loadUsers();

        let friendRequests = [];
        let friends = [];

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchModal.classList.remove('hidden');
                searchInput.focus();
                displayUsers(allUsers);
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            });
        }

        searchModal?.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query) {
                    const filtered = allUsers.filter(user => 
                        user.name.toLowerCase().includes(query)
                    );
                    displayUsers(filtered);
                } else {
                    displayUsers(allUsers);
                }
            });
        }

        const displayUsers = (users) => {
            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div class="chat-empty-state">
                        <div class="chat-empty-icon"></div>
                        <div class="chat-empty-text">No users found</div>
                        <div class="chat-empty-subtext">Try a different search</div>
                    </div>
                `;
                return;
            }

            searchResults.innerHTML = users.map(user => {
                const isFriend = friends.includes(user.id);
                const isPending = friendRequests.some(req => req.to === user.id);
                let buttonHTML = '';

                if (isFriend) {
                    buttonHTML = '<button class="add-user-btn" disabled>Friends</button>';
                } else if (isPending) {
                    buttonHTML = '<button class="add-user-btn pending" disabled>Pending</button>';
                } else {
                    buttonHTML = `<button class="add-user-btn" data-user-id="${user.id}">+ Add Friend</button>`;
                }

                return `
                    <div class="user-search-item">
                        <div class="user-search-avatar">${user.avatar}</div>
                        <div class="user-search-info">
                            <div class="user-search-name">${user.name}</div>
                            <div class="user-search-status">${user.status}</div>
                        </div>
                        ${buttonHTML}
                    </div>
                `;
            }).join('');

            searchResults.querySelectorAll('.add-user-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.userId;
                    console.log('Button clicked for userId:', userId);
                    console.log('All users:', allUsers);
                    const user = allUsers.find(u => u.id === userId);
                    console.log('Found user:', user);
                    
                    if (!user) {
                        console.error('User not found!');
                        return;
                    }
                    
                    await sendFriendRequest(user);
                    btn.disabled = true;
                    btn.classList.add('pending');
                    btn.textContent = 'Pending';
                });
            });
        };

        const sendFriendRequest = async (user) => {
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const username = currentUser.username || localStorage.getItem('username') || 'Player';
            const userId = currentUser.userId || 0;
            
            console.log('Sending friend request from:', username, 'to:', user.name);
            
            try {
                
                await api.sendFriendRequest(
                    userId,
                    username,
                    user.id,
                    user.name
                );
                
                console.log('✅ Friend request sent successfully!');
                console.log(`Friend request sent to ${user.name}!`);

                if (this.app.updateNotificationBadge) {
                    this.app.updateNotificationBadge();
                }
                
            } catch (error) {
                console.error('Error sending friend request:', error);
            }
        };
    }

    async loadConversations() {
        const chatUsersList = document.getElementById('chatUsersList');
        if (!chatUsersList) return;

        try {
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            
            if (!currentUser.userId) {
                return;
            }

            const invitations = await api.getInvitations(currentUser.userId);
            const acceptedInvitations = invitations.filter(inv => 
                inv.status === 'accepted' && 
                (inv.toId === currentUser.userId || inv.fromId === currentUser.userId)
            );

            const friendRequests = await api.getFriendRequests(currentUser.userId);
            const acceptedRequests = friendRequests.filter(req => 
                req.status === 'accepted' &&
                (req.toId === currentUser.userId || req.fromId === currentUser.userId)
            );

            const friends = new Map();

            acceptedInvitations.forEach(inv => {
                const friendId = inv.toId === currentUser.userId ? inv.fromId : inv.toId;
                const friendName = inv.toId === currentUser.userId ? inv.from : inv.to;
                friends.set(friendId, {
                    id: friendId,
                    name: friendName,
                    avatar: friendName.charAt(0).toUpperCase()
                });
            });

            acceptedRequests.forEach(req => {
                const friendId = req.toId === currentUser.userId ? req.fromId : req.toId;
                const friendName = req.toId === currentUser.userId ? req.from : req.to;
                if (!friends.has(friendId)) {
                    friends.set(friendId, {
                        id: friendId,
                        name: friendName,
                        avatar: friendName.charAt(0).toUpperCase()
                    });
                }
            });

            if (friends.size === 0) {
                chatUsersList.innerHTML = '<li class="text-muted" style="padding: 1rem; text-align: center;">No conversations yet. Add friends to start chatting!</li>';
            } else {
                chatUsersList.innerHTML = Array.from(friends.values()).map(friend => `
                    <li class="chat-user-item" data-user-id="${friend.id}">
                        <div class="chat-user-avatar">${friend.avatar}</div>
                        <div class="chat-user-info">
                            <div class="chat-user-name">${friend.name}</div>
                            <div class="chat-user-last-message">Click to start chatting</div>
                        </div>
                        <div class="chat-user-meta">
                            <span class="chat-user-time">Now</span>
                            <span class="chat-user-status online"></span>
                        </div>
                    </li>
                `).join('');
            }

            console.log('Loaded conversations:', friends.size, 'friends');
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
