const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to read database
async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return {
            users: [],
            sessions: [],
            gameInvitations: [],
            friendRequests: [],
            matches: [],
            tournaments: []
        };
    }
}

// Helper function to write database
async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Hash password (simple hash for demo)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// ===== USER ROUTES =====

// Get all users
app.get('/api/users', async (req, res) => {
    const db = await readDB();
    // Don't send password hashes to frontend
    const users = db.users.map(({ passwordHash, ...user }) => user);
    res.json(users);
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (user) {
        const { passwordHash, ...userData } = user;
        res.json(userData);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Register new user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();

    // Check if user exists
    const existingUser = db.users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new user
    const newUser = {
        id: generateId(),
        username,
        email,
        fullname: username,
        passwordHash: hashPassword(password),
        avatar: null,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const { passwordHash, ...userData } = newUser;
    res.status(201).json(userData);
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    const db = await readDB();
    const user = db.users.find(u => u.username === username || u.email === username);

    if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const session = {
        id: generateId(),
        userId: user.id,
        loginTime: new Date().toISOString()
    };

    db.sessions.push(session);
    await writeDB(db);

    const { passwordHash, ...userData } = user;
    res.json({ user: userData, sessionId: session.id });
});

// ===== GAME INVITATION ROUTES =====

// Get all invitations for a user
app.get('/api/invitations/:userId', async (req, res) => {
    const db = await readDB();
    const invitations = db.gameInvitations.filter(
        inv => inv.toId === req.params.userId || inv.fromId === req.params.userId
    );
    res.json(invitations);
});

// Send game invitation
app.post('/api/invitations', async (req, res) => {
    const { fromId, fromName, toId, toName } = req.body;

    if (!fromId || !toId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();

    const invitation = {
        id: generateId(),
        from: fromName,
        fromId,
        to: toName,
        toId,
        type: 'game',
        status: 'pending',
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
    };

    db.gameInvitations.push(invitation);
    await writeDB(db);

    res.status(201).json(invitation);
});

// Update invitation status
app.patch('/api/invitations/:id', async (req, res) => {
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const db = await readDB();
    const invitation = db.gameInvitations.find(inv => inv.id === req.params.id);

    if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
    }

    invitation.status = status;
    invitation.updatedAt = new Date().toISOString();

    await writeDB(db);
    res.json(invitation);
});

// ===== FRIEND REQUEST ROUTES =====

// Get friend requests for a user
app.get('/api/friend-requests/:userId', async (req, res) => {
    const db = await readDB();
    const requests = db.friendRequests.filter(req => req.toId === req.params.userId);
    res.json(requests);
});

// Send friend request
app.post('/api/friend-requests', async (req, res) => {
    const { fromId, fromName, toId, toName } = req.body;

    if (!fromId || !toId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();

    const request = {
        id: generateId(),
        from: fromName,
        fromId,
        to: toName,
        toId,
        status: 'pending',
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
    };

    db.friendRequests.push(request);
    await writeDB(db);

    res.status(201).json(request);
});

// Update friend request
app.patch('/api/friend-requests/:id', async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const db = await readDB();
    const request = db.friendRequests.find(r => r.id === req.params.id);

    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    request.updatedAt = new Date().toISOString();

    await writeDB(db);
    res.json(request);
});

// ===== SEARCH ROUTE =====

// Search users
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    const db = await readDB();
    
    if (!q) {
        return res.json([]);
    }

    const query = q.toLowerCase();
    const results = db.users
        .filter(user => user.username.toLowerCase().includes(query))
        .map(({ passwordHash, ...user }) => user);

    res.json(results);
});

// ===== MESSAGE ROUTES =====

// Get messages between two users
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;
    const db = await readDB();
    
    const messages = (db.messages || []).filter(msg => 
        (msg.fromId === userId1 && msg.toId === userId2) ||
        (msg.fromId === userId2 && msg.toId === userId1)
    ).sort((a, b) => a.timestamp - b.timestamp);

    res.json(messages);
});

// Send a message
app.post('/api/messages', async (req, res) => {
    const { fromId, toId, message } = req.body;

    if (!fromId || !toId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();

    const newMessage = {
        id: generateId(),
        fromId,
        toId,
        message,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
    };

    if (!db.messages) {
        db.messages = [];
    }

    db.messages.push(newMessage);
    await writeDB(db);

    res.status(201).json(newMessage);
});

// Mark messages as read
app.patch('/api/messages/read', async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();
    
    if (!db.messages) {
        db.messages = [];
    }

    db.messages.forEach(msg => {
        if (msg.fromId === friendId && msg.toId === userId) {
            msg.read = true;
        }
    });

    await writeDB(db);
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Database file: ${DB_FILE}`);
});
