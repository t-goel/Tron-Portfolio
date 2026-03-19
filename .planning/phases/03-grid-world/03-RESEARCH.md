# Phase 3: Grid World - Research

**Researched:** 2026-03-18
**Domain:** React Three Fiber — OrbitControls, CanvasTexture billboarding, GSAP animation, hover state management
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pane Geometry & Triangle Formation**
- Three panes in equilateral triangle: front-center (0, 1.5, -8), rear-left (-6.93, 1.5, 4), rear-right (6.93, 1.5, 4)
- Formation radius: ~8 Three.js units from world center
- Pane dimensions: ~5 units wide x 3.5 units tall
- Pane material: MeshStandardMaterial transparent: true, opacity ~0.15-0.25, EdgesGeometry + LineSegments border
- Panes rise from y = -5 to y = 1.5 over 1.5s on phase entry

**Surface Texture Technique (Idle State)**
- Canvas 2D CanvasTexture updated in useFrame — same pattern as BootSequence
- 240x160px offscreen canvas per pane
- Idle: fill black, draw random hex/ASCII chars in 8x8 grid, update 6-8 times/sec (throttled >125ms check)
- Random line segments for "chaotic 2D wireframe art"
- Each pane has unique seed/style

**Hover Decrypt Animation**
- onPointerEnter: decryptProgress 0 -> 1 over 1.2s linear
- Left-to-right, top-to-bottom cell reveal order
- Final state: pane label centered in 16px TR2N, color #00FFFF
- Wireframe lines snap to clean crosshatch at progress > 0.8
- onPointerLeave: reverse over 0.6s

**Grid Light Pulse**
- THREE.RingGeometry at pane's XZ base, y = -3 (matches GridFloor Y)
- Radius 0.5 -> 5 over 0.8s, opacity 0.8 -> 0
- Pool of 3 ring refs (one per pane)
- Second pulse fires when first is ~50% done

**Camera & OrbitControls**
- Default camera: position [0, 8, 14], lookAt [0, 1, 0], fov: 60
- enablePan: false
- maxPolarAngle: Math.PI / 2.1
- minDistance: 6, maxDistance: 22
- enableDamping: true, dampingFactor: 0.05
- Active only when phase >= 3

**Billboarding**
- Y-axis only: mesh.rotation.y = Math.atan2(camera.position.x - mesh.position.x, camera.position.z - mesh.position.z)
- Applied every frame in useFrame

**Performance (NFR-03)**
- Canvas textures throttled to ~8 fps (>125ms delta gate)
- Ring pulses: max 3 active simultaneously
- 6 draw calls for panes (3 meshes + 3 edge overlays)

### Claude's Discretion
- Exact idle character set for ASCII/hex streams
- Precise opacity and emissive color values for glass pane material
- Whether to use drei/<Billboard> or manual lookAt (whichever integrates more cleanly)
- Exact triangle formation rotation angle (Projects faces front-center — recommended)
- Timing curve for pane rise animation (ease.out or power2.out)

### Deferred Ideas (OUT OF SCOPE)
- "Normal webpage/browser scroll" for projects — Phase 4 evaluation
- Sector fly-through camera animation — Phase 4 scope
- Full NAV-02 camera lerp on HUD click — Phase 4 scope
- Mobile degradation for Grid World (<768px) — Phase 4 scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRID-01 | Three semi-transparent holographic glass panes labeled >_ ABOUT_ME, >_ SKILLS, >_ PROJECTS in triangle formation rising from grid floor | GatewayPane component with MeshStandardMaterial transparent + EdgesGeometry border; GSAP power2.out rise from y=-5 to y=1.5 |
| GRID-02 | Orbital camera via OrbitControls — full 360° horizontal pan, vertical restricted to prevent seeing under grid | drei OrbitControls with maxPolarAngle: Math.PI/2.1, enablePan: false, enableDamping. Camera update in App.jsx line 69 |
| GRID-03 | All three panes Y-axis billboard to continuously face camera regardless of orbit | Manual atan2 in useFrame OR drei <Billboard lockX lockZ> — both verified available. Manual atan2 recommended for co-location with other useFrame logic |
| GRID-04 | Pane idle state displays chaotic 2D wireframe art and ASCII/hex text streams as surface texture | THREE.CanvasTexture on 240x160 offscreen canvas, throttled useFrame update, needsUpdate flag |
| GRID-05 | Pane hover state — wireframes snap to clean structure, text decrypts to label, light pulse ripples outward | decryptProgress state, THREE.RingGeometry pool of 3, all in single GatewayPane component |
| NFR-03 | WebGL canvas maintains stable 60 FPS; instanced meshes for grid lines and particles | Throttled texture updates (125ms gate), pool pattern for rings, 6 total draw calls for panes |
</phase_requirements>

