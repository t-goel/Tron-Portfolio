# Phase 2: Shatter & Dock - Research

**Researched:** 2026-03-18
**Domain:** GSAP DOM animation, R3F LineSegments, React HUD overlay architecture, 3D-to-DOM handoff
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Disc Dock Animation:**
- The 3D IdentityDisc fades out (opacity → 0 via material transparency) while a DOM-based CSS disc simultaneously appears at viewport center
- DOM disc: a circular div styled with Crimson Red glow (border + box-shadow) — NOT a Canvas or Three.js element
- GSAP animates the DOM disc from viewport center to top-left corner: `gsap.to(domDiscRef, { top: '24px', left: '24px', scale: 0.35, duration: 1.2, ease: 'power2.inOut' })`
- Simultaneously, rotation speed animation on the 3D disc winds down via `useRef` speed lerp in `useFrame`
- Once GSAP animation completes: 3D disc unmounts (phase guard in Scene.jsx), DOM disc becomes permanent HUD element, `setHudVisible(true)` is called
- "TANMAY GOEL" text snaps in beside the docked disc via CSS opacity transition (0 → 1) with 200ms delay after dock completes

**Grid Illumination:**
- New dedicated `src/components/3D/GridFloor.jsx` component — does NOT reuse IdentityDisc's hover grid
- Geometry: LineSegments with BufferGeometry, 80×80 units on XZ plane, 1-unit spacing (80 lines each axis = 160 line segments)
- Material: `LineBasicMaterial` with `color: '#00FFFF'` and `transparent: true`, opacity animated from 0 → 0.6 over 2s during dock transition
- Bloom-reactive: cyan `#00FFFF` is above Bloom threshold (0.2), producing cyan halos at horizon
- Grid illuminates concurrent with disc dock animation (not after)
- GridFloor renders when `phase >= 3` in Scene.jsx

**HUD Architecture — Top-Left:**
- Fixed-position DOM div in App.jsx (sibling to Canvas, consistent with TitleOverlay pattern)
- Renders when `hudVisible === true` (from Zustand state)
- Structure: `<div className="hud-home">` containing CSS disc circle (40×40px, crimson border + box-shadow glow, slow rotation via CSS animation) and `<span>TANMAY GOEL</span>` in TR2N font, Crimson Red
- Clickable: `onClick={() => setPhase(2)}` — returns to main screen
- Positioned: `top: 24px, left: 24px` (fixed)

**HUD Architecture — Bottom-Right:**
- Fixed-position DOM div in App.jsx, `bottom: 24px, right: 24px`
- Renders when `hudVisible === true`
- Contains MuteToggle (speaker SVG, toggles `audioEnabled` via `toggleAudio()`) and SocialIcons (three 44×44px circular anchors for GitHub, LinkedIn, Email)
- Social icon URLs imported from `src/data/contact.js`

**Phase Transition Sequence:**
- `EnterButton` click → `setPhase(3)` called
- `TitleOverlay` + `EnterButton` unmount (App.jsx conditions on `phase === 2`)
- Scene.jsx mounts `GridFloor` and begins opacity animation (concurrent)
- `IdentityDisc` triggers dock animation sequence on phase 3 detection (useEffect on phase)
- GSAP animates DOM disc to top-left over 1.2s
- On GSAP complete: `setHudVisible(true)`, 3D disc unmounts (phase guard in Scene.jsx)

**Social Icon Content:**
- GitHub/LinkedIn/Email links from `src/data/contact.js`, open `target="_blank" rel="noopener noreferrer"`
- Hover: icon scale 1.1, glow intensifies (CSS transition)

### Claude's Discretion

- Exact GSAP easing curve for disc wind-down (power2.inOut is starting point)
- CSS animation for idle rotation of HUD disc (keyframes at 0° → 360°, 8s linear infinite)
- Exact grid line opacity (target ~0.6, adjust for visual clarity)
- SVG icon choice for speaker mute/unmute states

### Deferred Ideas (OUT OF SCOPE)

