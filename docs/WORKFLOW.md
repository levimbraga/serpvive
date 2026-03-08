# WORKFLOW — SerpVive: Solo Founder com Equipe de 10 usando Claude
## Claude Code Max + Claude Desktop Cowork + Claude Chat

---

## SEU SETUP

```
HARDWARE: ThinkPad (Windows)
ASSINATURA: Claude Max ($200/mês) — 20x tokens, acesso Opus 4.6
FERRAMENTAS:
  1. Claude Code (CLI no terminal / VS Code) → DESENVOLVIMENTO
  2. Claude Desktop Cowork (app Windows) → OPERAÇÕES / DOCUMENTOS / AUTOMAÇÃO
  3. Claude Chat (web/app) → ESTRATÉGIA / PLANEJAMENTO / BRAINSTORM (o que estamos fazendo agora)
  4. Claude in Chrome (browser) → PESQUISA / ANÁLISE DE COMPETIDORES
```

---

## A "EQUIPE DE 10" — Cada "funcionário" é um MODO de usar Claude

```
┌─────────────────────────────────────────────────────────────┐
│                    VOCÊ (CEO / Fundador)                     │
│                 Decisões finais, visão, prioridades          │
├────────────┬────────────┬───────────┬───────────────────────┤
│            │            │           │                       │
│  CLAUDE    │  CLAUDE    │  CLAUDE   │  CLAUDE               │
│  CODE      │  COWORK    │  CHAT     │  IN CHROME            │
│  (VSCode)  │  (Desktop) │  (Web)    │  (Browser)            │
│            │            │           │                       │
│ Engenheiro │ Operações  │ Estraté-  │ Pesquisador           │
│ Full-Stack │ + Legal    │ gista     │ de Mercado            │
│            │ + Docs     │ + Advisor │                       │
│            │ + Data     │           │                       │
└────────────┴────────────┴───────────┴───────────────────────┘
```

---

## OS 10 "FUNCIONÁRIOS" E QUAL FERRAMENTA USAR

### 1. 🔧 ENGENHEIRO FULL-STACK — Claude Code (VSCode)
**Ferramenta:** Claude Code Max no terminal integrado do VSCode
**Modelo:** Opus 4.6 (complex tasks) / Sonnet 4.6 (routine tasks)

```
O QUE FAZ:
- Escreve código (Next.js, TypeScript, React, Tailwind)
- Cria componentes shadcn/ui
- Configura Supabase (migrations, RLS, functions)
- Integra APIs (GSC, Anthropic, Serper, Stripe, Resend)
- Implementa cron jobs
- Faz debug e fix de bugs
- Escreve testes
- Faz git commits e PRs
- Refatora código existente

COMO USAR:
# Navegar pro projeto e iniciar
cd ~/serpvive && claude

# Dar contexto com CLAUDE.md no root do projeto
# (o arquivo com instruções do projeto que já criamos)

# Exemplos de comandos:
> Implemente o componente HealthScoreRing seguindo a spec em /docs/design-ui-direction.md
> Crie a migration do Supabase pra tabela diagnoses conforme ARCHITECTURE.md
> Integre a API do Serper.dev em lib/serp/client.ts com error handling e retry
> Rode os testes e corrija os que falharam

DICA: Usar subagents pra tarefas paralelas
> Crie 3 subagents: um pra implementar o decay-scorer, 
  outro pra velocity calculator, outro pro seasonal detector.
  Todos seguindo as specs em /docs/backend-7-diferenciais-spec.md
```

### 2. 🏗️ ARQUITETO DE SOFTWARE — Claude Code (VSCode)
**Ferramenta:** Claude Code com Opus 4.6 (sempre Opus pra arquitetura)

```
O QUE FAZ:
- Revisa decisões de arquitetura
- Planeja refatorações grandes
- Avalia trade-offs técnicos
- Design de APIs e schemas
- Code review profundo
- Planeja migrações de banco

COMO USAR:
> Analise a estrutura atual do projeto e sugira melhorias 
  de performance pra quando tivermos 500+ users

> Revise o schema do banco e identifique possíveis 
  problemas de escala com page_metrics_daily

> Faça code review do PR #15 focando em segurança e performance
```

### 3. 🔒 ENGENHEIRO DE SEGURANÇA — Claude Code + Cowork
**Ferramenta:** Claude Code (análise de código) + Cowork (documentos de compliance)

```
O QUE FAZ:
- Audita código pra vulnerabilidades
- Revisa RLS policies do Supabase
- Verifica que tokens GSC estão encriptados
- Testa autenticação e autorização
- Revisa headers de segurança
- Verifica dependências com vulnerabilidades conhecidas

COMO USAR (Claude Code):
> Audite todo o projeto focando em segurança:
  - SQL injection
  - XSS
  - Token exposure
  - Missing auth checks
  - Insecure dependencies
  - RLS policy gaps

> Rode `npm audit` e corrija vulnerabilidades críticas

COMO USAR (Cowork):
> Crie uma checklist de segurança pra o SerpVive baseado 
  em OWASP Top 10, salve em /docs/security-checklist.md
```

