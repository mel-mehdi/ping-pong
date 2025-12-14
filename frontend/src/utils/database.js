const DB_PREFIX = 'ft_transcendence_db_';

class Database {
    constructor() {
        this.collections = {
            users: 'users',
            sessions: 'sessions',
            matches: 'matches',
            tournaments: 'tournaments'
        };
    }

    getCollection(collectionName) {
        const key = DB_PREFIX + collectionName;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    saveCollection(collectionName, data) {
        const key = DB_PREFIX + collectionName;
        localStorage.setItem(key, JSON.stringify(data));
    }

    insert(collectionName, item) {
        const collection = this.getCollection(collectionName);
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        } ;
        collection.push(newItem);
        this.saveCollection(collectionName, collection);
        return newItem;
    }

    find(collectionName, query = {}) {
        const collection = this.getCollection(collectionName);
        if (Object.keys(query).length === 0) {
            return collection;
        }

        return collection.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    findOne(collectionName, query) {
        const results = this.find(collectionName, query);
        return results.length > 0 ? results[0] : null;
    }

    update(collectionName, query, updates) {
        const collection = this.getCollection(collectionName);
        const index = collection.findIndex(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });

        if (index !== -1) {
            collection[index] = {
                ...collection[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveCollection(collectionName, collection);
            return collection[index];
        }
        return null;
    }

    delete(collectionName, query) {
        const collection = this.getCollection(collectionName);
        const newCollection = collection.filter(item => {
            return !Object.keys(query).every(key => item[key] === query[key]);
        });

        if (newCollection.length < collection.length) {
            this.saveCollection(collectionName, newCollection);
            return true;
        }
        return false;
    }

    cleanUsers(patterns = []) {
        const users = this.getCollection('users') || [];
        const isBad = (u) => {
            if (!u || typeof u !== 'object') return true;
            const username = (u.username || '').toString();
            const email = (u.email || '').toString();
            // Empty username/email are suspicious
            if (!username && !email) return true;

            // Match provided string or regex patterns
            for (const p of patterns) {
                if (!p) continue;
                if (typeof p === 'string') {
                    if (username.includes(p) || email.includes(p)) return true;
                } else if (p instanceof RegExp) {
                    if (p.test(username) || p.test(email)) return true;
                }
            }

            // Generic heuristics: URL-like or query fragments in username
            if (username.includes('/') || username.includes('http') || username.includes('?')) return true;
            // Very long usernames likely garbage
            if (username.length > 50) return true;

            return false;
        };

        const kept = users.filter(u => !isBad(u));
        const removed = users.filter(u => isBad(u));
        if (removed.length > 0) this.saveCollection('users', kept);
        return { removed, kept };
    }

    clearCollection(collectionName) {
        this.saveCollection(collectionName, []);
    }

    clearAll() {
        Object.values(this.collections).forEach(collection => {
            this.clearCollection(collection);
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
}

const db = new Database();

export default db;
export { Database };
