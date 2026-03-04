import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection and initialize
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Run schema
    const schema = readFileSync(join(__dirname, 'schema-postgres.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Database schema initialized');
    
    client.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

// Database helper methods
const db = {
  async query(text, params) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
      return result;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  },
  
  async get(text, params) {
    const result = await this.query(text, params);
    return result.rows[0];
  },
  
  async all(text, params) {
    const result = await this.query(text, params);
    return result.rows;
  },
  
  async run(text, params) {
    const result = await this.query(text, params);
    return result;
  },
  
  // For compatibility with sqlite3 interface
  getAsync: function(text, params) { return this.get(text, params); },
  allAsync: function(text, params) { return this.all(text, params); },
  runAsync: function(text, params) { return this.run(text, params); }
};

// Initialize on import
await initDatabase();

export default db;
export { pool };
