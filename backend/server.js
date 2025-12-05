const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const SALT_ROUNDS = 10;

const DB_SCHEMA = {
    users: [],
    sessions: [],
    gameInvitations: [],
    friendRequests: [],
    matches: [],
    tournaments: [],
    messages: []
};

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const db = JSON.parse(data);
        
        return { ...DB_SCHEMA, ...db };
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Database file not found, creating new one...');
            await writeDB(DB_SCHEMA);
            return { ...DB_SCHEMA };
        }
        console.error('Error reading database:', error);
        return { ...DB_SCHEMA };
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        throw new Error('Failed to write database');
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function sanitizeUser(user) {
    const { passwordHash, ...userData } = user;
    return userData;
}

app.get('/api/users', async (req, res) => {
    try {
        const db = await readDB();
        const users = db.users.map(sanitizeUser);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const db = await readDB();
        const user = db.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(sanitizeUser(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const db = await readDB();

        const existingUser = db.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() || 
            u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingUser) {
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = {
            id: generateId(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            fullname: username.trim(),
            passwordHash: hashPassword(password),
            avatar: null,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        await writeDB(db);

        console.log(`✅ User registered: ${username}`);
        res.status(201).json(sanitizeUser(newUser));
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        const db = await readDB();
        const user = db.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() || 
            u.email.toLowerCase() === username.toLowerCase()
        );

        if (!user || user.passwordHash !== hashPassword(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const session = {
            id: generateId(),
            userId: user.id,
            loginTime: new Date().toISOString()
        };

        db.sessions.push(session);
        await writeDB(db);

        console.log(`✅ User logged in: ${user.username}`);
        res.json({ user: sanitizeUser(user), sessionId: session.id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/invitations/:userId', async (req, res) => {
    try {
        const db = await readDB();
        const invitations = db.gameInvitations.filter(
            inv => inv.toId === req.params.userId || inv.fromId === req.params.userId
        );
        res.json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ error: 'Failed to fetch invitations' });
    }
});

app.post('/api/invitations', async (req, res) => {
    try {
        const { fromId, fromName, toId, toName } = req.body;

        if (!fromId || !toId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (fromId === toId) {
            return res.status(400).json({ error: 'Cannot invite yourself' });
        }

        const db = await readDB();

        const existingInvitation = db.gameInvitations.find(
            inv => inv.fromId === fromId && inv.toId === toId && inv.status === 'pending'
        );
        
        if (existingInvitation) {
            return res.status(400).json({ error: 'Invitation already sent' });
        }

        const invitation = {
            id: generateId(),
            from: fromName || 'Unknown',
            fromId,
            to: toName || 'Unknown',
            toId,
            type: 'game',
            status: 'pending',
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        db.gameInvitations.push(invitation);
        await writeDB(db);

        console.log(`✅ Game invitation sent: ${fromName} -> ${toName}`);
        res.status(201).json(invitation);
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ error: 'Failed to send invitation' });
    }
});

app.patch('/api/invitations/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const db = await readDB();
        const invitation = db.gameInvitations.find(inv => inv.id === req.params.id);

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        invitation.status = status;
        invitation.updatedAt = new Date().toISOString();

        await writeDB(db);
        console.log(`✅ Invitation ${status}: ${invitation.from} -> ${invitation.to}`);
        res.json(invitation);
    } catch (error) {
        console.error('Error updating invitation:', error);
        res.status(500).json({ error: 'Failed to update invitation' });
    }
});

app.get('/api/friend-requests/:userId', async (req, res) => {
    try {
        const db = await readDB();
        const requests = db.friendRequests.filter(
            req => req.toId === req.params.userId || req.fromId === req.params.userId
        );
        res.json(requests);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
});

app.post('/api/friend-requests', async (req, res) => {
    try {
        const { fromId, fromName, toId, toName } = req.body;

        if (!fromId || !toId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (fromId === toId) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        const db = await readDB();

        const existingRequest = db.friendRequests.find(
            req => (req.fromId === fromId && req.toId === toId) || 
                   (req.fromId === toId && req.toId === fromId)
        );
        
        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already exists' });
        }

        const request = {
            id: generateId(),
            from: fromName || 'Unknown',
            fromId,
            to: toName || 'Unknown',
            toId,
            status: 'pending',
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        db.friendRequests.push(request);
        await writeDB(db);

        console.log(`✅ Friend request sent: ${fromName} -> ${toName}`);
        res.status(201).json(request);
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

app.patch('/api/friend-requests/:id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const db = await readDB();
        const request = db.friendRequests.find(r => r.id === req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        request.status = status;
        request.updatedAt = new Date().toISOString();

        await writeDB(db);
        console.log(`✅ Friend request ${status}: ${request.from} -> ${request.to}`);
        res.json(request);
    } catch (error) {
        console.error('Error updating friend request:', error);
        res.status(500).json({ error: 'Failed to update friend request' });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        const db = await readDB();
        
        if (!q || q.trim().length === 0) {
            return res.json([]);
        }

        const query = q.toLowerCase().trim();
        const results = db.users
            .filter(user => user.username.toLowerCase().includes(query))
            .map(sanitizeUser)
            .slice(0, 20); 

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

app.get('/api/messages/:userId1/:userId2', async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        
        if (!userId1 || !userId2) {
            return res.status(400).json({ error: 'Missing user IDs' });
        }

        const db = await readDB();
        
        const messages = (db.messages || []).filter(msg => 
            (msg.fromId === userId1 && msg.toId === userId2) ||
            (msg.fromId === userId2 && msg.toId === userId1)
        ).sort((a, b) => a.timestamp - b.timestamp);

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { fromId, toId, message } = req.body;

        if (!fromId || !toId || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        if (message.length > 1000) {
            return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
        }

        const db = await readDB();

        const newMessage = {
            id: generateId(),
            fromId,
            toId,
            message: message.trim(),
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
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.patch('/api/messages/read', async (req, res) => {
    try {
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = await readDB();
        
        if (!db.messages) {
            db.messages = [];
        }

        let updatedCount = 0;
        db.messages.forEach(msg => {
            if (msg.fromId === friendId && msg.toId === userId && !msg.read) {
                msg.read = true;
                updatedCount++;
            }
        });

        await writeDB(db);
        res.json({ success: true, updatedCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

app.listen(PORT, async () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 Backend Server Started`);
    console.log(`${'='.repeat(50)}`);
    console.log(`🌐 URL: http:
    console.log(`📊 Database: ${DB_FILE}`);
    console.log(`⏱️  Started at: ${new Date().toLocaleString()}`);
    console.log(`${'='.repeat(50)}\n`);

    await readDB();
});
