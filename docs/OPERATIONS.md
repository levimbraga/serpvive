# Operations runbook

Written for whoever comes back to this project without any context in their head — most likely me. Everything here is a thing you cannot figure out by reading the code quickly, or a decision that lives outside the repository.

Project: `serpvive.com` on Vercel · Postgres on Supabase · repo `levimbraga/serpvive`.

---

## 1. Kill switch: stop all AI spending

Every AI call in the app funnels through `runWithFallback()` in [`src/lib/ai/fallback-chain.ts`](../src/lib/ai/fallback-chain.ts). One environment variable stops all of them — diagnoses, briefs, standalone URL analyses and demo generation — while leaving the dashboard, GSC ingestion, the scoring engine and email untouched.

**To stop AI:**

1. Vercel → project **serpvive** → **Settings** → **Environment Variables**
2. Add `AI_DISABLED` = `true` (Production, and Preview if you care)
3. **Deployments** → most recent → `···` → **Redeploy**

Vercel does not apply new environment variables to an already-built deployment. Without the redeploy, nothing changes.

**To turn AI back on:** delete the variable (or set it to anything other than the exact string `true`), then redeploy again.

Users hitting a disabled endpoint get HTTP 503 and the message *"AI analysis is temporarily disabled in this public version."*

---

## 2. Spend cap and how to read the accumulated spend

`AI_SPEND_CAP_USD` is a ceiling on total lifetime AI spend across the whole deployment. Unset or unparseable means no cap. Change it the same way as above: edit the variable, then **redeploy**.

Two properties worth remembering before you trust it:

- **It is approximate.** A call's cost is only known once it finishes, so a run that starts under the ceiling always ends above it. A 60-second cache bounds the overshoot to whatever fits in a minute — in practice one or two runs.
- **It fails open.** If the spend lookup errors, the call proceeds and the failure is logged. This is deliberate: a budget guard that becomes a single point of failure trades a few dollars for an outage.

### Reading the accumulated spend

There is no UI for this anywhere. Run this in the Supabase SQL editor:

```sql
select
  (select coalesce(sum(cost_usd), 0) from public.diagnoses)          as diagnoses,
  (select coalesce(sum(cost_usd), 0) from public.external_analyses)  as external_analyses,
  (select coalesce(sum(cost_usd), 0) from public.demo_analyses)      as demos,
  (select coalesce(sum(cost_usd), 0) from public.diagnoses)
  + (select coalesce(sum(cost_usd), 0) from public.external_analyses)
  + (select coalesce(sum(cost_usd), 0) from public.demo_analyses)    as total_seen_by_cap;
```

`total_seen_by_cap` is exactly the number the cap compares against the ceiling. All three tables must be included — demos run the same paid pipeline as a user diagnosis, and a cap blind to part of the spend is worse than no cap, because you would trust it.

### Per-account limits

Separate from the global cap, and defined in [`src/lib/constants.ts`](../src/lib/constants.ts):

- `FREE_LIFETIME_DIAGNOSES` — 10 GSC-based diagnoses per account, lifetime
- `FREE_LIFETIME_URL_ANALYSES` — 3 standalone URL analyses per account, lifetime

Both are counted from table rows (`diagnoses`, `external_analyses`), never from a counter column. Changing the constants changes the limit everywhere, including the UI copy.

---

## 3. Generating a new public demo

Demos are the public, no-login analyses linked from the README. They are the first thing a visitor sees, so they need to outlive the default retention.

**Who can call it:** only the account whose email equals the `ADMIN_EMAIL` environment variable. There is no fallback — if `ADMIN_EMAIL` is unset, nobody is admin.

**Endpoint:** `POST /api/admin/demo`, authenticated as that user (a browser session works; the admin UI is at `/admin/demo`).

```json
{ "url": "https://example.com/some-post", "keyword": "target keyword" }
```

It returns `{ "data": { "id": "<8-char id>", "status": "pending" } }` immediately and runs the pipeline in the background — about 3 to 4 minutes, roughly $0.20 of real API spend. Poll `GET /api/admin/demo?poll=<id>` until `status` is `completed`. The public page is then `https://serpvive.com/demo/<id>`.

