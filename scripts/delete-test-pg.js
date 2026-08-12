import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

const client = new pg.Client({
  connectionString
});

async function run() {
  await client.connect();
  const emails = ['test@takeoutmedia.xyz', 'casmir2000@gmail.com', 'johnuguru73@gmail.com'];
  
  console.log('Executing direct SQL delete...');
  
  const query = {
    text: 'DELETE FROM applications WHERE email = ANY($1) RETURNING *',
    values: [emails],
  };

  try {
    const res = await client.query(query);
    console.log(`Successfully deleted ${res.rowCount} test entries.`);
  } catch (err) {
    console.error('Error executing delete:', err.stack);
  } finally {
    await client.end();
  }
}

run();
