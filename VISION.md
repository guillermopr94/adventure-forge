# 🎯 Adventure Forge - Product Vision & Roadmap

> **North Star:** Una plataforma de aventuras narrativas impulsada por IA donde los usuarios pagan tokens para jugar, crean géneros personalizados, y la comunidad hace crecer el contenido orgánicamente.

---

## 📋 Current Phase: MVP Foundation

**Status:** 🟡 In Progress  
**Target:** Q1 2026  
**Focus:** Mobile-First, Stability, Token Economy

---

## 🎯 Strategic Objectives (Priority Order)

### 1. 🔧 STABILITY FIRST (P0 - Critical)
> El juego debe funcionar de manera estable con una capa gratuita antes de monetizar.

**Acceptance Criteria:**
- [ ] Image generation funciona 99%+ del tiempo (fallback chain robusto)
- [ ] Text generation nunca falla (fallback a múltiples providers)
- [ ] Audio/TTS funciona consistentemente
- [ ] No crashes en sesiones de juego de 30+ minutos
- [ ] Cold starts < 5 segundos
- [x] **Prompts endurecidos**: Las IAs reciben instrucciones claras y estrictas para devolver JSON puro
- [x] **Parseo robusto**: Limpieza de markdown, extracción regex fallback, normalización de estructuras

**Current Issues:**
- Image generation inestable (Pollinations rate limits)
- ~~No fallback robusto~~ ✅ HuggingFace añadido
- ~~Parseo frágil de respuestas AI~~ ✅ Parser endurecido + markdown cleanup

---

### 2. 📱 MOBILE-FIRST UX (P0 - Critical)
> La experiencia principal será en móvil. Desktop es secundario.

**Acceptance Criteria:**
- [ ] UI 100% responsive y optimizada para touch
- [ ] Imágenes en formato portrait (9:16) para llenar pantalla móvil
- [ ] Gestos intuitivos (swipe para opciones, tap para continuar)
- [ ] Loading states cinematográficos (no spinners genéricos)
- [ ] Offline-capable para continuar partidas guardadas
- [ ] PWA installable con icono en home screen

**UX Goals:**
- [ ] Typewriter effect para narrativa inmersiva
- [ ] Transiciones suaves entre escenas
- [ ] Feedback háptico en acciones importantes
- [ ] Dark mode por defecto (gaming aesthetic)

---

### 3. 🎬 CINEMATIC EXPERIENCE (P1 - High)
> El juego debe sentirse como una experiencia premium, no un chatbot.

**Acceptance Criteria:**
- [ ] Imágenes generadas de alta calidad (consistencia visual por sesión)
- [ ] Música ambiental por género (loop sutil, no intrusivo)
- [ ] Efectos de sonido en acciones clave
- [ ] Animaciones de entrada/salida para escenas
- [ ] Parallax/depth effects en imágenes de fondo
- [ ] Narración por voz opcional (TTS de calidad)

**Visual Style:**
- Fantasy: Ilustraciones épicas estilo concept art
- Sci-Fi: Neon, cyberpunk, high-tech interfaces
- Horror: Atmosférico, sombras, paleta oscura
- Romance: Soft lighting, warm tones, character focus

---

### 4. 💰 TOKEN ECONOMY (P1 - High)
> Modelo de negocio sostenible basado en tokens.

**Core Mechanics:**
```
1 Token = 1 Turno de juego (aprox.)
- Generación de texto: 0.5 tokens
- Generación de imagen: 1 token
- Generación de audio: 0.5 tokens
- Turno completo (text + image + audio): 2 tokens
```

**Token Packages:**
| Package | Tokens | Price | Per Token |
|---------|--------|-------|-----------|
| Starter | 50 | €2.99 | €0.06 |
| Explorer | 150 | €7.99 | €0.05 |
| Hero | 400 | €17.99 | €0.045 |
| Legend | 1000 | €39.99 | €0.04 |

**Free Tier:**
- 10 tokens/día para usuarios registrados
- 5 tokens para trial sin registro
- Tokens bonus por referidos (+20 por invite)
- Tokens bonus por crear géneros populares

**Acceptance Criteria:**
- [ ] Sistema de autenticación robusto (Google OAuth funcionando)
- [ ] Balance de tokens en perfil de usuario
- [ ] Consumo de tokens por acción (trackeable)
- [ ] Integración con pasarela de pago (Stripe)
- [ ] Historial de transacciones
- [ ] Notificación cuando tokens bajos
- [ ] Bloqueo graceful cuando tokens = 0 (upsell, no frustración)

