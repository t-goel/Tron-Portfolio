# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Project Overview

Tron-themed 3D personal portfolio SPA ("Digital Dominion"). WebGL-heavy, immersive single-page app showcasing developer skills, projects, and background. See SPEC.md for full product requirements.

**Status:** Active development — Phase 1 complete, Phase 2+ in planning.

## Tech Stack

- **Framework:** React + Vite (JSX, not TypeScript)
- **3D:** Three.js + React Three Fiber (R3F) + @react-three/drei + @react-three/postprocessing
- **Animation:** GSAP (camera/UI transitions, lerps)
- **State:** Zustand (global app state: phase, camera, audio, UI)
- **Styling:** Tailwind CSS + CSS Modules for component-scoped styles
- **Audio:** Howler.js (background music, looping)
- **Data Viz:** HTML Canvas 2D (skills network graph)
- **Deployment:** Vercel (static SPA)

## Build & Dev Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # production build
npm run preview      # preview production build locally
```

## Architecture

### Phase-Based State Machine

The app uses phases instead of routes, managed via Zustand store (`src/store/appState.js`):

1. **Boot Sequence** — Loading screen with light-cycle animation
2. **Main Hub (Title Screen)** — Title text with "ENTER THE GRID" CTA button
3. **Shatter & Dock** — Grid powers on, nav HUD appears with docked disc icon
4. **Grid World** — 3D isometric grid with three gateway panes (About, Skills, Projects)
5. **Sector Dives** — Content views (terminal bio, network graph, 3D monoliths)

### Data-Driven Content

All content lives in config files under `src/data/` — projects, skills, contact info are not hardcoded in components.

### Key Directories

- `src/components/phases/` — One component per phase
- `src/components/3D/` — Reusable Three.js/R3F components (Grid, Panes, Monoliths; IdentityDisc preserved for HUD nav)
- `src/components/UI/` — 2D overlay HUD elements
- `src/data/` — Content config files (projects.js, skills.js, contact.js)
- `src/store/` — Zustand state store

## Design System

- **Colors:** Void Black (#000), Neon Cyan (#00FFFF), Neon Orange (#FF5E00), Crimson Red (#FF0000), Off-White (#F0F0F0)
- **Fonts:** TR2N (Tron-JOAa.ttf) for headers, Roboto Mono for terminal/body text

## Performance Targets

- 60 FPS on modern browsers (use instancing for grid lines/particles)
- <3 second initial load
- Mobile graceful degradation (<768px: no OrbitControls, stack panes vertically)
- WebGL fallback: detect unavailability and show styled error with contact links
