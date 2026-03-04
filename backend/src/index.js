import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import './db/database-postgres.js'; // Initialize PostgreSQL connection

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (needed for Render)
app.set('trust proxy', 1);

// CORS - allow same-origin and configured frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL, // Render sets this automatically
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow same-origin requests (production - frontend and API on same domain)
    if (isProduction && origin.includes('onrender.com')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: true,  // Changed to true to always create session
  cookie: {
    secure: isProduction,  // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'postgresql',
    sessionSecret: process.env.SESSION_SECRET ? 'set' : 'not set',
    nodeEnv: process.env.NODE_ENV
  });
});

// Serve frontend in production
if (isProduction) {
  const staticPath = join(__dirname, '../../frontend/dist');
  
  // Serve static files
  app.use(express.static(staticPath));
  
  // Serve route-specific HTML files
  app.get('/login', (req, res) => {
    res.sendFile(join(staticPath, 'login.html'));
  });
  
  app.get('/dashboard', (req, res) => {
    res.sendFile(join(staticPath, 'dashboard.html'));
  });
  
  // Serve index.html for root and other routes
  app.get('/', (req, res) => {
    res.sendFile(join(staticPath, 'index.html'));
  });
  
  // Fallback for client-side routing
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
