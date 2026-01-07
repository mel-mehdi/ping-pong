# ft_transcendence

> DevOps and monitoring infrastructure for our Pong game
> Made by amabchou for 42

## What is this?

This repo has all the Docker/monitoring stuff for our ft_transcendence project. We built a multiplayer Pong game (React + Django) and this is the infrastructure side of things.

Basically I set up:/home/assia/Desktop/ft_mohsinine/grafana
/home/assia/Desktop/ft_mohsinine/prometheus
/home/assia/Desktop/ft_mohsinine/scripts
/home/assia/Desktop/ft_mohsinine/status-page
/home/assia/Desktop/ft_mohsinine/.env.example
/home/assia/Desktop/ft_mohsinine/DISASTER_RECOVERY.md
/home/assia/Desktop/ft_mohsinine/docker-compose.yml
/home/assia/Desktop/ft_mohsinine/README.md
- Prometheus to collect metrics from everything
- Grafana with dashboards that actually look decent
- Daily backups that run automatically
- Health checks so you know when stuff breaks
- A simple status page
- Everything runs with docker-compose

## Team

**amabchou** - that's me, I did the DevOps part
- Docker setup
- Monitoring (Prometheus/Grafana)
- Backup systems
- Making sure everything deploys properly

## Folder Structure

```
.
├── grafana/                  # dashboards and provisioning
├── prometheus/               # config + alert rules
├── scripts/                  # backup.sh, health-check.sh, etc
├── status-page/             # html status page
├── docker-compose.yml       # the main file that runs everything
```

## Getting Started

## Getting Started

### What You Need
- Docker + Docker Compose installed
- ~4GB of RAM free (it runs a lot of containers)
- These ports available: 3001, 8000, 8001, 8080, 8888, 9090

### Setup

Before you start:

```bash
# copy the env file
cp .env.example .env

# edit it and put real passwords (don't use the defaults!)
nano .env

# make scripts executable
chmod +x scripts/*.sh

# make sure backups folder exists
mkdir -p backups
```

### Starting Everything

Just run this:
```bash
docker-compose up -d
```

Give it like 30 seconds to start everything, then check:
```bash
docker-compose ps
```

All the services:
- Main app (nginx): http://localhost:8888
- Frontend: http://localhost:8000
- Backend: http://localhost:8001
- Status page: http://localhost:8080
- Grafana: http://localhost:3001 (user: admin, pass: admin)
- Prometheus: http://localhost:9090

## Features

### Monitoring with Prometheus & Grafana (Major Module - 2pts)
- Prometheus scraping metrics from everything
- Grafana dashboards that load automatically
- Alert rules for when things go wrong
- Exporters for:
  - PostgreSQL stats
  - System resources (node exporter)
  - Docker containers (cAdvisor)

### Health Checks & Backups (Minor Module - 1pt)
- DB backups run daily at 3am, keeps last 7 days
- Health check script (`scripts/health-check.sh`)
- Status page shows if services are up
- Disaster recovery doc with actual procedures I tested (see [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md))
  - How to restore the database
  - What to do if the whole server dies
  - Fixing single service crashes
  - Reverting bad config changes
  - Dealing with corrupted volumes
  - Checklists for after you recover stuff

**Total: 3 points** (2 major + 1 minor)

## Backups

## Backups

Backups happen automatically every day but if you want to make one right now:
```bash
./scripts/backup.sh
```

They go into the `backups/` folder and old ones get deleted after a week.

## Disaster Recovery

I wrote up a whole doc for when stuff breaks: [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md)

Quick restore if you need it:
```bash
docker-compose down
docker-compose up -d database
sleep 10

gunzip -c backups/backup_transcendence_YYYYMMDD_HHMMSS.sql.gz | docker exec -i postgres psql -U postgres transcendence

docker-compose up -d
```

The disaster recovery doc covers:
- Database died or data got corrupted
- Entire server crashed
- One service won't stay up
- You broke a config file
- Docker volumes are messed up

Each one has steps to fix it and how long it usually takes.

## Tech Stack

What I used:
- **Docker & Docker Compose** - everything's containerized
- **Prometheus** - collects all the metrics
- **Grafana** - makes the nice looking dashboards
- **PostgreSQL** - main database
- **Nginx** - serves the status page

Why:
- Docker makes it super easy to deploy and manage
- Prometheus is basically the standard for monitoring nowadays
- Grafana makes it actually look good (and it's free)
- PostgreSQL is solid and does what we need

## How We Worked

We had Discord calls twice a week to sync up and used GitHub issues to keep track of what needed doing. I tried to keep commits organized by what feature they were for.

Basically:
1. Figured out what modules we wanted (I took DevOps)
2. Got the basic Docker setup working
3. Added monitoring piece by piece
4. Tested it all together at the end

Things that took longer than expected:
- Grafana auto-provisioning was annoying to get working (folder structure has to be exactly right)
- cAdvisor needs privileged mode which wasn't in the docs
- The backup cleanup script had some bash issues I had to debug

## What I Did

**amabchou** (me):
- Set up Docker Compose for everything (db, monitoring, etc)
- Configured Prometheus + wrote the alert rules
- Designed the Grafana dashboards
- Wrote the backup script
- Made the health check system
- Built the status page (simple HTML/CSS)
- Wrote all the docs

## Modules (for points)

### Major (2 points):
**Prometheus & Grafana Monitoring**
   - Prometheus with postgres/node/container exporters
   - Grafana dashboards that auto-load
   - Alert rules for important stuff
   - Chose this because you need monitoring in real apps

### Minor (1 point):
**Health Checks + Backups + Disaster Recovery**
   - Daily backups (keeps 7 days)
   - Health check script for all services
   - Status page showing what's up/down
   - Disaster recovery guide (DISASTER_RECOVERY.md)
   - 5 different failure scenarios covered
   - Tested the backup restore process
   - Recovery times listed for each scenario
   - Checklist to verify everything's working after recovery

## Resources I Used

- Prometheus docs: https://prometheus.io/docs/
- Grafana provisioning: https://grafana.com/docs/grafana/latest/administration/provisioning/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL backups: https://www.postgresql.org/docs/current/backup.html

### AI Tools
Yeah I used ChatGPT for some stuff:
- Getting the Prometheus alert syntax right (those are confusing)
- Understanding how Grafana's JSON dashboard format works
- Double-checking my disaster recovery procedures were complete

But I tested everything myself and changed things to actually work with our setup.

## Random Notes

- CHANGE THE DEFAULT PASSWORDS in .env (seriously)
- The Grafana dashboard loads automatically the first time you start it
- If something's broken, `docker-compose logs <service>` usually tells you why
- Port 8888 instead of 80 because Apache was already using it on my machine

---
*Last updated: Dec 2025*
