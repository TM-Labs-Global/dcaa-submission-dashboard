# DCAA Applications Dashboard

An internal admin dashboard for reviewing and managing incoming applications for the **Digital Creator Academy Africa (DCAA)** programme. Built with Next.js, Supabase, and NextAuth.

## What It Does

- **Displays applications** submitted via WordPress Fluent Forms (received through a webhook and stored in Supabase).
- **Filters** applications by stream, date range, and sub-stream.
- **Exports** filtered or all applications to CSV, Excel, or JSON.
- **User management** — invite users, approve/pause/remove access, manage admin roles.
- **Secure authentication** via email/password with NextAuth.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root with the following values:

```env
# Database (Neon / Postgres)
DATABASE_URL=

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Encryption for stored credentials (32-byte key, base64-encoded)
CREDENTIALS_ENCRYPTION_KEY=

# Supabase (Fluent Forms application data)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin Seed Credentials (used only by the seed script)
ADMIN_EMAIL_1=
ADMIN_PASSWORD_1=
ADMIN_EMAIL_2=
ADMIN_PASSWORD_2=
```

Generate secrets with:
```bash
openssl rand -base64 32
```

### 3. Seed Admin Users

```bash
node scripts/seed-admin.js
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Neon (PostgreSQL) via Drizzle ORM
- **Application Data**: Supabase (receives Fluent Forms webhook data)
- **Auth**: NextAuth.js (credentials provider)
- **UI**: Shadcn/ui + Tailwind CSS
- **Icons**: Phosphor Icons + Lucide

## Deployment

Deploy on [Vercel](https://vercel.com). Set all environment variables in the Vercel dashboard and update `NEXTAUTH_URL` to your production domain.