---

## Summary

Phase 3 implements the navigable 3D grid world. All six requirements map cleanly to established Three.js/R3F patterns that are already in use or verified present in the installed dependencies. The biggest integration concern is the camera position change: `App.jsx` line 69 hardcodes `camera={{ position: [0, 0, 8] }}` on the `<Canvas>` element, which must change to `[0, 8, 14]` for Phase 3's default view. Since OrbitControls from drei's `makeDefault` prop is not required here (the Canvas camera prop suffices), this is a one-line change.

The CanvasTexture approach is the correct choice for pane surface animations. Three.js `CanvasTexture` wraps an offscreen HTML canvas and requires only `needsUpdate = true` to push new content to the GPU — this is a standard, well-supported pattern. The throttle mechanism (check elapsed delta in `useFrame`, skip redraw if <125ms) prevents per-frame CPU texture uploads that would otherwise tank performance.

The drei `<Billboard>` component is confirmed present in v10.7.7 with `lockX`, `lockY`, `lockZ` props. However, the CONTEXT.md has locked the manual `atan2` approach for billboarding. Both are verified to work; the manual approach is acceptable and the locked decision should be honored.

**Primary recommendation:** Build `GatewayPane.jsx` as a self-contained unit (geometry + material + edge overlay + canvas texture + billboard + hover handlers + ring pool). `GatewayPanes.jsx` is a thin wrapper that positions three instances. Add both to Scene.jsx with `phase >= 3` guard. Update camera position in App.jsx before Scene is touched.

---

## Standard Stack

### Core (already installed — no new dependencies needed)

| Library | Version (installed) | Purpose | Notes |
|---------|---------------------|---------|-------|
| three | 0.183.2 | THREE.CanvasTexture, THREE.RingGeometry, THREE.EdgesGeometry, THREE.MeshStandardMaterial | All required classes verified present |
| @react-three/fiber | 9.5.0 | useFrame, useThree hooks — R3F render loop integration | useFrame used for billboard + texture update + ring animation |
| @react-three/drei | 10.7.7 | OrbitControls component | Verified present at this version |
| gsap | 3.14.2 | power2.out easing for pane rise animation | Already used in App.jsx for dock animation |
| zustand | 5.0.11 | phase subscription to gate phase >= 3 rendering | Already established pattern |

**No new npm installs required for Phase 3.**

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual atan2 billboarding | drei `<Billboard lockX lockZ>` | Billboard wraps a Group, clean API, but adds one extra object in scene graph. Manual atan2 co-locates with other useFrame logic — locked decision honors this |
| THREE.CanvasTexture | drei `<meshStandardMaterial map={...}>` with texture prop | Same underlying texture; CanvasTexture is the standard Three.js class used directly |
| GSAP for pane rise | Pure useFrame lerp with elapsed time | GSAP power2.out gives the exact easing described; already a project dependency. Either works |

---

## Architecture Patterns

### Recommended Project Structure

```
src/components/3D/
├── GridFloor.jsx          (existing — no modification)
├── GatewayPane.jsx        (NEW — single pane: geometry, material, edges, canvas texture, billboard, hover, ring)
├── GatewayPanes.jsx       (NEW — positions 3 GatewayPane instances, triggers GSAP rise on phase entry)
└── IdentityDisc.jsx       (existing — unused in Phase 3)
```

