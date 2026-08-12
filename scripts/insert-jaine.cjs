const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../updated data.json'), 'utf8'))[0];
    const userEmail = rawData.email;

    console.log(`Inserting application for: ${userEmail}...`);

    const { data, error } = await supabase
      .from('applications')
      .insert([
        { 
          email: userEmail,
          raw_data: rawData,
          status: 'pending',
          created_at: rawData.created_at || new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log('Success! Application inserted.');
  } catch (err) {
    console.error('Error inserting:', err);
  }
}

run();
