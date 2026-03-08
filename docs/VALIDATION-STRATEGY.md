# ESTRATÉGIA DE VALIDAÇÃO — SerpVive

## Objetivo
Provar que SEO professionals pagariam $29+/mês por um content decay monitor com AI diagnosis ANTES de codar o produto.

## Meta de Validação
```
MÍNIMO: 50 emails em 14 dias = validado, pode codar
BOM:    100 emails em 14 dias = demanda forte, acelerar
ÓTIMO:  200+ emails em 14 dias = demanda explosiva, considerar pré-venda
FALHOU: < 30 emails em 14 dias = reposicionar ou pivotar
```

## Incentivo pra Waitlist
"Early subscribers get 14-day trial (instead of 7)" — simples, claro, real.
NÃO oferecer desconto permanente — desvaloriza o produto.

---

## FASE 1: PREPARAÇÃO (Dia 0 — dia que registra o domínio)

### Ações no Dia 0:
```
□ Registrar serpvive.com no Hostgator
□ Apontar DNS pra Vercel
□ Deploy landing page (waitlist version) via Claude Code
□ Configurar email capture → Supabase (tabela waitlist: email, source, created_at)
□ Configurar analytics (PostHog ou Plausible)
□ Criar email hello@serpvive.com (Zoho Mail free ou Resend)
□ Criar conta Twitter/X: @serpvive
□ Criar conta Reddit (se não tem uma "limpa" pra usar)
```

### Landing Page (waitlist version):
- Hero: "Revive your rankings" + email capture
- Problema: 3 stats (90.63%, -20%, -25%)
- Solução: 5-step loop
- Exemplo: diagnóstico real mockado
- Pricing: "Launching soon. Starting at $29/mo"
- CTA final: email capture com "14-day trial for early subscribers"
- Footer: links, legal

---

## FASE 2: LANÇAMENTO EM COMUNIDADES (Dia 1-14)

### Regra de Ouro: VALOR PRIMEIRO, PRODUTO SEGUNDO
Nunca postar "hey, confere meu produto". Sempre educar, compartilhar insight, e mencionar SerpVive naturalmente no final.

### Canal 1: Reddit (PRINCIPAL — maior ROI)

**Subreddits alvo:**
| Subreddit | Membros | Relevância | Regras |
|-----------|---------|------------|--------|
| r/SEO | 280K+ | ⭐⭐⭐⭐⭐ | Sem self-promo direta. Discussão OK. |
| r/content_marketing | 80K+ | ⭐⭐⭐⭐ | Mais permissivo. Case studies OK. |
| r/juststart | 60K+ | ⭐⭐⭐⭐ | Bloggers/affiliate. Muito receptivos a ferramentas. |
| r/blogging | 200K+ | ⭐⭐⭐ | Amplo. Menos técnico. |
| r/bigseo | 30K+ | ⭐⭐⭐⭐⭐ | SEO avançado. Exigentes mas influentes. |
| r/SaaS | 50K+ | ⭐⭐⭐ | Founders. Bom pra feedback, menos pra users. |
| r/Entrepreneur | 1M+ | ⭐⭐ | Grande mas genérico. Bom pra visibilidade. |
| r/indiehackers | 30K+ | ⭐⭐⭐ | Founders. Feedback + early adopters. |

**5 posts diferentes (1 a cada 2-3 dias):**

POST 1 — r/SEO (educacional, data-driven):
```
Título: "I analyzed 500 blog posts to understand content decay patterns. Here's what I found."

Corpo: Dados sobre como posts decaem (usar stats do MARKET-RESEARCH.md).
- 90.63% do conteúdo não recebe tráfego
- Padrão: posts atingem pico em 6-12 meses, depois caem
- AI Search está acelerando (ChatGPT cita conteúdo 25.7% mais fresco)
- Posts não atualizados em 90 dias perdem visibilidade em AI citations

Final: "I'm building a tool to automate this detection + AI diagnosis. 
If you manage client blogs and this is painful for you, I'd love 
your feedback: serpvive.com"
```

POST 2 — r/content_marketing (problema + solução):
```
Título: "51% of companies say updating old content is MORE effective 
than creating new. Here's a framework to decide WHICH posts to update."

Corpo: Framework de priorização (decay score × traffic potential).
Explica como calcular manualmente com GSC.
Mostra que é trabalhoso mas vale a pena (Single Grain: +96% traffic).

Final: "I'm automating this entire process with AI at serpvive.com. 
Early access coming soon — would love feedback from content marketers."
```

