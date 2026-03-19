# Phase 4: Sector Dives + Finish - Research

**Researched:** 2026-03-19
**Domain:** React HTML overlays, Canvas 2D animation, GSAP camera transitions, mobile detection, SEO meta tags
**Confidence:** HIGH — all critical findings come directly from existing codebase inspection and locked CONTEXT.md decisions; no external library exploration required since the stack is fully established.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sector Navigation Transition (PROJ-01, ABOUT-01, SKILLS-01)**
- On gateway pane click: GSAP lerp camera to a position 2 units past the pane center (~1.0s ease-in-out)
- During transit: gateway panes fade out (opacity 1 → 0 over 0.5s)
- On arrival: sector component mounts and fades in (opacity 0 → 1 over 0.4s)
- `setActiveSector('projects' | 'about' | 'skills')` drives sector mount via Zustand `activeSector` (already in store)
- Returning via HUD: `setActiveSector(null)` + reverse GSAP lerp back to `[0, 8, 14]` + panes fade back in
- Transition state tracked in Zustand (add `transitioning: false` flag to prevent double-clicks during animation)

**Projects Sector — 2D Overlay Panel (PROJ-02/03/04/05/06)**
- Implement as a 2D full-viewport HTML overlay panel (CLAUDE.md note: speed and ease of access)
- The 3D monolith silhouettes are visible as decorative background ambiance while the overlay is open
- Overlay: fixed 100vw × 100vh div with `backdrop-filter: blur(8px)` + dark background (`rgba(0,0,0,0.85)`)
- Content: vertically scrollable column of project cards, max-width 680px centered
- Each card: accent-colored left border (2px), project name in TR2N font, tagline in Roboto Mono, tech stack as inline pill tags, "VIEW ON GITHUB ↗" link
- Active project (active: true): Crimson Red accent border + "IN PROGRESS" badge top-right; others use Neon Orange
- All project content driven from `src/data/projects.js`
- GitHub link opens in new tab (`target="_blank" rel="noopener noreferrer"`)
- **Data blocker:** `src/data/projects.js` contains TBD placeholders — executor must prompt user before testing

**About Me Sector — Terminal Interface (ABOUT-01/02/03/04)**
- Full viewport HTML overlay (fixed 100vw × 100vh), `backdrop-filter: blur(12px)` + `rgba(0,0,0,0.9)`
- Terminal window: 680px × 480px centered panel, Roboto Mono, Neon Cyan text on black
- Top chrome bar: red/yellow/green dot decorations (macOS style)
- Auto-typewriter: 35ms per character, 400ms pause between command groups
- Command sequence: `$ whoami`, `$ cat background.txt`, `$ cat interests.txt`, `$ cat looking_for.txt`, `$ ls contact/`, `$ cat contact/*`
- Contact links from `src/data/contact.js`, rendered as `<a>` tags with cyan glow
- **Data blocker:** `src/data/contact.js` contains TBD placeholders — executor must prompt user

**Skills Sector — Network Graph (SKILLS-01/02/03/04/05)**
- Full viewport HTML Canvas 2D overlay, same backdrop-filter blur pattern
- 5 Tier 1 category nodes in radial arrangement, radius 200px, 72° spacing, `radius: 30px` circles
- Tier 2 expansion: light-racer animation at ~340px/s, duration 0.6s per racer, spawns Tier 2 nodes (`radius: 18px`)
- Second click on Tier 1: collapse (reverse animation, 0.4s)
- Hover within 35px: brightness pulse + edge highlight + label
- rAF loop active only during transitions — cancelled immediately after

**Mobile Graceful Degradation (NFR-02)**
- Breakpoint: `<768px` via `window.matchMedia('(max-width: 767px)')`
- OrbitControls: `enabled={!isMobile}` prop
- Gateway panes replaced by MobileGateway component (3 stacked 2D cards)
- Grid background: static CSS `repeating-linear-gradient` (no Three.js computation)
- Sector overlay components unchanged — already full-viewport responsive

**SEO, OG Tags, Favicon (NFR-04, NFR-05)**
- `index.html <head>` additions: title, description, og:title, og:description, og:type, og:image, twitter:card
- Favicon: inline `<script>` draws `T` in `#FF0000` on 32×32 canvas, injects as `<link rel="icon">`
- OG image: `/public/og-image.png` 1200×630, dark background with "TANMAY GOEL" TR2N Crimson + grid

### Claude's Discretion
- Exact camera positions for each sector (depth past pane, height adjustment)
- Bio copy content (user will review and edit in data files)
- Exact timing curves for light-racer Tier 2 expansion
- Whether to use CSS `backdrop-filter` blur or a Three.js blur pass for sector overlays (CSS is simpler and sufficient)
- Favicon generation approach (inline script vs build-time asset)

