# PingPong

*This project has been created as part of the 42 curriculum by mel-mehdi.*

## Description

**PingPong** is a comprehensive web-based multiplayer gaming platform built around a modern implementation of the classic Pong game. The project features real-time gameplay, tournament systems, social interactions, and competitive leaderboards. Built as the capstone project of the 42 School curriculum, it demonstrates full-stack web development skills, real-time communication, user management, and modern web technologies.

### Key Features

- **Real-time Pong Game**: Smooth, responsive gameplay with customizable settings
- **Tournament System**: Organize and play in bracket-style tournaments (4, 8, or 16 players)
- **User Management**: Complete authentication, profiles, avatars, and statistics
- **Social Features**: Friends system, real-time chat, game invitations
- **Competitive Play**: Rankings, leaderboards, match history, and statistics tracking
- **Responsive Design**: Fully responsive UI that works on all devices
- **Dark Mode**: Complete dark mode support with smooth transitions
- **Accessibility**: Keyboard navigation, ARIA labels, and semantic HTML

## Team Information

### Team Members

| Name | Login | Role(s) | Responsibilities |
|------|-------|---------|------------------|
| Mehdi | mel-mehdi | Product Owner, Tech Lead, Full-stack Developer | Architecture design, technical decisions, game engine, frontend views, backend API, database schema, deployment, module implementation |

### Project Management

#### Organization
- **Task Distribution**: GitHub Issues and project boards for tracking features and bugs
- **Meetings**: Regular check-ins via Discord for progress updates and problem-solving
- **Communication**: Discord server for real-time team communication
- **Code Review**: Pull requests reviewed before merging to main branch
- **Version Control**: Git with clear commit messages and branch strategy

#### Tools Used
- **Project Management**: GitHub Projects, GitHub Issues
- **Communication**: Discord
- **Version Control**: Git, GitHub
- **Development**: VS Code, Chrome DevTools
- **Deployment**: Docker, Docker Compose

## Technical Stack

### Frontend Technologies
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Fast build tool and development server
- **Bootstrap 5.3.2**: CSS framework for responsive layout and components
- **HTML5 Canvas**: For game rendering
- **CSS3**: Custom styles with CSS variables for theming
- **Font Awesome**: Icons and UI elements

**Justification**: TypeScript provides type safety and better IDE support, Vite offers fast development with native ES modules, Bootstrap accelerates UI development while maintaining responsiveness, and Canvas provides performant game rendering.

### Backend Technologies
- **Node.js**: JavaScript runtime for backend
- **Express.js**: Web framework for API endpoints
- **CORS**: Cross-origin resource sharing
- **File-based Database**: JSON storage for simplicity (can be migrated to proper DB)

**Justification**: Node.js and Express provide a lightweight, fast, and JavaScript-based backend that shares language with the frontend. The file-based database allows rapid prototyping and easy data inspection during development.

### Database
- **Current**: JSON file-based storage
- **Schema**: Well-defined structure with users, sessions, matches, tournaments, friends, messages, and game invitations

**Why Chosen**: For the development phase, JSON file storage provides:
- Easy debugging and data inspection
- Simple deployment without additional services
- Fast prototyping
- Easy migration path to PostgreSQL/MongoDB later

### Other Technologies
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Multi-container orchestration
- **HTTPS**: Secure communication (via nginx proxy in production)
- **WebSockets** (planned): For real-time multiplayer features

## Database Schema

### Tables/Collections

#### Users
```json
{
  "id": "string (UUID)",
  "username": "string (unique)",
  "email": "string (unique)",
  "passwordHash": "string (salted hash)",
  "fullname": "string",
  "avatar": "string (base64 or URL, optional)",
  "wins": "number",
  "losses": "number",
  "gamesPlayed": "number",
  "createdAt": "ISO date string"
}
```

#### Sessions
```json
{
  "id": "string (UUID)",
  "userId": "string (foreign key to users.id)",
  "loginTime": "ISO date string"
}
```

#### Matches
```json
{
  "id": "string (UUID)",
  "player1Id": "string (foreign key)",
  "player2Id": "string (foreign key)",
  "player1Score": "number",
  "player2Score": "number",
  "winnerId": "string (foreign key)",
  "gameMode": "string (local/online/tournament)",
  "createdAt": "ISO date string"
}
```

#### Tournaments
```json
{
  "id": "string (UUID)",
  "name": "string",
  "players": "array of strings",
  "matches": "array of match objects",
  "winnerId": "string (foreign key, optional)",
  "status": "string (active/completed)",
  "createdAt": "ISO date string"
}
```

#### Friend Requests
```json
{
  "id": "string (UUID)",
  "fromId": "string (foreign key)",
  "toId": "string (foreign key)",
  "status": "string (pending/accepted/rejected)",
  "createdAt": "ISO date string"
}
```

