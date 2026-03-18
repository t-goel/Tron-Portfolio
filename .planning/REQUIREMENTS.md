# Requirements: Digital Dominion

**Defined:** 2026-03-17
**Core Value:** The portfolio IS the proof of skill — a recruiter should be wowed by the technical execution.

## v1 Requirements

### Identity Disc (Phase 2)

- [x] **DISC-01**: Rebuild IdentityDisc 3D model to match reference image (`reference/Screenshot 2026-03-10 at 11.18.58 PM.png`) — multiple layered concentric rings with beveled 3D depth, strong Crimson Red emissive glow, dark metallic center; title text ("TANMAY GOEL" above, "SOFTWARE DEVELOPER" below) stays in current position

### Boot Sequence (Phase 1)

- [x] **BOOT-01**: Two light-cycle sprites trace "LOADING" simultaneously on black viewport — cyan draws top half, orange draws bottom half of each letter at 90-degree angles
- [x] **BOOT-02**: Sprites reverse and collide at letter center, triggering a bright flash that expands to fill viewport in 0.2s then fades to black
- [x] **BOOT-03**: From black: background music fades in, "TANMAY GOEL" (Red, TR2N) and "SOFTWARE DEVELOPER" (White, Roboto Mono) fade in at center, scene transitions to Phase 2
- [x] **BOOT-04**: sessionStorage flag ensures boot sequence plays only on first visit per session; subsequent loads skip directly to Phase 2

### Shatter & Dock (Phase 3)

- [ ] **DOCK-01**: On disc click, disc scales down ~80% and lerps to top-left corner with spinning wind-down, settling into persistent idle rotation as Home button
- [ ] **DOCK-02**: "TANMAY GOEL" text snaps into position beside the docked disc in the top-left HUD
- [ ] **DOCK-03**: Three social icon nodes (GitHub, LinkedIn, Email) fade in at bottom-right corner as glowing circles
- [ ] **DOCK-04**: Grid permanently illuminates as glowing Neon Cyan isometric wireframe on XZ plane with bloom/lens flare at horizon line

### Grid World (Phase 4)

- [ ] **GRID-01**: Three semi-transparent holographic glass panes (>_ ABOUT_ME, >_ SKILLS, >_ PROJECTS) rendered in triangle formation rising from grid floor
- [ ] **GRID-02**: Orbital camera via OrbitControls — full 360° horizontal pan, vertical restricted to prevent seeing under grid
- [ ] **GRID-03**: All three panes Y-axis billboard to continuously face camera regardless of camera position
- [ ] **GRID-04**: Pane idle state displays chaotic 2D wireframe art and ASCII/hex text streams as surface texture
- [ ] **GRID-05**: Pane hover state — wireframes snap to clean symmetrical structure, text decrypts to reveal pane label, light pulse ripples outward across grid floor from pane base

### Projects Sector (Phase 5a)

- [ ] **PROJ-01**: Camera lerps through selected Projects pane as fly-through transition into sector
- [ ] **PROJ-02**: Three 3D rectangular monoliths rise from grid floor, each displaying project name, one-line tagline, and tech stack tags; glowing emissive edges in assigned accent color
- [ ] **PROJ-03**: Active project monolith (active: true) uses Crimson Red accent and displays "IN PROGRESS" tag; all others use Neon Orange
- [ ] **PROJ-04**: Hover on monolith triggers slow vertical bob/float animation with brightening emissive glow
- [ ] **PROJ-05**: Click on monolith opens project's GitHub URL in new tab
- [ ] **PROJ-06**: All monolith content driven from src/data/projects.js — no project data hardcoded in components

### About Me Sector (Phase 5b)

