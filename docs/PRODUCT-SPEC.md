# PRODUCT SPEC — SerpVive

## Brand
- **Name**: SerpVive (SERP + Vive = "Reviva seus resultados")
- **Domain**: serpvive.com
- **Tagline**: "Revive your rankings."
- **One-liner**: AI-powered content decay monitor that detects posts losing traffic, diagnoses WHY with evidence, tells you exactly WHAT to fix, and proves it worked.
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
- Nenhuma ferramenta existente diagnostica POR QUE um post está caindo ou diz O QUE fazer com micro-drafts

## Target Audience (por ordem de prioridade)
1. **SEO Freelancers/Consultores** — Gerenciam 3-10 blogs de clientes, fazem content audit manual com GSC + planilhas (4-6h/semana). $99/mês é irrisório vs o que cobram ($500-3K/mês por cliente). Plano Agency.
2. **Content Marketers In-House** — Responsáveis por blog corporativo (SaaS, e-commerce). 50-500+ posts. Precisam justificar ROI pro chefe. Health Score + ROI data = ammo pra budget. Plano Pro.
3. **Bloggers/Publishers Profissionais** — Vivem de ad revenue/affiliate. Cada clique perdido = dinheiro perdido. ROI imediato e óbvio. Plano Starter.
4. **Solo Founders de SaaS** — Blog gera leads pro produto. Pouco tempo pra SEO. Plano Starter.

### Quem NÃO é nosso público:
- Hobby bloggers com <20 posts
- Enterprise com 10K+ pages (precisa custom)
- E-commerce focado em PPC
- Quem não faz SEO/content marketing

## Core Loop (5 Steps) — O DIFERENCIAL
1. **DETECT** — Monitoramento contínuo diário via GSC API. Calcula decay score, velocity, seasonal filter, health score. Math pura, sem AI, grátis.
2. **DIAGNOSE** — Claude Opus 4.6 analisa SERP atual (Serper.dev), conteúdo dos top 3 competidores, conteúdo do user, dados do GSC. Identifica CAUSAS com evidências concretas.
3. **RECOMMEND** — Opus 4.6 gera Refresh Brief com micro-drafts: ações ESPECÍFICAS priorizadas (🔴🟡🟢) + sugestões de título prontas, tópicos a cobrir com referência aos competidores, dados corrigidos, estrutura sugerida pra tabelas. User senta e escreve sem pesquisar mais nada.
4. **TRACK** — User faz refresh no CMS, volta e clica "Marquei como Atualizado". Snapshot de métricas salvo.
5. **PROVE** — 28 dias depois, sistema compara automaticamente antes vs depois. Status: sucesso/parcial/sem melhora/declínio.

## Features Diferenciadores (que NENHUM competidor tem)
- **AI Diagnosis com evidências** — Compara com SERP e competidores reais
- **Refresh Brief com micro-drafts** — Não "otimize seu conteúdo", mas sugestões de título prontas, tópicos com referência aos competidores, dados corrigidos
- **Health Score** — Número de 0-100 pra saúde geral do blog
- **Decay Velocity** — Velocidade de queda nos últimos 7/28 dias
- **Seasonal Detection** — Filtra automaticamente falsos positivos sazonais
- **Cannibalization Detection** — 2+ páginas competindo pela mesma query
- **Result Tracking automático** — Antes vs depois sem setup manual
- **Weekly Digest Email** — Relatório semanal com alertas, prioridades, resultados

## Pricing

| | Starter | Pro | Agency |
|--|---------|-----|--------|
| **Preço** | **$29/mês** | **$59/mês** | **$99/mês** |
| Sites | 1 | 3 | 10 |
| Páginas monitoradas | 100 | 500 | 2.000 |
| Diagnósticos AI/mês | 10 | 30 | 100 |
| Team members | 1 | 3 | 10 |
| Email digest | Semanal | Semanal | Semanal/site |
| Velocity Alerts | ❌ | ✅ | ✅ |
| Export CSV | ❌ | ✅ | ✅ |
| Client dashboards | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |

- **Trial:** 7 dias, com cartão de crédito obrigatório
- **Sem free plan**
- **Nada ilimitado** — limites generosos mas controlados
- **Overage no MVP:** Hard block com CTA de upgrade
- Self-service checkout via Stripe. Sem "contact us".
- "Need more than 10 sites? hello@serpvive.com"
- Primeiro diagnóstico gratuito e automático (não conta no limite)

## AI Model: Claude Opus 4.6
- **Pricing:** $5 input / $25 output por million tokens
- **Custo por diagnóstico completo (diagnosis + brief + micro-drafts):** ~$0.13
- **Por que Opus:** O diagnóstico É o produto. A diferença de custo vs Sonnet é ~$0.05/diagnóstico (~1.5% do MRR). Irrelevante financeiramente, decisivo pra qualidade.
- **Onde NÃO usar AI:** Decay scoring, velocity, seasonal detection, health score, result tracking — tudo math/SQL puro.

## Unit Economics

| Cenário | Users | MRR | Custo total | Margem |
|---------|-------|-----|------------|--------|
| Early | 50 | $1.750 | ~$100 | ~94% |
| Growth | 200 | $7.400 | ~$250 | ~97% |
| Scale | 500 | $15.500 | ~$630 | ~96% |

- Custo fixo: ~$66/mês (Vercel $20 + Supabase $25 + Resend $0-20 + domínio $1)
- Breakeven: ~4 users pagando $29 = $116 MRR
- Budget disponível: R$1.000/mês (~$170 USD) + Claude Code Max ($200/mês)

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
- **v1.1** (2-4 sem): CSV export, sparklines, ROI calculator, URL filters
- **v2.0** (1-2 meses): Auto-Draft (gera rascunhos de seções), Slack integration, WordPress plugin, Competitor Watch
- **v3.0+** (3+ meses): GEO/AI Search tracking, benchmark database, white-label, public API, content calendar
