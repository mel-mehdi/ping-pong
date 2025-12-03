/**
 * Chat View Module
 * Handles chat interface and messaging functionality
 */

import { renderNavbar } from '../components/navbar.js';

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
            chatSendBtn.addEventListener('click', () => {
                const message = chatInput.value.trim();
                if (message) {
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

                    // TODO: Send message to backend/database
                    // For now, messages are only displayed locally
                }
            });
        }

        // Switch users
        if (chatUsersList) {
            chatUsersList.addEventListener('click', (e) => {
                const userItem = e.target.closest('.chat-user-item');
                if (userItem) {
                    // Update active state
                    document.querySelectorAll('.chat-user-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    userItem.classList.add('active');

                    // Update header
                    this.currentUser = userItem.dataset.user;
                    const avatar = userItem.querySelector('.chat-user-avatar').textContent;
                    const name = userItem.querySelector('.chat-user-name').textContent;
                    const status = userItem.querySelector('.chat-user-status').textContent;

                    document.querySelector('.chat-header-title').textContent = name;
                    document.querySelector('.chat-header-status').textContent = status;
                    document.querySelector('.chat-header .chat-user-avatar').textContent = avatar;

                    // Clear messages and show new conversation
                    chatMessages.innerHTML = `
                        <div class="chat-date-divider">
                            <span class="chat-date-text">Today</span>
                        </div>
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                            <div class="chat-empty-text">Start a conversation with ${name}</div>
                            <div class="chat-empty-subtext">Send a message to get started</div>
                        </div>
                    `;
                }
            });
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
        import('../utils/database.js').then(module => {
            const db = module.default;
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            allUsers = db.find('users')
                .filter(user => user.id !== currentUser.userId)
                .map(user => ({
                    id: user.id,
                    name: user.username,
                    status: 'Online',
                    avatar: user.username[0].toUpperCase()
                }));
        }).catch(err => console.error('Error loading users:', err));

        let friendRequests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
        let friends = JSON.parse(localStorage.getItem('friends') || '[]');

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
                btn.addEventListener('click', () => {
                    const userId = parseInt(btn.dataset.userId);
                    const user = allUsers.find(u => u.id === userId);
                    sendFriendRequest(user);
                    btn.disabled = true;
                    btn.classList.add('pending');
                    btn.textContent = 'Pending';
                });
            });
        };

        const sendFriendRequest = (user) => {
            const username = localStorage.getItem('username') || 'Player';
            friendRequests.push({
                from: username,
                to: user.id,
                toName: user.name,
                timestamp: Date.now()
            });
            localStorage.setItem('friendRequests', JSON.stringify(friendRequests));

            // Simulate receiving the request (in real app, this would be server-side)
            const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
            receivedRequests.push({
                from: username,
                fromId: 0,
                avatar: username.charAt(0).toUpperCase(),
                timestamp: Date.now()
            });
            localStorage.setItem('receivedRequests', JSON.stringify(receivedRequests));
            this.app.updateNotificationBadge();
        };
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
