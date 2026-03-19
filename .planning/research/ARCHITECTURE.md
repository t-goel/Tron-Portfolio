# Architecture Research

**Domain:** Tron Portfolio SPA — v1.1 Immersion Polish (UX features integration)
**Researched:** 2026-03-19
**Confidence:** HIGH (full source read, no external dependencies required)

---

## Existing Architecture Snapshot

Before documenting integration points, here is how the v1.0 system is actually structured (verified by source):

```
┌──────────────────────────────────────────────────────────────────────┐
│  App.jsx  (root orchestrator)                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  DOM Layer (fixed/absolute position overlays, zIndex 10–50)     │ │
│  │  BootSequence  TitleOverlay  EnterButton  ProjectsSector        │ │
│  │  AboutSector   SkillsSector  MobileGateway  HUD (inline JSX)   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  R3F Canvas  (absolute, top:0 left:0, behind DOM overlays)      │ │
│  │  Scene.jsx                                                      │ │
│  │  ├── CameraController  (GSAP, reads activeSector)               │ │
│  │  ├── GridFloor          (phase >= 3)                            │ │
│  │  ├── GatewayPanes       (phase >= 3, not mobile)                │ │
│  │  ├── Monolith[]         (activeSector === 'projects')           │ │
│  │  ├── OrbitControls      (phase >= 3, no activeSector, not mob)  │ │
│  │  └── EffectComposer     (Bloom + Vignette, always)              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│  Zustand Store  (appState.js)                                        │
│  phase · setPhase · audioEnabled · toggleAudio                       │
│  hudVisible · setHudVisible · activeSector · setActiveSector         │
│  transitioning · setTransitioning                                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Phase State Machine (current)

| Phase | Value | What's Rendered |
|-------|-------|-----------------|
| Boot | 1 | BootSequence (DOM overlay, full screen) |
| Title | 2 | TitleOverlay + EnterButton; Canvas frameloop='never' |
| Shatter+Dock | 3 | DOM disc animates top-left; Canvas starts |
| Grid World | 3+ HUD | GatewayPanes, GridFloor, OrbitControls |
| Sector | 3 + activeSector set | Sector overlay (DOM), camera GSAP'd to sector |

Note: there is no `phase: 4` or `phase: 5` constant — sectors are driven by `activeSector` string, not a separate phase number.

---

## Feature Integration Map

### BOOT-05 — Terminal Boot Loading Screen

**What changes:** Replace or wrap the current `BootSequence.jsx` Canvas 2D shatter animation with a Tron terminal log scroll.

**Recommended approach: replace BootSequence content, keep the component contract unchanged.**

The `App.jsx` interface is:
```jsx
{showBoot && <BootSequence onComplete={handleBootComplete} />}
```
`onComplete` fires `setShowBoot(false)` and starts the `mainVisible` fade-in. This contract can stay intact — just rewrite the internals.

**New internals:** A dark full-screen div with `font: 'Roboto Mono'`, lines array in state, `useEffect` that pushes log lines on a `setTimeout` schedule (similar pattern to `AboutSector` typewriter), then calls `setPhase(2)` midway and `onComplete()` at end (matching the existing timing hooks). The `playWithFade(2000)` and `initAudio()` calls currently inside `BootSequence` must be preserved or moved to the `handleBootComplete` callback in `App.jsx`.

**Files modified:** `src/components/UI/BootSequence.jsx` (replace internals)
**Files unchanged:** `App.jsx` (contract preserved)
**New files:** None
**Zustand:** No new state needed

---

### PANE-01 — Gateway Pane Labels Visible by Default

**What changes:** `GatewayPane.jsx` already renders a faint idle label at `decryptProgress === 0` (lines 88–96 of the source). The label is rendered via `ctx.fillStyle = 'rgba(0,255,255,0.35)'` at 35% opacity using the TR2N font at 14px.

**This is already implemented.** Verify visually — the label may just need opacity increased, or font size bumped to be clearly readable without hover. The `drawFrame` function's idle branch at line 88 is the single change point.

**Files modified:** `src/components/3D/GatewayPane.jsx` — adjust `fillStyle` opacity (0.35 → 0.6–0.7) and/or `fontSize` in the `decryptProgress === 0` block
**New files:** None
**Zustand:** No new state needed

---

### PANE-02 — Navigation Hint on First Grid Entry

**What changes:** A one-time tooltip/overlay shown once after `hudVisible` becomes true (end of ShatterDock) that prompts "CLICK A PANEL TO ENTER". Gated by `sessionStorage`.

**Integration point:** `App.jsx` already has a `useEffect` that fires on `phase === 3`. A second `useEffect` can watch `hudVisible` becoming true:
```js
useEffect(() => {
  if (!hudVisible) return
  if (sessionStorage.getItem('nav-hint-shown')) return
  setShowNavHint(true)
  sessionStorage.setItem('nav-hint-shown', '1')
  setTimeout(() => setShowNavHint(false), 4000)
}, [hudVisible])
```

**Component:** New `src/components/UI/NavHint.jsx` — a fixed bottom-center div, Roboto Mono text, cyan with low opacity, auto-fades after ~4s via CSS `opacity` transition. Purely presentational; receives no props, reads nothing from Zustand.

**Files modified:** `App.jsx` — add `showNavHint` state, the effect above, and `{showNavHint && <NavHint />}` in JSX
**New files:** `src/components/UI/NavHint.jsx`
**Zustand:** No new state needed

---

### NAV-03 — Disc Click Returns to Grid (Not Home) from Sector

**What changes:** The HUD disc click handler in `App.jsx` (lines 127–132) already has the right logic:
```js
onClick={() => {
  if (useAppState.getState().activeSector) {
    useAppState.getState().setActiveSector(null)  // exits sector → grid
  } else {
    setPhase(2)
    setHudVisible(false)
  }
}}
```

**This is already implemented correctly.** `setActiveSector(null)` with `activeSector` set triggers `CameraController` to return to `HOME_POSITION`, which is the grid. The only gap is that no warp animation plays — that is covered by NAV-05.

**Files modified:** None for basic behavior. Warp animation wires in here (see NAV-05).
**New files:** None
**Zustand:** No new state needed

---

### NAV-04 — ESC Key Exits Sector

**What changes:** A global `keydown` listener that calls `setActiveSector(null)` when ESC is pressed and `activeSector` is non-null.

**Integration point:** `App.jsx` is the correct home (it already manages all sector state). Add one `useEffect`:
```js
useEffect(() => {
  function onKey(e) {
    if (e.key === 'Escape' && useAppState.getState().activeSector) {
      useAppState.getState().setActiveSector(null)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])
```

**Dependency awareness:** `AboutSector` will also need a `keydown` listener for interactive terminal input (ABOUT-05). Use `e.stopPropagation()` inside `AboutSector` when the terminal is focused, to prevent ESC from double-firing. Alternatively, the ESC handler above checks `activeSector` via `getState()` which is safe since it reads store directly.

**Files modified:** `App.jsx` (one effect)
**New files:** None
**Zustand:** No new state needed

---

### NAV-05 — Hyper-Reverse Camera Warp on Sector Exit

**What changes:** When `setActiveSector(null)` is called (from disc click, ESC, or terminal "exit"), the camera should animate with a cinematic "hyper-warp" effect before settling at `HOME_POSITION`, instead of the current plain `power2.inOut` tween.

**Two parts:**

**Part A — GSAP camera animation in `CameraController.jsx`:**
The `else` branch (returning home) currently uses `duration: 1.0, ease: 'power2.inOut'`. Replace with a two-step GSAP timeline:
1. Step 1: rapid Z-axis push (`camera.position.z -= 20`) over 0.25s with `expo.in` — the "pull back" feel
2. Step 2: settle to `HOME_POSITION` over 0.7s with `power3.out`

Optionally add a Y-axis kick upward in step 1 for a "launch up" feel. The `setTransitioning(true/false)` calls wrap the full timeline.

**Part B — Postprocessing flash (optional but high-impact):**
Add a `ChromaticAberration` or custom `MotionBlur` effect from `@react-three/postprocessing` that spikes on sector exit and fades back. Driven by a ref or a brief Zustand flag (`isWarping: false`).

Minimal viable version (Part A only) requires no new components. The warp is purely a GSAP timeline change in `CameraController`.

**Files modified:** `src/components/3D/CameraController.jsx` (replace home-return tween with GSAP timeline)
**Optional files modified:** `src/components/Scene.jsx` (add ChromaticAberration to EffectComposer)
**New files:** None required
**Zustand:** Optional: `isWarping` boolean + setter for the postprocessing effect intensity; can be avoided by using a ref passed via context

---

### ABOUT-05 + ABOUT-06 — Interactive Terminal with "exit" Command

**What changes:** `AboutSector.jsx` currently has a one-way typewriter — it writes lines from `TERMINAL_SEQUENCE` and shows a blinking cursor at the end. Two additions:

1. After `done === true`, render an `<input>` or capture `keydown` events to read typed characters
2. Parse "exit" command → call `useAppState.getState().setActiveSector(null)` (which triggers NAV-05 warp if implemented)
3. Show a hint line in the terminal: `$ type "exit" to leave` or display as a static output line after the sequence ends

**Architecture decision:** Use a controlled input hidden behind the terminal body (opacity 0, positioned over the terminal), focused automatically when `done` becomes true. This avoids having to reimplement character-by-character rendering for user input — just capture `onChange` events.

Alternatively: add a `keydown` listener to the terminal container div (with `tabIndex={0}`) and manage a `userInput` state string. This is cleaner as it requires no hidden DOM element.

**Data flow:**
```
keydown on terminal div
  → append to userInput state
  → on Enter: parse command
     → "exit": setActiveSector(null)
     → other: push "command not found" to lines
  → render userInput as current typing line (replaces existing cursor line)
```

The `done` state flag gates when user input is accepted. Before `done`, keyboard events should be ignored to avoid interfering with the typewriter.

**Hint line (ABOUT-06):** Add a static entry to `TERMINAL_SEQUENCE` as the last item:
```js
{ cmd: '$ echo "type exit to leave"', output: '[ type "exit" to leave ]' }
```
No new state or component needed for the hint — it's data-driven.

**Files modified:** `src/components/UI/AboutSector.jsx`
**New files:** None
**Zustand:** No new state needed (reads `setActiveSector` directly from store)

---

### TITLE-01 — Title Screen Text Clears Faster on CTA Click

**What changes:** `TitleOverlay` uses `opacity: visible ? 1 : 0` with `transition: 'opacity 1s ease-in'`. When `EnterButton` fires `setPhase(3)`, `App.jsx` renders `<TitleOverlay visible={phase === 2} ...>` — so `visible` immediately becomes `false` and the 1s ease-in transition plays. The issue is that `ease-in` starts slow (still readable for ~0.7s) and the `transition` direction should be `ease-out` for a fast exit.

**Fix:** Change transition direction. Two options:
- Option A: Change CSS to `transition: 'opacity 0.3s ease-out'` — cuts the linger from ~1s to 0.3s
- Option B: Separate enter/exit transitions using `transitionProperty` logic: `visible ? 'opacity 1s ease-in' : 'opacity 0.25s ease-out'`

Option B is cleaner and preserves the slow fade-in feel on entry.

**Files modified:** `src/components/UI/TitleOverlay.jsx` (one style change)
**New files:** None
**Zustand:** No change needed

---

## Component Change Summary

### Modified Components

| Component | File | What Changes |
|-----------|------|--------------|
| `BootSequence` | `src/components/UI/BootSequence.jsx` | Replace shatter animation internals with terminal log scroll; preserve `onComplete` contract and audio calls |
| `GatewayPane` | `src/components/3D/GatewayPane.jsx` | Increase idle label opacity in `drawFrame` idle branch |
| `CameraController` | `src/components/3D/CameraController.jsx` | Replace home-return tween with two-step GSAP timeline for hyper-warp feel |
| `AboutSector` | `src/components/UI/AboutSector.jsx` | Add keydown handler + userInput state when `done`; add "exit" command parser; add hint to `TERMINAL_SEQUENCE` |
| `TitleOverlay` | `src/components/UI/TitleOverlay.jsx` | Separate enter/exit opacity transitions (fast exit) |
| `App.jsx` | `src/App.jsx` | Add ESC keydown effect; add `showNavHint` state + effect; render `<NavHint />` |

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `NavHint` | `src/components/UI/NavHint.jsx` | One-time navigation affordance hint overlay after first grid entry |

### Unchanged Components

`Scene.jsx`, `GridFloor.jsx`, `GatewayPanes.jsx`, `Monolith.jsx`, `IdentityDisc.jsx`, `MuteToggle.jsx`, `SocialIcons.jsx`, `MobileGateway.jsx`, `ProjectsSector.jsx`, `SkillsSector.jsx`, `WebGLFallback.jsx`, `appState.js` — all unmodified unless optional warp postprocessing is added to `Scene.jsx`.

---

## Zustand State Changes

**No new state fields are required for any of the v1.1 features.** All features read existing state (`activeSector`, `hudVisible`, `phase`) or call existing actions (`setActiveSector`, `setPhase`).

Optional addition for postprocessing warp intensity:
```js
isWarping: false,
setIsWarping: (v) => set({ isWarping: v }),
```
This is only needed if the Scene's `EffectComposer` needs to read warp state. A `useRef` passed via React context is a viable alternative that avoids polluting the store.

---

## Data Flow: Sector Exit (NAV-03 + NAV-04 + NAV-05)

```
User action (ESC key, disc click, or "exit" command)
    ↓
setActiveSector(null)  [Zustand]
    ↓
CameraController useEffect fires (activeSector changed to null)
    ↓
GSAP timeline: rapid Z-push (0.25s) → settle HOME_POSITION (0.7s)
    ↓
setTransitioning(false) on timeline complete
    ↓
Scene: OrbitControls re-enabled (activeSector is null)
App.jsx: sector overlay unmounts (activeSector === 'about' → false)
```

---

## Data Flow: Terminal "exit" Command (ABOUT-05)

```
User types "exit" + Enter in AboutSector terminal
    ↓
Command parser in AboutSector reads userInput state
    ↓
Matches "exit" → calls useAppState.getState().setActiveSector(null)
    ↓
[same as sector exit flow above]
    ↓
AboutSector unmounts (activeSector no longer 'about')
```

---

## Suggested Build Order

Dependencies determine order. Features with no dependencies on other v1.1 features go first.

**Stage 1 — Independent, low-risk (no cross-feature deps)**

1. **PANE-01** (GatewayPane idle label opacity) — one-line CSS change, instant visual win, zero risk
2. **TITLE-01** (TitleOverlay fast exit transition) — one style property change, isolated
3. **NAV-04** (ESC key exits sector) — one `useEffect` in App.jsx, no component creation needed

**Stage 2 — Small new components or targeted rewrites**

4. **PANE-02** (NavHint overlay) — new `NavHint.jsx` + small App.jsx wiring; depends on nothing
5. **BOOT-05** (Terminal boot screen) — rewrite BootSequence internals; self-contained, isolated from 3D layer

**Stage 3 — Core mechanic (warp animation)**

6. **NAV-05** (Hyper-reverse camera warp) — modifies CameraController; this must be done before ABOUT-05 so the exit animation works when terminal "exit" command fires

**Stage 4 — Interactive terminal (depends on warp being wired)**

7. **ABOUT-05 + ABOUT-06** (Interactive terminal + exit hint) — depends on NAV-05 being implemented so `setActiveSector(null)` produces the full warp effect; otherwise "exit" works but looks flat

**NAV-03** (Disc click already works) — verify visually after NAV-05 is wired, no code change needed.

---

## Architectural Patterns

### Pattern: Preserve Component Contracts, Replace Internals

**What:** When a component's interface (props in, callbacks out) matches what the new feature needs, rewrite only the internals. Do not change the mounting/unmounting logic in the parent.

**When to use:** BOOT-05 (keep `onComplete` prop, rewrite everything inside `BootSequence`).

**Trade-offs:** Faster to implement; old component may leave dead code behind. Acceptable for this codebase scale.

### Pattern: Gate by Zustand State, Render in App.jsx

**What:** New UI overlays are rendered directly in `App.jsx` as conditional JSX gated on Zustand state, not as children passed through Scene or other wrappers.

**When to use:** NavHint, sector overlays, HUD elements — all follow this pattern already.

**Trade-offs:** App.jsx accumulates conditional renders. At current feature count this is manageable; beyond ~12 overlays, extract to a dedicated `OverlayManager.jsx`.

### Pattern: Store Access via getState() in Event Handlers

**What:** Event handlers (keydown, click) that are not inside React's render cycle use `useAppState.getState()` to read/write store without causing stale closures.

**When to use:** ESC handler (App.jsx), "exit" command handler (AboutSector), disc click handler (already uses this pattern in App.jsx line 128).

**Trade-offs:** Bypasses React's reactivity model, but correct for event-driven imperative code. Already established pattern in the codebase.

---

## Anti-Patterns

### Anti-Pattern 1: Adding Sector Exit to Each Sector Component Individually

**What people do:** Put ESC handler in `AboutSector`, `ProjectsSector`, `SkillsSector` separately.

**Why it's wrong:** Duplicates event listener registration. If three sectors are mounted (they aren't — only one mounts at a time — but if that changes), three listeners fire. Also scatters the navigation contract across three files.

**Do this instead:** Single ESC handler in `App.jsx`. All sector components call `setActiveSector(null)` only when they need to trigger it themselves (e.g., the "exit" terminal command in `AboutSector`).

### Anti-Pattern 2: Using Phase Numbers for Sector State

**What people do:** Add `phase: 4`, `phase: 5`, `phase: 6` for each sector instead of using `activeSector`.

**Why it's wrong:** The existing architecture correctly separates "which phase of the app lifecycle" (boot → title → grid) from "which sector is active within the grid". Conflating them breaks the HUD visibility logic and the camera home position logic, both of which check `activeSector`, not `phase`.

**Do this instead:** Keep using `setActiveSector('about'|'skills'|'projects'|null)`. Phase stays at 3 for all grid and sector states.

### Anti-Pattern 3: Blocking the R3F Render Loop with Sync DOM Operations in BootSequence

**What people do:** Trigger heavy DOM layout (large `innerHTML` rewrites, `getBoundingClientRect` in tight loops) inside `useFrame` or in a `requestAnimationFrame` loop that competes with the Canvas.

**Why it's wrong:** The terminal boot screen runs while `Canvas frameloop='never'` — the Canvas is deliberately paused during boot. DOM-heavy terminal animation is safe. But if the new BootSequence triggers `playWithFade` or calls `setPhase(2)` too early, it can start the Canvas before the terminal is visually complete.

**Do this instead:** Keep the same timing as the current `BootSequence` — call `setPhase(2)` (which does not start the canvas — `frameloop` is controlled by `showBoot`, not `phase`) partway through the terminal log, and call `onComplete()` only at the very end, which sets `showBoot(false)` and transitions the Canvas to `frameloop='always'`.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `App.jsx` ↔ `BootSequence` | Props: `onComplete` callback | Contract must not change for BOOT-05 |
| `App.jsx` ↔ Sector overlays | Zustand: `activeSector` read, conditional render | Sector overlays never communicate back to App directly |
| `AboutSector` → Zustand | `setActiveSector(null)` via `getState()` | For "exit" command — same pattern as disc click |
| `CameraController` ↔ Zustand | Reads `activeSector`; writes `transitioning` | Warp animation lives entirely here |
| `GatewayPane` → `App.jsx` | `onPaneClick` prop → `setActiveSector` in `GatewayPanes.jsx` | No change needed |
| `App.jsx` global keydown | Reads `activeSector` via `getState()` | ESC handler — must not conflict with AboutSector input |

---

## Sources

- Full source read of `src/App.jsx`, `src/store/appState.js`, `src/components/3D/CameraController.jsx`, `src/components/3D/GatewayPane.jsx`, `src/components/UI/BootSequence.jsx`, `src/components/UI/AboutSector.jsx`, `src/components/UI/TitleOverlay.jsx`, `src/components/UI/EnterButton.jsx`, `src/components/Scene.jsx`
- `.planning/PROJECT.md` — v1.1 feature list and architecture decisions
- GSAP docs: timeline chaining with `.to()` and `onComplete` callbacks — standard pattern, HIGH confidence
- `@react-three/postprocessing` ChromaticAberration: available in the installed library, verified by existing `EffectComposer` usage in `Scene.jsx`

---
*Architecture research for: Tron Portfolio SPA v1.1 Immersion Polish*
*Researched: 2026-03-19*
