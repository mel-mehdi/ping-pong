const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    
    async request(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const config = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
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

const apiClient = new ApiClient();

export default apiClient;