### 4. 📋 PRODUCT MANAGER — Claude Chat (este chat)
**Ferramenta:** Claude Chat web/app com Project Knowledge

```
O QUE FAZ:
- Define prioridades de features
- Escreve specs de produto
- Planeja sprints e milestones
- Analisa métricas do produto
- Decide trade-offs (scope vs speed)
- Mantém backlog organizado

COMO USAR:
- É o que estamos fazendo AGORA neste project
- Sempre consulta os knowledge files (PRODUCT-SPEC, SCOPE-MVP, etc.)
- Decisões ficam documentadas na conversa e em arquivos

REGRA: Toda decisão de produto passa pelo Claude Chat primeiro,
depois vai pro Claude Code como spec pra implementar.
```

### 5. ⚖️ CONSULTOR LEGAL — Claude Desktop Cowork
**Ferramenta:** Cowork com plugin Legal (anthropics/knowledge-work-plugins)

```
O QUE FAZ:
- Gera Privacy Policy pro serpvive.com
- Gera Terms of Service
- Revisa compliance com GDPR (users europeus)
- Verifica que OAuth consent screen atende requisitos Google
- Revisa contratos de API (Anthropic, Serper, Stripe)
- Cookie policy

COMO USAR (Cowork):
> Crie uma Privacy Policy completa pro SerpVive.com.
  O produto coleta: email, dados do Google Search Console 
  (somente leitura), e processa pagamentos via Stripe.
  Armazena dados no Supabase (PostgreSQL).
  Usa AI (Anthropic Claude) pra análise de conteúdo.
  Salve em /serpvive/public/privacy-policy.md

> Crie Terms of Service cobrindo: SaaS subscription, 
  7-day trial, cancellation, data deletion, API usage limits.
  Salve em /serpvive/public/terms-of-service.md

> Revise se o produto está compliant com GDPR pra 
  users europeus. Liste o que precisa implementar.

PLUGINS ÚTEIS:
- Legal plugin (built-in no Cowork)
- Pode conectar MCP server do Google Drive pra salvar docs
```

### 6. 📊 ANALISTA DE DADOS — Claude Desktop Cowork + Chat
**Ferramenta:** Cowork (processar dados) + Chat (interpretar)

```
O QUE FAZ:
- Analisa métricas do produto (PostHog)
- Processa dados de waitlist
- Cria reports de MRR/churn
- Analisa padrões de uso (quais features usam mais)
- Calcula unit economics reais vs projetados
- Monitora custos de API (Anthropic, Serper)

COMO USAR (Cowork):
> Leia o arquivo waitlist-signups.csv e gere um report:
  - Total de signups por dia
  - Fonte de tráfego (referrer)
  - Taxa de conversão por canal
  - Projeção pras próximas 2 semanas
  Salve o report em /docs/reports/waitlist-report.md

> Analise os custos da API do Anthropic deste mês.
  Leia o arquivo /data/api-costs-march.csv.
  Compare com as projeções do PRODUCT-SPEC.
  Estamos dentro do orçamento?
```

### 7. ✍️ CONTENT WRITER / COPYWRITER — Claude Chat + Cowork
**Ferramenta:** Chat (brainstorm) + Cowork (produzir)

```
O QUE FAZ:
- Escreve blog posts pra SEO (content marketing)
- Escreve copy da landing page
- Escreve emails (onboarding, digest, marketing)
- Escreve posts pra Reddit/Twitter/comunidades
- Cria documentação do produto (help center)
- Escreve changelog/release notes

COMO USAR (Chat):
> Escreva um outline pra blog post sobre 
  "How to detect content decay using Google Search Console"
  Target: SEO freelancers. Tom: educacional, data-driven.

COMO USAR (Cowork):
> Escreva o blog post completo baseado neste outline: [...]
  Salve em /content/blog/detect-content-decay-gsc.md
  Formato: markdown com headings, imagens placeholder, 
  e meta description otimizada pra SEO.

> Escreva os 3 emails de onboarding do SerpVive
  conforme a spec em /docs/onboarding-ux-spec.md
  Salve em /serpvive/emails/
```

### 8. 🎨 DESIGNER UI/UX — Claude Code + Chat
**Ferramenta:** Claude Code (implementa) + Chat (decide visual direction)