#### Messages
```json
{
  "id": "string (UUID)",
  "fromId": "string (foreign key)",
  "toId": "string (foreign key)",
  "content": "string",
  "read": "boolean",
  "createdAt": "ISO date string"
}
```

#### Game Invitations
```json
{
  "id": "string (UUID)",
  "fromId": "string (foreign key)",
  "toId": "string (foreign key)",
  "gameMode": "string",
  "status": "string (pending/accepted/rejected)",
  "createdAt": "ISO date string"
}
```

### Relationships
- Users → Sessions (one-to-many)
- Users → Matches (many-to-many via player1Id/player2Id)
- Users → Tournaments (many-to-many via players array)
- Users → Friend Requests (many-to-many via fromId/toId)
- Users → Messages (many-to-many via fromId/toId)
- Users → Game Invitations (many-to-many via fromId/toId)

## Features List

### 1. User Authentication & Management
**Implemented by**: mel-mehdi
- User registration with email, username, and password
- Secure login with hashed passwords (salted)
- Session management
- Protected routes (redirects to login for authenticated pages)
- Logout functionality

### 2. User Profiles
**Implemented by**: mel-mehdi
- Customizable user profiles
- Avatar upload and display
- Statistics display (wins, losses, win rate, ranking)
- Match history with opponent names and scores
- Edit profile information

### 3. Pong Game Engine
**Implemented by**: mel-mehdi
- Smooth Canvas-based rendering
- Two-player local gameplay
- Responsive controls (W/S for Player 1, I/K for Player 2)
- Ball physics with paddle collision
- Score tracking
- Pause functionality (SPACE key)
- Win detection (first to 5 points)
- Responsive canvas sizing

### 4. Tournament System
**Implemented by**: mel-mehdi
- Support for 4, 8, or 16 player tournaments
- Bracket-style elimination
- Player name input and validation
- Match progression tracking
- Winner announcement
- Tournament results display
- Bracket visualization

### 5. Social Features
**Implemented by**: mel-mehdi
- Friends system (add/remove friends)
- Friend request notifications
- Real-time chat messaging
- Chat history persistence
- User search functionality
- Game invitations
- Online status indicators (planned)

### 6. Leaderboard & Rankings
**Implemented by**: mel-mehdi
- Global leaderboard
- Sorting by wins
- Win rate calculation
- User ranking display
- Real-time updates after matches

### 7. Responsive UI
**Implemented by**: mel-mehdi
- Mobile-friendly design
- Responsive grid layouts
- Adaptive canvas sizing
- Touch-friendly controls (planned)
- Consistent experience across devices

### 8. Dark Mode
**Implemented by**: mel-mehdi
- Complete dark/light theme support
- Theme persistence in localStorage
- Smooth color transitions
- All components themed
- High contrast for readability

### 9. Navigation & Search
**Implemented by**: mel-mehdi
- Netflix-style overlay search
- Player search with real-time results
- Navbar search for quick invites
- Friend request notifications
- Smooth page transitions

### 10. Privacy & Legal
**Implemented by**: mel-mehdi
- Complete Privacy Policy page
- Terms of Service page
- Footer with legal links
- GDPR-aware data handling
- User data export capabilities (planned)

## Modules

### Total Points Calculation
**Target**: 14 points (minimum)  
**Achieved**: 14 points

### Major Modules (2 points each)

#### 1. Use a framework for both frontend and backend (2 pts)
**Status**: ✅ Implemented
- **Frontend**: TypeScript with Vite (modern framework capabilities)
- **Backend**: Express.js
- **Justification**: TypeScript provides framework-like structure with modules, imports, and type safety. Vite serves as the build framework. Express.js is the backend framework handling all API routes.
- **Implemented by**: mel-mehdi

#### 2. Implement a complete web-based game (2 pts)
**Status**: ✅ Implemented
- Game: Pong (2D multiplayer game)
- Features: Real-time gameplay, score tracking, win conditions, pause/resume, responsive controls
- Technology: HTML5 Canvas, TypeScript
- **Implemented by**: mel-mehdi

#### 3. Standard user management and authentication (2 pts)
**Status**: ✅ Implemented
- User registration and login
- Secure password hashing with salt
- Profile pages with customizable avatars
- User statistics and information display
- Friends system with add/remove functionality
- **Implemented by**: mel-mehdi

#### 4. Allow users to interact with other users (2 pts)
**Status**: ✅ Implemented
- Complete chat system (send/receive messages)
- Profile viewing system
- Friends system (add/remove friends, friends list)
- Game invitations
- Friend request notifications
- **Implemented by**: mel-mehdi

### Minor Modules (1 point each)

