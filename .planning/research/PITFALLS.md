# Pitfalls Research

**Domain:** UX Polish — R3F + GSAP + Zustand SPA (Tron Portfolio v1.1)
**Researched:** 2026-03-19
**Confidence:** HIGH — based on direct codebase analysis + known R3F/GSAP integration patterns

---

## Critical Pitfalls

### Pitfall 1: GSAP onComplete Stale Closure Calls setPhase/setActiveSector on Unmounted Component

**What goes wrong:**
A GSAP tween fires `onComplete` after the component that started it has unmounted or the state it references has changed. For the warp-speed reverse animation, if the user clicks ESC and re-enters a sector before the GSAP tween finishes, `onComplete: () => setActiveSector(null)` fires on the old closure. The result is `activeSector` getting nulled mid-transition or double-firing phase changes.

**Why it happens:**
GSAP tweens are not React-aware. The `onComplete` callback captures the function reference at creation time. If the component re-renders and the effect cleanup does not `tween.kill()`, the tween outlives the effect scope. This already exists as a latent risk in `CameraController.jsx` — the `eslint-disable react-hooks/exhaustive-deps` comment on line 52 suppresses the warning that `setTransitioning` is not in the dependency array. The warp exit animation will compound this risk because it chains multiple tweens.

**How to avoid:**
- Always store tweens in a `useRef` and call `.kill()` in effect cleanup (already done in `CameraController`, model this pattern everywhere)
- For multi-step tween chains (`gsap.timeline()`), kill the entire timeline ref on cleanup
- Call `useAppState.getState().setActiveSector(null)` inside `onComplete` instead of closing over a stale React state setter — `getState()` reads live Zustand state, bypassing the closure staleness issue
- Never chain `setPhase` calls across tween callbacks without a guard: check `useAppState.getState().activeSector` before acting

**Warning signs:**
- Sector appears to flash open and close during rapid navigation
- `transitioning` flag gets stuck as `true` permanently after animation
- Console shows "Can't perform state update on unmounted component" (React 17 pattern; React 18 silences this but the bug still occurs)

**Phase to address:**
NAV-05 (Hyper-reverse camera warp) — architect the full tween timeline before implementing, kill all refs in cleanup

---

### Pitfall 2: Canvas `frameloop="never"` Blocks R3F During Boot Replacement

**What goes wrong:**
`App.jsx` sets `<Canvas frameloop={showBoot ? 'never' : 'always'}>`. The new BOOT-05 feature replaces the boot screen with a terminal log animation. If the terminal log plays while `showBoot` is still `true`, the entire R3F render loop is paused — which is fine for the boot phase but creates a timing trap: any logic that queries the Three.js camera, scene, or renderer during the new boot will silently fail because the canvas has never rendered a frame.

**Why it happens:**
The current boot sequence is purely DOM/CSS — it does not touch the Three.js context at all. Once BOOT-05 adds a terminal overlay that might visually fade into the 3D scene, developers are tempted to start the R3F loop early for a smooth transition. Switching `frameloop` from `'never'` to `'always'` mid-render triggers a full R3F context reset.

**How to avoid:**
- Keep `frameloop` locked to `'never'` until `handleBootComplete` fires — do not tie it to a intermediate "terminal visible" state
- The terminal boot log is a purely DOM overlay: render it at `z-index: 50` on top of the black background, then call `onComplete` when the log finishes, same as the current shatter sequence does
- Do not try to "fade into" the 3D scene from inside the boot component — preserve the existing `handleBootComplete` → `setMainVisible(true)` → black fade-out pattern

**Warning signs:**
- 3D scene appears to "restart" with a white flash after boot
- `useThree()` calls return undefined during boot-adjacent effects
- OrbitControls jerk on first interaction after boot

**Phase to address:**
BOOT-05 (Terminal boot log) — design the overlay as a DOM-only layer with no 3D dependencies

---

### Pitfall 3: Keyboard Event Listener Conflicts with R3F Canvas Focus

