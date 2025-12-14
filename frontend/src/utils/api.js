// Use Django base for user routes and /api for other resources
const DJANGO_USER_BASE = '/user';
const DJANGO_API_BASE = '/api';

class ApiClient {
    async request(endpoint, options = {}) {
        try {
            // If caller passes an absolute path (starting with '/'), use it as-is.
            const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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
                    ...options.headers
                }
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const err = new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`);
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
            return await this.request(`${DJANGO_API_BASE}/tournaments/`);
        } catch (err) {
            console.warn('getTournaments: no tournaments endpoint', err);
            return [];
        }
    }

    async getTournamentById(id) {
        try {
            return await this.request(`${DJANGO_API_BASE}/tournaments/${id}/`);
        } catch (err) {
            console.warn('getTournamentById: not available', err);
            throw err;
        }
    }

    async createTournament(data) {
        try {
            return await this.request(`${DJANGO_API_BASE}/tournaments/`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.warn('createTournament: not available', err);
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

            const url = `${DJANGO_USER_BASE}/users/me/`;
            const response = await fetch(url, { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 200) {
                const data = await response.json();
                return data;
            }
            // Auth failures are expected if token expired or invalid; return null silently
            if (response.status === 401 || response.status === 403) return null;

            let payload = null;
            try { payload = await response.json(); } catch (e) { /* ignore */ }
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

    async register(username, email, password) {
        return this.request(`${DJANGO_USER_BASE}/users/`, {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(username, password) {
        // Login should be performed against the Django auth endpoint if available
        return this.request(`${DJANGO_API_BASE}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async searchUsers(query) {
        if (!query || !query.toString().trim()) return [];
        try {
            const results = await this.request(`${DJANGO_USER_BASE}/users/?search=${encodeURIComponent(query)}`);
            // If backend supports search, return sanitized results
            if (Array.isArray(results) && results.length > 0) {
                const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
                return results.filter(u => u && typeof u === 'object' && ((u.username && u.username.toString().trim()) || (u.email && u.email.toString().trim()))).filter(u => {
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
            return (all || []).filter(u => u && typeof u === 'object' && ((u.username && (u.username || '').toLowerCase().includes(q)) || (u.email && (u.email || '').toLowerCase().includes(q)) || (u.fullname && (u.fullname || '').toLowerCase().includes(q))));
        } catch (err) {
            console.warn('searchUsers fallback: no users to filter, attempting local DB', err);
        }

        // Final fallback: try local mock DB (client-only)
        try {
            const dbModule = await import('./database');
            const db = dbModule.default;
            const all = db.getCollection('users') || [];
            const q = query.toLowerCase();
            return (all || []).filter(u => u && typeof u === 'object' && ((u.username && (u.username || '').toLowerCase().includes(q)) || (u.email && (u.email || '').toLowerCase().includes(q)) || (u.fullname && (u.fullname || '').toLowerCase().includes(q))));
        } catch (err) {
            console.warn('searchUsers: local DB fallback failed', err);
            return [];
        }
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
                body: JSON.stringify({ to_user: toId })
            });
        } catch (err) {
            console.warn('sendInvitation: friendships endpoint not available', err);
            throw err;
        }
    }

    async updateInvitation(id, status) {
        return this.request(`${DJANGO_API_BASE}/invitations/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async getFriendRequests(userId) {
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
            body: JSON.stringify({ to_user: toId })
        });
    }

    async updateFriendRequest(id, status) {
        return this.request(`${DJANGO_USER_BASE}/friendships/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
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
            body: JSON.stringify({ fromId, toId, message })
        });
    }

    async markMessagesAsRead(userId, friendId) {
        return this.request(`${DJANGO_API_BASE}/messages/read/`, {
            method: 'PATCH',
            body: JSON.stringify({ userId, friendId })
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
            body: JSON.stringify(data)
        });
    }
}

const apiClient = new ApiClient();

export default apiClient;