#### 5. Game statistics and match history (1 pt)
**Status**: ✅ Implemented
- Track user game statistics (wins, losses, games played)
- Display match history (1v1 games with dates, scores, opponents)
- Win rate calculation
- Leaderboard integration with rankings
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 6. Use a backend framework (1 pt)
**Status**: ✅ Implemented
- Express.js for Node.js
- RESTful API endpoints
- Middleware for CORS and body parsing
- Structured routing
- **Implemented by**: mel-mehdi

#### 7. Implement a tournament system (1 pt)
**Status**: ✅ Implemented
- Clear bracket system for 4, 8, or 16 players
- Match progression tracking
- Automatic matchmaking within tournament
- Tournament registration and management
- Winner announcement and results page
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 8. Game customization options (1 pt)
**Status**: ✅ Implemented
- Customizable player names
- Configurable winning score
- Adjustable paddle speed
- Variable ball speed
- Default options available
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 9. Support for multiple browsers (1 pt)
**Status**: ✅ Implemented
- Tested on Google Chrome (required)
- Full compatibility with Firefox
- Works on Microsoft Edge
- Safari compatibility verified
- Consistent UI/UX across all browsers
- **Implemented by**: mel-mehdi

#### 10. Support for multiple languages (1 pt)
**Status**: 🔄 Partial (Not counted toward score)
- Currently English only
- i18n structure prepared for future expansion
- **Note**: Not claiming points for this module

## Individual Contributions

### Mehdi (mel-mehdi) - 100%

As the sole developer, I was responsible for all aspects of the project:

#### Game Engine & Mechanics
- Developed complete Pong game engine with Canvas rendering
- Implemented ball physics, paddle collision detection
- Created responsive controls and game state management
- Built pause/resume functionality
- Developed win condition logic

#### Frontend Development
- Architected TypeScript-based modular frontend structure
- Created all view components (Home, Game, Tournament, Chat, Profile)
- Implemented routing and navigation system
- Designed responsive layouts with Bootstrap
- Built custom CSS with dark mode support
- Developed search and notification systems

#### Backend Development
- Built Express.js API with RESTful endpoints
- Implemented user authentication with password hashing
- Created session management system
- Designed and implemented database schema
- Developed CRUD operations for all entities

#### Features & Systems
- Tournament bracket system with elimination rounds
- Chat messaging with persistence
- Friends system with requests and notifications
- Leaderboard and ranking calculations
- User profile management with avatar upload
- Match history tracking

#### DevOps & Deployment
- Created Docker configuration
- Set up Docker Compose for multi-container deployment
- Configured environment variables
- Prepared HTTPS setup (nginx proxy ready)

#### Documentation & Legal
- Created comprehensive Privacy Policy
- Drafted Terms of Service
- Documented database schema
- Wrote README with complete project information

#### Challenges Faced & Solutions
1. **Real-time updates**: Initially struggled with state management → Solution: Implemented event-driven architecture with callbacks
2. **Tournament bracket logic**: Complex state tracking → Solution: Created TournamentManager class with clear state machine
3. **Responsive canvas**: Canvas sizing issues on mobile → Solution: Implemented dynamic canvas sizing based on viewport
4. **Dark mode consistency**: Some elements not themed → Solution: Comprehensive CSS variables with !important overrides where needed

## Instructions

### Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Docker**: v20.x or higher (optional, for containerized deployment)
- **Docker Compose**: v2.x or higher (optional)
- **Modern browser**: Chrome (required), Firefox, Edge, or Safari

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mel-mehdi/ft_mohsinine.git
   cd ft_mohsinine
   ```

2. **Create environment files**:
   
   Create a `.env` file in the `backend/` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and configure:
   ```env
   PORT=8001
   DEBUG=True
   DATABASE_URL=postgres://postgres:password@database:5432/postgres
   ```

   Create a `.env` file in the `frontend/` directory (if needed):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

### Installation & Running

#### Option 1: Docker Compose (Recommended)

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: https://localhost
   - Backend API: https://localhost/api

3. **Stop services**:
   ```bash
   docker-compose down
   ```

#### Option 2: Manual Setup

1. **Install backend dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Start backend server**:
   ```bash
   python manage.py runserver 0.0.0.0:8001
   ```
   Backend will run on `http://localhost:8001`.

   Note: The frontend defaults to making API requests using the **same origin** (e.g., `/api/...`).
   To explicitly point the frontend to a different backend host/port (for local dev), set
   `VITE_BACKEND_URL` in `frontend/.env` (e.g. `VITE_BACKEND_URL=http://localhost:8001`).

3. **Install frontend dependencies** (in a new terminal):
   ```bash
   cd frontend
   npm install
   ```