**What goes wrong:**
Adding `document.addEventListener('keydown', ...)` for ESC-to-exit (NAV-04) and terminal input (ABOUT-05) creates an invisible conflict: the R3F `<Canvas>` element captures focus on pointer interaction. After a user clicks a gateway pane to enter a sector, the canvas element holds focus. If the ESC listener is on `document`, it fires — but so does every other keydown that R3F might be consuming internally (e.g., OrbitControls sometimes binds keys). Terminal input in the About sector also competes: the `<input>` element needs browser focus, but the canvas frequently steals it back on any click within the 3D viewport area.

**Why it happens:**
`document` listeners always fire regardless of focus. R3F does not expose a clean "this canvas is focused" API. The terminal input is a DOM element in a `position: fixed` overlay above the canvas — but any click on the canvas area (even if the pane overlay is visible) can pull focus back to the canvas, silently eating typed characters.

**How to avoid:**
- For NAV-04 (ESC): listen on `document` is correct, but guard: `if (!useAppState.getState().activeSector) return` prevents firing when on the grid. Remove listener (cleanup in `useEffect` return) when `activeSector` is null
- For ABOUT-05 terminal input: call `inputRef.current.focus()` inside `useEffect` when `activeSector === 'about'` and the terminal mounts. Add `onBlur={() => inputRef.current?.focus()}` to re-claim focus when the canvas steals it. This is a known pattern for WebGL + HTML input coexistence
- Disable OrbitControls (`enabled={false}`) while inside any sector — already conditionally rendered via `!activeSector` in `Scene.jsx`, so this is already handled, but verify the `<Canvas>` itself does not capture keystrokes via `tabIndex`
- Always return cleanup functions: `return () => document.removeEventListener('keydown', handler)` — missing this is the most common source of duplicate listener firing after hot-reload

**Warning signs:**
- ESC fires twice per keypress (listener added but not cleaned up on re-render)
- Terminal input stops accepting characters after clicking elsewhere on the page
- After exiting a sector via ESC, subsequent ESC presses still fire the handler

**Phase to address:**
NAV-04 (ESC key) and ABOUT-05 (interactive terminal) — write a shared `useKeydown(key, callback, active)` hook rather than ad-hoc `addEventListener` calls in each component

---

### Pitfall 4: GSAP Tweens Directly Mutate Three.js Camera That R3F Also Owns

**What goes wrong:**
`CameraController.jsx` already uses `gsap.to(camera.position, ...)` — this pattern works but is fragile. The warp-speed reverse animation (NAV-05) needs to tween camera `position`, `fov`, and possibly `rotation`. GSAP mutating `camera.fov` requires `camera.updateProjectionMatrix()` after each tick, which GSAP does not call automatically. Forgetting this produces a camera that appears frozen or distorted mid-animation.

Additionally, if `OrbitControls` is mounted (it renders when `!activeSector`), it resets `camera.position` each frame via its own update loop. The current code unmounts OrbitControls when `activeSector` is truthy — but during the outgoing tween (sector → grid), there is a window where `setActiveSector(null)` fires first (in `onComplete`) and OrbitControls remounts before the camera reaches home position, causing it to snap.

**Why it happens:**
R3F's `useFrame` loop and GSAP both run every animation frame, both writing to the same camera object. The order of execution is deterministic within a frame (GSAP fires in its own RAF, then R3F fires in its RAF) but the interaction is untested across tween completion boundaries.

**How to avoid:**
- When tweening `camera.fov`, use a GSAP proxy object: `gsap.to({ fov: camera.fov }, { fov: targetFov, onUpdate: function() { camera.fov = this.targets()[0].fov; camera.updateProjectionMatrix() } })`
- Keep `setActiveSector(null)` inside `onComplete`, not at the start of the exit animation — this ensures OrbitControls does not remount until the camera has already reached home
- Set `setTransitioning(true)` at animation start and clear it in `onComplete`; use `transitioning` as an additional OrbitControls disable flag: `<OrbitControls enabled={!activeSector && !transitioning} />`
- For the warp effect itself, prefer a MotionBlur/streak via postprocessing rather than actually moving the camera at extreme speed — extreme camera velocity causes the Bloom `EffectComposer` to produce visible frame artifacts