### Deferred Ideas (OUT OF SCOPE)
- None raised during auto-discussion — all ideas are within Phase 4 scope or already in v2 requirements.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROJ-01 | Camera lerps through selected Projects pane as fly-through transition into sector | GSAP `gsap.to(camera.position, {...})` inside R3F `useEffect` — same pattern as Phase 3 GatewayPanes rise animation |
| PROJ-02 | Three 3D rectangular monoliths rise from grid floor with project name, tagline, tech tags, glowing emissive edges | Decorative Monolith.jsx (R3F); boxGeometry + EdgesGeometry + emissive material; data from projects.js |
| PROJ-03 | Active monolith uses Crimson Red accent + "IN PROGRESS" tag; others Neon Orange | Conditional `accentColor` from projects.js `active` boolean |
| PROJ-04 | Hover triggers vertical bob + brightening emissive glow | `useFrame` lerp on mesh position.y + material.emissiveIntensity ref update |
| PROJ-05 | Click opens GitHub URL in new tab | `onPointerDown` handler: `window.open(githubUrl, '_blank', 'noopener,noreferrer')` |
| PROJ-06 | All monolith content from src/data/projects.js | Data import — no hardcoding |
| ABOUT-01 | Camera flies into About pane, expands to full viewport | Same GSAP camera lerp + `setActiveSector('about')` triggers component mount |
| ABOUT-02 | 3D background receives heavy Gaussian blur behind overlay | CSS `backdrop-filter: blur(12px)` on the HTML overlay div — sufficient; CSS compositing is GPU-accelerated |
| ABOUT-03 | Terminal auto-types bio content as bash commands | `setInterval`/`setTimeout` character-by-character append to React state; cursor blink CSS animation |
| ABOUT-04 | Contact links as clickable glowing terminal links | `<a>` tags from contact.js with `text-shadow: 0 0 8px #00FFFF` |
| SKILLS-01 | Camera flies into Skills pane, expands to full viewport | Same GSAP camera lerp + `setActiveSector('skills')` |
| SKILLS-02 | HTML Canvas 2D network graph, Tier 1 nodes visible | Canvas 2D draw loop on mount; nodes from skillCategories in skills.js |
| SKILLS-03 | Click Tier 1 node: light-racer expansion + Tier 2 spawn | `requestAnimationFrame` loop with elapsed-time progress; one racer per skill in the category |
| SKILLS-04 | Second click collapses Tier 2 nodes | Toggle state per node; reverse animation |
| SKILLS-05 | Hover highlights node + edges + label | Canvas hit-test on `mousemove`; redraw with highlight state |
| NFR-02 | Mobile <768px: OrbitControls disabled, panes stacked, simplified grid | `isMobile` hook via `matchMedia`; conditional render in Scene.jsx and App.jsx |
| NFR-04 | OG meta tags in index.html | Static `<meta>` tags added to index.html `<head>`; og:image requires `/public/og-image.png` |
| NFR-05 | Crimson Red TR2N favicon | Inline `<script>` in index.html `<head>`; Canvas 2D drawText → toDataURL → `<link rel="icon">` injection |
</phase_requirements>

---

## Summary

Phase 4 is a "connect all the rooms" phase: the technical infrastructure (Zustand `activeSector`, GSAP, Canvas 2D, R3F) is fully established in Phases 1–3. No new libraries are required. Every piece of new work involves either (a) building HTML overlay components that sit outside the R3F `<Canvas>` in App.jsx, (b) wiring pane click events to GSAP camera transitions, or (c) populating static assets and meta tags.

The dominant technical challenge is the Skills graph's Canvas 2D animation loop: the light-racer expansion requires a `requestAnimationFrame` loop that tracks per-racer elapsed time, fires in parallel for all skills in a category, and cancels itself when done. The existing codebase already has two working `rAF`-style loops (BootSequence canvas animation and GatewayPane `useFrame` texture drawing) that establish the pattern to follow.

The secondary concern is the GSAP camera transition: Three.js camera objects are not plain JS objects, so `gsap.to(camera.position, {...})` works but requires accessing the R3F camera from a ref or the `useThree` hook inside a component that lives inside `<Canvas>`. A `CameraController` component inside `<Canvas>` that reads `activeSector` from Zustand is the clean integration point.