```
src/components/
├── Scene.jsx              (MODIFY — add <GatewayPanes> + <OrbitControls> with phase >= 3 guard)
└── ...
src/App.jsx                (MODIFY — camera position [0, 0, 8] → [0, 8, 14])
```

### Pattern 1: CanvasTexture Idle Animation

The offscreen canvas is created once (`useRef` holding the canvas element and 2D context), then redrawn on a throttle in `useFrame`. The `THREE.CanvasTexture` wraps the canvas element. Setting `texture.needsUpdate = true` after each redraw pushes the new pixels to GPU on the next R3F render pass.

```jsx
// Source: THREE.js docs + verified against three@0.183.2 installed source
const canvasRef = useRef(null)
const textureRef = useRef(null)
const lastDrawRef = useRef(0)

// On mount
useEffect(() => {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 160
  canvasRef.current = canvas
  textureRef.current = new THREE.CanvasTexture(canvas)
}, [])

// In useFrame
useFrame(({ clock }) => {
  const elapsed = clock.elapsedTime
  if (elapsed - lastDrawRef.current < 0.125) return   // 8fps throttle
  lastDrawRef.current = elapsed
  drawIdleFrame(canvasRef.current)                     // your canvas 2D draw function
  if (textureRef.current) textureRef.current.needsUpdate = true
})
```

### Pattern 2: Y-Axis Billboard (Manual atan2)

```jsx
// Source: CONTEXT.md locked decision, confirmed valid Three.js API
const meshRef = useRef()
useFrame(({ camera }) => {
  if (!meshRef.current) return
  const mesh = meshRef.current
  mesh.rotation.y = Math.atan2(
    camera.position.x - mesh.position.x,
    camera.position.z - mesh.position.z
  )
})
```

### Pattern 3: OrbitControls with Clamp

```jsx
// Source: drei@10.7.7 OrbitControls.d.ts — props verified
import { OrbitControls } from '@react-three/drei'

// In Scene.jsx, inside <> ... </>
{phase >= 3 && (
  <OrbitControls
    enablePan={false}
    maxPolarAngle={Math.PI / 2.1}
    minDistance={6}
    maxDistance={22}
    enableDamping
    dampingFactor={0.05}
    target={[0, 1, 0]}
  />
)}
```

**Key:** OrbitControls from drei reads the camera from the R3F context automatically. No camera prop needed. The `target` prop accepts a Vector3 array.

### Pattern 4: GSAP Pane Rise (Phase Entry)

```jsx
// Source: established pattern from App.jsx dock animation (phase 2 -> 3 transition)
// gsap.to works on Three.js object position refs
useEffect(() => {
  if (phase !== 3) return
  paneRefs.forEach((ref) => {
    if (!ref.current) return
    gsap.to(ref.current.position, {
      y: 1.5,
      duration: 1.5,
      ease: 'power2.out',
    })
  })
}, [phase])
```

**Alternative:** Use `useFrame` lerp. GSAP is preferred because `power2.out` is the exact locked easing and GSAP is already imported in the project.

### Pattern 5: Ring Pulse Pool

```jsx
// Pool of 3 ring refs — one per pane, reused on repeat hovers
const ringRef = useRef()
const ringStateRef = useRef({ active: false, progress: 0 })

useFrame((_, delta) => {
  if (!ringStateRef.current.active || !ringRef.current) return
  ringStateRef.current.progress = Math.min(ringStateRef.current.progress + delta / 0.8, 1)
  const p = ringStateRef.current.progress
  // Geometry update: rebuild with new inner radius OR scale the mesh
  ringRef.current.scale.set(0.5 + p * 4.5, 0.5 + p * 4.5, 1)
  ringRef.current.material.opacity = 0.8 * (1 - p)
  if (p >= 1) ringStateRef.current.active = false
})

function firePulse() {
  // If first pulse > 50% done, or inactive — fire new pulse
  if (!ringStateRef.current.active || ringStateRef.current.progress > 0.5) {
    ringStateRef.current.active = true
    ringStateRef.current.progress = 0
  }
}
```

