# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Phase-Based State Machine with Three.js/WebGL Rendering

**Key Characteristics:**
- Single-page application driven by phase state machine (not traditional routes)
- Zustand-based global state management for phase, UI visibility, and sectors
- React Three Fiber canvas-first architecture with overlay UI layer
- Data-driven content configuration separated from presentation logic
- Temporal phase progression with interactive state transitions

## Layers

**State Management:**
- Purpose: Centralized phase and UI state store
- Location: `src/store/appState.js`
- Contains: Phase constants, audio toggles, HUD visibility, active sector tracking
- Depends on: Zustand (external library)
- Used by: All components that need phase/UI context

**3D Rendering Layer:**
- Purpose: Three.js/React Three Fiber canvas with 3D scene graph
- Location: `src/components/Scene.jsx` (orchestrator), `src/components/3D/` (components)
- Contains: IdentityDisc (main interactive element), lighting, postprocessing effects
- Depends on: @react-three/fiber, @react-three/drei, @react-three/postprocessing, three.js
- Used by: App.jsx (renders into Canvas element)

**UI Overlay Layer:**
- Purpose: 2D DOM overlays above the WebGL canvas (HUD, titles, text)
- Location: `src/components/UI/` (overlay components)
- Contains: TitleOverlay with glitch effects, future: modals, menus, text displays
- Depends on: React state, CSS inline styling, Tailwind
- Used by: App.jsx (sibling to Canvas)

**Data Configuration Layer:**
- Purpose: Static content definitions (portfolio data, never rendered directly)
- Location: `src/data/` (projects.js, skills.js, contact.js)
- Contains: Object arrays/dicts with project metadata, skill categories, contact info
- Depends on: Nothing (pure data exports)
- Used by: Future phase components will consume and render this data

**Styling:**
- Purpose: Global styles, design system tokens, font definitions
- Location: `src/index.css`
- Contains: CSS variables (color palette), Tailwind import, @font-face declarations, global resets
- Depends on: Tailwind CSS, custom fonts (Tron-JOAa.ttf)
- Used by: All components via class names and CSS variables

## Data Flow

**Phase Transition:**

1. User hovers over or clicks IdentityDisc in `src/components/3D/IdentityDisc.jsx`
2. Click handler calls `setPhase(3)` via `useAppState` hook
3. Zustand updates phase state globally
4. `Scene.jsx` re-renders, conditionally showing different phase components
5. UI overlays respond to phase changes (TitleOverlay glitch effect triggered by disc hover via `onDiscHover` prop)

**Hover Effect Flow:**

1. IdentityDisc tracks hover state in local `useState(false)` (hovered)
2. On pointer enter/leave, calls `onHoverChange(true/false)` callback to parent
3. App.jsx receives callback and passes to TitleOverlay as `glitch` prop
4. TitleOverlay monitors glitch state via useEffect, triggers text scramble animation
5. Animation uses interval-based character substitution, auto-resets after 15 cycles

**Interactive Particle System:**

1. IdentityDisc initializes 150 particles with random positions and velocities
2. useFrame hook runs every frame (60 FPS target)
3. On hover: particles shoot outward along their velocity vectors
4. On unhover: particles lerp back to center ring positions
5. Particles reset when distance exceeds 7 units, preventing unbounded growth

**State Persistence:**

- Phase transitions are transient (updated in Zustand, no localStorage yet)
- Audio toggle state stored in Zustand, persists during session
- Sector navigation (about/skills/projects) tracked but phases not yet implemented

## Key Abstractions

**IdentityDisc:**
- Purpose: Central interactive 3D element representing user identity
- Location: `src/components/3D/IdentityDisc.jsx`
- Pattern: Procedural canvas texture generation + Three.js geometry assembly
- Key features:
  - Procedurally generated disc face texture (concentric rings, tick marks, gradients)
  - Multiple emissive 3D torus rings for visual depth
  - Particle system for hover feedback
  - Grid floor that reveals on hover
  - Smooth rotation with hover boost
  - All animations via useFrame (not GSAP yet, but planned)

**Scene Orchestrator:**
- Purpose: Canvas setup and phase-conditional rendering
- Location: `src/components/Scene.jsx`
- Pattern: Conditional rendering based on phase state
- Lighting setup (ambient + two point lights with red/white colors)
- Bloom and Vignette postprocessing via EffectComposer

**Zustand Store (useAppState):**
- Purpose: Single source of truth for application state
- Location: `src/store/appState.js`
- Pattern: Functional store with setter methods
- Subscribable by any component without prop drilling
- Reducers: `setPhase`, `toggleAudio`, `setHudVisible`, `setActiveSector`

**TitleOverlay:**
- Purpose: Text UI with glitch effect feedback
- Location: `src/components/UI/TitleOverlay.jsx`
- Pattern: Stateful text manipulation with interval-based animation
- Uses GLITCH_CHARS constant for character substitution
- Lifecycle: useEffect manages interval, cleans up on unmount

**Data Exports:**
- Purpose: Portfolio content configuration
- Location: `src/data/{projects,skills,contact}.js`
- Pattern: Array/object exports with standardized field schemas
- Projects: id, name, tagline, techStack, accentColor, githubUrl, position
- Skills: id, label, color, skills array (nested categories)
- Contact: github, linkedin, email

## Entry Points

**Application Root:**
- Location: `src/main.jsx`
- Triggers: Browser page load, Vite dev server serves index.html
- Responsibilities: Mounts React app to DOM #root element

**App Component:**
- Location: `src/App.jsx`
- Triggers: React initialization
- Responsibilities:
  - Creates full-screen div container (100vw × 100vh, black background)
  - Initializes React Three Fiber Canvas with camera (fov 60, z=8)
  - Renders Scene (3D content) and TitleOverlay (2D UI)
  - Manages disc hover state for UI feedback
  - Configures renderer settings (antialias, alpha, device pixel ratio)

**Scene Component:**
- Location: `src/components/Scene.jsx`
- Triggers: Render pass from App.jsx Canvas
- Responsibilities:
  - Reads phase state from Zustand
  - Conditionally renders phase-specific components
  - Sets up lighting (ambient + point lights)
  - Applies postprocessing effects (Bloom, Vignette)

## Error Handling

**Strategy:** Not yet implemented; codebase is pre-implementation scaffold

**Planned approach (from SPEC.md context):**
- WebGL unavailability detection with fallback message
- Error boundary for React components (future)
- Graceful mobile degradation (<768px: disable OrbitControls, stack panes)

## Cross-Cutting Concerns

**Logging:** Not implemented; console.log available if needed

**Validation:** Not implemented; data files assume valid structure

**Authentication:** Not applicable (portfolio is public)

**Performance Optimization:**
- Procedural texture generation (done once, cached with useMemo)
- Particle system uses BufferGeometry + direct array mutation for efficiency
- Grid lines generated with single LineSegments geometry (instancing via point array)
- useFrame hook throttles delta to max 0.05s to prevent large jumps
- Hover lerping uses smooth easing (dt-based blending) rather than instant changes

---

*Architecture analysis: 2026-03-17*