---

### 5. 🎨 CUSTOM GENRES (P2 - Medium)
> Los usuarios premium pueden crear y compartir géneros.

**Phase 1: Curated Genres (MVP)**
- Fantasy, Sci-Fi, Horror, Romance, Superhero, Mystery
- Cada género tiene: prompt template, image style, voice style, music

**Phase 2: User-Created Genres (Post-MVP)**
- Usuarios premium pueden crear géneros personalizados
- Editor visual de género (nombre, descripción, style hints)
- Géneros privados vs públicos
- Sistema de rating/likes para géneros públicos
- Top géneros de la comunidad en homepage

**Phase 3: Organic Growth (Long-term)**
- Géneros populares se promueven automáticamente
- Creadores de géneros ganan tokens cuando otros juegan
- Marketplace de géneros (compra/venta)
- Colaboración: múltiples autores en un género

**Acceptance Criteria (Phase 1):**
- [ ] Mínimo 6 géneros jugables con estilos distintos
- [ ] Cada género tiene imagen de portada única
- [ ] Preview de género antes de empezar partida
- [ ] Stats de popularidad por género

---

## 📊 Technical Epics

### EPIC 1: Resilient AI Infrastructure
**Goal:** Zero-downtime AI generation with intelligent fallbacks

| ID | Task | Priority | Status |
|----|------|----------|--------|
| AI-001 | HuggingFace fallback for images | P0 | ✅ Done |
| AI-002 | Quota monitoring dashboard | P1 | ✅ Done (PR #14) |
| AI-003 | Circuit breaker pattern | P1 | ⏳ Pending |
| AI-004 | Provider health checks | P2 | ⏳ Pending |
| AI-005 | Cost tracking per provider | P2 | ⏳ Pending |
| AI-006 | Auto-switch to cheapest healthy provider | P3 | ⏳ Pending |
| AI-007 | Hardened prompts & parsing for AI responses | P0 | ✅ Done |
| AI-008 | Markdown artifact cleanup in narratives | P0 | ✅ Done |
| AI-009 | Regex fallback extraction for malformed JSON | P1 | ✅ Done |

### EPIC 2: Mobile-First UI Overhaul
**Goal:** PWA-quality mobile experience

| ID | Task | Priority | Status |
|----|------|----------|--------|
| UI-001 | Portrait image generation (9:16) | P0 | ✅ Done |
| UI-002 | Responsive game layout | P0 | ⏳ In Review |
| UI-003 | Touch-optimized controls | P0 | ⏳ Pending |
| UI-004 | PWA manifest & service worker | P1 | ⏳ Pending |
| UI-005 | Offline game state persistence | P1 | ⏳ Pending |
| UI-006 | Loading skeleton animations | P1 | ⏳ Pending |
| UI-007 | Haptic feedback integration | P2 | ⏳ Pending |

### EPIC 3: Cinematic Polish
**Goal:** Premium gaming feel

| ID | Task | Priority | Status |
|----|------|----------|--------|
| CIN-001 | Typewriter text effect | P1 | ✅ Done (PR #25) |
| CIN-002 | Scene transition animations | P1 | ⏳ Pending |
| CIN-003 | Background music system | P2 | ⏳ Pending |
| CIN-004 | Sound effects library | P2 | ⏳ Pending |
| CIN-005 | Image parallax effect | P3 | ⏳ Pending |
| CIN-006 | Character portrait system | P3 | ⏳ Pending |

### EPIC 4: Token Economy
**Goal:** Sustainable monetization

| ID | Task | Priority | Status |
|----|------|----------|--------|
| TOK-001 | User token balance in DB | P0 | ⏳ Pending |
| TOK-002 | Token consumption per action | P0 | ⏳ Pending |
| TOK-003 | Free daily token allocation | P1 | ⏳ Pending |
| TOK-004 | Token purchase UI | P1 | ⏳ Pending |
| TOK-005 | Stripe integration | P1 | ⏳ Pending |
| TOK-006 | Transaction history | P2 | ⏳ Pending |
| TOK-007 | Low balance notifications | P2 | ⏳ Pending |
| TOK-008 | Referral token bonus | P3 | ⏳ Pending |

### EPIC 5: Custom Genres
**Goal:** User-generated content flywheel

| ID | Task | Priority | Status |
|----|------|----------|--------|
| GEN-001 | Genre data model refactor | P1 | ⏳ Pending |
| GEN-002 | Genre selection UI redesign | P1 | ⏳ Pending |
| GEN-003 | Genre preview cards | P2 | ⏳ Pending |
| GEN-004 | Genre popularity tracking | P2 | ⏳ Pending |
| GEN-005 | User genre editor (premium) | P3 | ⏳ Pending |
| GEN-006 | Genre sharing/publishing | P3 | ⏳ Pending |
| GEN-007 | Genre marketplace | P4 | ⏳ Pending |

---

## 🏃 Sprint Planning (Current)

### Sprint 1: Stability & Mobile (Current)
**Duration:** 2 weeks  
**Theme:** "Rock-solid foundation"

**Goals:**
1. ✅ Image generation fallback chain complete
2. ⏳ Mobile UI responsive overhaul
3. ⏳ Game session stability (no context loss)
4. ⏳ Error handling & user feedback

**Tickets:**
- [x] AI-001: HuggingFace fallback
- [ ] #9: Game history context loss (FE)
- [ ] #17: AuthGuard on /game/stream (BE)
- [ ] UI-002: Responsive layout
- [ ] UI-003: Touch controls

### Sprint 2: Token Foundation
**Duration:** 2 weeks  
**Theme:** "Pay to play"

**Goals:**
1. Token balance system in backend
2. Token consumption tracking
3. Basic purchase flow (no Stripe yet)
4. UI for token display

### Sprint 3: Cinematic Polish
**Duration:** 2 weeks  
**Theme:** "Premium feel"

**Goals:**
1. Scene transitions
2. Background music
3. Loading animations
4. Genre preview cards

---

## 📐 Architecture Principles

### For Agents & Orchestration:

1. **Stability Over Features**
   - No new features if existing ones are broken
   - Every PR must include error handling
   - Fallbacks are mandatory for external dependencies

2. **Mobile-First Always**
   - Test on mobile viewport before desktop
   - Touch targets minimum 44x44px
   - Performance budget: LCP < 2.5s on 3G

3. **Token-Aware Design**
   - Every AI call must be trackeable for billing
   - User must always know their token balance
   - Graceful degradation when tokens depleted

4. **Quality Standards**
   - TypeScript strict mode
   - No `any` types without justification
   - Unit tests for business logic
   - E2E tests for critical flows

5. **Technical Debt Reduction**
   - Refactor before adding to messy code
   - Document architectural decisions
   - Remove dead code actively

---

## 📈 Success Metrics

### MVP Launch Criteria:
- [ ] 99%+ uptime for 7 consecutive days
- [ ] Average session length > 10 minutes
- [ ] Mobile Lighthouse score > 80
- [ ] < 5% error rate on AI generations
- [ ] Token system functional end-to-end
- [ ] At least 3 genres fully polished

### Post-Launch KPIs:
- Daily Active Users (DAU)
- Average Revenue Per User (ARPU)
- Token purchase conversion rate
- Session length by genre
- Genre creation rate (premium users)

---

## 🔄 Agent Orchestration Guidelines

### When Creating Tasks:
1. Check this VISION.md for current priorities
2. Map task to an EPIC
3. Assign correct priority (P0-P4)
4. Include acceptance criteria
5. Tag with relevant labels

### When Analyzing Code:
1. Does it align with current sprint goals?
2. Does it improve stability?
3. Is it mobile-optimized?
4. Does it consider token economy?
5. Does it reduce technical debt?

### When Proposing Improvements:
1. Reference which Objective it serves
2. Estimate impact on Success Metrics
3. Consider mobile-first implications
4. Check for free-tier compatibility

---

## 📅 Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Stable Image Gen | Feb 2026 | 🟡 In Progress |
| Mobile UI Complete | Feb 2026 | ⏳ Pending |
| Token System MVP | Mar 2026 | ⏳ Pending |
| Stripe Integration | Mar 2026 | ⏳ Pending |
| Public Beta | Apr 2026 | ⏳ Pending |
| Custom Genres v1 | May 2026 | ⏳ Pending |
| Genre Marketplace | Q3 2026 | ⏳ Pending |

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-02-06 | Initial VISION.md created |
| 2026-02-06 | AI-001 (HuggingFace fallback) marked done |
| 2026-02-04 | CIN-001 (Typewriter effect) marked done |

---

> **This document is the single source of truth for Adventure Forge priorities.**  
> All agents, sprints, and decisions should reference this vision.
