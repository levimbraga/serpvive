# SCOPE MVP — SerpVive

## Principle
MVP needs ONLY enough to make a user PAY $29 and NOT CANCEL next month.

## IN THE MVP (v1.0)

### Onboarding (Day 1)
- Signup (email/password or Google via Supabase Auth)
- Stripe Checkout hosted (7-day trial with card)
- Connect GSC (custom OAuth, scope: webmasters.readonly, SEPARATE from login)
- Select site to monitor
- Import 16 months of historical data (polling every 3s, show partial data)
- First report within 24h
- First AI diagnosis auto-generated for most critical post (FREE, doesn't count against limit)

### Dashboard
- Health Score (0-100) with delta vs last week, ring gauge animated
- Decay list: posts sorted by urgency (🔴🟡🟢)
- Stats: pages monitored, healthy, warning, critical, dead
- Usage counter: X/Y diagnoses used this month
- Recent results section (refresh outcomes)

### Pages Table
- All monitored pages with columns: URL, status, clicks now, clicks peak, decay %, last diagnosis
- Sort by: decay score, clicks lost, status
- Search by URL
- Click row → page detail

### Decay Engine (daily automated cron)
- Pull GSC data daily
- Calculate decay score per page (28d vs peak)
- Calculate velocity (7d and 28d)
- Seasonal detection (compare vs same period last year)
- Classify: healthy / warning / critical / dead / new
- Cannibalization check (2+ pages on same top query)
- Update Health Score

### AI Diagnosis (THE differentiator)
- On-demand: user clicks "Diagnose" on a decaying page
- Auto: top 3 most critical new posts diagnosed via batch cron
- Process: fetch SERP (Serper) → fetch competitor content → fetch user content → send to Opus 4.6
- Output: structured JSON with causes, evidence, severity
- Limits: 10/mo Starter, 30/mo Pro, 100/mo Agency

### Refresh Brief with Micro-Drafts
- Generated alongside diagnosis (second Opus call)
- Prioritized actions: 🔴 Urgent / 🟡 Important / 🟢 Nice-to-have
- Each action includes micro-draft:
  - Title suggestions (2-3 ready to copy)
  - Topics to cover with competitor references
  - Corrected data (prices, stats, dates)
  - Format suggestions (table columns/rows)
  - Meta text ready to paste
- Effort estimate in hours

### Refresh Tracking
- "Marked as Updated" button with date
- Optional checkboxes for each action in brief
- Saves "before" metrics snapshot

### Result Tracking
- Automatic comparison: 28 days before vs 28 days after
- Shows: clicks, impressions, CTR, position — with delta %
- Status: success (>10%) / partial (0-10%) / no_change (~0%) / declined (<-5%)

### Weekly Email Digest
- Health Score + delta
- Top 3 urgent posts (with link to dashboard)
- Recent refresh results
- Configurable day (Monday default)

### Billing (Stripe)
- 3 plans: $29 / $59 / $99
- Stripe Checkout hosted (not embedded)
- 7-day trial with card (14-day for early waitlist subscribers)
- Self-service cancel via Stripe Customer Portal

### Settings
- Change email/password
- Manage connected sites
- View monthly usage
- Manage billing (Stripe portal link)
- Email digest day preference

## NOT IN MVP

### v1.1 (2-4 weeks after launch)
- Export CSV
- Email when refresh result is ready
- Sparkline charts per page
- ROI Calculator (CPC × clicks lost)
- URL directory filters (/blog/, /guides/)

### v2.0 (1-2 months after launch)
- Auto-Draft (AI generates full section rascunhos, not just micro-drafts)
- Competitor Watch (weekly SERP monitoring)
- Decay Velocity Alerts (email when post crosses threshold)
- Sophisticated seasonal detection
- WordPress plugin (auto-detect edits)
- Slack integration
- Multi-user / team members

### v3.0+ (3+ months after launch)
- GEO/AI Search tracking (ChatGPT, Perplexity visibility)
- Benchmark database (compare decay rate vs industry average)
- White-label reports (agencies)
- Public API
- Google Docs / Notion integration
- A/B testing for titles
- Content calendar (when to refresh each post)

## 12 SCREENS TO BUILD
1. Landing page (public, waitlist → trial)
2. Login / Signup
3. Onboarding: connect GSC
4. Onboarding: select site
5. Onboarding: importing (loading with preview)
6. Dashboard (Health Score + decay list) — COMPLEX
7. Pages table — COMPLEX
8. Diagnosis + brief detail view — COMPLEX (core of product)
9. Refresh result (before/after)
10. Settings / Account
11. Billing / Plans (Stripe redirect)
12. Email template (React Email)

## WHERE TO SPEND 80% OF TIME
1. **Opus Prompts + Micro-Drafts** — If diagnosis is generic, product dies. 1-2 weeks.
2. **Onboarding UX** — If user gets stuck in first 5 min, they cancel. 1 week.
3. **Dashboard first impression** — Must show REAL VALUE immediately. 1 week.

## ESTIMATED TIMELINE
~10-12 weeks solo with Claude Code Max.
First 2 weeks: VALIDATION (landing page + waitlist) before coding.
