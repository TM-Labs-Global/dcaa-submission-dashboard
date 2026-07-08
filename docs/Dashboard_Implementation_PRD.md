# Implementation PRD — Multi-Brand Marketing Funnel Dashboard
**For: Antigravity Build Agent**
**Source: Product PRD (Multi-Brand Marketing Funnel Dashboard)**
**Stack: Next.js (App Router), Tailwind CSS, mysql2, native fetch**

> This document translates the product PRD into a build-ready spec: exact file structure, env vars, function contracts, error states, and edge cases. The agent should treat every section below as a requirement, not a suggestion. Where the original PRD was ambiguous, a decision has been made explicitly and flagged with **[DECISION]**.

---

## 1. Project Structure

```
/app
  /api
    /analytics
      route.js
  /dashboard (or app/page.js if this is the only page)
    page.js
  layout.js
/components
  BrandSwitcher.jsx
  MetricCard.jsx
  MetricGrid.jsx
  ErrorBlock.jsx
  LoadingSkeleton.jsx
/lib
  db.js              // mysql2 connection helper
  senderApi.js        // Sender.net fetch helper
  brandConfig.js       // maps brandA/brandB -> resolved env config
  calc.js             // conversion rate math
/.env.local
/.env.example          // committed, no real secrets
```

**[DECISION]** Centralize all brand-to-config mapping in `lib/brandConfig.js` rather than scattering `process.env.BRAND_A_*` lookups across the API route. This is the single source of truth and the only place that needs editing if a Brand C is ever added.

---

## 2. Environment Variables

Create `.env.local` (gitignored) and a `.env.example` (committed, placeholder values) with this exact shape:

```env
# Brand A
BRAND_A_DB_HOST=
BRAND_A_DB_PORT=3306
BRAND_A_DB_NAME=
BRAND_A_DB_USER=
BRAND_A_DB_PASSWORD=
BRAND_A_FUNNEL_SLUG=/get-my-report-a/
BRAND_A_SENDER_API_KEY=
BRAND_A_SENDER_FORM_ID=

# Brand B
BRAND_B_DB_HOST=
BRAND_B_DB_PORT=3306
BRAND_B_DB_NAME=
BRAND_B_DB_USER=
BRAND_B_DB_PASSWORD=
BRAND_B_FUNNEL_SLUG=/get-my-report-b/
BRAND_B_SENDER_API_KEY=
BRAND_B_SENDER_FORM_ID=

# Misc
SENDER_API_BASE_URL=https://api.sender.net/v2
DB_SSL_REJECT_UNAUTHORIZED=true
```

**[DECISION]** `DB_SSL_REJECT_UNAUTHORIZED` is a flag, not hardcoded, so it can be relaxed temporarily in staging without code changes — but defaults to `true` in production. The agent must throw a startup error if any required var is missing rather than silently falling back to `undefined`.

---

## 3. `lib/brandConfig.js` — Brand Resolution Contract

```js
// Input: brandKey = "brandA" | "brandB"
// Output: a fully resolved config object, or throws if brandKey is invalid
export function getBrandConfig(brandKey) {
  const map = {
    brandA: {
      db: {
        host: process.env.BRAND_A_DB_HOST,
        port: Number(process.env.BRAND_A_DB_PORT) || 3306,
        database: process.env.BRAND_A_DB_NAME,
        user: process.env.BRAND_A_DB_USER,
        password: process.env.BRAND_A_DB_PASSWORD,
      },
      funnelSlug: process.env.BRAND_A_FUNNEL_SLUG,
      sender: {
        apiKey: process.env.BRAND_A_SENDER_API_KEY,
        formId: process.env.BRAND_A_SENDER_FORM_ID,
      },
    },
    brandB: { /* mirror structure */ },
  };

  const config = map[brandKey];
  if (!config) throw new Error(`Invalid brand key: ${brandKey}`);
  return config;
}
```

