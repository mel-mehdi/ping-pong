# PingPong

*This project has been created as part of the 42 curriculum by mel-mehdi, szeroual, ael-bouz, amabchou*

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
- **AI Opponent System**: Play against intelligent CPU opponents with three difficulty levels
- **Advanced AI**: Ball trajectory prediction, error modeling, and reaction time simulation


## Team Information

### Team Members

| Name | Login | Role(s) | Responsibilities |
|------|-------|---------|------------------|
| El Mehdi | mel-mehdi | Product Owner, Full-stack Developer | Frontend, Game Engine, User Management, Tournaments|
| Sanaa | szeroual | AI Developer | AI opponent system, ball trajectory prediction, difficulty levels, error modeling, reaction time simulation |
| Abdellatif  | ael-bouz | Backend Developer | WebSockets, Public API, ORM, Real-time features |
| Assia | amabchou | DevOps Engineer | Monitoring, Prometheus, Grafana, health checks, infrastructure security |
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
- **React**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Bootstrap 5.3.2**: CSS framework for responsive layout and components
- **HTML5 Canvas**: For game rendering
- **CSS3**: Custom styles with CSS variables for theming
- **Font Awesome**: Icons and UI elements
- **i18n**: Internationalization with 3 languages (EN, FR, ES)

**Justification**: React provides a modern component-based architecture, Vite offers fast development with native ES modules, Bootstrap accelerates UI development while maintaining responsiveness, and Canvas provides performant game rendering.

### Backend Technologies
- **Python**: Programming language for backend
- **Django**: Full-featured web framework
- **Django REST Framework**: RESTful API toolkit
- **Django Channels**: WebSocket support for real-time features
- **Daphne**: ASGI server for WebSocket connections
- **PostgreSQL**: Relational database
- **Redis**: Channel layer for WebSocket messaging

**Justification**: Django provides a robust, secure, and scalable backend with built-in ORM, authentication, and admin panel. Django Channels enables real-time WebSocket features for chat, notifications, and multiplayer gaming.

### Database
- **Current**: PostgreSQL with Django ORM
- **Schema**: Well-defined models with users, profiles, matches, tournaments, friendships, messages, notifications, and achievements

**Why Chosen**: PostgreSQL provides:
- ACID compliance and data integrity
- Scalable performance for production
- Django ORM integration for efficient queries
- Migration support for schema changes

### Monitoring & Infrastructure
- **Prometheus**: Time-series database for metrics collection via HTTP/HTTPS scraping.
- **Grafana**: Visualization platform for infrastructure and application health dashboards.
- **cAdvisor**: Provides container resource usage and performance metrics.
- **Node Exporter**: Exports hardware and OS metrics from the host/containers.
- **Postgres/Redis Exporters**: Dedicated exporters for database performance monitoring.

**Justification**: This stack provides deep observability into the entire system. Prometheus allows us to monitor Django application-level metrics (using django-prometheus) alongside hardware and container-level data, while Grafana provides a centralized control center for real-time troubleshooting.

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

### 11. AI Opponent System
**Implemented by**: szeroual
- Three difficulty levels: Easy, Medium, Hard
- Ball trajectory prediction algorithm
- AI error modeling for realistic mistakes
- Reaction time simulation
- Adaptive paddle movement based on difficulty
- Integration with game engine for single-player mode
- Configurable AI parameters (speed, error amount, reaction value, prediction strength)

## Modules

### Total Points Calculation
**Target**: 14 points (minimum)  
**Achieved**: 26 points

### Major Modules (2 points each)

#### 1. Use a framework for both frontend and backend (2 pts)
**Status**: ✅ Implemented
- **Frontend**: React with Vite
- **Backend**: Django with Django REST Framework
- **Justification**: React provides a modern component-based frontend framework. Django is a full-featured backend framework with built-in ORM, authentication, and admin panel.
- **Implemented by**: mel-mehdi, ael-bouz

