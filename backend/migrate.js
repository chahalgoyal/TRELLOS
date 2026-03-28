const fs = require('fs');
const path = require('path');
const db = require('./src/db/index');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running schema migration...');
    await db.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