**Validation rule:** every nested value must be checked for `undefined`/empty string at request time, not just at module load — env vars can be present-but-empty in some deploy targets (e.g. Vercel preview branches missing a secret). If any required field is missing, the API route must return a `500` with a clear (non-leaky) message: `"Server configuration error for brand."` — never include the variable name or value in the response body or logs that reach the client.

---

## 4. `app/api/analytics/route.js` — API Contract

### Request
`GET /api/analytics?brand=brandA`

- Accepted values: `brandA`, `brandB`.
- **[DECISION]** Any other value (including empty, missing, or malformed) → fallback to `brandA`, per original PRD. Do not 400 on bad input; the PRD explicitly wants graceful fallback for the dropdown UX.

### Response (200 — success)
```json
{
  "totalSiteImpressions": 25400,
  "formPageImpressions": 1200,
  "totalDownloads": 350,
  "conversionRate": 29.17,
  "brand": "brandA",
  "fetchedAt": "2026-06-25T10:00:00.000Z"
}
```
**[DECISION]** Added `brand` and `fetchedAt` to the contract beyond the original PRD's JSON sample. The frontend needs `brand` to guard against race conditions (see §6), and `fetchedAt` is needed to make the 30-minute cache visible/debuggable in the UI later. This does not violate "no historical trends" — it's a single timestamp, not a series.

### Response (error — partial or total failure)
**[DECISION]** Use partial-success responses rather than failing the whole request if only one upstream system (DB or Sender.net) fails. This matters: a WordPress DB hiccup shouldn't blank out the Sender.net subscriber count too.

```json
{
  "totalSiteImpressions": 25400,
  "formPageImpressions": 1200,
  "totalDownloads": null,
  "conversionRate": null,
  "brand": "brandA",
  "fetchedAt": "2026-06-25T10:00:00.000Z",
  "errors": {
    "sender": "Failed to reach Sender.net API",
    "database": null
  }
}
```
HTTP status stays `200` when at least one source succeeded (frontend renders per-card error states). Use `502` only when **both** sources fail, with the same `errors` shape and null metrics.

### Caching — Vercel-specific
- **Hosting confirmed: Vercel.** Vercel functions are stateless/ephemeral per invocation, so an in-memory `Map` cache does NOT persist reliably across requests (different invocations may land on different instances). The earlier in-memory-cache plan for the DB query is dropped.
- Sender.net fetch: `fetch(url, { next: { revalidate: 1800 } })` exactly as specified — this is the one caching mechanism that *does* survive across invocations, since Vercel's Data Cache persists `fetch`-based caching independent of which instance handles the request.
- **MySQL query: no caching layer.** Let it run fresh on every request. For a low-traffic internal dashboard this is fine — do not introduce Redis/Vercel KV for this unless query load becomes a real problem later.
- **Timeouts:** set `connectTimeout: 15000` (15s, not 10s) in `lib/db.js` to absorb cold-start latency talking to a remote DB from a fresh Vercel region. Also explicitly set the route's `maxDuration` to at least `20` (in `vercel.json` or as an exported `export const maxDuration = 20;` in `route.js`) so Vercel doesn't kill the function before the DB timeout fires.
- **No connection pooling** — confirmed correct for serverless. One `createConnection()` per request, closed in `finally`, exactly as specified in §5.

---

## 5. `lib/db.js` — Database Connection Contract

```js
import mysql from 'mysql2/promise';

export async function queryBrandMetrics(dbConfig, funnelSlug) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false },
      connectTimeout: 15000, // [DECISION] 15s — accounts for Vercel cold-start latency
    });

    const [[{ totalSiteImpressions }]] = await connection.execute(
      `SELECT COUNT(*) AS totalSiteImpressions FROM wp_ia_views`
    );

    const [[{ formPageImpressions }]] = await connection.execute(
      `SELECT COUNT(*) AS formPageImpressions
       FROM wp_ia_views v
       JOIN wp_ia_pages p ON v.page_id = p.id
       WHERE p.url = ?`,
      [funnelSlug]
    );

    return { totalSiteImpressions, formPageImpressions };
  } finally {
    if (connection) await connection.end();
  }
}
```

