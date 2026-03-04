import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all jobs with optional filters
router.get('/', async (req, res) => {
  const { status, priority, search } = req.query;
  
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  if (search) {
    query += ' AND (company LIKE ? OR role LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC';
  
  try {
    const jobs = await db.allAsync(query, params);
    
    // Parse tags JSON
    jobs.forEach(job => {
      job.tags = JSON.parse(job.tags || '[]');
    });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    job.tags = JSON.parse(job.tags || '[]');
    res.json(job);
  } catch (error) {
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
    await db.runAsync(`
      INSERT INTO jobs (
        id, company, role, location, posting_url, date_discovered,
        salary_range, team_info, hiring_manager, referral_contact,
        status, priority, deadline,
        cv_version, date_applied, last_contact, notes,
        research_status, source, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, company, role, location, posting_url, date_discovered,
      salary_range, team_info, hiring_manager, referral_contact,
      status, priority, deadline,
      cv_version, date_applied, last_contact, notes,
      research_status, source, JSON.stringify(tags)
    ]);
    
    res.status(201).json({ id, ...req.body, tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job
router.patch('/:id', async (req, res) => {
  const updates = [];
  const params = [];
  
  const allowedFields = [
    'company', 'role', 'location', 'posting_url', 'date_discovered',
    'salary_range', 'team_info', 'hiring_manager', 'referral_contact',
    'status', 'priority', 'deadline',
    'cv_version', 'date_applied', 'last_contact', 'notes',
    'research_status', 'source', 'tags'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(
        field === 'tags' ? JSON.stringify(req.body[field]) : req.body[field]
      );
    }
  });
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updates.push('updated_at = datetime("now")');
  params.push(req.params.id);
  
  try {
    const result = await db.runAsync(`
      UPDATE jobs 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.runAsync('DELETE FROM jobs WHERE id = ?', req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/api/stats', async (req, res) => {
  try {
    const statsByStatus = await db.allAsync(`
      SELECT status, COUNT(*) as count 
      FROM jobs 
      GROUP BY status
    `);
    
    const statsByPriority = await db.allAsync(`
      SELECT priority, COUNT(*) as count 
      FROM jobs 
      GROUP BY priority
    `);
    
    const recent = await db.getAsync(`
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE date_discovered >= date('now', '-7 days')
    `);
    
    res.json({
      byStatus: statsByStatus,
      byPriority: statsByPriority,
      recentApplications: recent.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
