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
