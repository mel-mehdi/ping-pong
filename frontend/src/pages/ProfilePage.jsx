import { useState, useRef, useEffect } from 'react';
import apiClient from '../utils/api';
import { ACHIEVEMENTS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/profile.css';
import { useLanguage } from '../contexts/LanguageContext';

const ProfilePage = () => {
  const { userData, login, updateUser, isBackendAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    username: userData?.username || '',
    fullname: userData?.fullname || '',
    email: userData?.email || '',
    bio: userData?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  // Active API key management (frontend-only storage)
  const [activeApiKeyInput, setActiveApiKeyInput] = useState('');
  const [activeApiKeySaved, setActiveApiKeySaved] = useState(null); // currently active key (masked or full if available)
  const [showActiveKey, setShowActiveKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState(null);

  const loadActiveKeyForUser = (id) => {
    if (!id) return;
    try {
      // Per-user saved key (if the user stored one previously)
      const per = localStorage.getItem(`active_api_key_${id}`);
      // Global active key (what the ApiClient will use)
      const global = localStorage.getItem('active_api_key');
      const keyToUse = per || global || null;
      setActiveApiKeySaved(keyToUse);
      if (keyToUse) {
        setActiveApiKeyInput(keyToUse);
        // ensure api client attaches it
        apiClient.setActiveApiKey(keyToUse);
      } else {
        apiClient.clearActiveApiKey();
      }
    } catch (e) {
      // Error loading active key
    }
  };

  const saveActiveKeyForUser = (id, key) => {
    if (!id) return;
    try {
      if (key) {
        localStorage.setItem(`active_api_key_${id}`, key);
        localStorage.setItem('active_api_key', key);
        apiClient.setActiveApiKey(key);
        setActiveApiKeySaved(key);
        setApiKeyMessage('Active API key saved');
        setTimeout(() => setApiKeyMessage(null), 2000);
      } else {
        // clear
        localStorage.removeItem(`active_api_key_${id}`);
        localStorage.removeItem('active_api_key');
        apiClient.clearActiveApiKey();
        setActiveApiKeySaved(null);
        setApiKeyMessage('Active API key cleared');
        setTimeout(() => setApiKeyMessage(null), 2000);
      }
    } catch (e) {
      setApiKeyMessage('Save failed');
      setTimeout(() => setApiKeyMessage(null), 2000);
    }
  };

  const copyActiveKeyToClipboard = async () => {
    const full = activeApiKeySaved;
    if (!full) {
      setApiKeyMessage('No active API key to copy');
      setTimeout(() => setApiKeyMessage(null), 1500);
      return;
    }
    try {
      await navigator.clipboard.writeText(full);
      setApiKeyMessage('API key copied to clipboard');
      setActiveKeyCopied(true);
      setTimeout(() => setActiveKeyCopied(false), 1200);
      setTimeout(() => setApiKeyMessage(null), 1500);
    } catch (e) {
      setApiKeyMessage('Copy failed');
      setTimeout(() => setApiKeyMessage(null), 1500);
    }
  };

  // Frontend-only API activation state (persisted to localStorage per-user)
  const [apiInfo, setApiInfo] = useState({ active: false, key: null });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  // Public API quick key
  const [creatingPublicKey, setCreatingPublicKey] = useState(false);
  const [publicCreatedFullKey, setPublicCreatedFullKey] = useState(null);
  const [publicCreatedDetails, setPublicCreatedDetails] = useState(null);
  const [publicExpanded, setPublicExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Restore any session-stored public key so clicking "Get key" can reveal it
  useEffect(() => {
    const id = userData?.userId || userData?.id;
    if (!id) return;
    try {
      const raw = sessionStorage.getItem(`public_api_key_${id}`);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          if (obj && obj.key) {
            setPublicCreatedFullKey(obj.key);
            setPublicCreatedDetails({ id: obj.id || null, created_at: obj.createdAt || obj.created_at || null });
          }
        } catch (e) {
          // backward-compat: raw string with key only
          setPublicCreatedFullKey(raw);
        }
      }
    } catch (e) { /* ignore */ }
  }, [userData?.userId, userData?.id]);

  // Copy feedback states (animated transient indicators)
  const [activeKeyCopied, setActiveKeyCopied] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [publicKeyCopied, setPublicKeyCopied] = useState(false);

  const loadApiInfoForUser = (id) => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(`api_info_${id}`);
      if (!raw) return;
      const obj = JSON.parse(raw);
      setApiInfo({ active: !!obj.active, key: obj.key || null });
      // ensure ApiClient uses the stored key globally for /api requests
      if (obj && obj.key) {
        try {
          localStorage.setItem('active_api_key', obj.key);
          apiClient.setActiveApiKey(obj.key);
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {
      // Error loading API info
    }
  };

  const saveApiInfoForUser = (id, info) => {
    if (!id) return;
    try {
      localStorage.setItem(`api_info_${id}`, JSON.stringify(info));
      // mirror active key globally so apiClient picks it up
      if (info && info.key && info.active) {
        try {
          localStorage.setItem('active_api_key', info.key);
          apiClient.setActiveApiKey(info.key);
        } catch (e) {
          /* ignore */
        }
      } else {
        try {
          // If deactivated, clear global key
          const global = localStorage.getItem('active_api_key');
          if (global && global === (info && info.key)) {
            localStorage.removeItem('active_api_key');
            apiClient.clearActiveApiKey();
          }
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {
      // Error saving API info
    }
  };

  // Local avatar helpers (frontend-only): save/load data URL per user
  const saveLocalAvatarForUser = (id, dataUrl) => {
    if (!id || !dataUrl) return;
    try {
      localStorage.setItem(`local_avatar_${id}`, dataUrl);
    } catch (e) {
      // Error saving local avatar
    }
  };

  const loadLocalAvatarForUser = (id) => {
    if (!id) return null;
    try {
      return localStorage.getItem(`local_avatar_${id}`);
    } catch (e) {
      // Error loading local avatar
      return null;
    }
  };

  const clearLocalAvatarForUser = (id) => {
    if (!id) return;
    try {
      localStorage.removeItem(`local_avatar_${id}`);
    } catch (e) {
      /* ignore */
    }
  };

  const generateDemoKey = () => {
    try {
      const arr = new Uint8Array(12);
      window.crypto.getRandomValues(arr);
      const s = Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
      return `ft_demo_${s}`;
    } catch (e) {
      // Fallback
      return `ft_demo_${Math.random().toString(36).slice(2, 12)}`;
    }
  };

  const toggleApiActive = () => {
    const id = userIdForCalls;
    if (!id) {
      setApiMessage('Please sign in to activate API');
      setTimeout(() => setApiMessage(null), 3000);
      return;
    }

    if (apiInfo.active) {
      const next = { active: false, key: apiInfo.key };
      setApiInfo(next);
      saveApiInfoForUser(id, next);
      setApiMessage('API deactivated');
      setTimeout(() => setApiMessage(null), 2000);
      return;
    }

    // If there's no saved key, do not prompt—show a message and keep button disabled
    if (!apiInfo.key) {
      setApiMessage('No API key saved — paste a key in your profile settings to activate');
      setTimeout(() => setApiMessage(null), 3000);
      return;
    }

    // Activate using existing saved key
    const next = { active: true, key: apiInfo.key };
    setApiInfo(next);
    saveApiInfoForUser(id, next);
    setApiMessage('API activated');
    setTimeout(() => setApiMessage(null), 2000);
  };

  const copyApiKey = async () => {
    if (!apiInfo.key) return;
    try {
      await navigator.clipboard.writeText(apiInfo.key);
      setApiMessage('API key copied to clipboard');
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 1200);
      setTimeout(() => setApiMessage(null), 2000);
    } catch (e) {
      setApiMessage('Copy failed');
      setTimeout(() => setApiMessage(null), 2000);
    }
  };

  // Reveal an existing session key, or create one once and persist it to session
  const revealOrCreatePublicKey = async () => {
    if (!isBackendAuthenticated) {
      setApiMessage('Sign in to get a Public API key');
      setTimeout(() => setApiMessage(null), 2500);
      return;
    }

    const id = userData?.userId || userData?.id;

    // Try to load existing session copy
    try {
      const raw = sessionStorage.getItem(`public_api_key_${id}`);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          if (obj && obj.key) {
            setPublicCreatedFullKey(obj.key);
            setPublicCreatedDetails({ id: obj.id || null, created_at: obj.createdAt || obj.created_at || null });
            setPublicExpanded(true);
            return;
          }
        } catch (e) {
          setPublicCreatedFullKey(raw);
          setPublicExpanded(true);
          return;
        }
      }
    } catch (e) { /* ignore */ }

    // Create a new one and persist it
    setCreatingPublicKey(true);
    try {
      const res = await apiClient.createApiKey({ name: 'Public API Key', rate_limit: 60 });
      const createdAt = (res.details && (res.details.created_at || res.details.createdAt)) || new Date().toISOString();
      setPublicCreatedFullKey(res.key || null);
      setPublicCreatedDetails({ id: res.details?.id || null, created_at: createdAt });
      try {
        if (res.key && id) sessionStorage.setItem(`public_api_key_${id}`, JSON.stringify({ key: res.key, id: res.details?.id || null, createdAt }));
      } catch (e) { /* ignore */ }
      setPublicExpanded(true);
      setApiMessage('Public API key created — save it now');
      setTimeout(() => setApiMessage(null), 4000);
    } catch (e) {
      setApiMessage('Create Public API key failed');
      setTimeout(() => setApiMessage(null), 3000);
    } finally {
      setCreatingPublicKey(false);
    }
  };

  const handleChangeAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleEditProfile = () => {
    setEditForm({
      username: userData?.username || '',
      fullname: userData?.fullname || '',
      email: userData?.email || '',
      bio: userData?.bio || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (!isBackendAuthenticated) {
        setApiMessage('Profile updated locally (will sync when authenticated)');
        // Recompute avatar for generated avatars (only when user doesn't have a custom upload)
        const prevAvatar = userData?.avatar;
        const shouldRegenerateAvatar = !prevAvatar || prevAvatar.includes('ui-avatars.com/api');
        const nameForAvatar = editForm.fullname || editForm.username || userData?.username || userData?.fullname || '';
        const regeneratedAvatar = shouldRegenerateAvatar
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`
          : prevAvatar;

        const localUpdated = {
          ...(userData || {}),
          username: editForm.username,
          fullname: editForm.fullname,
          email: editForm.email,
          bio: editForm.bio,
          avatar: regeneratedAvatar,
        };
        if (updateUser) updateUser(localUpdated);
        else login(localUpdated);
        setShowEditModal(false);
        setTimeout(() => setApiMessage(null), 3000);
        setSaving(false);
        return;
      }

      const updated = await apiClient.updateUser(userIdForCalls, {
        username: editForm.username,
        fullname: editForm.fullname,
        email: editForm.email,
      });
      console.debug('updateUser response:', updated);
      if (!updated) {
        setApiMessage('Save failed');
        setTimeout(() => setApiMessage(null), 2500);
        setSaving(false);
        return;
      }

      // If profile bio needs updating, update the profile object via profiles endpoint
      if (profile && profile.id && (editForm.bio !== undefined && editForm.bio !== profile.bio)) {
        try {
          await apiClient.updateProfile(profile.id, { bio: editForm.bio });
        } catch (e) {
          console.error('Failed updating profile bio', e);
          setApiMessage('Failed to update profile bio');
          setTimeout(() => setApiMessage(null), 3000);
        }
      }

      if (updated) {
        // Re-fetch user to ensure we have full sanitized record
        const fresh = await apiClient.getUserById(updated.id || updated.userId);
        if (fresh) {
          // If the user didn't have a custom avatar and fullname changed, regenerate a UI avatar URL
          const prevAvatar = userData?.avatar || '';
          const isGenerated = !prevAvatar || prevAvatar.includes('ui-avatars.com/api');
          const nameForAvatar = editForm.fullname || fresh.fullname || fresh.username || userData?.username || '';
          if (isGenerated) {
            const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;
            if (newAvatar !== (fresh.avatar || '')) {
              fresh.avatar = newAvatar;
            }
          }

          if (updateUser) updateUser(fresh);
          else login(fresh);
        }
        // Re-fetch profile
        try {
          const freshProfile = await apiClient.getUserProfile(userIdForCalls);
          if (freshProfile) setProfile(freshProfile);
        } catch (e) {
          /* ignore */
        }
      }
      setShowEditModal(false);
      setApiMessage('Profile saved');
      setTimeout(() => setApiMessage(null), 2500);
    } catch (error) {
      console.error('Save profile failed', error);
      setApiMessage('Error saving profile');
      setTimeout(() => setApiMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setApiMessage('File size exceeds 2MB');
        setTimeout(() => setApiMessage(null), 3000);
        return;
      }

      // Check file type
      if (!file.type.match(/image\/(png|jpg|jpeg|gif)/)) {
        setApiMessage('Invalid file type. Please upload PNG, JPG, or GIF');
        setTimeout(() => setApiMessage(null), 3000);
        return;
      }

      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setApiMessage('File too large. Maximum size is 1MB');
        setTimeout(() => setApiMessage(null), 3000);
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
      setApiMessage('No file selected');
      setTimeout(() => setApiMessage(null), 2000);
      return;
    }

    setUploading(true);
    try {
      if (!isBackendAuthenticated) {
        // Save avatar locally as data URL and update stored userData so UI reflects it
        const toDataUrl = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        try {
          const dataUrl = await toDataUrl(selectedFile);
          const id = userIdForCalls || userData?.userId || userData?.id;
          if (id) {
            saveLocalAvatarForUser(id, dataUrl);
            const localUpdated = { ...(userData || {}), avatar: dataUrl };
            if (updateUser) updateUser(localUpdated);
            else login(localUpdated);
            setApiMessage('Avatar saved locally (will sync when authenticated)');
            setTimeout(() => setApiMessage(null), 3000);
          } else {
            setApiMessage('Unable to save avatar locally: no user id');
            setTimeout(() => setApiMessage(null), 3000);
          }
        } catch (e) {
          setApiMessage('Local avatar save failed');
          setTimeout(() => setApiMessage(null), 3000);
        } finally {
          setUploading(false);
          setShowAvatarModal(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }
        return;
      }

      const response = await apiClient.uploadAvatar(userData?.userId || userData?.id, selectedFile);
      if (response) {
        // Re-fetch full user record to get latest fields
        const fresh = await apiClient.getUserById(response.id || response.userId || userData?.userId || userData?.id);
        if (fresh) {
          if (updateUser) updateUser(fresh);
          else login(fresh);
          
          // Also update profile state if we're viewing our own profile
          if (profile?.user?.id === fresh.id) {
            setProfile(prev => ({
              ...prev,
              user: fresh
            }));
          }
        }
        // clear any local avatar cache now that server has it
        try {
          const id = userData?.userId || userData?.id;
          if (id) clearLocalAvatarForUser(id);
        } catch (e) {
          /* ignore */
        }
      }
      // Close modal and reset
      setShowAvatarModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      setApiMessage('Error uploading avatar');
      setTimeout(() => setApiMessage(null), 3000);
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
  const [profile, setProfile] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userIdForCalls = profile?.user?.id || userData?.userId || userData?.id;

  const loadProfileAndMatches = async () => {
    const id = userData?.userId || userData?.id;
    if (!id) return;
    
    setIsRefreshing(true);

    try {

      // Load any active API key stored for this user
      loadActiveKeyForUser(id);

      // Load frontend-saved API info for this user
      loadApiInfoForUser(id);

      // If backend auth is not present, skip backend calls and rely on local profile fields
      if (!isBackendAuthenticated) {
        setRecentMatches([]);
        // If a locally saved avatar exists, merge it into the stored user data so UI uses it
        const id = userData?.userId || userData?.id;
        let mergedUser = userData;
        try {
          const localAvatar = loadLocalAvatarForUser(id);
          // Only update stored userData if the avatar differs to avoid update loops
          if (localAvatar && localAvatar !== userData?.avatar) {
            mergedUser = { ...(userData || {}), avatar: localAvatar };
            if (updateUser) updateUser(mergedUser);
            else login(mergedUser);
          }
        } catch (e) {
          /* ignore */
        }

        setProfile({
          user: mergedUser,
          wins: mergedUser?.wins || 0,
          losses: mergedUser?.losses || 0,
          win_rate: mergedUser?.win_rate || 0,
          rank: mergedUser?.rank,
          level: mergedUser?.level,
        });
        return;
      }

      try {
        const matches = await apiClient.getMatchesForUser(id);
        // Transform matches data to match the expected format
        const transformedMatches = (matches || []).map((match) => {
          const isPlayer1 = match.player1.id === id;
          const opponent = isPlayer1 ? match.player2 : match.player1;
          const myScore = isPlayer1 ? match.player1_score : match.player2_score;
          const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
          const didWin = match.winner && match.winner.id === id;
          
          return {
            id: match.id,
            opponent: opponent.username || opponent.fullname || 'Unknown',
            score: `${myScore} - ${opponentScore}`,
            result: didWin ? 'win' : 'loss',
            date: new Date(match.completed_at || match.created_at).toLocaleDateString(),
          };
        });
        setRecentMatches(transformedMatches);
      } catch (err) {
        // Error loading matches for profile
      }

      try {
        const profileData = await apiClient.getUserProfile(id);
        setProfile(profileData);
      } catch (err) {
        // Error loading profile data
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileAndMatches();
  }, [userData, isBackendAuthenticated]);

  // Refresh API key list if we created a key via public button
  useEffect(() => {
    if (isBackendAuthenticated) {
      try {
        // If profile page loads, ensure API keys list is fresh (if the list exists later)
        // (no-op if fetchApiKeys not present)
        if (typeof fetchApiKeys === 'function') fetchApiKeys();
      } catch (e) { /* ignore */ }
    }
  }, [isBackendAuthenticated]);

  // Auto-refresh when switching to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && isBackendAuthenticated) {
      loadProfileAndMatches();
    }
  }, [activeTab]);

  // Listen for achievement unlock events to auto-refresh profile
  useEffect(() => {
    const handleAchievementUnlock = () => {
      if (isBackendAuthenticated) {
        loadProfileAndMatches();
      }
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlock);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlock);
    };
  }, [isBackendAuthenticated]);

  const stats = {
    gamesPlayed: profile?.total_games || (profile?.wins || 0) + (profile?.losses || 0),
    wins: profile?.wins || 0,
    losses: profile?.losses || 0,
    winRate: profile?.win_rate || 0,
    rank: profile?.rank ? `#${profile.rank}` : '#1000',
    level: profile?.level || 1,
  };

  const rawAchievements = profile?.achievements || userData?.achievements || [];
  // Extract achievement types from backend response
  const earnedAchievementTypes = new Set(
    (Array.isArray(rawAchievements) ? rawAchievements : [])
      .map((userAch) => userAch?.achievement?.achievement_type)
      .filter(Boolean)
  );
  
  // Map achievements from constants and mark as earned if user has them
  const achievementsList = ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: earnedAchievementTypes.has(a.type),
  }));

  return (
    <>
      <Navbar />
      <main className="profile-view">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile?.user?.avatar || userData?.avatar ? (
                  <img
                    src={profile?.user?.avatar || userData?.avatar}
                    alt={profile?.user?.username || userData?.username}
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                ) : (
                  (() => {
                    const usernameForAvatar =
                      (profile && profile.user && profile.user.username) ||
                      (userData && userData.username) ||
                      null;
                    return usernameForAvatar ? usernameForAvatar[0].toUpperCase() : 'U';
                  })()
                )}
              </div>
              <button
                className="btn-change-avatar"
                title="Change Avatar"
                onClick={handleChangeAvatar}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </div>
            <h1 className="profile-username">
              {profile?.user?.username || userData?.username || t('profile.player')}
            </h1>
            <p className="profile-email">
              {profile?.user?.email || userData?.email || t('profile.default_email')}
            </p>
            <div className="profile-level">
              <span className="level-badge">Level {stats.level}</span>
            </div>


            {/* Public API — window-style (collapsed shows only Get key) */}
            <div className="profile-public-api window">
              <div className="window-header">
                <div className="title-left">
                  <h4 style={{ margin: 0 }}>Public API</h4>
                </div>
                <div className="title-right">
                  {!publicCreatedFullKey ? (
                    <button className="btn btn-primary" onClick={revealOrCreatePublicKey} disabled={creatingPublicKey}>{creatingPublicKey ? 'Generating…' : 'Get key'}</button>
                  ) : (
                    <button className="btn" onClick={() => setPublicExpanded((s) => !s)}>{publicExpanded ? '✕' : 'Show'}</button>
                  )}
                </div>
              </div>

              {publicCreatedFullKey && publicExpanded && (
                <div className="window-body">
                  <div className="api-key-row">
                    <code className="api-key">{publicCreatedFullKey}</code>
                    <div className="api-actions">
                      <button className="btn" onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(publicCreatedFullKey);
                          setApiMessage('Public API key copied to clipboard');
                          setPublicKeyCopied(true);
                          setTimeout(() => setPublicKeyCopied(false), 1200);
                          setTimeout(() => setApiMessage(null), 1500);
                        } catch (e) {
                          setApiMessage('Copy failed');
                          setTimeout(() => setApiMessage(null), 1500);
                        }
                      }}>{publicKeyCopied ? 'Copied!' : 'Copy'}</button>

                      <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete key</button>
                    </div>
                  </div>

                  <div className="window-note">
                    <div className="profile-public-api-desc">Public endpoints (no auth required when using an API key):</div>
                    <ul className="profile-public-api-list">
                      <li><strong>GET</strong> <code>/api/leaderboard/</code> <small>api_leaderboard</small></li>
                      <li><strong>GET</strong> <code>/api/tournaments/</code> <small>api_tournaments_read</small></li>
                      <li><strong>POST</strong> <code>/api/tournaments/</code> <small>api_tournaments_create</small></li>
                      <li><strong>PUT</strong> <code>/api/tournaments/{'{id}'}/</code> <small>api_tournaments_update</small></li>
                      <li><strong>DELETE</strong> <code>/api/tournaments/{'{id}'}/</code> <small>api_tournaments_delete</small></li>
                    </ul>
                  </div>

                  {/* show created timestamp if present */}
                  {publicCreatedDetails?.created_at && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(publicCreatedDetails.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn-edit-profile"
              onClick={handleEditProfile}
              title={t('profile.edit_profile')}
            >

              <svg
                className="edit-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>

          {/* Delete confirmation modal for Public API key */}
          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Delete Public API key?</h2>
                  <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete the generated Public API key? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={async () => {
                    const id = userIdForCalls || userData?.userId || userData?.id;
                    if (!id) return;
                    const keyId = publicCreatedDetails?.id;
                    try {
                      if (keyId) await apiClient.revokeApiKey(keyId);
                      try { sessionStorage.removeItem(`public_api_key_${id}`); } catch (e) { /* ignore */ }
                      setPublicCreatedFullKey(null);
                      setPublicCreatedDetails(null);
                      setPublicExpanded(false);
                      setShowDeleteConfirm(false);
                      setApiMessage('Public API key deleted');
                      setTimeout(() => setApiMessage(null), 2000);
                    } catch (e) {
                      setApiMessage('Delete failed');
                      setTimeout(() => setApiMessage(null), 2000);
                      setShowDeleteConfirm(false);
                    }
                  }}>Delete</button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t('profile.tabs.overview')}
            </button>
            <button
              className={`profile-tab ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              {t('profile.tabs.matches')}
            </button>
            <button
              className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              {t('profile.tabs.achievements')}
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="profile-content">              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Statistics</h3>
                <button
                  onClick={loadProfileAndMatches}
                  disabled={isRefreshing}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isRefreshing ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>              <div className="achievements-grid">
                <div className="achievement-card">
                  <div className="achievement-icon" style={{ color: '#667eea' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
                  <div className="achievement-title">{t('profile.games_played')}</div>
                </div>
                <div className="achievement-card">
                  <div className="achievement-icon" style={{ color: '#10b981' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.wins}</div>
                  <div className="achievement-title">{t('profile.wins')}</div>
                </div>
                <div className="achievement-card">
                  <div className="achievement-icon" style={{ color: '#ef4444' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.losses}</div>
                  <div className="achievement-title">{t('profile.losses')}</div>
                </div>
                <div className="achievement-card">
                  <div className="achievement-icon" style={{ color: '#f59e0b' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.winRate}%</div>
                  <div className="achievement-title">{t('profile.win_rate')}</div>
                </div>
                <div className="achievement-card">
                  <div className="achievement-icon" style={{ color: '#fbbf24' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.rank}</div>
                  <div className="achievement-title">{t('profile.rank')}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="profile-content">
              <div className="match-history">
                {recentMatches.map((match) => (
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ margin: 0 }}>Achievements</h3>
                <small style={{ color: 'var(--text-muted)' }}>
                  {achievementsList.filter((a) => a.earned).length} / {achievementsList.length}{' '}
                  Unlocked
                </small>
              </div>
              <div className="achievements-grid">
                {achievementsList.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-title">{achievement.title}</div>
                    {!achievement.earned && <div className="achievement-locked">🔒</div>}
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
                <h2>{t('profile.edit_profile')}</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('profile.username')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('profile.fullname')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.fullname}
                    onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('profile.email')}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('profile.bio')}</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder={t('profile.bio_placeholder')}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  {t('profile.cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? t('profile.saving') : t('profile.save_changes')}
                </button>
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%' }}
                      />
                      <p className="text-muted">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <p>{t('profile.click_upload')}</p>
                      <p className="text-muted">{t('profile.file_types')}</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseAvatarModal}>
                  {t('profile.cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? t('profile.uploading') : t('profile.upload')}
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
