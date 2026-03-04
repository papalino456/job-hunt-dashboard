# DEPLOYMENT GUIDE - Render.com + PostgreSQL

## Overview

This job hunt dashboard is configured to deploy on **Render.com** with a **free PostgreSQL database**.

## Architecture

- **Backend**: Node.js + Express (Web Service on Render)
- **Database**: PostgreSQL (Free tier on Render)
- **Frontend**: Next.js (served as static files from backend)

---

## Quick Deploy (Render Blueprint)

### 1. Fork/Create GitHub Repository

Push your code to GitHub:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy via Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically:
   - Create the PostgreSQL database
   - Deploy the backend web service
   - Set up environment variables

### 3. Set Required Secrets

After deployment, go to your Web Service → **Environment** and set:

| Variable | Value | Required |
|----------|-------|----------|
| `PASSWORD` | Your login password | **YES** |

Optional overrides:
- `SESSION_SECRET` - Auto-generated, but you can set your own
- `FRONTEND_URL` - Your custom domain (if any)

---

## Manual Deploy (Without Blueprint)

### 1. Create PostgreSQL Database

1. Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `job-hunt-db`
3. Plan: **Free**
4. Region: Choose closest to you
5. Create Database
6. Copy the **Internal Database URL** (looks like: `postgresql://jobhunt:...`)

### 2. Create Web Service

1. Render Dashboard → **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `job-hunt-dashboard`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste from step 1>
   SESSION_SECRET=<random-string-32-chars>
   PASSWORD=<your-login-password>
   FRONTEND_URL=https://job-hunt-dashboard.onrender.com
   ```
5. Create Web Service

---

## Database Migration (If you have existing SQLite data)

If you have jobs in your local SQLite database that you want to migrate:

### 1. Get PostgreSQL Connection String

From Render Dashboard → PostgreSQL → **Connections** → **External Database URL**

### 2. Run Migration Locally

```bash
cd backend

# Install dependencies
npm install

# Set environment and run migration
export DATABASE_URL="postgresql://..."
export SQLITE_PATH="./data/jobs.db"

npm run migrate
```

### 3. Verify Migration

Check the Render PostgreSQL dashboard or query via `psql`:
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM jobs;"
```

---

## Local Development with PostgreSQL

### Option 1: Local PostgreSQL (Docker)

```bash
# Start PostgreSQL locally
docker run -d \
  --name job-hunt-postgres \
  -e POSTGRES_USER=jobhunt \
  -e POSTGRES_PASSWORD=localdev \
  -e POSTGRES_DB=jobhunt \
  -p 5432:5432 \
  postgres:15

# Set environment variable
export DATABASE_URL="postgresql://jobhunt:localdev@localhost:5432/jobhunt"

# Run backend
cd backend && npm run dev
```

### Option 2: Local SQLite (Original)

To use SQLite locally instead of PostgreSQL:

1. Edit `backend/src/index.js`:
   ```javascript
   // Change this:
   import './db/database-postgres.js';
   // To this:
   import './db/database.js';
   ```

2. Edit `backend/src/routes/jobs.js`:
   ```javascript
   // Change this:
   import db from '../db/database-postgres.js';
   // To this:
   import db from '../db/database.js';
   ```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `PASSWORD` | Login password for dashboard | `my-secure-password` |
| `SESSION_SECRET` | Session encryption key | `random-string-32-chars` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` (local), `10000` (Render) |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## Database Schema

The PostgreSQL schema is in `backend/src/db/schema-postgres.sql`.

Key tables:
- `jobs` - All job applications and leads

Key indexes:
- `idx_jobs_status` - Fast filtering by status
- `idx_jobs_priority` - Fast filtering by priority
- `idx_jobs_deadline` - Fast sorting by deadline
- `idx_jobs_company` - Fast search by company

---

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL is running (Render dashboard)
- For local: ensure Docker PostgreSQL container is running

### "Migration failed"
- Ensure SQLite database exists at `backend/data/jobs.db`
- Check `DATABASE_URL` has write permissions
- Try running migration with `DEBUG=*` for verbose output

### "Cannot login"
- Verify `PASSWORD` environment variable is set
- Check browser cookies are enabled
- Try clearing browser cache/cookies

### Frontend shows 404
- Ensure `NODE_ENV=production` is set
- Check that frontend was built: `cd frontend && npm run build`

### CORS errors
- Verify `FRONTEND_URL` matches your actual frontend URL
- Check backend logs for CORS preflight failures

---

## Free Tier Limits (Render)

### Web Service
- 512 MB RAM
- 0.1 CPU
- **Spins down after 15 min idle** (cold start ~30s on next request)
- 100 GB bandwidth/month

### PostgreSQL
- 1 GB storage
- Shared CPU
- Automated daily backups (7 day retention)
- **⚠️ Paused after 90 days of inactivity** (data preserved)

### Cost
**$0/month** for both services on free tier.

---

## Custom Domain (Optional)

1. Render Dashboard → Web Service → **Settings** → **Custom Domain**
2. Add your domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` environment variable

---

## Backup & Restore

### Automated (Render)
- Daily automated backups (free tier: 7 day retention)
- Point-in-time recovery available

### Manual Export
```bash
# Export to SQL file
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Export specific table
pg_dump $DATABASE_URL --table=jobs > jobs-backup.sql
```

### Manual Import
```bash
# Restore from SQL file
psql $DATABASE_URL < backup-20240101.sql
```

---

## Updates & Redeploy

### Automatic
- Push to `main` branch → Auto-deploys (if enabled)

### Manual
- Render Dashboard → Web Service → **Manual Deploy** → **Deploy Latest Commit**

---

## Next Steps

1. ✅ Deploy to Render
2. ✅ Migrate existing data (if any)
3. Configure custom domain (optional)
4. Set up monitoring (Render has built-in metrics)
5. Invite team members (Render dashboard → Team)
