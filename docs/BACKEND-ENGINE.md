# BACKEND ENGINE — SerpVive

## 7 Diferenciais Técnicos (math pura + AI com micro-drafts)

---

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

## 2. Decay Velocity (velocidade de queda)
```
FÓRMULA: velocity_7d = (clicks_semana_passada - clicks_esta_semana) / clicks_semana_passada × 100

velocity_28d = mesma fórmula mas comparando últimos 28d vs 28d anteriores

INTERPRETAÇÃO:
- velocity < -5% = crescendo (bom)
- velocity -5% a 5% = estável
- velocity 5% a 15% = caindo devagar
- velocity > 15% = caindo rápido ⚠️
```

## 3. Seasonal Detection (filtro de falso positivo)
```
LÓGICA: Compara performance do MESMO PERÍODO do ano passado

seasonal_ratio = clicks_este_periodo / clicks_mesmo_periodo_ano_passado

INTERPRETAÇÃO:
- ratio entre 0.80 e 1.20 (±20%) = variação sazonal NORMAL
  → Marcar is_seasonal = true
  → NÃO classificar como decay
- ratio < 0.80 = queda REAL (não é sazonal)
- Sem dados do ano passado → is_seasonal = false (assume não-sazonal)

TOLERANCE: ±20% (configurable via DECAY_THRESHOLDS.seasonal_tolerance)
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

THRESHOLDS (constants.ts):
healthy_max: 15
warning_max: 30
critical_min: 30
dead_min: 70
new_page_months: 3
```

## 5. Health Score (nota geral do blog)
```
FÓRMULA: Média ponderada de todas as páginas

pesos:
- healthy = 100 pontos
- warning = 60 pontos
- critical = 20 pontos
- dead = 0 pontos
- new = excluído do cálculo

health_score = SUM(peso × count) / SUM(count_excluindo_new)

Resultado: 0-100, arredondado pra inteiro
Atualizado: diariamente pelo cron run-engine
```

## 6. Cannibalization Detection
```
LÓGICA: 2+ páginas ranqueando pra mesma top query

PROCESSO:
1. Pra cada query, buscar quantas páginas do site aparecem
2. Se 2+ páginas → flag de cannibalização
3. Mostrar no diagnóstico como causa possível

DADOS: tabela page_queries (query × page × date)
```

## 7. AI Diagnosis Pipeline (~20 segundos, ~$0.12)

### Fluxo:
```
1. Busca keyword principal da página (top query por clicks no GSC)
2. Serper.dev busca SERP ($0.001 por query)
3. HTTP fetch top 3 competidores (Cheerio extrai: title, headings, texto, datas, tabelas)
4. HTTP fetch post do usuário (mesmo processo)
5. Monta prompt com: dados GSC + SERP snapshot + conteúdo competidores + conteúdo user
6. Opus 4.6 → Diagnosis JSON (causas, evidências, severidade)
7. Segunda chamada Opus → Refresh Brief JSON (ações priorizadas, esforço)
8. Salva na tabela diagnoses (JSONB)
```

### Prompt do Sistema (Diagnosis):
```
You are a world-class SEO analyst specializing in content decay diagnosis.

CONTEXT:
- Page: {url}
- Primary keyword: {keyword}
- Current performance: {clicks_28d} clicks, position #{position}, CTR {ctr}%
- Peak performance: {peak_clicks} clicks in {peak_month}
- Decay: {decay_score}% decline

SERP ANALYSIS:
{serp_results_json}

COMPETITOR CONTENT (Top 3):
{competitor_1_content}
{competitor_2_content}
{competitor_3_content}

USER'S CONTENT:
{user_content}

GSC QUERY DATA:
{top_queries_with_positions}

INSTRUCTIONS:
Analyze WHY this page is losing traffic. Be EXTREMELY SPECIFIC.

RULES:
- Never say "content is outdated." Say "Monday.com price listed as $8/seat is outdated, current price is $12/seat since March 2025."
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Compare headings, topics, dates, facts between user and competitors.
- Identify: new competitors, outdated info, intent shifts, missing topics, format gaps, technical issues.
- Maximum 5 causes, minimum 1.

Return ONLY valid JSON matching this schema:
{diagnosis_schema}
```

