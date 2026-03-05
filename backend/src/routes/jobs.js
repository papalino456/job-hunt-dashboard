import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database-postgres.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Build WHERE clause with parameter indexing for PostgreSQL
function buildWhereClause(conditions) {
  const clauses = [];
  const params = [];
  let idx = 1;
  
  for (const [field, value] of Object.entries(conditions)) {
    if (value !== undefined && value !== null) {
      if (field === 'search') {
        clauses.push(`(company ILIKE $${idx} OR role ILIKE $${idx})`);
        params.push(`%${value}%`);
      } else {
        clauses.push(`${field} = $${idx}`);
        params.push(value);
      }
      idx++;
    }
  }
  
  return { clauses, params, nextIndex: idx };
}

// Get all jobs with optional filters
router.get('/', async (req, res) => {
  const { status, priority, search, limit, offset } = req.query;
  
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  let idx = 1;
  
  if (status) {
    query += ` AND status = $${idx}`;
    params.push(status);
    idx++;
  }
  
  if (priority) {
    query += ` AND priority = $${idx}`;
    params.push(priority);
    idx++;
  }
  
  if (search) {
    query += ` AND (company ILIKE $${idx} OR role ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (limit !== undefined) {
    const limitVal = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
    query += ` LIMIT $${idx}`;
    params.push(limitVal);
    idx++;
    
    const offsetVal = Math.max(parseInt(offset) || 0, 0);
    query += ` OFFSET $${idx}`;
    params.push(offsetVal);
    idx++;
  }
  
  try {
    const jobs = await db.all(query, params);
    
    // Parse tags JSON
    jobs.forEach(job => {
      job.tags = JSON.parse(job.tags || '[]');
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await db.get('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    job.tags = JSON.parse(job.tags || '[]');
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new job
router.post('/', async (req, res) => {
  const {
    company,
    role,
    location,
    posting_url,
    date_discovered = new Date().toISOString().split('T')[0],
    salary_range,
    team_info,
    hiring_manager,
    referral_contact,
    status = 'discovered',
    priority = 'P1',
    deadline,
    cv_version,
    date_applied,
    last_contact,
    notes = '',
    research_status = 'pending',
    source = 'manual',
    tags = []
  } = req.body;
  
  if (!company || !role || !location || !posting_url) {
    return res.status(400).json({ 
      error: 'Missing required fields: company, role, location, posting_url' 
    });
  }
  
  const id = uuidv4();
  
  try {
    await db.run(`
      INSERT INTO jobs (
        id, company, role, location, posting_url, date_discovered,
        salary_range, team_info, hiring_manager, referral_contact,
        status, priority, deadline,
        cv_version, date_applied, last_contact, notes,
        research_status, source, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, [
      id, company, role, location, posting_url, date_discovered,
      salary_range, team_info, hiring_manager, referral_contact,
      status, priority, deadline,
      cv_version, date_applied, last_contact, notes,
      research_status, source, JSON.stringify(tags)
    ]);
    
    res.status(201).json({ id, ...req.body, tags });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update job
router.patch('/:id', async (req, res) => {
  const updates = [];
  const params = [];
  let idx = 1;
  
  const allowedFields = [
    'company', 'role', 'location', 'posting_url', 'date_discovered',
    'salary_range', 'team_info', 'hiring_manager', 'referral_contact',
    'status', 'priority', 'deadline',
    'cv_version', 'date_applied', 'last_contact', 'notes',
    'research_status', 'source', 'tags'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx}`);
      params.push(
        field === 'tags' ? JSON.stringify(req.body[field]) : req.body[field]
      );
      idx++;
    }
  });
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(req.params.id);
  
  try {
    const result = await db.run(`
      UPDATE jobs 
      SET ${updates.join(', ')} 
      WHERE id = $${idx}
    `, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const statsByStatus = await db.all(`
      SELECT status, COUNT(*) as count 
      FROM jobs 
      GROUP BY status
    `);
    
    const statsByPriority = await db.all(`
      SELECT priority, COUNT(*) as count 
      FROM jobs 
      GROUP BY priority
    `);
    
    const statsByResearch = await db.all(`
      SELECT research_status, COUNT(*) as count 
      FROM jobs 
      GROUP BY research_status
    `);
    
    const recent = await db.get(`
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE date_discovered >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const total = await db.get(`
      SELECT COUNT(*) as count FROM jobs
    `);
    
    const readyToApply = await db.get(`
      SELECT COUNT(*) as count FROM jobs WHERE status = 'ready'
    `);
    
    res.json({
      total: parseInt(total.count),
      byStatus: statsByStatus.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {}),
      byPriority: statsByPriority.reduce((acc, row) => ({ ...acc, [row.priority]: parseInt(row.count) }), {}),
      byResearch: statsByResearch.reduce((acc, row) => ({ ...acc, [row.research_status]: parseInt(row.count) }), {}),
      recentApplications: parseInt(recent.count),
      readyToApply: parseInt(readyToApply.count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