- CLAUDE.md note: "Prioritize speed and ease of access to projects. Maybe make the projects a normal webpage/browser scroll" — Phase 3/4 architectural consideration
- OrbitControls and isometric camera — Phase 3
- Full NAV-02 camera lerp (sector→grid return) — Phase 3
- Mobile degradation for grid world — Phase 4

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCK-01 | On disc click, disc scales down ~80% and lerps to top-left corner with spinning wind-down, settling into persistent idle rotation as Home button | GSAP `gsap.to()` animates DOM disc CSS `top`/`left`/`scale`; R3F `useFrame` lerps 3D disc opacity to 0 concurrently |
| DOCK-02 | "TANMAY GOEL" text snaps into position beside the docked disc in the top-left HUD | CSS `opacity` transition on `<span>` inside `hud-home`, triggered via `onComplete` of GSAP tween with 200ms delay |
| DOCK-03 | Three social icon nodes (GitHub, LinkedIn, Email) fade in at bottom-right as glowing circles | Fixed DOM div in App.jsx, rendered on `hudVisible`, CSS `opacity` transition on mount |
| DOCK-04 | Grid permanently illuminates as glowing Neon Cyan isometric wireframe on XZ plane with bloom/lens flare at horizon | `GridFloor.jsx` with LineSegments + LineBasicMaterial, opacity animated 0→0.6 via `useFrame` + `useRef` elapsed timer |
| AUDIO-02 | Mute/unmute toggle (speaker icon) visible in bottom-right HUD corner at all times after Phase 1 | MuteToggle component in bottom-right HUD div, reads `audioEnabled` from Zustand, calls `toggleAudio()` |
| NAV-01 | Top-left HUD (small red disc + "TANMAY GOEL" text) is always fixed, visible, and clickable during Phase 4 and Phase 5 | `hudVisible` Zustand flag set on dock complete; HUD div conditioned on `hudVisible`, z-index above canvas |
| NAV-02 | Clicking HUD triggers high-speed reverse camera lerp to Phase 4 default position | Partially in scope (click calls `setPhase(2)` to signal intent); full camera lerp implemented in Phase 3 |

</phase_requirements>

---

## Summary

Phase 2 is a pure transition and HUD-establishment phase. The core technical challenge is a **3D-to-DOM handoff**: the WebGL IdentityDisc must fade out while a CSS-only clone takes over at the same visual position, then GSAP moves that DOM disc to its permanent HUD position. This pattern avoids the complexity of animating a Three.js object into screen-space DOM coordinates.

The second challenge is the **LineSegments grid** — a straightforward Three.js geometry pattern, but requires correct setup of a `useMemo`-generated `BufferGeometry` with `setFromPoints()` and opacity animated via `useFrame` elapsed time (not frame counters, consistent with Phase 1 patterns).

The third challenge is the **HUD layer** — fixed DOM siblings to the Canvas in App.jsx, gated on `hudVisible` Zustand state. This pattern is already established by `TitleOverlay` and `BootSequence`.

**Primary recommendation:** Use `gsap.to()` directly (no `@gsap/react` needed since the animation is imperative/one-shot triggered by a useEffect) with `onComplete` callback to call `setHudVisible(true)`. Animate CSS `top`/`left` directly since the DOM disc starts at a known CSS position (centered via `top: 50%` / `left: 50%` with `transform: translate(-50%, -50%)`). After GSAP animation, clear the transform and let `top/left` be the positioning authority.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 (installed) | DOM element position animation, easing, onComplete sequencing | Already in project; battle-tested for CSS property animation |
| three | 0.183.2 (installed) | LineSegments, BufferGeometry, LineBasicMaterial for grid | Native Three.js — no extra abstraction needed for simple geometry |
| @react-three/fiber | 9.5.0 (installed) | useFrame hook for opacity animation, phase-conditional rendering | Already used in project |
| zustand | 5.0.11 (installed) | `hudVisible`, `setHudVisible`, `toggleAudio`, `audioEnabled` | Already wired; no store changes needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @gsap/react | 2.1.2 (not installed) | `useGSAP()` hook for auto-cleanup | Only needed for animations that live across full component lifecycle; one-shot dock animation does NOT require it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS top/left animation via GSAP | GSAP x/y transforms | Transforms are more performant but create a stacking context issue when the element starts centered via `transform: translate(-50%,-50%)` — GSAP cannot cleanly combine translate-center with x/y offset to corner. Use top/left directly since this is a one-shot slow animation (1.2s), not a loop |
| Manual `useEffect` with gsap.to | `@gsap/react` useGSAP | @gsap/react is better for animations tied to full component lifecycle; for a one-shot effect triggered by phase change, a `useEffect` with `gsap.to` + cleanup via returned kill function is simpler and has no extra dependency |
| BufferGeometry setFromPoints | GridHelper (Three.js built-in) | GridHelper is convenient but cannot animate opacity line-by-line or be phase-conditionally faded; LineSegments gives full control |

