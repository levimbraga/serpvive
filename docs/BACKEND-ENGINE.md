# BACKEND ENGINE — SerpVive
## Updated: March 22, 2026

## 7 Diferenciais Técnicos (math pura + AI)

## 1. Decay Score (math pura, sem AI)
```
FÓRMULA: decay_score = (peak_clicks - current_clicks) / peak_clicks × 100

peak_clicks = MAX de clicks mensais nos últimos 16 meses
current_clicks = SUM de clicks dos últimos 28 dias

EDGE CASES:
- peak < 10 clicks → ignorar (ruído estatístico)
- current > peak → decay_score = 0 (crescendo, não decaindo)
- page < 3 meses de dados → status = "new", sem decay score
```

## 2. Decay Velocity (velocidade de queda, paid plans only)
```
FÓRMULA: velocity_7d = (clicks_semana_passada - clicks_esta_semana) / clicks_semana_passada × 100
velocity_28d = mesma fórmula mas comparando últimos 28d vs 28d anteriores

INTERPRETAÇÃO:
- velocity < -5% = crescendo (bom)
- velocity -5% a 5% = estável
- velocity 5% a 15% = caindo devagar
- velocity > 15% = caindo rápido
```

## 3. Seasonal Detection (filtro de falso positivo, paid plans only)
```
LÓGICA: Compara performance do MESMO PERÍODO do ano passado
seasonal_ratio = clicks_este_periodo / clicks_mesmo_periodo_ano_passado

INTERPRETAÇÃO:
- ratio entre 0.80 e 1.20 (±20%) = variação sazonal NORMAL → is_seasonal = true
- ratio < 0.80 = queda REAL
- Sem dados do ano passado → is_seasonal = false
```

## 4. Classifier (status da página)
```
REGRAS (em ordem de prioridade):
1. data < 3 meses → "new"
2. decay_score > 70% por 6+ meses → "dead"
3. decay_score > 30% → "critical"
4. decay_score 15-30% → "warning"
5. decay_score < 15% → "healthy"
6. sem dados suficientes → "unknown"
```

## 5. Health Score (nota geral do blog)
```
FÓRMULA: Média ponderada de todas as páginas
healthy = 100 | warning = 60 | critical = 20 | dead = 0 | new = excluído
health_score = SUM(peso × count) / SUM(count_excluindo_new)
Resultado: 0-100, arredondado pra inteiro
```

## 6. Cannibalization Detection (paid plans only)
```
LÓGICA: 2+ páginas ranqueando pra mesma top query
Flag de cannibalização → mostra no diagnóstico como causa possível
```

## 7. AI Diagnosis Pipeline

### Architecture (already built):
```
3 views share diagnosis UI (code duplication to refactor):
1. PageDetailClient (1596 lines) — main view at /pages/[id], GSC-connected pages
2. AnalyzeUrlClient (484 lines) — "Analyze any URL" at /pages/analyze
3. AnalysisResultView (383 lines) — permalink at /pages/analyze/[id]

2 pipelines:
- runDiagnosisPipeline — for GSC-connected sites (full data)
- runExternalPipeline — for URL+keyword analysis (no GSC data)
```

### Data assembly flow:
```
1. Keyword selection: keywordOverride > primary_keyword > slug from URL
2. Serper search → top 10 organic results formatted
3. Content fetch: user page + top 3 competitors via Cheerio (11 fields per page)
4. GSC queries: top 20 from page_queries table
5. All strings through sanitizeForPrompt() (prompt injection defense)
6. Diagnosis runs (Opus call #1) → JSON validated with Zod
7. Brief generation (Opus call #2) → receives diagnosis JSON as input
8. Save to diagnoses table
```

### Cheerio extraction (already built, thorough):
Per page extracts: title, meta description, all headings (h1-h6), body text (truncated 3000 chars), published/modified dates (meta + time + JSON-LD), image alt texts, internal/external links, table data. Strips: script, style, nav, footer, hidden elements, comments, event handlers.

