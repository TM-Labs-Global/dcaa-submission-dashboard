import fs from 'fs';
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
  const dataPath = path.join(__dirname, '../Main-Application-Form-2026-08-11.json');
  if (!fs.existsSync(dataPath)) {
    console.error("JSON file not found at", dataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  let entries;
  try {
    entries = JSON.parse(rawData);
  } catch (e) {
    console.error("Failed to parse JSON file", e);
    process.exit(1);
  }

  console.log(`Found ${entries.length} historical entries. Preparing to backfill...`);
  
  const payloads = entries.map(entry => {
    const rawDataPayload = {
      ...entry,
      __submission: {
        user_inputs: entry.user_inputs || {}
      }
    };

    const email = entry.email || (entry.user_inputs && entry.user_inputs.email) || (entry.response && entry.response.email) || null;

    let createdAt = new Date().toISOString();
    if (entry.created_at) {
      const d = new Date(entry.created_at.replace(' ', 'T') + 'Z'); 
      if (!isNaN(d)) {
        createdAt = d.toISOString();
      }
    }

    return {
      email: email,
      status: entry.status === 'read' ? 'read' : 'unread',
      created_at: createdAt,
      raw_data: rawDataPayload
    };
  });

  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    const batch = payloads.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('applications')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`Inserted ${successCount} / ${payloads.length} entries...`);
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`Successfully inserted: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

run();