**Installation (only if @gsap/react chosen):**
```bash
npm install @gsap/react
```
No new installs required with the recommended approach (gsap already installed).

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── 3D/
│   │   ├── IdentityDisc.jsx     # Add: phase detection, fade-out, DOM disc spawn signal
│   │   └── GridFloor.jsx        # NEW: LineSegments grid, opacity animation in useFrame
│   └── UI/
│       ├── HudHome.jsx          # NEW: top-left disc + name HUD (or inline in App.jsx)
│       ├── HudControls.jsx      # NEW: bottom-right mute + social (or inline in App.jsx)
│       ├── MuteToggle.jsx       # NEW: speaker SVG icon toggle
│       └── SocialIcons.jsx      # NEW: three circular anchor links
├── App.jsx                      # Modified: add DOM disc ref, HUD divs, GSAP trigger
└── store/appState.js            # No changes needed
```

### Pattern 1: 3D-to-DOM Handoff (Disc Dock)

**What:** The 3D disc (R3F mesh) and a DOM div clone co-exist briefly during the transition. The 3D disc fades opacity to 0 via `useFrame` lerp while GSAP moves the DOM disc from center-screen to top-left.

**When to use:** Any time a 3D element needs to become a persistent DOM UI element.

**Implementation flow:**
1. `EnterButton` click → `setPhase(3)`
2. `IdentityDisc.jsx` useEffect detects `phase === 3`:
   - Sets internal `docking = true` ref
   - Signals App.jsx to show DOM disc (via `setDomDiscVisible(true)` local state in App.jsx, OR App.jsx detects phase and shows it directly)
3. `useFrame` in IdentityDisc: when `docking`, lerp `material.opacity` toward 0, lerp `rotationSpeed` toward 0
4. App.jsx: when `phase >= 3`, render DOM disc div at center-screen, then immediately trigger GSAP tween
5. GSAP `onComplete`: call `setHudVisible(true)` → DOM disc transitions into permanent HUD via conditional render swap

**Key insight about disc visibility timing:** The DOM disc must appear at the EXACT same visual position as the 3D disc before the 3D disc starts fading. Since the 3D disc is in world space (center of screen at phase 2), the DOM disc starts at `top: 50%, left: 50%, transform: translate(-50%, -50%)` matching it visually.

**Example — App.jsx GSAP trigger:**
```jsx
// Source: GSAP official docs + pattern verified against gsap.com/resources/React/
const domDiscRef = useRef()
const { setHudVisible } = useAppState()

