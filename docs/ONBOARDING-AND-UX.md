# ONBOARDING & UX — SerpVive

## Princípios
1. Se precisa de tutorial pra entender, o design falhou
2. Cada tela tem UMA ação principal
3. Jargão técnico SEMPRE tem tradução humana ao lado
4. Zero configuração. Defaults inteligentes pra tudo
5. Fácil o suficiente pra uma criança usar

## Onboarding Flow (6 telas, <5 minutos)
```
Signup → Plano + cartão (Stripe hosted) → Conectar GSC (OAuth custom) 
→ Selecionar site → Importando (com preview parcial) → Dashboard com dados reais
```

### Tela 1: Signup
- Email/senha ou Google (Supabase Auth)
- Social proof no lado direito
- Google login NÃO pede acesso GSC (separado)

### Tela 2: Trial + Cartão
- Stripe Checkout hosted (não embed)
- Pré-selecionar Starter ($29), highlight PRO
- 7 dias grátis com cartão

### Tela 3: Conectar GSC
- Tela MAIS CRÍTICA — sem GSC, produto não funciona
- OAuth custom: scope webmasters.readonly
- Mensagens de segurança: "somente leitura", "desconecte quando quiser"
- Link "Como adicionar seu site ao GSC" pra quem não tem
- SEPARAR login Google de autorização GSC

### Tela 4: Selecionar Site
- Lista sites do GSC via API
- Recomendar domain property sobre URL prefix
- Avisar se site tem poucos dados (<3 meses)

### Tela 5: Importando
- Progress bar REAL (não fake)
- Mostrar dados parciais conforme chegam
- Polling a cada 3 segundos (GET /api/import/status)
- Preview: "127 páginas encontradas", "Possível post em decay: /seo-guide"
- Primeiro diagnóstico automático e GRATUITO do post mais crítico

### Tela 6: Dashboard (first run)
- Tour de 3 tooltips (não modal intrusivo)
- Health Score com dados REAIS
- Se diagnóstico auto terminou, mostrar badge

## Emails Pós-Onboarding
- Dia 0: "Seu blog tem Health Score de X/100"
- Dia 2: "Seu post /X está perdendo Y visitas por dia" (urgência)
- Dia 5: "Restam 2 dias do trial — use seus diagnósticos"

## UX Simplicity

### Dashboard responde 3 perguntas em 2 segundos:
1. ONDE ESTOU? → título + breadcrumb
2. O QUE ESTÁ ACONTECENDO? → Health Score + cores
3. O QUE DEVO FAZER? → botão "Diagnosticar" óbvio

### Tradução de jargão:
- Decay Score → "Queda de 47%"
- Velocity → "Caindo rápido ↓↓"
- CTR → "X% das pessoas que viram clicaram"
- Position → "Posição #8 no Google"
- Health Score → "Nota de saúde: 72/100"

### Progressive Disclosure:
- Diagnóstico: resumo 2 linhas no topo, "Ver detalhes" expande
- Ações: checkboxes com tempo estimado, parecem to-do list
- Resultado: números grandes antes/depois, confetti se sucesso

### Empty States:
- Nunca "Nenhum dado encontrado"
- Sempre explicação + CTA: "Nenhum diagnóstico ainda. Escolha um post vermelho!"

### Micro-interações:
- Skeleton shimmer pra loading
- CountUp animation nos números
- Confetti no "Já atualizei este post"
- Toast pra feedback (sonner)
- Progress indicators SEMPRE

### Sidebar: 5 itens máximo
- 📊 Dashboard (default)
- 📄 Páginas
- ⚙️ Configurações
- ❓ Ajuda
- Usage meter visual (7/10 diagnósticos)

### Regras de Copy:
- Falar como humano, não como software
- Sempre oferecer próximo passo
- Nunca mostrar IDs ou jargão de banco
- Números sempre com contexto
- Tempo sempre relativo ("há 3 semanas")
- Ações no imperativo amigável

## Funil de Métricas
```
Signup → 100%
Cartão → 70%
GSC conectado → 65%
Dashboard → 58%
Primeiro diagnóstico → 40%
Conversão pós-trial → 10-15%
```
