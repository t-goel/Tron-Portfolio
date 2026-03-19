# Stack Research

**Domain:** UX polish features for Tron-themed WebGL portfolio SPA
**Researched:** 2026-03-19
**Confidence:** HIGH

## Summary Verdict

**No new libraries required.** All four v1.1 features are fully implementable with the existing stack. The work is about using existing tools differently — not adding dependencies.

---

## Existing Stack (Do Not Change)

| Technology | Installed Version | Role in v1.1 |
|------------|------------------|--------------|
| React 19 | 19.2.0 | `useState`/`useEffect`/`useRef` for terminal input, boot log, timing |
| Three.js | 0.183.2 | `camera.fov` + `camera.updateProjectionMatrix()` for warp effect |
| @react-three/fiber | 9.5.0 | `useFrame` loop drives per-frame FOV lerp during warp |
| GSAP | 3.14.2 | Camera position tween on sector exit; title screen timing tweak |
| Zustand | 5.0.11 | Extend store with `warping` flag to coordinate warp animation + exit |
| Tailwind CSS | 4.2.1 | Utility classes for boot terminal layout (monospace, dark bg) |

---

## Feature-by-Feature Stack Analysis

### BOOT-05: Tron Terminal Boot Screen

**What it replaces:** Current `BootSequence.jsx` uses a white-background shard animation. BOOT-05 replaces the loading indicator portion with a dark-background monospace scrolling boot log before the shard/crack animation plays (or as an alternative loading state).

**Stack needed:**
- `useState` — array of log lines already appended
- `useEffect` + `setInterval` — drip-feed log lines at ~80ms intervals
- CSS `font-family: 'Roboto Mono'` — already loaded in the project
- Tailwind `bg-black text-[#00FFFF] font-mono` — zero new classes needed

**Integration point:** Replace or prepend to `BootSequence.jsx`. The `onComplete` callback contract stays the same so `App.jsx` requires no changes.

**New library needed:** None. This is a `setTimeout`/`setInterval` drip pattern, identical to what `AboutSector.jsx` already does for its typewriter engine.

---

### NAV-05: Hyper-Reverse Camera Warp

**What it does:** On sector exit, camera rapidly pulls backward with FOV expanding (creating a tunnel/warp illusion), then snaps back to home position.

**Stack needed:**

1. **GSAP 3.14.2** — tween `camera.position` to a far-back Z (e.g., `z: 60`) over ~0.4s with `power3.in` ease, then immediately tween to `HOME_POSITION` at `power2.out`. Already used in `CameraController.jsx` for all camera moves.

2. **Three.js `camera.fov` + `camera.updateProjectionMatrix()`** — GSAP can tween `camera.fov` directly from 60 → 100 (warp stretch) → back to 60. Must call `camera.updateProjectionMatrix()` on each tick. Do this in an `onUpdate` callback on the GSAP tween — no `useFrame` loop needed.

3. **R3F `useThree`** — already imported in `CameraController.jsx`, gives `camera` ref access.

**Pattern (verified against existing code):**
```js
// In CameraController.jsx — extend the existing activeSector=null branch
gsap.timeline()
  .to(camera.position, { z: 60, duration: 0.35, ease: 'power3.in' })
  .to(camera, { fov: 95, duration: 0.35, ease: 'power3.in',
    onUpdate: () => camera.updateProjectionMatrix() }, '<')
  .to(camera.position, { x: 0, y: 8, z: 14, duration: 0.5, ease: 'power2.out' }, '>')
  .to(camera, { fov: 60, duration: 0.5, ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix() }, '<')
```

**GSAP Timeline (`gsap.timeline()`) is available in GSAP 3.x** — already installed, no plugin needed.

**New library needed:** None.

---

### ABOUT-05 / ABOUT-06: Interactive Terminal Input

**What it does:** After the typewriter sequence completes, the terminal accepts keyboard input. Typing "exit" and pressing Enter calls `setActiveSector(null)`. A hint line is displayed before input is active.

**Stack needed:**
- `useState` — `inputValue` string buffer
- `useEffect` — `document.addEventListener('keydown', handler)` — standard browser API
- `useRef` — `inputRef` to keep `inputValue` current inside the event closure (stale closure avoidance)
- `setActiveSector` from Zustand — already in the store

**Integration point:** Extend `AboutSector.jsx`. When `done === true` (typewriter finished), activate input mode. Add a `keydown` listener that appends printable characters and handles Backspace/Enter.

**Key implementation note:** Use `useRef` to mirror `inputValue` for the event listener closure. Do NOT rely on stale state capture in `addEventListener` — the existing `AboutSector.jsx` uses this same `useRef` pattern for `timeoutsRef`.

**New library needed:** None. No need for a headless input library — a 30-line `useEffect` is sufficient and avoids over-engineering.

---

### TITLE-01: Title Screen Text Clears Faster