useEffect(() => {
  if (phase !== 3 || !domDiscRef.current) return

  // Small delay lets DOM disc mount and paint before animating
  const tween = gsap.to(domDiscRef.current, {
    top: '24px',
    left: '24px',
    scale: 0.35,
    duration: 1.2,
    ease: 'power2.inOut',
    delay: 0.1,
    onComplete: () => {
      setHudVisible(true)
    },
  })

  return () => tween.kill()
}, [phase])
```

### Pattern 2: GridFloor with useFrame Opacity Animation

**What:** `LineSegments` component that animates `material.opacity` from 0 to 0.6 using elapsed real time, consistent with Phase 1 elapsed-time approach.

**When to use:** Any time a Three.js geometry needs a timed fade-in that is device-independent.

**Example — GridFloor.jsx:**
```jsx
// Source: Three.js docs (BufferGeometry.setFromPoints) + R3F patterns
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const materialRef = useRef()
  const startTime = useRef(null)
  const TARGET_OPACITY = 0.6
  const FADE_DURATION = 2.0  // seconds

  const geometry = useMemo(() => {
    const points = []
    const size = 80
    const step = 1
    // Lines parallel to Z axis
    for (let x = -size / 2; x <= size / 2; x += step) {
      points.push(new THREE.Vector3(x, 0, -size / 2))
      points.push(new THREE.Vector3(x, 0, size / 2))
    }
    // Lines parallel to X axis
    for (let z = -size / 2; z <= size / 2; z += step) {
      points.push(new THREE.Vector3(-size / 2, 0, z))
      points.push(new THREE.Vector3(size / 2, 0, z))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame((state) => {
    if (!materialRef.current) return
    if (startTime.current === null) startTime.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTime.current
    const progress = Math.min(elapsed / FADE_DURATION, 1)
    materialRef.current.opacity = progress * TARGET_OPACITY
  })

  return (
    <lineSegments geometry={geometry} position={[0, -3, 0]}>
      <lineBasicMaterial
        ref={materialRef}
        color="#00FFFF"
        transparent
        opacity={0}
        toneMapped={false}
      />
    </lineSegments>
  )
}
```

### Pattern 3: HUD Layer DOM Structure (App.jsx)

**What:** Fixed-position divs in App.jsx, rendered conditionally on `hudVisible`. Follows established pattern of TitleOverlay and BootSequence as Canvas siblings.

**Example — App.jsx HUD additions:**
```jsx
// Top-left: disc home button — renders when hudVisible
{hudVisible && (
  <div
    style={{
      position: 'fixed', top: '24px', left: '24px',
      display: 'flex', alignItems: 'center', gap: '12px',
      zIndex: 20, cursor: 'pointer',
    }}
    onClick={() => setPhase(2)}
  >
    <div className="hud-disc" /> {/* CSS circle with crimson glow + rotation animation */}
    <span
      style={{
        fontFamily: "'TR2N', sans-serif",
        color: 'var(--crimson-red)',
        fontSize: '0.9rem',
        letterSpacing: '0.3em',
        opacity: 1,
        transition: 'opacity 0.2s ease 0.2s',  // 200ms delay after dock
      }}
    >
      TANMAY GOEL
    </span>
  </div>
)}

// Bottom-right: mute + social icons — renders when hudVisible
{hudVisible && (
  <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 20 }}>
    <MuteToggle />
    <SocialIcons />
  </div>
)}
```

### Pattern 4: CSS Idle Rotation (HUD Disc)

**What:** Pure CSS `@keyframes` rotation for the docked HUD disc — no JavaScript needed.

```css
/* Add to index.css */
@keyframes discSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hud-disc {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--crimson-red);
  box-shadow: 0 0 8px var(--crimson-red), inset 0 0 4px rgba(255, 0, 0, 0.3);
  animation: discSpin 8s linear infinite;
  flex-shrink: 0;
}
```

### Anti-Patterns to Avoid

- **Using `@react-three/drei`'s `<Grid />`:** It renders as a single mesh with a shader, and cannot be opacity-animated via `material.opacity` in the same straightforward way as `lineSegments` with `LineBasicMaterial`. Also doesn't follow the project's explicit `LineSegments + BufferGeometry` decision.
- **Animating 3D disc in world space to screen-space DOM position:** Projecting Three.js world coordinates to screen coordinates requires `camera.project()` + viewport transforms. The 3D-to-DOM handoff approach (opacity to 0, DOM disc at center) is cleaner.
- **Running GSAP tween before DOM disc is mounted/painted:** Need a `delay: 0.1` or check that `domDiscRef.current` is non-null before calling `gsap.to`. React renders asynchronously — use `useEffect` (not `useLayoutEffect`) for this since the animation timing is not synchronous-critical.
- **Mixing GSAP x/y transforms with CSS translate(-50%,-50%) centering:** If the element uses `transform: translate(-50%,-50%)` for centering, GSAP's x/y will override it. Either start with explicit `top`/`left` in px (calculated from viewport dimensions) OR animate `top`/`left` directly (which GSAP CSSPlugin handles correctly). The CONTEXT.md approach (animate `top`/`left`) is correct and simpler for this case.
- **Phase 2 → 3 naming confusion:** REQUIREMENTS.md calls this "Phase 3: Shatter & Dock" (DOCK-01 etc.) but the roadmap/STATE.md calls it "Phase 2". The CONTEXT.md uses `setPhase(3)` for EnterButton → dock transition. Be precise: App.jsx renders `TitleOverlay` when `phase === 2`, dock animation runs on `phase === 3`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS property animation with easing and callbacks | Custom `requestAnimationFrame` lerp for DOM elements | `gsap.to()` | GSAP handles easing curves, onComplete, kill-on-unmount, and cross-browser CSS property setting |
| Grid geometry | Nested for-loops generating Three.js Float32Array manually | `BufferGeometry.setFromPoints(points)` with `THREE.Vector3[]` | Cleaner, readable, and already established in IdentityDisc.jsx grid implementation |
| Speaker SVG icons | Drawing SVG paths manually | Heroicons or inline SVG from common icon set | Standard icons for speaker-on / speaker-off / speaker-x are universally recognized; roll your own SVG path only if specific design demands it |
| Opacity fade sequencing | setInterval/setTimeout chains | `useFrame` elapsed time reference (for R3F) or GSAP timeline (for DOM) | Both are frame-rate independent and cancellable |

**Key insight:** The most common hand-roll trap here is re-implementing what GSAP's `onComplete` already does cleanly — chaining `setTimeout` after a CSS transition to trigger `setHudVisible`. Use `gsap.to().onComplete` instead.

---

## Common Pitfalls

### Pitfall 1: DOM Disc Not Positioned at Visual Center of 3D Disc

**What goes wrong:** The DOM disc appears at CSS center (50vw, 50vh) but the 3D disc may not be at the exact screen center if camera FOV/aspect ratio places it slightly off. For this project the camera is at `position=[0,0,8]` with the disc at world origin, which does map to screen center — but this assumption breaks if camera is moved before phase 3.

**Why it happens:** World-to-screen projection is FOV-dependent.

**How to avoid:** The 3D IdentityDisc currently IS at world origin and the camera IS at center. The CSS centering (`top: 50%, left: 50%, transform: translate(-50%, -50%)`) is correct for this specific setup. Document this assumption explicitly.

**Warning signs:** Visible "jump" between 3D disc disappearing and DOM disc appearing.

### Pitfall 2: GSAP Animating top/left Conflicts with transform: translate(-50%,-50%)

**What goes wrong:** If the DOM disc is positioned with `transform: translate(-50%,-50%)` for centering, GSAP animating `top`/`left` won't clear the transform, leaving the element offset from the target.

**Why it happens:** GSAP CSSPlugin sets `top`/`left` independently from `transform`. When the animation targets `top: 24px, left: 24px, scale: 0.35`, the `scale` sets `transform: scale(0.35)` — overwriting the centering translate.

**How to avoid:** Ensure the DOM disc's initial state is set with explicit `top`/`left` pixel values (calculated as `(vh/2 - halfHeight)px` / `(vw/2 - halfWidth)px`) rather than `top: 50%`. Alternatively, set initial state using GSAP's `gsap.set()` to establish the starting position before calling `gsap.to()`.

**Warning signs:** Disc jumps to wrong position at animation start.

### Pitfall 3: 3D Disc Still Rendered (and Visible) After hudVisible = true

**What goes wrong:** Scene.jsx fails to unmount `IdentityDisc` after dock completes, showing a fully opaque 3D disc behind the DOM HUD.

**Why it happens:** The unmount condition (`phase > 3` in Scene.jsx) or timing is wrong — if `setHudVisible` and the phase guard are decoupled, the disc may re-render.

**How to avoid:** Use a dedicated `docking` or `docked` ref/state in IdentityDisc.jsx. When `material.opacity < 0.01`, set `visible={false}` on the mesh to prevent rendering cost too. The phase guard `{phase >= 3 && <IdentityDisc />}` should unmount it entirely after the GSAP animation completes and `setHudVisible(true)` fires. Consider: `{phase === 2 && <IdentityDisc />}` in Scene.jsx (unmounts immediately at phase 3) vs `{phase <= 3 && <IdentityDisc />}` (keeps it mounted during dock).

**Warning signs:** Disc "ghost" visible through the HUD.

### Pitfall 4: GridFloor Line Count Performance

**What goes wrong:** 80×80 grid with 1-unit spacing = 81 lines each axis = 162 LineSegments (324 vertices). At Three.js r183, this is trivial. BUT if spacing is reduced (0.5 units), it quadruples to 648 line segments. With Bloom pass running, GPU cost increases.

**Why it happens:** Bloom with mipmapBlur is expensive. LineSegments at 160 draw calls is fine; 640+ starts to compound.

**How to avoid:** Keep 1-unit spacing as specified (80×80, 1-unit = 160 segments). If performance issues arise, increase step size or use `THREE.Grid` helper.

**Warning signs:** FPS drop during grid illumination transition.

### Pitfall 5: HUD z-index Below Canvas

**What goes wrong:** HUD divs are invisible because the Canvas element covers them.

**Why it happens:** Canvas is `position: absolute` with `top: 0, left: 0`. Sibling divs without explicit z-index may render under it in certain browsers.

**How to avoid:** Set `zIndex: 20` on HUD divs (Canvas has no explicit z-index set, defaulting to auto/0). Verify Canvas has `pointerEvents` configured not to block HUD clicks. The current App.jsx pattern uses `zIndex: 40` for the black fade overlay — HUD at `zIndex: 20` is between canvas and fade overlay.

**Warning signs:** Clicks on HUD disc don't register; HUD not visible.

---

## Code Examples

### 1. GridFloor - Full Component Pattern
```jsx
// Source: Three.js docs (BufferGeometry.setFromPoints) + R3F useFrame docs
// Consistent with IdentityDisc.jsx elapsed-time animation pattern
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const materialRef = useRef()
  const startTimeRef = useRef(null)

  const geometry = useMemo(() => {
    const points = []
    for (let x = -40; x <= 40; x++) {
      points.push(new THREE.Vector3(x, 0, -40))
      points.push(new THREE.Vector3(x, 0, 40))
    }
    for (let z = -40; z <= 40; z++) {
      points.push(new THREE.Vector3(-40, 0, z))
      points.push(new THREE.Vector3(40, 0, z))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame((state) => {
    if (!materialRef.current) return
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime
    }
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    const progress = Math.min(elapsed / 2.0, 1)
    materialRef.current.opacity = progress * 0.6
  })

  return (
    <lineSegments geometry={geometry} position={[0, -3, 0]}>
      <lineBasicMaterial
        ref={materialRef}
        color="#00FFFF"
        transparent
        opacity={0}
        toneMapped={false}
      />
    </lineSegments>
  )
}
```

### 2. Scene.jsx - Phase Guard for GridFloor
```jsx
// GridFloor rendered when phase >= 3, IdentityDisc rendered when phase < 3 OR during dock
import useAppState from '../store/appState'

export default function Scene() {
  const phase = useAppState((s) => s.phase)
  return (
    <>
      {/* ... existing lights, EffectComposer ... */}
      {phase === 2 && <IdentityDisc />}
      {phase >= 3 && <GridFloor />}
    </>
  )
}
```

### 3. GSAP Dock Trigger in App.jsx
```jsx
// Source: GSAP official docs pattern for imperative animations with useEffect
import gsap from 'gsap'
import { useRef, useEffect } from 'react'

// Inside App component:
const domDiscRef = useRef()

useEffect(() => {
  if (phase !== 3) return
  if (!domDiscRef.current) return

  const tween = gsap.to(domDiscRef.current, {
    top: '24px',
    left: '24px',
    xPercent: 0,   // clear any percentage-based offsets
    yPercent: 0,
    scale: 0.35,
    duration: 1.2,
    ease: 'power2.inOut',
    delay: 0.05,   // allow DOM disc to paint
    onComplete: () => {
      setHudVisible(true)
    },
  })

  return () => tween.kill()
}, [phase])
```

### 4. DOM Disc Initial State (before GSAP tween starts)
```jsx
// DOM disc: visible during phase 3 (before hudVisible), initial centered position
{phase >= 3 && !hudVisible && (
  <div
    ref={domDiscRef}
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(1)',
      // GSAP will animate top/left to 24px/24px and scale to 0.35
      // The transform centering will be overridden by GSAP scale
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '3px solid var(--crimson-red)',
      boxShadow: '0 0 15px var(--crimson-red), 0 0 40px rgba(255,0,0,0.4)',
      zIndex: 15,
      pointerEvents: 'none',
    }}
  />
)}
```

**Note on transform conflict:** The `transform: translate(-50%,-50%)` in the initial style will be overridden the moment GSAP writes `scale`. This is intentional — GSAP will own the transform property from that point. Alternatively, use `gsap.set()` to initialize position in px before the `gsap.to()` tween. See Pitfall 2.

### 5. MuteToggle Component Pattern
```jsx
// Source: Zustand selector pattern established in appState.js
import useAppState from '../../store/appState'

