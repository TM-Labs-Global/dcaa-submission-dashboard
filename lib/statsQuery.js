import { db } from './db.js';
import { formDailyStats, syncLogs, formSubscribers } from './db/schema.js';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { FORMS, getFormConfig } from '../config/sites.js';

function daysBetween(dateFrom, dateTo) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  return Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
}

function shiftRangeBack(dateFrom, dateTo) {
  const rangeLength = daysBetween(dateFrom, dateTo);
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);

  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - (rangeLength - 1));

  return {
    dateFrom: previousFrom.toISOString().slice(0, 10),
    dateTo: previousTo.toISOString().slice(0, 10),
  };
}

async function getLastSuccessfulSyncTimestamp(formId) {
  const rows = await db
    .select()
    .from(syncLogs)
    .where(eq(syncLogs.formId, formId))
    .orderBy(desc(syncLogs.ranAt))
    .limit(10);

  const lastSuccess = rows.find((r) => r.status === 'success');
  return lastSuccess?.ranAt ?? null;
}

function last30DaysRange() {
  const dateTo = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 29);
  const dateFrom = fromDate.toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}

async function getSignupsForRange(formId, dateFrom, dateTo) {
  const rows = await db
    .select()
    .from(formDailyStats)
    .where(
      and(
        eq(formDailyStats.formId, formId),
        gte(formDailyStats.date, dateFrom),
        lte(formDailyStats.date, dateTo)
      )
    )
    .orderBy(formDailyStats.date);

  return rows;
}

export async function getFormStats(formId, dateFrom, dateTo) {
  const form = getFormConfig(formId);

  try {
    const daily = await getSignupsForRange(formId, dateFrom, dateTo);
    const signups = daily.reduce((sum, row) => sum + (row.signups || 0), 0);

    const previousRange = shiftRangeBack(dateFrom, dateTo);
    const previousDaily = await getSignupsForRange(
      formId,
      previousRange.dateFrom,
      previousRange.dateTo
    );
    const previousPeriodSignups = previousDaily.reduce((sum, row) => sum + (row.signups || 0), 0);

    let periodComparison = null;
    if (previousDaily.length > 0) {
      const percentChange =
        previousPeriodSignups === 0
          ? null
          : Math.round(((signups - previousPeriodSignups) / previousPeriodSignups) * 1000) / 10;

      periodComparison = { previousPeriodSignups, percentChange };
    }

    // Signature sparkline always shows a fixed trailing 30-day window,
    // independent of whatever date range the viewer has filtered to.
    const sparklineRange = last30DaysRange();
    const sparklineDaily = await getSignupsForRange(
      formId,
      sparklineRange.dateFrom,
      sparklineRange.dateTo
    );

    return {
      formId: form.id,
      formName: form.formName,
      websiteName: form.websiteName,
      signups,
      periodComparison,
      daily: daily.map((row) => ({ date: row.date, signups: row.signups || 0 })),
      sparkline: sparklineDaily.map((row) => ({ date: row.date, signups: row.signups || 0 })),
      error: null,
    };
  } catch (error) {
    console.error(`Failed to get stats for form ${formId}:`, error);
    return {
      formId: form.id,
      formName: form.formName,
      websiteName: form.websiteName,
      signups: null,
      periodComparison: null,
      daily: [],
      sparkline: [],
      error: error.message,
    };
  }
}

export async function getAllFormStats(dateFrom, dateTo) {
  const results = await Promise.all(
    FORMS.map((form) => getFormStats(form.id, dateFrom, dateTo))
  );

  return results;
}

// All-time total, independent of any date filter — used by the Overview
// grid, which always reflects the current running total per form.
export async function getFormTotal(formId) {
  const form = getFormConfig(formId);

  try {
    const rows = await db
      .select()
      .from(formDailyStats)
      .where(eq(formDailyStats.formId, formId));

    const total = rows.reduce((sum, row) => sum + (row.signups || 0), 0);

    const sparklineRange = last30DaysRange();
    const sparklineDaily = await getSignupsForRange(
      formId,
      sparklineRange.dateFrom,
      sparklineRange.dateTo
    );

    return {
      formId: form.id,
      formName: form.formName,
      websiteName: form.websiteName,
      total,
      sparkline: sparklineDaily.map((row) => ({ date: row.date, signups: row.signups || 0 })),
      error: null,
    };
  } catch (error) {
    console.error(`Failed to get total for form ${formId}:`, error);
    return {
      formId: form.id,
      formName: form.formName,
      websiteName: form.websiteName,
      total: null,
      sparkline: [],
      error: error.message,
    };
  }
}

export async function getAllFormTotals() {
  const results = await Promise.all(FORMS.map((form) => getFormTotal(form.id)));
  return results;
}

export async function getFormSubscribers(formId) {
  const rows = await db
    .select()
    .from(formSubscribers)
    .where(eq(formSubscribers.formId, formId))
    .orderBy(desc(formSubscribers.joinedAt));

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    location: row.location,
    joinedAt: row.joinedAt,
  }));
}

export async function getLatestSyncTimestamp() {
  const rows = await db
    .select()
    .from(syncLogs)
    .where(eq(syncLogs.status, 'success'))
    .orderBy(desc(syncLogs.ranAt))
    .limit(1);

  return rows[0]?.ranAt ?? null;
}
