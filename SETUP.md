# Setup Instructions

## Phase 2-3 Setup Checklist

### 1. Run Database Migrations

Copy the SQL from `migrations/0001_init.sql` and run it in your Supabase SQL Editor:

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Click "+ New Query"
3. Paste the entire contents of `migrations/0001_init.sql`
4. Click "Run"
5. Verify all 4 tables were created (users, invites, form_daily_stats, sync_logs)

### 2. Seed Initial Admin User

Edit `scripts/seed-admin.js` and change:
- `ADMIN_EMAIL` to your email (e.g., kachi@example.com)
- `ADMIN_PASSWORD` to a secure password

Then run:
```bash
node --env-file=.env.local scripts/seed-admin.js
```

You should see:
```
🌱 Seeding admin user...
✅ Admin user created!
   Email: your-email@example.com
   Password: YourSecurePassword123!
```

**Important:** Change your password after first login!

### 3. Environment Variables Status

✅ `.env.local` has been populated with:
- `DATABASE_URL` — your Supabase connection string
- `NEXTAUTH_SECRET` — generated random 32-byte key
- `NEXTAUTH_URL` — set to http://localhost:3000
- `CREDENTIALS_ENCRYPTION_KEY` — generated random 32-byte key
- `CRON_SECRET` — generated random 32-byte key
- `SENDER_API_BASE_URL` — set to https://api.sender.net/v2

⏳ Still needed (can defer):
- `SENDER_API_KEY` — already in .env from old code (verify it's valid)
- `RESEND_API_KEY` — optional for now (invites work via manual link copy)
- `RESEND_FROM_EMAIL` — optional for now

### 4. Test the Setup

Once migrations are done and admin user is seeded:

```bash
npm run dev
```

Then:
1. Go to http://localhost:3000/login
2. Sign in with your admin email and password
3. You should be redirected to `/dashboard`
4. Click "Users & Access" in the sidebar (admin-only)
5. You should see your user listed as "Active" with "Admin" role

### 5. Ready for Phase 4

Once tests pass, you're ready for Phase 4 (Sender.net Integration).
