---
phase: 06-first-impressions
plan: 01
subsystem: UI/Boot
tags: [boot-sequence, animation, css, audio]
dependency_graph:
  requires: []
  provides: [dark-boot-screen, boot-log-animation]
  affects: [BootSequence.jsx, index.css]
tech_stack:
  added: []
  patterns: [staggered-css-animation, useRef-guard-for-strictmode]
key_files:
  created: []
  modified:
    - src/components/UI/BootSequence.jsx
    - src/index.css
key_decisions:
  - "Replaced 5.8s white shard animation with 3s dark terminal log — faster and on-brand"
  - "Preserved setPhase(2) call at T+800ms to keep TitleOverlay rendering contract intact"
  - "Used CSS animation (bootLineIn) via inline animationDelay per line — no JS timer per line"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-20T21:13:33Z"
  tasks: 2
  files: 2
---

# Phase 06 Plan 01: Dark Terminal Boot Sequence Summary

**One-liner:** Replaced white shard-shatter boot screen with void-black Tron terminal log using staggered cyan bootLineIn CSS animation.

## What Was Built

A full rewrite of `BootSequence.jsx` replacing the white polygon-shard animation (~300 lines of geometry math) with a minimal dark terminal log. The visitor's first frame is now void-black with 7 cyan monospace lines appearing one by one, matching the Tron aesthetic from the very first millisecond.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add bootLineIn keyframe to index.css | ac955b7 | src/index.css |
| 2 | Rewrite BootSequence.jsx as dark terminal boot log | c1fd46e | src/components/UI/BootSequence.jsx |

## Decisions Made

1. **setPhase(2) preserved at T+800ms** — App.jsx's TitleOverlay only renders when `phase >= 2`, so this call must remain even in the new boot sequence.
2. **CSS animation over JS timers for line stagger** — Each boot line uses `animationDelay: ${i * 0.25}s` in inline style rather than scheduling individual setTimeout calls, keeping the component simple.
3. **3000ms total duration vs original 5800ms** — Faster boot sequence; visitors reach the main scene sooner.
4. **useRef guard for StrictMode** — `hasInitialized.current` prevents double-init of audio in React StrictMode dev environment.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/components/UI/BootSequence.jsx` exists and contains `background: '#000'`, `GRID OS v7.2.1`, `color: '#00FFFF'`, `setPhase(2)`, `initAudio`, `playWithFade(2000)`, `onComplete`
- `src/index.css` contains `@keyframes bootLineIn`
- All existing keyframes (crackDraw, loadDot, pivotSwing, pivotDrop, discSpin) still present
- `npm run build` exits with code 0
- Commits ac955b7 and c1fd46e exist
