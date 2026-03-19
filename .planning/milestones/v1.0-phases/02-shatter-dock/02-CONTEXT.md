# Phase 2: Shatter & Dock - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Clicking "ENTER THE GRID" triggers the disc dock animation, permanently illuminates the grid, and establishes the persistent HUD shell (disc home button, social icons, mute toggle) that remains visible through all subsequent phases. Camera movement and OrbitControls are NOT in scope — those arrive in Phase 3 (Grid World). This phase delivers the transition and the navigation layer.

</domain>

<decisions>
## Implementation Decisions

### Disc Dock Animation
- The 3D IdentityDisc is **NOT on screen during Phase 2** (removed in quick task 260317-rg5). There is nothing to fade out.
- At the start of the Phase 3 transition, a **DOM-based CSS disc appears at viewport center** (created fresh, not faded from a 3D element)
- DOM disc: a circular div styled with Crimson Red glow (border + box-shadow, matching IdentityDisc visual language) — NOT a Canvas or Three.js element
- GSAP animates the DOM disc from viewport center to top-left corner: `gsap.to(domDiscRef, { top: '24px', left: '24px', scale: 0.35, duration: 1.2, ease: 'power2.inOut' })`
- Once GSAP animation completes: DOM disc becomes permanent HUD element, `setHudVisible(true)` is called
- "TANMAY GOEL" text snaps in beside the docked disc via CSS opacity transition (0 → 1) with 200ms delay after dock completes

### Grid Illumination
- New dedicated `src/components/3D/GridFloor.jsx` component — does NOT reuse IdentityDisc's hover grid
- Geometry: LineSegments with BufferGeometry, 80×80 units on XZ plane, 1-unit spacing (80 lines each axis = 160 line segments)
- Material: `LineBasicMaterial` with `color: '#00FFFF'` and `transparent: true`, opacity animated from 0 → 0.6 over 2s during dock transition
- Bloom-reactive: line color `#00FFFF` at emissiveIntensity equivalent — the cyan color above Bloom threshold (0.2) produces cyan halos at horizon
- Grid illuminates concurrent with disc dock animation (not after) — immediate visual payoff
- GridFloor renders when `phase >= 3` in Scene.jsx

### HUD Architecture — Top-Left
- Fixed-position DOM div in App.jsx (sibling to Canvas, consistent with TitleOverlay pattern)
- Renders when `hudVisible === true` (from Zustand state)
- Structure: `<div className="hud-home">` containing:
  - CSS disc circle (40×40px, crimson border + box-shadow glow, slow rotation via CSS animation)
  - `<span>TANMAY GOEL</span>` in TR2N font, Crimson Red, beside the disc
- Clickable: `onClick={() => setPhase(2)}` — returns to main screen (full NAV-02 camera lerp handled in Phase 3)
- Positioned: `top: 24px, left: 24px` (fixed)

### HUD Architecture — Bottom-Right
- Fixed-position DOM div in App.jsx, `bottom: 24px, right: 24px`
- Renders when `hudVisible === true`
- Contains two sub-components:
  1. **MuteToggle**: speaker SVG icon (on/off state), Neon Cyan glow, toggles `audioEnabled` via `toggleAudio()` Zustand action — satisfies AUDIO-02
  2. **SocialIcons**: three circular anchor links (GitHub, LinkedIn, Email), stacked vertically with 12px gap, 44×44px each, Neon Cyan border + box-shadow glow, SVG icons inside
- Social icon URLs imported from `src/data/contact.js`

### Phase Transition Sequence
- `EnterButton` click → `setPhase(3)` called
- `TitleOverlay` + `EnterButton` unmount (App.jsx already conditions on `phase === 2`)
- Scene.jsx mounts `GridFloor` and begins opacity animation (concurrent)
- A DOM disc element appears at viewport center and GSAP animates it to top-left over 1.2s (IdentityDisc is NOT mounted during Phase 2 and does NOT trigger this animation)
- On GSAP complete: `setHudVisible(true)`, DOM disc becomes the permanent HUD home button

### Social Icon Content
- GitHub: link to `contact.github` from `src/data/contact.js`
- LinkedIn: link to `contact.linkedin`
- Email: `mailto:` link to `contact.email`
- All open in new tab (`target="_blank"`, `rel="noopener noreferrer"`)
- Hover state: icon scale 1.1, glow intensifies (CSS transition)

