// db/init.js
// Idempotent database initialization on sidecar startup
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DEFAULT_ADMIN_CONN = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/\/[^/]+$/, '/postgres')
  : 'postgresql://postgres:albinoblacksheep1234321@localhost:5432/postgres';

const DEFAULT_DB_CONN = process.env.DATABASE_URL
  || 'postgresql://postgres:albinoblacksheep1234321@localhost:5432/tcg_tracker';

const DB_NAME = 'tcg_tracker';
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function waitForPostgres(maxMs = 30000) {
  const interval = 1000;
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const pool = new Pool({ connectionString: DEFAULT_ADMIN_CONN });
    try {
      await pool.query('SELECT 1');
      await pool.end();
      return;
    } catch {
      await pool.end().catch(() => {});
      await new Promise(r => setTimeout(r, interval));
    }
  }
  throw new Error('PostgreSQL did not become available within 30 seconds.');
}

async function ensureDatabase() {
  const pool = new Pool({ connectionString: DEFAULT_ADMIN_CONN });
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]
    );
    if (rows.length === 0) {
      console.log(`[init] Creating database "${DB_NAME}"...`);
      await pool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`[init] Database "${DB_NAME}" created.`);
    }
  } finally {
    await pool.end();
  }
}

async function runSchema() {
  const pool = new Pool({ connectionString: DEFAULT_DB_CONN });
  try {
    const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await pool.query(sql);
    // Ensure card_name column exists (migration)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS card_name VARCHAR(255)`);
    console.log('[init] Schema applied.');
  } finally {
    await pool.end();
  }
}

module.exports = async function initDatabase() {
  console.log('[init] Waiting for PostgreSQL...');
  await waitForPostgres();
  console.log('[init] PostgreSQL ready. Ensuring database and schema...');
  await ensureDatabase();
  await runSchema();
  console.log('[init] Database ready.');
};
