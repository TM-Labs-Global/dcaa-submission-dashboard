import { db } from '@/lib/db';
import { syncLogs } from '@/lib/db/schema';
import { syncRecentSignups } from '@/lib/senderApi';
import { FORMS } from '@/config/sites';
import { desc, eq } from 'drizzle-orm';

export const maxDuration = 30;

async function getLastSuccessfulSync(formId) {
  const rows = await db
    .select()
    .from(syncLogs)
    .where(eq(syncLogs.formId, formId))
    .orderBy(desc(syncLogs.ranAt))
    .limit(10);

  const lastSuccess = rows.find((r) => r.status === 'success');
  return lastSuccess?.ranAt ?? null;
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const results = [];

  for (const form of FORMS) {
    try {
      const sinceDate = await getLastSuccessfulSync(form.id);

      const { daysWritten, totalSubscribersMatched } = await syncRecentSignups(
        form.senderGroupId,
        form.id,
        sinceDate
      );

      await db.insert(syncLogs).values({
        formId: form.id,
        syncType: 'sender',
        status: 'success',
      });

      results.push({ formId: form.id, status: 'success', daysWritten, totalSubscribersMatched });
    } catch (error) {
      console.error(`Sync failed for form ${form.id}:`, error);

      await db.insert(syncLogs).values({
        formId: form.id,
        syncType: 'sender',
        status: 'failed',
        errorMessage: error.message,
      });

      results.push({ formId: form.id, status: 'failed', error: error.message });
    }
  }

  const anyFailed = results.some((r) => r.status === 'failed');

  return Response.json(
    { results, ranAt: new Date().toISOString() },
    { status: anyFailed ? 207 : 200 }
  );
}
