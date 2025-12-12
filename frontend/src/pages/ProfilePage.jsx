import { useState, useRef, useEffect } from 'react';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/profile.css';

const ProfilePage = () => {
    const { userData, login, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [editForm, setEditForm] = useState({ username: userData?.username || '', fullname: userData?.fullname || '', email: userData?.email || '', bio: userData?.bio || '' });
    const [saving, setSaving] = useState(false);
    
    const handleChangeAvatar = () => {
        setShowAvatarModal(true);
    };
    
    const handleEditProfile = () => {
        setEditForm({ username: userData?.username || '', fullname: userData?.fullname || '', email: userData?.email || '', bio: userData?.bio || '' });
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await apiClient.updateUser(userData.userId, {
                username: editForm.username,
                fullname: editForm.fullname,
                email: editForm.email,
                bio: editForm.bio
            });
            if (updated) {
                // Re-fetch user to ensure we have full sanitized record
                const fresh = await apiClient.getUserById(updated.id || updated.userId);
                if (fresh) {
                    if (updateUser) updateUser(fresh);
                    else login(fresh);
                }
            }
            setShowEditModal(false);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                console.error('File size exceeds 2MB');
                return;
            }
            
            // Check file type
            if (!file.type.match(/image\/(png|jpg|jpeg|gif)/)) {
                console.error('Invalid file type. Please upload PNG, JPG, or GIF');
                return;
            }
            
            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) {
            console.error('No file selected');
            return;
        }

        setUploading(true);
        try {
            const response = await apiClient.uploadAvatar(userData.userId, selectedFile);
            if (response) {
                // Re-fetch full user record to get latest fields
                const fresh = await apiClient.getUserById(response.id || response.userId || userData.userId);
                if (fresh) {
                    if (updateUser) updateUser(fresh);
                    else login(fresh);
                }
            }
            // Close modal and reset
            setShowAvatarModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleCloseAvatarModal = () => {
        setShowAvatarModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };
    
    const [recentMatches, setRecentMatches] = useState([]);

    useEffect(() => {
        const loadMatches = async () => {
            if (!userData?.userId) return;
            try {
                const matches = await apiClient.getMatchesForUser(userData.userId);
                setRecentMatches(matches || []);
            } catch (err) {
                console.error('Error loading matches for profile:', err);
            }
        };
        loadMatches();
    }, [userData]);

    const stats = {
        gamesPlayed: 42,
        wins: 28,
        losses: 14,
        winRate: 67,
        rank: '#127',
        level: 15
    };

    

    const achievements = [
        { id: 1, title: 'First Win', icon: '🏆', earned: true },
        { id: 2, title: '10 Win Streak', icon: '🔥', earned: true },
        { id: 3, title: 'Tournament Winner', icon: '👑', earned: false },
        { id: 4, title: '100 Games', icon: '🎯', earned: false },
        { id: 5, title: 'Perfect Game', icon: '💯', earned: true },
        { id: 6, title: 'Speed Demon', icon: '⚡', earned: true },
        { id: 7, title: 'Master Player', icon: '🎖️', earned: false },
        { id: 8, title: 'Comeback King', icon: '🔄', earned: true },
        { id: 9, title: 'Veteran', icon: '⭐', earned: false },
        { id: 10, title: 'Unbeatable', icon: '🛡️', earned: false },
        { id: 11, title: 'First Blood', icon: '🩸', earned: true },
        { id: 12, title: 'Hat Trick', icon: '🎩', earned: true },
        { id: 13, title: 'Marathon', icon: '🏃', earned: false },
        { id: 14, title: 'Sharp Shooter', icon: '🎲', earned: true },
        { id: 15, title: 'Social Butterfly', icon: '🦋', earned: false },
        { id: 16, title: 'Night Owl', icon: '🦉', earned: true },
    ];

    return (
        <>
            <Navbar />
            <main className="profile-view">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {userData?.avatar ? (
                                    <img src={userData.avatar} alt={userData.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                ) : (
                                    (userData?.username ? userData.username[0].toUpperCase() : 'U')
                                )}
                            </div>
                            <button className="btn-change-avatar" title="Change Avatar" onClick={handleChangeAvatar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </button>
                        </div>
                        <h1 className="profile-username">{userData?.username || 'Player'}</h1>
                        <p className="profile-email">{userData?.email || 'player@example.com'}</p>
                        <div className="profile-level">
                            <span className="level-badge">Level {stats.level}</span>
                        </div>
                        <button className="btn-edit-profile" onClick={handleEditProfile}>
                            <svg className="edit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`profile-tab ${activeTab === 'matches' ? 'active' : ''}`}
                            onClick={() => setActiveTab('matches')}
                        >
                            Match History
                        </button>
                        <button 
                            className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('achievements')}
                        >
                            Achievements
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="profile-content">
                            <div className="achievements-grid">
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#667eea'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                            <line x1="7" y1="2" x2="7" y2="22"></line>
                                            <line x1="17" y1="2" x2="17" y2="22"></line>
                                            <line x1="2" y1="12" x2="22" y2="12"></line>
                                            <line x1="2" y1="7" x2="7" y2="7"></line>
                                            <line x1="2" y1="17" x2="7" y2="17"></line>
                                            <line x1="17" y1="17" x2="22" y2="17"></line>
                                            <line x1="17" y1="7" x2="22" y2="7"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.gamesPlayed}</div>
                                    <div className="achievement-title">Games Played</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#10b981'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.wins}</div>
                                    <div className="achievement-title">Wins</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#ef4444'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.losses}</div>
                                    <div className="achievement-title">Losses</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#f59e0b'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="20" x2="12" y2="10"></line>
                                            <line x1="18" y1="20" x2="18" y2="4"></line>
                                            <line x1="6" y1="20" x2="6" y2="16"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.winRate}%</div>
                                    <div className="achievement-title">Win Rate</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#fbbf24'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                            <path d="M4 22h16"></path>
                                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.rank}</div>
                                    <div className="achievement-title">Rank</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="profile-content">
                            <div className="match-history">
                                {recentMatches.map(match => (
                                    <div key={match.id} className="match-item">
                                        <div className="match-result">
                                            <span className={`result-badge ${match.result}`}>
                                                {match.result === 'win' ? '✓' : '✗'}
                                            </span>
                                        </div>
                                        <div className="match-details">
                                            <div className="match-opponent">vs {match.opponent}</div>
                                            <div className="match-score">{match.score}</div>
                                        </div>
                                        <div className="match-date">{match.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="profile-content">
                            <div className="achievements-grid">
                                {achievements.map(achievement => (
                                    <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                                        <div className="achievement-icon">{achievement.icon}</div>
                                        <div className="achievement-title">{achievement.title}</div>
                                        {!achievement.earned && (
                                            <div className="achievement-locked">🔒</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Profile</h2>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                                <div className="form-group">
                                                    <label>Username</label>
                                                    <input type="text" className="form-input" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Full Name</label>
                                                    <input type="text" className="form-input" value={editForm.fullname} onChange={(e) => setEditForm({...editForm, fullname: e.target.value})} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input type="email" className="form-input" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Bio</label>
                                                    <textarea className="form-input" rows="3" placeholder="Tell us about yourself..." value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})}></textarea>
                                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Avatar Modal */}
                {showAvatarModal && (
                    <div className="modal-overlay" onClick={handleCloseAvatarModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Change Avatar</h2>
                                <button className="modal-close" onClick={handleCloseAvatarModal}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div 
                                    className="avatar-upload-area"
                                    onClick={handleUploadClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {previewUrl ? (
                                        <div className="avatar-preview">
                                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%' }} />
                                            <p className="text-muted">{selectedFile?.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                            <p>Click to upload or drag and drop</p>
                                            <p className="text-muted">PNG, JPG or GIF (max. 2MB)</p>
                                        </>
                                    )}
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*" 
                                        style={{display: 'none'}}
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleCloseAvatarModal}>Cancel</button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleUploadAvatar}
                                    disabled={!selectedFile || uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default ProfilePage;
