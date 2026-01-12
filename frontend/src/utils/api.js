import { API_ENDPOINTS, HTTP_STATUS } from './constants';
import logger from './logger';

const { DJANGO_USER_BASE, DJANGO_API_BASE } = API_ENDPOINTS;
// Use configurable backend origin via `VITE_BACKEND_ORIGIN`. Default to relative path
// so nginx can proxy requests appropriately when not set.
const BACKEND_BASE = typeof window !== 'undefined' ? (import.meta.env.VITE_BACKEND_ORIGIN || '') : ''; 

class ApiClient {
  constructor() {
    // Track in-flight GET requests to avoid duplicate network calls
    // (useful during React StrictMode double-invocation in development).
    this._inFlight = new Map();
  }

  // Helper methods
  _getAuthToken() {
    try {
      const data = localStorage.getItem('userData');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed?.token || parsed?.access || null;
    } catch {
      return null;
    }
  }

  _getCSRFToken() {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|; )csrftoken=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  _getActiveApiKey() {
    try {
      return localStorage.getItem('active_api_key');
    } catch {
      return null;
    }
  }

  _isUnsafeMethod(method) {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  _buildUrl(endpoint) {
    if (endpoint.startsWith('http')) return endpoint;
    const urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${BACKEND_BASE}${urlPath}`;
  }

  _buildHeaders(endpoint, options) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT Authorization token
    const token = this._getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add API key if targeting API endpoints
    const activeKey = this._getActiveApiKey();
    if (activeKey) {
      const urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      if (urlPath.startsWith(DJANGO_API_BASE)) {
        headers['X-API-Key'] = activeKey;
      }
    }

    // Add CSRF token for unsafe methods
    const method = (options.method || 'GET').toUpperCase();
    if (this._isUnsafeMethod(method)) {
      const csrfToken = this._getCSRFToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }

    return headers;
  }

  async _parseResponse(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  _logError(endpoint, error, quiet) {
    // Suppress logs if quiet mode is on OR if it's auth-related errors (expected during login/register)
    if (quiet || error?.status === 401 || error?.status === 400 || error?.status === 403 || error?.status === 404) return;
    
    const message = `API Error [${endpoint}]: ${error.message}`;
    if (error?.isAuthError) {
      logger.warn(message);
    } else {
      logger.error(message);
    }
  }

  async request(endpoint, options = {}) {
    const quiet = options.quiet === true;
    const method = (options.method || 'GET').toUpperCase();

    // Dedupe in-flight GET requests unless caller sets `forceRefresh: true`
    const shouldDedupe = method === 'GET' && !options.forceRefresh;
    const cacheKey = shouldDedupe ? `${method}:${endpoint}` : null;

    if (shouldDedupe && this._inFlight.has(cacheKey)) {
      return this._inFlight.get(cacheKey);
    }

    const run = (async () => {
      try {
        const url = this._buildUrl(endpoint);
        const headers = this._buildHeaders(endpoint, options);

        const config = {
          ...options,
          credentials: 'include',
          headers,
        };

        const response = await fetch(url, config);
        const data = await this._parseResponse(response);

        if (!response.ok) {
          const err = new Error(
            (data && (data.error || data.detail)) || 
            `HTTP ${response.status}: ${response.statusText}`
          );
          err.status = response.status;
          err.detail = data?.detail;
          err.data = data;
          if (response.status === HTTP_STATUS.UNAUTHORIZED || 
              response.status === HTTP_STATUS.FORBIDDEN) {
            err.isAuthError = true;
          }
          throw err;
        }

        return data;
      } catch (error) {
        this._logError(endpoint, error, quiet);
        throw error;
      } finally {
        if (shouldDedupe) this._inFlight.delete(cacheKey);
      }
    })();

    if (shouldDedupe) {
      this._inFlight.set(cacheKey, run);
    }

    return run;
  }

  async _safeRequest(endpoint, options = {}, fallback = []) {
    try {
      return await this.request(endpoint, { quiet: true, ...options });
    } catch {
      return fallback;
    }
  }

  // User Management
  async getAllUsers() {
    return this._safeRequest(`${DJANGO_USER_BASE}/users/`, {}, []);
  }

  async getMe() {
    return this._safeRequest(`${DJANGO_USER_BASE}/users/me/`, { quiet: true }, null);
  }

  async getUserProfile(id) {
    return this._safeRequest(`${DJANGO_USER_BASE}/users/${id}/profile/`, {}, null);
  }

  async getProfiles() {
    return this._safeRequest(`${DJANGO_USER_BASE}/profiles/leaderboard/`, {}, []);
  }

  async updateUser(userId, data) {
    return this.request(`${DJANGO_USER_BASE}/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(profileId, data) {
    return this.request(`${DJANGO_USER_BASE}/profiles/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Get user by id
  async getUserById(id) {
    return this._safeRequest(`${DJANGO_USER_BASE}/users/${id}/`, {}, null);
  }

  // Upload avatar (multipart PATCH)
  async uploadAvatar(userId, file) {
    if (!userId) throw new Error('Missing user id');
    if (!file) throw new Error('Missing file');

    const endpoint = `${DJANGO_USER_BASE}/users/${userId}/`;
    const url = this._buildUrl(endpoint);

    // Ensure CSRF token is present; attempt to fetch a safe endpoint to set cookie if not
    if (!this._getCSRFToken()) {
      try {
        // Include credentials so the browser accepts Set-Cookie headers
        await fetch(this._buildUrl('/admin/login/'), { credentials: 'include' });
      } catch (e) {
        // ignore
      }
    }

    // Re-read CSRF token after the fetch attempt
    const csrfToken = this._getCSRFToken();

    const form = new FormData();
    form.append('avatar', file);

    // Build headers but let browser set Content-Type for multipart
    const headers = this._buildHeaders(endpoint, { method: 'PATCH' });
    if (headers['Content-Type']) delete headers['Content-Type'];

    const response = await fetch(url, {
      method: 'PATCH',
      body: form,
      headers,
      credentials: 'include',
    });

    const data = await this._parseResponse(response);

    if (!response.ok) {
      const err = new Error((data && (data.error || data.detail)) || `HTTP ${response.status}: ${response.statusText}`);
      err.status = response.status;
      err.data = data;
      if (response.status === HTTP_STATUS.UNAUTHORIZED || response.status === HTTP_STATUS.FORBIDDEN) err.isAuthError = true;
      this._logError(endpoint, err, false);
      throw err;
    }

    return data;
  }

  // Authentication
  async register(username, email, password, fullname = '') {
    try {
      return await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, fullname }),
        quiet: true, // Suppress console warnings for registration failures
      });
    } catch (err) {
      // Fallback to alternate endpoint
      if (err?.status === HTTP_STATUS.NOT_FOUND) {
        return this.request('/users/register/', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, fullname }),
        });
      }
      throw err;
    }
  }

  async login(username, password) {
    try {
      return await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        quiet: true, // Suppress console warnings for login failures
      });
    } catch (err) {
      // Fallback to alternate endpoint
      if (err?.status === HTTP_STATUS.NOT_FOUND) {
        return this.request('/users/login/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
          quiet: true,
        });
      }
      throw err;
    }
  }

  async logout() {
    return this.request('/auth/logout/', { method: 'POST', body: JSON.stringify({}) });
  }

  async googleLogin(credential) {
    // Ensure we have a CSRF token before making the POST request
    if (!this._getCSRFToken()) {
      try {
        // Fetch a safe endpoint to set the CSRF cookie
        await fetch(this._buildUrl('/admin/login/'));
      } catch (e) {
        // Ignore error
      }
    }

    return this.request('/auth/google_login/', {
      method: 'POST',
      body: JSON.stringify({ token: credential }),
    });
  }

  // Search
  async searchUsers(query) {
    if (!query || !query.toString().trim()) return [];
    
    try {
      // Backend search might not be enabled, so we fetch all and filter locally if needed
      const results = await this.request(
        `${DJANGO_USER_BASE}/users/`,
        { quiet: false }
      );
      
      if (Array.isArray(results)) {
        if (results.length === 0) {
          return [];
        }
        
        const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
        const maxUsernameLength = 50;
        const maxEmailLength = 120;
        const lowerQuery = query.toLowerCase();
        
        const filtered = results
          .filter(u => u && typeof u === 'object')
          .filter(u => (u.username?.trim() || u.email?.trim()))
          .filter(u => {
            const username = (u.username || '').toString();
            const email = (u.email || '').toString();
            
            if (!username && !email) return false;
            if (username.length > maxUsernameLength || email.length > maxEmailLength) return false;
            if (badPattern.test(username) || badPattern.test(email)) return false;
            
            // Client-side filtering
            return username.toLowerCase().includes(lowerQuery) || 
                   email.toLowerCase().includes(lowerQuery);
          });
        
        return filtered;
      }
      
      return []; 
    } catch (err) {
      logger.error('searchUsers: backend search failed:', err);
      
      // Fallback: fetch all users then filter locally
      try {
        const all = await this.getAllUsers();
        const q = query.toLowerCase();
        return (all || []).filter(u =>
          u &&
          typeof u === 'object' &&
          ((u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.fullname && u.fullname.toLowerCase().includes(q)))
        );
      } catch (fallbackErr) {
        logger.error('Fallback search also failed:', fallbackErr);
        return [];
      }
    }
  }

  // Tournaments
  async getTournaments() {
    return this._safeRequest('/game/tournaments/', {}, []);
  }

  async getTournamentById(id) {
    return this.request(`/game/tournaments/${id}/`);
  }

  async createTournament(data) {
    return this.request('/game/tournaments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinTournament(tournamentId) {
    return this.request(`/game/tournaments/${tournamentId}/join/`, {
      method: 'POST',
    });
  }

  async leaveTournament(tournamentId) {
    return this.request(`/game/tournaments/${tournamentId}/leave/`, {
      method: 'POST',
    });
  }

  async startTournament(tournamentId) {
    return this.request(`/game/tournaments/${tournamentId}/start/`, {
      method: 'POST',
    });
  }

  // AI opponent prediction
  async aiDecide(ball, paddle, difficulty = 'MEDIUM') {
    return this.request('/game/ai/decide/', {
      method: 'POST',
      body: JSON.stringify({ ball, paddle, difficulty }),
    });
  }

  // Friends & Invitations
  async sendFriendRequest(fromId, fromName, toId, toName) {
    try {
      const payload = { 
        to_user_id: toId
      };
      
      const result = await this.request('/friendships/send_request/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      return result; 
    } catch (err) {
      // Only log actual errors, not expected validations like "already exists"
      if (err.status !== 400) {
        logger.error('Friend request failed:', err);
      }
      throw err;
    }
  }

  async getPendingFriendRequests() {
    // Get pending friend requests received by current user
    try {
      const friendships = await this.request('/friendships/pending_requests/');
      return friendships || [];
    } catch {
      return [];
    }
  }

  async getSentFriendRequests() {
    // Get all friendships where current user is the sender
    try {
      const friendships = await this.request('/friendships/');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return (friendships || []).filter(fs => 
        fs.from_user?.id === userData.userId && 
        fs.status === 'pending'
      );
    } catch {
      return [];
    }
  }

  async getMyFriends() {
    // Get accepted friendships
    try {
      const friendships = await this.request('/friendships/my_friends/');
      return friendships || [];
    } catch {
      return [];
    }
  }

  async getPendingGameInvitations() {
    try {
      const invitations = await this.request('/game/invitations/');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return (invitations || []).filter(inv => 
        inv.status === 'pending' && 
        inv.receiver?.id === userData.userId &&
        inv.invitation_type === 'match'
      );
    } catch {
      return [];
    }
  }

  async respondToInvitation(invitationId, response) {
    return this.request(`/game/invitations/${invitationId}/respond/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: response }),
    });
  }

  async acceptFriendRequest(friendshipId) {
    return this.request(`/friendships/${friendshipId}/accept/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async rejectFriendRequest(friendshipId) {
    return this.request(`/friendships/${friendshipId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Game Invitations (separate from friend requests)
  async sendGameInvitation(receiverId, invitationType, message) {
    return this.request('/game/invitations/', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        invitation_type: invitationType,
        message: message
      }),
    });
  }

  async getMyFriends() {
    try {
      const friendships = await this.request('/friendships/my_friends/');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const myId = userData.userId || userData.id;

      return (friendships || []).map(f => {
        // Return the *other* user in the friendship
        if (f.from_user && (f.from_user.id === myId || f.from_user.userId === myId)) {
          return f.to_user;
        }
        return f.from_user;
      }).filter(Boolean); // Filter out any nulls
    } catch {
      return [];
    }
  }

  // Chat & Messages
  async getConversations() {
    return this._safeRequest('/chat/conversations/', {}, []);
  }

  async getConversationMessages(conversationId) {
    return this._safeRequest(`/chat/conversations/${conversationId}/messages/`, {}, []);
  }

  async getOrCreateConversation(userId1, userId2) {
    try {
      const conversations = await this.request('/chat/conversations/');
      
      const existingConv = (conversations || []).find(conv => {
        const participantIds = conv.participants?.map(p => p.id) || [];
        return participantIds.includes(userId2) && participantIds.length === 2;
      });
      
      if (existingConv) return existingConv;
      
      return await this.request('/chat/conversations/', {
        method: 'POST',
        body: JSON.stringify({ participant_ids: [userId1, userId2] }),
      });
    } catch {
      return null;
    }
  }

  // Game & Matches
  async getMyMatches() {
    return this._safeRequest('/game/matches/my_matches/', {}, []);
  }

  async getTournamentMatches() {
    return this._safeRequest('/game/matches/tournament_matches/', {}, []);
  }

  // Alias for getMyMatches
  async getMatchesForUser(userId) {
    return this.getMyMatches();
  }

  async createMatch(matchData) {
    return this.request('/game/matches/', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  // Leaderboard
  async getLeaderboard() {
    return this._safeRequest('/game/leaderboard/all_time/', {}, []);
  }

  // API Key Management
  getActiveApiKey() {
    return this._getActiveApiKey();
  }

  setActiveApiKey(key) {
    try {
      if (key === null) {
        localStorage.removeItem('active_api_key');
      } else {
        localStorage.setItem('active_api_key', key);
      }
    } catch {
      // ignore
    }
  }

  clearActiveApiKey() {
    try {
      localStorage.removeItem('active_api_key');
    } catch {
      // ignore
    }
  }

  async createApiKey({ name, rate_limit = 60, expires_at = null } = {}) {
    return this.request('/api/keys/create_key/', {
      method: 'POST',
      body: JSON.stringify({ name, rate_limit, expires_at }),
    });
  }

  async revokeApiKey(id) {
    if (!id) throw new Error('Missing key id');
    return this.request(`/api/keys/${id}/revoke/`, {
      method: 'DELETE',
    });
  }

  // Notifications (unused - reserved for future use) (unused - reserved for future use)
  // Achievements (unused - reserved for future use)
}

const apiClient = new ApiClient();

export default apiClient;