**Note:** Scaling the mesh is simpler than rebuilding RingGeometry each frame. Since RingGeometry is static, use `mesh.scale.setScalar(...)` to expand it. Opacity is controlled via `material.opacity` (material must have `transparent: true`).

### Pattern 6: Decrypt Progress State

Hover state is component-local — no global Zustand state needed for Phase 3 (locked decision from CONTEXT.md). Use `useRef` for `decryptProgress` and `decryptDirection` to avoid React re-renders (the state drives canvas redraws in useFrame, not React DOM updates).

```jsx
const decryptRef = useRef({ progress: 0, direction: 0 }) // direction: 1=encrypting, -1=decrypting

// onPointerEnter
decryptRef.current.direction = 1
firePulse()

// onPointerLeave
decryptRef.current.direction = -1

// In useFrame (canvas redraw section)
const d = decryptRef.current
if (d.direction !== 0) {
  d.progress = Math.max(0, Math.min(1,
    d.progress + (d.direction * delta / (d.direction > 0 ? 1.2 : 0.6))
  ))
  if (d.progress === 0 || d.progress === 1) d.direction = 0
}
```

### Anti-Patterns to Avoid

- **React useState for decryptProgress:** Triggers component re-render on every frame, bypassing R3F's render loop optimization. Use `useRef` and update canvas directly in `useFrame`.
- **Rebuilding CanvasTexture on each hover:** Create once in `useEffect`, reuse the same `THREE.CanvasTexture`. Only the offscreen canvas content changes.
- **Creating RingGeometry dynamically in useFrame:** Geometry construction allocates memory. Create geometry once, animate via scale or material opacity.
- **Forgetting `texture.needsUpdate = true`:** Without this flag, Three.js caches the previous canvas state. Must be set after every canvas redraw.
- **Placing OrbitControls outside the Canvas:** `<OrbitControls>` from drei must be inside the R3F `<Canvas>` tree to access the renderer context.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth orbit camera with damping | Custom camera event handlers + lerp | drei `<OrbitControls>` | OrbitControls handles pointer lock, touch events, damping math, polar/azimuth clamping — 500+ lines of edge cases |
| GPU texture from canvas | Manual WebGL texture upload | `THREE.CanvasTexture` | Handles needsUpdate diffing, mipmap generation, internal Three.js texture state |
| Animation easing | Custom bezier math | GSAP (already installed) | power2.out easing is one GSAP prop |

**Key insight:** Every "custom solution" here involves pointer event edge cases or WebGL state management that existing libraries handle correctly. The pane canvas texture and ring pool are the only custom animation logic needed.

---

## Common Pitfalls

### Pitfall 1: Camera Position Conflict Between Canvas Prop and OrbitControls

**What goes wrong:** `App.jsx` sets `camera={{ position: [0, 0, 8] }}` on `<Canvas>`. OrbitControls reads and overwrites the camera position on first interaction. If the Canvas camera prop is not updated, the camera starts at the wrong position (too close, wrong angle) and OrbitControls takes over from there.

**Why it happens:** R3F initializes the camera from the Canvas prop once. OrbitControls then owns the camera for the rest of the session.

**How to avoid:** Update `App.jsx` line 69 to `camera={{ position: [0, 8, 14], fov: 60 }}` as the first task in Phase 3. This is a **prerequisite** for all pane work.

**Warning signs:** Grid floor looks flat/top-down, panes not visible from default camera position.

### Pitfall 2: CanvasTexture Font Not Available in Offscreen Canvas

**What goes wrong:** Drawing TR2N font via `ctx.font = "16px 'TR2N'"` on an offscreen `document.createElement('canvas')` may fail if the font hasn't been loaded into the document yet. Canvas 2D does not automatically access CSS @font-face declarations — the font must be registered with the browser font engine first.

**Why it happens:** Offscreen canvases share the document's font cache only if fonts have been used in a DOM element first, or explicitly loaded via `FontFace` API.

**How to avoid:** Ensure TR2N is already rendered in a visible DOM element before drawing it to canvas (it is — TitleOverlay uses TR2N font). Alternatively, use `document.fonts.ready` to gate canvas draws. Roboto Mono (8px idle chars) is loaded via Google Fonts link in index.css and will be available after initial render.