#### 2. Implement a complete web-based game (2 pts)
**Status**: ✅ Implemented
- Game: Pong (2D multiplayer game)
- Features: Real-time gameplay, score tracking, win conditions, pause/resume, responsive controls
- Technology: HTML5 Canvas, React
- **Implemented by**: mel-mehdi

#### 3. Standard user management and authentication (2 pts)
**Status**: ✅ Implemented
- User registration and login
- Secure password hashing with Django's authentication
- Profile pages with customizable avatars
- User statistics and information display
- Friends system with add/remove functionality
- Online status tracking
- **Implemented by**: mel-mehdi, ael-bouz

#### 4. Allow users to interact with other users (2 pts)
**Status**: ✅ Implemented
- Basic chat system (send/receive messages)
- Profile viewing system
- Friends system (friends list)
- Game invitations
- Friend request notifications
- **Implemented by**: mel-mehdi

#### 5. Implement real-time features using WebSockets (2 pts)
**Status**: ✅ Implemented
- Django Channels with ASGI server (Daphne)
- Real-time chat messaging via WebSocket
- Real-time game state synchronization
- Real-time notifications
- Connection/disconnection handling
- User online status updates
- **Implemented by**: ael-bouz

#### 6. Public API with secured API key (2 pts)
**Status**: ✅ Implemented
- Secured API key authentication system
- Rate limiting per API key
- API key management (create, revoke, toggle)
- Endpoints: GET /api/leaderboard/, GET /api/tournaments/, POST /api/tournaments/, PUT /api/tournaments/{id}/, DELETE /api/tournaments/{id}/
- **Implemented by**: ael-bouz

#### 7. Implement AI opponent (2 pts)
**Status**: ✅ Implemented
- Three difficulty levels (Easy, Medium, Hard)
- Ball trajectory prediction algorithm
- Error modeling for realistic AI behavior
- Reaction time simulation
- Adaptive AI with configurable parameters
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: szeroual

#### 8. Remote players - Online multiplayer (2 pts)
**Status**: ✅ Implemented
- Two players on separate computers can play in real-time
- WebSocket-based game synchronization via Django Channels
- Matchmaking queue system
- Network latency handling
- Reconnection logic for disconnections
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 9. Monitoring system with Prometheus and Grafana (2 pts)
**Status**: ✅ Implemented

**Prometheus Configuration:**
- Multi-target scraping from 6 core services
- Django backend metrics (HTTPS on port 8001) via `django-prometheus`
- Container metrics via cAdvisor (port 8080)
- System metrics via Node Exporter (port 9100)
- PostgreSQL metrics via postgres_exporter (port 9187)
- Redis metrics via redis_exporter (port 9121)

**Grafana Dashboards** (accessible on port 3001):
- Memory/CPU usage per container
- Django HTTP request volume and latency
- Database connection health and query performance
- Cache hit ratios and Redis performance

**Security:** SSL/TLS scraping for backend service metrics

**Challenges Solved:**
- Configured Prometheus with `scheme: https` and `insecure_skip_verify: true` for self-signed certificates
- Resolved cAdvisor port conflicts by remapping to host port 8003
- **Implemented by**: amabchou

### Minor Modules (1 point each)

#### 10. Game statistics and match history (1 pt)
**Status**: ✅ Implemented
- Track user game statistics (wins, losses, games played)
- Display match history (1v1 games with dates, scores, opponents)
- Win rate calculation
- Leaderboard integration with rankings
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 11. Implement a tournament system (1 pt)
**Status**: ✅ Implemented
- Clear bracket system for 4, 8, or 16 players
- Match progression tracking
- Automatic matchmaking within tournament
- Tournament registration and management
- Winner announcement and results page
- **Requirement**: Requires game module (Pong) - ✅ Met
- **Implemented by**: mel-mehdi

#### 12. Gamification system (1 pt)
**Status**: ✅ Implemented
- Achievements system with 10+ achievement types
- XP rewards for achievements
- Level progression system (XP-based)
- Leaderboard with rankings
- Achievement notifications
- Persistent storage in database
- **Implemented by**: mel-mehdi