**Warning signs:**
- Camera appears to "snap" to home position after sector exit instead of animating
- Scene stretches or distorts horizontally mid-animation (indicates `fov` changed without `updateProjectionMatrix`)
- OrbitControls fights GSAP and camera oscillates briefly after arriving home

**Phase to address:**
NAV-05 (Hyper-reverse warp) — extend `CameraController` rather than adding a second tween source; all camera animation must route through a single controller

---

### Pitfall 5: sessionStorage Boot Flag Not Checked Before New Terminal Boot Content Renders

**What goes wrong:**
The current `BootSequence` is always mounted when `showBoot === true` in `App.jsx` — but `App.jsx` has no sessionStorage check. The sessionStorage gate (`sessionStorage.getItem('bootSeen')`) is presumably elsewhere or was planned but never implemented (the PROJECT.md lists it as a validated requirement). For BOOT-05 (terminal boot log), if the sessionStorage check is added at the wrong level — e.g., inside `BootSequence` rather than in `App.jsx` — then `showBoot` stays `true` on repeat visits while the boot component renders nothing, leaving the app stuck on a black screen because `handleBootComplete` never fires.

**Why it happens:**
The boot gate logic needs to live at the same level that controls whether `BootSequence` is mounted at all, not inside the component. If it lives inside, the component still mounts (blocking the rest of the app) but returns null immediately without calling `onComplete`.

**How to avoid:**
- Add the sessionStorage check in `App.jsx` before render: if `sessionStorage.getItem('bootSeen')`, call `handleBootComplete()` synchronously (or initialize `showBoot` to `false` directly). Set `sessionStorage.setItem('bootSeen', '1')` at the end of the boot sequence animation, inside `handleBootComplete`
- Never return `null` from `BootSequence` without first calling `onComplete` — the component must always signal completion, even if it skips the animation
- When replacing the shatter sequence with a terminal log for BOOT-05, keep the same contract: the component calls `onComplete` when done, regardless of which animation played

**Warning signs:**
- App shows only black screen on second page load
- Phase stuck at 1 permanently on repeat visits
- `mainVisible` never becomes true, leaving the black fade overlay permanently opaque

