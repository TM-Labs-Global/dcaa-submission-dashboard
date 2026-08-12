import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  const emails = ['test@takeoutmedia.xyz', 'casmir2000@gmail.com', 'johnuguru73@gmail.com'];
  
  console.log('Executing direct SQL delete using postgres.js...');
  
  try {
    const res = await sql`
      DELETE FROM applications
      WHERE email IN ${sql(emails)}
      RETURNING *
    `;
    console.log(`Successfully deleted ${res.length} test entries.`);
  } catch (err) {
    console.error('Error executing delete:', err.message);
  } finally {
    await sql.end();
  }
}

run();
