# SCOPE MVP — SerpVive
## Updated: March 22, 2026

## Principle
MVP needs ONLY enough to make a user UPGRADE from free and NOT CANCEL next month.

## IN THE MVP (v1.0)

### Onboarding (Day 1)

**Free plan flow:**
Signup → "How did you hear about us?" (optional dropdown) → Connect GSC → Select site → Import → Dashboard with Health Score

**Paid plan flow:**
Signup → "How did you hear about us?" (optional dropdown) → Stripe Checkout (7-day trial with card) → Connect GSC → Select site → Import → Engine runs immediately → Auto-diagnosis in background → Dashboard with Health Score + first diagnosis ready

### Signup
- Email/password or Google (Supabase Auth)
- "How did you hear about us?" optional dropdown: Google Search, Reddit, Twitter/X, Friend or colleague, Blog post or article, YouTube, Other
- Saves to `profiles.referral_source`

### Dashboard
- Health Score (0-100) with delta vs last week, ring gauge animated
- Decay list: posts sorted by urgency, status badges with color + icon + text
- Stats: numbers big + bold, labels small + muted (data-first hierarchy)
- Usage counter: X/Y diagnoses used this month
- Recent results section (refresh outcomes)
- Free plan: locked features visible with "Upgrade →" CTAs

### Pages Table
- All monitored pages with columns: status badge, URL/title, decay %, clicks lost/mo
- Sort by: decay score, clicks lost, status
- Search by URL
- Click row → page detail
- Decay list leads with IMPACT (clicks lost), not URL

