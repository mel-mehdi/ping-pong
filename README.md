# PingPong

*This project has been created as part of the 42 curriculum by mel-mehdi, ael-bouz, amabchou, szeroual.*

## Description

**PingPong** is our take on the classic Pong game, but way bigger - we built a full web platform with multiplayer tournaments, real-time chat, user profiles, and production monitoring. This is our final project for the 42 curriculum, where we got to combine everything we learned about web development, databases, real-time communication, and DevOps.

### What We Built

- **Pong Game**: Classic gameplay with smooth controls and physics
- **Tournaments**: 4, 8, or 16 player brackets
- **User System**: Profiles, stats, avatars, friends
- **Chat**: Real-time messaging between players
- **Leaderboards**: Rankings and match history
- **Monitoring**: Prometheus + Grafana for keeping an eye on everything
- **Responsive**: Works on desktop and mobile
- **Dark Mode**: Because who doesn't like dark mode?

## Team Information

### Team Members

| Name | Login | Role(s) | Responsibilities |
|------|-------|---------|------------------|
| Mehdi | mel-mehdi | Product Owner, Tech Lead, Frontend Developer | Architecture design, technical decisions, game engine, frontend views, module implementation |
| Abdellatif | ael-bouz | Backend Developer | Backend API, database schema, Django REST Framework, WebSocket implementation, authentication system |
| Assia | amabchou | DevOps Engineer, Infrastructure Lead | Docker setup, monitoring (Prometheus/Grafana), backup systems, deployment, disaster recovery |
| Sanaa | szeroual | AI Developer | AI opponent implementation, machine learning features, AI system integration |

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

## Tech Stack

### Frontend
- **React + TypeScript**: For the UI (type safety is nice)
- **Vite**: Fast dev server and builds
- **Bootstrap 5**: Makes responsive design easier
- **HTML5 Canvas**: For rendering the game
- **CSS3**: Custom styling with dark mode variables

### Backend
- **Django 5.1.4**: Python web framework with built-in everything
- **Django REST Framework**: For the API
- **Django Channels**: WebSocket support for real-time chat
- **PostgreSQL 18**: Database (because PostgreSQL is solid)
- **Redis**: Session storage and caching

### DevOps
- **Docker + Docker Compose**: 12 services running together
- **nginx**: Reverse proxy and SSL
- **Prometheus**: Collects metrics from everything
- **Grafana**: Makes pretty dashboards
- **postgres_exporter, node_exporter, cAdvisor**: Various metric collectors
- **Automated backups**: Daily at 3 AM with 7-day retention

## Database

We use PostgreSQL with Django ORM. Main tables:

### Schema Overview

**Users** (`user_management_customuser`)
- Login credentials and profile (username, email, hashed password)
- Stats: wins, losses, games played
- Avatar and full name
- Created/updated timestamps

**Sessions** (`django_session`)
- User sessions managed by Django + Redis
- Session keys and expiration

**Matches** (`game_match`)
- Game records with player1, player2
- Scores and winner
- Game mode (local/online/tournament)
- Timestamps

**Tournaments** (`game_tournament`)
- Tournament name and status
- Players list (JSONB array)
- Matches and winner
- Tournament brackets

**Friend Requests** (`user_management_friendrequest`)
- Sender and receiver
- Status (pending/accepted/rejected)
- Created timestamps

**Messages** (`chat_message`)
- Chat messages between users
- Read/unread status
- Message content and timestamps

**Game Invitations** (`game_gameinvitation`)
- Game invites between players
- Status and game mode

All tables use proper foreign keys and indexes. Check `backend/*/models.py` for full details.

## Features

### Core Game (mel-mehdi)
- Pong game with Canvas rendering
- Tournament brackets (4, 8, or 16 players)
- Game customization (speeds, scores)

### Frontend (mel-mehdi)
- React UI with all the pages
- Responsive design (works on phones)
- Dark mode toggle
- Profile pages with stats
- Match history

### Backend (ael-bouz)
- Django REST API
- User authentication (hashed passwords)
- WebSocket chat (Django Channels)
- Friends system
- Leaderboards and rankings

### DevOps (amabchou)
- Docker setup (12 services)
- Prometheus + Grafana monitoring
- Automated daily backups
- Health checks and status page
- Disaster recovery docs

## Modules (19/14 points)

### Major (2 pts each)

1. **Framework** - React + Django (mel-mehdi, ael-bouz)
2. **Game** - Pong with tournaments (mel-mehdi)
3. **User Management** - Auth, profiles, stats (mel-mehdi, ael-bouz)
4. **User Interaction** - Chat, friends, invites (mel-mehdi, ael-bouz)
5. **Monitoring** - Prometheus + Grafana (amabchou)
6. **AI Opponent** - Backend AI with 3 difficulty levels (szeroual)

