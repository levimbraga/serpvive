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

- `FREE_LIFETIME_ANALYSES` — 3 AI analyses per account, lifetime, **shared**: a GSC diagnosis and a standalone URL analysis draw from the same pool.

It was previously two separate pools (10 GSC + 3 standalone) on the theory that a standalone URL, requiring no proof of site ownership, is the cheaper abuse vector and deserved a tighter cap. Two pools turned out to be indefensible in the UI — the sidebar counted one of them and the settings page named the other, so the number a free user saw was never the number that stopped them. One pool, one number. That single pool started at 10 and was tightened to 3: each run is a real Opus call plus a SERP fetch, and ten of those per signup is a bill, not a demo.

Usage is counted from table rows (`diagnoses` + `external_analyses`), never from a counter column. Changing the constant changes the limit everywhere, including the UI copy.

One subtlety worth knowing before you touch the count: a standalone analysis whose URL belongs to a connected GSC site writes to **both** tables. Those `external_analyses` rows carry a `page_id`, and [`countFreeAnalysesUsed`](../src/lib/limits.ts) excludes them, so one user action costs exactly one credit. Any new counting code must go through that function rather than adding up the two tables by hand.

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

## 5. Running on Vercel's Hobby plan

In September 2026 this deployment moved from Vercel Pro ($20/month) to the free
Hobby plan. The product had no users and no revenue; the crons spend no AI money
(the only automatic AI trigger is auto-diagnosis on import, which a human starts).

### ⚠️ Hobby is non-commercial only — a paying user makes it ineligible