**What it does:** When the CTA ("ENTER THE GRID") button is clicked, title text currently fades out over 1 second (`transition: 'opacity 1s ease-in'` in `TitleOverlay.jsx`). The fix makes it clear in ~200ms.

**Stack needed:**
- Option A (minimal): Change `transition: 'opacity 1s ease-in'` to `'opacity 0.2s ease-out'` in `TitleOverlay.jsx`. The `visible` prop already drives opacity. This is a one-line CSS change.
- Option B (GSAP, if smoother easing is desired): In `App.jsx`, when `EnterButton` fires the CTA handler, run `gsap.to(titleRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in' })` before calling `setPhase(3)`.

**Recommendation:** Option A first. If it feels abrupt, use Option B. GSAP is already imported in `App.jsx` so zero additional setup.

**New library needed:** None.

---

## Stack Additions: None Required

| Considered | Verdict | Reason |
|------------|---------|--------|
| `xterm.js` | Skip | Full terminal emulator — massive overkill for a static typewriter with one recognized command ("exit"). The existing hand-rolled typewriter in `AboutSector.jsx` is ~150 lines and already does more than needed. |
| `framer-motion` | Skip | GSAP already handles all animation. Adding framer-motion creates a second animation system with conflicting mental models and bundle cost (~45KB gzipped). |
| React `<input>` element for terminal | Skip | A real `<input>` breaks the terminal illusion (focus rings, browser autocomplete, mobile keyboard pop-up). Raw `keydown` on document is correct for this use case. |
| `@react-three/fiber` `useFrame` for warp | Unnecessary | GSAP's `onUpdate` callback fires synchronously each tween tick, which is sufficient to call `camera.updateProjectionMatrix()`. `useFrame` would work too but adds complexity without benefit. |

---

## Integration Constraints

### Camera Warp + `setTransitioning` Flag

`CameraController.jsx` already sets `transitioning: true` at the start of any camera move and `false` on `onComplete`. The warp animation must respect this — don't allow pane clicks or disc clicks while `transitioning` is true. The existing `GatewayPane.jsx` likely already checks `transitioning`; verify this before implementing.

### Zustand Store Extension for Warp

The warp animation is a new exit path (sector → grid). Consider adding `warping: false` / `setWarping` to the store so the warp-visual state (FOV expanded, grid lines stretched) can be read by components that need to hide their UI during the transition (e.g., the HUD disc click target).

### Boot Terminal + SessionStorage Gate

The existing `BootSequence.jsx` is skipped on repeat visits via sessionStorage. The new terminal boot screen must respect the same gate — it replaces visual content inside `BootSequence`, not the gate logic.

### Keydown Listener Cleanup

The `keydown` listener in `AboutSector.jsx` must be removed on unmount via the `useEffect` cleanup return. The existing `timeoutsRef` pattern shows the team already handles cleanup correctly — follow the same structure.

---

## Version Compatibility

| Package | Version | Compatibility Note |
|---------|---------|-------------------|
| GSAP 3.14.2 | `gsap.timeline()` | Available since GSAP 3.0. No plugin needed for basic timeline/tween. |
| Three.js 0.183.2 | `camera.fov` + `updateProjectionMatrix()` | Stable API, unchanged across all Three.js r100+. |
| R3F 9.5.0 | `useThree({ camera })` | Stable API. R3F 9.x requires React 19 — already installed. |
| React 19.2.0 | `useEffect` keydown | Standard. No React 19 breaking changes affect `addEventListener` patterns. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `xterm.js` | 300KB+ bundle cost, complex API, full VT100 emulation for a feature that needs one recognized command | Raw `keydown` + `useState` in `AboutSector.jsx` |
| `framer-motion` | Redundant with GSAP, different mental model, ~45KB gzipped, no R3F integration | GSAP (already installed) |
| CSS `@keyframes` for camera warp | Cannot animate Three.js camera object properties from CSS | GSAP tween on `camera.position` and `camera.fov` |
| `react-terminal-ui` or similar | Opinionated styling that fights the existing Tron aesthetic | Hand-rolled DOM terminal (already proven in `AboutSector.jsx`) |

---

## Sources

- Codebase inspection: `/Users/tanmaygoel/CS/Tron-Portfolio/src/` — installed versions verified via `node_modules` package.json files
- GSAP 3.x Timeline API: https://gsap.com/docs/v3/GSAP/Timeline/ — `onUpdate` callback confirmed available on individual tweens within a timeline (HIGH confidence, stable since GSAP 3.0)
- Three.js `PerspectiveCamera.updateProjectionMatrix()`: https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.updateProjectionMatrix — required after any FOV change (HIGH confidence, stable API)
- R3F `useThree` hook: https://docs.pmnd.rs/react-three-fiber/api/hooks#usethree — returns live `camera` ref (HIGH confidence)
- Existing pattern reference: `CameraController.jsx` lines 28-35 — confirms GSAP tweens `camera.position` directly in this codebase

---
*Stack research for: Digital Dominion v1.1 UX polish features*
*Researched: 2026-03-19*
