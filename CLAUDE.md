# SerpVive — CLAUDE.md

## O que é este projeto
SerpVive (serpvive.com) é um AI-powered content decay monitor.
Detecta posts perdendo tráfego, diagnostica POR QUE com Claude Opus 4.6, gera Refresh Brief com micro-drafts, e mede resultados automaticamente.

## Tech Stack (NÃO sugerir alternativas sem pedir)
- **Framework:** Next.js 14+ (App Router) com TypeScript strict
- **Styling:** Tailwind CSS (NÃO CSS-in-JS, NÃO styled-components)
- **Components:** shadcn/ui (usar SEMPRE que existir componente equivalente)
- **Charts:** Recharts
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic Claude Opus 4.6 (via SDK @anthropic-ai/sdk)
- **SERP:** Serper.dev
- **HTML Parse:** Cheerio
- **Email:** Resend + React Email
- **Payments:** Stripe
- **Validation:** Zod (input E output)
- **Icons:** Lucide React (strokeWidth 1.5)
- **Deploy:** Vercel
- **Analytics:** PostHog

## Estrutura do Projeto
```
src/
├── app/
│   ├── (marketing)/          # Landing page, pricing (public)
│   ├── (auth)/               # Login, signup, OAuth callback
│   ├── (dashboard)/          # Protected app routes
│   │   ├── dashboard/        # Health Score + decay list
│   │   ├── pages/            # Pages table
│   │   ├── pages/[id]/       # Diagnosis + brief detail
│   │   ├── refreshes/        # Refresh history
│   │   ├── settings/         # Account, billing
│   │   └── onboarding/       # Connect GSC, select site, import
│   └── api/
│       ├── auth/google-gsc/  # Custom OAuth for GSC
│       ├── gsc/              # GSC API calls
│       ├── diagnose/         # AI diagnosis endpoint
│       ├── refresh/          # Mark refresh done
│       ├── waitlist/         # Email capture
│       ├── cron/             # 5 cron jobs
│       └── stripe/           # Checkout, portal, webhooks
├── components/
│   ├── ui/                   # shadcn/ui (DO NOT modify these)
│   ├── dashboard/            # Health score ring, decay list, stats
│   ├── diagnosis/            # Diagnosis card, brief card, result
│   ├── pages/                # Pages table, page detail
│   ├── onboarding/           # GSC connect, site selector
│   ├── layout/               # Sidebar, header, mobile nav
│   └── marketing/            # Hero, pricing, features
├── lib/
│   ├── supabase/             # client, server, admin, middleware
│   ├── gsc/                  # OAuth, API calls, transforms
│   ├── engine/               # decay-scorer, velocity, seasonal, classifier
│   ├── ai/                   # diagnose.ts, brief.ts, pipeline.ts, sanitize.ts
│   ├── serp/                 # Serper client, content fetcher
│   ├── email/                # Resend client, templates
│   ├── stripe/               # Client, plans, webhooks
│   ├── limits.ts             # Plan limit checks
│   └── constants.ts          # Thresholds, config
├── hooks/                    # Custom React hooks
└── types/                    # TypeScript types
```

## Regras de Código

### TypeScript
- `strict: true` SEMPRE
- NUNCA usar `any` — usar `unknown` e narrowing
- Preferir `type` sobre `interface`
- Zod pra validação de input/output em TODA API route
- Types compartilhados em `src/types/`

### React / Next.js
- Server Components por default
- `"use client"` SOMENTE quando necessário (hooks, interação)
- App Router SEMPRE (nunca Pages Router)
- API Routes em `app/api/` com Route Handlers
- Metadata export pra SEO em toda página
- Loading states com Skeleton (shadcn)
- Error boundaries em rotas importantes

