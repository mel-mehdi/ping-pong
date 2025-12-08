export function renderNavbar(activeView = 'home') {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                       !!JSON.parse(localStorage.getItem('userData') || 'null');
    
    return `
        <nav class="navbar" role="navigation" aria-label="Main navigation">
            <div class="nav-container">
                <div class="nav-brand">
                    <h2>FT Transcendence</h2>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home" ${activeView === 'home' ? 'class="active" aria-current="page"' : ''}>Home</a></li>
                    <li><a href="#game" ${activeView === 'game' ? 'class="active" aria-current="page"' : ''}>Play</a></li>
                    <li><a href="#chat" ${activeView === 'chat' ? 'class="active" aria-current="page"' : ''}>Chat</a></li>
                    <li><a href="#profile" ${activeView === 'profile' ? 'class="active" aria-current="page"' : ''}>Profile</a></li>
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
                    <button class="nav-icon-btn" id="themeToggleBtn" title="Toggle theme" aria-label="Toggle dark mode">
                        <svg class="theme-icon theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        <svg class="theme-icon theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
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

        <!-- Notification Panel -->
        <div class="notification-panel hidden" id="notificationPanel">
            <div class="notification-header">Friend Requests</div>
            <div id="notificationList">
                <!-- Notifications will be populated here -->
            </div>
        </div>
    `;
}
