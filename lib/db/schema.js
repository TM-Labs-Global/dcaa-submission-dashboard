import { pgTable, text, uuid, timestamp, integer, date, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('viewer'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email'),
  token: text('token').unique().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const formDailyStats = pgTable(
  'form_daily_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    formId: text('form_id').notNull(),
    date: date('date').notNull(),
    signups: integer('signups'),
    source: text('source').notNull(),
  },
  (table) => ({
    uniqueFormDate: unique('unique_form_date').on(table.formId, table.date),
  })
);

export const syncLogs = pgTable('sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: text('form_id'),
  syncType: text('sync_type').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  ranAt: timestamp('ran_at').defaultNow(),
});

// Individual subscriber records, scoped per form. Visible only to
// authenticated admin/viewer users already trusted with this data (same
// people who could see it directly in Sender.net) — never exposed publicly.
export const formSubscribers = pgTable(
  'form_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    formId: text('form_id').notNull(),
    senderSubscriberId: text('sender_subscriber_id').notNull(),
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    location: text('location'),
    joinedAt: timestamp('joined_at').notNull(),
    syncedAt: timestamp('synced_at').defaultNow(),
  },
  (table) => ({
    uniqueFormSubscriber: unique('unique_form_subscriber').on(table.formId, table.senderSubscriberId),
  })
);
