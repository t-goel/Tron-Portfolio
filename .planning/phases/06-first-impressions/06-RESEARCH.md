# Phase 6: First Impressions - Research

**Researched:** 2026-03-19
**Domain:** React DOM UI — terminal boot screen (BOOT-05), session-gated affordance overlay (PANE-02)
**Confidence:** HIGH

---

## Summary

Phase 6 has two independent sub-problems, each fully solvable in plain React + CSS with no new dependencies.

**BOOT-05** replaces the existing `BootSequence.jsx` white-shard animation with a dark void-black terminal boot log — scrolling cyan monospace lines on `#000` background, fading out when complete. The current component is the entry point: `App.jsx` renders `{showBoot && <BootSequence onComplete={handleBootComplete} />}` and everything flows through its `onComplete` callback. The replacement must preserve the audio lifecycle (`initAudio()` / `playWithFade(2000)`) at equivalent timing points, which is documented as a known concern in STATE.md.

**PANE-02** is a one-time, session-scoped "Click and drag to explore" hint overlay that appears when the user first reaches the grid (phase >= 3, `hudVisible === true`) and has never seen it this session. It auto-fades after ~3 seconds and must not reappear within the same browser session. `sessionStorage` is the correct mechanism — it clears on tab close, matching "same session" semantics. No new libraries needed.

**Primary recommendation:** Implement BOOT-05 as a full rewrite of `BootSequence.jsx` (keeping filename and export contract), and PANE-02 as a new self-contained `GridAffordanceHint.jsx` mounted in `App.jsx` alongside the existing HUD logic.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PANE-02 | User sees a brief "Click and drag to explore" hint the first time they enter the grid (sessionStorage-gated, one-time per session, auto-fades) | sessionStorage API for gate; CSS opacity transition for fade; mount point in App.jsx when `hudVisible && phase >= 3` |
| BOOT-05 | Loading screen shows void-black background with scrolling monospace boot log text in cyan — no white flash or light background | Rewrite BootSequence.jsx body; preserve `initAudio()` / `playWithFade()` calls at existing timer offsets; use `#000` background and `font-family: 'Roboto Mono'` with `color: #00FFFF` |
</phase_requirements>

---

## Standard Stack

No new dependencies required for this phase. All implementation uses:

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.0 | Component tree, useState/useEffect/useRef | Project framework |
| Zustand | ^5.0.11 | Read `phase`, `hudVisible` from global store | Project state store |
| GSAP | ^3.14.2 | Optional: fade-out tween for affordance hint | Project animation library |
| Tailwind CSS | ^4.2.1 | Utility classes for layout/positioning | Project styling |

### Browser APIs (zero-cost)
| API | Purpose |
|-----|---------|
| `sessionStorage.getItem` / `setItem` | Gate the affordance hint to first grid visit per session |
| CSS `@keyframes` + `opacity` transition | Scrolling terminal text, fade-out animations |
| `setTimeout` / `clearTimeout` | Auto-fade timer for affordance hint |

**Installation:** None required.

---

## Architecture Patterns

### Recommended Project Structure (additions only)
```
src/
├── components/UI/
│   ├── BootSequence.jsx        # REWRITE in place (same filename, same export)
│   └── GridAffordanceHint.jsx  # NEW — PANE-02 hint overlay
```

### Pattern 1: BootSequence Full Rewrite (BOOT-05)

**What:** Replace the white-shard shatter animation with a dark terminal boot log. Keep filename, keep export signature `export default function BootSequence({ onComplete })`, keep audio calls at same relative timing.

**When to use:** The component is already wired into App.jsx; swapping the body is lower risk than changing the mount/unmount contract.

**Audio timing preservation (CRITICAL — from STATE.md):**
```jsx
// These two calls must survive the rewrite at equivalent timing
setTimeout(() => {
  playWithFade(2000)  // ← must fire ~800ms into the sequence
}, 800)

// initAudio() must be called early (on mount or first user interaction)
// to register the sound object before playWithFade is called
useEffect(() => {
  const sound = initAudio()
  if (sound) {
    sound.on('playerror', () => {
      document.addEventListener('click', () => playWithFade(2000), { once: true })
    })
  }
}, [])
```