POST 3 — r/juststart (case study estilo):
```
Título: "How one blogger recovered 8,000 visits/month by updating 
42 old posts (and how to find which ones to update)"

Corpo: Resumo do case da Single Grain.
Tutorial step-by-step pra encontrar posts em decay via GSC.
Tempo estimado: 4-6 horas manualmente por semana.

Final: "I'm building SerpVive to automate this — AI tells you 
WHY a post is declining and exactly WHAT to fix. Join waitlist 
if interested: serpvive.com"
```

POST 4 — r/bigseo (técnico, respeitoso):
```
Título: "Content decay is accelerating in 2026. 
What's your process for identifying and prioritizing refreshes?"

Corpo: Pergunta genuína + compartilha dados (Gartner -25%, 
AI Overviews em 25%+ das buscas). Pede opiniões sobre 
metodologias de priorização.

Final (sutil): "I've been working on automating this with 
Claude Opus 4.6 analyzing SERPs — early results at serpvive.com 
if anyone wants to follow along."
```

POST 5 — r/SaaS ou r/indiehackers (building in public):
```
Título: "I'm building an AI-powered content decay monitor 
as a solo founder. Here's my validation plan."

Corpo: Compartilha o processo — pesquisa de mercado, 
competidores, decisão de usar Opus 4.6, pricing.
Transparente sobre custos e metas.

Final: "Landing page is live at serpvive.com. 
Tearing it apart is welcome — I need honest feedback."
```

### Canal 2: Twitter/X (SECUNDÁRIO — build in public)

**Estratégia:** Build in public. 1 tweet/dia sobre o processo.

**Tweets exemplo:**
```
Dia 1: "Starting to build SerpVive — an AI-powered tool that 
detects when your blog posts are losing traffic and tells you 
exactly WHY + WHAT to fix. Landing page is live 🚀 serpvive.com"

Dia 3: "90.63% of published content gets ZERO Google traffic. 
Most of it wasn't always dead — it decayed over time. 
That's the problem I'm solving with SerpVive."

Dia 5: "Current SEO tools tell you a post is declining. 
None tell you WHY or WHAT to do. That's the gap. 
Claude Opus 4.6 analyzes your SERP, reads competitors, 
and gives you a specific action plan."

Dia 7: "[Screenshot do diagnóstico mockado] 
This is what an AI diagnosis looks like in SerpVive. 
Not 'optimize your content.' 
Specific issues. Specific fixes. Measurable results."

Dia 10: "X people on the waitlist for SerpVive 🎉 
Launching in [X] weeks. If you manage blogs and want 
to stop losing traffic: serpvive.com"
```

**Hashtags e mentions:**
- #SEO #ContentMarketing #BuildInPublic #IndieHackers
- Responder threads sobre content decay, SEO tools, AI em SEO
- Engajar com @aaborisov (SEOTesting), @nickswan_ (SEOTesting founder)
- Engajar com SEO influencers: @aleyda, @brodieseo, @cyaborisov

### Canal 3: Indie Hackers (TERCIÁRIO — founders)

**Post no Indie Hackers:**
```
Título: "SerpVive — AI-powered content decay monitor. 
Validating before building. Would you pay $29/mo?"

Corpo: 
- O problema (com dados)
- O mercado ($2T content marketing, $147B SEO tools)
- A solução (5-step loop)
- Os competidores (e os gaps)
- O pricing ($29/$59/$99)
- A pergunta: "Would you pay for this? What am I missing?"
```

### Canal 4: LinkedIn (TERCIÁRIO — content marketers in-house)

**1 post longo:**
```
"Your blog is losing traffic right now. Here's how to find out which posts."

[Tutorial educacional usando GSC]

"I'm building a tool to automate this entire process. 
Follow along: serpvive.com"
```

### Canal 5: Comunidades de nicho (TERCIÁRIO)

**Onde postar:**
- Superpath community (content marketers)
- Content Marketing Institute community
- GrowthHackers
- Slack groups de SEO (SEO Signals Lab, Traffic Think Tank - se tiver acesso)
- Facebook groups: "SEO Signals Lab", "The SEO Pub"

**Regra:** Sempre ler as regras antes. Sempre dar valor. Nunca spam.

### Canal 6: Product Hunt (ESPERAR)
NÃO lançar no Product Hunt agora. Guardar pra quando o produto estiver funcional.
Product Hunt é um tiro — se desperdiçar com waitlist page, não tem segundo launch.

---

## FASE 3: ENGAJAMENTO (Dia 3-14)

### Responder TODOS os comentários
Cada comentário é um potencial user. Responder rápido, genuíno, útil.

### DMs estratégicos
Se alguém comentar algo muito relevante ("eu faço isso manualmente toda semana"):
→ DM agradecer e perguntar se pode fazer uma call de 15min pra entender o workflow.