### Tailwind / UI
- NUNCA usar CSS inline ou arquivos CSS separados (exceto globals.css)
- shadcn/ui components SEMPRE que existir equivalente
- Design tokens em `tailwind.config.ts` e CSS variables
- Responsive: mobile-first
- Dark sidebar (#0F172A), light content area (#F5F7FA)
- Brand: teal (#0D9488), AI accent: purple (#7C3AED)
- Status: green (#16A34A), amber (#D97706), red (#DC2626), gray (#6B7280), blue (#2563EB)

### Supabase
- Client-side: `createBrowserClient` de `@supabase/ssr`
- Server-side: `createServerClient` de `@supabase/ssr`
- Admin (cron/service): `createClient` com service role key
- RLS OBRIGATÓRIO em TODA tabela (exceto waitlist)
- Migrations em `supabase/migrations/` com SQL puro
- NUNCA expor service role key no client

### API Routes
- Validar input com Zod SEMPRE
- Verificar auth SEMPRE (exceto waitlist e webhook)
- Rate limiting em endpoints sensíveis (diagnose, stripe)
- Return types consistentes: `{ data: T } | { error: string }`
- Logs estruturados pra debug

### AI / Anthropic
- Model: `claude-opus-4-6` pra diagnósticos
- Prompts de produção finalizados em `src/lib/ai/diagnose.ts` e `src/lib/ai/brief.ts`
- NÃO existe mais sistema de teste de prompts (v1-v5 removidos)
- Pipeline: SERP → fetch content → diagnosis → brief (~2-3 min, ~$0.12)
- Structured output: prompt pede JSON, validar com Zod
- Retry 1x se JSON inválido
- Salvar tokens_input, tokens_output, cost_usd em toda chamada
- NUNCA usar AI onde math pura funciona (decay score, velocity, health score)

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Branch por feature: `feat/health-score-ring`, `fix/gsc-oauth-redirect`
- Commit atômico: 1 commit = 1 mudança lógica
- NUNCA commitar .env, tokens, secrets

## Docs de Referência (ler antes de implementar)
- `/docs/PRODUCT-SPEC.md` — Visão, pricing, features, personas, AI Search stats
- `/docs/BRAND.md` — Nome SerpVive, positioning, taglines, voice, visual identity
- `/docs/SCOPE-MVP.md` — O que entra e NÃO entra no MVP, telas, demo system
- `/docs/ARCHITECTURE.md` — Schema SQL, project structure, crons, env vars
- `/docs/DESIGN.md` — Paleta, tipografia, componentes, layout patterns
- `/docs/BACKEND-ENGINE.md` — Algoritmos de decay, prompts AI, pipeline
- `/docs/ONBOARDING-AND-UX.md` — Onboarding flow (free vs paid), UX, glossário

## Estilo Visual (inspirado no Surfer SEO)
- Landing page: dark (#0A0E1A), alternância dark/light entre seções
- App: sidebar dark estreita + content area light
- Tipografia: DM Sans (headings/body) + JetBrains Mono (URLs/dados)
- Health Score: ring gauge SVG animado (1.2s easeOutCubic)
- Diagnóstico: borda roxa (AI accent), causas com border-left colorida
- Histórico de análises: accordion com comparação (causes count badge)
- Confetti: canvas-confetti no "Já atualizei" (apenas success)
- Onboarding tour: driver.js (3 steps, brand-matched styles em globals.css)
- Skeleton shimmer pra TODOS os loading states
- Toast: sonner (slide in, 4s auto-dismiss)

## Constants Importantes
```typescript
export const PLAN_LIMITS = {
  free:    { sites: 1, pages: 100, diagnoses_per_month: 0,   team_members: 1 },
  starter: { sites: 1, pages: 100, diagnoses_per_month: 10,  team_members: 1 },
  pro:     { sites: 3, pages: 1000, diagnoses_per_month: 40,  team_members: 3 },
  agency:  { sites: 10, pages: 5000, diagnoses_per_month: 120, team_members: 10 },
};

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

## O que NÃO fazer
- NÃO usar Pages Router (só App Router)
- NÃO criar CSS files separados (só Tailwind, exceto globals.css)
- NÃO usar `any` type
- NÃO expor secrets no client
- NÃO skip RLS em tabelas com user data
- NÃO usar AI pra cálculos que math resolve (decay score, velocity, etc.)
- NÃO fazer deploy sem rodar `tsc --noEmit` e `eslint`
- NÃO commitar sem testar no browser
- NÃO usar Inter, Roboto, Arial (usar DM Sans)
- NÃO usar gradientes purple genéricos (usar nosso design system)
- NÃO recriar sistema de teste de prompts (já finalizado e removido)
