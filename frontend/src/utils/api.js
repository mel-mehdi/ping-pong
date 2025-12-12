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
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await this.request(`${DJANGO_USER_BASE}/users/`);
        } catch (err) {
            console.warn('getAllUsers: no users endpoint available', err);
            return [];
        }
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
        try {
            return await this.request(`${DJANGO_USER_BASE}/users/?search=${encodeURIComponent(query)}`);
        } catch (err) {
            console.warn('searchUsers: no backend search available', err);
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