- [ ] **ABOUT-01**: Camera flies into About pane, pane expands to fill full viewport (100vw × 100vh)
- [ ] **ABOUT-02**: 3D background scene receives heavy Gaussian blur behind the 2D overlay
- [ ] **ABOUT-03**: 2D terminal interface auto-types bio content as bash commands: whoami, cat background.txt, cat interests.txt, cat looking_for.txt, ls contact/, cat contact/*
- [ ] **ABOUT-04**: Contact links (GitHub, LinkedIn, email) render as clickable glowing terminal links at end of typewriter output

### Skills Sector (Phase 5c)

- [ ] **SKILLS-01**: Camera flies into Skills pane, pane expands to fill full viewport (100vw × 100vh) with heavy background blur
- [ ] **SKILLS-02**: HTML Canvas 2D network graph renders full-viewport — Tier 1 category nodes (5 categories) visible and labeled, connected by faint glowing lines
- [ ] **SKILLS-03**: Click on Tier 1 category node triggers light-racer expansion: cyan trails shoot outward and spawn Tier 2 skill nodes at endpoints with connecting lines
- [ ] **SKILLS-04**: Clicking same category node again collapses Tier 2 nodes — they retract along trails and disappear
- [ ] **SKILLS-05**: Hover on any node highlights it and all connected edges with brightness pulse, displays label if not visible

### Audio

- [x] **AUDIO-01**: Background music (Howler.js) fades in during Phase 1 boot sequence and loops for the entire session
- [ ] **AUDIO-02**: Mute/unmute toggle (speaker icon) visible in bottom-right HUD corner at all times after Phase 1

### Global Navigation

- [ ] **NAV-01**: Top-left HUD (small red disc + "TANMAY GOEL" text) is always fixed, visible, and clickable during Phase 4 and Phase 5
- [ ] **NAV-02**: Clicking HUD triggers high-speed reverse camera lerp to Phase 4 default position, fades out sector content, fades in all three panes, restores horizon line and grid

### Non-Functional

- [x] **NFR-01**: WebGL unavailability detected on page load; shows styled error: "This experience requires WebGL" with direct links to GitHub, LinkedIn, and email
- [ ] **NFR-02**: Mobile graceful degradation (<768px): boot sequence scales to fit, OrbitControls disabled, gateway panes stacked vertically in scrollable 2D overlay, simplified static grid loops in background
- [ ] **NFR-03**: WebGL canvas maintains stable 60 FPS on modern desktop; instanced meshes used for grid lines and particles to minimize draw calls
- [ ] **NFR-04**: Open Graph meta tags — OG title "Tanmay Goel — Software Developer", OG description, OG image matching Phase 2 visual on black background
- [ ] **NFR-05**: Favicon is a glowing Crimson Red "T" in TR2N font on black background

## v2 Requirements

### Enhanced Interactions

- **ENH-01**: OrbitControls inertia/momentum for smoother camera feel
- **ENH-02**: Sound effects on hover/click interactions (disc, panes, monoliths)
- **ENH-03**: Particle trails on camera movement through grid

### Content Expansion

- **CONT-01**: More than 3 project monoliths (extend data config)
- **CONT-02**: Resume/CV download link in About Me terminal
- **CONT-03**: Blog or writing section as fourth gateway pane

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / server-side rendering | Static SPA only — Vercel deploy |
| Authentication or user accounts | Public portfolio, no login needed |
| CMS or admin interface | Data files in src/data/ are the config layer |
| Real-time features (websockets, live data) | Not applicable to a portfolio |
| Native mobile app | Web-only; mobile degrades gracefully |
| Analytics/tracking beyond standard | Not required for v1 |
| Dark/light mode toggle | Tron aesthetic requires void black — no toggle |

## Traceability

| Requirement | Roadmap Phase | Status |
|-------------|---------------|--------|
| DISC-01 | Phase 1 — Boot + Disc Foundation | Complete |
| BOOT-01 | Phase 1 — Boot + Disc Foundation | Complete |
| BOOT-02 | Phase 1 — Boot + Disc Foundation | Complete |
| BOOT-03 | Phase 1 — Boot + Disc Foundation | Complete |
| BOOT-04 | Phase 1 — Boot + Disc Foundation | Complete |
| AUDIO-01 | Phase 1 — Boot + Disc Foundation | Complete |
| NFR-01 | Phase 1 — Boot + Disc Foundation | Complete |
| DOCK-01 | Phase 2 — Shatter & Dock | Pending |
| DOCK-02 | Phase 2 — Shatter & Dock | Pending |
| DOCK-03 | Phase 2 — Shatter & Dock | Pending |
| DOCK-04 | Phase 2 — Shatter & Dock | Pending |
| AUDIO-02 | Phase 2 — Shatter & Dock | Pending |
| NAV-01 | Phase 2 — Shatter & Dock | Pending |
| NAV-02 | Phase 2 — Shatter & Dock | Pending |
| GRID-01 | Phase 3 — Grid World | Pending |
| GRID-02 | Phase 3 — Grid World | Pending |
| GRID-03 | Phase 3 — Grid World | Pending |
| GRID-04 | Phase 3 — Grid World | Pending |
| GRID-05 | Phase 3 — Grid World | Pending |
| NFR-03 | Phase 3 — Grid World | Pending |
| PROJ-01 | Phase 4 — Sector Dives + Finish | Pending |
| PROJ-02 | Phase 4 — Sector Dives + Finish | Pending |
| PROJ-03 | Phase 4 — Sector Dives + Finish | Pending |
| PROJ-04 | Phase 4 — Sector Dives + Finish | Pending |
| PROJ-05 | Phase 4 — Sector Dives + Finish | Pending |
| PROJ-06 | Phase 4 — Sector Dives + Finish | Pending |
| ABOUT-01 | Phase 4 — Sector Dives + Finish | Pending |
| ABOUT-02 | Phase 4 — Sector Dives + Finish | Pending |
| ABOUT-03 | Phase 4 — Sector Dives + Finish | Pending |
| ABOUT-04 | Phase 4 — Sector Dives + Finish | Pending |
| SKILLS-01 | Phase 4 — Sector Dives + Finish | Pending |
| SKILLS-02 | Phase 4 — Sector Dives + Finish | Pending |
| SKILLS-03 | Phase 4 — Sector Dives + Finish | Pending |
| SKILLS-04 | Phase 4 — Sector Dives + Finish | Pending |
| SKILLS-05 | Phase 4 — Sector Dives + Finish | Pending |
| NFR-02 | Phase 4 — Sector Dives + Finish | Pending |
| NFR-04 | Phase 4 — Sector Dives + Finish | Pending |
| NFR-05 | Phase 4 — Sector Dives + Finish | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 — traceability aligned to roadmap phases*