**Terminal boot log design:**
```jsx
// Background: absolute inset-0, background #000, z-50
// Text: font-family 'Roboto Mono', color #00FFFF, font-size 0.75rem
// Lines scroll in via staggered opacity/translateY animation
// Component unmounts (returns null) after onComplete() fires

const BOOT_LINES = [
  'GRID OS v7.2.1 — INITIALIZING...',
  'Loading kernel modules...',
  'Mounting /dev/grid0 ... [OK]',
  'Calibrating light cycle array...',
  'Authenticating user identity...',
  'Neural bridge established.',
  'Welcome to the Grid.',
]
```

**Fade-out before unmount:**
```jsx
// Set animating-out state ~500ms before onComplete() to CSS-transition opacity to 0
// Then call onComplete() — App.jsx handles the black-overlay fade in
const [fadingOut, setFadingOut] = useState(false)

setTimeout(() => setFadingOut(true), TOTAL_DURATION - 500)
setTimeout(() => { if (onComplete) onComplete() }, TOTAL_DURATION)
```

**Background color rule (no white flash):**
```jsx
// The outer wrapper MUST be background #000, not bg-white or bg-[#fafafa]
// The current component uses bg-[#fafafa] — this is the entire thing to replace
<div className="fixed inset-0 z-50" style={{ background: '#000' }}>
```

### Pattern 2: GridAffordanceHint (PANE-02)

**What:** A small translucent hint overlay that appears center-bottom of the grid view, auto-fades after 3 seconds, and only shows once per browser session.

**sessionStorage gate pattern:**
```jsx
const SESSION_KEY = 'grid_hint_shown'

function GridAffordanceHint() {
  const [visible, setVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return  // already shown this session
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(true)

    const fadeTimer = setTimeout(() => setFadingOut(true), 3000)
    const hideTimer = setTimeout(() => setVisible(false), 3600)  // 600ms CSS fade
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        fontFamily: "'Roboto Mono', monospace",
        color: '#00FFFF',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        textShadow: '0 0 8px #00FFFF',
      }}
    >
      Click and drag to explore
    </div>
  )
}
```

**Mount point in App.jsx:**
```jsx
// Render AFTER hudVisible becomes true and no sector is active
// hudVisible is the correct trigger — it fires after the dock animation completes
{hudVisible && !activeSector && <GridAffordanceHint />}
```

**Why hudVisible, not phase >= 3:** `hudVisible` becomes `true` only after the disc docking GSAP animation completes (see App.jsx line 66: `onComplete: () => setHudVisible(true)`). This means the user is already looking at the full grid with OrbitControls active — the ideal moment to show the hint.

### Anti-Patterns to Avoid

- **Putting sessionStorage logic in BootSequence.jsx:** STATE.md explicitly documents that the sessionStorage boot gate must live in App.jsx (or the consuming component), not inside BootSequence.
- **Using localStorage instead of sessionStorage:** localStorage persists across sessions — the requirement is one-time per session, so sessionStorage is correct.
- **Showing affordance hint before hudVisible:** Phase 3 starts before the dock animation; showing the hint during the docking animation would be visually jarring.
- **Calling initAudio() after playWithFade():** The current BootSequence.jsx calls `initAudio()` first to register the `playerror` handler, then `playWithFade()` later. This order must be preserved.
- **Replacing BootSequence with a white background:** Any `bg-white`, `bg-[#fafafa]`, or similar light background in the new component violates BOOT-05.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session-scoped "shown once" state | Custom hook with module-level flag | `sessionStorage.getItem/setItem` | sessionStorage is built-in, persists across re-renders/re-mounts, clears on tab close — exactly the right scope |
| Text fade-in stagger | Custom JS animation loop | CSS `@keyframes` with `animation-delay` per line | Pure CSS is composable, cancellable, GPU-accelerated |
| Auto-dismiss timer | requestAnimationFrame loop | `setTimeout` with cleanup in `useEffect` return | Simpler, correct, and standard React pattern |

**Key insight:** Both BOOT-05 and PANE-02 are pure UI problems. Zero new dependencies. The entire phase is DOM elements + CSS + React state + sessionStorage.

---

## Common Pitfalls

