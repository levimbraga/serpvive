# PRODUCT SPEC — SerpVive
## Updated: March 22, 2026

## Brand
- **Name**: SerpVive (SERP + Vive = "Reviva seus resultados")
- **Domain**: serpvive.com
- **Pronunciation**: surp-VAIV
- **One-liner**: SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.
- **Email**: hello@serpvive.com
- **Twitter**: @serpvive

## Vision
Todo conteúdo morre. A gente avisa quando começa a morrer, explica por que, diz como salvar, e prova que funcionou.

## The Problem
- 90.63% do conteúdo publicado não recebe nenhum tráfego do Google (Ahrefs)
- Sites que negligenciam conteúdo antigo perdem até 20% do tráfego orgânico/ano (Conductor)
- AI Search está acelerando decay: Gartner prevê queda de 25% no volume de buscas até 2026
- ChatGPT cita conteúdo 25.7% mais fresco que Google tradicional (Ahrefs 2025)
- 76.4% das páginas mais citadas pelo ChatGPT foram atualizadas nos últimos 30 dias (Passionfruit 2025)
- 51% das empresas dizem que atualizar conteúdo existente é MAIS efetivo que criar novo
- Nenhuma ferramenta existente diagnostica POR QUE um post está caindo ou diz O QUE atualizar com micro-drafts

## Target Audience (por ordem de prioridade)
1. **SEO Freelancers/Consultores** — Gerenciam 3-10 blogs de clientes. Content audit manual com GSC + planilhas (4-6h/semana). $129/mês é irrisório vs o que cobram ($500-3K/mês por cliente). Plano Agency.
2. **Content Marketers In-House** — Responsáveis por blog corporativo (SaaS, e-commerce). 50-500+ posts. Precisam justificar ROI pro chefe. Health Score + ROI data = ammo pra budget. Plano Pro.
3. **Bloggers/Publishers Profissionais** — Vivem de ad revenue/affiliate. Cada clique perdido = dinheiro perdido. ROI imediato e óbvio. Plano Starter.
4. **Solo Founders de SaaS** — Blog gera leads pro produto. Pouco tempo pra SEO. Plano Free → Starter.

### Quem NÃO é nosso público:
- Hobby bloggers com <20 posts
- E-commerce focado em PPC
- Quem não faz SEO/content marketing

## Core Loop (5 Steps) — O DIFERENCIAL
1. **DETECT** — Monitoramento contínuo via GSC API (diário pra pagos, semanal pra free). Calcula decay score, velocity, seasonal filter, health score. Math pura, sem AI, grátis.
2. **DIAGNOSE** — Claude Opus 4.6 analisa SERP atual (Serper.dev), conteúdo dos top 3 competidores, conteúdo do user, dados do GSC. Identifica CAUSAS com evidências concretas. Inclui análise E-E-A-T. Tom de SEO senior consultant, sem hedging.
3. **RECOMMEND** — Opus 4.6 gera Refresh Brief. Ações ESPECÍFICAS priorizadas (🔴🟡🟢) com micro-drafts: sugestões de título prontas, tópicos a cobrir com referência aos competidores, dados corrigidos, estrutura sugerida pra tabelas. User abre o post existente, faz as atualizações indicadas, mantém a essência do conteúdo original.
4. **TRACK** — User faz refresh no CMS, volta e clica "Marquei como Atualizado". Snapshot de métricas salvo.
5. **PROVE** — 28 dias depois, sistema compara automaticamente antes vs depois. Status: sucesso/parcial/sem melhora/declínio.

## Features Diferenciadores (que NENHUM competidor tem)
- **AI Diagnosis com evidências + E-E-A-T** — Compara com SERP e competidores reais, usa vocabulário SEO profissional
- **Refresh Brief com micro-drafts** — Não "otimize seu conteúdo", mas "Monday.com: $8→$12/seat, atualizado em Março 2025"
- **Health Score** — Número de 0-100 pra saúde geral do blog
- **Decay Velocity** — Velocidade de queda nos últimos 7/28 dias
- **Seasonal Detection** — Filtra automaticamente falsos positivos sazonais
- **Cannibalization Detection** — 2+ páginas competindo pela mesma query
- **Result Tracking automático** — Antes vs depois sem setup manual
- **Weekly Digest Email** — Relatório semanal com alertas, prioridades, resultados
- **Demo System** — Admin gera análises públicas compartilháveis pra growth hacking

## Pricing

| | Free | Starter | Pro | Agency | Enterprise |
|--|------|---------|-----|--------|------------|
| **Preço** | **$0** | **$29/mês** | **$69/mês** | **$129/mês** | **Custom** |
| Sites | 1 | 1 | 3 | 10 | Custom |
| Páginas monitoradas | 100 | 100 | 1,000 | 5,000 | Custom |
| Diagnósticos AI | 1 lifetime | 10/mês | 40/mês | 120/mês | Custom |
| Monitoramento | Semanal | Diário | Diário | Diário | Diário |
| Health Score + decay | ✅ | ✅ | ✅ | ✅ | ✅ |
| Email digest | ❌ | Semanal | Semanal | Semanal/site | Custom |
| Velocity/Seasonal | ❌ | ✅ | ✅ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dedicated account mgr | ❌ | ❌ | ❌ | ❌ | ✅ |
| White-label reports | ❌ | ❌ | ❌ | ❌ | ✅ |
| SSO / SAML | ❌ | ❌ | ❌ | ❌ | ✅ |