**Then extend the lifetime.** New demos default to `expires_at = now() + 21 days`, which is fine for a sales demo and useless for a showcase link in a README:

```sql
update public.demo_analyses
set expires_at = '2027-12-31T23:59:59Z'
where id = '<the 8-char id>';
```

The cleanup cron ([`src/app/api/cron/cleanup-demos/route.ts`](../src/app/api/cron/cleanup-demos/route.ts)) only hard-deletes a demo when it is **both** older than 90 days **and** past its `expires_at`. Extending `expires_at` is therefore sufficient to keep it forever.

**Pick a page that is actually losing.** A healthy page produces a diagnosis with nothing to say, which makes a poor showcase.

---

## 4. Dormant accounts

Accounts nobody has opened in **60 days** stop being ingested: the daily `sync-gsc` cron flips their sites to `status = 'dormant'` and skips them. This is storage hygiene, not a paywall — the Search Console API is free, but Postgres is not infinite, and abandoned accounts otherwise grow `page_queries` forever.

**How a dormant account comes back: the user logs in.** That is the entire procedure. There is no button, no setting, and nothing to purchase. Reactivation runs in two places because password logins never reach the OAuth callback:

- [`src/app/(auth)/callback/route.ts`](../src/app/(auth)/callback/route.ts) — OAuth logins
- [`src/app/(dashboard)/layout.tsx`](../src/app/(dashboard)/layout.tsx) — any dashboard load, gated on a 60-day gap so normal page loads cost nothing extra

The threshold and both helpers live in [`src/lib/activity.ts`](../src/lib/activity.ts) (`DORMANT_AFTER_DAYS`). `last_seen_at` on `profiles` is written at most once per user per day.

To wake sites manually:

```sql
update public.sites set status = 'active', updated_at = now()
where user_id = '<user uuid>' and status = 'dormant';
```

Note that `dormant` is deliberately a different status from `paused`. `paused` belongs to the old 90-day free-plan freeze, which is disabled in this version but kept in the code. Do not merge them.

---

## 5. Open items — unresolved when the project was paused

These are not bugs to find later; they are known gaps that nobody closed.

### Vercel environment variables were never verified from outside

`AI_SPEND_CAP_USD`, `GOOGLE_GEMINI_API_KEY` and `OPENAI_API_KEY` have no observable effect on the happy path — the first only shows up when a ceiling is hit, the other two only when Anthropic fails. They were set through the dashboard but never confirmed by an independent check. **Look at the panel before trusting that the cap is armed or that the chain has four links rather than two.** Without the Gemini and OpenAI keys the fallback chain silently degrades to Claude-only, which is exactly the failure the chain exists to prevent.

### Google OAuth for Search Console: Testing or Production is unknown

The custom OAuth app that requests `webmasters.readonly` (`src/lib/gsc/`, `src/app/api/auth/google-gsc/`) is separate from the Google social login configured in Supabase. Social login demonstrably works for third-party Gmail accounts. **The Search Console flow has never been tested by anyone other than the owner.** If that app is still in *Testing* mode in the Google Cloud Console, only listed test users can connect, and a stranger's connection attempt fails. Sensitive scopes require Google verification, which takes weeks. Check the consent screen status before assuming the flow works for anyone else.

### Supabase has no custom SMTP

Email confirmation is enabled, and outgoing mail uses Supabase's built-in mailer, which is explicitly not for production and rate-limits to a handful of messages per hour. **A stranger signing up by email may never receive the confirmation, and the signup dies silently** — no error surfaces anywhere. Google sign-in is unaffected because it sends no email. Configuring custom SMTP (Resend already has an API key in this project) is the fix.

---

## Quick reference

| I want to… | Do this |
|---|---|
| Stop all AI spending now | `AI_DISABLED=true` on Vercel + redeploy |
| Change the global ceiling | `AI_SPEND_CAP_USD=<n>` on Vercel + redeploy |
| See how much has been spent | The SQL in §2 — there is no UI |
| Change per-account limits | `src/lib/constants.ts`, then deploy |
| Add a showcase demo | `POST /api/admin/demo` as admin, then extend `expires_at` |
| Wake a dormant account | Log into it, or the SQL in §4 |
| Know what is unfinished | §5, plus "Current status and limitations" in the [README](../README.md) |