### Pitfall 1: White Flash During Boot (BOOT-05 core failure mode)
**What goes wrong:** Any CSS that renders a light background (`bg-white`, `bg-[#fafafa]`, or even the default browser body background before React mounts) will show through.
**Why it happens:** The current BootSequence.jsx uses `bg-[#fafafa]` as its base layer. A naive partial rewrite might leave this in place.
**How to avoid:** The outermost wrapper div must have `background: '#000'` (or `bg-black`). Also verify `index.css` already sets `background: var(--void-black)` on `html, body, #root` — confirmed present (line 29 of index.css).
**Warning signs:** Any white or grey visible during the first ~200ms of load.

### Pitfall 2: Audio Breaks After BootSequence Rewrite (STATE.md documented concern)
**What goes wrong:** If `initAudio()` is not called before `playWithFade()`, or if the `playerror` handler is dropped, audio may silently fail on browsers with autoplay restrictions.
**Why it happens:** The boot sequence rewrite focuses on visuals and may inadvertently drop the audio setup block.
**How to avoid:** Keep the full audio setup block from the current BootSequence.jsx. Specifically: call `initAudio()` on mount, attach `playerror` listener, then call `playWithFade(2000)` at the ~800ms mark.
**Warning signs:** No background music on first visit.

### Pitfall 3: Affordance Hint Appears Too Early
**What goes wrong:** Hint shows during disc docking animation, before the user has OrbitControls available.
**Why it happens:** Using `phase >= 3` instead of `hudVisible` as the mount condition.
**How to avoid:** Gate on `hudVisible` — it is set to `true` only in the GSAP `onComplete` after the dock animation finishes.

### Pitfall 4: Hint Shown on Every Render/Re-Mount
**What goes wrong:** Component re-mounts (e.g., React Strict Mode double-invoke, or sector navigation cycling `hudVisible`) and shows hint again.
**Why it happens:** sessionStorage write inside `useEffect` is correct but the `setVisible(true)` fires again on re-mount if the key was already written.
**How to avoid:** Check `sessionStorage.getItem(SESSION_KEY)` before setting visible — if truthy, return immediately without setting visible. The code pattern in the Architecture section above handles this correctly.

### Pitfall 5: Hint Not Cleaned Up on Unmount
**What goes wrong:** Timer fires after component unmounts, causing a React state update on an unmounted component warning.
**Why it happens:** `setTimeout` callbacks hold refs to `setFadingOut` / `setVisible`.
**How to avoid:** Always return cleanup from `useEffect`: `return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }`.

---

## Code Examples

### Boot Log Line Stagger via CSS animation-delay
```jsx
// Source: MDN Web Docs — CSS animation-delay
// Each line gets an incrementally larger delay
{BOOT_LINES.map((line, i) => (
  <div
    key={i}
    style={{
      opacity: 0,
      animation: `bootLineIn 0.3s ease forwards`,
      animationDelay: `${i * 0.25}s`,
      fontFamily: "'Roboto Mono', monospace",
      color: '#00FFFF',
      fontSize: '0.75rem',
      lineHeight: '1.8',
    }}
  >
    {line}
  </div>
))}
```

