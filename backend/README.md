# Backend Setup

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/search?q=query` - Search users

### Game Invitations
- `GET /api/invitations/:userId` - Get invitations for user
- `POST /api/invitations` - Send invitation
- `PATCH /api/invitations/:id` - Update invitation status

### Friend Requests
- `GET /api/friend-requests/:userId` - Get friend requests
- `POST /api/friend-requests` - Send friend request
- `PATCH /api/friend-requests/:id` - Update request status

## Database

Data is stored in `database.json` file.