### Claude's Discretion
- Exact GSAP easing curve for disc wind-down (power2.inOut is the starting point)
- CSS animation for the idle rotation of the HUD disc (keyframes at 0° → 360°, 8s linear infinite)
- Exact grid line opacity (target ~0.6, adjust for visual clarity)
- SVG icon choice for speaker mute/unmute states

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 Requirements
- `.planning/REQUIREMENTS.md` §Shatter & Dock — DOCK-01, DOCK-02, DOCK-03, DOCK-04, AUDIO-02, NAV-01, NAV-02 requirements
- `.planning/ROADMAP.md` §Phase 2 — Success criteria, plan breakdown (02-01, 02-02)

### Existing Code to Read First
- `src/App.jsx` — DOM structure, Canvas setup, phase-conditional rendering, TitleOverlay wiring; HUD divs will be added here
- `src/store/appState.js` — Phase constants, `hudVisible`/`setHudVisible`, `toggleAudio` — all used in Phase 2
- `src/components/Scene.jsx` — Where GridFloor and phase-conditional 3D components are added
- `src/components/3D/IdentityDisc.jsx` — **NOT mounted during Phase 2** (removed in quick task 260317-rg5). It may be re-mounted later for the docked HUD state or replaced entirely by the CSS disc. Do not assume it is on screen at Phase 2 start.
- `src/components/UI/EnterButton.jsx` — The trigger; already calls `setPhase(3)` — no changes needed
- `src/data/contact.js` — Social icon URLs; read schema before creating SocialIcons component

### Design System
- `src/index.css` — CSS variables (`--color-cyan: #00FFFF`, `--color-crimson: #FF0000`, `--color-void: #000`, `--font-tron`) for HUD styling

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/utils/audioManager.js`: `setMuted()` already exists — MuteToggle reads `audioEnabled` from Zustand and calls `toggleAudio()` action; audioManager.js auto-syncs via the subscribe in App.jsx
- `src/store/appState.js`: `hudVisible`, `setHudVisible`, `toggleAudio`, `audioEnabled` — all ready to use, no store changes needed
- `src/components/Scene.jsx`: GridFloor added here with `phase >= 3` guard, following same pattern as future components

### Established Patterns
- DOM overlay: fixed absolute divs in App.jsx (TitleOverlay, BootSequence) — HUD follows this pattern exactly
- Phase-conditional 3D: `{phase === N && <Component />}` in Scene.jsx — GridFloor uses `phase >= 3`
- Zustand subscription: `useAppState((s) => s.hudVisible)` selector pattern
- CSS variables: use `var(--color-cyan)` and `var(--color-crimson)` in HUD styles

### Integration Points
- `App.jsx`: Add HUD div (top-left) and social/mute div (bottom-right) as siblings to Canvas, conditionally rendered on `hudVisible`
- `Scene.jsx`: Add `<GridFloor />` inside the Canvas when phase >= 3
- `IdentityDisc.jsx`: Add `useEffect` on `phase` — when phase becomes 3, start fade-out sequence and dispatch DOM disc animation start (via a ref or event)
- GSAP: import from `gsap` (already in package.json per CLAUDE.md stack), use on DOM refs

</code_context>

<specifics>
## Specific Ideas

- The disc dock animation should feel like the disc is being "called" to its home position — not just moving, but spinning down like a landing disc
- CSS HUD disc should maintain a slow 8s rotation to show it's still "alive" even when docked
- Social icons should feel like Tron circuit nodes — circular, glowing, minimal

</specifics>

<deferred>
## Deferred Ideas

- **CLAUDE.md note (user's pending idea):** "Prioritize speed and ease of access to projects. Maybe make the projects a normal webpage/browser scroll" — this is a Phase 3/4 architectural consideration about the sector navigation pattern. Captured here for discussion before Phase 3 planning.
- OrbitControls and isometric camera — Phase 3 (Grid World)
- Full NAV-02 camera lerp (sector→grid return) — Phase 3
- Mobile degradation for grid world — Phase 4

</deferred>

---

*Phase: 02-shatter-dock*
*Context gathered: 2026-03-18 (--auto mode)*