**Primary recommendation:** Build in this order: (1) camera transition controller + pane click wiring, (2) Projects 2D overlay + Monolith decorative component, (3) About terminal overlay, (4) Skills graph canvas, (5) MobileGateway, (6) SEO/favicon in index.html. Each step is independently testable.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 | Camera lerp animations, pane fade transitions | Already in use for GatewayPanes rise + dock animation |
| react | 19.2.0 | HTML overlay components (sectors) | Project framework |
| @react-three/fiber | 9.5.0 | R3F Canvas, useThree hook for camera access | Project 3D layer |
| @react-three/drei | 10.7.7 | OrbitControls (to disable on mobile) | Already used in Scene.jsx |
| three | 0.183.2 | BoxGeometry, EdgesGeometry for Monolith | Core 3D library |
| zustand | 5.0.11 | activeSector state, transitioning flag | Already wired |
| tailwindcss | 4.2.1 | Utility classes for overlay layout | Project styling |

**No new npm installs required for Phase 4.** All dependencies are present.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS backdrop-filter | @react-three/postprocessing SelectiveBloom | CSS is GPU-composited, zero JS, zero performance cost — postprocessing pass adds render overhead and R3F complexity for no visual benefit |
| requestAnimationFrame in Skills canvas | GSAP timeline on Canvas | rAF gives direct control over per-racer progress; GSAP would require proxy objects and custom render callbacks — more indirection for a canvas draw loop |
| Inline favicon script | Vite plugin / build-time asset | Inline script works at runtime with TR2N font available in browser memory; build-time asset requires @vercel/og or canvas-node tools and complicates the build pipeline |

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── components/
│   ├── 3D/
│   │   ├── Monolith.jsx          # Decorative 3D monolith geometry (PROJ-02/03/04/05)
│   │   └── CameraController.jsx  # GSAP camera lerp inside <Canvas> (all sector transitions)
│   └── UI/
│       ├── ProjectsSector.jsx    # Full-viewport projects overlay
│       ├── AboutSector.jsx       # Terminal interface overlay
│       ├── SkillsSector.jsx      # Canvas 2D skills graph overlay
│       └── MobileGateway.jsx     # Stacked cards for <768px
public/
└── og-image.png                  # 1200×630 OG social preview image
```

### Pattern 1: Camera Transition Controller (PROJ-01, ABOUT-01, SKILLS-01)

**What:** An R3F component inside `<Canvas>` that watches `activeSector` from Zustand and fires GSAP tweens on the Three.js camera.

**When to use:** Any time you need to animate the R3F camera — GSAP works on `camera.position` and `camera.lookAt` targets but the animation must originate from inside the R3F render context where the camera ref is available.

**Why a dedicated component:** `Scene.jsx` already has enough responsibilities. CameraController is a pure side-effect component (renders nothing) that isolates all camera-lerp logic.

```jsx
// src/components/3D/CameraController.jsx
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useAppState from '../../store/appState'

// Sector camera targets: 2 units past each pane center
const SECTOR_CAMERAS = {
  projects: { position: [0, 4, -10], lookAt: [0, 1, -12] },
  about:    { position: [-6.93, 4, 2], lookAt: [-6.93, 1, 0] },
  skills:   { position: [6.93, 4, 2],  lookAt: [6.93, 1, 0] },
}
const HOME_CAMERA = { position: [0, 8, 14] }

