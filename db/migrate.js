const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:albinoblacksheep1234321@localhost:5432/tcg_tracker'
});

(async () => {
  try {
    console.log('Adding is_admin column to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE');
    console.log('✓ Column added successfully');

    // Also add card_name column to inventory if missing
    console.log('Adding card_name column to inventory table...');
    await pool.query('ALTER TABLE inventory ADD COLUMN IF NOT EXISTS card_name VARCHAR(255)');
    console.log('✓ card_name column added successfully');

    // Mark first user as admin
    const firstUser = await pool.query('SELECT id, email FROM users ORDER BY id LIMIT 1');
    if (firstUser.rows.length > 0) {
      const userId = firstUser.rows[0].id;
      const email = firstUser.rows[0].email;
      await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [userId]);
      console.log(`✓ Marked user "${email}" (id: ${userId}) as admin`);
    }

    pool.end();
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    pool.end();
    process.exit(1);
  }
})();
