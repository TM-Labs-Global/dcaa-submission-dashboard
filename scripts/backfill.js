import { backfillGroupHistory } from '../lib/senderApi.js';
import { db } from '../lib/db.js';
import { syncLogs } from '../lib/db/schema.js';
import { FORMS } from '../config/sites.js';

async function runBackfill() {
  console.log(`🔄 Starting historical backfill for ${FORMS.length} forms...\n`);

  for (const form of FORMS) {
    console.log(`--- ${form.formName} (${form.websiteName}) — group ${form.senderGroupId} ---`);

    try {
      const { daysWritten, totalSubscribersMatched } = await backfillGroupHistory(
        form.senderGroupId,
        form.id
      );

      await db.insert(syncLogs).values({
        formId: form.id,
        syncType: 'sender',
        status: 'success',
      });

      console.log(
        `✅ Backfilled ${daysWritten} days, ${totalSubscribersMatched} total subscribers matched\n`
      );
    } catch (error) {
      await db.insert(syncLogs).values({
        formId: form.id,
        syncType: 'sender',
        status: 'failed',
        errorMessage: error.message,
      });

      console.error(`❌ Backfill failed for ${form.id}:`, error.message, '\n');
    }
  }

  console.log('🏁 Backfill complete.');
  process.exit(0);
}

runBackfill().catch((error) => {
  console.error('❌ Backfill script crashed:', error);
  process.exit(1);
});
