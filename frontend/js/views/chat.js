/**
 * Chat View Module
 * Handles chat interface and messaging functionality
 */

import { renderNavbar } from '../components/navbar.js';
import api from '../utils/api.js';

export class ChatView {
    constructor(app) {
        this.app = app;
        this.currentUser = 'Alice';
    }

    /**
     * Render chat view
     */
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

        // Listen for friend updates
        window.addEventListener('friendsUpdated', () => {
            console.log('Friends updated, reloading conversations...');
            this.loadConversations();
        });

        // Auto-refresh conversations every 5 seconds to check for new friends
        this.conversationInterval = setInterval(() => {
            this.loadConversations();
        }, 5000);

        if (isLoggedIn) {
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            });
        }
    }

    /**
     * Initialize chat functionality
     */
    initChat() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatMessages = document.getElementById('chatMessages');
        const chatUsersList = document.getElementById('chatUsersList');
        const username = localStorage.getItem('username') || 'Player';

        // Load accepted friends/conversations
        this.loadConversations();

        // Store current chat friend
        this.currentChatFriend = null;

        // Auto-resize textarea
        if (chatInput) {
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Send on Enter (Shift+Enter for new line)
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatSendBtn.click();
                }
            });
        }

        // Send message
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', async () => {
                const message = chatInput.value.trim();
                if (message && this.currentChatFriend) {
                    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
                    
                    try {
                        // Send message to backend
                        await api.sendMessage(currentUser.userId, this.currentChatFriend.id, message);
                        
                        const time = new Date().toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                        });

                        const messageHTML = `
                            <div class="chat-message own">
                                <div class="chat-message-avatar">${username.charAt(0).toUpperCase()}</div>
                                <div class="chat-message-content">
                                    <div class="chat-message-bubble">
                                        <p class="chat-message-text">${this.escapeHtml(message)}</p>
                                    </div>
                                    <div class="chat-message-time">${time}</div>
                                </div>
                            </div>
                        `;

                        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
                        chatInput.value = '';
                        chatInput.style.height = 'auto';
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        
                        console.log('✅ Message sent successfully!');
                    } catch (error) {
                        console.error('Error sending message:', error);
                        alert('Failed to send message: ' + error.message);
                    }
                } else if (!this.currentChatFriend) {
                    alert('Please select a friend to chat with!');
                }
            });
        }

        // Switch users
        if (chatUsersList) {
            chatUsersList.addEventListener('click', async (e) => {
                const userItem = e.target.closest('.chat-user-item');
                if (userItem) {
                    // Update active state
                    document.querySelectorAll('.chat-user-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    userItem.classList.add('active');

                    // Get friend info
                    const friendId = userItem.dataset.userId;
                    const friendName = userItem.querySelector('.chat-user-name').textContent;
                    const friendAvatar = userItem.querySelector('.chat-user-avatar').textContent;
                    
                    this.currentChatFriend = {
                        id: friendId,
                        name: friendName,
                        avatar: friendAvatar
                    };

                    // Update header
                    document.querySelector('.chat-header-title').textContent = friendName;
                    document.querySelector('.chat-header-status').textContent = 'Online';
                    document.querySelector('.chat-header .chat-user-avatar').textContent = friendAvatar;

                    // Load messages for this conversation
                    await this.loadMessages(friendId);
                }
            });
        }
    }

    /**
     * Load messages between current user and a friend
     */
    async loadMessages(friendId) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        try {
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const messages = await api.getMessages(currentUser.userId, friendId);
            
            if (messages.length === 0) {
                chatMessages.innerHTML = `
                    <div class="text-muted" style="text-align: center; padding: 2rem;">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                `;
                return;
            }

            // Display messages
            chatMessages.innerHTML = messages.map(msg => {
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

            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Mark messages as read
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

    /**
     * Initialize user search functionality
     */
    initUserSearch() {
        const searchBtn = document.getElementById('searchUsersBtn');
        const searchModal = document.getElementById('searchModal');
        const closeModal = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('searchResults');

        // Load users from database
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

        // Open modal
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchModal.classList.remove('hidden');
                searchInput.focus();
                displayUsers(allUsers);
            });
        }

        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            });
        }

        // Close on overlay click
        searchModal?.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            }
        });

        // Search functionality
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

            // Add event listeners to add buttons
            searchResults.querySelectorAll('.add-user-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.userId;
                    console.log('Button clicked for userId:', userId);
                    console.log('All users:', allUsers);
                    const user = allUsers.find(u => u.id === userId);
                    console.log('Found user:', user);
                    
                    if (!user) {
                        console.error('User not found!');
                        alert('Error: User not found');
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
                // Send friend request via API
                await api.sendFriendRequest(
                    userId,
                    username,
                    user.id,
                    user.name
                );
                
                console.log('✅ Friend request sent successfully!');
                alert(`Friend request sent to ${user.name}!`);
                
                // Update notification badge
                if (this.app.updateNotificationBadge) {
                    this.app.updateNotificationBadge();
                }
                
            } catch (error) {
                console.error('Error sending friend request:', error);
                alert('Failed to send friend request: ' + error.message);
            }
        };
    }

    /**
     * Load conversations from accepted friend requests and invitations
     */
    async loadConversations() {
        const chatUsersList = document.getElementById('chatUsersList');
        if (!chatUsersList) return;

        try {
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            
            if (!currentUser.userId) {
                return;
            }

            // Get accepted invitations and friend requests
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

            // Combine and deduplicate friends
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

            // Display friends in chat list
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

    /**
     * Escape HTML to prevent XSS
     */
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
