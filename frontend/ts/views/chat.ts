

import { renderNavbar } from '../components/navbar.ts';
import api from '../utils/api.ts';

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

            <main class="container-fluid px-4 py-3" style="max-width: 1600px;">
                <div class="row g-3" style="height: calc(100vh - 100px);">
                    <!-- Conversations List -->
                    <div class="col-lg-4">
                        <div class="card h-100 border">
                            <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                                <h5 class="mb-0 fw-semibold">Conversations</h5>
                                <button class="btn btn-sm btn-primary" id="newChatBtn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="card-body p-0" style="overflow-y: auto;">
                                <ul class="list-group list-group-flush" id="chatUsersList">
                                    <li class="list-group-item text-center text-muted py-5">
                                        <i class="fas fa-comments fa-3x mb-3 opacity-50"></i>
                                        <p class="mb-0">No conversations</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Chat Area -->
                    <div class="col-lg-8">
                        <div class="card h-100 border">
                            <div class="card-header bg-white border-bottom py-3">
                                <div class="d-flex align-items-center">
                                    <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" 
                                         style="width: 42px; height: 42px; font-weight: 600;">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-0 fw-semibold chat-header-title">Select a conversation</h6>
                                        <small class="text-muted chat-header-status">Start chatting</small>
                                    </div>
                                </div>
                            </div>

                            <div class="card-body p-4" id="chatMessages" style="overflow-y: auto; background-color: #fafafa;">
                                <div class="text-center py-5 text-muted">
                                    <i class="fas fa-comment-dots fa-4x mb-3 opacity-25"></i>
                                    <h5>No messages yet</h5>
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            </div>

                            <div class="card-footer bg-white border-top p-3">
                                <div class="d-flex gap-2 align-items-end">
                                    <textarea 
                                        class="form-control" 
                                        id="chatInput" 
                                        placeholder="Type a message..."
                                        rows="1"
                                        style="resize: none; max-height: 120px;"
                                    ></textarea>
                                    <button class="btn btn-primary px-4" id="chatSendBtn" type="button">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Search Users Modal -->
            <div class="modal fade" id="searchModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-user-plus me-2"></i>Add Friends</h5>
                            <button type="button" class="btn-close" id="closeSearchModal" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="userSearchInput"
                                    placeholder="Search for users..."
                                />
                            </div>
                            <div id="searchResults">
                                <!-- Search results will be populated here -->
                            </div>
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
                        item.classList.remove('active', 'bg-light');
                    });
                    userItem.classList.add('active', 'bg-light');

                    const friendId = userItem.dataset.userId;
                    const friendName = userItem.querySelector('.chat-user-name').textContent;
                    const friendAvatar = userItem.querySelector('.rounded-circle span')?.textContent || friendName.charAt(0).toUpperCase();
                    
                    this.currentChatFriend = {
                        id: friendId,
                        name: friendName,
                        avatar: friendAvatar
                    };

                    document.querySelector('.chat-header-title').textContent = friendName;
                    document.querySelector('.chat-header-status').textContent = 'Online';
                    const headerAvatar = document.querySelector('.card-header .rounded-circle i');
                    if (headerAvatar && headerAvatar.parentElement) {
                        headerAvatar.parentElement.innerHTML = `<span class="fw-semibold">${friendAvatar}</span>`;
                    }

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
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-comment-dots fa-4x mb-3 opacity-25"></i>
                        <h5>No messages yet</h5>
                        <p>Start the conversation with ${this.currentChatFriend.name}</p>
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
                    <div class="d-flex mb-3 ${isOwn ? 'justify-content-end' : 'justify-content-start'}">
                        ${!isOwn ? `
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0" 
                                 style="width: 36px; height: 36px; font-weight: 600;">
                                ${avatar}
                            </div>
                        ` : ''}
                        <div style="max-width: 65%;">
                            <div class="p-3 ${isOwn ? 'bg-primary text-white' : 'bg-white border'}" 
                                 style="border-radius: ${isOwn ? '12px 12px 0 12px' : '12px 12px 12px 0'};">
                                <p class="mb-0">${this.escapeHtml(msg.message)}</p>
                            </div>
                            <small class="text-muted d-block mt-1 px-2" style="font-size: 0.75rem;">${time}</small>
                        </div>
                        ${isOwn ? `
                            <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center ms-2 flex-shrink-0" 
                                 style="width: 36px; height: 36px; font-weight: 600;">
                                ${avatar}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            
            chatMessages.innerHTML = messagesHTML;
            chatMessages.scrollTop = chatMessages.scrollHeight;

            await api.markMessagesAsRead(currentUser.userId, friendId);
        } catch (error) {
            console.error('Error loading messages:', error);
            chatMessages.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>Error loading messages
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
                const modal = bootstrap.Modal.getOrCreateInstance(searchModal);
                modal.show();
                setTimeout(() => searchInput.focus(), 100);
                displayUsers(allUsers);
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(searchModal);
                if (modal) modal.hide();
                searchInput.value = '';
            });
        }

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
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-search fa-3x mb-3 opacity-25"></i>
                        <div class="fw-bold">No users found</div>
                        <small>Try a different search</small>
                    </div>
                `;
                return;
            }

            searchResults.innerHTML = users.map(user => {
                const isFriend = friends.includes(user.id);
                const isPending = friendRequests.some(req => req.to === user.id);
                let buttonHTML = '';

                if (isFriend) {
                    buttonHTML = '<button class="btn btn-sm btn-secondary" disabled><i class="fas fa-check me-1"></i>Friends</button>';
                } else if (isPending) {
                    buttonHTML = '<button class="btn btn-sm btn-warning" disabled><i class="fas fa-clock me-1"></i>Pending</button>';
                } else {
                    buttonHTML = `<button class="btn btn-sm btn-primary add-user-btn" data-user-id="${user.id}"><i class="fas fa-user-plus me-1"></i>Add Friend</button>`;
                }

                return `
                    <div class="d-flex align-items-center p-2 border-bottom">
                        <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px;">
                            <span>${user.avatar}</span>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">${user.name}</div>
                            <small class="text-muted">${user.status}</small>
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
                chatUsersList.innerHTML = `
                    <li class="list-group-item text-center text-muted py-5">
                        <i class="fas fa-comments fa-3x mb-3 opacity-50"></i>
                        <p class="mb-0">No conversations</p>
                        <small>Add friends to start chatting</small>
                    </li>
                `;
            } else {
                chatUsersList.innerHTML = Array.from(friends.values()).map(friend => `
                    <li class="list-group-item list-group-item-action chat-user-item" data-user-id="${friend.id}" 
                        style="cursor: pointer; border-left: 3px solid transparent; transition: all 0.2s;">
                        <div class="d-flex align-items-center py-2">
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                                 style="width: 45px; height: 45px; font-weight: 600; font-size: 1.1rem;">
                                ${friend.avatar}
                            </div>
                            <div class="flex-grow-1 overflow-hidden">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <h6 class="mb-0 fw-semibold chat-user-name">${friend.name}</h6>
                                    <small class="text-muted">2m</small>
                                </div>
                                <p class="mb-0 text-muted small text-truncate chat-user-last-message">Click to start chatting</p>
                            </div>
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