```
O QUE FAZ:
- Implementa componentes UI (React + Tailwind + shadcn)
- Cria landing page
- Refina visual do dashboard
- Garante responsividade mobile
- Ajusta cores, espaçamento, tipografia
- Cria email templates (React Email)

COMO USAR (Claude Code):
> Implemente a landing page do SerpVive seguindo 
  /docs/landing-page-spec-serpvive.md
  Use o protótipo HTML em /docs/serpvive-landing-page.html 
  como referência visual.
  Estilo inspirado no Surfer SEO: dark theme, clean cards, 
  purple AI accent.

> O mockup do dashboard está com espaçamento irregular 
  no mobile. Corrija pra seguir a spec de responsive breakpoints.
```

### 9. 📣 MARKETING MANAGER — Claude Chat + Chrome + Cowork
**Ferramenta:** Chat (estratégia) + Chrome (pesquisa) + Cowork (execução)

```
O QUE FAZ:
- Planeja estratégia de lançamento
- Identifica comunidades pra postar
- Prepara posts pra Reddit/Twitter/Indie Hackers
- Planeja Product Hunt launch
- Monitora mentions e feedback
- Analisa competidores periodicamente

COMO USAR (Chrome):
- Navegar no r/SEO, Twitter SEO, Indie Hackers
- Claude in Chrome analisa posts dos competidores
- Identifica threads onde SerpVive seria relevante

COMO USAR (Chat):
> Crie 5 posts diferentes pra r/SEO sobre content decay.
  Tom: educacional primeiro, mention do SerpVive sutil no final.
  Cada post com angle diferente (dados, problema, tutorial, etc.)

COMO USAR (Cowork):
> Pesquise online as últimas discussões sobre content decay 
  no Reddit e Twitter. Compile os insights mais relevantes 
  num documento /docs/market-intel/community-pulse-march.md
```

### 10. 🤝 CUSTOMER SUPPORT — Claude Chat + Cowork
**Ferramenta:** Chat (resolver problemas) + Cowork (criar base de conhecimento)

```
O QUE FAZ:
- Responde emails de suporte (via template)
- Cria FAQ e documentação de ajuda
- Cria guias de troubleshooting
- Analisa feedback e categoriza
- Sugere melhorias baseado em tickets recorrentes

COMO USAR (Cowork):
> Crie o Help Center completo do SerpVive baseado no
  /docs/ux-simplicity-tutorial-spec.md
  Organize por seções: Getting Started, Dashboard, 
  Diagnosis, Refresh, Billing, Troubleshooting.
  Salve em /content/help-center/

COMO USAR (Chat):
> Um user reportou que o GSC connection falha com erro 
  "redirect_uri_mismatch". Qual é a causa provável e 
  como resolver? Crie um template de resposta pra esse caso.
```

---

## WORKFLOW DIÁRIO (como o dia se parece)

```
MANHÃ (planning):
┌─────────────────────────────────────────────────────┐
│ 1. Abre Claude Chat (web) — revisa prioridades      │
│    "O que devo fazer hoje? Consulta o backlog."      │
│                                                      │
│ 2. Abre Claude Desktop Cowork — verifica tarefas     │
│    automáticas (reports, emails, docs pendentes)      │
│                                                      │
│ 3. Define 1-3 tarefas do dia                         │
└─────────────────────────────────────────────────────┘

MANHÃ/TARDE (building):
┌─────────────────────────────────────────────────────┐
│ 4. Abre VSCode + Claude Code — implementa            │
│    "Implementa feature X conforme spec Y"            │
│                                                      │
│ 5. Claude Code roda subagents em paralelo:           │
│    - Agent 1: implementa componente                  │
│    - Agent 2: escreve testes                         │
│    - Agent 3: atualiza documentação                  │
│                                                      │
│ 6. Testa, commita, deploya                           │
└─────────────────────────────────────────────────────┘

FINAL DO DIA (operations):
┌─────────────────────────────────────────────────────┐
│ 7. Cowork — gera reports do dia                      │
│    "Resuma o que foi implementado hoje. Atualize     │
│    o changelog e o status do sprint."                │
│                                                      │
│ 8. Chat — planeja amanhã                             │
│    "Baseado no que fizemos hoje, qual a prioridade   │
│    de amanhã?"                                       │
│                                                      │
│ 9. Cowork — agenda tarefas automáticas               │
│    (Cowork pode rodar scheduled tasks)               │
└─────────────────────────────────────────────────────┘
```

---

## WORKFLOW POR FASE DO PROJETO

### FASE 1: VALIDAÇÃO (Semana 1-2)
```
CHAT:    Planejar copy da landing page, estratégia de validação
CODE:    Construir landing page + API de waitlist
COWORK:  Gerar Privacy Policy, Terms of Service
CHROME:  Pesquisar comunidades pra postar, analisar competidores
```