**Warning signs:** Revealed pane label renders as fallback sans-serif instead of TR2N.

### Pitfall 3: OrbitControls Blocks Pointer Events to Panes

**What goes wrong:** OrbitControls adds pointer event listeners to the canvas DOM element. By default, drag-start events on panes are captured by OrbitControls and the pane's `onPointerEnter` / `onPointerLeave` do not fire correctly during camera drags.

**Why it happens:** Pointer events bubble through R3F's raycaster but OrbitControls's DOM listeners intercept mousedown before raycasting completes.

**How to avoid:** This is standard R3F behavior — `onPointerEnter` and `onPointerLeave` from R3F's raycaster work correctly for hover (not drag) because they use `mousemove`, not `mousedown`. No workaround needed for hover. The issue only applies if click events are added (Phase 4 concern).

**Warning signs:** Hover decrypt doesn't fire when the user is in mid-drag. This is acceptable behavior — users are orbiting, not hovering.

### Pitfall 4: Ring Scale Distortion from Non-Uniform Y

**What goes wrong:** If the ring mesh is rotated to lay flat on the XZ plane (`rotation.x = -Math.PI / 2`) and then scaled with `scale.set(s, s, 1)` (non-uniform), the ring geometry may distort.

**Why it happens:** RingGeometry is created in the XY plane. To display flat on XZ (matching the grid floor), it needs to be rotated -90° on X. Once rotated, scaling X/Y in object space corresponds to XZ in world space. Uniform scale (`scale.setScalar(s)`) is safe but also scales Y (depth), which is fine for a flat ring.

**How to avoid:** Use `scale.setScalar(s)` for the expanding ring rather than `scale.set(s, s, 1)`. This uniformly expands the ring in all dimensions — since it's flat, the depth scaling is imperceptible.

**Warning signs:** Ring appears as ellipse instead of circle when orbiting.

### Pitfall 5: Phase Transition Re-Mount Triggering GSAP Rise Multiple Times

**What goes wrong:** If the user navigates back from Phase 4 to Phase 3 (via HUD click), the phase transitions back to 3. The GSAP rise `useEffect` with `[phase]` dependency fires again — but panes are already at y=1.5, so the tween starts from current position (no-op if the position is already the target).

**Why it happens:** `gsap.to` animates FROM the current value TO the target. If the pane is already at y=1.5, nothing visible happens. This is correct behavior.

**How to avoid:** No workaround needed. The rise is idempotent. If the design later calls for a "re-entry" animation from Phase 4, add a reset step first.

---

## Code Examples

### Glass Pane Material (from UI-SPEC + Three.js docs)

```jsx
// Source: 03-UI-SPEC.md Color section + three@0.183.2
<mesh ref={meshRef} position={position}>
  <planeGeometry args={[5, 3.5]} />
  <meshStandardMaterial
    color="#00FFFF"
    emissive="#00FFFF"
    emissiveIntensity={0.04}
    transparent
    opacity={0.18}
    side={THREE.DoubleSide}
    toneMapped={false}
  />
</mesh>
```

### Edge Overlay (from CONTEXT.md + Three.js EdgesGeometry)

```jsx
// Source: 03-CONTEXT.md + three@0.183.2 verified
const edgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(5, 3.5)), [])

<lineSegments geometry={edgesGeo} position={position}>
  <lineBasicMaterial color="#00FFFF" transparent opacity={0.8} toneMapped={false} />
</lineSegments>
```

**Note:** EdgesGeometry and the mesh must share the same world position/rotation. The edge overlay is a sibling element, not a child of the mesh. Both get the billboard rotation applied separately — or both can be grouped under a single `<group>` with the billboard rotation applied to the group.

**Grouping pattern (cleaner):**

