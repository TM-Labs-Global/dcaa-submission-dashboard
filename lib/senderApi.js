import { db } from './db.js';
import { formDailyStats, formSubscribers } from './db/schema.js';

const PAGE_LIMIT = 100;
const MAX_SYNC_PAGES = 50; // safety cap for syncRecentSignups on a first-ever sync

function belongsToGroup(subscriber, groupId) {
  return (subscriber.subscriber_tags || []).some((tag) => tag.id === groupId);
}

// Sender.net enforces a rolling daily quota (exposed via x-quota-remaining /
// x-quota-reset headers), not a short burst limit — a 429 here means the
// account's quota is exhausted until x-quota-reset, so retrying immediately
// is pointless. Surface the reset time in the error instead.
async function fetchSubscribersPage(page) {
  const res = await fetch(
    `${process.env.SENDER_API_BASE_URL}/subscribers?page=${page}&limit=${PAGE_LIMIT}`,
    { headers: { Authorization: `Bearer ${process.env.SENDER_API_KEY}` } }
  );

  if (res.status === 429) {
    const resetAt = res.headers.get('x-quota-reset');
    throw new Error(`Sender.net quota exhausted${resetAt ? `, resets at ${resetAt}` : ''}`);
  }

  if (!res.ok) {
    throw new Error(`Sender.net error: ${res.status}`);
  }

  return res.json();
}

async function upsertDailyCounts(formId, dailyCounts, source) {
  const entries = Object.entries(dailyCounts);

  for (const [date, count] of entries) {
    await db
      .insert(formDailyStats)
      .values({ formId, date, signups: count, source })
      .onConflictDoUpdate({
        target: [formDailyStats.formId, formDailyStats.date],
        set: { signups: count, source },
      });
  }

  return entries.length;
}

async function upsertSubscriber(formId, subscriber) {
  await db
    .insert(formSubscribers)
    .values({
      formId,
      senderSubscriberId: subscriber.id,
      email: subscriber.email,
      firstName: subscriber.firstname || null,
      lastName: subscriber.lastname || null,
      location: subscriber.location || null,
      joinedAt: new Date(subscriber.created.replace(' ', 'T')),
    })
    .onConflictDoUpdate({
      target: [formSubscribers.formId, formSubscribers.senderSubscriberId],
      set: {
        email: subscriber.email,
        firstName: subscriber.firstname || null,
        lastName: subscriber.lastname || null,
        location: subscriber.location || null,
        syncedAt: new Date(),
      },
    });
}

// One-time historical backfill — paginate all subscribers, bucket by day for this group.
// NOTE: the Sender.net `/subscribers` endpoint ignores a `group_id` query param, so group
// membership must be checked client-side via each subscriber's `subscriber_tags` array.
export async function backfillGroupHistory(groupId, formId) {
  let page = 1;
  let lastPage = 1;
  const dailyCounts = {};

  do {
    const { data, meta } = await fetchSubscribersPage(page);
    lastPage = meta.last_page;

    for (const subscriber of data) {
      if (!belongsToGroup(subscriber, groupId)) continue;
      const day = subscriber.created.slice(0, 10); // 'YYYY-MM-DD'
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      await upsertSubscriber(formId, subscriber);
    }

    page++;
  } while (page <= lastPage);

  const daysWritten = await upsertDailyCounts(formId, dailyCounts, 'sender_backfill');

  return { daysWritten, totalSubscribersMatched: Object.values(dailyCounts).reduce((a, b) => a + b, 0) };
}

// Ongoing sync — pulls newest subscribers first, stops once it reaches subscribers
// created before `sinceDate`. Bounded by MAX_SYNC_PAGES as a safety cap.
export async function syncRecentSignups(groupId, formId, sinceDate) {
  let page = 1;
  let lastPage = 1;
  const dailyCounts = {};
  let reachedSinceDate = false;

  const sinceTimestamp = sinceDate ? new Date(sinceDate).getTime() : null;

  do {
    const { data, meta } = await fetchSubscribersPage(page);
    lastPage = meta.last_page;

    for (const subscriber of data) {
      const createdTimestamp = new Date(subscriber.created.replace(' ', 'T')).getTime();

      if (sinceTimestamp !== null && createdTimestamp < sinceTimestamp) {
        reachedSinceDate = true;
        break;
      }

      if (!belongsToGroup(subscriber, groupId)) continue;

      const day = subscriber.created.slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      await upsertSubscriber(formId, subscriber);
    }

    if (reachedSinceDate) break;

    page++;
  } while (page <= lastPage && page <= MAX_SYNC_PAGES);

  const daysWritten = await upsertDailyCounts(formId, dailyCounts, 'sender_sync');

  return { daysWritten, totalSubscribersMatched: Object.values(dailyCounts).reduce((a, b) => a + b, 0) };
}
