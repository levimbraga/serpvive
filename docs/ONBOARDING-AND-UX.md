# ONBOARDING & UX — SerpVive
## Updated: March 22, 2026

## Princípios
1. Se precisa de tutorial pra entender, o design falhou (Krug)
2. Cada tela tem UMA ação principal (Krug)
3. Jargão técnico SEMPRE tem tradução humana ao lado
4. Zero configuração. Defaults inteligentes pra tudo
5. Fácil o suficiente pra uma criança usar
6. Feedback imediato em toda ação (Norman)
7. Status badges sempre com cor + ícone + texto (Norman: accessibility)
8. Numbers big, labels small (Refactoring UI)

## Onboarding Flows

### Free Plan (sem cartão):
```
Signup → "How heard?" dropdown → Conectar GSC → Selecionar site 
→ Importando → Engine roda (weekly mode) → Dashboard com Health Score
→ 1 diagnose gratuita disponível
```

### Paid Plans (com cartão):
```
Signup → "How heard?" dropdown → Stripe Checkout (7-day trial) 
→ Conectar GSC → Selecionar site → Importando → Engine roda IMEDIATAMENTE 
→ Auto-diagnosis em background → Dashboard com Health Score 
→ Notificação quando diagnose pronta
```

### Timeline esperada (paid):
- Minuto 0-1: Signup + cartão
- Minuto 1-2: Conectar GSC
- Minuto 2-3: Selecionar site + iniciar import
- Minuto 3-5: Import completa (com preview parcial)
- Minuto 5-6: Engine roda imediatamente → Health Score aparece
- Minuto 6-15: Auto-diagnosis completa em background → notificação

**AHA moment em <15 minutos, não 24 horas.**

## Telas

### Tela 1: Signup
- Email/senha ou Google (Supabase Auth)
- Social proof no lado direito
- Google login NÃO pede acesso GSC (separado)
- "How did you hear about us?" dropdown (opcional): Google Search, Reddit, Twitter/X, Friend or colleague, Blog post or article, YouTube, Other

### Tela 2: Plano (paid flow only)
- Stripe Checkout hosted (não embed)
- Pré-selecionar Starter ($29), highlight PRO ($69)
- 7 dias grátis com cartão
- Anchor text: "SEO consultants charge $500-3,000/month"

### Tela 3: Conectar GSC
- Tela MAIS CRÍTICA — sem GSC, produto não funciona
- OAuth custom: scope webmasters.readonly
- Mensagens de segurança: "Read-only access. We NEVER modify your site."
- Ícone de cadeado + "256-bit encrypted"
- "Why do we need Search Console access?" (expandable)
- Se OAuth falhar: mensagem humana, não "Error 403"
- SEPARAR login Google de autorização GSC

### Tela 4: Selecionar Site
- Lista sites do GSC via API
- Recomendar domain property sobre URL prefix
- Avisar se site tem poucos dados (<3 meses)

### Tela 5: Importando
- Progress bar REAL (não fake)
- Mostrar dados parciais conforme chegam
- Polling a cada 3 segundos
- Preview: "127 páginas encontradas", "Possível post em decay: /seo-guide"
- Paid: Engine roda automaticamente quando import termina
- Free: Engine roda no próximo cron semanal (mostrar "Analysis will run this Sunday")

### Tela 6: Dashboard (first run)
- Health Score com dados REAIS (se engine já rodou)
- Se engine ainda não rodou: banner "Analyzing your pages... This takes about a minute."
- Se auto-diagnosis completou: badge destacado "Your first AI analysis is ready!"
- Onboarding checklist: "Setup: 3/5 complete" (GSC ✓, Import ✓, Engine ◌, First diagnosis ◌, Explore dashboard ◌)
- Free plan: features locked visíveis com "Upgrade →" no dashboard

## Emails

### Onboarding sequence:
- **Dia 0:** "Your blog's Health Score is X/100" + link pro dashboard
- **Dia 0 (quando auto-diagnosis completa):** "Your first AI analysis is ready. Here's what we found about [URL]" — ESTE é o email mais importante
- **Dia 2:** "Your post /X lost Y clicks this week" (urgência + loss framing)
- **Dia 5 (trial):** "2 days left in your trial. You have X unused diagnoses."

### Cancel email:
- Trigger: Stripe webhook `customer.subscription.deleted`
- Delay: 10 minutos
- From: "Levi from SerpVive" (pessoal)
- Plain text (não HTML)
- "Was it: not useful enough? Too expensive? Missing a feature?"
- Reply-to: inbox real do Levi

## UX Rules

### Dashboard responde 3 perguntas em 2 segundos:
1. COMO ESTÁ MEU BLOG? → Health Score (maior elemento da tela, 48-64px)
2. O QUE PRECISA DE ATENÇÃO? → Decay list (sorted by urgency, top 5)
3. O QUE EU FAÇO? → "Diagnose" no item mais urgente

### Data-first hierarchy (Refactoring UI):
- "72" em 56px bold + "/100" em 16px muted (não "Health Score: 72/100" mesmo tamanho)
- "127" em 32px bold + "pages" em 12px muted (não "Pages Monitored: 127")
- "5" em 24px bold RED + "critical" em 12px (não "Critical: 5")
- "-234" em bold RED + "clicks/mo" em muted (não "Clicks Lost: -234")

### Status badges (Norman: accessibility):
- 🔺 Critical = red bg + AlertTriangle icon + "Critical" text
- ↓ Warning = amber bg + TrendingDown icon + "Warning" text
- ✓ Healthy = green bg + CheckCircle icon + "Healthy" text
- ✕ Dead = gray bg + XCircle icon + "Dead" text
- ✦ New = blue bg + Sparkles icon + "New" text
- Funciona sem cor (ícone + texto suficientes pra daltônicos)

### Tradução de jargão:
- Decay Score → "↓47% decline"
- Velocity → "Declining fast ↓↓"
- CTR → "X% click rate"
- Position → "Position #8 on Google"
- Health Score → large number + /100

### Progressive Disclosure (diagnosis page):
- **Nível 1 (sempre visível):** Summary 2 linhas + Top action
- **Nível 2 (expandido por default):** All causes with evidence + Brief with checkboxes
- **Nível 3 (collapsed):** SERP snapshot + competitor details

### Empty States:
- Nunca "No data found"
- Sempre explicação + CTA: "No diagnoses yet. Pick a declining post to analyze."
- Free plan locked: "Daily monitoring available on Starter →"

### Micro-interações:
- Skeleton shimmer pra loading
- CountUp animation nos números
- Confetti no "I've refreshed this post"
- Toast pra feedback (sonner)
- Progress indicators SEMPRE
- Loading steps durante diagnosis (4 steps com timer)

### Sidebar: 5 itens máximo
- 📊 Dashboard (default)
- 📄 Pages
- ⚙️ Settings
- ❓ Help
- Usage meter visual (3/10 diagnoses)

### Copy rules:
- Falar como humano, não como software
- Sempre oferecer próximo passo
- Nunca mostrar IDs ou jargão de banco
- Números sempre com contexto
- Tempo sempre relativo ("3 weeks ago")
- Ações no imperativo amigável
- Error messages humanas ("GSC connection failed. Most common reason: wrong Google account. Try again?")
- Zero happy talk ("Welcome to SerpVive!" = delete)

## Funil de Métricas Esperado
```
Signup → 100%
"How heard" preenchido → 60%
GSC conectado → 70%
Import completo → 95% (dos que conectaram)
Engine rodou → 100% (automático)
Primeiro diagnóstico visualizado → 50% (OMTM de activation)
Trial → Paid conversion → 10-15%
```