### Meta de calls: 5-10 discovery calls nos 14 dias
Perguntas pra fazer:
```
1. Quantos blogs/sites você gerencia?
2. Como você identifica posts que estão perdendo tráfego hoje?
3. Quanto tempo gasta nisso por semana?
4. Já usou alguma ferramenta pra isso? Qual? O que faltou?
5. Se existisse uma ferramenta que explicasse POR QUE e dissesse O QUE fazer, 
   pagaria $29/mês?
6. O que te faria cancelar depois de 1 mês?
```

### Compilar feedback
Criar doc `/docs/validation/feedback.md` com todas as respostas categorizadas:
- Confirmações de dor
- Objeções
- Feature requests
- Willingness to pay
- Quotes úteis pra landing page

---

## CRONOGRAMA DIA A DIA

```
DIA 0: Registra domínio, deploya landing page, configura analytics
DIA 1: Post 1 no Reddit (r/SEO) + Tweet #1 + Post Indie Hackers
DIA 2: Monitorar comments, responder tudo
DIA 3: Post 2 no Reddit (r/content_marketing) + Tweet #2
DIA 4: Monitorar, responder, primeira discovery call se possível
DIA 5: Tweet #3 (screenshot do diagnóstico) + LinkedIn post
DIA 6: Post 3 no Reddit (r/juststart) + responder comments
DIA 7: Tweet #4 (update de waitlist) + Checar métricas (PostHog)
DIA 8: Post 4 no Reddit (r/bigseo) — o mais importante
DIA 9: Monitorar, responder, compilar feedback parcial
DIA 10: Tweet #5 (milestone de signups) + Post em Superpath/GrowthHackers
DIA 11: Post 5 no Reddit (r/SaaS ou r/indiehackers)
DIA 12: Monitorar, responder, discovery calls
DIA 13: Compilar feedback total, atualizar landing page se necessário
DIA 14: DECISÃO — checar números, go/no-go
```

---

## MÉTRICAS PRA ACOMPANHAR

```
DIÁRIAS:
- Waitlist signups (total e por dia)
- Page views (landing page)
- Conversion rate (views → signups)
- Fonte de tráfego (Reddit, Twitter, Direct, etc.)

SEMANAIS:
- Total signups
- Melhor canal (por conversão)
- Comentários/feedback recebidos
- Discovery calls realizadas

DIA 14 — DECISÃO:
┌─────────────────────────────────────────────┐
│ < 30 signups → PARAR. Reposicionar ou pivotar.  │
│   Possíveis causas: copy ruim, canal errado,│
│   problema não é forte o suficiente          │
│                                              │
│ 30-49 signups → CAUTELA. Mudar copy/canais, │
│   estender validação mais 1 semana           │
│                                              │
│ 50-99 signups → VALIDADO ✅ Começar MVP      │
│                                              │
│ 100+ signups → FORTE ✅✅ Acelerar, considerar│
│   pré-venda ($29 lifetime early bird)        │
│                                              │
│ 200+ signups → EXPLOSIVO ✅✅✅ Considerar     │
│   cobrar desde o dia 1 (Stripe checkout)     │
└─────────────────────────────────────────────┘
```

---

## SE VALIDAÇÃO FALHAR

```
ANTES DE PIVOTAR, testar:
1. Copy diferente na landing page (A/B test)
2. Canais diferentes (talvez Reddit não é o lugar)
3. Positioning diferente ("protect your traffic" vs "AI diagnosis")
4. Preço diferente (talvez $19 starter atrai mais)
5. Feature emphasis diferente (Health Score vs AI Diagnosis)

SE NADA FUNCIONAR após 30 dias:
- O problema pode não ser doloroso o suficiente pra pagar
- OU o público não está nos canais que tentamos
- OU o positioning está errado
- Fazer 10 calls antes de desistir — ouvir POR QUE não se inscreveram
```

---

## APÓS VALIDAÇÃO (transição pra desenvolvimento)

```
COM LISTA DE 50-100+ EMAILS:
1. Enviar email: "You're on the list! Here's what we're building."
   (recap do produto, timeline estimada, pedir pra responder com feedback)
2. Criar canal de feedback (Discord, Slack, ou simples email thread)
3. Começar desenvolvimento do MVP (Fase 2 do timeline)
4. Enviar updates mensais pra lista: progresso, screenshots, pedidos de input
5. Quando MVP pronto: "You're first in line. Your 14-day trial starts NOW."
```

---

## BUDGET DE VALIDAÇÃO

```
Custo total: ~$15-25
- Domínio serpvive.com: ~$10-12/ano (Hostgator)
- Vercel: $0 (free tier)
- Supabase: $0 (free tier pra waitlist table)
- PostHog/Plausible: $0 (free tier)
- Email (Zoho): $0 (free tier)
- Reddit: $0
- Twitter: $0
- Indie Hackers: $0

ZERO ads. Zero paid promotion. 100% orgânico.
```
