# Roadmap: Digital Dominion

## Overview

Starting from the partially-built Phase 2 (title screen + Enter the Grid CTA), this roadmap takes the portfolio from a static title screen to a fully navigable Tron-universe experience. The app's natural phase flow — Boot, Shatter & Dock, Grid World, Sector Dives — maps directly to four roadmap phases at coarse granularity. Each phase delivers one complete, playable layer of the experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Boot + Disc Foundation** - Implement the boot sequence and title screen with Enter the Grid CTA (completed 2026-03-18)
- [x] **Phase 2: Shatter & Dock** - Disc docks to HUD, grid illuminates, global navigation and audio controls establish the persistent interface shell (completed 2026-03-19)
- [ ] **Phase 3: Grid World** - Three holographic gateway panes render in triangle formation with orbital camera, billboard behavior, and idle/hover states
- [ ] **Phase 4: Sector Dives + Finish** - All three content sectors (Projects, About, Skills) fully navigable with deployable SEO and mobile degradation
## Phase Details

### Phase 1: Boot + Disc Foundation
**Goal**: The opening experience works end-to-end — visitor sees the boot sequence play once per session, then the title screen with ENTER THE GRID button, delivering music and the title reveal before transitioning to Phase 2
**Depends on**: Nothing (first phase; existing Phase 2 scaffold is the brownfield starting point)
**Requirements**: DISC-01, BOOT-01, BOOT-02, BOOT-03, BOOT-04, AUDIO-01, NFR-01
**Success Criteria** (what must be TRUE):
  1. Title screen displays "TANMAY GOEL" / "SOFTWARE DEVELOPER" text with "ENTER THE GRID" button featuring glitch-decode animation
  2. On first load, two light-cycle sprites draw "LOADING" simultaneously (cyan top half, orange bottom half), collide, flash to white, then fade to black
  3. After the flash, background music fades in and "TANMAY GOEL" / "SOFTWARE DEVELOPER" appear centered before transitioning to the disc scene
  4. Refreshing the page within the same session skips the boot sequence and lands directly on the title screen
  5. Visitors without WebGL see a styled error message with direct links to GitHub, LinkedIn, and email
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Rebuild IdentityDisc 3D model (preserved for HUD nav) and title screen layout (DISC-01)
- [ ] 01-02-PLAN.md — Boot sequence animation, audio manager, phase wiring (BOOT-01/02/03/04, AUDIO-01)
- [ ] 01-03-PLAN.md — WebGL fallback detection and error UI (NFR-01)
- [ ] 01-04-PLAN.md — Tron-styled "ENTER THE GRID" button with hover glow (DISC-01)

### Phase 2: Shatter & Dock
**Goal**: Clicking "ENTER THE GRID" triggers the transition — grid illuminates, CSS disc docks to top-left as Home button, social links appear, and the audio mute toggle and global nav HUD are always visible thereafter
**Depends on**: Phase 1
**Requirements**: DOCK-01, DOCK-02, DOCK-03, DOCK-04, AUDIO-02, NAV-01, NAV-02
**Success Criteria** (what must be TRUE):
  1. Clicking "ENTER THE GRID" triggers the transition: a CSS disc element animates to the top-left corner and settles as a Home button with "TANMAY GOEL" text beside it
  2. Three social icon nodes (GitHub, LinkedIn, Email) appear as glowing circles at the bottom-right after the dock transition completes
  3. The isometric wireframe grid illuminates in Neon Cyan across the XZ plane with bloom at the horizon line
  4. A speaker icon mute toggle is visible in the bottom-right corner at all times after Phase 1 ends
  5. The top-left disc + name HUD is always visible and clickable during Phases 4 and 5, and clicking it returns the camera to the Phase 4 default position
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Disc dock animation, grid illumination, HUD home button, social icons (DOCK-01/02/03/04)
- [ ] 02-02-PLAN.md — Mute toggle, global nav validation (AUDIO-02, NAV-01, NAV-02)

### Phase 3: Grid World
**Goal**: The grid world is fully navigable — three holographic panes are visible in triangle formation, the camera orbits freely, panes billboard to face the camera, and hover states reveal pane identity with light pulse effects
**Depends on**: Phase 2
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, NFR-03
**Success Criteria** (what must be TRUE):
  1. Three semi-transparent glass panes labeled ">_ ABOUT_ME", ">_ SKILLS", ">_ PROJECTS" rise from the grid floor in a triangle formation
  2. Dragging the viewport pans the camera 360 degrees horizontally; vertical orbit is clamped so the grid floor never disappears below the camera
  3. All three panes continuously face the camera regardless of orbit position
  4. In idle state, each pane surface displays chaotic 2D wireframe art and hex/ASCII text streams
  5. Hovering a pane causes its wireframe to snap to a clean structure, text decrypts to the pane label, and a light pulse ripples outward across the grid floor from its base
**Plans**: TBD

Plans:
- [ ] 03-01: Gateway panes — geometry, billboard behavior, idle surface texture (GRID-01/02/03/04)
- [ ] 03-02: Pane hover states, grid light pulse, performance validation (GRID-05, NFR-03)

### Phase 4: Sector Dives + Finish
**Goal**: All three content sectors are fully navigable and populated — Projects shows 3D monoliths, About shows the terminal bio, Skills shows the interactive network graph; the portfolio is deployable with correct SEO, favicon, and graceful mobile experience
**Depends on**: Phase 3
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, ABOUT-01, ABOUT-02, ABOUT-03, ABOUT-04, SKILLS-01, SKILLS-02, SKILLS-03, SKILLS-04, SKILLS-05, NFR-02, NFR-04, NFR-05
**Success Criteria** (what must be TRUE):
  1. Clicking any gateway pane flies the camera through it into the corresponding sector; clicking the top-left HUD returns to Grid World
  2. Projects sector shows three 3D monoliths from src/data/projects.js — each with name, tagline, tech tags, accent color, hover bob animation, and opens GitHub URL on click
  3. About sector expands to full viewport with a terminal that auto-types the bio as bash commands and ends with clickable GitHub, LinkedIn, and email links
  4. Skills sector expands to full viewport with an HTML Canvas network graph where clicking a Tier 1 node shoots cyan trails that spawn Tier 2 skill nodes, collapsible on second click
  5. On a mobile device (<768px), the boot sequence scales to fit, OrbitControls are disabled, and the three gateway panes are stacked vertically in a scrollable 2D overlay
  6. OG meta tags, page title, and a TR2N-font crimson favicon are correctly set so link previews show the portfolio properly
**Plans**: TBD

Plans:
- [ ] 04-01: Projects Sector — monolith geometry, data-driven content, hover/click behaviors (PROJ-01/02/03/04/05/06)
- [ ] 04-02: About Me Sector — camera fly-in, viewport expand, terminal typewriter, contact links (ABOUT-01/02/03/04)
- [ ] 04-03: Skills Sector — Canvas network graph, Tier 1/2 nodes, light-racer expansion (SKILLS-01/02/03/04/05)
- [ ] 04-04: Mobile degradation, SEO meta tags, favicon (NFR-02, NFR-04, NFR-05)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Boot + Disc Foundation | 4/4 | Complete   | 2026-03-18 |
| 2. Shatter & Dock | 2/2 | Complete   | 2026-03-19 |
| 3. Grid World | 0/2 | Not started | - |
| 4. Sector Dives + Finish | 0/4 | Not started | - |
