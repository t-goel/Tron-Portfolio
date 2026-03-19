---
phase: 04-sector-dives-finish
plan: "01"
subsystem: sector-navigation
tags: [navigation, camera, gsap, overlay, three-js, zustand]
dependency_graph:
  requires: [03-grid-world]
  provides: [sector-navigation-infrastructure, projects-sector-overlay, monolith-3d]
  affects: [src/App.jsx, src/components/Scene.jsx, src/store/appState.js]
tech_stack:
  added: []
  patterns: [gsap-camera-lerp, pointer-events-pass-through-overlay, zustand-transitioning-guard]
key_files:
  created:
    - src/components/3D/CameraController.jsx
    - src/components/3D/Monolith.jsx
    - src/components/UI/ProjectsSector.jsx
  modified:
    - src/store/appState.js
    - src/components/3D/GatewayPane.jsx
    - src/components/3D/GatewayPanes.jsx
    - src/components/Scene.jsx
    - src/App.jsx
decisions:
  - "CameraController unmounts OrbitControls during sector view via activeSector guard in Scene.jsx — avoids control/GSAP tween conflicts"
  - "Outer ProjectsSector container uses pointerEvents:none so Monolith hover passes through to canvas; inner wrapper re-enables auto for card interactivity"
  - "transitioning flag in Zustand prevents double-fire on rapid pane clicks during GSAP lerp"
  - "HUD disc click checks activeSector first — returns to grid if in sector, goes to title screen otherwise"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_changed: 8
---

# Phase 4 Plan 01: Sector Navigation Infrastructure + Projects Sector Summary

**One-liner:** GSAP camera lerp via CameraController, pane click dispatch with transitioning guard, and full-viewport ProjectsSector overlay with pointer-events pass-through for Monolith hover.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sector navigation infrastructure | 696cd7f | appState.js, CameraController.jsx, GatewayPane.jsx, GatewayPanes.jsx, Scene.jsx, App.jsx, ProjectsSector.jsx |
| 2 | ProjectsSector overlay + Monolith 3D component | 95dc176 | Monolith.jsx, Scene.jsx |

## What Was Built

### Sector Navigation Infrastructure (Task 1)

**Zustand store** (`src/store/appState.js`): Added `transitioning: false` and `setTransitioning` action to prevent double-fire during camera animation.

**CameraController** (`src/components/3D/CameraController.jsx`): R3F component that renders null. Watches `activeSector` via useEffect, kills existing GSAP tweens, and lerps `camera.position` to sector target positions over 1.0s with `power2.inOut` easing. Returns camera to `[0, 8, 14]` when activeSector is null.

**GatewayPane** (`src/components/3D/GatewayPane.jsx`): Added `onPaneClick` prop and `onPointerDown` handler with `stopPropagation`.

**GatewayPanes** (`src/components/3D/GatewayPanes.jsx`): Added `LABEL_TO_SECTOR` mapping, `setActiveSector` dispatch, transitioning guard on click, and GSAP opacity fade-out/fade-in tween on all pane materials when `activeSector` changes.

**Scene.jsx**: CameraController mounted inside Canvas for phase >= 3. OrbitControls conditionally unmounted when `activeSector` is truthy — prevents control/GSAP conflict.

**App.jsx**: Added `ProjectsSector` import and conditional render for `activeSector === 'projects'`. Placeholder divs for about/skills. HUD disc click updated to return to grid when in sector, go to title screen otherwise.

### Projects Sector Overlay (Task 1 + Task 2)

**ProjectsSector** (`src/components/UI/ProjectsSector.jsx`): Full-viewport scrollable overlay driven from `projects.js`. Fade-in via `requestAnimationFrame` + opacity CSS transition. Two-layer pointer-events architecture:
- Outer container: `pointerEvents: 'none'` — lets R3F canvas receive Monolith hover events through the backdrop
- Inner content wrapper: `pointerEvents: 'auto'` — card clicks, link clicks, and scroll remain interactive

Each project card renders: TR2N project name, Roboto Mono tagline, cyan tech pill tags, `IN PROGRESS` badge (crimson) for active projects, `VIEW ON GITHUB ↗` link with hover glow.

**Monolith** (`src/components/3D/Monolith.jsx`): BoxGeometry (1.5 × 3 × 0.3) with dark metallic material, emissive accent color, and EdgesGeometry wireframe overlay. useFrame lerp handles hover bob (sin wave on Y) and emissiveIntensity 0.3 → 0.8 on hover.

**Scene.jsx**: Monoliths conditionally rendered for `activeSector === 'projects'`, positions driven from `projects.js` data.

## Deviations from Plan

None — plan executed exactly as written. ProjectsSector was created as part of Task 1's build verification requirement (App.jsx imports it), which aligned naturally with Task 2's primary deliverable.

## Self-Check: PASSED

All key files exist. Both commits (696cd7f, 95dc176) verified in git log. Build succeeds with exit code 0.