**Phase to address:**
BOOT-05 (Terminal boot log) — audit the sessionStorage gate before any boot animation changes

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `eslint-disable react-hooks/exhaustive-deps` in CameraController | Avoids re-registering GSAP tween when setters change identity | Masks stale closure bugs in onComplete callbacks; harder to audit | Never — use `useCallback` for stable setter references instead |
| `document.addEventListener` in component body (not useEffect) | Simpler to write | Leaks listener on unmount; doubles on hot reload | Never — always wrap in useEffect with cleanup |
| `useAppState.getState()` inside event handlers | Reads live state without subscribing | Fine pattern for event handlers but bypasses React render cycle | Acceptable in click/keydown handlers, not in render logic |
| Inline `setTimeout` chains for boot animation timing | Quick to write | Inflexible to modify; cannot be killed cleanly on unmount | Only for one-shot animations with a `cancelled` flag guard (as AboutSector does) |
| Tweening `camera.position` directly without proxy | Works for position XYZ | Breaks for `fov` and `rotation.x/y/z` (needs updateProjectionMatrix / euler ordering) | Only for position tweens; use proxy objects for other camera properties |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GSAP + R3F camera | Tween `camera.position` works; tween `camera.fov` silently fails | Use `onUpdate` callback to call `camera.updateProjectionMatrix()` after each fov tick |
| @react-three/postprocessing EffectComposer + MotionBlur | Importing MotionBlur from wrong path (`postprocessing` vs `@react-three/postprocessing`) — different APIs | Use `import { MotionBlur } from '@react-three/postprocessing'`; the drei/postprocessing wrapper auto-handles render target setup |
| Zustand subscribe + React state | Mixing `useAppState.subscribe()` (vanilla) with hook selectors causes double-renders on fast transitions | Use hook selectors for component state, use `getState()` inside callbacks, use `subscribe` only for cross-module side effects (as done in App.jsx for audio sync) |
| HTML overlay + R3F Canvas z-index | `z-index` on DOM elements above a WebGL canvas does not affect Three.js object depth — only DOM stacking | Three.js labels must use `@react-three/drei`'s `<Html>` component or be placed as DOM overlays with fixed positioning; they cannot be mixed with 3D depth testing |
| Howler.js + sessionStorage boot gate | Audio `initAudio()` called before user gesture on second visit triggers browser autoplay block | Guard `playWithFade` with a user-gesture check; the existing `playerror` handler already does this for first visit, but must also handle the case where boot is skipped |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| MotionBlur/streak postprocessing effect always-on | FPS drops 20-30% on integrated graphics; Bloom + MotionBlur together amplify each other | Only activate MotionBlur during the warp exit tween (set `enabled` prop dynamically); disable after animation completes | Immediately on mid-range hardware |
| Canvas 2D `drawFrame` called every R3F frame during terminal boot overlay | Draws 600 glitch characters per frame while boot log is animating, even though boot log is separate DOM | The existing 8fps throttle in GatewayPane already handles this, but if the new boot log triggers a state change that mounts GatewayPanes early, they start drawing immediately | On boot, before user sees anything |
| Creating `new THREE.CanvasTexture` inside a render function | New GPU texture upload every render, rapidly fills VRAM | Already correctly avoided in GatewayPane via `useMemo` — copy this pattern for any new canvas textures (e.g., pane labels if implemented as separate textures) | Immediately, shows as steadily increasing GPU memory |
| `document.body.style.cursor` set in R3F `onPointerEnter/Leave` without cleanup | Cursor stays as `pointer` after navigating to a sector because `onPointerLeave` never fires | Add an explicit `document.body.style.cursor = 'auto'` when `activeSector` changes to non-null — currently GatewayPane sets cursor but sector transition bypasses the leave handler | When user clicks a pane and gets teleported to sector while cursor is still `pointer` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Terminal input `<input>` loses focus when user clicks terminal scroll area | Typed characters go nowhere; user thinks terminal is broken | Make the entire terminal body a click target that re-focuses the input on click, not just the input element itself |
| "exit" command is the only way out but hint displays after terminal finishes typing | User may close the tab before learning they can type | Show the hint ("type 'exit' to leave") as a persistent static line immediately when the terminal mounts, before the typewriter sequence begins |
| ESC key exits sector but no visual acknowledgement | User isn't sure ESC did anything if animation is slow | Flash a brief HUD overlay ("DISCONNECTING...") at the start of the exit animation before the camera warp begins |
| Hyper-reverse warp plays every time user exits — including from accidental sector entry | Motion-sensitive users, or users who entered by accident, experience disorientation repeatedly | Check if the sector was visited for <1 second and use a shorter/simpler exit animation; or offer a reduced-motion preference flag in Zustand |
| Pane labels always visible may reduce the mystery of hover-to-decrypt | The idle faint label already exists in GatewayPane at `decryptProgress === 0`; making it "more visible" could make the hover decrypt feel redundant | Increase the idle label opacity from 0.35 to 0.6 max rather than full brightness — preserve the "barely there until you hover" feel |

---

## "Looks Done But Isn't" Checklist