### FASE 2: FUNDAÇÃO (Semana 3-5)
```
CODE:    Setup projeto (Next.js + Supabase + Auth + Stripe)
CODE:    Database migrations + RLS policies
CODE:    OAuth flow pra Google Search Console
CHAT:    Revisar decisões técnicas conforme surgem
COWORK:  Documentação técnica, README, setup guide
```

### FASE 3: CORE FEATURES (Semana 6-9)
```
CODE:    Decay engine (scoring, velocity, seasonal, classifier)
CODE:    Dashboard + pages table + onboarding
CODE:    Cron jobs (sync GSC, run engine)
CHAT:    Iterar em specs conforme implementa
COWORK:  Testar fluxos, gerar test data, criar screenshots
```

### FASE 4: AI + INTELLIGENCE (Semana 10-11)
```
CODE:    Integrar Anthropic API (diagnóstico + brief)
CODE:    Pipeline completo (SERP → content → Opus → JSON)
CHAT:    Refinar prompts do Opus 4.6 (iteração intensa)
CODE:    Result tracking, refresh flow
COWORK:  Testar diagnósticos com dados reais, documentar qualidade
```

### FASE 5: POLISH + LAUNCH (Semana 12)
```
CODE:    Email templates (Resend + React Email)
CODE:    Billing (Stripe Checkout + Portal + Webhooks)
CODE:    Bug fixes, performance, mobile responsive
COWORK:  Help Center, FAQ, email sequences
CHAT:    Product Hunt launch plan, comunidades
CHROME:  Postar em r/SEO, Twitter, Indie Hackers
```

---

## MCP SERVERS PRA CONECTAR

```
COWORK + CODE podem conectar via MCP:

JÁ DISPONÍVEIS (built-in connectors):
- Google Drive → salvar docs, reports
- Gmail → monitorar emails de suporte
- Slack → notificações (se criar workspace)
- GitHub → PRs, issues, commits

CONFIGURAR DEPOIS:
- Supabase MCP → consultar banco direto do Cowork
- Stripe MCP → verificar subscriptions, MRR
- PostHog MCP → métricas do produto
- Vercel MCP → deploy status, logs
```

---

## PLUGINS DO COWORK PRA INSTALAR

```
BUILT-IN (11 plugins oficiais):
✅ Legal → Privacy Policy, Terms, compliance
✅ Finance → Unit economics, MRR tracking
✅ Marketing → Content strategy, social posts
✅ Data → CSV analysis, reports
✅ Productivity → Task management, planning

COMMUNITY PLUGINS:
✅ Product Management → PRD, sprint planning
✅ SEO-specific skills → se existirem no marketplace
```

---

## REGRAS DO WORKFLOW

```
1. CHAT = decisão. CODE = execução. COWORK = operação.
   Nunca codar sem spec. Nunca decidir sem contexto.

2. Sempre começar o dia no CHAT.
   "O que é prioridade hoje?"

3. Claude Code SEMPRE tem o CLAUDE.md atualizado.
   É o "briefing" que o engenheiro lê antes de trabalhar.

4. Cowork SEMPRE tem folder instructions configuradas.
   Cada pasta do projeto tem contexto específico.

5. Sessões novas pra tarefas novas.
   /clear no Claude Code entre features diferentes.
   Nova conversa no Chat pra cada área (marketing vs produto).

6. Documentar TUDO em arquivos.
   Não confiar na memória das conversas.
   Specs → /docs/
   Reports → /reports/
   Content → /content/

7. Opus pra decisões complexas. Sonnet pra rotina.
   Arquitetura, segurança, prompts de AI → Opus
   Implementação de componentes, testes → Sonnet

8. Backup antes de Cowork mexer em arquivos.
   Git commit ANTES de pedir pro Cowork editar.
```

---

## RESUMO: QUAL FERRAMENTA PRA QUÊ

| Preciso de... | Uso... | Porque... |
|---------------|--------|-----------|
| Planejar features | Claude Chat (este project) | Tem knowledge files, memória de decisões |
| Escrever código | Claude Code (VSCode) | Acessa codebase, roda testes, faz commits |
| Criar documentos (legal, reports) | Cowork (Desktop) | Acessa arquivos locais, salva direto |
| Pesquisar mercado | Claude in Chrome | Navega sites reais, analisa em contexto |
| Gerar conteúdo (blog, email) | Cowork ou Chat → Code | Brainstorm no Chat, produz no Cowork/Code |
| Auditar segurança | Claude Code | Lê código, roda npm audit, analisa deps |
| Analisar dados | Cowork | Lê CSVs, gera reports, processa planilhas |
| Resolver bug urgente | Claude Code | Acesso direto ao código + terminal |
| Decidir trade-off | Claude Chat | Discute com contexto do project |
| Automatizar tarefa recorrente | Cowork (scheduled tasks) | Roda sem intervenção no horário definido |
```
