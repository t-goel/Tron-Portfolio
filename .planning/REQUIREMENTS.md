# Requirements: Digital Dominion

**Defined:** 2026-03-19
**Milestone:** v1.1 Immersion Polish
**Core Value:** A recruiter clicking through should be wowed by the technical execution — the portfolio IS the proof of skill.

## v1.1 Requirements

### Boot & Title

- [ ] **BOOT-05**: User sees a dark Tron-themed terminal boot log (scrolling monospace system text on void black background) as the loading screen instead of a white/light screen
- [x] **TITLE-01**: Title screen text clears promptly and smoothly when the user clicks the CTA button (no lingering overlap during transition)

### Grid UX

- [x] **PANE-01**: Gateway pane labels ("SKILLS", "PROJECTS", "ABOUT ME") are legible by default without requiring hover interaction
- [ ] **PANE-02**: User sees a brief navigation affordance hint ("Click and drag to explore") the first time they enter the grid (sessionStorage-gated, one-time display)

### Navigation

- [ ] **NAV-03**: User can click the HUD disc while inside a sector to return to the grid view (not the home/title screen)
- [x] **NAV-04**: User can press ESC while inside a sector to exit back to the grid view
- [ ] **NAV-05**: Sector exit triggers a cinematic hyper-reverse camera warp — camera accelerates backward, grid lines stretch into light trails, then grid snaps back into view

### About Terminal

- [ ] **ABOUT-05**: User can type in the About sector terminal; typing "exit" exits the sector back to the grid
- [ ] **ABOUT-06**: About terminal displays a subtle hint that the user can type "exit" to return to the grid

## Future Requirements

### Enhancement (deferred from v1.0)

- **ENH-01**: OrbitControls inertia/momentum for smoother camera feel
- **ENH-02**: Sound effects on hover/click interactions (disc, panes, monoliths)
- **ENH-03**: Particle trails on camera movement through grid

### Content (deferred from v1.0)

- **CONT-01**: More than 3 project monoliths (extend projects.js data config)
- **CONT-02**: Resume/CV download link in About Me terminal
- **CONT-03**: Blog or writing section as fourth gateway pane

## Out of Scope

| Feature | Reason |
|---------|--------|
| xterm.js / jQuery Terminal | Bundle bloat — fixed-vocabulary command parsing (exit only) is sufficient |
| Full easter egg command set | Out of scope for v1.1 — keep terminal minimal |
| ChromaticAberration postprocessing on warp | Optional enhancement — defer to v1.2 if NAV-05 is performant without it |
| OrbitControls inertia | Deferred to future milestone |
| Sound effects on interactions | Deferred to future milestone |
| Particle trails | Deferred to future milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TITLE-01 | Phase 5 | Complete |
| PANE-01 | Phase 5 | Complete |
| NAV-04 | Phase 5 | Complete |
| PANE-02 | Phase 6 | Pending |
| BOOT-05 | Phase 6 | Pending |
| NAV-03 | Phase 7 | Pending |
| NAV-05 | Phase 7 | Pending |
| ABOUT-05 | Phase 8 | Pending |
| ABOUT-06 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 — traceability updated after v1.1 roadmap creation (Phases 5-8)*
