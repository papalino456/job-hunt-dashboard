import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import './db/database-postgres.js'; // Initialize PostgreSQL connection

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'postgresql' });
});

// Serve frontend in production
if (isProduction) {
  const staticPath = join(__dirname, '../../frontend/dist');
  
  app.use(express.static(staticPath));
  
  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(join(staticPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🐘 Using PostgreSQL database`);
  if (isProduction) {
    console.log(`📦 Serving frontend static files`);
  }
});