```jsx
// Apply billboard rotation to group — both mesh and edges rotate together
<group ref={groupRef} position={position}>
  <mesh>
    <planeGeometry args={[5, 3.5]} />
    <meshStandardMaterial ... />
  </mesh>
  <lineSegments geometry={edgesGeo}>
    <lineBasicMaterial color="#00FFFF" transparent opacity={0.8} />
  </lineSegments>
</group>

// In useFrame: rotate the group instead of individual mesh
useFrame(({ camera }) => {
  if (!groupRef.current) return
  const g = groupRef.current
  g.rotation.y = Math.atan2(
    camera.position.x - g.position.x,
    camera.position.z - g.position.z
  )
})
```

### RingGeometry for Pulse (from three@0.183.2 source)

```jsx
// Source: three/src/geometries/RingGeometry.js
// RingGeometry(innerRadius, outerRadius, thetaSegments)
const ringGeo = useMemo(() => new THREE.RingGeometry(1, 1.08, 64), [])

<mesh
  ref={ringRef}
  geometry={ringGeo}
  rotation={[-Math.PI / 2, 0, 0]}   // lay flat on XZ plane
  position={[paneX, -3, paneZ]}      // y=-3 matches GridFloor
>
  <meshBasicMaterial
    color="#00FFFF"
    transparent
    opacity={0.8}
    side={THREE.DoubleSide}
  />
</mesh>
```

The geometry is created at radius=1 and scaled up in `useFrame` from 0.5x to 5x. This avoids geometry reconstruction.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| THREE.Geometry (legacy) | THREE.BufferGeometry | Three.js r125 | Existing code already uses BufferGeometry — no issue |
| Custom OrbitControls from three/examples | drei `<OrbitControls>` (wraps three-stdlib) | drei v1+ | Existing project uses drei — no issue |
| R3F v8 `extend({OrbitControls})` pattern | Direct JSX import from drei | R3F v8+ / drei v9+ | Installed versions support direct import |

**Verified current APIs:**
- `THREE.CanvasTexture` — present in three@0.183.2 (confirmed via source check)
- `THREE.RingGeometry` — present in three@0.183.2 (confirmed via source check)
- `THREE.EdgesGeometry` — present in three@0.183.2 (standard Three.js)
- `OrbitControls` from `@react-three/drei` — present in v10.7.7 (confirmed via .d.ts)
- `Billboard` from `@react-three/drei` — present in v10.7.7 with lockX/lockY/lockZ props (confirmed via .d.ts)

---

## Open Questions

1. **Camera prop vs. useThree camera update**
   - What we know: App.jsx sets camera on `<Canvas camera={...}>`. OrbitControls will own camera after first mount.
   - What's unclear: Whether changing the Canvas camera prop mid-session (e.g., phase going from 2 to 3) causes a camera reset. R3F reads the camera prop only once on initialization.
   - Recommendation: Update the camera prop statically to `[0, 8, 14]` — this is the default for the whole app. Phase 2 (title screen) works fine at this position since TitleOverlay is DOM overlay. No dynamic camera prop switching needed.

2. **Cursor pointer on pane hover across OrbitControls**
   - What we know: R3F supports `onPointerEnter`/`onPointerLeave` events and `cursor` style via `useThree().gl.domElement.style.cursor`.
   - What's unclear: Whether drei OrbitControls intercepts pointer move events in a way that disrupts R3F raycasting for hover.
   - Recommendation: Use `document.body.style.cursor = 'pointer'` in `onPointerEnter` and reset in `onPointerLeave`. This is the simplest cross-compatible approach. Alternatively, use `@react-three/fiber`'s `events.connect` API, but that is unnecessary complexity.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test files, no vitest/jest config in project |
| Config file | None — Wave 0 gap |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

### Phase Requirements -> Test Map