#### 13. Support for multiple languages (1 pt)
**Status**: ✅ Implemented
- i18n internationalization system
- 3 complete language translations (English, French, Spanish)
- Language switcher in the UI
- All user-facing text is translatable
- **Implemented by**: mel-mehdi

#### 14. OAuth 2.0 - Google Authentication (1 pt)
**Status**: ✅ Implemented
- Google OAuth 2.0 integration
- Token verification with google-auth library
- Automatic user creation for new Google users
- Seamless login experience
- **Implemented by**: mel-mehdi, ael-bouz

#### 15. Complete notification system (1 pt)
**Status**: ✅ Implemented
- Real-time WebSocket notifications
- Friend request notifications
- Game invitation notifications
- Achievement unlock notifications
- Mark as read functionality
- Notification persistence in database
- **Implemented by**: mel-mehdi, ael-bouz

#### 16. Use an ORM (1 pt)
**Status**: ✅ Implemented
- Django ORM for database operations
- Model definitions for all entities (User, Match, Tournament, etc.)
- Database migrations for schema management
- QuerySet API for efficient data retrieval
- **Implemented by**: ael-bouz


## Individual Contributions

### Mehdi (mel-mehdi) - ~40%

As the Product Owner and Full-stack Developer, I was responsible for the core game and user-facing features:

#### Game Engine & Mechanics
- Developed complete Pong game engine with Canvas rendering
- Implemented ball physics, paddle collision detection
- Created responsive controls and game state management
- Built pause/resume functionality
- Developed win condition logic

#### Frontend Development
- Architected React-based modular frontend structure with Vite
- Created all view components (Home, Game, Tournament, Chat, Profile)
- Implemented routing and navigation system
- Designed responsive layouts with Bootstrap 5
- Built custom CSS with dark mode support
- Developed search and notification systems
- Implemented i18n with 3 languages (EN, FR, ES)

#### Backend Development
- Collaborated on Django REST Framework API endpoints
- Implemented user authentication with Django's auth system
- Created session management system
- Designed and implemented database schema with Django ORM
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

### Sanaa (szeroual) - ~15%

As the AI Developer, responsible for designing and implementing the intelligent AI opponent system (Major module: 2 pts):

#### AI Opponent System Implementation

**Ball Trajectory Prediction Algorithm** (`ai_predect.py`)
- Implements predictive collision detection by simulating ball physics
- Iteratively calculates ball position based on velocity vectors (vx, vy)
- Accounts for wall bounces (top/bottom screen boundaries)
- Returns predicted paddle target Y-coordinate for ball collision
- Core algorithm: Simulates ball movement until it reaches CPU paddle X position, accounting for reflections

**Error Modeling System** (`ai_error.py`)
- Introduces human-like imperfection in AI decision-making
- Applies configurable random errors to predicted target positions
- Different error amounts per difficulty level (Easy: ±40px, Medium: ±20px, Hard: ±5px)
- Makes AI beatable and provides skill progression

**Reaction Time Simulation** (`ai_reaction.py`)
- Simulates human reaction delays using probability-based activation
- Configurable reaction values per difficulty:
  - Easy: 30% chance to react (slower responses)
  - Medium: 60% chance to react
  - Hard: 90% chance to react (near-perfect reactivity)
- Implemented using `random.random()` for realistic behavior

**Difficulty System Architecture** (`difficulty.py`)
- Three balanced difficulty levels with independent parameters:
  - **Easy**: Speed 6, Error ±40px, Reaction 30%, Prediction 0.1 (minimal prediction strength)
  - **Medium**: Speed 8, Error ±20px, Reaction 60%, Prediction 0.3
  - **Hard**: Speed 12, Error ±5px, Reaction 90%, Prediction 0.7 (strong prediction)
- Configurable parameters allow fine-tuning for game balance

