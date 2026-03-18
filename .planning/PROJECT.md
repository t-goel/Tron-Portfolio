# Digital Dominion

## What This Is

A highly immersive, 3D-navigable personal portfolio website inspired by the visual language of the Tron universe. Built for Tanmay Goel (CS at UIUC) to demonstrate advanced frontend engineering (WebGL, 3D spatial logic, complex state management) while presenting projects, skills, and background to technical recruiters and hiring managers.

## Core Value

A recruiter clicking through should be wowed by the technical execution — the portfolio IS the proof of skill.

## Requirements

### Validated

- ✓ React + Vite scaffold with Three.js/R3F/Drei/Postprocessing — existing
- ✓ Phase-based state machine via Zustand (phase constants, setPhase, audio, HUD, sector) — existing
- ✓ IdentityDisc (Phase 2): 3D disc with procedural texture, torus rings, particle system, hover animations, grid floor preview — existing (needs visual rebuild to match reference image)
- ✓ TitleOverlay (Phase 2): "TANMAY GOEL" + "SOFTWARE DEVELOPER" with glitch effect on hover — existing
- ✓ Design system: Void Black / Neon Cyan / Neon Orange / Crimson Red / Off-White palette, TR2N font, CSS variables — existing
- ✓ Data config schemas: projects.js, skills.js, contact.js (schemas defined, content TBD) — existing
- ✓ Scene orchestrator with Bloom + Vignette postprocessing — existing

### Active

- [ ] Phase 1: Boot Sequence — two light-cycle sprites trace "LOADING" (cyan top half, orange bottom half), collision flash fills viewport, fade to black, music + title fade in
- [ ] Phase 3: Shatter & Dock transition — disc scales down and lerps to top-left as Home button, social icons appear bottom-right, grid powers on permanently
- [ ] Phase 4: Grid World — three holographic gateway panes (About / Skills / Projects) in triangle formation, orbital camera (OrbitControls), billboarding, idle/hover states
- [ ] Phase 5a: Projects Sector — three 3D monoliths rise from grid with name, tagline, tech tags, accent color; hover bob animation; click opens GitHub URL
- [ ] Phase 5b: About Me Sector — pane expands to full viewport, 2D terminal interface auto-types bio as bash commands with clickable contact links
- [ ] Phase 5c: Skills Sector — HTML Canvas 2D network graph, Tier 1 category nodes visible, click expands to Tier 2 skill nodes via light-racer animation
- [ ] Audio: Howler.js background music loop, mute/unmute toggle HUD (bottom-right speaker icon)
- [ ] Global nav escape hatch: top-left HUD (disc + name) always visible in Phase 4/5, click returns to Phase 4 camera position
- [ ] Mobile graceful degradation: <768px disable OrbitControls, stack panes vertically, scaled boot sequence
- [ ] WebGL fallback: detect unavailability, show styled error with contact links
- [ ] SEO/OG meta tags: title, description, OG image matching Phase 2 visual
- [ ] Favicon: Crimson Red "T" in TR2N font on black background
- [ ] sessionStorage flag: boot sequence plays only on first visit per session

### Out of Scope

- Backend / server-side rendering — static SPA only, Vercel deploy
- Authentication or user accounts — public portfolio
- CMS or admin interface — data files are the config layer
- Real-time features — no websockets or live data
- Native mobile app — web only, mobile degrades gracefully

## Context

- Codebase map exists at `.planning/codebase/` — Phase 2 is substantially built
- SPEC.md at project root is the authoritative product requirements document
- Font file `Tron-JOAa.ttf` is in `src/assets/fonts/`
- Contact links (GitHub, LinkedIn, email) are TBD — placeholders in `src/data/contact.js`
- Project data (3 entries in `src/data/projects.js`) are TBD — to be populated during development
- Boot sequence music: "Just Turn It On and Make Something" (open-source track referenced in SPEC)

## Constraints

- **Tech stack**: React + Vite (JSX, not TypeScript) — established, no migration
- **3D engine**: Three.js + R3F only — no Babylon.js or other WebGL libs
- **Performance**: 60 FPS on modern desktop; use instanced meshes for grid/particles
- **Load time**: <3 second initial load target; boot sequence provides cover time
- **Deployment**: Vercel static SPA — no server-side code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase-based state machine (not routes) | Camera position and scene visibility drive "navigation" — no URL changes | — Pending |
| Zustand for global state | Lightweight, no context boilerplate, subscribable by any component | ✓ Good |
| HTML Canvas 2D for skills graph | Avoids 3D complexity for a data-viz component; more control over node layout | — Pending |
| Data-driven content (src/data/) | Adding/editing projects/skills requires no component changes | ✓ Good |
| sessionStorage for boot flag | Boot sequence plays once per session, not per page load | — Pending |

---
*Last updated: 2026-03-17 after initialization*