### Decay Engine
- **Paid plans:** Daily automated cron (4AM UTC)
- **Free plan:** Weekly automated cron (Sundays)
- **New sites:** Engine runs IMMEDIATELY after import completes (don't wait for cron)
- Calculate decay score per page (28d vs peak)
- Calculate velocity (7d and 28d) — paid only
- Seasonal detection — paid only
- Classify: healthy / warning / critical / dead / new
- Cannibalization check — paid only
- Update Health Score
- After engine: trigger auto-diagnosis for first-time sites

### Auto-Diagnosis (First Run)
- Runs SERVER-SIDE in background after engine completes for new sites
- Picks the most critical page (or best demo candidate)
- Fire-and-forget: works even if user navigates away
- FREE, does NOT count against monthly limit
- State machine: pending → running → completed / failed / skipped
- Email notification when ready: "Your first AI analysis is ready"

### AI Diagnosis (THE differentiator)
- On-demand: user clicks "Diagnose" on any page
- Process: fetch SERP (Serper) → fetch competitor content → fetch user content → send to Opus 4.6
- Output: structured JSON with causes, evidence, severity, E-E-A-T analysis
- Prompt calibrated: SEO expert tone, banned hedging phrases, sandwich/refocus, chain-of-thought reasoning field
- Limits: 1 lifetime (Free), 10/mo (Starter), 40/mo (Pro), 120/mo (Agency)
  - *Plano comercial, com Stripe ligado.* Na versão pública em produção os pagamentos estão
    desligados e o Free roda 10 análises AI vitalícias numa pool única, compartilhada com as
    análises de URL avulsas (`FREE_LIFETIME_ANALYSES`). Ver README e docs/OPERATIONS.md.
- Loading state: 4 progressive steps with timer

### Refresh Brief with Micro-Drafts
- Generated alongside diagnosis (second Opus call)
- Prioritized actions: 🔴 Urgent / 🟡 Important / 🟢 Nice-to-have
- Each action includes micro-draft for UPDATING existing content:
  - Title suggestions (2-3 ready to copy)
  - Topics to add with competitor references
  - Corrected data (prices, stats, dates)
  - Format suggestions (table columns/rows)
  - Meta text ready to paste
- Effort estimate per action in minutes
- Framing: updates to existing posts, not writing from scratch

### Refresh Tracking
- "I've refreshed this post" button with confetti
- Checkboxes for each action in brief (commitment loop)
- Progress: "3/5 actions completed"
- Saves "before" metrics snapshot automatically

### Result Tracking
- Automatic comparison: 28 days before vs 28 days after
- Shows: clicks, impressions, CTR, position, all with delta %
- Status: success (>10%) / partial (0-10%) / no_change (~0%) / declined (<-5%)
- Shareable result card (future: v1.1)

### Weekly Email Digest (paid plans only)
- Subject: loss-framed ("3 posts declined. 847 clicks lost this week.")
- Health Score + delta
- Top 3 urgent posts (with link to dashboard)
- Recent refresh results
- One CTA: "Open Dashboard"
- Configurable day (Monday default)

### Auto-Email on Cancel
- Stripe webhook: `customer.subscription.deleted`
- Email within 10 minutes from Levi personally
- Plain text, not HTML (feels personal)
- "Was it: not useful enough? Too expensive? Missing a feature? Something else?"
- Reply-to goes to real inbox
- Saves to `cancel_feedback` table

### Billing (Stripe)
- 5 tiers: Free ($0) / Starter ($29) / Pro ($69) / Agency ($129) / Enterprise (custom)
- Annual toggle: Save 17%
- Stripe Checkout hosted (not embedded)
- 7-day trial with card for paid plans
- Self-service cancel via Stripe Customer Portal
- Free plan: no card required

### Settings
- Change email/password
- Manage connected sites
- View monthly usage
- Manage billing (Stripe portal link)
- Email digest day preference

### Demo System (already built)
- Admin panel at /admin/demo: generate public analyses with URL + keyword
- Public permalink at /demo/[id]: full diagnosis + brief + CTA
- nanoid(8) short IDs, 21-day expiration, view counter
- OG tags for Reddit/Twitter preview
- Feedback collection (thumbs + comment)
- Use for Reddit growth hacking loop

### Demo Seed Data (for development)
- Script at src/scripts/seed-demo.ts
- 20 pages across all statuses (3 critical, 5 warning, 8 healthy, 2 dead, 2 new)
- 12 months of realistic daily_metrics
- Mock diagnosis + completed refresh for testing
- API route: /api/admin/seed-demo?run_engine=true

## NOT IN MVP

### v1.1 (2-4 weeks after launch)
- Export CSV
- Email when refresh result is ready
- Sparkline charts per page
- ROI Calculator (CPC × clicks lost)
- URL directory filters (/blog/, /guides/)
- Shareable Health Score report (public URL)
- Shareable result card (before/after)
- "Blog Health Check" free tool (engineering as marketing)
- Referral email automation (60-90 days)

### v2.0 (1-2 months after launch)
- Auto-Draft (AI generates full section drafts)
- Competitor Watch (weekly SERP monitoring)
- Decay Velocity Alerts (email when post crosses threshold)
- Sophisticated seasonal detection
- WordPress plugin (auto-detect edits)
- Slack integration
- Multi-user / team members
- Agency-exclusive features (team collab, white-label)

### v3.0+ (3+ months after launch)
- GEO/AI Search tracking (ChatGPT, Perplexity visibility)
- Benchmark database (compare decay rate vs industry average)
- White-label reports (agencies)
- Public API
- Google Docs / Notion integration
- A/B testing for titles
- Content calendar (when to refresh each post)

## SCREENS
1. Landing page (StoryBrand wireframe: hero → social proof → stakes → 5-step loop → screenshot → 3 steps → pricing → testimonials → FAQ → CTA → footer)
2. Login / Signup (with "How did you hear about us?")
3. Onboarding: connect GSC
4. Onboarding: select site
5. Onboarding: importing (with preview + engine immediate run)
6. Dashboard (Health Score + decay list)
7. Pages table
8. Diagnosis + brief detail view (progressive disclosure: summary → causes → SERP → brief)
9. Refresh result (before/after)
10. Settings / Account
11. Billing / Plans (Stripe redirect)
12. Email templates (React Email: onboarding Day 0/2/5, digest, cancel feedback, auto-diagnosis ready)
13. Demo public page (/demo/[id])
14. Demo admin (/admin/demo)

## WHERE TO SPEND 80% OF TIME
1. **Opus Prompts** — If diagnosis is generic, product dies. E-E-A-T + SEO expert tone + specificity.
2. **Onboarding → First Diagnosis** — Signup to aha moment in <15 minutes. Engine immediate + auto-diagnosis background.
3. **Dashboard first impression** — Health Score dominant, decay list with impact metrics, data-first labels.

## METRICS (Lean Analytics OMTM by phase)
- **Launch week:** Activation rate (% trial users who view first diagnosis). Line: <30% = broken, >50% = PMF signal.
- **Month 1:** Trial-to-paid conversion. Line: <5% = product problem, >10% = healthy.
- **Month 2+:** Monthly revenue churn. Line: >10% = catastrophic, <5% = acceptable.
- **Always track:** Plateau number (new MRR ÷ churn), churn by tier, "how heard" distribution, time-to-first-diagnosis.