**AI Decision Engine** (`cpu_ai.py`)
- Main orchestrator combining all AI components:
  1. Check if AI should react based on reaction probability
  2. Predict ball trajectory to get target Y position
  3. Apply prediction strength scaling for difficulty variation
  4. Add human-like errors to target position
  5. Compare paddle center with target and return direction (-1, 0, +1)
- Returns paddle movement direction: -1 (up), 0 (stationary), +1 (down)

#### Technical Challenges & Solutions
1. **Precise trajectory prediction**: Ball velocity changes due to paddle collisions → Solution: Iteratively simulated physics until ball reaches CPU paddle X position
2. **Balancing difficulty**: AI was too perfect or too weak → Solution: Implemented multi-parameter difficulty system with speed, error, reaction, and prediction strength
3. **Realistic human behavior**: AI movements appeared robotic → Solution: Combined reaction delays with error modeling to create believable AI mistakes
4. **Integration with game engine**: AI predictions needed to work with canvas-based physics → Solution: Tightly integrated with game physics calculations

#### Integration Points
- Integrated with `game_engine.py` for single-player AI-opponent mode
- Works with game physics system for accurate ball trajectory calculation
- Configurable difficulty selection in game mode settings
- Seamless integration with existing game score tracking and win conditions

### Abdellatif (ael-bouz) - ~25%

As the Backend Developer, responsible for real-time features, API development, and database integration:

#### WebSocket Implementation
- Implemented Django Channels for real-time communication
- Set up Daphne ASGI server for WebSocket connections
- Configured Redis as channel layer for message passing
- Created WebSocket consumers for chat, notifications, and game sync
- Handled connection/disconnection events and user status tracking

#### Public API Development
- Designed and implemented secured Public API with API key authentication
- Created API key management system (create, revoke, toggle)
- Implemented rate limiting per API key
- Developed RESTful endpoints for leaderboard and tournaments
- Documented API endpoints and usage

#### Database & ORM
- Configured PostgreSQL database integration
- Implemented Django ORM models for all entities
- Created database migrations for schema management
- Optimized QuerySet operations for performance
- Implemented data validation and integrity constraints

#### Authentication & OAuth
- Collaborated on Google OAuth 2.0 integration
- Implemented token verification with google-auth library
- Created automatic user creation flow for OAuth users

#### Technical Challenges & Solutions
1. **WebSocket scaling**: Multiple connections causing memory issues → Solution: Implemented Redis channel layer for efficient message distribution
2. **API security**: Preventing unauthorized access → Solution: Created robust API key system with rate limiting
3. **Real-time sync**: Game state consistency across clients → Solution: Server-authoritative game state with WebSocket broadcasts

### Assia (amabchou) - ~15%

#### Monitoring & Observability Infrastructure

**Prometheus Configuration**
- Configured `prometheus.yml` with multi-target scraping from 6 core services:
  - **Django Backend**: HTTPS scraping on port 8001 using `django-prometheus` middleware
  - **cAdvisor**: Container resource metrics (CPU, memory, network, disk) on port 8080
  - **Node Exporter**: Host/container OS metrics on port 9100
  - **PostgreSQL Exporter**: Database performance metrics (connections, queries, cache) on port 9187
  - **Redis Exporter**: Cache metrics (hit rate, memory usage) on port 9121
  - **Grafana**: Self-monitoring metrics on port 3001
- **Scraping Configuration**:
  - Configured `scheme: https` for Django backend
  - Added `insecure_skip_verify: true` for self-signed development certificates
  - Set appropriate scrape intervals (15s for critical services, 30s for others)

