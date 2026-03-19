# Roadmap: Digital Dominion

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-19)
- 🚧 **v1.1 Immersion Polish** — Phases 5-8 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-19</summary>

- [x] Phase 1: Boot + Disc Foundation (4/4 plans) — completed 2026-03-18
- [x] Phase 2: Shatter & Dock (2/2 plans) — completed 2026-03-19
- [x] Phase 3: Grid World (2/2 plans) — completed 2026-03-19
- [x] Phase 4: Sector Dives + Finish (5/5 plans) — completed 2026-03-19

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Immersion Polish (In Progress)

**Milestone Goal:** Deepen UX immersion through a Tron-themed loading screen, visible panel labels, navigation affordances, cinematic sector exit, and interactive terminal.

- [x] **Phase 5: Quick Wins** — Zero-dependency polish: visible pane labels, faster title clear, ESC exits sectors (completed 2026-03-19)
- [ ] **Phase 6: First Impressions** — New isolated components: Tron terminal boot screen, navigation affordance hint
- [ ] **Phase 7: Camera Warp** — Cinematic hyper-reverse warp animation on sector exit; verify disc-click return
- [ ] **Phase 8: Interactive Terminal** — About terminal accepts typed input; "exit" command triggers full warp exit

## Phase Details

### Phase 5: Quick Wins
**Goal**: Users experience a polished, responsive grid with visible labeling and obvious keyboard/click navigation conventions
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: TITLE-01, PANE-01, NAV-04
**Success Criteria** (what must be TRUE):
  1. Gateway pane labels ("SKILLS", "PROJECTS", "ABOUT ME") are legible at rest without hovering
  2. Clicking the "ENTER THE GRID" CTA clears the title text promptly within a quarter-second with no lingering overlap
  3. Pressing ESC while inside any sector returns the user to the grid view
**Plans:** 1/1 plans complete
Plans:
- [ ] 05-01-PLAN.md — Visible idle labels, fast title clear, ESC exits sectors

### Phase 6: First Impressions
**Goal**: The first ten seconds of every visit feel like booting into the Tron universe, and first-time grid visitors know how to navigate
**Depends on**: Phase 5
**Requirements**: PANE-02, BOOT-05
**Success Criteria** (what must be TRUE):
  1. The loading screen shows a dark void-black background with scrolling monospace boot log text in cyan — no white flash or light background visible
  2. A first-time grid visitor sees a "Click and drag to explore" affordance hint that auto-fades; it does not reappear on subsequent visits to the grid in the same session
**Plans**: TBD

### Phase 7: Camera Warp
**Goal**: Exiting a sector feels cinematic — the camera accelerates backward through the grid and snaps back into the orbital view
**Depends on**: Phase 6
**Requirements**: NAV-03, NAV-05
**Success Criteria** (what must be TRUE):
  1. Clicking the HUD disc while inside a sector returns the user to the grid view (not the title/home screen)
  2. The sector exit transition shows the camera rushing backward with grid lines stretching into light trails, then snapping cleanly into the orbital grid position
  3. OrbitControls re-enable smoothly after the warp completes with no visible snap or stutter
**Plans**: TBD

### Phase 8: Interactive Terminal
**Goal**: The About sector is an interactive CLI — users can type, and "exit" produces the full cinematic warp back to the grid
**Depends on**: Phase 7
**Requirements**: ABOUT-05, ABOUT-06
**Success Criteria** (what must be TRUE):
  1. Clicking or focusing the About terminal activates keyboard input — typed characters appear in the terminal prompt
  2. Typing "exit" and pressing Enter exits the About sector with the full camera warp animation established in Phase 7
  3. The terminal displays a visible hint that typing "exit" will return the user to the grid
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Boot + Disc Foundation | v1.0 | 4/4 | Complete | 2026-03-18 |
| 2. Shatter & Dock | v1.0 | 2/2 | Complete | 2026-03-19 |
| 3. Grid World | v1.0 | 2/2 | Complete | 2026-03-19 |
| 4. Sector Dives + Finish | v1.0 | 5/5 | Complete | 2026-03-19 |
| 5. Quick Wins | 1/1 | Complete   | 2026-03-19 | - |
| 6. First Impressions | v1.1 | 0/TBD | Not started | - |
| 7. Camera Warp | v1.1 | 0/TBD | Not started | - |
| 8. Interactive Terminal | v1.1 | 0/TBD | Not started | - |
