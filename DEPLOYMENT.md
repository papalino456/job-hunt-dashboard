# Deployment Guide

## Quick Start (Local Development)

1. **Run setup:**
   ```bash
   ./setup.sh
   ```

2. **Edit backend/.env and set your password:**
   ```bash
   nano backend/.env
   # Set PASSWORD=your-secure-password
   ```

3. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Visit http://localhost:3000** and login

## Deploy to Fly.io (Free Tier)

### Prerequisites

- Fly.io account (sign up at https://fly.io)
- Fly CLI installed

### Step-by-Step

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly:**
   ```bash
   fly auth login
   ```

3. **Launch app (from project root):**
   ```bash
   fly launch
   ```
   
   When prompted:
   - App name: `job-hunt-dashboard` (or your choice)
   - Region: Choose closest to you
   - Postgres: **No** (we use SQLite)
   - Redis: **No**

4. **Create persistent volume for database:**
   ```bash
   fly volumes create job_hunt_data --size 1 --region <your-region>
   ```

5. **Set secrets:**
   ```bash
   fly secrets set PASSWORD="your-secure-password-here"
   fly secrets set SESSION_SECRET="$(openssl rand -hex 32)"
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

7. **Open your dashboard:**
   ```bash
   fly open
   ```

### Custom Domain (Optional)

1. **Add certificate:**
   ```bash
   fly certs add yourdomain.com
   ```

2. **Add DNS records** (from Fly.io dashboard)

### Scaling

Free tier includes:
- 3 shared-cpu-1x VMs (256MB RAM each)
- Auto-stop when idle (no requests)
- Auto-start on first request

To keep it always running:
```bash
fly scale count 1 --max-per-region 1
```

## Backup Database

### Local

Database is at `backend/data/jobs.db`. Just copy the file:

```bash
cp backend/data/jobs.db backup-$(date +%Y%m%d).db
```

### Fly.io

```bash
# SSH into the machine
fly ssh console

# Inside the machine
cd /data
tar czf backup.tar.gz jobs.db
exit

# Download from your machine
fly ssh sftp get /data/backup.tar.gz
```

## Environment Variables

### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `PASSWORD` | Login password | **Yes** | - |
| `SESSION_SECRET` | Session encryption key | **Yes** | - |
| `DATABASE_PATH` | SQLite database path | No | `./data/jobs.db` |
| `NODE_ENV` | Environment | No | `development` |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | No | `http://localhost:3001` |

## Monitoring

### Health Check

```bash
curl https://your-app.fly.dev/health
# Should return: {"status":"ok"}
```

### Logs

```bash
fly logs
```

### SSH Access

```bash
fly ssh console
```

## Troubleshooting

### "Unauthorized" error when trying to login

- Check that `PASSWORD` secret is set: `fly secrets list`
- Verify password in your login attempt matches the secret

### Database not persisting

- Ensure volume is created: `fly volumes list`
- Check `fly.toml` has `[mounts]` section pointing to `/data`

### Frontend not loading

- Check build logs: `fly logs`
- Verify `NODE_ENV=production` is set
- Ensure frontend was built during Docker build

### Slow cold starts

- Free tier goes to sleep after inactivity
- First request wakes it up (~5-10 seconds)
- To keep always-on, upgrade to paid tier or use a health check ping service

## Security

1. **Use a strong password** - Generated with `openssl rand -base64 32`
2. **SESSION_SECRET** - Generated with `openssl rand -hex 32`
3. **HTTPS enforced** - Fly.io provides automatic TLS
4. **HttpOnly cookies** - Prevents XSS attacks
5. **No public repo** - Keep your `.env` files out of Git

## Cost Estimate

**Free Tier (Fly.io):**
- 3 shared-cpu-1x VMs: **$0/month**
- 1GB persistent volume: **$0.15/month**
- Egress (first 100GB): **$0/month**

**Total: ~$0.15/month** (essentially free)

## Next Steps

1. ✅ Dashboard deployed
2. Configure `job-hunter` skill for CLI access
3. Integrate with heartbeat workflow
4. Optionally add custom domain
