/**
 * Profile Module
 * Handles user profile display and editing
 */

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { getItem, setItem, removeItem } from './utils/storage.js';
import { getById, setText, addEvent, queryAll } from './utils/dom.js';
import db from './utils/database.js';

// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Check authentication
    const userDataStr = localStorage.getItem('userData');
    console.log('User data string:', userDataStr);
    
    if (!userDataStr) {
        console.log('No user data, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    let sessionData;
    try {
        sessionData = JSON.parse(userDataStr);
        console.log('Session data parsed:', sessionData);
    } catch (e) {
        console.error('Error parsing session data:', e);
        window.location.href = 'login.html';
        return;
    }

    // Get user from database
    const user = db.findOne('users', { id: sessionData.userId });
    console.log('User found in DB:', user);
    
    if (!user) {
        console.log('User not found in database');
        // Use session data as fallback
        loadProfileData(sessionData);
    } else {
        // Set profile data
        loadProfileData(user);
    }

    // Setup edit profile functionality
    setupEditProfile(user || sessionData, sessionData);

    // Setup logout functionality
    setupLogout();

    // Load match history
    if (user) {
        loadMatchHistory(user.id);
    }
});

/**
 * Load user data into profile form
 * @param {Object} user - User object from database
 */
function loadProfileData(user) {
    console.log('Loading profile data for:', user);
    
    // Display profile name and username in header
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const profileUsernameDisplay = document.getElementById('profileUsernameDisplay');
    
    if (profileNameDisplay) {
        profileNameDisplay.textContent = user.fullname || user.username || 'User';
    }
    if (profileUsernameDisplay) {
        profileUsernameDisplay.textContent = '@' + (user.username || 'user');
    }

    // Display stats
    const winsElement = document.getElementById('profileWins');
    const lossesElement = document.getElementById('profileLosses');
    const gamesElement = document.getElementById('profileGames');
    const winRateElement = document.getElementById('profileWinRate');
    
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
    
    if (winsElement) winsElement.textContent = wins;
    if (lossesElement) lossesElement.textContent = losses;
    if (gamesElement) gamesElement.textContent = totalGames;
    if (winRateElement) winRateElement.textContent = winRate + '%';

    // Display rank badge
    const rankBadge = document.getElementById('profileRankBadge');
    if (rankBadge) {
        const rank = user.rank || calculateRank(wins);
        rankBadge.innerHTML = '<i class="fas fa-trophy"></i> Rank #' + rank;
    }

    // Set form fields
    const fullnameInput = document.getElementById('profileFullname');
    if (fullnameInput && user.fullname) {
        fullnameInput.value = user.fullname;
    }
    
    // Set avatar initials
    const initialsElement = document.getElementById('avatarInitials');
    if (initialsElement) {
        if (user.fullname) {
            const initials = user.fullname
                .split(' ')
                .map(name => name[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            initialsElement.textContent = initials;
        } else if (user.username) {
            initialsElement.textContent = user.username.substring(0, 2).toUpperCase();
        }
    }
    
    const usernameInput = document.getElementById('profileUsername');
    if (usernameInput && user.username) {
        usernameInput.value = user.username;
    }
    
    const emailInput = document.getElementById('profileEmail');
    if (emailInput && user.email) {
        emailInput.value = user.email;
    }

    const countryInput = document.getElementById('profileCountry');
    if (countryInput && user.country) {
        countryInput.value = user.country;
    }
    
    console.log('Profile data loaded successfully');
}

/**
 * Calculate rank based on wins
 * @param {number} wins - Number of wins
 * @returns {number} - Calculated rank
 */
function calculateRank(wins) {
    // Simple ranking: get all users sorted by wins
    const allUsers = db.find('users').sort((a, b) => (b.wins || 0) - (a.wins || 0));
    const userIndex = allUsers.findIndex(u => (u.wins || 0) <= wins);
    return userIndex >= 0 ? userIndex + 1 : allUsers.length + 1;
}

/**
 * Setup edit profile functionality
 * @param {Object} user - User object from database
 * @param {Object} sessionData - Session data
 */
function setupEditProfile(user, sessionData) {
    const editBtn = getById('editProfileBtn');
    const saveBtn = getById('saveProfileBtn');
    const profileForm = getById('profileForm');
    
    if (!editBtn || !saveBtn || !profileForm) {
        return;
    }

    const inputs = profileForm.querySelectorAll('input, textarea');

    addEvent(editBtn, 'click', function() {
        inputs.forEach(input => {
            if (input.id !== 'profileUsername') { // Keep username disabled
                input.disabled = false;
            }
        });
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    addEvent(profileForm, 'submit', function(e) {
        e.preventDefault();
        
        // Update user in database
        const updates = {
            fullname: getById('profileFullname').value,
            email: getById('profileEmail').value
        };
        
        db.update('users', { id: user.id }, updates);
        
        // Update session data
        const updatedSessionData = {
            ...sessionData,
            ...updates
        };
        setItem(STORAGE_KEYS.USER_DATA, updatedSessionData);
        
        // Disable inputs again
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        
        // Show success message
        showSuccessMessage('Profile updated successfully!');
    });
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutBtn = getById('logoutBtn');
    if (logoutBtn) {
        addEvent(logoutBtn, 'click', function(e) {
            e.preventDefault();
            removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = ROUTES.LOGIN;
        });
    }
}

/**
 * Load match history from database
 * @param {string} userId - User ID
 */
function loadMatchHistory(userId) {
    const matches = db.find('matches', { userId: userId })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10); // Show last 10 matches

    const matchHistoryContainer = document.getElementById('matchHistoryList');
    if (!matchHistoryContainer) return;

    if (matches.length === 0) {
        matchHistoryContainer.innerHTML = '<p class="text-muted">No matches played yet</p>';
        return;
    }

    matchHistoryContainer.innerHTML = matches.map(match => {
        const resultClass = match.result === 'win' ? 'win' : 'loss';
        const resultBadge = match.result === 'win' ? 'WIN' : 'LOSS';
        const opponentInitials = match.opponent ? match.opponent.substring(0, 2).toUpperCase() : 'XX';
        
        return `
            <div class="match-card-new ${resultClass}">
                <div class="match-header-new">
                    <span class="match-badge-new ${resultClass}">${resultBadge}</span>
                    <span class="match-time-new">${formatDate(match.createdAt)}</span>
                </div>
                <div class="match-body-new">
                    <div class="match-players-new">
                        <div class="player-info-new">
                            <div class="player-avatar-new">You</div>
                            <span>You</span>
                        </div>
                        <div class="match-vs-new">VS</div>
                        <div class="player-info-new">
                            <div class="player-avatar-new">${opponentInitials}</div>
                            <span>${match.opponent || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="match-score-new">
                        <span class="score-large">${match.userScore || 0}</span>
                        <span class="score-sep">-</span>
                        <span class="score-large">${match.opponentScore || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    // Create temporary success message
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

