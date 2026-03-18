---
phase: quick
plan: 260317-rg5
subsystem: UI/Phase2
tags: [enter-button, glitch-animation, phase2, disc-removal]
dependency_graph:
  requires: []
  provides: [phase2-centered-cta, glitch-decode-animation]
  affects: [App.jsx, Scene.jsx, EnterButton.jsx]
tech_stack:
  added: []
  patterns: [glitch-char-decode, css-keyframe-pulse, interval-based-animation]
key_files:
  created: []
  modified:
    - src/components/UI/EnterButton.jsx
    - src/components/Scene.jsx
    - src/App.jsx
decisions:
  - "Progressive left-to-right decode uses per-character tick budget (4 ticks each at 40ms) — deterministic 560ms total resolve time"
  - "Hover glitch uses separate interval ref to avoid interfering with mount decode; snaps to TARGET_TEXT on mouse leave"
  - "borderPulse animation disabled on hover (animation:none) so hover box-shadow takes over cleanly"
  - "IdentityDisc.jsx untouched — preserved for future nav bar integration"
metrics:
  duration: 69s
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260317-rg5: Remove Disc from Main Screen, Replace with Glitch CTA Summary

**One-liner:** Removed 3D IdentityDisc from phase 2 hub and replaced with a full-screen centered "ENTER THE GRID" button featuring left-to-right character decode animation on mount and brief glitch burst on hover.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add glitch/decode animation to EnterButton, center full-screen | `2430805` | `src/components/UI/EnterButton.jsx` |
| 2 | Remove disc from Scene, clean up App.jsx disc hover wiring | `2627afa` | `src/components/Scene.jsx`, `src/App.jsx` |

## What Was Built

**EnterButton.jsx** — Completely rewritten:
- Full-screen centered via `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)`
- Larger: font `clamp(1.2rem, 3vw, 2rem)`, padding `1.2rem 3.5rem`
- Mount decode: all chars start randomized (`0123456789ABCDEF!@#$%^&*`), then resolve left-to-right at 4 random ticks per character (40ms each), spaces resolve immediately
- Hover re-glitch: randomizes ~35% of chars for 400ms then snaps to final text
- Pulsing border glow: `@keyframes borderPulse` alternates `rgba(255,0,0,0.2)` to `rgba(255,0,0,0.6)` over 2s infinite; disabled on hover
- `setPhase(3)` on click preserved

**Scene.jsx** — Simplified:
- Removed `IdentityDisc` import
- Removed `{phase === 2 && <IdentityDisc ... />}` block
- Removed `onDiscHover` prop from function signature
- Kept lights, EffectComposer, Bloom, Vignette for ambient atmosphere

**App.jsx** — Cleaned up:
- Removed `discHovered` useState
- Removed `onPointerMissed` handler from Canvas
- Removed `onDiscHover` prop from `<Scene />`
- Removed `glitch={discHovered}` prop from `<TitleOverlay />` (defaults to no glitch)

## Deviations from Plan

None — plan executed exactly as written. IdentityDisc.jsx is untouched and preserved at `src/components/3D/IdentityDisc.jsx`.

## Verification

- `npm run build` succeeds (no errors, only expected chunk size warning)
- `grep -c "IdentityDisc" src/components/Scene.jsx` returns `0`
- `grep -c "discHovered" src/App.jsx` returns `0`
- `test -f src/components/3D/IdentityDisc.jsx` confirms file preserved
