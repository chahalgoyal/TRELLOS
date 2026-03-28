const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add is_starred column
    console.log('Adding is_starred to boards...');
    await client.query(`
      ALTER TABLE boards 
      ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