- [ ] **Boot terminal log (BOOT-05):** Calls `onComplete` even when sessionStorage gate skips the animation — verify second-visit page load reaches phase 2 within 500ms
- [ ] **ESC exit (NAV-04):** Listener is removed in `useEffect` cleanup — verify by switching sectors rapidly and checking no double-fire
- [ ] **Interactive terminal (ABOUT-05):** Input regains focus after canvas interaction — test by clicking the 3D background area while terminal is open, then typing
- [ ] **Warp camera animation (NAV-05):** GSAP timeline is killed in `useEffect` cleanup — verify no camera snap on rapid sector re-entry during animation
- [ ] **Warp animation + OrbitControls:** OrbitControls does not remount until `onComplete` fires — verify `transitioning` flag gates OrbitControls alongside `!activeSector`
- [ ] **Cursor state (GatewayPane):** `document.body.style.cursor` is reset to `'auto'` when entering a sector — verify by hovering a pane, clicking it, then returning to grid
- [ ] **Camera fov tween (if used for warp):** `camera.updateProjectionMatrix()` called on every tick — verify no horizontal distortion mid-animation
- [ ] **Disc click navigation (NAV-03):** HUD disc click in sector calls `setActiveSector(null)` not `setPhase(2)` — confirm it returns to grid, not title screen

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| GSAP tween outlives component, stale onComplete fires | LOW | Add `tweenRef.current?.kill()` to effect cleanup; replace closed-over setter with `useAppState.getState().setter()` |
| sessionStorage gate causes black screen on repeat visit | LOW | Add `if (sessionStorage.getItem('bootSeen')) { handleBootComplete(); return }` at top of App before mount |
| ESC listener leaks (fires twice per keypress) | LOW | Wrap in `useEffect` with `return () => document.removeEventListener(...)` |
| Camera snap after OrbitControls remounts too early | MEDIUM | Add `transitioning` flag to OrbitControls `enabled` condition; delay `setActiveSector(null)` to `onComplete` |
| MotionBlur causing FPS drop on all hardware | MEDIUM | Wrap effect in `enabled` prop tied to `isWarping` state; destroy postprocessing pass when not animating |
| Terminal input permanently losing focus | MEDIUM | Add `useEffect` that watches `activeSector === 'about'` and calls `inputRef.current?.focus()` with 100ms delay after mount |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| GSAP stale closure in onComplete | NAV-05 (warp animation) | Rapid click: enter sector → immediately click ESC → verify phase is grid not stuck |
| frameloop='never' / Canvas boot timing | BOOT-05 (terminal boot log) | Cold load: confirm 3D scene renders after boot; Repeat load: confirm no black screen |
| Keyboard listener leaks + canvas focus conflict | NAV-04 + ABOUT-05 | Open DevTools → enter/exit sectors 5 times → confirm no duplicate console events; type in terminal after clicking canvas border |
| GSAP + camera.fov missing updateProjectionMatrix | NAV-05 (warp animation) | Watch camera during warp exit on low-end device; confirm no horizontal stretch artifacts |
| OrbitControls remounts before camera reaches home | NAV-05 + NAV-03 | Click disc while warp animation is mid-flight; confirm no camera snap or oscillation |
| sessionStorage boot gate race condition | BOOT-05 (terminal boot log) | Open in private window (first visit), close, reopen — confirm boot is skipped and app loads in <500ms |
| Cursor stuck as pointer after sector entry | PANE-01 + NAV-03/04 | Hover a pane, click it immediately, return to grid — confirm cursor is default arrow |
| Terminal input focus loss | ABOUT-05 (interactive terminal) | While terminal is open, click the canvas background, then type "exit" — confirm characters appear in input |

---

## Sources

- Direct codebase analysis: `src/components/3D/CameraController.jsx`, `src/App.jsx`, `src/components/UI/BootSequence.jsx`, `src/components/UI/AboutSector.jsx`, `src/components/3D/GatewayPane.jsx`, `src/store/appState.js`, `src/utils/audioManager.js`
- GSAP + R3F integration: known pattern from GSAP docs (tween object properties, proxy pattern for non-position values)
- @react-three/postprocessing MotionBlur: component accepts `enabled` prop for runtime toggle
- Zustand `getState()` pattern: documented escape hatch for non-reactive reads in callbacks
- R3F Canvas focus behavior: known issue in R3F GitHub discussions (canvas captures pointer focus on click, competes with DOM inputs)

---
*Pitfalls research for: Tron Portfolio v1.1 — UX Polish milestone (R3F + GSAP + Zustand SPA)*
*Researched: 2026-03-19*
