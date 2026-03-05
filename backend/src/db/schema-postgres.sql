-- PostgreSQL schema for job hunt dashboard

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  posting_url TEXT NOT NULL,
  date_discovered DATE NOT NULL,
  
  -- Optional/research fields
  salary_range TEXT,
  team_info TEXT,
  hiring_manager TEXT,
  referral_contact TEXT,
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'discovered',
  priority TEXT NOT NULL DEFAULT 'P1',
  deadline DATE,
  
  -- Application tracking
  cv_version TEXT,
  date_applied DATE,
  last_contact DATE,
  notes TEXT DEFAULT '',
  
  -- Metadata
  research_status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'manual',
  tags TEXT DEFAULT '[]',
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);

-- Attachments table for job-related files (CVs, cover letters, etc.)
-- File content is stored directly in Postgres as BYTEA for persistence.
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_data BYTEA,            -- binary file content stored in DB
  file_path TEXT,             -- legacy: nullable, kept for backward compat
  type TEXT DEFAULT 'other',  -- cv, cover_letter, offer, other
  description TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_job_id ON attachments(job_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(type);