**Grafana Dashboard Development**
  - Unified Service Monitoring: Developed a centralized Command Center on port 3001 that aggregates data from 6 distinct scrape jobs defined in Prometheus:

     * Backend Health (Django): Monitors the Daphne ASGI server via HTTPS (port 8001), tracking basic HTTP response codes and endpoint availability.

     * Container Analytics (cAdvisor): Visualizes real-time CPU and Memory consumption across all running containers to prevent resource bottlenecks.

     * Hardware Metrics (Node Exporter): Tracks host-level performance including disk I/O and network traffic.

  - Database & Cache Oversight:
     * PostgreSQL: Monitors active connection counts and database uptime via postgres_exporter.

     * Redis: Tracks memory footprints and cache layer stability via redis_exporter.

  - Infrastructure Alerting: Configured baseline alerts to notify the team of service downtime or critical resource exhaustion:

     * Service "Up" Status: Immediate alerts if any core service (Database, Redis, or Backend) stops responding to Prometheus scrapes.

     * Resource Thresholds: Monitoring for memory usage spikes (>80%) that could lead to container crashes.

**Infrastructure Security**
- Implemented SSL/TLS scraping for Django backend metrics
- Handled self-signed certificate validation in Prometheus
- Secured Grafana with admin credentials

**Docker Networking Configuration**
- Resolved container networking issues for Prometheus scraping
- Configured `container_name` resolution across the `transcendence_network`
- Ensured all services accessible via internal container names (e.g., `backend`, `redis`, `postgres`)
- Re-mapped cAdvisor to host port 8003 to avoid conflicts while maintaining internal port 8080

#### Technical Challenges & Solutions

1. **Django HTTPS Scraping Issue**
   - **Challenge**: Django running on HTTPS/Daphne caused "Connection Refused" for Prometheus
   - **Solution**: Configured Prometheus with `scheme: https` and `insecure_skip_verify: true` to handle self-signed development certificates. For production, this would use proper CA certificates.

2. **cAdvisor Port Conflicts**
   - **Challenge**: cAdvisor default port 8080 conflicted with other services
   - **Solution**: Re-mapped cAdvisor to host port 8003 using `ports: "8003:8080"` while maintaining internal communication on port 8080 for Prometheus scraping

3. **Container Name Resolution**
   - **Challenge**: Prometheus couldn't reach containers by name across Docker network
   - **Solution**: Ensured all containers connected to `transcendence_network` and used `container_name` for consistent DNS resolution (e.g., `targets: ['backend:8001']`)

4. **Metric Cardinality Issues**
   - **Challenge**: Too many unique metric labels caused Prometheus memory bloat
   - **Solution**: Limited label cardinality by aggregating low-level metrics and dropping unused labels in Prometheus configuration

5. **Dashboard Performance**
   - **Challenge**: Grafana dashboards slow with high-resolution time series data
   - **Solution**: Implemented query downsampling for older data, used Prometheus recording rules for pre-aggregated metrics

#### Monitoring Coverage
- **Application Layer**: Django request metrics, error tracking, endpoint latency
- **Container Layer**: cAdvisor resource usage (CPU, memory, network I/O)
- **System Layer**: Node Exporter OS metrics (disk usage, system load)
- **Database Layer**: PostgreSQL performance (connection pools, query performance)
- **Cache Layer**: Redis performance (hit rates, memory usage)

#### Documentation & Knowledge Transfer
- Created monitoring setup documentation
- Documented Prometheus scrape configuration
- Provided Grafana dashboard JSON exports
- Documented alert thresholds and escalation procedures

## Instructions

### Prerequisites

Before running the project, ensure you have the following installed:

- **Docker**: v20.x or higher
- **Docker Compose**: v2.x or higher
- **Make**: For running Makefile commands
- **Modern browser**: Chrome (required), Firefox, Edge, or Safari