export default function MuteToggle() {
  const audioEnabled = useAppState((s) => s.audioEnabled)
  const toggleAudio = useAppState((s) => s.toggleAudio)

  return (
    <button
      onClick={toggleAudio}
      style={{
        background: 'transparent',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 8px var(--neon-cyan)',
        color: 'var(--neon-cyan)',
      }}
      aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
    >
      {/* SVG: speaker-wave when enabled, speaker-x when muted */}
      {audioEnabled ? <SpeakerOnSVG /> : <SpeakerOffSVG />}
    </button>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Animating Three.js objects to screen-space DOM positions | 3D-to-DOM handoff (opacity out + DOM clone in) | Established pattern | Avoids complex `camera.project()` math; DOM handles layout |
| `gsap.to()` in useEffect (React 17 era) | `useGSAP()` hook with contextSafe | GSAP ~3.12 / 2023 | Auto-cleanup; but imperative one-shot effects still use direct `useEffect` + kill() |
| THREE.GridHelper for grid floors | LineSegments with BufferGeometry | Three.js r125+ | Full control over opacity, color, and line count |
| CSS `top`/`left` as percentage for centering | `position: fixed` with calc or js-computed px | N/A | Needed for GSAP to animate to pixel-exact destinations |

**Note on @gsap/react:** The `useGSAP` hook (from `@gsap/react` v2.1.2, compatible with gsap 3.14.x) is not installed in this project. For the dock animation (one-shot, triggered by `useEffect` on phase change), direct `gsap.to()` + `return () => tween.kill()` is equivalent. Install `@gsap/react` only if complex lifecycle animations accumulate.

---

## Open Questions

1. **DOM disc centering vs GSAP transform conflict**
   - What we know: GSAP will override `transform` when it animates `scale`. The initial `translate(-50%,-50%)` centering will be lost.
   - What's unclear: Whether GSAP correctly handles `top: '50%'` as a starting point when the element is fixed-position (percentage-relative to viewport, not parent).
   - Recommendation: Use `gsap.set(domDiscRef.current, { top: windowHeight/2 - 60, left: windowWidth/2 - 60 })` to convert to px before the `gsap.to()` tween, OR set the initial style as `top: calc(50vh - 60px)` in CSS. This avoids the percentage+transform conflict entirely.

2. **IdentityDisc unmount timing relative to HUD appearance**
   - What we know: `setHudVisible(true)` fires in GSAP `onComplete`. Scene.jsx unmounts `IdentityDisc` when `phase !== 2`. The 3D disc fades via useFrame during the 1.2s GSAP duration.
   - What's unclear: Whether `phase === 2` guard (unmounts immediately at phase 3) causes a visual gap if the DOM disc hasn't appeared yet.
   - Recommendation: Use `{phase <= 3 && <IdentityDisc />}` to keep the 3D disc alive during the dock animation. After `hudVisible = true`, `phase` changes to... actually no — phase stays at 3 after dock. The 3D disc should unmount when `hudVisible === true` OR be kept alive via `phase === 2 || (phase === 3 && !hudVisible)`.

3. **Phase numbering — App.jsx `phase === 2` vs EnterButton `setPhase(3)`**
   - What we know: EnterButton calls `setPhase(3)`. App.jsx renders TitleOverlay for `phase === 2`. Phase 3 = dock/shatter state.
   - Confirmed: IdentityDisc dock sequence activates on `phase === 3` detection.
   - No ambiguity, just document clearly for implementer.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework detected — none installed in package.json |
| Config file | None |
| Quick run command | N/A — Wave 0 gap |
| Full suite command | N/A — Wave 0 gap |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCK-01 | Disc animates to top-left on phase 3 | manual-only | Visual inspection | ❌ Wave 0 |
| DOCK-02 | "TANMAY GOEL" appears beside docked disc | manual-only | Visual inspection | ❌ Wave 0 |
| DOCK-03 | Social icons fade in bottom-right | manual-only | Visual inspection | ❌ Wave 0 |
| DOCK-04 | Grid illuminates cyan on XZ plane | manual-only | Visual inspection | ❌ Wave 0 |
| AUDIO-02 | Mute toggle visible after phase 1 | manual-only | Visual inspection | ❌ Wave 0 |
| NAV-01 | Top-left HUD clickable during phase 4/5 | manual-only | Visual inspection | ❌ Wave 0 |
| NAV-02 | HUD click calls setPhase(2) | unit | Would require React Testing Library | ❌ Wave 0 |

**Justification for manual-only tests:** All DOCK and AUDIO-02 requirements are purely visual/animation behaviors (GSAP timing, CSS glow, grid opacity). These cannot be meaningfully unit-tested without a full WebGL rendering environment. The correct validation strategy is dev-server visual inspection at each wave completion.

### Sampling Rate

- **Per task commit:** Run `npm run dev` and visually verify the changed behavior
- **Per wave merge:** Full visual pass — all 7 requirements checked in browser
- **Phase gate:** All 7 requirements visually confirmed before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test framework installed — if unit tests are added for `MuteToggle`/`SocialIcons` state logic, install `vitest` + `@testing-library/react`: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`
- [ ] No test files exist — this is acceptable for an animation-only phase; all verification is visual

*All Phase 2 behaviors are animation/visual — unit test infrastructure not required for this phase.*

---

## Sources

### Primary (HIGH confidence)
- GSAP official docs (gsap.com/resources/React/) — useGSAP hook, contextSafe, onComplete callback patterns
- GSAP official docs (gsap.com/docs/v3/GSAP/CorePlugins/CSS/) — CSS property animation, transforms vs top/left
- Three.js official docs (threejs.org/docs/#api/en/core/BufferGeometry.setFromPoints) — BufferGeometry grid construction
- R3F official docs (r3f.docs.pmnd.rs/tutorials/basic-animations) — useFrame opacity animation
- Existing codebase: `src/components/3D/IdentityDisc.jsx`, `src/App.jsx`, `src/store/appState.js`, `src/components/Scene.jsx` — confirmed patterns, architecture, phase values
- npm registry: gsap@3.14.2 (installed), @gsap/react@2.1.2 (not installed), three@0.183.2 (installed)

### Secondary (MEDIUM confidence)
- GSAP community forum (topic 26307) — fixed position element animation patterns, Flip plugin discussion
- GSAP community forum (@gsap/react contextSafe) — imperative animation pattern with useEffect

### Tertiary (LOW confidence)
- None — all primary claims verified against official sources or existing codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified installed, versions npm-confirmed
- Architecture: HIGH — patterns traced directly from existing App.jsx/Scene.jsx/IdentityDisc.jsx code
- Pitfalls: HIGH for z-index and transform conflict (official source); MEDIUM for disc centering pixel math (derived from CSS spec + GSAP behavior)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable libraries; GSAP 3.x API is stable)
