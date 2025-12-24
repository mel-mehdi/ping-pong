// Use Django base for user routes and /api for other resources
// Backend exposes user routes under /users/, so keep base empty to avoid /user/users/
const DJANGO_USER_BASE = '';
const DJANGO_API_BASE = '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    try {
      // Allow overriding backend base via Vite env. Fallback to localhost:8001 for dev.
      const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      // Normalize path
      const urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_BASE}${urlPath}`;

      const token = (() => {
        try {
          const data = localStorage.getItem('userData');
          if (!data) return null;
          const p = JSON.parse(data);
          return p?.token || p?.access || null;
        } catch (e) {
          return null;
        }
      })();

      const config = {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      };

      // If an active API key is stored in localStorage, attach it to requests
      // that target the backend API base (e.g. `/api/...`) so Public API endpoints
      // can be accessed with an X-API-Key header.
      try {
        const activeKey = localStorage.getItem('active_api_key');
        if (activeKey) {
          const urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
          if (urlPath.startsWith(DJANGO_API_BASE)) {
            config.headers = { ...config.headers, 'X-API-Key': activeKey };
          }
        }
      } catch (e) {
        // ignore localStorage errors
      }

      // For state-changing requests, ensure CSRF cookie/header is present
      const method = (config.method || 'GET').toUpperCase();
      const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (unsafeMethods.includes(method)) {
        // Read CSRF cookie if present
        const getCookie = (name) => {
          if (typeof document === 'undefined') return null;
          const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : null;
        };

        let csrfToken = getCookie('csrftoken');
        // If no CSRF cookie yet, request it from backend
        if (!csrfToken) {
          const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
          await fetch(`${BACKEND_BASE}/api/csrf/`, { credentials: 'include' });
          csrfToken = getCookie('csrftoken');
        }

        if (csrfToken) {
          config.headers = { ...config.headers, 'X-CSRFToken': csrfToken };
        }
      }

      const response = await fetch(url, config);
      // Some endpoints may return no content; handle JSON parse failures gracefully
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const err = new Error(
          (data && (data.error || data.detail)) || `HTTP ${response.status}: ${response.statusText}`
        );
        err.status = response.status;
        if (response.status === 401 || response.status === 403) err.isAuthError = true;
        throw err;
      }

      return data;
    } catch (error) {
      // Treat auth failures as expected (warn) to avoid noisy error logs
      if (error && error.isAuthError) {
        console.warn(`API Error [${endpoint}]:`, error.message);
      } else {
        console.error(`API Error [${endpoint}]:`, error.message);
      }
      throw error;
    }
  }

  async getAllUsers() {
    return await this.request(`${DJANGO_USER_BASE}/users/`);
  }

  // Tournaments endpoints may be absent; try /api/tournaments/ and return empty list on failure
  async getTournaments() {
    try {
      // Backend exposes tournaments under /game/tournaments/
      return await this.request(`/game/tournaments/`);
    } catch (err) {
      console.warn('getTournaments: no tournaments endpoint', err);
      return [];
    }
  }

  async getTournamentById(id) {
    try {
      return await this.request(`/game/tournaments/${id}/`);
    } catch (err) {
      console.warn('getTournamentById: not available', err);
      throw err;
    }
  }

  async createTournament(data) {
    try {
      return await this.request(`/game/tournaments/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('createTournament: not available', err);
      throw err;
    }
  }

  async joinTournament(tournamentId) {
    try {
      return await this.request(`/game/tournaments/${tournamentId}/join/`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('joinTournament: failed', err);
      throw err;
    }
  }

  async getUserById(id) {
    return this.request(`${DJANGO_USER_BASE}/users/${id}/`);
  }

  async getMe() {
    // If there's no stored token, skip the network check to avoid noisy 403s
    try {
      let token = null;
      try {
        const data = localStorage.getItem('userData');
        if (data) {
          const p = JSON.parse(data);
          token = p?.token || p?.access || null;
        }
      } catch (e) {
        token = null;
      }

      if (!token) {
        // No token found — don't call backend automatically (cookie-based sessions are uncommon in this setup)
        return null;
      }

      const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      const url = `${BACKEND_BASE}${DJANGO_USER_BASE}/users/me/`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        try {
          const data = await response.json();
          return data;
        } catch (e) {
          return null;
        }
      }
      // Auth failures are expected if token expired or invalid; return null silently
      if (response.status === 401 || response.status === 403) return null;

      let payload = null;
      try {
        payload = await response.json();
      } catch (e) {
        /* ignore */
      }
      console.warn('getMe: unexpected response', response.status, payload);
      return null;
    } catch (err) {
      console.warn('getMe: network or other error', err);
      return null;
    }
  }

  async getUserProfile(id) {
    try {
      return await this.request(`${DJANGO_USER_BASE}/users/${id}/profile/`);
    } catch (err) {
      console.warn('getUserProfile: not available', err);
      return null;
    }
  }

  async getProfiles() {
    try {
      return await this.request(`${DJANGO_USER_BASE}/profiles/`);
    } catch (err) {
      console.warn('getProfiles: not available', err);
      return [];
    }
  }

  async register(username, email, password) {
    // Registration is exposed under /auth/register/ (AuthViewSet)
    return this.request(`/auth/register/`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(username, password) {
    // Login is exposed under /auth/login/ (AuthViewSet)
    return this.request(`/auth/login/`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async searchUsers(query) {
    if (!query || !query.toString().trim()) return [];
    try {
      const results = await this.request(
        `${DJANGO_USER_BASE}/users/?search=${encodeURIComponent(query)}`
      );
      // If backend supports search, return sanitized results
      if (Array.isArray(results) && results.length > 0) {
        const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
        return results
          .filter(
            (u) =>
              u &&
              typeof u === 'object' &&
              ((u.username && u.username.toString().trim()) ||
                (u.email && u.email.toString().trim()))
          )
          .filter((u) => {
            const username = (u.username || '').toString();
            const email = (u.email || '').toString();
            if (!username && !email) return false;
            if (username.length > 50 || email.length > 120) return false;
            if (badPattern.test(username) || badPattern.test(email)) return false;
            return true;
          });
      }
    } catch (err) {
      // continue to fallback
      console.warn('searchUsers: backend search failed, falling back to client-side filter', err);
    }

    // Fallback: fetch all users then filter locally
    try {
      const all = await this.getAllUsers();
      const q = query.toLowerCase();
      return (all || []).filter(
        (u) =>
          u &&
          typeof u === 'object' &&
          ((u.username && (u.username || '').toLowerCase().includes(q)) ||
            (u.email && (u.email || '').toLowerCase().includes(q)) ||
            (u.fullname && (u.fullname || '').toLowerCase().includes(q)))
      );
    } catch (err) {
      console.warn('searchUsers fallback: no users to filter, attempting local DB', err);
    }

    // No client-side database fallback — search offline will return empty list
    return [];
  }

  async getInvitations(userId) {
    try {
      return await this.request(`${DJANGO_API_BASE}/invitations/${userId}/`);
    } catch (err) {
      console.warn('getInvitations: no invitations endpoint', err);
      return [];
    }
  }

  async sendInvitation(fromId, fromName, toId, toName) {
    try {
      return await this.request(`${DJANGO_USER_BASE}/friendships/`, {
        method: 'POST',
        body: JSON.stringify({ to_user: toId, to_name: toName }),
      });
    } catch (err) {
      console.warn('sendInvitation: friendships endpoint not available', err);
      throw err;
    }
  }

  async updateInvitation(id, status) {
    return this.request(`${DJANGO_API_BASE}/invitations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getFriendRequests() {
    try {
      return await this.request(`${DJANGO_USER_BASE}/friendships/`);
    } catch (err) {
      console.warn('getFriendRequests: no endpoint available', err);
      return [];
    }
  }

  async sendFriendRequest(fromId, fromName, toId, toName) {
    return this.request(`${DJANGO_USER_BASE}/friendships/`, {
      method: 'POST',
      body: JSON.stringify({ to_user: toId, to_name: toName }),
    });
  }

  async updateFriendRequest(id, status) {
    return this.request(`${DJANGO_USER_BASE}/friendships/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getMessages(userId1, userId2) {
    try {
      return await this.request(`${DJANGO_API_BASE}/messages/${userId1}/${userId2}/`);
    } catch (err) {
      console.warn('getMessages: messages endpoint not available', err);
      return [];
    }
  }

  async getLeaderboard() {
    try {
      return await this.request(`${DJANGO_API_BASE}/leaderboard/`);
    } catch (err) {
      console.warn('getLeaderboard: not found, returning empty list', err);
      return [];
    }
  }

  async sendMessage(fromId, toId, message) {
    return this.request(`${DJANGO_API_BASE}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ fromId, toId, message }),
    });
  }

  async markMessagesAsRead(userId, friendId) {
    return this.request(`${DJANGO_API_BASE}/messages/read/`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, friendId }),
    });
  }

  async getMatchesForUser(userId) {
    try {
      return await this.request(`${DJANGO_API_BASE}/matches/${userId}/`);
    } catch (err) {
      console.warn('getMatchesForUser: not found', err);
      return [];
    }
  }

  async uploadAvatar(userId, file) {
    try {
      const url = `${DJANGO_USER_BASE}/users/${userId}/`;
      const form = new FormData();
      form.append('avatar', file);

      const response = await fetch(url, {
        method: 'PATCH',
        body: form,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Upload failed');
      return data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
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

  // Local active API key helpers (frontend-only)
  getActiveApiKey() {
    try {
      return localStorage.getItem('active_api_key');
    } catch (e) {
      return null;
    }
  }

  setActiveApiKey(key) {
    try {
      if (key === null) localStorage.removeItem('active_api_key');
      else localStorage.setItem('active_api_key', key);
    } catch (e) {
      /* ignore */
    }
  }

  clearActiveApiKey() {
    try {
      localStorage.removeItem('active_api_key');
    } catch (e) {
      /* ignore */
    }
  }
}

const apiClient = new ApiClient();

export default apiClient;
