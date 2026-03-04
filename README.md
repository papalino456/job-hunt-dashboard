# Job Hunt Dashboard

A password-protected job application tracking system with a clean, Industrial Minimalist design.

## Features

- 📊 **Pipeline Board**: Kanban-style workflow (Discovered → Offer/Rejected)
- 🔒 **Password Protected**: Simple auth, no user database needed
- 🎨 **Industrial Minimalist**: Steel & Silicon design matching your portfolio
- 💾 **SQLite Backend**: Persistent, file-based database
- 🚀 **Deploy to Fly.io**: Free tier compatible

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Auth**: Session-based with httpOnly cookies
- **Deployment**: Fly.io (with persistent volume for database)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

1. **Install dependencies:**

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env and set your PASSWORD

# Frontend
cd ../frontend
npm install
```

2. **Start backend:**

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

3. **Start frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

4. **Visit http://localhost:3000** and login with your password

## Environment Variables

### Backend (.env)

```
PORT=3001
PASSWORD=your-secure-password-here
SESSION_SECRET=generate-a-long-random-string-here
DATABASE_PATH=./data/jobs.db
NODE_ENV=development
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment to Fly.io

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login

```bash
fly auth login
```

### 3. Create app

```bash
fly apps create job-hunt-dashboard
```

### 4. Set secrets

```bash
fly secrets set PASSWORD="your-password-here"
fly secrets set SESSION_SECRET="$(openssl rand -hex 32)"
```

### 5. Create persistent volume

```bash
fly volumes create job_hunt_data --size 1 --region sjc
```

### 6. Deploy

```bash
fly deploy
```

### 7. Access your dashboard

```bash
fly open
```

## Database Management

The SQLite database is stored in `backend/data/jobs.db` (local) or on a Fly.io volume (production).

### Backup database (production)

```bash
fly ssh console
cd /app/backend/data
cat jobs.db | base64 > /tmp/backup.b64
exit

fly ssh console -C "cat /tmp/backup.b64" | base64 -d > backup.db
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
}
```

## Next Steps

1. Create the `job-hunter` skill for CLI integration
2. Add timeline view for deadline visualization
3. Build stats dashboard
4. Implement email/LinkedIn integration (optional)

## Design Notes

The dashboard uses the same "Industrial Minimalist" aesthetic as your portfolio:
- Zinc/stone monochromatic base
- Monospace fonts for data
- Sharp corners, thin borders
- Sparse blue highlights
- Red for urgency (<7d deadlines)
- Dark mode default
