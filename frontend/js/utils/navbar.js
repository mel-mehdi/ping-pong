/**
 * Navbar Utilities
 * Handles navbar search and notifications
 */

export function initNavbarSearch(app) {
    // Remove the initialization guard to allow re-initialization on view changes
    // This ensures the event listeners work after navigating between views
    
    // Load players from database
    let playerData = [];
    import('./database.js').then(module => {
        const db = module.default;
        playerData = db.find('users').map(user => ({
            id: user.id,
            name: user.username,
            status: 'Online',
            rank: `#${user.rank || '?'}`,
            avatar: user.username[0].toUpperCase()
        }));
    }).catch(err => console.error('Error loading players:', err));

    const navSearchInput = document.getElementById('navSearchInput');
    const navSearchResults = document.getElementById('navSearchResults');

    if (!navSearchInput || !navSearchResults) return;

    navSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            navSearchResults.classList.add('hidden');
            return;
        }

        const matches = playerData.filter(player =>
            player.name.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length === 0) {
            navSearchResults.innerHTML = '<div class="search-no-results">No players found</div>';
            navSearchResults.classList.remove('hidden');
        } else {
            navSearchResults.innerHTML = matches.map(player => `
                <div class="nav-search-result-item" data-player-id="${player.id}">
                    <div class="result-avatar">${player.avatar}</div>
                    <div class="result-info">
                        <div class="result-name">${player.name}</div>
                        <div class="result-meta">${player.rank} • ${player.status}</div>
                    </div>
                    <button class="result-action-btn" data-player-name="${player.name}">
                        <i class="fas fa-gamepad"></i> Invite
                    </button>
                </div>
            `).join('');

            navSearchResults.classList.remove('hidden');

            // Attach event listeners after rendering
            setTimeout(() => {
                navSearchResults.querySelectorAll('.result-action-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const playerName = btn.dataset.playerName;
                        alert(`Game invitation sent to ${playerName}!`);
                        navSearchInput.value = '';
                        navSearchResults.classList.add('hidden');
                    });
                });
            }, 0);
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!navSearchInput.contains(e.target) && !navSearchResults.contains(e.target)) {
            navSearchResults.classList.add('hidden');
        }
    });
}

export function initNotifications(app) {
    const notificationsBtn = document.getElementById('navNotificationsBtn');
    const notificationPanel = document.getElementById('notificationPanel');

    if (!notificationsBtn || !notificationPanel) return;

    if (app.notificationClickHandler) {
        notificationsBtn.removeEventListener('click', app.notificationClickHandler);
    }

    app.notificationClickHandler = (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('hidden');
        displayNotifications();
    };

    notificationsBtn.addEventListener('click', app.notificationClickHandler);

    if (app.documentClickHandler) {
        document.removeEventListener('click', app.documentClickHandler);
    }

    app.documentClickHandler = (e) => {
        if (!notificationPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationPanel.classList.add('hidden');
        }
    };

    document.addEventListener('click', app.documentClickHandler);
    updateNotificationBadge();
}

function displayNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    const friendRequests = JSON.parse(localStorage.getItem('friendRequests') || '[]');

    if (friendRequests.length === 0) {
        notificationList.innerHTML = '<div class="notification-empty">No new notifications</div>';
        return;
    }

    notificationList.innerHTML = friendRequests.map((request, index) => `
        <div class="notification-item">
            <div class="notification-avatar">${request.avatar || request.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <div class="notification-content">
                <p><strong>${request.name || 'Unknown User'}</strong> sent you a friend request</p>
                <div class="notification-actions">
                    <button class="btn-accept" data-index="${index}">Accept</button>
                    <button class="btn-decline" data-index="${index}">Decline</button>
                </div>
            </div>
        </div>
    `).join('');

    notificationList.querySelectorAll('.btn-accept').forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest(parseInt(btn.dataset.index), 'accept'));
    });

    notificationList.querySelectorAll('.btn-decline').forEach(btn => {
        btn.addEventListener('click', () => handleFriendRequest(parseInt(btn.dataset.index), 'decline'));
    });
}

function handleFriendRequest(index, action) {
    let friendRequests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
    const request = friendRequests[index];

    if (action === 'accept') {
        let friends = JSON.parse(localStorage.getItem('friends') || '[]');
        friends.push({
            id: request.id,
            name: request.name,
            avatar: request.avatar,
            status: request.status
        });
        localStorage.setItem('friends', JSON.stringify(friends));
    }

    friendRequests.splice(index, 1);
    localStorage.setItem('friendRequests', JSON.stringify(friendRequests));

    displayNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('navNotificationBadge');
    if (!badge) return;

    const friendRequests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
    const count = friendRequests.length;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}