For manual setup (without Docker):
- **Python**: v3.10 or higher
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis**: v7.x or higher

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mel-mehdi/ft_mohsinine.git
   cd ft_mohsinine
   ```

2. **Generate SSL certificates**:
   ```bash
   ./generate-ssl.sh
   ```
   This creates self-signed certificates for local HTTPS development.

3. **Create environment files** (optional - defaults are provided):
   
   The project uses environment variables configured in `docker-compose.yml`. For custom configuration, you can create `.env` files in `backend/` and `frontend/` directories.

### Installation & Running

#### Option 1: Docker Compose (Recommended)

1. **Build and start all services**:
   ```bash
   make
   ```
   Or use docker-compose directly:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: https://localhost:8443
   - Backend API: https://localhost:8443/api
   - Accept the self-signed certificate warning in your browser

3. **Useful Makefile commands**:
   ```bash
   make up       # Start containers
   make down     # Stop containers
   make re       # Rebuild and restart
   make logs     # View container logs
   make clean    # Remove containers and volumes
   ```

4. **Stop services**:
   ```bash
   make down
   # or
   docker-compose down
   ```

#### Option 2: Manual Setup

1. **Start PostgreSQL and Redis** (required services):
   ```bash
   # Using Docker for databases only
   docker-compose up -d database redis
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Start backend server** (Django with Daphne for WebSockets):
   ```bash
   daphne -b 0.0.0.0 -p 8001 config.asgi:application
   ```
   Backend will run on `http://localhost:8001`.

5. **Install frontend dependencies** (in a new terminal):
   ```bash
   cd frontend
   npm install
   ```

6. **Start frontend development server**:
   ```bash
   npm run dev
   ```
   Frontend will run on `https://localhost:8443`.

7. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

### Database Management

The project uses **PostgreSQL** with Django ORM. Database is automatically initialized when containers start.

**Run migrations**:
```bash
# Inside Docker
docker-compose exec backend python manage.py migrate

# Manual setup
python manage.py migrate
```

**Create a superuser** (for Django admin):
```bash
docker-compose exec backend python manage.py createsuperuser
```

**Reset database**:
```bash
make clean  # This removes all volumes including database
make build  # Rebuild with fresh database
```

### Testing

1. **Create a test account**:
   - Navigate to https://localhost:8443/register
   - Enter username, email, and password
   - Or use Google OAuth to sign in

2. **Test game functionality**:
   - Click "Play" on home page
   - Choose local game, AI opponent, or online matchmaking
   - Use W/S for Player 1, Arrow keys for Player 2
   - Press SPACE to start/pause

3. **Test online multiplayer**:
   - Open two browser windows (or use two devices)
   - Login with different accounts
   - Click "Play Online" to join matchmaking queue
   - Game starts when two players are matched

4. **Test tournament**:
   - Navigate to Tournaments page
   - Create or join a tournament
   - Play through the bracket

5. **Test social features**:
   - Search for users
   - Send friend requests
   - Use real-time chat messaging

6. **Test monitoring dashboard**:
   - Navigate to http://localhost:3001
   - Login using credentials defined in environment variables:
     - Username: Value of `GF_SECURITY_ADMIN_USER`
     - Password: Value of `GF_SECURITY_ADMIN_PASSWORD`
   - View real-time metrics and alerts

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
# Reset database (removes all data)
make clean
make build

# Or manually reset migrations
docker-compose exec backend python manage.py migrate --run-syncdb
```

**WebSocket connection issues**:
```bash
# Check Redis is running
docker-compose ps redis

# Restart backend to reconnect
docker-compose restart backend
```

**HTTPS issues**:
- For local development, accept self-signed certificate warning
- Regenerate certificates: `./generate-ssl.sh`
- For production, configure proper SSL certificates in nginx config

**Docker issues**:
```bash
# Rebuild containers from scratch
make clean
make build

