# Disaster Recovery - How to Fix Things When They Break

## Overview

So basically this doc is here for when stuff goes wrong (and it will). I've tested most of these procedures but some I only ran through once so if you're reading this during an actual disaster, good luck! 

The main idea is we have backups and ways to restore them, plus procedures for different scenarios that might happen.

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
   docker compose down
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
   docker compose exec database pg_isready -U postgres
   # wait until it says "accepting connections"
   ```

6. Drop the broken database and make a new one
   ```bash
   docker compose exec database psql -U postgres -c "DROP DATABASE IF EXISTS transcendence;"
   docker compose exec database psql -U postgres -c "CREATE DATABASE transcendence;"
   ```

7. Restore from backup
   ```bash
   docker compose exec -T database psql -U postgres transcendence < /tmp/restore.sql
   ```

8. Check if it worked
   ```bash
   docker compose exec database psql -U postgres transcendence -c "\dt"
   # you should see your tables
   ```

9. Start everything back up
   ```bash
   docker compose up -d
   ```

10. Test if the app works
    ```bash
    curl http://localhost:8001/
    curl http://localhost:8000/
    ```

**Time:** Usually takes 5-10 minutes depending on backup size

---

### Everything is Dead (Server Died, Hardware Failed, etc)

**When this happens:**
- Server completely crashed
- All containers gone
- Starting from scratch

**Recovery:**

1. Get the code on a new server
   ```bash
   git clone <your-repo-url>
   cd proga
   ```

2. Copy your backups from the old server (if you can access them)
   ```bash
   scp -r user@old-server:/path/to/backups ./backups
   # or just copy them however you can
   ```

3. Set up the .env file
   ```bash
   cp .env.example .env
   nano .env
   # put in your actual passwords and stuff
   ```

4. Build and start everything
   ```bash
   docker compose up -d --build
   ```

5. Give it a minute to start up
   ```bash
   sleep 30
   docker compose ps
   ```

6. If you have backups, restore the database (follow the database restore steps above)

7. Make sure everything's working
   ```bash
   ./scripts/health-check.sh
   ```

8. Check monitoring
   - Go to http://your-server-ip:9090 (Prometheus)
   - Go to http://your-server-ip:3001 (Grafana)

**Time:** Probably 15-30 minutes if everything goes smoothly

---

### One Service Keeps Crashing

**Symptoms:**
- One container won't stay up
- Errors in just one service

**What to do:**

1. See which one is broken
   ```bash
   docker compose ps
   ```

2. Check the logs
   ```bash
   docker compose logs backend --tail=50
   # or whatever service is broken
   ```

3. Try restarting it
   ```bash
   docker compose restart backend
   ```

4. If that doesn't work, rebuild it
   ```bash
   docker compose up -d --build backend
   ```

5. Check if it's happy now
   ```bash
   docker compose ps backend
   docker compose logs backend
   ```

**Time:** Usually 2-5 minutes

---

### Config Files Got Messed Up

**When:**
- You changed docker-compose.yml or some config and now nothing works
- Services won't start
- Syntax errors

**Fix:**

1. Just revert to the last working version
   ```bash
   git log --oneline
   git checkout <the-hash-that-worked> -- docker-compose.yml
   # or whatever file you broke
   ```

2. Restart
   ```bash
   docker compose down
   docker compose up -d
   ```

3. Make sure it's working
   ```bash
   docker compose ps
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
   docker compose down
   ```

2. Check your volumes
   ```bash
   docker volume ls | grep proga
   ```

3. Try to backup the volume first (if possible)
   ```bash
   docker run --rm -v proga_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/volume-backup.tar.gz /data
   ```

4. Remove the bad volume
   ```bash
   docker volume rm proga_postgres-data
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
# easiest way: just run the backup script
docker compose exec backup /backup.sh

# or make a one-off backup
docker compose exec database pg_dump -U postgres transcendence | gzip > backups/manual_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

## Testing This Stuff

You should probably test the restore process at least once to make sure it actually works. I tested it a few times but it's good to verify in your own setup.

1. Make a test backup
2. Try restoring it in a dev environment or on your local machine
3. Make sure the data is all there
4. Write down any issues

## Monitoring

### Running Health Checks
```bash
./scripts/health-check.sh
```

This checks if all services are responding.

### Prometheus Alerts
Go to http://localhost:9090/alerts to see if anything is firing

### Grafana
Check the dashboards at http://localhost:3001 (login with admin/admin)

## After You Fix Something

Make sure to check:
- [ ] All services are running (`docker compose ps`)
- [ ] Database works and has data
- [ ] Frontend loads (http://localhost:8000)
- [ ] Backend responds (http://localhost:8001)
- [ ] Nginx works if you're using it (http://localhost:8888)
- [ ] Prometheus is collecting metrics (http://localhost:9090)
- [ ] Grafana shows data (http://localhost:3001)
- [ ] Health check passes (`./scripts/health-check.sh`)
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
- Our backup script: `scripts/backup.sh`
- Health check: `scripts/health-check.sh`
