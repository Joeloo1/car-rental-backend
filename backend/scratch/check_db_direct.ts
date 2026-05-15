import { Pool } from 'pg';
import 'dotenv/config';

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Car'
    `);
    console.log('Columns in Car table (Physical DB):');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error checking columns:', err);
  } finally {
    await pool.end();
  }
}

check();