**Critical requirements the agent must not skip:**
1. **Always use parameterized queries** (`?` placeholders) for `funnelSlug` — never string-interpolate it into SQL, even though it comes from a trusted env var today. This prevents future regressions if the slug source ever changes.
2. **`connectTimeout: 10000`** — the original PRD says nothing about timeouts, but a hung remote DB connection will otherwise stall the whole API route indefinitely. **[DECISION]** 10s timeout, after which the route should treat it as a DB failure and return the partial-success shape from §4.
3. **`finally` block must always close the connection**, including on query errors, not just on the happy path — connection leaks will exhaust the remote DB's max-connections limit over time.
4. **Do not use a persistent pool across requests in serverless deploy targets** unless the agent confirms the hosting target supports it — default to a fresh `createConnection` per request, closed immediately after, exactly as the PRD's "cleanly terminate after queries finish" instruction states.

---

## 6. Frontend Contract

### `app/dashboard/page.js`
- `'use client'` component.
- State: `selectedBrand` (`'brandA' | 'brandB'`), `data`, `loading`, `error`.
- On mount and on every `selectedBrand` change, `fetch('/api/analytics?brand=' + selectedBrand)`.

**[DECISION] — Race condition guard (not addressed in original PRD):**
If a user switches Brand A → Brand B → Brand A quickly, two in-flight requests can resolve out of order and the slower (stale) one can overwrite the UI with wrong-brand data. The agent must guard against this. Two acceptable approaches — pick one:
- **Option A (simple):** compare the `brand` field in the response against current `selectedBrand` state before committing to `setData()`; discard if mismatched.
- **Option B (robust):** use an `AbortController`, cancel the previous in-flight request on every brand change.

Use **Option A** unless the agent's framework conventions favor `AbortController` already.

### Loading State
Show `LoadingSkeleton` (4 placeholder cards) during fetch — not a full-page spinner, since brand-switch should feel like a localized refresh of the grid, not a page reload.

### Error State
- If `errors.database` and `errors.sender` are both present → render `ErrorBlock` across the full grid with a retry button.
- If only one source errored → render the 2 affected `MetricCard`s with an inline "Unavailable" state, while the working cards (and conversion rate, if computable) still render. **[DECISION]** If `totalDownloads` is null but `formPageImpressions` is available, `conversionRate` must also be null — never compute a conversion rate from partial inputs.

### Metric Grid (per original PRD §3)
| Card | Source field |
|---|---|
| Sitewide Views | `totalSiteImpressions` |
| Form Views | `formPageImpressions` |
| Report Conversions | `totalDownloads` |
| Conversion Ratio | `conversionRate` |

---

## 6b. `lib/senderApi.js` — Sender.net Integration (REVISED)

**Context:** the signup form adds subscribers directly to a **Group** in Sender.net (not a segment) on submission, then redirects to a confirmation page. The "Form ID" in env vars is actually the **Group ID**.

**Chosen approach:** call `GET /v2/groups` (lists all groups with their subscriber counts inline) and find the target group by ID — rather than paginating `GET /v2/groups/{id}/subscribers`, which would require summing across pages just to get a count we don't otherwise need. One cheap request, no pagination math, no risk of undercounting.

