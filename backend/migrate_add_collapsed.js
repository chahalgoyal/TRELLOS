const db = require('./src/db/index');

async function run() {
  try {
    console.log('Adding is_collapsed to lists table...');
    await db.query('ALTER TABLE lists ADD COLUMN is_collapsed BOOLEAN NOT NULL DEFAULT FALSE;');
    console.log('Success!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