- **Annual toggle:** Save 17% (2 months free)
- **Trial (paid plans):** 7 dias com cartão de crédito
- **Free plan:** 1 diagnosis lifetime, weekly monitoring, limited engine (no velocity, no seasonal, no cannibalization)
- **Overage:** Hard block com CTA de upgrade
- Self-service checkout via Stripe. Enterprise = "Contact Us."
- Primeiro diagnóstico gratuito e automático pra todos (free e trial)

### Free Plan Strategy
O free plan é um funil de conversão, não freemium:
- User vê Health Score + decay list toda semana (dor crescente)
- Só tem 1 diagnose AI (experimenta o valor)
- Cada semana os posts pioram e ele não pode diagnosticar mais
- Conversão natural: dor aumenta com o tempo
- Condições: weekly cron (não daily), engine limitado, features locked visíveis no dashboard
- Free users inativos >60 dias: pausar cron processing

## AI Model: Claude Opus 4.6
- **Pricing:** $5 input / $25 output por million tokens
- **Custo por diagnóstico completo (diagnosis + brief):** ~$0.12
- **Por que Opus:** O diagnóstico É o produto. A diferença vs Sonnet é ~$0.05/diagnóstico. Irrelevante financeiramente, decisivo pra qualidade.
- **Onde NÃO usar AI:** Decay scoring, velocity, seasonal detection, health score, result tracking (tudo math/SQL puro).
- **Prompt calibrado com:** E-E-A-T analysis, SEO expert vocabulary, banned hedging phrases, sandwich/refocus technique, chain-of-thought via reasoning field.

## Critical Pre-Launch Features (from 29-book analysis)
- **"How did you hear about us?"** dropdown no signup (SaaS Playbook)
- **Auto-email no cancel** via Stripe webhook, 10 min (SaaS Playbook)
- **Engine roda imediatamente** pra sites novos, não espera cron (PLG: Time-to-Value)
- **Auto-diagnosis background** server-side, não client-side (PLG: aha moment)
- **Status badges** com cor + ícone + texto, não só cor (Norman: accessibility)
- **Dashboard labels** data-first, numbers big, labels small (Refactoring UI)
- **Hero copy** loss framing, AI no badge não no headline (Cialdini + Dunford)
- **Pricing anchor** contra custo de consultor $500-3K/mês (Monetizing Innovation)

## Unit Economics

| Cenário | Users | MRR | Custo total | Margem |
|---------|-------|-----|------------|--------|
| Early | 50 (10 free, 40 paid) | $2,200 | ~$120 | ~95% |
| Growth | 200 (60 free, 140 paid) | $8,500 | ~$300 | ~96% |
| Scale | 500 (150 free, 350 paid) | $18,000 | ~$700 | ~96% |

- Custo fixo: ~$66/mês (Vercel $20 + Supabase $25 + Resend $0-20 + domínio $1)
- Breakeven: ~3-4 users pagando $29 = ~$100 MRR
- Budget disponível: R$1.000/mês (~$170 USD) + Claude Code Max

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + custom Google OAuth (GSC scope) |
| Security | Row Level Security (RLS) |
| AI | Anthropic Claude Opus 4.6 |
| SERP | Serper.dev ($1/1K queries) |
| HTML Parse | Cheerio |
| Deploy | Vercel |
| Email | Resend + React Email |
| Payments | Stripe |
| Validation | Zod |
| Analytics | PostHog (free tier) |
| Dev Tool | Claude Code Max (Opus 4.6) |

## Roadmap (após MVP)
- **v1.1** (2-4 sem): CSV export, sparklines, ROI calculator, URL filters, shareable Health Score report, referral email automation
- **v2.0** (1-2 meses): Auto-Draft (gera rascunhos de seções), Slack integration, WordPress plugin, Competitor Watch, Agency-exclusive features (team collab, white-label)
- **v3.0+** (3+ meses): GEO/AI Search tracking, benchmark database, public API, content calendar, "Blog Health Check" free tool (engineering as marketing)

## Pitch (3 Layers)
### One-liner (5 seconds):
SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.

### Elevator (30 seconds):
Most blog posts start losing rankings after 6-12 months, and most people don't notice until it's too late. SerpVive monitors your blog daily, flags posts that are declining, and uses AI to diagnose exactly WHY: outdated data, new competitors, intent shifts. Then it tells you exactly what to update. Which facts are stale, which sections to add, which title to change. Like having a senior SEO consultant watching your blog 24/7 for $29 a month.

### Full (2 minutes):
See SERPVIVE-PITCH.md for complete version.
