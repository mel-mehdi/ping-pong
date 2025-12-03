/**
 * Profile View Module
 * Handles user profile display and editing
 */

import { renderNavbar } from '../components/navbar.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { getItem } from '../utils/storage.js';

export class ProfileView {
    constructor(app) {
        this.app = app;
    }

    /**
     * Render profile view
     */
    render() {
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const username = userData?.username || 'Player';
        const isLoggedIn = !!userData;
        const userAvatar = localStorage.getItem('userAvatar');
        
        this.app.appContainer.innerHTML = `
            ${renderNavbar('profile')}

            <main class="main-container">
                <div class="profile-view">
                    <div class="profile-container">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <div class="avatar-circle">
                                    ${userAvatar ? 
                                        `<img src="${userAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : 
                                        username.charAt(0).toUpperCase()
                                    }
                                </div>
                                <button class="avatar-edit-btn" id="editAvatarBtn"><i class="fas fa-camera"></i></button>
                            </div>
                            <div class="profile-info">
                                <h1 class="profile-name">${username}</h1>
                                <p class="profile-status"><i class="fas fa-circle" style="color: #22c55e;"></i> Online</p>
                                <button class="btn btn-primary" id="editProfileBtn"><i class="fas fa-edit"></i> Edit Profile</button>
                            </div>
                        </div>

                        <div class="profile-stats">
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value" id="gamesPlayed">0</div>
                                    <div class="stat-label">Games Played</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value" id="totalWins">0</div>
                                    <div class="stat-label">Wins</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value" id="winRate">0%</div>
                                    <div class="stat-label">Win Rate</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value" id="userRank">-</div>
                                    <div class="stat-label">Rank</div>
                                </div>
                            </div>
                        </div>

                        <div class="profile-sections">
                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Recent Matches</h2>
                                </div>
                                <div class="matches-list" id="recentMatches">
                                    <div class="empty-state">
                                        <p>No matches played yet</p>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Achievements</h2>
                                </div>
                                <div class="achievements-grid" id="achievementsList">
                                    <div class="empty-state">
                                        <p>Play games to unlock achievements</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Edit Profile Modal -->
            <div class="modal-overlay hidden" id="editProfileModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Profile</h2>
                        <button class="modal-close-btn" id="closeEditProfileModal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProfileForm">
                            <div class="form-group">
                                <label for="editUsername">Username</label>
                                <input type="text" id="editUsername" value="${username}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email</label>
                                <input type="email" id="editEmail" value="${localStorage.getItem('userEmail') || 'user@example.com'}" required>
                            </div>
                            <div class="form-group">
                                <label for="editBio">Bio</label>
                                <textarea id="editBio" rows="3" placeholder="Tell us about yourself...">${localStorage.getItem('userBio') || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="editLocation">Location</label>
                                <input type="text" id="editLocation" value="${localStorage.getItem('userLocation') || ''}" placeholder="City, Country">
                            </div>
                            <div class="form-group">
                                <label for="editPassword">New Password (optional)</label>
                                <input type="password" id="editPassword" placeholder="Leave blank to keep current">
                            </div>
                            <div class="form-group">
                                <label for="editConfirmPassword">Confirm New Password</label>
                                <input type="password" id="editConfirmPassword" placeholder="Confirm new password">
                            </div>
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary" id="cancelEditProfile">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.initEditProfile();
        this.initAvatarEdit();
        this.loadUserStats(userData);
    }

    loadUserStats(userData) {
        if (!userData || !userData.userId) return;
        
        import('../utils/database.js').then(module => {
            const db = module.default;
            
            // Get user from database
            const user = db.findOne('users', { id: userData.userId });
            if (!user) return;
            
            // Get all matches for this user
            const matches = db.find('matches', match => 
                match.player1Id === userData.userId || match.player2Id === userData.userId
            );
            
            // Calculate stats
            const gamesPlayed = matches.length;
            const wins = matches.filter(match => {
                if (match.player1Id === userData.userId) {
                    return match.player1Score > match.player2Score;
                } else {
                    return match.player2Score > match.player1Score;
                }
            }).length;
            
            const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
            
            // Update UI
            const gamesPlayedEl = document.getElementById('gamesPlayed');
            const totalWinsEl = document.getElementById('totalWins');
            const winRateEl = document.getElementById('winRate');
            const userRankEl = document.getElementById('userRank');
            
            if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
            if (totalWinsEl) totalWinsEl.textContent = wins;
            if (winRateEl) winRateEl.textContent = `${winRate}%`;
            if (userRankEl) userRankEl.textContent = user.rank ? `#${user.rank}` : '-';
            
            // Load recent matches
            if (matches.length > 0) {
                this.loadRecentMatches(matches, userData.userId);
            }
        }).catch(err => {
            console.error('Error loading user stats:', err);
        });
    }
    
