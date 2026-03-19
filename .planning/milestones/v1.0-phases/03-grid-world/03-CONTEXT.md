# Phase 3: Grid World - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Three holographic gateway panes render in triangle formation on the illuminated grid, the camera orbits freely via OrbitControls, all panes Y-axis billboard to face the camera, each pane displays a chaotic idle surface texture, and hovering a pane triggers the text decrypt reveal plus a grid light pulse. Clicking a pane (navigation to sectors) is Phase 4 scope.

</domain>

<decisions>
## Implementation Decisions

### Pane Geometry & Triangle Formation
- Three panes arranged in equilateral triangle: one front-center (facing camera default), two at rear-left and rear-right (~120° intervals)
- Formation radius: ~8 Three.js units from world center (so all three are always visible in the default camera view)
- Pane dimensions: ~5 units wide × 3.5 units tall (portrait-ish rectangle that reads clearly at distance)
- Pane material: MeshStandardMaterial with `transparent: true`, opacity ~0.15–0.25 (glass holographic feel), cyan emissive border using EdgesGeometry + LineSegments overlay
- Panes rise from grid floor at phase entry: start below grid (y = -5), lerp/GSAP up to final position (y = 1.5) over 1.5s

[auto] Triangle formation — recommended default

### Surface Texture Technique (Idle State)
- Canvas 2D `CanvasTexture` updated in `useFrame` — same pattern used in BootSequence
- Each pane gets its own offscreen `<canvas>` (240×160px texture resolution)
- Idle animation: fill black, draw random hex/ASCII characters in 8×8 grid pattern, random Neon Cyan / dim white colors, update 6–8 times per second (throttled in useFrame via elapsed time check)
- Additionally: draw faint random line segments to simulate "chaotic 2D wireframe art" per spec
- Each pane has a unique seed/style for its idle texture (different character density, line angles)
- CanvasTexture marked `.needsUpdate = true` on each redraw cycle

[auto] Canvas 2D CanvasTexture — recommended default (consistent with existing BootSequence canvas pattern)

### Hover Decrypt Animation
- On `onPointerEnter`: start decrypt transition — same Canvas 2D texture pipeline as idle
- Decrypt logic: maintain `decryptProgress` (0→1 over ~1.2s). Each frame, for each character cell:
  - If `cellProgress < decryptProgress`: draw the correct label character (fixed, styled in TR2N/Roboto Mono)
  - Else: draw a random hex/ASCII character (still animating)
- Final revealed state shows pane label centered: `>_ ABOUT_ME`, `>_ SKILLS`, `>_ PROJECTS` in large Neon Cyan
- Background wireframe lines "snap" to a clean symmetric crosshatch pattern once progress > 0.8
- On `onPointerLeave`: reverse — re-scramble characters back to random state over 0.6s

[auto] Canvas texture decrypt cycling — recommended default

### Grid Light Pulse
- On pane hover enter: spawn a `THREE.RingGeometry` (or expanding `THREE.CircleGeometry` outline) at the pane's XZ base position on the grid (y = -3)
- Ring starts at radius 0.5, expands to radius 5 over ~0.8s, opacity fades 0.8 → 0
- Rendered as `lineLoop` or `mesh` with `MeshBasicMaterial`, color `#00FFFF`, `transparent: true`
- Implemented as a pool of 3 ring refs (one per pane), animated in `useFrame` when active
- Multiple pulses can be queued (if user quickly hovers same pane twice, second pulse fires when first is ~50% done)

[auto] Expanding LineSegments/RingGeometry — recommended default (pure Three.js, no shader complexity)

### Camera & OrbitControls
- Default camera position: `[0, 8, 14]` — elevated enough to see panes rising from grid, not so high it feels top-down
- Camera looks at `[0, 1, 0]` (slightly above grid center, toward panes)
- OrbitControls: `enablePan: false` (no lateral panning, camera stays centered on pane triangle)
- OrbitControls: `maxPolarAngle: Math.PI / 2.1` — camera cannot go below the grid horizon
- OrbitControls: `minDistance: 6`, `maxDistance: 22` — can zoom in close to panes but not through them
- OrbitControls: `enableDamping: true`, `dampingFactor: 0.05` for smooth inertia
- OrbitControls renders only when `phase >= 3`

[auto] Camera y=8 z=14 with clamped OrbitControls — recommended default

### Billboarding
- Each pane uses `useFrame` with `mesh.lookAt(camera.position)` — restricted to Y-axis only
- Implementation: `mesh.rotation.y = Math.atan2(camera.position.x - mesh.position.x, camera.position.z - mesh.position.z)`
- This ensures the face always points toward the camera without tilting on X/Z axes

### Performance (NFR-03)
- Canvas textures: throttled to ~8 fps updates (check elapsed time delta in useFrame, only redraw if >125ms since last draw)
- Ring pulses: simple geometry, ≤3 active at once — negligible draw calls
- Panes: 3 standard meshes + 3 edge overlays = 6 draw calls — well within budget
- OrbitControls with damping: no additional perf cost