This is a WebGL/3D rendering phase. Most behaviors are visual and cannot be meaningfully unit-tested without a headless WebGL environment. The validation strategy for this phase is manual visual verification, not automated tests.

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| GRID-01 | Panes render in triangle formation at correct world positions | manual-visual | N/A | Wave 0 gap |
| GRID-01 | Pane rise animation triggers on phase 3 entry | manual-visual | N/A | Wave 0 gap |
| GRID-02 | OrbitControls: 360° horizontal orbit works | manual-visual | N/A | Wave 0 gap |
| GRID-02 | OrbitControls: vertical orbit clamped at Math.PI/2.1 | manual-visual | N/A | Wave 0 gap |
| GRID-03 | Panes face camera at all orbit positions | manual-visual | N/A | Wave 0 gap |
| GRID-04 | Idle canvas texture animates at ~8fps | manual-visual | N/A | Wave 0 gap |
| GRID-05 | Decrypt animation runs 0->1 over 1.2s on hover | manual-visual | N/A | Wave 0 gap |
| GRID-05 | Ring pulse expands and fades over 0.8s | manual-visual | N/A | Wave 0 gap |
| NFR-03 | 60 FPS maintained (check with browser devtools) | manual-perf | N/A | Wave 0 gap |

**Justification for manual-only:** Three.js/R3F components require a live WebGL context for visual behavior testing. Setting up jsdom + WebGL mock environment (e.g., `jest-webgl-canvas-mock`) would cost more than the test value delivered. Browser devtools provide the FPS measurement needed for NFR-03.

### Sampling Rate

- Per task commit: `npm run dev` — visual check in browser
- Per wave merge: Full manual walkthrough of all 5 GRID requirements
- Phase gate: All 5 GRID behaviors confirmed before `/gsd:verify-work`

### Wave 0 Gaps

- No test framework exists in this project — the project does not have vitest, jest, or any test runner configured
- No test files exist in `src/`
- Given the WebGL-heavy nature of the codebase, installing a test framework for Phase 3 is not recommended — all phases to date have used manual browser verification

---

## Integration Checklist (Critical for Planner)

The planner MUST sequence these tasks in order:

1. **Update App.jsx camera prop** — `[0, 0, 8]` -> `[0, 8, 14]`. This must happen before any pane work so the scene view is correct during development.
2. **Add OrbitControls to Scene.jsx** — with phase >= 3 guard. Test that orbit works and grid floor stays visible.
3. **Build GatewayPane.jsx** — geometry, material, edge overlay, billboard, canvas texture (idle only first).
4. **Build GatewayPanes.jsx** — positions three instances, triggers GSAP rise.
5. **Add GatewayPanes to Scene.jsx** — with phase >= 3 guard.
6. **Implement hover decrypt** — decryptProgress logic in GatewayPane useFrame.
7. **Implement ring pulse** — PulseRing logic inline in GatewayPane or as sub-component.

Each step is independently testable in the browser before the next begins.

---

## Sources

### Primary (HIGH confidence)

- `three@0.183.2` installed source — `THREE.CanvasTexture`, `THREE.RingGeometry`, `THREE.EdgesGeometry` verified present
- `@react-three/drei@10.7.7` installed `.d.ts` — `OrbitControls` and `Billboard` props verified
- `@react-three/fiber@9.5.0` installed — `useFrame`, `useThree` verified
- `gsap@3.14.2` installed — `power2.out` easing is standard GSAP API
- `03-CONTEXT.md` — locked decisions for all geometry, timing, and behavior values
- `03-UI-SPEC.md` — color values, material specs, typography for canvas, component inventory
- `src/App.jsx` — camera position to update (line 69), existing phase/hudVisible pattern
- `src/components/Scene.jsx` — existing phase gate pattern, light setup
- `src/components/3D/GridFloor.jsx` — GridFloor Y position (-3), existing useFrame opacity pattern

### Secondary (MEDIUM confidence)

- Three.js documentation patterns for CanvasTexture (standard pattern, verified against installed source)
- R3F community patterns for OrbitControls inside Canvas (standard drei usage)

### Tertiary (LOW confidence)

- None — all claims verified against installed packages or locked CONTEXT.md decisions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages installed and versions confirmed from node_modules
- Architecture: HIGH — patterns verified against installed .d.ts files and existing project code
- Pitfalls: HIGH — derived from code analysis of App.jsx, Scene.jsx, and Three.js geometry behavior
- Integration order: HIGH — derived from dependency analysis of existing code

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable ecosystem — Three.js, drei, R3F are not fast-moving at these versions)
