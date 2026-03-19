# Digital Dominion

## What This Is

A fully immersive, 3D-navigable personal portfolio website inspired by the visual language of the Tron universe. Built for Tanmay Goel (CS at UIUC) to demonstrate advanced frontend engineering (WebGL, 3D spatial logic, complex state management, Canvas 2D animation) while presenting projects, skills, and background to technical recruiters and hiring managers. The complete experience ships with a Canvas 2D boot sequence, orbital grid world with three holographic gateway panes, and three content sectors (Projects, About, Skills) — fully deployable with SEO and mobile graceful degradation.

## Core Value

A recruiter clicking through should be wowed by the technical execution — the portfolio IS the proof of skill.

## Requirements

### Validated

- ✓ React + Vite scaffold with Three.js/R3F/Drei/Postprocessing — v1.0
- ✓ Phase-based state machine via Zustand (phase constants, setPhase, audio, HUD, sector) — v1.0
- ✓ IdentityDisc 3D model: 7-ring torus with emissiveIntensity 3.5–8.0 for Crimson Red Bloom halos, 0.12-height metallic center — v1.0 (DISC-01)
- ✓ Boot sequence: dual light-cycle Canvas 2D animation with collision flash, Howler.js audio fade-in, sessionStorage gate — v1.0 (BOOT-01/02/03/04, AUDIO-01)
- ✓ WebGL fallback detection with Tron-styled error screen and contact links — v1.0 (NFR-01)
- ✓ Tron-styled "ENTER THE GRID" button with hover glow — v1.0
- ✓ Shatter & Dock transition: GSAP disc animation center→top-left, grid illumination, persistent HUD, social icons — v1.0 (DOCK-01/02/03/04, AUDIO-02, NAV-01, NAV-02)
- ✓ Three holographic gateway panes in triangle formation, billboarding, idle surface texture, hover decrypt + grid pulse — v1.0 (GRID-01/02/03/04/05, NFR-03)
- ✓ Projects sector: 3D monoliths with data from projects.js, hover bob, GitHub links — v1.0 (PROJ-01/02/03/04/05/06)
- ✓ About sector: full-viewport terminal typewriter with 6-command bio, clickable contact links — v1.0 (ABOUT-01/02/03/04)
- ✓ Skills sector: Canvas 2D network graph, light-racer expansion/collapse for Tier 1→2 nodes — v1.0 (SKILLS-01/02/03/04/05)
- ✓ Mobile graceful degradation: MobileGateway stacked cards, no OrbitControls on <768px — v1.0 (NFR-02)
- ✓ SEO/OG meta tags, TR2N crimson favicon — v1.0 (NFR-04, NFR-05)

### Active

- [ ] ENH-01: OrbitControls inertia/momentum for smoother camera feel
- [ ] ENH-02: Sound effects on hover/click interactions (disc, panes, monoliths)
- [ ] ENH-03: Particle trails on camera movement through grid
- [ ] CONT-01: More than 3 project monoliths (extend projects.js data config)
- [ ] CONT-02: Resume/CV download link in About Me terminal
- [ ] CONT-03: Blog or writing section as fourth gateway pane

### Out of Scope

- Backend / server-side rendering — static SPA only, Vercel deploy
- Authentication or user accounts — public portfolio
- CMS or admin interface — data files are the config layer
- Real-time features — no websockets or live data
- Native mobile app — web only, mobile degrades gracefully
- Dark/light mode toggle — Tron aesthetic requires void black

## Context

- **v1.0 shipped:** 2026-03-19 — full 4-phase build, 107 files changed, ~7,100 LOC (JSX/JS)
- **Tech stack:** React 18 + Vite, Three.js + R3F + Drei + Postprocessing, GSAP, Zustand, Tailwind, Howler.js
- **Deployment:** Vercel static SPA
- **Known polish gaps:** Projects sector uses 2D card overlay (not 3D monolith fly-through); Skills graph Tier 2 nodes have some layout overlap at small viewport sizes
- **Performance:** Instanced grid lineSegments; Bloom threshold 0.2; grid divisionsX/Z 40x30 for draw-call efficiency

## Constraints

- **Tech stack**: React + Vite (JSX, not TypeScript) — established, no migration
- **3D engine**: Three.js + R3F only — no Babylon.js or other WebGL libs
- **Performance**: 60 FPS on modern desktop; use instanced meshes for grid/particles
- **Load time**: <3 second initial load target; boot sequence provides cover time
- **Deployment**: Vercel static SPA — no server-side code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase-based state machine (not routes) | Camera position and scene visibility drive "navigation" — no URL changes | ✓ Good |
| Zustand for global state | Lightweight, no context boilerplate, subscribable by any component | ✓ Good |
| HTML Canvas 2D for skills graph | Avoids 3D complexity for a data-viz component; more control over node layout | ✓ Good |
| Data-driven content (src/data/) | Adding/editing projects/skills requires no component changes | ✓ Good |
| sessionStorage for boot flag | Boot sequence plays once per session, not per page load | ✓ Good |
| emissiveIntensity 8.0 on outer disc ring | Bloom luminanceThreshold 0.2 — prior max of 1.8 was barely above threshold, producing minimal halos | ✓ Good |
| 7 rings instead of 5 on IdentityDisc | Adds visual density matching Tron reference image bands | ✓ Good |
| GSAP for disc dock animation | Provides inOut easing and onComplete callback for clean HUD reveal sequence | ✓ Good |
| Canvas 2D for boot sequence (not Three.js) | Full control over clip regions for letter-tracing sprites; simpler than building in 3D | ✓ Good |
| DOM disc element (CSS) for dock | Avoids R3F→DOM projection complexity; CSS animation is sufficient for HUD permanence | ✓ Good |
| 2D card overlay for Projects sector | 3D monolith fly-through proved complex; 2D overlay delivers content faster; monoliths preserved as decorative background | ⚠️ Revisit for v1.1 |

---
*Last updated: 2026-03-19 after v1.0 milestone*