### Current prompt architecture (already built):
- Two separate prompts: buildDecayPrompt() for established pages, buildNewPagePrompt() for <3 month pages
- Persona: "senior SEO consultant delivering a diagnosis to a client"
- Security block: marks all web content as UNTRUSTED DATA
- 3-tier healthy page handling (positions 1-3, 4-10, 10+)
- Allows 0 causes for healthy pages
- Includes strengths (1-5) and topic_coverage (covered/total/percentage/missing)
- Comparison with previous diagnosis (cause count delta)
- Loading steps: 4 cosmetic steps with setTimeout (15s, 40s, 80s)

### Current Zod schemas (already built):
```typescript
DiagnosisSchema = z.object({
  summary: string,
  strengths: string[] (1-5),
  topic_coverage: { covered, total, percentage, missing[] },
  causes: [{ title, description, severity, evidence, category }] (0-5),
  serp_analysis: { top_competitors[], intent_type, content_format_trend }
})

RefreshBriefSchema = z.object({
  total_effort_hours: number,
  actions: [{ priority, title, description, effort_minutes, category, micro_draft: { type, suggestions[], competitor_references? } }] (0-8)
})

Categories for decay: outdated_content | new_competitors | intent_shift | missing_topic | format_gap | technical_issue | cannibalization | thin_content | content_gap | title_meta | internal_linking | content_structure
```

### PENDING PROMPT CHANGES (from 29-book analysis):

**A) Add E-E-A-T as analysis dimension** (Art of SEO)
Add to INSTRUCTIONS section: evaluate Experience, Expertise, Authoritativeness, Trust for user's page vs competitors.

**B) Add Sandwich/Refocus** (Prompt Engineering book)
Add REFOCUS section before schema: "Based on ALL the evidence above, provide your diagnosis..."

**C) Add Writing Rules with banned phrases** (Everybody Writes)
Banned: "I'd suggest", "you might want to", "it appears that", "consider perhaps"
Required pattern: "Cause: [what]. Evidence: [data]. Impact: [why it matters]."
Use SEO vocabulary: search intent shift, SERP feature displacement, CTR erosion, E-E-A-T gap, QDF signal.

**D) Add Summary Rules** (Don't Make Me Think)
Summary must: state primary cause, mention specific competitor/data, imply urgency, be under 200 chars ideally.

**E) Add chain-of-thought reasoning field** (Prompt Engineering book)
New field in schema: `reasoning: z.string()` — model fills first, not shown to user. Scratchpad for better analysis.

### Error Handling (already built):
- Opus JSON invalid → retry 1x with "Fix the JSON"
- Retry fails → save raw response, mark as "failed"
- Serper fails → skip competitor analysis
- Competitor fetch fails (403, timeout) → skip that competitor
- Robust JSON parser: handles markdown fences, trailing commas, unescaped newlines, truncated JSON

### Costs:
- Opus diagnosis: ~4K input + ~2K output = ~$0.07
- Opus brief: ~3K input + ~1K output = ~$0.05
- Serper: $0.001 per query
- Total: ~$0.12 per complete diagnosis

## Engine Execution

### Cron (daily):
| Cron | Schedule | What it does |
|------|----------|-------------|
| sync-gsc | 3AM UTC | Pull GSC data (paid=daily, free=Sunday only) |
| run-engine | 4AM UTC | Decay scoring + classification. Skip if engine_last_run_at = today. |
| batch-alert | 5AM UTC | Flag new critical posts (alert only) |
| measure-results | 6AM Sunday | Measure refresh results (28+ days) |
| send-digests | 9AM Monday | Weekly email digest (paid only) |

### Immediate (on import complete):
```
Import completes → runEngineForSite(siteId) → maybeTriggerAutoDiagnosis(siteId, userId)
```
Same engine logic as cron, but for one site. Sets engine_last_run_at to prevent duplicate cron run.

### Auto-diagnosis (server-side, background):
- State machine: pending → running → completed / failed / skipped
- Picks highest-decay page (or best demo candidate)
- 3-minute timeout
- Does NOT count against monthly limit
- Email notification when complete

## Result Tracking
```
TRIGGER: User clicks "I've refreshed this post" + confetti
SNAPSHOT: before_clicks_28d, before_impressions, before_ctr, before_position
STATUS: "pending" → "measuring" (28 days) → result

CALCULATION (28 days later):
after = current metrics
clicks_delta_pct = (after - before) / before × 100

CLASSIFICATION:
> +10% = "success"
0% to +10% = "partial"
~0% = "no_change"
< -5% = "declined"
```
