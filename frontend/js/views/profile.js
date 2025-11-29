/**
 * Profile View Module
 * Handles user profile display and editing
 */

export class ProfileView {
    constructor(app) {
        this.app = app;
    }

    /**
     * Render profile view
     */
    render() {
        const username = localStorage.getItem('username') || 'Player';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.app.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="profile.html" class="active">Profile</a></li>
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
                <div class="profile-view">
                    <div class="profile-container">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <div class="avatar-circle">
                                    ${username.charAt(0).toUpperCase()}
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
                                    <div class="stat-value">127</div>
                                    <div class="stat-label">Games Played</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">89</div>
                                    <div class="stat-label">Wins</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">70%</div>
                                    <div class="stat-label">Win Rate</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">#42</div>
                                    <div class="stat-label">Rank</div>
                                </div>
                            </div>
                        </div>

                        <div class="profile-sections">
                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Recent Matches</h2>
                                </div>
                                <div class="matches-list">
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Bob</div>
                                            <div class="match-time">2 hours ago</div>
                                        </div>
                                        <div class="match-score">11 - 8</div>
                                    </div>
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Alice</div>
                                            <div class="match-time">5 hours ago</div>
                                        </div>
                                        <div class="match-score">11 - 7</div>
                                    </div>
                                    <div class="match-item loss">
                                        <div class="match-icon">L</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Charlie</div>
                                            <div class="match-time">1 day ago</div>
                                        </div>
                                        <div class="match-score">9 - 11</div>
                                    </div>
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Diana</div>
                                            <div class="match-time">2 days ago</div>
                                        </div>
                                        <div class="match-score">11 - 6</div>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Achievements</h2>
                                </div>
                                <div class="achievements-grid">
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
                                        <div class="achievement-name">First Win</div>
                                    </div>
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><i class="fas fa-fire"></i></div>
                                        <div class="achievement-name">5 Win Streak</div>
                                    </div>
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
                                        <div class="achievement-name">100 Games</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"></path><path d="m3.5 6 2 8h13l2-8"></path><path d="m7 11 2-5"></path><path d="m15 11-2-5"></path><path d="M12 16v-6"></path></svg></div>
                                        <div class="achievement-name">Champion</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg></div>
                                        <div class="achievement-name">Legend</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
                                        <div class="achievement-name">Perfect Game</div>
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
