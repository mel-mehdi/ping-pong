/**
 * Fake Database System using localStorage
 * Simulates a simple database with collections
 */

const DB_PREFIX = 'ft_transcendence_db_';

/**
 * Database class to manage collections
 */
class Database {
    constructor() {
        this.collections = {
            users: 'users',
            sessions: 'sessions',
            matches: 'matches',
            tournaments: 'tournaments'
        };
    }

    /**
     * Get all items from a collection
     * @param {string} collectionName - Name of the collection
     * @returns {Array} Array of items
     */
    getCollection(collectionName) {
        const key = DB_PREFIX + collectionName;
        const data = localStorage.getItem(key);
        console.log(`Getting collection '${collectionName}' with key '${key}':`, data ? JSON.parse(data) : []);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save collection to localStorage
     * @param {string} collectionName - Name of the collection
     * @param {Array} data - Data to save
     */
    saveCollection(collectionName, data) {
        const key = DB_PREFIX + collectionName;
        console.log(`Saving collection '${collectionName}' with key '${key}':`, data);
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Insert a new item into a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} item - Item to insert
     * @returns {Object} Inserted item with ID
     */
    insert(collectionName, item) {
        const collection = this.getCollection(collectionName);
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };
        collection.push(newItem);
        this.saveCollection(collectionName, collection);
        return newItem;
    }

    /**
     * Find items in a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} query - Query object to filter items
     * @returns {Array} Matching items
     */
    find(collectionName, query = {}) {
        const collection = this.getCollection(collectionName);
        if (Object.keys(query).length === 0) {
            return collection;
        }

        return collection.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    /**
     * Find one item in a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} query - Query object to filter items
     * @returns {Object|null} First matching item or null
     */
    findOne(collectionName, query) {
        const results = this.find(collectionName, query);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Update an item in a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} query - Query to find item
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated item or null
     */
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

    /**
     * Delete an item from a collection
     * @param {string} collectionName - Name of the collection
     * @param {Object} query - Query to find item
     * @returns {boolean} True if deleted, false otherwise
     */
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

    /**
     * Clear a collection
     * @param {string} collectionName - Name of the collection
     */
    clearCollection(collectionName) {
        this.saveCollection(collectionName, []);
    }

    /**
     * Clear all collections (reset database)
     */
    clearAll() {
        Object.values(this.collections).forEach(collection => {
            this.clearCollection(collection);
        });
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Hash a password (simple hash for demo purposes)
     * @param {string} password - Password to hash
     * @returns {string} Hashed password
     */
    hashPassword(password) {
        // Simple hash (in production, use proper encryption)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Verify a password
     * @param {string} password - Plain password
     * @param {string} hash - Hashed password
     * @returns {boolean} True if passwords match
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
}

// Create singleton instance
const db = new Database();

export default db;
export { Database };
