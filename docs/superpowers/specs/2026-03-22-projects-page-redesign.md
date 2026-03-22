# Projects Page Redesign

**Date:** 2026-03-22
**Status:** Approved

## Overview

Redesign `ProjectsSector.jsx` from its current left-border card list into a terminal data-readout aesthetic — a full-screen overlay where projects are displayed as indexed log entries revealed by a cyan scan bar animation on mount.

## Layout

- Same overlay container as current: `position: fixed`, `inset: 0`, blurred dark backdrop (`rgba(0,0,0,0.85)`, `backdropFilter: blur(8px)`), scrollable inner wrapper
- Single column, `maxWidth: 720px`, centered, `padding: 32px 16px`
- Column header row at the top: `ID / NAME` left, `STACK / STATUS` right — small caps, dim cyan, separated from rows by a thin border

## Entry Animation

1. A cyan scan bar (3px tall, horizontal glow gradient) sweeps top-to-bottom over ~1.4s (`cubic-bezier(0.4,0,0.6,1)`) with a brief delay on mount
2. The column header fades in just before the bar starts (~0.3s delay)
3. Each project row starts at `opacity: 0` and becomes visible as the scan bar passes — staggered by ~300ms per row:
   - Row 1 (project 03): ~0.45s delay
   - Row 2 (project 02): ~0.75s delay
   - Row 3 (project 01): ~1.05s delay
4. Animation plays once on mount via CSS `@keyframes` — no replay trigger

## Per-Row Content

Each row contains (top to bottom):

- **Index line:** `03 >` prefix (dim cyan, small) + project name (large spaced caps, `#F0F0F0`, `letter-spacing: 0.25em`) on the left; status badge flush right
  - Active project: `● IN PROGRESS` in Crimson Red (`#FF0000`)
  - Completed: `✓ COMPLETE` in dim cyan (`rgba(0,255,255,0.5)`)
- **Tagline:** small Roboto Mono, muted (`rgba(240,240,240,0.55)`)
- **Tech stack pills:** same as current — cyan bordered, `rgba(0,255,255,0.05)` background, `rgba(0,255,255,0.8)` text
- **GitHub link:** `VIEW ON GITHUB ↗`, dim cyan at rest, full cyan glow on hover
- Rows separated by a faint horizontal rule (`rgba(0,255,255,0.08)`)

Projects are ordered active-first (03 → 02 → 01).

## Data

No changes to `src/data/projects.js`. All fields used (`name`, `tagline`, `techStack`, `githubUrl`, `active`) are already present.

## Implementation Scope

- **File modified:** `src/components/UI/ProjectsSector.jsx` — full rewrite in-place
- **Files unchanged:** `src/data/projects.js`, `src/App.jsx`, `src/components/Scene.jsx`
- Scan bar and row reveals are pure CSS `@keyframes` + `animation-delay`, no JS timers
- The existing `opacity` fade-in on mount (`visible` state via `requestAnimationFrame`) is retained for the overall overlay

## What Is Removed

- Left-border accent stripe per project
- Large `clamp`-sized project name (replaced by fixed terminal-scale sizing)
- Absolute-positioned `IN PROGRESS` badge (replaced by inline status on the index line)