```js
// lib/senderApi.js
export async function getGroupSubscriberCount(apiKey, groupId) {
  const res = await fetch('https://api.sender.net/v2/groups', {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Sender.net error: ${res.status}`);
  }

  const { data } = await res.json();
  const group = data.find((g) => g.id === groupId);

  if (!group) {
    throw new Error(`Group ${groupId} not found in Sender.net account`);
  }

  // [VERIFY BEFORE BUILD] confirm actual field name on a real group object —
  // segments expose "active_subscribers"; groups may use a different key
  // (e.g. "subscribers_count" or "total_subscribers"). Run:
  //   curl -H "Authorization: Bearer YOUR_KEY" https://api.sender.net/v2/groups
  // and inspect the response before locking this in.
  return group.active_subscribers ?? group.subscribers_count ?? group.total_subscribers ?? 0;
}
```

**Action item before build:** run the `curl` command above against the real account and confirm the exact count field name. Update the fallback chain in the return line to put the confirmed field first.

**Env var naming note:** since "Form ID" is really a Group ID, rename for clarity in `.env.local` / `.env.example` and `brandConfig.js`:
```env
BRAND_A_SENDER_GROUP_ID=
BRAND_B_SENDER_GROUP_ID=
```
(replacing `BRAND_A_SENDER_FORM_ID` / `BRAND_B_SENDER_FORM_ID` from §2 — update both the env file and `lib/brandConfig.js` to use `groupId` instead of `formId`.)

---

## 7. `lib/calc.js` — Conversion Rate Contract

```js
export function calculateConversionRate(downloads, views) {
  if (!views || views === 0) return 0; // [DECISION] explicit zero-view handling per PRD
  return Math.round((downloads / views) * 100 * 100) / 100; // 2 decimal places
}
```
Per original PRD: "Handle zero-view states gracefully" — return `0`, not `null` and not `NaN`, when `formPageImpressions` is `0`. This is distinct from the partial-failure `null` case in §6, which only applies when a data source errored, not when it legitimately returned zero.

---

## 8. Security Checklist (must all be true before considered done)

- [ ] No `BRAND_*` env var name or value ever appears in a client-bundled file, browser console log, or API error response body.
- [ ] DB users used in `.env.local` are confirmed `SELECT`-only (agent should not create these users — see note below).
- [ ] SSL enforced on DB connections (`ssl` option set, not omitted).
- [ ] API route validates `brand` param against an allowlist (`['brandA','brandB']`) before using it to key into `brandConfig` — never pass the raw query param into any lookup without the allowlist check, even though `getBrandConfig` also throws on bad keys (defense in depth).
- [ ] `.env.local` is in `.gitignore`; `.env.example` has empty/placeholder values only.

**Note:** Restricted-user creation (`CREATE USER ... GRANT SELECT`) is a database-admin task on the WordPress MySQL hosts themselves, not application code. This PRD assumes those credentials already exist and are supplied via env vars — flag to the user if the agent is, instead, expected to generate the SQL for that step.

---

## 9. Explicitly Out of Scope (carried over, unchanged)
- Historical trends / charting / date filtering
- Authentication / user roles
- Any write operations to WordPress or Sender.net
- Cross-brand aggregated/"Total Company" view

---

## 10. Resolved Items
1. ~~Hosting target~~ — **Resolved: Vercel.** Caching and timeout sections updated accordingly (§4, §5).
2. ~~Sender.net integration shape~~ — **Resolved.** Form submissions add subscribers to a Group; integration uses `GET /v2/groups` and matches by group ID (§6b).
3. **Still open:** confirm `wp_ia_views`/`wp_ia_pages` column names match what's described in PRD §4 against the actual live database — the agent is building blind against the schema described in the document, not a live connection.

## 11. Pre-Build Action Item (must complete before agent starts §6b)

Run the following against the real Sender.net account once an API key is available:

```bash
curl -H "Authorization: Bearer YOUR_REAL_API_KEY" https://api.sender.net/v2/groups
```

Inspect the JSON response for the target group object and confirm the exact field name used for subscriber count (candidates: `active_subscribers`, `subscribers_count`, `total_subscribers`). Update the fallback chain in `lib/senderApi.js` (§6b) to put the confirmed field first, and remove the unused fallbacks once verified.

This is the only unverified assumption left in this document — everything else is build-ready as written.
