# ARCHITECTURE — SerpVive

## Stack Overview
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | React + SSR + API Routes |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS | Rapid styling |
| Components | shadcn/ui | Pre-built accessible UI |
| Charts | Recharts | Dashboard visualizations |
| Database | PostgreSQL via Supabase | Managed relational DB |
| Auth | Supabase Auth + custom Google OAuth | Email + GSC OAuth |
| Security | Row Level Security (RLS) | Data isolation per user |
| AI | Claude Opus 4.6 ($5/$25 per M tokens) | Diagnosis + Briefs + Micro-Drafts |
| SERP | Serper.dev ($1/1K queries) | Google SERP data |
| HTML Parse | Cheerio | Extract content from competitor pages |
| Deploy | Vercel | Auto-deploy, cron jobs |
| Email | Resend + React Email | Transactional + digest emails |
| Payments | Stripe | Subscriptions & billing |
| Validation | Zod | Input/output validation |
| Analytics | PostHog (free tier) | Product analytics |

## Database Schema

### profiles (extends auth.users)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'agency')),
  plan_status TEXT NOT NULL DEFAULT 'trialing' CHECK (plan_status IN ('trialing', 'active', 'canceled', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  diagnoses_used_this_month INT NOT NULL DEFAULT 0,
  diagnoses_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  digest_day TEXT DEFAULT 'monday',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### sites
```sql
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  gsc_property TEXT NOT NULL,
  gsc_refresh_token TEXT NOT NULL,
  gsc_access_token TEXT,
  gsc_token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'importing' CHECK (status IN ('importing', 'active', 'paused', 'error')),
  health_score INT,
  health_score_prev INT,
  pages_count INT NOT NULL DEFAULT 0,
  pages_healthy INT NOT NULL DEFAULT 0,
  pages_warning INT NOT NULL DEFAULT 0,
  pages_critical INT NOT NULL DEFAULT 0,
  pages_dead INT NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  last_engine_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, gsc_property)
);
```

### pages
```sql
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  current_clicks_28d INT NOT NULL DEFAULT 0,
  current_impressions_28d INT NOT NULL DEFAULT 0,
  current_ctr DECIMAL(5,4) DEFAULT 0,
  current_avg_position DECIMAL(5,2) DEFAULT 0,
  peak_clicks_monthly INT NOT NULL DEFAULT 0,
  peak_month DATE,
  decay_score DECIMAL(5,2) DEFAULT 0,
  decay_velocity_7d DECIMAL(5,2) DEFAULT 0,
  decay_velocity_28d DECIMAL(5,2) DEFAULT 0,
  is_seasonal BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy','warning','critical','dead','new','unknown')),
  primary_keyword TEXT,
  primary_position DECIMAL(5,2),
  last_diagnosis_at TIMESTAMPTZ,
  last_refresh_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, url)
);
```

### page_metrics_daily
```sql
CREATE TABLE public.page_metrics_daily (
  id BIGSERIAL PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  impressions INT NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  avg_position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, date)
);
```

### page_queries
```sql
CREATE TABLE public.page_queries (
  id BIGSERIAL PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  impressions INT NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, query, date)
);
```

### diagnoses
```sql
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnosis JSONB NOT NULL,
  refresh_brief JSONB,
  serp_snapshot JSONB,
  model_used TEXT DEFAULT 'claude-opus-4-6',
  tokens_input INT,
  tokens_output INT,
  cost_usd DECIMAL(6,4),
  processing_time_ms INT,
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('auto', 'manual', 'batch')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### refreshes
```sql
CREATE TABLE public.refreshes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES public.diagnoses(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actions_completed JSONB DEFAULT '[]',
  notes TEXT,
  before_clicks_28d INT,
  before_impressions_28d INT,
  before_ctr DECIMAL(5,4),
  before_avg_position DECIMAL(5,2),
  after_clicks_28d INT,
  after_impressions_28d INT,
  after_ctr DECIMAL(5,4),
  after_avg_position DECIMAL(5,2),
  result_status TEXT CHECK (result_status IN ('pending','measuring','success','partial','no_change','declined')),
  result_calculated_at TIMESTAMPTZ,
  clicks_delta INT,
  clicks_delta_pct DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### waitlist (pré-lançamento)
```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Project Structure
```
src/
├── app/
│   ├── (marketing)/          # Landing page, pricing
│   ├── (auth)/               # Login, signup, OAuth callback
│   ├── (dashboard)/          # Protected app
│   │   ├── dashboard/        # Health Score + decay list
│   │   ├── pages/            # All pages table
│   │   ├── pages/[id]/       # Diagnosis + brief detail
│   │   ├── refreshes/        # Refresh history + results
│   │   ├── settings/         # Account, billing, preferences
│   │   └── onboarding/       # Connect GSC, select site, import
│   └── api/
│       ├── auth/google-gsc/  # Custom OAuth for GSC scope
│       ├── gsc/              # Properties list, import trigger
│       ├── diagnose/         # On-demand AI diagnosis
│       ├── refresh/          # Mark refresh done
│       ├── waitlist/         # Email capture
│       ├── cron/             # 5 cron jobs
│       └── stripe/           # Checkout, portal, webhooks
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── dashboard/            # Health score ring, decay list, stats
│   ├── diagnosis/            # Diagnosis card, brief card, result card
│   ├── pages/                # Pages table
│   ├── onboarding/           # GSC connect, site selector, progress
│   ├── layout/               # Sidebar, header, mobile nav
│   └── marketing/            # Hero, pricing, features
├── lib/
│   ├── supabase/             # client, server, admin, middleware
│   ├── gsc/                  # OAuth tokens, API calls, transforms
│   ├── engine/               # decay-scorer, velocity, seasonal, classifier, health-score
│   ├── ai/                   # Anthropic client, prompts, schemas, parser
│   ├── serp/                 # Serper client, content fetcher
│   ├── email/                # Resend client, templates
│   ├── stripe/               # Client, plans, webhook handlers
│   ├── limits.ts             # Plan limit checks
│   └── constants.ts          # Thresholds, config
├── hooks/                    # use-site, use-pages, use-diagnosis, use-usage
└── types/                    # database, gsc, diagnosis, brief, serp
```

## Cron Jobs (vercel.json)
| Cron | Schedule | What it does |
|------|----------|-------------|
| sync-gsc | 3AM UTC daily | Pull new GSC data for all active sites |
| run-engine | 4AM UTC daily | Run decay scoring, velocity, classification |
| batch-diagnose | 5AM UTC daily | Auto-diagnose top 3 new critical posts |
| measure-results | 6AM UTC Sunday | Measure refresh results (28+ days after) |
| send-digests | 9AM UTC Monday | Send weekly email digest |

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
ANTHROPIC_API_KEY=
SERPER_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```

## Plan Limits Constants
```typescript
export const PLAN_LIMITS = {
  trial:   { sites: 1, pages: 100, diagnoses_per_month: 3,   team_members: 1 },
  starter: { sites: 1, pages: 100, diagnoses_per_month: 10,  team_members: 1 },
  pro:     { sites: 3, pages: 500, diagnoses_per_month: 30,  team_members: 3 },
  agency:  { sites: 10, pages: 2000, diagnoses_per_month: 100, team_members: 10 },
};
```

## Decay Engine Thresholds
```typescript
export const DECAY_THRESHOLDS = {
  healthy_max: 15,
  warning_max: 30,
  critical_min: 30,
  dead_min: 70,
  velocity_low: 5,
  velocity_high: 15,
  seasonal_tolerance: 20,
  new_page_months: 3,
};
```
