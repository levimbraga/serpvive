# DESIGN & UI — SerpVive

## Aesthetic Direction
Inspirado no Surfer SEO (referência principal, screenshots analisados).
"Raio-X do blog" — clínico mas acessível. Data-driven, premium, dark/light alternation.

### Do Surfer copiamos:
- Sidebar dark estreita com ícones (60px collapsed)
- Ring gauge circular pro score (Content Score → Health Score)
- Roxo como accent APENAS pra AI features
- Cards brancos em fundo levemente cinza
- Tabelas clean com hover highlight
- Tipografia MASSIVA no hero (60-72px)
- Alternância dark → light → dark entre seções (landing page)
- Social proof proeminente (logo wall + número)
- Screenshots reais do produto como centro das seções de features
- Bento grid pra features secundárias
- Footer dark com 5 colunas de links
- Mega menu organizado por categorias

### NÃO queremos:
- Admin template genérico
- AI slop (Inter, purple gradients everywhere)
- Gamificação infantil (mascotes, estrelas, neon)
- Over-design (gradientes em tudo, sombras demais)

## Color Palette

### App (sidebar dark, content light)
```css
/* BACKGROUNDS */
--bg-page:          #F5F7FA;   /* fundo content area */
--bg-card:          #FFFFFF;   /* cards */
--bg-card-hover:    #F8FAFC;
--bg-sidebar:       #0F172A;   /* sidebar dark */
--bg-sidebar-hover: #1E293B;

/* TEXT */
--text-primary:     #111827;
--text-secondary:   #4B5563;
--text-muted:       #9CA3AF;
--text-on-dark:     #E2E8F0;

/* BORDERS */
--border-light:     #E5E7EB;
--border-default:   #D1D5DB;

/* STATUS */
--status-healthy:     #16A34A;  --status-healthy-bg:  #F0FDF4;
--status-warning:     #D97706;  --status-warning-bg:  #FFFBEB;
--status-critical:    #DC2626;  --status-critical-bg: #FEF2F2;
--status-dead:        #6B7280;  --status-dead-bg:     #F3F4F6;
--status-new:         #2563EB;  --status-new-bg:      #EFF6FF;

/* BRAND */
--brand:            #0D9488;   /* teal */
--brand-hover:      #0F766E;

/* AI ACCENT */
--ai:               #7C3AED;   /* purple — ONLY for AI features */
--ai-hover:         #6D28D9;
--ai-light:         #F5F3FF;

/* SHADOWS */
--shadow-sm:    0 1px 2px rgba(0,0,0,0.05);
--shadow-md:    0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08);
```

### Landing Page (dark theme like Surfer)
```css
--bg-dark: #0A0E1A;
--bg-mid:  #0F1424;
--bg-card: #161B2E;
--border:  #1E293B;
```

## Typography
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

--font-sans: 'DM Sans', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
Hero headline:  56-72px, weight 700, letter-spacing -2px
KPI numbers:    48px, weight 700
Page titles:    24-28px, weight 600
Section titles: 18-20px, weight 600
Body:           14-15px, weight 400
Labels/meta:    12-13px, weight 500
Badges:         11-12px, weight 600
```

## Layout
```
APP:
┌──────────┐ ┌────────────────────────────────────┐
│ SIDEBAR  │ │  HEADER (48px)                     │
│  ~60px   │ ├────────────────────────────────────┤
│  Dark    │ │  CONTENT AREA                      │
│  Icons   │ │  Light bg, max-width 1200px center  │
│          │ │  Bento grid layout                  │
│  5 items │ │                                     │
│  Usage   │ │                                     │
│  meter   │ │                                     │
└──────────┘ └────────────────────────────────────┘

LANDING PAGE:
Full width, dark bg, alternating dark/light sections (like Surfer)
```

## Core Components

### Health Score Ring
- SVG circle, stroke-dasharray animated (1.2s easeOutCubic)
- Color changes: 80-100 green, 60-79 amber, 40-59 red, 0-39 gray
- Number 48px bold centered, delta badge (+3↑ or -5↓)

### Status Badges (5 variants)
- Pill shape, bg: status-bg, text: status color

### Page Row (decay list)
- Card with border, shadow-sm → shadow-md hover
- Status dot + URL mono + decay % + "Diagnose" button (purple)

### Diagnosis Card
- Purple border (AI accent), summary always visible
- Causes as nested cards with colored left border (4px)
- Progressive disclosure: "View details ▼"

### Action Checklist (Refresh Brief with Micro-Drafts)
- Real checkboxes, priority visual (🔴🟡🟢)
- Each action shows micro-draft content (title suggestions, topics, data)
- "Already updated" button: large, green, sticky on mobile → confetti

### Result Card
- Before/after side by side, colored delta
- Confetti if positive (canvas-confetti, 3KB)

## Icons
Lucide React, strokeWidth 1.5

## Animations
- Skeleton shimmer for loading
- Health Score ring: fill animation 1.2s
- CountUp on numbers
- Sections fade-in on scroll (IntersectionObserver)
- Card hover: translateY(-1px) + shadow
- Confetti on refresh marked
- Toast: sonner (slide in, 4s auto-dismiss)

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
- Usage meter = awareness
- Results with emoji (✅🎉) = reward
- Zero mascots, zero stars, zero neon