Vercel's [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage),
quoted from the [Hobby plan docs](https://vercel.com/docs/plans/hobby):

> the Hobby plan restricts users to non-commercial, personal use only

Today that is defensible: payments are switched off, there is no revenue, and
this is a personal portfolio project. **The day a paying user exists, Hobby stops
being eligible and the deployment must go back to Pro.** This is a licensing
constraint, not a technical one — nothing will break, no warning will fire, and
Vercel may pause the deployment rather than bill for it. Do not discover this
after taking someone's money.

Re-enabling Stripe and going back to Pro are the same decision. Treat them as one.

### What is scheduled, and what was unscheduled

Hobby allows **100 cron jobs per project** (the old 2-job cap is gone — see the
[changelog](https://vercel.com/changelog/cron-jobs-now-support-100-per-project-on-every-plan)),
but restricts frequency to **once per day**, with **±59 minutes** of scheduling
jitter. Slots were never the constraint; the trimming below was about not leaving
work scheduled that does nothing.

| Cron | Status | Reasoning |
|---|---|---|
| `sync-gsc` | 3AM daily | The heart. Nothing else has a data source without it. |
| `run-engine` | 9AM daily | Moved from 4AM — see the jitter note below. |
| `measure-results` | 6AM Sunday | Reads only. 1 refresh in the database, 0 pending. |
| `cleanup-demos` | 2AM Sunday | Was daily. 3 demos exist in total; daily was pointless. |
| `onboarding-emails` | 10AM daily | **Deliberately kept.** It is the only disabled-looking cron that is not dead code: it filters `plan = 'free'` with no paid-plan gate, so it would genuinely fire for a real signup. Turning it off is a product decision, and it was not taken. |
| `batch-alert` | **unscheduled** | Never delivered anything. Its final loop is `console.log` with a comment saying Resend integration comes later; it never came. Re-enable it **only together with** the email call that is missing — otherwise it just writes to a log nobody reads. |
| `send-digests` | **unscheduled** | Filters `.neq("plan", "free")`. With payments disabled every account is free, so the recipient query matches zero rows by construction. **Re-enable when paid plans exist** — the template, the scheduler and the per-user digest day all work. |
| `apply-plan-changes` | unscheduled | Already had no entry before this change. Belongs to the paid-plan lifecycle. |

**To reactivate any of them:** add the entry back to `vercel.json`. The routes were
never deleted. `batch-alert` and `send-digests` are waiting on a feature, not on a
schedule — read their rows above before assuming a cron line is all they need.

### ⚠️ Why run-engine moved from 4AM to 9AM

On Pro, cron times are exact and the 3AM→4AM gap was a real hour. **On Hobby each
job fires anywhere inside its hour**, so `sync-gsc` could start at 3:59 and
`run-engine` at 4:00 — the engine reading a sync still in flight. Nine o'clock
gives roughly four hours of margin against worst-case drift on both sides.

**Do not "fix" this by merging the two routes into one.** That trades a data race
for a timeout — see the duration ceiling below.

### ⚠️ run-engine uses ~210s of a 300s ceiling that cannot be raised

Measured 2026-09-10 against 3 sites and 136 pages, from `last_engine_run_at`:

```
site 1 → 04:01:10    site 2 → 04:03:13    site 3 → 04:03:32
```

Cron fires at 4:00, so the run takes **about 210 seconds — roughly 70% of the
limit.** On Hobby the maximum function duration is **300s, and 300s is also the
maximum**: Pro can be configured up to 800s, Hobby cannot be raised at all
([functions limits](https://vercel.com/docs/functions/limitations)). Both heavy
routes already declare `maxDuration = 300`, which is legal — but there is no
headroom left to buy.

**The cause is `src/lib/engine/run-engine.ts`:** it loops over pages and issues
roughly three sequential Postgres round-trips per page (the `page_queries` reads
around lines 83 and 98, plus the per-page `pages` update near line 143). At 136
pages that is ~400 sequential queries. The cost scales with page count, not with
site count.

**This is the number to watch.** It is I/O wait rather than CPU, so it barely
touches the 4 CPU-hrs/month Active CPU allowance — the risk is purely the wall
clock. If page count grows meaningfully, the run will hit
`FUNCTION_INVOCATION_TIMEOUT` and stop silently. The fix, when it is needed, is to
batch those per-page queries rather than to raise the ceiling, because on Hobby
the ceiling cannot move.

### The cheapest lever on that 300s ceiling: delete techtools-blog.com

`techtools-blog.com` is **not a broken site — it is a fictitious one.** It comes
from [`src/scripts/seed-demo.ts`](../src/scripts/seed-demo.ts) (`DEMO_DOMAIN`),
which seeds a site with 20 pages and a year of daily metrics to demonstrate what
decay looks like. The domain does not exist, the Search Console property
`sc-domain:techtools-blog.com` does not exist, and its GSC refresh token can never
authenticate.

**So `token_error = true` on that site is correct and permanent, by design.** Do
not treat it as an incident. `last_sync_at` equals `created_at` (2026-03-22)
because it has never synced and never will; `sync-gsc` retries the refresh daily
and fails daily, which is noise in the log and nothing more.

It holds 20 of the ~136 tracked pages, so it accounts for **roughly 15% of the
run-engine duration** described above. **If the 300s ceiling ever becomes a real
problem, deleting this site is the cheapest lever available** — more effective per
minute of work than any code change, because it removes ~60 sequential Postgres
round-trips from every run:

```sql
delete from public.sites where domain = 'techtools-blog.com';
```

The cascade takes its pages, metrics, queries and diagnosis with it. **This is
recoverable** — the seed script is idempotent ("deletes and recreates the demo
site on each run"), so `npx tsx src/scripts/seed-demo.ts` brings it all back.

Reviewed 2026-09-10 and deliberately left in place: the account's `last_seen_at`
puts it past the 60-day dormancy threshold around **2026-10-18**, after which
`sync-gsc` skips it and the daily failure stops on its own.

### ⚠️ You will not find cron logs in the Vercel panel

**Hobby retains runtime logs for 1 hour** (Pro retains 1 day). Every cron in this
project runs overnight UTC. By any hour you are likely to be looking, **their logs
are already gone** — the panel will show nothing at all.

**Nothing is broken when that happens.** An empty log view is the expected state,
not evidence of a failed cron. The CLI is not a way around it either: the Vercel
API token for this project is scoped to the team rather than to a personal
account, so `vercel logs` fails with "User not found". Reaching runtime logs would
require generating a new token under **Account Settings → Tokens**, not Team
Settings.

**To actually see a cron run, invoke it yourself and read the response:**

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://serpvive.com/api/cron/run-engine
```

Every cron route returns a structured JSON summary (`{ data: { processed,
skipped, errors, total } }` and equivalents), so the response body tells you what
the scheduled run would have done. `CRON_SECRET` is in the Vercel environment
variables. Substitute any of the five paths in `vercel.json`.

**To confirm the scheduled runs are happening**, query the database rather than
hunting for logs — these columns are the durable record:

```sql
select domain, last_sync_at, last_engine_run_at, token_error from public.sites;
```

### Limits that are not a concern

Roughly 190 cron invocations per month against **1,000,000** included; bandwidth
is irrelevant for a site with no traffic. Neither is worth monitoring.

---

## 6. Open items — unresolved when the project was paused

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
| Know what is unfinished | §6, plus "Current status and limitations" in the [README](../README.md) |
| Know why a cron is not scheduled | §5 — the table says what each one is waiting on |
| Know if Hobby is still an eligible plan | §5 — non-commercial use only |
| Find the log of a cron run | You cannot — §5. Call the route with `CRON_SECRET` instead |
| Understand `token_error` on techtools-blog.com | §5 — it is seeded fixture data, not an incident |
