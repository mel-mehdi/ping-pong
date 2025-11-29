/**
 * Chat View Module
 * Handles chat interface and messaging functionality
 */

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
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="#chat" class="active">Chat</a></li>
                        <li><a href="profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="login.html">Login</a></li><li><a href="register.html">Sign Up</a></li>'
                        }
                    </ul>
                    <div class="nav-actions">
                        <div class="nav-search-input-wrapper">
                            <i class="fas fa-search nav-search-icon"></i>
                            <input 
                                type="text" 
                                class="nav-search-input" 
                                id="navSearchInput"
                                placeholder="Search players to invite..."
                                autocomplete="off"
                            />
                            <div class="nav-search-results hidden" id="navSearchResults"></div>
                        </div>
                        <button class="nav-icon-btn" id="navNotificationsBtn" title="Notifications" aria-label="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span class="notification-badge hidden" id="navNotificationBadge">0</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main class="main-container">
                <div class="chat-view">
                    <div class="chat-container">
                        <!-- Chat Sidebar -->
                        <aside class="chat-sidebar">
                            <div class="chat-sidebar-header">
                                <h3>Conversations</h3>
                            </div>
                            <ul class="chat-users-list" id="chatUsersList">
                                <li class="chat-user-item active" data-user="Alice">
                                    <div class="chat-user-avatar">A</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Alice</div>
                                        <div class="chat-user-status">Online</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                                <li class="chat-user-item" data-user="Bob">
                                    <div class="chat-user-avatar">B</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Bob</div>
                                        <div class="chat-user-status">Away</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                                <li class="chat-user-item" data-user="Charlie">
                                    <div class="chat-user-avatar">C</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Charlie</div>
                                        <div class="chat-user-status">Last seen 2h ago</div>
                                    </div>
                                    <div class="chat-status-indicator offline"></div>
                                </li>
                                <li class="chat-user-item" data-user="Diana">
                                    <div class="chat-user-avatar">D</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Diana</div>
                                        <div class="chat-user-status">Online</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                            </ul>
                        </aside>

                        <!-- Main Chat Area -->
                        <section class="chat-main">
                            <div class="chat-header">
                                <div class="chat-header-info">
                                    <div class="chat-user-avatar">A</div>
                                    <div>
                                        <div class="chat-header-title">Alice</div>
                                        <div class="chat-header-status">Online</div>
                                    </div>
                                </div>
                            </div>

                            <div class="chat-messages" id="chatMessages">
                                <div class="chat-date-divider">
                                    <span class="chat-date-text">Today</span>
                                </div>

                                <div class="chat-message">
                                    <div class="chat-message-avatar">A</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Hey! Ready for a game?</p>
                                        </div>
                                        <div class="chat-message-time">10:30 AM</div>
                                    </div>
                                </div>

                                <div class="chat-message own">
                                    <div class="chat-message-avatar">${username.charAt(0).toUpperCase()}</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Absolutely! Let's play!</p>
                                        </div>
                                        <div class="chat-message-time">10:31 AM</div>
                                    </div>
                                </div>

                                <div class="chat-message">
                                    <div class="chat-message-avatar">A</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Great! I'll create a tournament room.</p>
                                        </div>
                                        <div class="chat-message-time">10:32 AM</div>
                                    </div>
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

                    // Simulate response after 1 second
                    setTimeout(() => {
                        const responseTime = new Date().toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                        });
                        const responses = [
                            'Sounds good!',
                            'I agree!',
                            'Let\'s do it!',
                            'That works for me!',
                            'Great idea!'
                        ];
                        const response = responses[Math.floor(Math.random() * responses.length)];

                        const responseHTML = `
                            <div class="chat-message">
                                <div class="chat-message-avatar">${this.currentUser.charAt(0)}</div>
                                <div class="chat-message-content">
                                    <div class="chat-message-bubble">
                                        <p class="chat-message-text">${response}</p>
                                    </div>
                                    <div class="chat-message-time">${responseTime}</div>
                                </div>
                            </div>
                        `;

                        chatMessages.insertAdjacentHTML('beforeend', responseHTML);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
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

        // Sample users database
        const allUsers = [
            { id: 1, name: 'Emma Wilson', status: 'Online', avatar: 'E' },
            { id: 2, name: 'James Smith', status: 'Away', avatar: 'J' },
            { id: 3, name: 'Olivia Brown', status: 'Online', avatar: 'O' },
            { id: 4, name: 'Noah Davis', status: 'Offline', avatar: 'N' },
            { id: 5, name: 'Sophia Garcia', status: 'Online', avatar: 'S' },
            { id: 6, name: 'Liam Martinez', status: 'Away', avatar: 'L' },
            { id: 7, name: 'Ava Rodriguez', status: 'Online', avatar: 'A' },
            { id: 8, name: 'William Lopez', status: 'Offline', avatar: 'W' }
        ];

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