export default function CameraController() {
  const { camera } = useThree()
  const activeSector = useAppState((s) => s.activeSector)
  const setTransitioning = useAppState((s) => s.setTransitioning)
  const tweenRef = useRef(null)

  useEffect(() => {
    if (tweenRef.current) tweenRef.current.kill()
    const target = activeSector ? SECTOR_CAMERAS[activeSector] : null

    if (target) {
      setTransitioning(true)
      tweenRef.current = gsap.to(camera.position, {
        x: target.position[0],
        y: target.position[1],
        z: target.position[2],
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => setTransitioning(false),
      })
    } else {
      // Return to Grid World
      setTransitioning(true)
      tweenRef.current = gsap.to(camera.position, {
        x: HOME_CAMERA.position[0],
        y: HOME_CAMERA.position[1],
        z: HOME_CAMERA.position[2],
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => setTransitioning(false),
      })
    }
    return () => { if (tweenRef.current) tweenRef.current.kill() }
  }, [activeSector, camera, setTransitioning])

  return null
}
```

**Camera target calculation:** Each pane is at depth z (e.g., PROJECTS pane at `[0, 1.5, -8]`). "2 units past" means `z = -10` for Projects. The exact values are Claude's discretion — use the pane positions from `GatewayPanes.jsx` PANES array as the reference.

### Pattern 2: Pane Click Dispatch (PROJ-01)

**What:** Add `onPointerDown` to the mesh in `GatewayPane.jsx`. Pass `onPaneClick(sectorKey)` prop through `GatewayPanes.jsx`.

**Pitfall:** The `label` prop uses the format `'>_ PROJECTS'`. You must map label strings to sector keys (`'projects'`, `'about'`, `'skills'`) in `GatewayPanes.jsx` before dispatching to Zustand.

**Guard:** Check `useAppState.getState().transitioning` before firing — prevents double-dispatch while camera is in motion.

```jsx
// In GatewayPanes.jsx — map from label to sector key
const LABEL_TO_SECTOR = {
  '>_ PROJECTS': 'projects',
  '>_ ABOUT_ME': 'about',
  '>_ SKILLS':   'skills',
}
```

### Pattern 3: Sector Overlay Mount Pattern

**What:** Sector HTML overlays are fixed-position divs rendered as direct children of `<div style={{width:'100vw', height:'100vh'}}>` in `App.jsx`, OUTSIDE the R3F `<Canvas>`. They are NOT R3F components.

**When to use:** All three sector components (ProjectsSector, AboutSector, SkillsSector).

```jsx
// In App.jsx — outside <Canvas>
{activeSector === 'projects' && <ProjectsSector />}
{activeSector === 'about'    && <AboutSector />}
{activeSector === 'skills'   && <SkillsSector />}
{isMobile && phase >= 3 && !activeSector && <MobileGateway />}
```

**Fade-in:** Each sector component handles its own opacity 0→1 fade using a CSS transition on mount via `useEffect` setting a `visible` state boolean (same pattern as existing `mainVisible` fade in App.jsx).

### Pattern 4: Typewriter Terminal (ABOUT-03/04)

**What:** Character-by-character append to a React state string using `setTimeout`. Do NOT use `setInterval` — `setTimeout` chaining gives precise per-character control and allows early cleanup on unmount.

**Critical:** Cancel all pending timeouts in the `useEffect` cleanup function using a `cancelled` ref or an array of timeout IDs.

```jsx
// Core typewriter pattern
const timeoutsRef = useRef([])

function typeSequence(sequences, onDone) {
  let totalDelay = 0
  sequences.forEach(({ cmd, output, pauseAfter = 400 }) => {
    // Type the command
    for (let i = 0; i <= cmd.length; i++) {
      const delay = totalDelay + i * 35
      timeoutsRef.current.push(
        setTimeout(() => appendLine(prev => prev + cmd[i] || ''), delay)
      )
    }
    totalDelay += cmd.length * 35 + pauseAfter
    // Append output line
    timeoutsRef.current.push(
      setTimeout(() => appendOutput(output), totalDelay)
    )
    totalDelay += pauseAfter
  })
  timeoutsRef.current.push(setTimeout(onDone, totalDelay))
}

useEffect(() => {
  typeSequence(TERMINAL_SEQUENCE, () => setDone(true))
  return () => timeoutsRef.current.forEach(clearTimeout)
}, [])
```

**Auto-scroll:** After each character append, call `terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight`.

### Pattern 5: Skills Graph Canvas 2D (SKILLS-02/03/04/05)

**What:** A Canvas 2D component that maintains a local animation state object (not React state) and a single `requestAnimationFrame` loop that only runs during transitions.

**Key insight:** Do NOT use React state for animation progress — setState inside rAF causes re-renders that fight the canvas. Instead, use mutable `useRef` objects for all animation state, and only call canvas `draw()` directly within the rAF loop.

```jsx
// Animation state (mutable refs, not React state)
const expandedRef = useRef({})   // { [categoryId]: true/false }
const racersRef   = useRef([])   // active racer objects: { x, y, targetX, targetY, progress, color }
const rafRef      = useRef(null)

function startExpansion(category) {
  // populate racersRef with one racer per skill
  racersRef.current = category.skills.map((skill, i) => {
    const angle = (2 * Math.PI * i) / category.skills.length
    return { /* origin, target, progress: 0, ... */ }
  })
  // start rAF loop
  if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
}