### Claude's Discretion
- Exact idle character set for ASCII/hex streams (hex digits, box-drawing chars, binary, etc.)
- Precise opacity and emissive color values for glass pane material
- Whether to use `drei/<Billboard>` or manual lookAt for billboard behavior (whichever integrates more cleanly with existing R3F patterns)
- Exact triangle formation rotation angle at start (which pane faces front-center — Projects is the most prominent, good candidate)
- Timing curve for pane rise animation (ease.out or power2.out feel natural for rising)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 3 Requirements
- `.planning/REQUIREMENTS.md` §Grid World — GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, NFR-03 requirements
- `.planning/ROADMAP.md` §Phase 3 — Goal, success criteria, plan breakdown (03-01, 03-02)
- `SPEC.md` §FR4 — FR4.1 through FR4.5 (gateway panes, orbital nav, billboarding, idle/hover states)

### Existing Code to Read First
- `src/components/3D/GridFloor.jsx` — Already implemented; pane components must co-exist with this. Pane base pulse rings should be positioned at same Y (-3) as GridFloor.
- `src/components/Scene.jsx` — Where new 3D components (GatewayPane, OrbitControls) will be added with `phase >= 3` guard
- `src/App.jsx` — Camera is set here on the `<Canvas>` element; may need to be adjusted or moved to Scene.jsx for OrbitControls to control it
- `src/store/appState.js` — `activeSector` state already exists for Phase 4 pane-click behavior; Phase 3 hover state is local only (no global state needed)
- `src/components/UI/BootSequence.jsx` — Reference implementation for Canvas 2D texture animation pattern used in idle/hover surface texture

### Design System
- `src/index.css` — CSS variables for `--color-cyan`, `--color-crimson`, `--color-void`; pattern for R3F components using Tron colors

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/3D/GridFloor.jsx`: Fully implemented, renders at y=-3 when phase >= 3. Pane pulse rings must match this Y position.
- `src/store/appState.js`: `activeSector` and `setActiveSector` ready for Phase 4 pane-click — Phase 3 does NOT call these (hover only)
- `src/components/UI/BootSequence.jsx`: Canvas 2D pattern — reference for requestAnimationFrame-style texture updates. Phase 3 canvas textures should use the same `elapsed time` throttling pattern.
- Zustand `useFrame` selector pattern established in all existing 3D components.

### Established Patterns
- Phase-conditional 3D: `{phase >= 3 && <Component />}` in Scene.jsx — new GatewayPane components follow this pattern
- Canvas 2D on DOM: BootSequence uses full-viewport canvas. Pane textures use CanvasTexture (offscreen canvas → Three.js texture), NOT DOM canvas.
- `useRef` + `useFrame`: GridFloor uses this for opacity animation — same pattern for pane rise animation and ring pulse
- Drei available: OrbitControls from `@react-three/drei` — already in dependencies (CLAUDE.md stack confirms Drei)

### Integration Points
- `src/components/Scene.jsx`: Add `<OrbitControls>` and `<GatewayPanes>` (or three individual `<GatewayPane>`) when phase >= 3
- `src/App.jsx` Canvas `camera` prop: Currently `{ position: [0, 0, 8], fov: 60 }` — needs to be updated to `{ position: [0, 8, 14], fov: 60 }` for Phase 3 default view. Consider moving camera control to Scene.jsx `useThree` hook for cleaner management.
- OrbitControls `target`: Set to `[0, 1, 0]` to keep pane triangle as focal center

</code_context>

<specifics>
## Specific Ideas

- "Prioritize speed and ease of access to projects" (from CLAUDE.md note + Phase 2 deferred) — this applies to the pane hover/click UX. Hover state should feel snappy (decrypt starts immediately on hover, not after a delay). Panes should be large enough to click easily. This note is primarily about Phase 4 sector navigation patterns — noted and deferred there.
- The idle texture should feel alive and "powered up" — not just static noise. The hex streams should scroll/drift downward slowly, like a Matrix-style data feed but more geometric.
- The three panes should feel like portals waiting to be opened — the idle chaos should feel deliberately contained by the pane frame, as if the content is barely held back.

</specifics>

<deferred>
## Deferred Ideas

- **"Normal webpage/browser scroll" for projects** (from CLAUDE.md note + Phase 2 deferred): User wants speed and ease of access to projects. This suggests evaluating whether the Phase 4 Projects sector uses 3D monolith click-through or a simpler scroll/overlay. Capture for Phase 4 context discussion.
- **Sector fly-through camera animation**: The SPEC defines camera lerping *through* a pane as the sector entry transition — this is Phase 4 scope.
- **Full NAV-02 camera lerp** (Phase 4 → Grid World return): Top-left HUD click triggers high-speed reverse camera lerp — Phase 4 scope.
- **Mobile degradation for Grid World** (<768px: disable OrbitControls, stack panes vertically in 2D overlay) — Phase 4 scope.

</deferred>

---

*Phase: 03-grid-world*
*Context gathered: 2026-03-18 (--auto mode)*
