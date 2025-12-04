/**
 * API Client for backend communication
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ===== USER METHODS =====

    async getAllUsers() {
        return this.request('/users');
    }

    async getUserById(id) {
        return this.request(`/users/${id}`);
    }

    async register(username, email, password) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(username, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async searchUsers(query) {
        return this.request(`/search?q=${encodeURIComponent(query)}`);
    }

    // ===== INVITATION METHODS =====

    async getInvitations(userId) {
        return this.request(`/invitations/${userId}`);
    }

    async sendInvitation(fromId, fromName, toId, toName) {
        return this.request('/invitations', {
            method: 'POST',
            body: JSON.stringify({ fromId, fromName, toId, toName })
        });
    }

    async updateInvitation(id, status) {
        return this.request(`/invitations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // ===== FRIEND REQUEST METHODS =====

    async getFriendRequests(userId) {
        return this.request(`/friend-requests/${userId}`);
    }

    async sendFriendRequest(fromId, fromName, toId, toName) {
        return this.request('/friend-requests', {
            method: 'POST',
            body: JSON.stringify({ fromId, fromName, toId, toName })
        });
    }

    async updateFriendRequest(id, status) {
        return this.request(`/friend-requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // ===== MESSAGE METHODS =====

    async getMessages(userId1, userId2) {
        return this.request(`/messages/${userId1}/${userId2}`);
    }

    async sendMessage(fromId, toId, message) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ fromId, toId, message })
        });
    }

    async markMessagesAsRead(userId, friendId) {
        return this.request('/messages/read', {
            method: 'PATCH',
            body: JSON.stringify({ userId, friendId })
        });
    }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
