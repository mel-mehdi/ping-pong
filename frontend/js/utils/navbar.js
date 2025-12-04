/**
 * Navbar Utilities
 * Handles navbar search and notifications
 */

import api from './api.js';

export function initNavbarSearch(app) {
    // Remove the initialization guard to allow re-initialization on view changes
    // This ensures the event listeners work after navigating between views
    
    // Load players from database
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
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const playerName = btn.dataset.playerName;
                        const playerId = btn.closest('.nav-search-result-item').dataset.playerId;
                        
                        console.log('Sending invitation to:', playerName, 'ID:', playerId);
                        
                        // Get current user data
                        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
                        const username = currentUser.username || 'Player';
                        
                        try {
                            // Send invitation via API
                            await api.sendInvitation(
                                currentUser.userId,
                                username,
                                playerId,
                                playerName
                            );
                            
                            console.log('✅ Game invitation sent successfully!');
                            alert(`Game invitation sent to ${playerName}!`);
                            
                        } catch (error) {
                            console.error('Error sending invitation:', error);
                            alert('Failed to send invitation: ' + error.message);
                        }
                        
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

async function displayNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    try {
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!currentUser.userId) {
            notificationList.innerHTML = '<div class="notification-empty">Please login to see notifications</div>';
            return;
        }

        // Fetch invitations from API
        const invitations = await api.getInvitations(currentUser.userId);
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && inv.toId === currentUser.userId);
        
        // Fetch friend requests from API
        const friendRequests = await api.getFriendRequests(currentUser.userId);
        const pendingRequests = friendRequests.filter(req => req.status === 'pending');

        const totalNotifications = pendingInvitations.length + pendingRequests.length;

        if (totalNotifications === 0) {
            notificationList.innerHTML = '<div class="notification-empty">No new notifications</div>';
            return;
        }

        let html = '';

        // Display game invitations
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

        // Display friend requests
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

        // Attach event listeners
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

        // Refresh notifications
        displayNotifications();
        updateNotificationBadge();
        
        alert(`${type === 'invitation' ? 'Game invitation' : 'Friend request'} ${action}ed! ${action === 'accept' ? 'Check the Chat page to start a conversation!' : ''}`);
        
        // Trigger chat refresh event for other views
        window.dispatchEvent(new CustomEvent('friendsUpdated'));
    } catch (error) {
        console.error('Error handling notification:', error);
        alert('Error: ' + error.message);
    }
}

async function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!currentUser.userId) {
            return;
        }

        // Get pending invitations and friend requests
        const invitations = await api.getInvitations(currentUser.userId);
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && inv.toId === currentUser.userId);
        
        const friendRequests = await api.getFriendRequests(currentUser.userId);
        const pendingRequests = friendRequests.filter(req => req.status === 'pending');

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
