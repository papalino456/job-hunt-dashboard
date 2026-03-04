# Job Hunt Dashboard

A password-protected job application tracking system with a clean, Industrial Minimalist design.

## Features

- 📊 **Pipeline Board**: Kanban-style workflow (Discovered → Offer/Rejected)
- 🔒 **Password Protected**: Simple auth, no user database needed
- 🎨 **Industrial Minimalist**: Steel & Silicon design matching your portfolio
- 💾 **PostgreSQL Database**: Persistent external database (free tier on Render)
- 🚀 **Deploy to Render.com**: Free tier with auto-deploy

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Express.js + PostgreSQL (pg driver)
- **Auth**: Session-based with httpOnly cookies
- **Deployment**: Render.com (Web Service + PostgreSQL)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git
- PostgreSQL (optional - can use SQLite locally)

### Quick Setup

```bash
# Install all dependencies
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Start development servers
npm run dev         # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

### Database Options

#### Option 1: Local PostgreSQL (Docker)
```bash
docker run -d \
  --name job-hunt-postgres \
  -e POSTGRES_USER=jobhunt \
  -e POSTGRES_PASSWORD=localdev \
  -e POSTGRES_DB=jobhunt \
  -p 5432:5432 \
  postgres:15

export DATABASE_URL="postgresql://jobhunt:localdev@localhost:5432/jobhunt"
```

#### Option 2: SQLite (Original - no setup needed)
Edit `backend/src/index.js`:
```javascript
// Change this:
import './db/database-postgres.js';
// To this:
import './db/database.js';
```

## Environment Variables

### Backend (.env)

```env
# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/db
PASSWORD=your-secure-password
SESSION_SECRET=random-string-32-chars

# Optional
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment to Render.com

### Quick Deploy (Blueprint)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

2. **Deploy via Blueprint:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render auto-creates PostgreSQL + Web Service

3. **Set Password:**
   - Web Service → **Environment** → Add `PASSWORD`

Your app will be live at `https://job-hunt-dashboard.onrender.com`

### Manual Deploy

See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) for detailed instructions.

## Database Migration

If you have existing SQLite data to migrate:

```bash
# Get your Render PostgreSQL URL from Dashboard
cd backend
export DATABASE_URL="postgresql://..."
npm run migrate
```

## API Endpoints

### Auth

- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Jobs

- `GET /api/jobs` - List jobs (filters: status, priority, search)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/stats` - Pipeline statistics

## Data Model

```typescript
interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  posting_url: string;
  date_discovered: string;
  
  // Optional fields
  salary_range?: string;
  team_info?: string;
  hiring_manager?: string;
  referral_contact?: string;
  
  // Workflow
  status: 'discovered' | 'researching' | 'ready' | 'applied' | 'phone' | 'onsite' | 'offer' | 'rejected';
  priority: 'P0' | 'P1' | 'P2';
  deadline?: string;
  
  // Application tracking
  cv_version?: string;
  date_applied?: string;
  last_contact?: string;
  notes: string;
  
  // Metadata
  research_status: 'pending' | 'in_progress' | 'complete';
  source: 'manual' | 'heartbeat' | 'discovered';
  tags: string[];
  
  created_at: string;
  updated_at: string;
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend dev server |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run start` | Start production backend |
| `npm run migrate` | Migrate SQLite → PostgreSQL |
| `npm run install:all` | Install all dependencies |

## Next Steps

1. ✅ Deploy to Render.com
2. Configure custom domain (optional)
3. Create the `job-hunter` skill for CLI integration
4. Add timeline view for deadline visualization
5. Build stats dashboard

## Design Notes

The dashboard uses the same "Industrial Minimalist" aesthetic as your portfolio:
- Zinc/stone monochromatic base
- Monospace fonts for data
- Sharp corners, thin borders
- Sparse blue highlights
- Red for urgency (<7d deadlines)
- Dark mode default

## Free Tier Limits (Render)

- **Web Service**: 512 MB RAM, spins down after 15 min idle (cold start ~30s)
- **PostgreSQL**: 1 GB storage, paused after 90 days inactivity (data preserved)
- **Cost**: $0/month

---

**Previous Deployment**: Fly.io instructions are preserved in [DEPLOYMENT.md](./DEPLOYMENT.md) for reference.