```css
/* In index.css */
@keyframes bootLineIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### sessionStorage Gate (idiomatic React)
```jsx
// Source: MDN Web Docs — Web Storage API
useEffect(() => {
  if (sessionStorage.getItem('grid_hint_shown')) return
  sessionStorage.setItem('grid_hint_shown', '1')
  setVisible(true)
  const t1 = setTimeout(() => setFadingOut(true), 3000)
  const t2 = setTimeout(() => setVisible(false), 3600)
  return () => { clearTimeout(t1); clearTimeout(t2) }
}, [])
```

### BootSequence Timing Skeleton (preserving audio contract)
```jsx
export default function BootSequence({ onComplete }) {
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Audio setup — must come before playWithFade
    const sound = initAudio()
    if (sound) {
      sound.on('playerror', () => {
        document.addEventListener('click', () => playWithFade(2000), { once: true })
      })
    }

    // Trigger music ~800ms in
    const t1 = setTimeout(() => playWithFade(2000), 800)
    // Begin fade-out 200ms before completion
    const t2 = setTimeout(() => setFadingOut(true), 2800)
    // Signal App.jsx we're done
    const t3 = setTimeout(() => { if (onComplete) onComplete() }, 3000)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  // ... render boot log UI
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| White shard-shatter loading screen | Dark terminal boot log (BOOT-05) | Phase 6 | First impression becomes on-brand Tron from frame 0 |
| No navigation affordance | Session-gated orbit hint (PANE-02) | Phase 6 | New visitors understand the 3D canvas is draggable |

**No deprecated APIs involved.** `sessionStorage` is stable and universally supported. CSS `@keyframes` with `animation-delay` is stable. Both are the current standard approach.

---

## Open Questions

1. **Boot log duration vs. feel**
   - What we know: Current BootSequence completes in ~5.8 seconds (the pivotDrop finishes at `setTimeout 5800ms`). The new terminal boot can be shorter since it's simpler.
   - What's unclear: Optimal duration — long enough to feel like a real boot, short enough to not annoy returning visitors.
   - Recommendation: Target 2.5–3 seconds total for the terminal sequence. Planner should decide final duration during task write-up.

2. **Repeat-visit behavior for boot screen**
   - What we know: STATE.md notes "sessionStorage boot gate must live in App.jsx, not BootSequence.jsx — prevents black screen on repeat visits." This implies a gate for skipping boot already exists or is planned.
   - What's unclear: Is the boot currently skipped on repeat visits, or is that deferred?
   - Recommendation: Phase 6 should implement the BOOT-05 visual change regardless. The sessionStorage skip-boot logic (if not yet present) should be added to App.jsx as a separate task (check `sessionStorage.getItem('boot_shown')` before `setShowBoot(true)`). Planner should verify if this is already implemented.

3. **Affordance hint on mobile**
   - What we know: Mobile uses `MobileGateway.jsx` instead of `GatewayPanes.jsx`; OrbitControls are disabled on mobile.
   - What's unclear: Should the hint text differ on mobile ("Tap to explore" vs "Click and drag")?
   - Recommendation: The requirement specifies exact text "Click and drag to explore." Show it as-is on all viewports for simplicity. Mobile can be a follow-up enhancement.

---

## Validation Architecture

> `nyquist_validation` is enabled in config.json.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files found in project |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOT-05 | No white/light background visible during loading | Manual visual | Load app in browser, observe first frame | N/A |
| BOOT-05 | Cyan monospace boot log scrolls on void-black background | Manual visual | Load app in browser, observe BootSequence | N/A |
| BOOT-05 | Audio still plays after rewrite | Manual audio | Load app, listen for background music | N/A |
| PANE-02 | Hint appears on first grid visit | Manual visual | Clear sessionStorage, enter grid, observe hint | N/A |
| PANE-02 | Hint auto-fades after ~3 seconds | Manual visual | Time from grid entry to hint disappearance | N/A |
| PANE-02 | Hint does not reappear in same session | Manual visual | Navigate sectors and return to grid; verify no hint | N/A |
| PANE-02 | Hint does not appear on second grid visit in session | Manual visual | Exit sector, return to grid; verify no hint | N/A |

### Sampling Rate
- **Per task commit:** Manual browser test of the specific requirement
- **Per wave merge:** All 7 manual checks above
- **Phase gate:** All 7 checks green before `/gsd:verify-work`

### Wave 0 Gaps
- None — no test framework is present in this project; all validation is manual visual/interactive testing in the browser.

*(This is consistent with the project's current approach — no test files exist anywhere in the codebase.)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read — `src/components/UI/BootSequence.jsx` — current animation implementation, audio call locations
- Direct codebase read — `src/App.jsx` — mount contract (`showBoot`, `handleBootComplete`, `hudVisible` trigger)
- Direct codebase read — `src/store/appState.js` — Zustand state shape
- Direct codebase read — `src/index.css` — existing keyframes, CSS variables, confirmed `background: var(--void-black)` on root
- Direct codebase read — `.planning/STATE.md` — documented decisions: sessionStorage gate in App.jsx, audio must be preserved
- MDN Web Docs — `sessionStorage` API (stable, universally supported)
- MDN Web Docs — CSS `animation-delay`, `@keyframes` (stable)

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md + ROADMAP.md — exact wording of success criteria for PANE-02 and BOOT-05

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all libraries confirmed in package.json
- Architecture: HIGH — implementation patterns derived directly from reading existing codebase + browser standard APIs
- Pitfalls: HIGH — audio concern is explicitly documented in STATE.md; others are derived from direct code analysis

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (stable APIs, no framework churn risk)
