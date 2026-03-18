---
phase: 01-boot-disc-foundation
plan: 02
subsystem: ui
tags: [canvas2d, animation, howler, zustand, boot-sequence, raf, sessionStorage]

requires:
  - phase: 01-boot-disc-foundation plan 01
    provides: Vite+React project scaffold with Three.js, Zustand store, TitleOverlay component

provides:
  - Full boot sequence animation (Canvas 2D): light-cycle letter tracing, collision flash, title reveal
  - Howler.js audioManager singleton with initAudio/playWithFade/setMuted/getSound exports
  - sessionStorage skip (tron-boot-played) for repeat visits within same session
  - Phase state machine wired from phase 1 (boot) -> phase 2 (disc) via setPhase(2)
  - App.jsx phase-conditional rendering of BootSequence and TitleOverlay
  - TitleOverlay visible prop with opacity/transition for phase-conditional display

affects: [02-grid-world, 03-sector-dives, 04-polish — all depend on phase state machine and audio singleton]

tech-stack:
  added: [howler (Howler.js 2.2.4 — already installed)]
  patterns:
    - Howler singleton pattern via module-level variable (never create multiple Howl instances)
    - rAF animation loop with elapsed-time-based phase timeline (not frame counters)
    - Canvas 2D clip regions for top/bottom half letter reveal (ctx.save/clip/restore)
    - Zustand .subscribe() selector for external side-effect sync (audio mute)

key-files:
  created:
    - src/utils/audioManager.js
    - src/components/UI/BootSequence.jsx
    - public/audio/.gitkeep
  modified:
    - src/store/appState.js (phase: 2 -> phase: 1)
    - src/App.jsx (BootSequence overlay, phase guards, audio subscribe)
    - src/components/UI/TitleOverlay.jsx (visible prop + opacity transition)

key-decisions:
  - "Elapsed-time-based timeline over frame counters — decouples animation speed from frame rate"
  - "Canvas clip regions (not layered elements) for cyan/orange letter half reveal"
  - "Howler playerror + document click fallback for autoplay policy compliance"
  - "completed ref guard in rAF loop prevents double setPhase() calls at boundary"

patterns-established:
  - "rAF loop pattern: startTimeRef timestamp, elapsed = timestamp - startTimeRef.current, phase guards in drawFrame()"
  - "Howler singleton: module-level let sound = null, initAudio() lazy-initializes once"
  - "Phase gate pattern in App.jsx: {phase === N && <Component />}"

requirements-completed: [BOOT-01, BOOT-02, BOOT-03, BOOT-04, AUDIO-01]

duration: 18min
completed: 2026-03-17
---

# Phase 1 Plan 02: Boot Sequence Summary

**Canvas 2D boot animation with Howler.js audio singleton — cyan/orange light-cycle letter tracing, collision flash, music fade-in, title reveal, and sessionStorage skip for repeat visits**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-17T23:10:40Z
- **Completed:** 2026-03-17T23:28:32Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Canvas 2D animation (331 lines): TR2N-font "LOADING" traced by cyan (top) and orange (bottom) sprites using clip regions, followed by white radial collision flash, fade-to-black, title reveal, and phase transition
- Howler.js audioManager singleton with lazy initialization, volume-zero start, 2s fade-in, mute control, and autoplay playerror fallback
- sessionStorage gate (key: `tron-boot-played`) causes repeat visits within same session to skip boot and land directly on disc

## Task Commits

1. **Task 1: Create audioManager utility and update appState** - `7ae03d9` (feat)
2. **Task 2: Create BootSequence component with light-cycle animation** - `9fd7d88` (feat)
3. **Task 3: Wire BootSequence into App.jsx and add visible prop to TitleOverlay** - `b75d02d` (feat)

## Files Created/Modified

- `src/utils/audioManager.js` - Howler.js singleton: initAudio, playWithFade, setMuted, getSound exports
- `src/components/UI/BootSequence.jsx` - Full boot animation component (331 lines, Canvas 2D, rAF loop)
- `public/audio/.gitkeep` - Placeholder for background.mp3 (user must provide file)
- `src/store/appState.js` - Initial phase changed from 2 to 1 (Boot Sequence start)
- `src/App.jsx` - Phase-conditional BootSequence overlay, Canvas position:absolute, TitleOverlay gate, audio mute subscribe
- `src/components/UI/TitleOverlay.jsx` - visible prop added with opacity/transition style

## Decisions Made

- Elapsed-time-based animation timeline (ms from mount) instead of frame counters — ensures consistent animation speed regardless of frame rate
- Canvas clip regions (ctx.save/beginPath/rect/clip/restore) for the top/bottom letter half cyan/orange split — cleaner than DOM layering
- Howler playerror + document click (once) listener for browser autoplay policy fallback — shows "CLICK TO ENABLE AUDIO" on canvas
- `completedRef` boolean guard in rAF callback prevents double-firing `setPhase(2)` at the TITLE_END boundary frame

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**Audio file required before the boot sequence plays music:**

Place an MP3 file at `public/audio/background.mp3`. Use any Tron-style ambient/electronic track. The audioManager will serve it from `/audio/background.mp3`. If the file is missing, Howler will silently fail (no crash) — the animation plays without sound.

## Next Phase Readiness

- Boot sequence → disc phase transition is wired and functional
- Phase state machine (1 -> 2) is ready; future plans extend to phases 3, 4, 5
- Audio singleton ready for use by any component that imports from audioManager.js
- `npm run build` succeeds (2.20s, no errors)

---
*Phase: 01-boot-disc-foundation*
*Completed: 2026-03-17*
