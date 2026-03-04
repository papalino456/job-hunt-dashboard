#!/usr/bin/env node
/**
 * Migrate data from SQLite to PostgreSQL
 * Usage: node scripts/migrate-to-postgres.js
 * Requires DATABASE_URL environment variable for PostgreSQL
 */

import sqlite3 from 'sqlite3';
import pg from 'pg';
import { open } from 'sqlite';

const { Pool } = pg;

const SQLITE_PATH = process.env.SQLITE_PATH || './data/jobs.db';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Example: DATABASE_URL=postgresql://user:pass@host/db node scripts/migrate-to-postgres.js');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting migration...');
  console.log(`📁 SQLite: ${SQLITE_PATH}`);
  console.log(`🐘 PostgreSQL: ${DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  // Connect to SQLite
  const sqliteDb = await open({
    filename: SQLITE_PATH,
    driver: sqlite3.Database
  });
  
  // Connect to PostgreSQL
  const pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Get all jobs from SQLite
    const jobs = await sqliteDb.all('SELECT * FROM jobs');
    console.log(`📊 Found ${jobs.length} jobs in SQLite`);
    
    if (jobs.length === 0) {
      console.log('✅ No jobs to migrate');
      return;
    }
    
    // Clear existing data in PostgreSQL
    await pgPool.query('DELETE FROM jobs');
    console.log('🧹 Cleared existing PostgreSQL data');
    
    // Insert jobs into PostgreSQL
    let inserted = 0;
    let errors = 0;
    
    for (const job of jobs) {
      try {
        await pgPool.query(`
          INSERT INTO jobs (
            id, company, role, location, posting_url, date_discovered,
            salary_range, team_info, hiring_manager, referral_contact,
            status, priority, deadline,
            cv_version, date_applied, last_contact, notes,
            research_status, source, tags,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO UPDATE SET
            company = EXCLUDED.company,
            role = EXCLUDED.role,
            updated_at = EXCLUDED.updated_at
        `, [
          job.id,
          job.company,
          job.role,
          job.location,
          job.posting_url,
          job.date_discovered,
          job.salary_range,
          job.team_info,
          job.hiring_manager,
          job.referral_contact,
          job.status,
          job.priority,
          job.deadline,
          job.cv_version,
          job.date_applied,
          job.last_contact,
          job.notes,
          job.research_status,
          job.source,
          job.tags,
          job.created_at,
          job.updated_at
        ]);
        inserted++;
        process.stdout.write(`\r💾 Inserted: ${inserted}/${jobs.length}`);
      } catch (err) {
        errors++;
        console.error(`\n❌ Error inserting job ${job.id} (${job.company}):`, err.message);
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Errors: ${errors}`);
    
    // Verify count
    const result = await pgPool.query('SELECT COUNT(*) FROM jobs');
    console.log(`📊 PostgreSQL now has ${result.rows[0].count} jobs`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sqliteDb.close();
    await pgPool.end();
  }
}

migrate();
