---
phase: 02-shatter-dock
plan: 01
subsystem: ui
tags: [three.js, r3f, gsap, zustand, react, animation, hud]

# Dependency graph
requires:
  - phase: 01-boot-disc-foundation
    provides: Phase state machine (phase 1/2/3), Zustand store with hudVisible/setHudVisible, Scene.jsx with EffectComposer/Bloom, boot sequence complete
provides:
  - GridFloor.jsx: cyan 80x80 wireframe grid with Bloom halos, fades in on phase >= 3
  - SocialIcons.jsx: three circular cyan social icon anchors (GitHub, LinkedIn, Email)
  - DOM disc dock animation: GSAP from viewport center to top-left, 1.2s, scale 0.35
  - HUD home button: spinning crimson disc + TANMAY GOEL text at top-left
  - HUD controls container at bottom-right for social icons
  - CSS discSpin keyframe and .hud-disc utility class
affects: [03-grid-world, 04-sector-dives]

# Tech tracking
tech-stack:
  added: [gsap (dock animation)]
  patterns:
    - GSAP DOM animation triggered by Zustand phase change via useEffect
    - Elapsed-time fade-in for R3F components (consistent with Phase 1 boot pattern)
    - hudVisible state gates HUD visibility (toggled via GSAP onComplete callback)
    - Phase guard conditional render in Scene.jsx (phase >= 3 before GridFloor)

key-files:
  created:
    - src/components/3D/GridFloor.jsx
    - src/components/UI/SocialIcons.jsx
  modified:
    - src/components/Scene.jsx
    - src/App.jsx
    - src/index.css

key-decisions:
  - "DOM disc stays visible during animation (phase >= 3 && !hudVisible) then replaced by CSS hud-disc after dock completes"
  - "HUD home button onClick resets both phase (2) and hudVisible (false) so TitleOverlay re-renders cleanly"
  - "SocialIcons uses staggered transitionDelay (0/80/160ms) via opacity transition triggered by useEffect mount tick"
  - "GridFloor placed BEFORE EffectComposer in Scene so Bloom post-processing applies to it automatically"

patterns-established:
  - "Phase gate pattern: {phase >= N && <Component />} in Scene.jsx for progressive 3D element reveal"
  - "GSAP + Zustand integration: useEffect watches phase, GSAP animates DOM, onComplete triggers state update"

requirements-completed: [DOCK-01, DOCK-02, DOCK-03, DOCK-04]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 2 Plan 01: Shatter & Dock Transition Summary

**GSAP DOM disc dock animation (center to top-left, 1.2s) with R3F cyan grid fade-in, persistent HUD chrome (spinning disc + name + social icons), and phase-gated GridFloor with Bloom halos**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-18T09:29:00Z
- **Completed:** 2026-03-18T09:32:00Z
- **Tasks:** 2 auto + 1 auto-approved checkpoint
- **Files modified:** 5

## Accomplishments
- GridFloor.jsx renders an 80x80 cyan wireframe grid using R3F lineSegments with elapsed-time fade-in (0 to 0.6 opacity over 2s); Bloom produces cyan halos since toneMapped={false} keeps color above luminanceThreshold 0.2
- DOM disc GSAP animation fires on phase 3 entry: 120px crimson circle at viewport center shrinks to top-left corner (top:24px, left:24px, scale:0.35) over 1.2s using power2.inOut easing; onComplete calls setHudVisible(true)
- Persistent HUD established: spinning crimson disc (discSpin 8s linear infinite) + "TANMAY GOEL" name at top-left; three cyan social icon circles (GitHub/LinkedIn/Email, 44px touch targets, staggered fade-in) at bottom-right; clicking HUD home resets phase to 2 and hides HUD

## Task Commits

Each task was committed atomically:

1. **Task 1: GridFloor component and Scene phase guard** - `61e8e81` (feat)
2. **Task 2: DOM disc dock animation, HUD, SocialIcons, CSS** - `b3aa2bc` (feat)
3. **Task 3: Visual verification** - Auto-approved (--auto flag active)

## Files Created/Modified
- `src/components/3D/GridFloor.jsx` - R3F LineSegments cyan grid, 81x81 lines, elapsed-time fade-in, Bloom-ready
- `src/components/UI/SocialIcons.jsx` - Three circular anchor links with GitHub/LinkedIn/Email SVG icons, 44px touch targets, cyan glow, staggered opacity fade-in
- `src/components/Scene.jsx` - Added GridFloor import, useAppState phase selector, phase >= 3 conditional render
- `src/App.jsx` - Added GSAP import, domDiscRef, hudVisible/setHudVisible/setPhase selectors, GSAP dock useEffect, DOM disc JSX, HUD home button, HUD controls container
- `src/index.css` - Appended discSpin keyframes and .hud-disc utility class

## Decisions Made
- DOM disc is a plain div (not R3F) so GSAP can animate its CSS properties directly via domDiscRef
- HUD home button onClick calls both setPhase(2) and setHudVisible(false) to ensure TitleOverlay re-renders
- SocialIcons staggered fade-in uses a single boolean state toggled via useEffect mount tick, driving opacity via transitionDelay
- GridFloor positioned at y=-3 to sit below the camera horizon line

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - build passed on first attempt for both tasks.

## User Setup Required
None - no external service configuration required. (Note: contact.js still has TBD values for GitHub, LinkedIn, email — this is a pre-existing blocker documented in STATE.md. SocialIcons gracefully falls back to generic URLs until populated.)

## Next Phase Readiness
- Phase 2-to-3 transition fully operational: GridFloor, disc dock, HUD chrome all functioning
- Phase 3 (Grid World) can build on: persistent HUD shell, phase >= 3 guard pattern in Scene.jsx, hudVisible state
- Remaining Phase 2 plan (02-02) can add MuteToggle above SocialIcons in the existing HUD controls container

---
*Phase: 02-shatter-dock*
*Completed: 2026-03-18*
