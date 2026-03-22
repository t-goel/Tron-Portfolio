# Projects Page Redesign

**Date:** 2026-03-22
**Status:** Approved

## Overview

Redesign `ProjectsSector.jsx` from its current left-border card list into a terminal data-readout aesthetic — a full-screen overlay where projects are displayed as indexed log entries revealed by a cyan scan bar animation on mount.

## Layout

- Same overlay container as current: `position: fixed`, `inset: 0`, blurred dark backdrop (`rgba(0,0,0,0.85)`, `backdropFilter: blur(8px)`), scrollable inner wrapper
- Single column, `maxWidth: 720px`, centered, `padding: 32px 16px` (widened from current 680px to give the terminal content more breathing room; 720px stays within the 768px mobile breakpoint with the existing 16px horizontal padding)
- Column header row at the top: `ID / NAME` left, `STACK / STATUS` right — small caps, dim cyan (`rgba(0,255,255,0.25)`), separated from rows by a thin border (`rgba(0,255,255,0.1)`)

## Entry Animation

The scan bar and the row reveals are **two independent CSS animations whose delays are manually tuned to appear synchronized** — there is no JS scroll-link or proximity detection involved.

1. **Scan bar:** A `position: absolute` element (3px tall, full width, cyan horizontal glow gradient) animates `top: 0` → `top: 100%` over 1.4s (`cubic-bezier(0.4,0,0.6,1)`) with a 0.3s mount delay, then fades out. It is purely decorative.
2. **Column header:** Fades in from `opacity: 0` → `1` at 0.3s delay (just as the bar starts).
3. **Row reveals:** Each row starts at `opacity: 0` and fades in via its own `animation-delay`. Delays are hardcoded for the current 3-row dataset and tuned to coincide with when the bar visually passes each row:
   - Row 1 (project 03 — Sylli): 0.45s
   - Row 2 (project 02 — MacroAnalyzer): 0.75s
   - Row 3 (project 01 — Pacman): 1.05s
   - **Note:** If a fourth project is added to `projects.js`, the delay values must be manually extended — the animation is not data-driven.
4. Animation plays once on mount — no replay trigger in production.

**`@keyframes` injection:** Because this component uses inline styles throughout (no CSS modules, no stylesheet), the keyframes are injected via a module-level `<style>` tag inserted into `document.head` once (guarded by a `styleInjected` module flag so HMR remounts don't duplicate it). A single `<style>` block covers all keyframes: `scanDown`, `revealRow`.

## Per-Row Content

Projects are ordered **active-first** in the rendered list (Sylli first), but the **index prefix reflects the project's original data position** in `projects.js` (Sylli is `project-3` → displays as `03 >`). This keeps the numbers stable regardless of sort order.

Each row contains (top to bottom):

- **Index line:** `03 >` prefix (10px, `rgba(0,255,255,0.35)`, `letter-spacing: 0.15em`) + project name (`font-family: 'TR2N'`, large spaced caps, `#F0F0F0`, `letter-spacing: 0.25em`) on the left; status badge flush right:
  - Active: `● IN PROGRESS` in Crimson Red (`#FF0000`)
  - Complete: `✓ COMPLETE` in dim cyan (`rgba(0,255,255,0.5)`)
- **Tagline:** 12px Roboto Mono, `rgba(240,240,240,0.55)`, `line-height: 1.6`
- **Tech stack pills:** cyan bordered (`rgba(0,255,255,0.3)`), `rgba(0,255,255,0.05)` background, `rgba(0,255,255,0.8)` text, 10px Roboto Mono
- **GitHub link:** `VIEW ON GITHUB ↗`, Roboto Mono 11px, `rgba(0,255,255,0.4)` at rest → full `#00FFFF` + `textShadow: 0 0 10px #00FFFF` on hover
- Rows separated by `border-bottom: 1px solid rgba(0,255,255,0.08)`; last row has no border

## Close / Dismiss

Unchanged from current behavior — the overlay is unmounted by the parent state machine (`setActiveSector(null)` via ESC key or the HUD home button in `App.jsx`). No close button is added to the component.

## Data

No changes to `src/data/projects.js`. All required fields (`name`, `tagline`, `techStack`, `githubUrl`, `active`) are already present. The index prefix is derived from the project's `id` field (`'project-3'` → `'03'`).

## Implementation Scope

- **File modified:** `src/components/UI/ProjectsSector.jsx` — full rewrite in-place
- **Files unchanged:** `src/data/projects.js`, `src/App.jsx`, `src/components/Scene.jsx`
- The existing `opacity` fade-in on mount (`visible` state via `requestAnimationFrame`) is retained for the overall overlay

## What Is Removed

- Left-border accent stripe per project
- Large `clamp`-sized project name (replaced by TR2N at a fixed terminal scale)
- Absolute-positioned `IN PROGRESS` badge (replaced by inline status on the index line)