function tick(timestamp) {
  // advance all racer progress
  // if all done, cancel rAF
  // redraw canvas
  if (hasActiveRacers) {
    rafRef.current = requestAnimationFrame(tick)
  } else {
    rafRef.current = null
  }
}
```

**Resize handling:** Use `ResizeObserver` on the container div (more reliable than `window.resize`). On resize, update canvas `width`/`height` attributes and recalculate node positions from new center.

**Hover hit-testing:** In the `mousemove` handler, iterate over all visible node positions, compute distance from mouse, and set a `hoverNodeRef`. Trigger a single canvas redraw. Keep `draw()` as a pure function that reads from refs — never from React state.

### Pattern 6: isMobile Hook

**What:** A custom hook using `matchMedia` with change listener. Return value is stable on server (SSR not applicable here, but good practice).

```jsx
// src/hooks/useMobile.js
import { useState, useEffect } from 'react'
const QUERY = '(max-width: 767px)'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}
```

### Anti-Patterns to Avoid

- **GSAP on R3F camera from outside Canvas:** `gsap.to(camera.position, ...)` must be called from inside a component rendered inside `<Canvas>` where `useThree()` works. Calling it from App.jsx where there is no R3F context will silently fail or produce no animation.
- **React state for canvas animation progress:** Using `setState` inside `requestAnimationFrame` causes re-render storms. Use `useRef` for all animation state and call `canvas.getContext('2d')` + draw directly.
- **Multiple rAF loops running simultaneously:** If the user rapidly clicks multiple Tier 1 nodes, multiple loops could pile up. Guard with a single `rafRef` and cancel the previous loop before starting a new expansion/collapse.
- **Forgetting to clean up rAF on component unmount:** `SkillsSector` unmounts when `activeSector` changes. Always `cancelAnimationFrame(rafRef.current)` in the `useEffect` cleanup.
- **Forgetting `overflow: hidden` on html/body for overlay scroll:** `src/index.css` sets `overflow: hidden` on `html, body, #root`. Sector overlays are `position: fixed`, so they escape the parent overflow — their internal `overflow-y: auto` works correctly. No change needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Camera animation | Custom lerp in useFrame | GSAP `gsap.to(camera.position)` | GSAP handles easing, kill(), chaining, onComplete callbacks |
| Blur behind overlay | Three.js SelectiveBloom/blur pass | CSS `backdrop-filter: blur()` | Already GPU composited, zero JS cost, Safari 15.4+ and all modern browsers |
| Typewriter timing | Custom rAF timer with frame counting | Chained `setTimeout` calls | `setTimeout` is device-independent; rAF frame counting varies with display refresh rate |
| Mobile detection | Polling `window.innerWidth` in useFrame | `window.matchMedia` with change listener | matchMedia fires only on breakpoint change; polling runs every frame |
| OG image | Dynamic screenshot or Puppeteer | Static `/public/og-image.png` | Static asset works on Vercel with no build-time tooling; Puppeteer would require a server |

---

## Common Pitfalls

### Pitfall 1: Camera Transition Fires from Wrong Context

**What goes wrong:** GSAP cannot find the R3F camera if called outside the `<Canvas>` component tree. `camera` object is undefined or not the Three.js PerspectiveCamera instance.

**Why it happens:** `useThree()` only works inside components rendered by `@react-three/fiber`'s `<Canvas>`. App.jsx is outside Canvas.

**How to avoid:** Create `CameraController.jsx` that renders inside `<Canvas>` in `Scene.jsx` and reads `activeSector` from Zustand. It renders `null` (no geometry), purely a side-effect component.