### Minor (1 pt each)

7. **Stats & History** - Match tracking (mel-mehdi)
8. **Backend Framework** - Django (ael-bouz)
9. **Tournaments** - Bracket system (mel-mehdi)
10. **Customization** - Game settings (mel-mehdi)
11. **Multi-browser** - Chrome, Firefox, Edge, Safari (mel-mehdi)
12. **ORM** - Django ORM (ael-bouz)
13. **Health Checks** - Backups, monitoring, recovery (amabchou)

## Who Did What

### Mehdi (mel-mehdi) - Frontend

**Game:**
- Built the Pong game engine (Canvas, physics, collisions)
- Tournament bracket system
- Game controls and state management

**Frontend:**
- All the React components and pages
- Routing and navigation
- Bootstrap layouts
- Dark mode
- Profile pages, leaderboards, chat UI

**Challenges:**
- Had to figure out canvas resizing on different screens
- Tournament bracket logic was tricky
- Making dark mode work everywhere

### Abdellatif (ael-bouz) - Backend

**API:**
- Django REST API for everything
- User auth with proper password hashing
- WebSocket chat with Django Channels
- Friends system endpoints
- Match and tournament data management

**Database:**
- PostgreSQL schema design
- Django ORM models
- Database migrations
- Query optimization

**Challenges:**
- Getting Django Channels to work properly
- Redis session management
- Optimizing database queries (select_related saved us)

### Sanaa (szeroual) - AI Developer

**AI Opponent:**
- Built complete AI opponent system (`backend/game/ai/`)
- Implemented ball trajectory prediction algorithm
- Created reaction time simulation for human-like behavior
- Added error injection system for realistic mistakes
- Designed 3 difficulty levels (Easy, Medium, Hard)

**Backend Integration:**
- Created `/game/ai/decide/` API endpoint
- Integrated AI with Django backend
- Connected AI to frontend game loop (100ms polling)
- Set up difficulty configuration system

**Challenges:**
- Balancing AI difficulty (not too easy, not unbeatable)
- Making AI feel human with reaction delays and errors
- Optimizing prediction algorithm for real-time performance

### Assia (amabchou) - DevOps

**Infrastructure:**
- Docker Compose with 12 services
- PostgreSQL and Redis setup
- nginx config with SSL
- Environment variables

**Monitoring:**
- Prometheus setup
- Grafana dashboards
- Multiple exporters (postgres, node, cadvisor)
- Alert rules

**Backups:**
- Automated daily backups
- Backup verification
- Health check scripts
- Disaster recovery docs

**Challenges:**
- DNS issues in Docker
- Port conflicts with Apache
- Getting Grafana auto-provisioning to work
- Making backups actually automated

## How to Run

### Requirements
- Docker & Docker Compose
- Modern browser (Chrome recommended)

### Quick Start

1. Clone it:
   ```bash
   git clone https://github.com/mel-mehdi/ft_mohsinine.git
   cd ft_mohsinine
   ```

2. Start everything:
   ```bash
   docker-compose up --build
   ```

3. Access:
   - Frontend: https://localhost
   - Backend API: https://localhost/api
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

4. Stop:
   ```bash
   docker-compose down
   ```

### If Something Breaks

```bash
# Rebuild everything
docker-compose down -v
docker-compose up --build

# Check logs
docker-compose logs -f

# Run health check
./scripts/health-check.sh
```

Check DISASTER_RECOVERY.md if you need to restore backups.

## Resources

### Documentation & Tutorials
- [Django Documentation](https://docs.djangoproject.com/) - Backend framework
- [Django REST Framework](https://www.django-rest-framework.org/) - API development
- [Django Channels](https://channels.readthedocs.io/) - WebSocket implementation
- [React Documentation](https://react.dev/) - Frontend framework
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database
- [Docker Documentation](https://docs.docker.com/) - Containerization
- [Prometheus Documentation](https://prometheus.io/docs/) - Monitoring
- [Grafana Documentation](https://grafana.com/docs/) - Dashboards

### AI Usage

We used AI tools (ChatGPT, GitHub Copilot) for:
- **Boilerplate code**: Generating repetitive structures
- **CSS styling**: Help with responsive design
- **Debugging**: Finding solutions to errors
- **Documentation**: Structuring README sections

What we **did NOT** use AI for:
- **Game physics and collision detection**: Custom implementation
- **Tournament bracket logic**: Original algorithm
- **Backend API design**: Architecture decisions
- **Database schema**: Data structure design
- **DevOps infrastructure**: Manual setup (AI only reviewed configs)

All AI-generated content was reviewed, understood, and tested before integration. No code was used without comprehension.

---

**Status**: ✅ 19/14 points  
**Updated**: January 8, 2026  
**Team**: mel-mehdi, ael-bouz, amabchou, szeroual
