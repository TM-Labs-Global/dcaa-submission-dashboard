import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const testEmails = [
    'test@takeoutmedia.xyz',
    'casmir2000@gmail.com',
    'johnuguru73@gmail.com'
  ];

  console.log(`Preparing to delete test entries for emails: ${testEmails.join(', ')}`);

  const { data, error } = await supabase
    .from('applications')
    .delete()
    .in('email', testEmails);

  if (error) {
    console.error("Error deleting entries:", error.message);
  } else {
    console.log("Successfully deleted the test entries from the database.");
  }
}

run();
