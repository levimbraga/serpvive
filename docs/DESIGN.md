# DESIGN & UI — SerpVive
## Updated: March 22, 2026

## Aesthetic Direction
Inspirado no Surfer SEO. "Raio-X do blog" — clínico mas acessível. Data-driven, premium.

### Do Surfer copiamos:
- Sidebar dark estreita com ícones (60px collapsed)
- Ring gauge circular pro score
- Roxo como accent APENAS pra AI features
- Cards brancos em fundo levemente cinza
- Tabelas clean com hover highlight
- Tipografia MASSIVA no hero (56-72px)
- Alternância dark → light → dark (landing page)
- Social proof proeminente
- Screenshots reais do produto (não mockups)
- Bento grid pra features secundárias

### NÃO queremos:
- Admin template genérico
- AI slop (Inter, purple gradients everywhere)
- Gamificação infantil (mascotes, estrelas, neon)
- Over-design (gradientes em tudo, sombras demais)
- "Label: Value" format (per Refactoring UI: labels are a last resort)
- Color-only indicators (per Norman: don't rely on color alone)

## Design Principles (from 29 books)
1. **Data-first hierarchy** (Refactoring UI): Numbers big + bold, labels small + muted. "72" in 56px, "/100" in 16px. Never "Health Score: 72/100" same size.
2. **Scan, don't read** (Krug): Users scan dashboards in 2 seconds. Most important element = most prominent.
3. **Color + icon + text** (Norman): Every status indicator has 3 redundant signals for accessibility.
4. **Spacing between > spacing within** (Refactoring UI): Groups separated by more whitespace than items within groups.
5. **Borders are last resort** (Refactoring UI): Prefer background color + spacing to separate elements.
6. **Feedback on every action** (Norman): Click = immediate visual response. No gulf of evaluation.
7. **Progressive disclosure** (Krug): Summary visible, details behind a click/expand.
8. **Empty states are opportunities** (Refactoring UI): Never "No data." Always explanation + CTA.

## Color Palette

### App (sidebar dark, content light)
```css
/* BACKGROUNDS */
--bg-page:          #F5F7FA;
--bg-card:          #FFFFFF;
--bg-card-hover:    #F8FAFC;
--bg-sidebar:       #0F172A;
--bg-sidebar-hover: #1E293B;

/* TEXT */
--text-primary:     #111827;
--text-secondary:   #4B5563;
--text-muted:       #9CA3AF;
--text-on-dark:     #E2E8F0;

/* BORDERS */
--border-light:     #E5E7EB;
--border-default:   #D1D5DB;

/* STATUS (always paired with icon + text label) */
--status-healthy:     #16A34A;  --status-healthy-bg:  #F0FDF4;
--status-warning:     #D97706;  --status-warning-bg:  #FFFBEB;
--status-critical:    #DC2626;  --status-critical-bg: #FEF2F2;
--status-dead:        #6B7280;  --status-dead-bg:     #F3F4F6;
--status-new:         #2563EB;  --status-new-bg:      #EFF6FF;

/* BRAND */
--brand:            #0D9488;
--brand-hover:      #0F766E;

/* AI ACCENT */
--ai:               #7C3AED;
--ai-hover:         #6D28D9;
--ai-light:         #F5F3FF;

/* SHADOWS (5 levels per Refactoring UI) */
--shadow-xs:    0 1px 2px rgba(0,0,0,0.04);
--shadow-sm:    0 1px 2px rgba(0,0,0,0.05);
--shadow-md:    0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08);
--shadow-lg:    0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:    0 20px 25px rgba(0,0,0,0.05), 0 10px 10px rgba(0,0,0,0.04);
```

### Landing Page (dark theme)
```css
--bg-dark: #0A0E1A;
--bg-mid:  #0F1424;
--bg-card: #161B2E;
--border:  #1E293B;
```

## Typography
```css
--font-sans: 'DM Sans', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
Hero headline:    56-72px, weight 700, letter-spacing -2px
Health Score:     48-64px, weight 700 (THE biggest element on dashboard)
KPI numbers:      32px, weight 700
Page titles:      24-28px, weight 600
Section titles:   18-20px, weight 600
Body:             14-15px, weight 400
Labels/meta:      12-13px, weight 500, text-muted, uppercase tracking-wide
Badges:           11-12px, weight 600
```

## Status Badges (5 variants, always color + icon + text)
```
Healthy:  [✓ Healthy]   green bg, CheckCircle icon
Warning:  [↓ Warning]   amber bg, TrendingDown icon
Critical: [🔺 Critical] red bg, AlertTriangle icon
Dead:     [✕ Dead]      gray bg, XCircle icon
New:      [✦ New]       blue bg, Sparkles icon
```
All 3 signals (color, icon, text) present always. Works for colorblind users via icon + text alone.

## Layout
```
APP:
┌──────────┐ ┌────────────────────────────────────┐
│ SIDEBAR  │ │  HEADER (48px)                     │
│  ~60px   │ ├────────────────────────────────────┤
│  Dark    │ │  CONTENT AREA                      │
│  Icons   │ │  Light bg, max-width 1200px center  │
│  Tooltip │ │  Data-first hierarchy               │
│  on hover│ │                                     │
│  5 items │ │                                     │
│  Usage   │ │                                     │
│  meter   │ │                                     │
└──────────┘ └────────────────────────────────────┘
```

## Landing Page Wireframe (StoryBrand framework)
```
1. HERO (dark bg)
   H1: "Your blog is losing traffic right now." (56-72px)
   H2: "SerpVive finds the dying posts..." (20px, muted)
   Badge: "Powered by Opus 4.6 · Read-only · Cancel anytime"
   CTA: "Revive your rankings → Start free trial" (teal)
   Secondary: "See how it works ↓"
   + Real dashboard screenshot (shadow-xl)

2. SOCIAL PROOF BAR (dark→mid transition)
   "X diagnoses completed" or "Trusted by X SEO pros"

3. STAKES (light bg)
   "Every day you don't monitor, traffic slips away."
   3 stat cards (90.63%, 6-12 months, competitors)

4. 5-STEP LOOP (dark bg)
   "The complete content rescue loop"
   5 steps horizontal (teal for auto, purple for AI)

5. SCREENSHOT (light bg)
   "This is what 20 seconds of AI analysis looks like."
   Real diagnosis screenshot + callouts
   [See a real analysis →] link to best /demo/

6. 3 STEPS PLAN (mid bg)
   "Get your first diagnosis in 5 minutes"
   Connect GSC → See Health Score → Get AI diagnosis

7. PRICING (dark bg)
   Anchor: "SEO consultants charge $500-3,000/month"
   5 cards: Free / Starter / Pro (highlighted) / Agency / Enterprise
   Annual toggle: Save 17%
   "All plans include 7-day trial. Cancel anytime."

8. TESTIMONIALS (light bg)
   Quotes with photo + name + role + specific result

9. FAQ (dark bg)
   6-8 questions (Big 5 + objections)

10. FINAL CTA (dark bg)
    "Your blog lost traffic while you read this page."
    CTA: "Start your 7-day free trial →"

11. FOOTER
    Product / Resources / Company / Social
```

## Core Components

### Health Score Ring
- SVG circle, stroke-dasharray animated (1.2s easeOutCubic)
- Color: 80-100 green, 60-79 amber, 40-59 red, 0-39 gray
- Number: 48-64px bold centered (THE biggest element)
- Delta badge: "↓3 vs last week" in 12px, colored

### Dashboard Stats (data-first)
```
72          127 pages    98 healthy   5 critical   3/10
/100        (12px muted) (12px muted) (12px RED)   diagnoses
(56px bold)  (32px bold)  (24px bold)  (24px bold)  (20px bold)
```

### Decay List Row
```
[StatusBadge]  Title or URL (truncated)           -47%        -234/mo    →
               /blog/seo-guide-2025               decay       clicks lost
               (12px mono muted)                  (bold RED)  (medium RED)
```
Impact (clicks lost) is prominent, not URL. Each row obviously clickable (hover bg change + cursor pointer + chevron).

### Diagnosis Card
- Purple border-2 (AI accent)
- Summary always visible (16-18px, high contrast)
- Strengths: compact list with green checkmarks
- Topic coverage: progress bar with percentage
- Causes: nested cards with colored left border (4px, by severity)
- Evidence: collapsible ("Show evidence" toggle)
- SERP snapshot: collapsed by default
- Comparison badge vs previous diagnosis

### Refresh Brief (to-do list, not report)
- Real checkboxes (large, not tiny defaults)
- Priority badges (Urgent red, Important amber, Nice-to-have green)
- Effort estimate per action in minutes
- Micro-drafts in monospace font (JetBrains Mono) on green bg (signals "copy this")
- Copy button on each micro-draft
- Progress: "3/5 actions completed"
- "I've refreshed this post" button: full-width green, triggers confetti

### Result Card
- Before/after: 4-column grid with colored deltas
- Confetti if positive (canvas-confetti, 3KB, brand colors)

## Icons
Lucide React, strokeWidth 1.5

## Animations
- Skeleton shimmer for loading
- Health Score ring: fill animation 1.2s
- CountUp on numbers
- Sections fade-in on scroll (IntersectionObserver)
- Card hover: translateY(-1px) + shadow increase
- Confetti on refresh marked
- Toast: sonner (slide in, 4s auto-dismiss)
- Diagnosis loading: 4 progressive steps with timer

## shadcn/ui Components
Button, Card, Table, Badge, Skeleton, Toast (sonner), Tooltip, Dialog, DropdownMenu, Sheet, Separator, Progress, Input, Label, Checkbox, Accordion, Select, Avatar

## Responsive
- Mobile (<640px): sidebar → sheet, tables → cards, buttons full-width
- Tablet (640-1024px): sidebar collapsible
- Desktop (>1024px): sidebar + content
- Wide (>1440px): content max-width 1200px centered

## Gamification (professional, NOT childish)
- Health Score animation = progress feeling
- Confetti on refresh = celebration
- Usage meter = awareness of scarcity
- Results with status icons = reward
- Zero mascots, zero stars, zero neon
