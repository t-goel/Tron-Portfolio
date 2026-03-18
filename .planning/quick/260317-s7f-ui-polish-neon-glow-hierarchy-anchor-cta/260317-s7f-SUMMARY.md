---
phase: quick
plan: 260317-s7f
subsystem: UI
tags: [ui-polish, layout, neon, typography, hierarchy]
dependency_graph:
  requires: []
  provides: [centered-title-stack, neon-name-effect, thick-button-border]
  affects: [src/components/UI/TitleOverlay.jsx, src/components/UI/EnterButton.jsx, src/App.jsx]
tech_stack:
  added: []
  patterns: [flex-column-children-slot, layered-text-shadow-neon, component-composition]
key_files:
  created: []
  modified:
    - src/components/UI/TitleOverlay.jsx
    - src/components/UI/EnterButton.jsx
    - src/App.jsx
decisions:
  - "TitleOverlay uses a single centered flex column instead of two absolutely-positioned elements — cleaner layout and trivially extensible via children slot"
  - "Layered textShadow with 8 stops (white core -> red bleed) produces authentic neon tube effect matching design system"
  - "EnterButton wrapper div removed — positioning responsibility delegated to TitleOverlay parent, single source of layout truth"
metrics:
  duration: 5 min
  completed_date: "2026-03-18T01:21:17Z"
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260317-s7f: UI Polish — Neon Glow Hierarchy + Anchor CTA Summary

**One-liner:** Refactored TitleOverlay into a centered flex-column with a children slot, applied 8-stop layered red neon textShadow to name, and thickened EnterButton border to 2px — grouping all three elements into a single cohesive vertical stack.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Restructure TitleOverlay as centered flex stack with neon name effect | db2943b | TitleOverlay.jsx |
| 2 | Update EnterButton border and remove self-positioning, nest in TitleOverlay | db2943b | EnterButton.jsx, App.jsx |

## Changes Made

### TitleOverlay.jsx
- Outer div: changed from `top:0 left:0 width:100% height:100%` full-screen overlay to `top:50% left:50% transform:translateX(-50%) translateY(-50%)` centered container
- Layout: `display:flex flexDirection:column alignItems:center`
- h1: removed `position:absolute top:12% left:50% transform:translateX(-50%)` — now a static flex child
- h1 color: `#FF0000` → `#FFE8E8` (pale pink-white core)
- h1 textShadow: replaced 2-stop glow with 8-stop layered neon: `0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #FF0000, 0 0 82px #FF0000, 0 0 92px #FF0000, 0 0 102px #FF0000, 0 0 151px #FF0000`
- p: removed `position:absolute bottom:18%` — now a static flex child with `marginTop:0.5rem`
- Added `children` prop + `<div marginTop:2rem pointerEvents:auto>{children}</div>` slot

### EnterButton.jsx
- Removed outer `position:absolute top:50% left:50% translate(-50%,-50%)` wrapper div
- Button is now the direct return (inside fragment with style tag)
- Border: `1px solid` → `2px solid`

### App.jsx
- Merged two sibling elements into one JSX block: EnterButton rendered as child of TitleOverlay

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/components/UI/TitleOverlay.jsx` exists and modified
- [x] `src/components/UI/EnterButton.jsx` exists and modified
- [x] `src/App.jsx` exists and modified
- [x] Commit db2943b exists
- [x] `npm run build` succeeds with no errors

## Self-Check: PASSED
