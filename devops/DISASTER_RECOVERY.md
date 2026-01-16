# Disaster Recovery - How to Fix Things When They Break

## Overview

This document covers what to do when things break (and they will eventually). I've tested most of these procedures, though some only once, so if you're reading this during an actual emergency... good luck!

We have automated backups and restore procedures for common failure scenarios. Everything should be straightforward but definitely test the restore process once before you actually need it.

## Backup Setup

### How Backups Work
- Runs every day at 3 AM (you can change this in docker-compose.yml if you want)
- Stored in the `backups/` folder
- Keeps them for 7 days then auto-deletes old ones
- They're just compressed postgres dumps (.sql.gz files)
- Files are named like: `backup_transcendence_20260101_030000.sql.gz`

### Checking if Backups are OK
```bash
# see what backups you have
ls -lh backups/

# make sure a backup isn't corrupted
gunzip -t backups/backup_transcendence_20260101_030000.sql.gz

# check size (if it's 0 bytes something's wrong)
du -h backups/backup_transcendence_20260101_030000.sql.gz
```

## What to Do When Things Break

### Database is Corrupted or Lost Data

**How you'll know:**
- Database is running but throwing weird errors
- Tables are missing
- App is freaking out about database stuff

**Fix it:**

1. Stop everything first
   ```bash
   make down
   ```

2. Find your most recent backup
   ```bash
   ls -lt backups/ | head -5
   ```

3. Unzip it
   ```bash
   gunzip -c backups/backup_transcendence_20260101_030000.sql.gz > /tmp/restore.sql
   ```

4. Start just the database
   ```bash
   docker compose up -d database
   ```

5. Wait a bit for it to be ready
   ```bash
   docker compose exec database pg_isready -U $POSTGRES_USER
   # keep running this until it says "accepting connections"
   ```

6. Drop the broken database and make a new one
   ```bash
   docker compose exec database psql -U $POSTGRES_USER -d postgres -c "DROP DATABASE IF EXISTS transcendence;"
   docker compose exec database psql -U $POSTGRES_USER -d postgres -c "CREATE DATABASE transcendence;"
   ```

7. Restore from backup
   ```bash
   docker compose exec -T database psql -U $POSTGRES_USER transcendence < /tmp/restore.sql
   ```

8. Check if it worked
   ```bash
   docker compose exec database psql -U $POSTGRES_USER transcendence -c "\dt"
   # you should see your tables
   ```

9. Start everything back up
   ```bash
   make up
   ```

10. Test if the app works
    ```bash
    curl -k https://localhost:8001/
    curl https://localhost/
    ```

**Time:** Usually takes 5-10 minutes depending on backup size

---

### Everything is Dead (Server Died, Hardware Failed, etc)

**When this happens:**
- Server completely crashed
- All containers gone
- Starting from scratch

**Recovery:**

1. Clone the repo on the new server
   ```bash
   git clone <your-repo-url>
   cd ft_mohsinine
   ```

2. Copy backups from the old server (if you can still access it)
   ```bash
   scp -r user@old-server:/path/to/backups ./backups
   # or use whatever method works - USB drive, cloud storage, etc
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   nano .env
   # fill in your actual credentials
   ```

4. Build and start everything
   ```bash
   make
   ```

5. Give it a minute to start up
   ```bash
   sleep 30
   make status
   ```

6. If you have backups, restore the database (follow the database restore steps above)

7. Make sure everything's working
   ```bash
   make health
   ```

8. Check monitoring
   - Go to http://localhost:9090 (Prometheus)
   - Go to http://localhost:3001 (Grafana)

**Time:** Probably 15-30 minutes if everything goes smoothly

---

### One Service Keeps Crashing

**Symptoms:**
- Container won't stay up
- One service showing errors while others are fine

**What to do:**

1. Check which service is having issues
   ```bash
   make status
   ```

2. Look at the logs
   ```bash
   make logs-backend
   # or logs-frontend, logs-nginx depending on what's broken
   ```

3. Try restarting it
   ```bash
   make restart-backend
   ```

4. If that doesn't help, rebuild it
   ```bash
   docker compose up -d --build backend
   ```

5. Verify it's working now
   ```bash
   make status
   make logs-backend
   ```

**Time:** Usually 2-5 minutes

---

### Config Files Got Messed Up

**When:**
- Modified docker-compose.yml or other config and now things are broken
- Services won't start
- Getting syntax errors

**Fix:**

1. Revert to last working version
   ```bash
   git log --oneline
   git checkout <commit-hash> -- docker-compose.yml
   # replace with whatever file you broke
   ```

2. Restart everything
   ```bash
   make down
   make up
   ```

3. Verify services are running
   ```bash
   make status
   ```

**Time:** 2-3 minutes

---

### Docker Volumes are Corrupted

**Signs:**
- Docker complaining about volumes
- Can't access persistent storage

**Recovery:**

1. Stop everything
   ```bash
   make down
   ```

2. Check your volumes
   ```bash
   docker volume ls | grep ft_trans
   ```

3. Try to backup the volume first (if possible)
   ```bash
   docker run --rm -v ft_trans_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/volume-backup.tar.gz /data
   ```

4. Remove the bad volume
   ```bash
   docker volume rm ft_trans_postgres_data
   ```

5. Start fresh and restore from backup
   ```bash
   docker compose up -d database
   # then follow the database restore steps from earlier
   ```

**Time:** 10-15 minutes

---

## Making Manual Backups

If you want to make a backup right now instead of waiting for the automatic one:

```bash
# easiest way
make backup

# or do it manually
docker compose exec database pg_dump -U $POSTGRES_USER transcendence | gzip > backups/manual_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

## Testing Backups

Test the restore process at least once before you actually need it. Just because backups are running doesn't mean restores will work.

1. Create a test backup with `make backup`
2. Try restoring it on your local setup
3. Verify all the data is there
4. Document any problems you run into

## Monitoring

### Running Health Checks
```bash
make health
```

This checks if all services are responding.

### Prometheus Alerts
Go to http://localhost:9090/alerts to see if anything is firing

### Grafana
Check the dashboards at http://localhost:3001 (login with your credentials from .env)

## After You Fix Something

Make sure to check:
- [ ] All services are running (`make status`)
- [ ] Database works and has data
- [ ] Frontend loads (https://localhost/)
- [ ] Backend responds (https://localhost:8001/ with -k flag)
- [ ] Nginx works (https://localhost/)
- [ ] Prometheus is collecting metrics (http://localhost:9090)
- [ ] Grafana shows data (http://localhost:3001)
- [ ] Health check passes (`make health`)
- [ ] Backups are running again
- [ ] Tell the team what happened

## Tips

- Always check if a backup is valid before you try to restore it
- Test restores in a separate environment first if you can
- Keep at least a week of backups
- Write down what happened when you have an incident
- Update this doc if you find better ways to do things

## Useful Links

- PostgreSQL backup docs: https://www.postgresql.org/docs/current/backup.html
- Docker volumes: https://docs.docker.com/storage/volumes/
- Our backup script: `devops/scripts/backup.sh`
- Health check: `devops/scripts/health-check.sh`