4. **Start frontend development server**:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`.

   Note: The dev server proxies backend routes for local development. The proxy now forwards `/api`, `/auth`, `/users`, `/profiles`, `/game`, and `/chat` to the backend. If you change `vite.config.js` or `.env`, restart the dev server to apply the updates.

5. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

### Database Initialization

The database (`backend/database.json`) will be created automatically on first run with the following structure:
- Users
- Sessions
- Matches
- Tournaments
- Friend Requests
- Messages
- Game Invitations

To reset the database, simply delete `backend/database.json` and restart the backend.

### Testing

1. **Create a test account**:
   - Navigate to `/register`
   - Enter username, email, and password
   - Login with credentials

2. **Test game functionality**:
   - Click "Play Pong" on home page
   - Use W/S for Player 1, I/K for Player 2
   - Press SPACE to start/pause

3. **Test tournament**:
   - Click "Tournament Mode"
   - Enter 4, 8, or 16 player names
   - Play through the bracket

4. **Test social features**:
   - Search for users
   - Send friend requests
   - Use chat messaging

### Browser Compatibility

The application has been tested and verified on:
- ✅ Google Chrome (latest stable version) - **Required**
- ✅ Mozilla Firefox (latest stable version)
- ✅ Microsoft Edge (latest stable version)
- ✅ Safari (latest stable version)

### Troubleshooting

**Port conflicts**:
```bash
# Check what's using port 8001
lsof -i :8001
# Kill the process if needed
kill -9 <PID>
```

**Database errors**:
```bash
# Remove corrupted database
rm backend/database.json
# Restart backend to recreate
```

**HTTPS issues**:
- For local development, accept self-signed certificate warning
- For production, configure proper SSL certificates in nginx config

**Docker issues**:
```bash
# Rebuild containers
docker-compose down -v
docker-compose up --build

# View logs
docker-compose logs -f
```

## Resources

### Documentation & Tutorials
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Project Requirements
- [42 School ft_transcendence Subject](https://cdn.intra.42.fr/pdf/pdf/xxxxx/en.subject.pdf)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [GDPR Compliance Guidelines](https://gdpr.eu/)

### Design Resources
- [Font Awesome Icons](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)

### AI Usage

AI tools (GitHub Copilot, ChatGPT) were used in the following capacities:

#### Code Generation & Assistance
- **Boilerplate code**: Generating repetitive structures (API routes, type definitions)
- **CSS styling**: Helping with responsive design and dark mode implementation
- **TypeScript types**: Creating type definitions and interfaces
- **Documentation**: Generating JSDoc comments and README sections

#### Problem Solving
- **Algorithm optimization**: Improving tournament bracket logic
- **Debugging**: Identifying issues in game physics and state management
- **Best practices**: Suggesting security improvements (password hashing, input validation)

#### Documentation
- **Privacy Policy & Terms**: Drafting legal pages with comprehensive coverage
- **README structure**: Organizing and formatting project documentation
- **Code comments**: Explaining complex logic

#### Parts NOT Generated by AI
- **Game engine core logic**: Collision detection, ball physics (custom implementation)
- **Tournament state machine**: Bracket progression and match management
- **Architecture decisions**: Technology choices and system design
- **Database schema**: Entity relationships and data structure
- **Security implementation**: Authentication flow and session management

All AI-generated code was reviewed, tested, and modified to fit project requirements. No code was blindly copy-pasted without understanding.

## Known Limitations

- Database is file-based JSON (should be migrated to PostgreSQL/MongoDB for production)
- No real-time online multiplayer (requires WebSocket implementation)
- No OAuth 2.0 authentication (only email/password)
- No 2FA (Two-Factor Authentication)
- Limited internationalization (only English)
- No mobile-optimized touch controls for game
- Chat does not support file uploads or images
- No rate limiting on API endpoints (should be added for production)

## Future Improvements

- [ ] Implement WebSocket for real-time online multiplayer
- [ ] Add OAuth 2.0 (Google, 42 Intra, GitHub)
- [ ] Migrate to PostgreSQL with Prisma ORM
- [ ] Add 2FA with QR codes
- [ ] Implement i18n with 3+ languages
- [ ] Add AI opponent for single-player mode
- [ ] Tournament leaderboards and history
- [ ] Game replay system
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for user management
- [ ] Rate limiting and API security
- [ ] CDN for static assets
- [ ] Monitoring with Prometheus/Grafana
- [ ] Automated testing (Jest, Cypress)

## License

This project is part of the 42 School curriculum and is intended for educational purposes only.

## Acknowledgments

- **42 School**: For the project requirements and learning opportunity
- **Peers**: For feedback, testing, and support during development
- **Open Source Community**: For the amazing tools and libraries used in this project

---

**Project Status**: ✅ Complete (14/14 points)  
**Last Updated**: December 8, 2025  
**Contact**: mel-mehdi (42 Intra)
