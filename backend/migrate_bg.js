const db = require('./src/db/index');

async function run() {
  try {
    console.log('Adding bg_type and bg_value to lists table...');
    await db.query(`ALTER TABLE lists ADD COLUMN IF NOT EXISTS bg_type VARCHAR(20) DEFAULT NULL CHECK (bg_type IN ('color','gradient','image'));`);
    await db.query(`ALTER TABLE lists ADD COLUMN IF NOT EXISTS bg_value VARCHAR(255) DEFAULT NULL;`);
    
    console.log('Adding cover_mode to cards table...');
    await db.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS cover_mode VARCHAR(10) DEFAULT 'top' CHECK (cover_mode IN ('top','full'));`);
    
    console.log('Success!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
