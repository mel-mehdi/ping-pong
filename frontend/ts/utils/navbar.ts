

import api from './api.ts';

export function initNavbarSearch(app) {

    let playerData = [];
    
    async function loadPlayers() {
        try {
            const users = await api.getAllUsers();
            playerData = users.map(user => ({
                id: user.id,
                name: user.username,
                status: 'Online',
                rank: `#${user.rank || '?'}`,
                avatar: user.username[0].toUpperCase()
            }));
        } catch (error) {
            console.error('Error loading players:', error);
        }
    }
    
    loadPlayers();

    const navSearchInput = document.getElementById('navSearchInput');
    const navSearchResults = document.getElementById('navSearchResults');

    if (!navSearchInput || !navSearchResults) return;

    navSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            navSearchResults.classList.add('hidden');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        const currentUserId = currentUser.userId;

        const matches = playerData.filter(player =>
            player.name.toLowerCase().includes(query) && player.id !== currentUserId
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

            setTimeout(() => {
                navSearchResults.querySelectorAll('.result-action-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const playerName = btn.dataset.playerName;
                        const playerId = btn.closest('.nav-search-result-item').dataset.playerId;
                        
                        console.log('Sending invitation to:', playerName, 'ID:', playerId);

                        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
                        const username = currentUser.username || 'Player';
                        
                        try {
                            
                            await api.sendInvitation(
                                currentUser.userId,
                                username,
                                playerId,
                                playerName
                            );
                            
                            console.log('✅ Game invitation sent successfully!');
                            console.log(`Game invitation sent to ${playerName}!`);
                            
                            window.dispatchEvent(new CustomEvent('invitationSent'));
                            
                        } catch (error) {
                            console.error('Error sending invitation:', error);
                        }
                        
                        navSearchInput.value = '';
                        navSearchResults.classList.add('hidden');
                    });
                });
            }, 0);
        }
    });

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
    
    if (app.notificationInterval) {
        clearInterval(app.notificationInterval);
    }
    
    app.notificationInterval = setInterval(() => {
        updateNotificationBadge();
    }, 5000);
    
    window.addEventListener('invitationSent', () => {
        updateNotificationBadge();
    });
}

async function displayNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    try {
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!currentUser.userId) {
            notificationList.innerHTML = '<div class="notification-empty">Please login to see notifications</div>';
            return;
        }

        const invitations = await api.getInvitations(currentUser.userId);
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && inv.toId === currentUser.userId);

        const friendRequests = await api.getFriendRequests(currentUser.userId);
        const pendingRequests = friendRequests.filter(req => req.status === 'pending' && req.toId === currentUser.userId);

        const totalNotifications = pendingInvitations.length + pendingRequests.length;

        if (totalNotifications === 0) {
            notificationList.innerHTML = '<div class="notification-empty">No new notifications</div>';
            return;
        }

        let html = '';

        pendingInvitations.forEach(invitation => {
            html += `
                <div class="notification-item">
                    <div class="notification-avatar">${invitation.from.charAt(0).toUpperCase()}</div>
                    <div class="notification-content">
                        <p><strong>${invitation.from}</strong> invited you to a game</p>
                        <div class="notification-actions">
                            <button class="btn-accept" data-id="${invitation.id}" data-type="invitation">Accept</button>
                            <button class="btn-decline" data-id="${invitation.id}" data-type="invitation">Decline</button>
                        </div>
                    </div>
                </div>
            `;
        });

        pendingRequests.forEach(request => {
            html += `
                <div class="notification-item">
                    <div class="notification-avatar">${request.from.charAt(0).toUpperCase()}</div>
                    <div class="notification-content">
                        <p><strong>${request.from}</strong> sent you a friend request</p>
                        <div class="notification-actions">
                            <button class="btn-accept" data-id="${request.id}" data-type="friend">Accept</button>
                            <button class="btn-decline" data-id="${request.id}" data-type="friend">Decline</button>
                        </div>
                    </div>
                </div>
            `;
        });

        notificationList.innerHTML = html;

        notificationList.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', () => handleNotification(btn.dataset.id, btn.dataset.type, 'accept'));
        });

        notificationList.querySelectorAll('.btn-decline').forEach(btn => {
            btn.addEventListener('click', () => handleNotification(btn.dataset.id, btn.dataset.type, 'decline'));
        });
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        notificationList.innerHTML = '<div class="notification-empty">Error loading notifications</div>';
    }
}

async function handleNotification(id, type, action) {
    try {
        if (type === 'invitation') {
            await api.updateInvitation(id, action === 'accept' ? 'accepted' : 'declined');
            console.log(`Game invitation ${action}ed`);
        } else if (type === 'friend') {
            await api.updateFriendRequest(id, action === 'accept' ? 'accepted' : 'declined');
            console.log(`Friend request ${action}ed`);
        }

        displayNotifications();
        updateNotificationBadge();
        
        console.log(`${type === 'invitation' ? 'Game invitation' : 'Friend request'} ${action}ed! ${action === 'accept' ? 'Check the Chat page to start a conversation!' : ''}`);

        window.dispatchEvent(new CustomEvent('friendsUpdated'));
    } catch (error) {
        console.error('Error handling notification:', error);
    }
}

async function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!currentUser.userId) {
            return;
        }

        const invitations = await api.getInvitations(currentUser.userId);
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && inv.toId === currentUser.userId);
        
        const friendRequests = await api.getFriendRequests(currentUser.userId);
        const pendingRequests = friendRequests.filter(req => req.status === 'pending' && req.toId === currentUser.userId);

        const count = pendingInvitations.length + pendingRequests.length;
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error updating notification badge:', error);
    }
}

export { updateNotificationBadge };
