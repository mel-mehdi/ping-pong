# Setup Guide - Shared Database Backend

## What Changed?

Now you have a **real backend server** with a **shared database** that works across all browsers!

## Installation

1. **Install Node.js** (if not installed): https://nodejs.org/

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

## Running the Application

### Option 1: Run everything (recommended)
```bash
make all
```

This starts both backend (port 3000) and frontend (port 8000).

### Option 2: Run separately
Terminal 1:
```bash
make backend
```

Terminal 2:
```bash
make frontend
```

## Stop Servers

```bash
make kill
```

## How It Works

- **Backend API**: `http://localhost:3000` - Shared database server
- **Frontend**: `http://localhost:8000` - Your web app
- **Database**: `backend/database.json` - Stores all data (shared across browsers!)

## Testing Multi-Browser

Now you can:
1. Open **Chrome**: Login as user1, send invitation
2. Open **Firefox**: Login as user2, see the invitation!
3. Both browsers share the same database ✅

## API Client

Frontend now uses `api.js` to communicate with backend:
- Registration → Backend API
- Login → Backend API  
- Search → Backend API
- Invitations → Backend API (shared!)
- Friend requests → Backend API (shared!)

## Next Steps

To use the API in your frontend, update files to import:
```javascript
import api from './utils/api.js';

// Example usage:
const users = await api.getAllUsers();
const result = await api.register(username, email, password);
await api.sendInvitation(fromId, fromName, toId, toName);
```

## Benefits

✅ Works across all browsers
✅ Data persists after page refresh
✅ Real-time updates possible
✅ Multiple users can interact
✅ Centralized data management