### Prompt do Sistema (Refresh Brief + Micro-Drafts):
```
Based on the diagnosis below, generate a specific, actionable refresh brief
with micro-drafts that help the user write without additional research.

DIAGNOSIS:
{diagnosis_json}

PAGE URL: {url}
CURRENT CONTENT SUMMARY: {user_content_summary}
COMPETITOR CONTENT (Top 3): {competitor_summaries}

INSTRUCTIONS:
Create a prioritized list of specific actions to fix this page.
Each action MUST include a micro-draft to help the user execute immediately.

RULES:
- Each action must be SPECIFIC. Not "update content" but "Change title from 'X' to 'Y'"
- Include effort estimate in minutes for each action
- Prioritize: 🔴 Urgent (directly causing decay) / 🟡 Important (competitive gap) / 🟢 Nice-to-have
- Maximum 8 actions, minimum 2
- Include word count estimates for new sections
- Reference specific competitors when relevant

MICRO-DRAFT RULES (the key differentiator):
- For TITLE changes: provide 2-3 specific title suggestions ready to copy
- For NEW SECTIONS: list 3-5 specific topics/subtopics to cover, referencing what competitors include. Example: "Cover: (1) AI task automation — Competitor #1 mentions Asana AI, (2) AI writing features — Competitor #2 highlights Notion AI, (3) AI resource allocation — none cover this, opportunity to differentiate"
- For OUTDATED FACTS: provide the correct/current data. Example: "Monday.com: $8/seat → $12/seat (changed March 2025)"
- For FORMAT changes (tables, lists): suggest specific columns/rows. Example: "Suggested columns: Tool name, Price, Free tier, AI features, Integrations, G2 rating"
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

Return ONLY valid JSON matching this schema:
{brief_schema}
```

### Schemas Zod (validação de output):
```typescript
const DiagnosisSchema = z.object({
  summary: z.string().max(300),
  causes: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    evidence: z.string(),
    category: z.enum([
      'outdated_content', 'new_competitors', 'intent_shift',
      'missing_topic', 'format_gap', 'technical_issue',
      'cannibalization', 'thin_content'
    ]),
  })).min(1).max(5),
  serp_analysis: z.object({
    top_competitors: z.array(z.object({
      url: z.string(),
      title: z.string(),
      strengths: z.array(z.string()),
    })),
    intent_type: z.enum(['informational', 'commercial', 'transactional', 'navigational']),
    content_format_trend: z.string(),
  }),
});

const RefreshBriefSchema = z.object({
  total_effort_hours: z.number(),
  actions: z.array(z.object({
    priority: z.enum(['urgent', 'important', 'nice_to_have']),
    title: z.string(),
    description: z.string(),
    effort_minutes: z.number(),
    category: z.enum(['title', 'content', 'structure', 'technical', 'meta']),
    micro_draft: z.object({
      type: z.enum(['title_suggestions', 'topics_to_cover', 'corrected_data', 'format_suggestion', 'meta_text', 'general_guidance']),
      suggestions: z.array(z.string()).min(1).max(5),
      competitor_references: z.array(z.string()).optional(),
    }),
  })).min(2).max(8),
});
```

### Error Handling:
- Se Opus retorna JSON inválido → retry 1x com "Fix the JSON" appended
- Se retry falha → salvar raw response, marcar diagnóstico como "failed"
- Se Serper falha → usar cached SERP se disponível, senão skip competitor analysis
- Se fetch de competidor falha (403, timeout) → pular aquele competidor

### Custos:
- Opus 4.6: ~4K input + ~2K output tokens = ~$0.07 por diagnóstico
- Opus 4.6 (brief): ~3K input + ~1K output = ~$0.05 por brief
- Serper: $0.001 por query
- Total: ~$0.12 por diagnóstico completo

## 5 Cron Jobs (vercel.json)

| Cron | Horário | O que faz |
|------|---------|-----------|
| sync-gsc | 3AM UTC diário | Puxa dados GSC pra todos os sites ativos |
| run-engine | 4AM UTC diário | Roda decay scoring, velocity, seasonal, classifier, health score |
| batch-alert | 5AM UTC diário | Identifica posts NOVOS em critical e flag pra user (alerta, SEM diagnóstico automático). Diagnóstico é sempre manual e conta no limite. |
| measure-results | 6AM UTC domingo | Mede resultados de refreshes com 28+ dias |
| send-digests | 9AM UTC segunda | Envia email digest semanal |

## Result Tracking
```
TRIGGER: User clica "Já atualizei este post"
SNAPSHOT: Salva before_clicks_28d, before_impressions, before_ctr, before_position
STATUS: "pending" → "measuring" (após 28 dias) → resultado

CÁLCULO (28 dias depois):
after = métricas atuais da página
clicks_delta = after_clicks - before_clicks
clicks_delta_pct = (delta / before) × 100

CLASSIFICAÇÃO:
> +10% = "success" ✅
0% a +10% = "partial" 🟡
~0% = "no_change" ➖
< -5% = "declined" 🔴
```