    loadRecentMatches(matches, userId) {
        const recentMatchesEl = document.getElementById('recentMatches');
        if (!recentMatchesEl || matches.length === 0) return;
        
        // Sort by date and take last 5
        const recentMatches = matches
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        import('../utils/database.js').then(module => {
            const db = module.default;
            
            recentMatchesEl.innerHTML = recentMatches.map(match => {
                const isPlayer1 = match.player1Id === userId;
                const userScore = isPlayer1 ? match.player1Score : match.player2Score;
                const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
                const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
                const opponent = db.findOne('users', { id: opponentId });
                const opponentName = opponent ? opponent.username : 'Unknown';
                const isWin = userScore > opponentScore;
                
                // Format time
                const matchDate = new Date(match.date);
                const now = new Date();
                const diffMs = now - matchDate;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeStr;
                if (diffMins < 60) {
                    timeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                } else if (diffHours < 24) {
                    timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                } else {
                    timeStr = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                }
                
                return `
                    <div class="match-item ${isWin ? 'win' : 'loss'}">
                        <div class="match-icon">${isWin ? 'W' : 'L'}</div>
                        <div class="match-details">
                            <div class="match-opponent">vs ${opponentName}</div>
                            <div class="match-time">${timeStr}</div>
                        </div>
                        <div class="match-score">${userScore} - ${opponentScore}</div>
                    </div>
                `;
            }).join('');
        });
    }

    /**
     * Initialize avatar editing functionality
     */
    initAvatarEdit() {
        const editAvatarBtn = document.getElementById('editAvatarBtn');
        
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                // Create file input dynamically
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // Validate file size (max 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                            alert('Image size must be less than 2MB');
                            return;
                        }
                        
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                            alert('Please select a valid image file');
                            return;
                        }
                        
                        // Read and store image as base64
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const imageData = event.target.result;
                            localStorage.setItem('userAvatar', imageData);
                            
                            // Update avatar display
                            const avatarCircle = document.querySelector('.avatar-circle');
                            if (avatarCircle) {
                                avatarCircle.innerHTML = `<img src="${imageData}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                            }
                            
                            alert('Avatar updated successfully!');
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                // Trigger file input click
                fileInput.click();
            });
        }
    }

    /**
     * Initialize profile editing functionality
     */
    initEditProfile() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileModal = document.getElementById('editProfileModal');
        const closeModalBtn = document.getElementById('closeEditProfileModal');
        const cancelBtn = document.getElementById('cancelEditProfile');
        const editProfileForm = document.getElementById('editProfileForm');

        // Open modal
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                editProfileModal.classList.remove('hidden');
            });
        }

        // Close modal functions
        const closeModal = () => {
            editProfileModal.classList.add('hidden');
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click
        editProfileModal?.addEventListener('click', (e) => {
            if (e.target === editProfileModal) {
                closeModal();
            }
        });

        // Handle form submission
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const username = document.getElementById('editUsername').value.trim();
                const email = document.getElementById('editEmail').value.trim();
                const bio = document.getElementById('editBio').value.trim();
                const location = document.getElementById('editLocation').value.trim();
                const password = document.getElementById('editPassword').value;
                const confirmPassword = document.getElementById('editConfirmPassword').value;

                // Validate passwords match if provided
                if (password || confirmPassword) {
                    if (password !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                    }
                    if (password.length < 6) {
                        alert('Password must be at least 6 characters!');
                        return;
                    }
                }

                // Save to localStorage
                localStorage.setItem('username', username);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userBio', bio);
                localStorage.setItem('userLocation', location);

                if (password) {
                    localStorage.setItem('userPassword', password);
                }

                // Show success message and reload profile
                alert('Profile updated successfully!');
                closeModal();
                this.app.loadView('profile');
            });
        }
    }
}