**Warning signs:** Camera does not move; no error in console (GSAP silently tweens a plain JS object that isn't connected to Three.js).

### Pitfall 2: Double-Click Sector Transition

**What goes wrong:** User clicks a pane before the previous camera tween completes, starting a second GSAP tween that conflicts with the first, causing the camera to jump or stutter.

**Why it happens:** `onPointerDown` fires immediately; nothing prevents a second dispatch during the 1.0s animation.

**How to avoid:** Add `transitioning: false` to Zustand store. Set `transitioning: true` on pane click. Check `useAppState.getState().transitioning` in the `onPointerDown` handler before calling `setActiveSector`. Set `transitioning: false` in the `onComplete` callback. Note: `getState()` (not the hook) is used in event handlers to avoid stale closure.

**Warning signs:** Camera ends up in unexpected positions after rapid clicking.

### Pitfall 3: Pane Opacity GSAP Target

**What goes wrong:** Trying to `gsap.to(meshRef.current.material, { opacity: 0 })` where `material` is a `meshBasicMaterial` with `transparent: false` by default — opacity change has no visual effect.

**Why it happens:** Three.js materials only honor `opacity` when `transparent: true` is set. The GatewayPane mesh material already has `transparent: true` and `opacity: 0.82` — so GSAP can tween it directly. But pane fade requires tweening the group's `material.opacity`, accessed via `paneRef.current.children[0].material.opacity`.

**How to avoid:** Confirm `transparent: true` is set on the material before animating opacity. Check GatewayPane.jsx — `meshBasicMaterial` already has `transparent` and `opacity={0.82}`. For the lineSegments child (edge geometry), `lineBasicMaterial` also has `transparent opacity={0.8}`. Both need to be faded. In practice, it is simpler to fade the pane via CSS opacity on an HTML wrapper OR to tween both material opacities in parallel. The pane group has two children: the plane mesh and the lineSegments.

**Warning signs:** Pane visually does not fade during transition even though GSAP runs.

### Pitfall 4: Canvas 2D Resolution vs CSS Size Mismatch (Blurry Skills Graph)

**What goes wrong:** Skills canvas looks blurry on retina/HiDPI displays.

**Why it happens:** Setting `canvas.style.width = '100%'` and `canvas.style.height = '100%'` in CSS does not change the canvas resolution (its `width` and `height` attributes). On a 2x display, CSS pixels are 2× device pixels — the canvas renders at half the display resolution.

**How to avoid:** Scale canvas resolution by `window.devicePixelRatio`:
```js
const dpr = window.devicePixelRatio || 1
canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
ctx.scale(dpr, dpr)
// Then use CSS pixel values for all draw calls
```
Reapply on resize. This is the same pattern Three.js uses internally (`dpr={[1, 2]}` in the App.jsx Canvas).

**Warning signs:** Smooth circles look jagged/fuzzy on MacBook displays.

### Pitfall 5: Terminal Typewriter Memory Leak on Unmount

**What goes wrong:** User navigates away from About sector mid-typewriter sequence. setTimeout callbacks fire after component unmount, attempting to call setState on an unmounted component, producing React warnings and potential state corruption.

**Why it happens:** `setTimeout` IDs are not automatically cleared on React component unmount.

**How to avoid:** Collect all timeout IDs in a `useRef` array. Return a cleanup function from `useEffect` that calls `clearTimeout` on all of them:
```js
useEffect(() => {
  const ids = []
  // ... push timeout IDs into ids
  return () => ids.forEach(clearTimeout)
}, [])
```

**Warning signs:** "Can't perform a React state update on an unmounted component" warning in console.

### Pitfall 6: `overflow: hidden` on Root vs Sector Scroll

**What goes wrong:** Projects overlay `overflow-y: auto` does not scroll — content is clipped.

**Why it happens:** `src/index.css` sets `overflow: hidden` on `html, body, #root`. A `position: fixed` element escapes this, so the overlay itself can scroll if it has `overflow-y: auto`. However, if the overlay is not `position: fixed` but instead `position: absolute`, it will be clipped by the parent.

**How to avoid:** Ensure all sector overlay containers use `position: fixed` (not absolute), `width: 100vw`, `height: 100vh`, and `overflow-y: auto` (Projects) or `overflow: hidden` (About/Skills, which handle scroll internally).

**Warning signs:** Projects card list is cut off; cannot scroll to see more projects.

### Pitfall 7: Favicon Script Before Font Load

**What goes wrong:** The inline favicon script in `<head>` runs before the TR2N font is loaded, so the "T" renders in a system fallback font.

**Why it happens:** `<script>` in `<head>` executes synchronously during HTML parse. Custom fonts are not available yet.

**How to avoid:** Either (a) use the `FontFace` API to load the font programmatically before drawing, or (b) use a `DOMContentLoaded` event listener, or (c) simplify the favicon to use a bold system font (e.g., Arial Black) that is immediately available. The cleanest approach for this project: use `document.fonts.ready.then(...)` inside the script.

**Warning signs:** Favicon shows a generic "T" in Arial instead of TR2N.

---

## Code Examples

Verified patterns from existing codebase:

### Existing GSAP Camera Pattern (from GatewayPanes.jsx)
```jsx
// Source: src/components/3D/GatewayPanes.jsx
useEffect(() => {
  paneRefs.forEach((ref) => {
    if (!ref.current) return
    ref.current.position.y = -5
    gsap.to(ref.current.position, {
      y: 1.5,
      duration: 1.5,
      ease: 'power2.out',
    })
  })
}, [])
// Same pattern applies to camera.position — same library, same API
```

### Existing Zustand Store (relevant fields for Phase 4)
```js
// Source: src/store/appState.js
const useAppState = create((set) => ({
  activeSector: null,                           // 'projects' | 'about' | 'skills' | null
  setActiveSector: (sector) => set({ activeSector: sector }),
  // ADD in Phase 4:
  // transitioning: false,
  // setTransitioning: (v) => set({ transitioning: v }),
}))
```

### Existing App.jsx Sector Render Point
```jsx
// Source: src/App.jsx — existing structure
// Sector overlays mount here, outside <Canvas>:
<div style={{ width: '100vw', height: '100vh', background: '#000' }}>
  {showBoot && <BootSequence ... />}
  <Canvas ...>
    <Scene />  {/* CameraController goes here inside Scene */}
  </Canvas>
  {/* ADD: */}
  {activeSector === 'projects' && <ProjectsSector />}
  {activeSector === 'about'    && <AboutSector />}
  {activeSector === 'skills'   && <SkillsSector />}
  {isMobile && phase >= 3 && !activeSector && <MobileGateway />}
  {/* existing HUD elements below */}
</div>
```

### Existing Canvas 2D Pattern (from GatewayPane.jsx — throttled idle, continuous on animation)
```js
// Source: src/components/3D/GatewayPane.jsx
useFrame((state, delta) => {
  const elapsed = state.clock.elapsedTime
  const isAnimating = d.direction !== 0
  if (isAnimating) {
    drawFrame(...)
    texture.needsUpdate = true
    lastDrawRef.current = elapsed
  } else if (elapsed - lastDrawRef.current > 0.125) {
    // ~8fps idle throttle
    drawFrame(...)
    texture.needsUpdate = true
    lastDrawRef.current = elapsed
  }
})
// Skills graph rAF loop uses same principle:
// draw every frame during animation, stop when done
```

### Pane Position Reference (from GatewayPanes.jsx)
```js
// Source: src/components/3D/GatewayPanes.jsx
const PANES = [
  { position: [0, 1.5, -8],     label: '>_ PROJECTS', seed: 1 },
  { position: [-6.93, 1.5, 4],  label: '>_ ABOUT_ME', seed: 2 },
  { position: [6.93, 1.5, 4],   label: '>_ SKILLS',   seed: 3 },
]
// Camera sector targets: 2 units past each pane on its approach axis
// PROJECTS: z moves from 14 → -10 (past pane at z=-8)
// ABOUT:    x moves toward -6.93, z toward 2 (past pane at [-6.93, _, 4])
// SKILLS:   x moves toward +6.93, z toward 2 (past pane at [6.93, _, 4])
```

### index.html Current State (what needs adding)
```html
<!-- Source: index.html — already present: -->
<title>Tanmay Goel — Software Developer</title>
<meta property="og:title" content="Tanmay Goel — Software Developer" />
<meta property="og:description" content="..." />
<meta property="og:type" content="website" />

<!-- MISSING — must add: -->
<meta name="description" content="..." />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Tanmay Goel — Software Developer" />
<meta name="twitter:image" content="/og-image.png" />
<!-- Favicon inline script -->
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.addEventListener('resize', ...)` | `ResizeObserver` | Widely available since 2020 | More reliable — fires when element resizes, not just window |
| `window.innerWidth < 768` polling | `window.matchMedia` with `addEventListeener('change')` | CSS Media Queries Level 4 | Event-driven — no polling, no stale values |
| CSS transitions for opacity fade-in | Mix: CSS transitions for HTML elements, GSAP for Three.js objects | Ongoing | Use CSS transitions for HTML overlays (simpler), GSAP for Three.js (required) |

**Deprecated/outdated:**
- `mq.addListener()` on MediaQueryList: deprecated in favor of `mq.addEventListener('change', ...)` — use the newer form.
- `canvas.toDataURL('image/x-icon')`: favicons set via script should use `'image/png'` type on the `<link>` rel="icon" — PNG is universally supported; ICO format is legacy.

---

## Open Questions

1. **Exact camera positions for sector entry**
   - What we know: Pane positions from GatewayPanes.jsx (PROJECTS at z=-8, ABOUT at [-6.93,_,4], SKILLS at [6.93,_,4])
   - What's unclear: Precise camera height (Y) and look-at target when entering each sector
   - Recommendation: Claude's discretion (per CONTEXT.md). Suggest: Y drops from 8 to ~4 during dive to feel like flying through the pane. Look-at should be the pane center. Exact values fine-tuned during implementation.

2. **Monolith geometry visible behind Projects overlay**
   - What we know: CONTEXT.md says "monolith silhouettes remain visible as dark geometry" behind Projects overlay
   - What's unclear: Do monoliths need to already be in the scene before the pane click, or mount on sector entry?
   - Recommendation: Mount Monolith components inside `<Scene>` conditionally on `activeSector === 'projects'`. They appear at the same time the overlay fades in. No pre-loading needed.

3. **projects.js data population blocker**
   - What we know: All three project entries are TBD placeholders
   - What's unclear: Whether the executor can proceed with placeholder data for structure, then user fills in
   - Recommendation: Build all components against the schema; use TBD values for initial testing; include a task step that explicitly prompts user to fill `src/data/projects.js` and `src/data/contact.js` before final QA.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files, no test directory, no jest/vitest config |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run lint` (ESLint, already configured) |
| Full suite command | None yet |

No test infrastructure exists in this project. Given the visual/WebGL-heavy nature and the project's current velocity (no tests in Phases 1–3), formal unit tests are impractical for most Phase 4 requirements. The verification approach is manual browser testing with specific acceptance criteria.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROJ-01 | Camera lerps through Projects pane | manual-only | n/a — requires WebGL render | ❌ manual |
| PROJ-02 | Monoliths render from projects.js data | manual-only | n/a — WebGL visual | ❌ manual |
| PROJ-03 | Active project shows Crimson Red + IN PROGRESS badge | manual-only | n/a — visual | ❌ manual |
| PROJ-04 | Hover triggers bob + emissive brightness | manual-only | n/a — animation | ❌ manual |
| PROJ-05 | Click opens GitHub URL in new tab | manual-only | n/a — browser navigation | ❌ manual |
| PROJ-06 | No hardcoded project data in components | lint/code-review | `npm run lint` | ✅ (ESLint) |
| ABOUT-01 | Camera flies into About, viewport fills | manual-only | n/a | ❌ manual |
| ABOUT-02 | Heavy blur behind terminal | manual-only | n/a — visual | ❌ manual |
| ABOUT-03 | Typewriter sequence completes correctly | manual-only | n/a — timing/animation | ❌ manual |
| ABOUT-04 | Contact links are clickable anchors | manual-only | n/a — browser | ❌ manual |
| SKILLS-01 | Camera flies into Skills | manual-only | n/a | ❌ manual |
| SKILLS-02 | Canvas graph renders 5 Tier 1 nodes | manual-only | n/a — canvas visual | ❌ manual |
| SKILLS-03 | Click expands Tier 2 with light-racer | manual-only | n/a — animation | ❌ manual |
| SKILLS-04 | Second click collapses Tier 2 | manual-only | n/a | ❌ manual |
| SKILLS-05 | Hover highlights node + edges | manual-only | n/a | ❌ manual |
| NFR-02 | Mobile layout at <768px | manual-only | DevTools mobile emulation | ❌ manual |
| NFR-04 | OG meta tags present in index.html | code-review | `npm run build && grep "og:image" dist/index.html` | ✅ after build |
| NFR-05 | Favicon renders as crimson T | manual-only | browser visual | ❌ manual |

**Justification for manual-only:** This is a visual portfolio with WebGL rendering, Canvas 2D animation, and GSAP tweens. Unit testing WebGL output requires jsdom + WebGL mock infrastructure that has never been established in this project. The Phase 4 verifier agent should use a checklist-based browser test instead.

### Sampling Rate

- **Per task commit:** `npm run lint` + `npm run build` (catches syntax errors and import failures)
- **Per wave merge:** `npm run build && npm run preview` (full visual check in browser)
- **Phase gate:** All 18 requirement checkboxes verified in browser (desktop Chrome + DevTools mobile emulation) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `npm run build` baseline — ensure no pre-existing build errors before Phase 4 work begins
- [ ] Vitest install optional: `npm install -D vitest @vitest/ui` — only if executor wants to add data-layer unit tests (e.g., testing that projects.js exports correct schema shape)

---

## Sources

### Primary (HIGH confidence)

- Existing codebase: `src/store/appState.js` — Zustand store shape, activeSector already wired
- Existing codebase: `src/components/3D/GatewayPane.jsx` — Canvas 2D texture pattern, GSAP usage, onPointerEnter/Leave
- Existing codebase: `src/components/3D/GatewayPanes.jsx` — PANES positions, GSAP in useEffect pattern
- Existing codebase: `src/App.jsx` — overlay render architecture, where to mount sector components
- Existing codebase: `src/components/Scene.jsx` — OrbitControls integration point
- Existing codebase: `src/data/projects.js`, `skills.js`, `contact.js` — data schemas
- Existing codebase: `index.html` — current OG tags state (og:image missing)
- `.planning/phases/04-sector-dives-finish/04-CONTEXT.md` — all locked implementation decisions
- `.planning/phases/04-sector-dives-finish/04-UI-SPEC.md` — component inventory, spacing/color/typography contract
- `package.json` — exact dependency versions installed

### Secondary (MEDIUM confidence)

- MDN Web Docs pattern: `window.matchMedia` with `addEventListener('change')` — well-established modern pattern
- MDN Web Docs pattern: `ResizeObserver` for canvas resize — standard since 2020
- MDN Web Docs pattern: `document.fonts.ready.then()` for font-dependent canvas operations

### Tertiary (LOW confidence)

- None — all findings are from verified codebase inspection or established web platform APIs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all libraries already installed and in use
- Architecture: HIGH — patterns verified directly from existing Phase 3 code
- Pitfalls: HIGH — identified from direct code inspection of integration points
- Validation: HIGH — manual testing is the correct approach for this visual portfolio

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable stack — no fast-moving dependencies; GSAP/R3F/Three.js APIs won't change meaningfully in 30 days)