# View logs
make logs
# or
docker-compose logs -f backend
```

## Resources

### Documentation & Tutorials
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Channels](https://channels.readthedocs.io/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Docker Documentation](https://docs.docker.com/)
- [How to make a simple Game AI for Pong](https://www.youtube.com/watch?v=_evDO_Xvir4)
- [Tutorial covering building a Pong game with AI in Python and Pygame](https://www.toolify.ai/ai-news/learn-to-code-pong-game-in-10-mins-with-ai-python-pygame-tutorial-783877?utm_source=chatgpt.com)
- [Python Official Documentation: ](https://docs.python.org/3/) Used for understanding Python classes, modules, and the `random` module for AI logic.  
- [Python Random Module Documentation:](https://docs.python.org/3/library/random.html) Used to simulate AI reaction delays and human-like errors.  


### Project Requirements
- [42 School ft_transcendence Subject](https://cdn.intra.42.fr/pdf/pdf/xxxxx/en.subject.pdf)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [GDPR Compliance Guidelines](https://gdpr.eu/)

### Design Resources
- [Font Awesome Icons](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)

### Monitoring & DevOps Resources
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/) Used for configuring scrape jobs and alert rules.
- [Grafana Documentation](https://grafana.com/docs/) Guidance on building the centralized Command Center for infrastructure visualization.
- [cAdvisor (Container Advisor)](https://github.com/google/cadvisor) Reference for exporting resource usage and performance data from running containers.
- [Node Exporter](https://github.com/prometheus/node_exporter) Documentation for monitoring host hardware and OS metrics.
- [PostgreSQL Exporter](https://github.com/prometheus-community/postgres_exporter) — Guide for collecting database-specific performance metrics.
- [Redis Exporter](https://github.com/oliver006/redis_exporter) Reference for monitoring the Redis cache and channel layer health.
- [django-prometheus](https://github.com/korfuri/django-prometheus) Used to export application-level metrics from the Django backend to Prometheus.
- [How Prometheus Monitoring works | Prometheus Architecture explained](https://www.youtube.com/watch?v=h4Sl21AKiDg&t=31s&pp=ygUTcHJvbWV0aGV1cyB0dXRvcmlhbA%3D%3D) A comprehensive technical deep dive into Prometheus architecture, covering data retrieval (pull vs. push), time-series storage, and integration with exporters and Grafana.

### Infrastructure Standards
- [Docker Network Overview](https://docs.docker.com/network/) Reference for configuring the transcendence_network and internal service resolution.
- [Prometheus TLS Configuration](https://prometheus.io/docs/guides/tls-encryption/) Guidance on configuring secure HTTPS scraping for the backend.

### AI Development Resources
- [Python Official Documentation:](https://docs.python.org/3/) Classes, modules, and algorithms
- [Python Random Module:](https://docs.python.org/3/library/random.html) Reaction delays and error simulation
- [Game AI Fundamentals:](http://www.gameaipro.com/) Classic Pong AI techniques for trajectory prediction and difficulty scaling
- [Physics Simulation:](https://www.google.com/search?q=https://www.gamedeveloper.com/design/the-physics-of-pong) Velocity and collision-based movement calculations
- [YouTube Tutorial: "How to make a simple Game AI for Pong"](https://www.youtube.com/watch?v=_evDO_Xvir4) Reference for ball prediction algorithms

### AI Usage

This section details how AI tools and algorithms were used throughout the project, distinguishing between AI-assisted development and custom AI algorithm implementation.

#### AI Algorithms Implemented (Sanaa - szeroual)

The AI opponent system implements several core algorithms from game AI theory:

**1. Ball Trajectory Prediction**
- **Purpose**: Predict where the ball will be when it reaches the CPU paddle
- **Algorithm**: Physics-based simulation with iterative position calculation
- **Implementation**: Accounts for ball velocity, paddle position, and wall bounces
- **References**: Classic Pong AI algorithm from game development literature

**2. Error Modeling**
- **Purpose**: Introduce human-like imperfection to create realistic difficulty scaling
- **Algorithm**: Random error application with configurable bounds
- **Implementation**: Random distribution of errors applied to target position
- **Difficulty Progression**: Error ranges from ±5px (Hard) to ±40px (Easy)

**3. Reaction Time Simulation**
- **Purpose**: Simulate delayed human reflexes
- **Algorithm**: Probability-based decision activation
- **Implementation**: Random number generator with difficulty-based thresholds
- **Effect**: Varies from 30% (Easy) to 90% (Hard) successful reactions

**4. Multi-Parameter Difficulty System**
- **Purpose**: Create smooth difficulty progression without making AI feel cheap
- **Parameters**: Speed, Error Amount, Reaction Probability, Prediction Strength
- **Balance**: Each difficulty level is independently tuned for fair competitive play

**Justification of AI Choices**
- **Why trajectory prediction**: Allows AI to make intelligent paddle positioning decisions based on ball physics
- **Why error modeling**: Creates skill progression without requiring complete AI rewrites; maintains playability
- **Why reaction delays**: Makes AI behavior feel more human and less perfect; adds strategic depth
- **Why multi-parameter system**: Provides fine-grained difficulty control for competitive balance and player progression

#### AI Tools Used for Code Assistance

GitHub Copilot and ChatGPT were used for:

**Code Structure & Boilerplate**
- API route generation (mel-mehdi)
- TypeScript type definitions (mel-mehdi)
- CSS styling and responsive design (mel-mehdi)
- Documentation comments and JSDoc (both)

**Problem Solving & Debugging**
- Algorithm optimization suggestions (mel-mehdi)
- Debugging game physics issues (mel-mehdi)
- Security best practices (mel-mehdi)
- AI parameter tuning suggestions (szeroual)
- Troubleshooting Prometheus SSL/TLS scraping issues (amabchou)

**Documentation**
- Privacy Policy & Terms of Service drafting (mel-mehdi)
- README structure and organization (both)
- Code comments and explanations (both)
- Prometheus HTTPS scraping configuration (amabchou)

#### Parts Implemented WITHOUT AI Code Generation

**AI Implementation (Sanaa - szeroual)**
- Ball trajectory prediction algorithm: Custom implementation from physics principles
- Error modeling system: Custom random error distribution
- Reaction time simulation: Custom probability-based implementation
- Difficulty parameter tuning: Manual testing and balancing via gameplay testing
- All AI decision logic: Hand-coded orchestration and integration

**Game & Backend (Mehdi - mel-mehdi)**
- Game engine core logic: Collision detection, ball physics (custom implementation)
- Tournament state machine: Bracket progression and match management
- Architecture decisions: Technology choices and system design
- Database schema: Entity relationships and data structure
- Security implementation: Authentication flow and session management

**Monitoring (Assia - amabchou)**
- Prometheus configuration structure and scrape target selection
- Monitoring metric selection and alert thresholds
- Grafana dashboard design and panel layout
- Monitoring strategy and metric collection approach
- Prometheus scrape intervals and retention policies
- Grafana alert threshold values

All AI code was custom-implemented, extensively tested through gameplay, and carefully integrated with the game engine. AI assistance tools were used only for code structure suggestions and debugging, not for algorithm design or core implementation.

## Known Limitations

- No 2FA (Two-Factor Authentication)
- No mobile-optimized touch controls for game
- Chat does not support file uploads or images
- No game replay system
- No spectator mode for watching live games
- No advanced 3D graphics (uses 2D Canvas)
- No external notification integrations for Alerts Monitoring (Dashboard-only)
- Data Persistence: Metrics are stored locally without remote backups.

## Future Improvements

- [ ] Add 2FA with QR codes
- [ ] Game replay system
- [ ] Spectator mode for watching live games
- [ ] Mobile app (React Native)
- [ ] Advanced 3D graphics with Three.js
- [ ] CDN for static assets
- [ ] Automated testing (Jest, Cypress)
- [ ] Additional OAuth providers (42 Intra, GitHub)
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Automated Scaling
- [ ] Centralized Logging using ELK (Elasticsearch, Logstash, Kibana)
- [ ] Advanced Tracing Deploy Jaeger for end-to-end request tracing between Backend, Database, and Cache.

## License

This project is part of the 42 School curriculum and is intended for educational purposes only.

## Acknowledgments

- **42 School**: For the project requirements and learning opportunity
- **Peers**: For feedback, testing, and support during development
- **Open Source Community**: For the amazing tools and libraries used in this project

---

**Project Status**: ✅ Complete (26/14 points)  
**Last Updated**: January 22, 2026  
**Contact**: mel-mehdi (42 Intra)