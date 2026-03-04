import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/jobs.db';

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch (err) {
  // Directory already exists
}

const db = new sqlite3.Database(dbPath);

// Promisify database methods
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
  console.log('✅ Database initialized');
});

export default db;
