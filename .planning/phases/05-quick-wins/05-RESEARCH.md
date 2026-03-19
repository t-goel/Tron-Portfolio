# Phase 5: Quick Wins - Research

**Researched:** 2026-03-19
**Domain:** React DOM event handling, CSS transitions, Zustand state, Canvas 2D texture rendering
**Confidence:** HIGH

## Summary

Phase 5 is a surgical, zero-new-dependency polish pass over three existing files. All three requirements can be satisfied by modifying code that already exists in the codebase — no new components are needed. The work falls into three independent sub-problems, each well-understood:

**PANE-01** (visible labels at rest): `GatewayPane.jsx` already contains the idle-label code path at `drawFrame` line 88-96. It draws a faint label (`rgba(0,255,255,0.35)`) when `decryptProgress === 0`. The fix is to increase that opacity to a legible value (0.7–0.9) and optionally increase the font size from 14px to something bigger. No structural changes are needed — one constant changes.

**TITLE-01** (fast title clear on CTA click): `TitleOverlay.jsx` uses `transition: 'opacity 1s ease-in'` — a 1-second fade-out — when `visible` flips to false. `EnterButton.jsx` calls `setPhase(3)` directly; `App.jsx` derives `visible` as `phase === 2`. The fix is to shorten the CSS transition to 0.2s (or remove it and use an `opacity: 0` class applied first before the phase change to allow a ~200ms window). The phase call can stay as-is since the 0.25-second success criterion only covers perceived clearance of the title, not the phase-change itself.

**NAV-04** (ESC exits any sector): `App.jsx` manages `activeSector` via Zustand. None of the sector components (About, Skills, Projects) listen for the `keydown` Escape event. The fix is to add a single `useEffect` in `App.jsx` that binds `window.addEventListener('keydown', handler)` and calls `setActiveSector(null)` when `e.key === 'Escape'` and `activeSector` is non-null. The effect should re-run when `activeSector` changes (or use a ref to read the current value) to avoid stale closure.

**Primary recommendation:** Implement all three fixes as a single-wave plan: PANE-01 in `GatewayPane.jsx`, TITLE-01 in `TitleOverlay.jsx`, NAV-04 in `App.jsx`. Each is a 5–20 line diff. No new packages, no new components.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TITLE-01 | Title screen text clears promptly and smoothly when user clicks CTA — no lingering overlap during transition | TitleOverlay opacity transition is currently 1s; shortening to 0.15–0.2s meets the <250ms success criterion |
| PANE-01 | Gateway pane labels legible by default without hover | drawFrame already renders idle label at opacity 0.35; bump to 0.75–0.9 and increase font size |
| NAV-04 | ESC while inside any sector returns to grid view | setActiveSector(null) via keydown handler in App.jsx; no sector component changes required |
</phase_requirements>

## Standard Stack

### Core (already installed — no additions needed)

| Library | Version | Purpose | Role in Phase 5 |
|---------|---------|---------|-----------------|
| React | 19.2.0 | Component rendering, hooks | `useEffect` for ESC listener in App.jsx |
| Zustand | 5.0.11 | Global state | `setActiveSector(null)` already exists |
| Three.js | 0.183.2 | WebGL / Canvas2D textures | `drawFrame` canvas context in GatewayPane |
| GSAP | 3.14.2 | Tweens | Not directly needed for Phase 5 changes |

**Installation:** No new packages. All dependencies are present.

## Architecture Patterns

### Recommended Project Structure

No new files required. All changes land in:

```
src/
├── App.jsx                          # NAV-04: ESC keydown listener
├── components/3D/GatewayPane.jsx    # PANE-01: idle label opacity
└── components/UI/TitleOverlay.jsx   # TITLE-01: transition duration
```

### Pattern 1: Global Keyboard Listener in App.jsx

**What:** A single `useEffect` at the App level registers a `keydown` listener on `window`. This is the canonical location because App owns the `activeSector` Zustand state and already handles HUD click navigation.

**When to use:** Any keyboard shortcut that affects global navigation state — always bind at App level, not inside sector components, to avoid the listener dying when the sector unmounts.

**Example:**
```jsx
// In App.jsx — NAV-04 implementation
useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === 'Escape' && useAppState.getState().activeSector) {
      useAppState.getState().setActiveSector(null)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, []) // Empty deps — reads live state via getState() to avoid stale closure
```

**Why `getState()` instead of subscribing:** Zustand's `getState()` always returns the current store snapshot synchronously. Using it inside the event handler avoids the stale-closure problem that would occur if `activeSector` was captured in the closure at effect-creation time. The effect only needs to run once.

### Pattern 2: CSS Opacity Transition Timing

**What:** `TitleOverlay.jsx` controls visibility with an inline style `opacity: visible ? 1 : 0` and `transition: 'opacity 1s ease-in'`. Reducing the duration to `0.15s ease-out` achieves a sub-quarter-second clear.

**When to use:** Any quick-exit transition. `ease-out` starts fast and decelerates, which reads as "snappy" — preferred over `ease-in` for hide transitions.

**Example:**
```jsx
// TitleOverlay.jsx — TITLE-01 fix
transition: 'opacity 0.15s ease-out',
```

Note: The current value is `ease-in` which starts slow — this makes the fade feel sluggish even at 1s. Switching to `ease-out` at 0.15s produces immediate visual response to the click.

### Pattern 3: Canvas 2D Idle Label Legibility

**What:** `drawFrame` in `GatewayPane.jsx` draws the label at `rgba(0,255,255,0.35)` with `14px TR2N` font when `decryptProgress === 0`. This is intentionally faint.

**When to use:** PANE-01 wants legibility at rest — increase opacity and/or font size to make the label clearly readable against the dark canvas background.

**Example:**
```jsx
// GatewayPane.jsx drawFrame — PANE-01 fix
// Change idle label block (lines 88-96):
if (decryptProgress === 0) {
  ctx.font = "18px 'TR2N', sans-serif"   // was 14px
  ctx.fillStyle = 'rgba(0,255,255,0.80)' // was 0.35
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 120, 80)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}
```

The canvas texture is 240x160 px — center coordinates (120, 80) are already correct. No layout changes needed.

### Anti-Patterns to Avoid

- **Binding ESC inside sector components:** Each sector (About, Skills, Projects) is conditionally mounted. If the listener is inside the sector, it dies on unmount and race conditions arise during the fade-out. Always bind at App level.
- **Using React state for activeSector in the keydown closure:** Will capture a stale value from when the effect ran. Use `useAppState.getState()` for synchronous live reads in event handlers.
- **Changing TitleOverlay visibility via a new state variable:** The existing `visible={phase === 2}` derivation is correct. Adding a separate "isClearing" boolean adds complexity without benefit. Just shorten the transition.
- **Making the idle label too bright:** Opacity above 0.9 will compete visually with the decrypt animation's label reveal — keep below 0.85 to preserve the hover "reveal" effect feeling rewarding.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard shortcut system | Custom key registry / command bus | Plain `window.addEventListener('keydown', ...)` in App.jsx | Single shortcut, single location — no abstraction needed |
| Animated title exit | GSAP timeline sequence | CSS transition `opacity: 0` with 0.15s duration | Already wired; simpler, no GSAP dep needed for this |
| Label rendering pipeline | New Three.js text geometry or HTML overlay | Existing Canvas 2D `drawFrame` with adjusted constants | Canvas texture approach is already proven; avoid mixing rendering strategies |

**Key insight:** All three requirements are adjustments to existing code, not new features. The highest risk is over-engineering — introducing new abstractions where a constant change or a 4-line `useEffect` is sufficient.

## Common Pitfalls

### Pitfall 1: Stale Closure in ESC Keydown Handler

**What goes wrong:** Developer writes `useEffect(() => { window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeSector) setActiveSector(null) }) }, [activeSector])`. This re-registers the listener every time `activeSector` changes — harmless but noisy.

**Why it happens:** `activeSector` is included in deps because the linter warns about closure capture.

**How to avoid:** Use `useAppState.getState().activeSector` inside the handler body. No deps needed, single registration, no stale value.

**Warning signs:** Rapid sector open/close causing double-fires, or ESC not working after navigating out and back in.

### Pitfall 2: Title Overlap During Phase Change

**What goes wrong:** `EnterButton` calls `setPhase(3)` immediately, which causes `TitleOverlay` to unmount (or become `display:none`) before the opacity transition completes, causing a visual cut rather than a fade.

**Why it happens:** The current code renders `TitleOverlay` only when `phase >= 2` AND renders the button only when `phase === 2`. When phase becomes 3, the `visible` prop goes false — but the component stays in the DOM because `phase >= 2` is still true. The `opacity` transition runs correctly.

**Current flow (correct — do not break):**
```
User clicks → setPhase(3) → phase=3 → visible={phase===2}=false → opacity: 0 transition
```

The transition duration is the only problem. Do not change the mount/unmount logic — only change the duration.

**Warning signs:** After the fix, if title text is still visible > 250ms after click, check that the `transition` style change was applied to the outer `<div>` in TitleOverlay, not a child element.

### Pitfall 3: Canvas Texture Not Updating After Constant Change

**What goes wrong:** Developer changes opacity constant in `drawFrame` but the idle redraw doesn't trigger because the canvas only redraws at ~8fps via the `elapsed - lastDrawRef.current > 0.125` throttle.

**Why it happens:** The initial frame is drawn in `useMemo` synchronously (correct), so the new opacity will appear immediately on mount. The issue only arises if someone tries to hot-reload and the texture looks stale during development.

**How to avoid:** Non-issue in production. In development, a hard refresh forces `useMemo` to re-execute. No code change needed.

### Pitfall 4: ESC Triggering During Boot or Title Screen

**What goes wrong:** ESC listener fires when `activeSector` is null (no sector open), calling `setActiveSector(null)` redundantly — harmless but wastes a render.

**How to avoid:** Guard with `if (e.key === 'Escape' && useAppState.getState().activeSector !== null)`.

## Code Examples

Verified patterns from the existing codebase (source: direct code read):

### Current drawFrame idle label (GatewayPane.jsx lines 88-96)
```jsx
// Current — faint, too small for PANE-01
if (decryptProgress === 0) {
  ctx.font = "14px 'TR2N', sans-serif"
  ctx.fillStyle = 'rgba(0,255,255,0.35)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 120, 80)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}
```

### Current TitleOverlay transition (TitleOverlay.jsx line 69)
```jsx
// Current — 1 second, ease-in (slow start)
transition: 'opacity 1s ease-in',
```

### Current sector click navigation in App.jsx HUD handler (lines 127-133)
```jsx
onClick={() => {
  if (useAppState.getState().activeSector) {
    useAppState.getState().setActiveSector(null)  // already uses getState()
  } else {
    setPhase(2)
    setHudVisible(false)
  }
}}
```

The HUD click handler already demonstrates the correct pattern for ESC — it uses `getState()` directly. The ESC `useEffect` should follow the same pattern.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Route-based sector navigation | Phase + `activeSector` Zustand field | ESC just calls `setActiveSector(null)` — no router needed |
| Separate "exit" button component | Global keyboard handler at App level | Cleaner — keyboard events belong at App boundary |
| Opacity transitions > 500ms | Sub-200ms transitions for immediate feedback | Matches modern UX expectations for responsive UI |

## Open Questions

1. **PANE-01 — Exact opacity/size target**
   - What we know: 0.35 is too faint; 0.80 at 18px is legible
   - What's unclear: Whether the design should match the hover-revealed label's visual weight exactly or intentionally be slightly dimmer as a "resting" state affordance
   - Recommendation: Use 0.75 at 18px during implementation — visible but still rewards hover with the decrypt reveal. Adjust during verify-work.

2. **TITLE-01 — Whether to keep ease-in or switch to ease-out**
   - What we know: `ease-in` starts slow; `ease-out` starts fast
   - What's unclear: Aesthetic preference
   - Recommendation: Use `ease-out` at 0.15s — starts immediately visible, ends cleanly. Matches "snappy" click feedback convention.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config, no test directory |
| Config file | None — Wave 0 gap |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PANE-01 | Idle label at `rgba(0,255,255,>=0.70)` when `decryptProgress===0` | manual | Visual check in browser — canvas content not accessible to unit test runners | manual-only |
| TITLE-01 | TitleOverlay opacity transition <= 250ms | manual | Visual check: click CTA, measure with browser DevTools | manual-only |
| NAV-04 | ESC while `activeSector` non-null calls `setActiveSector(null)` | unit | ❌ Wave 0 gap — test file TBD | ❌ Wave 0 |

**Justification for manual-only on PANE-01 and TITLE-01:** Both involve visual/canvas rendering and CSS animation timing. These cannot be meaningfully asserted with a headless unit test runner without a full browser environment (Playwright/Cypress). Given the project has no existing test infrastructure and Phase 5 is a quick-wins pass, manual browser verification is the appropriate gate.

**NAV-04 is unit-testable:** The `setActiveSector(null)` call path in response to Escape keydown can be tested with React Testing Library by rendering App with a mocked Zustand store and dispatching a synthetic `keydown` event.

### Sampling Rate

- **Per task commit:** Manual browser smoke — open sector, press ESC, verify exit
- **Per wave merge:** All three success criteria verified visually
- **Phase gate:** All three success criteria green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test infrastructure exists — if NAV-04 unit test is desired, install `vitest` + `@testing-library/react` and create `src/__tests__/App.escKey.test.jsx`
- [ ] If unit test skipped (acceptable for this quick-wins phase), document as "manual verification only" in verify-work checklist

*(Given the zero-new-dependency constraint of Phase 5 and the trivial nature of the changes, skipping automated tests for this phase is acceptable. Manual verification during `/gsd:verify-work` is sufficient.)*

## Sources

### Primary (HIGH confidence)
- Direct code read: `src/App.jsx` — phase logic, HUD click handler, activeSector state flow
- Direct code read: `src/components/3D/GatewayPane.jsx` — drawFrame idle label block, texture update loop
- Direct code read: `src/components/UI/TitleOverlay.jsx` — opacity/transition style, visible prop wiring
- Direct code read: `src/components/UI/EnterButton.jsx` — setPhase(3) on click
- Direct code read: `src/store/appState.js` — Zustand store shape, setActiveSector action
- Direct code read: `src/components/UI/AboutSector.jsx`, `SkillsSector.jsx`, `ProjectsSector.jsx` — confirmed none bind ESC

### Secondary (MEDIUM confidence)
- Zustand docs pattern: `useAppState.getState()` for synchronous reads in event handlers — verified via known API; avoids stale closure in non-React event contexts

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are installed and version-locked in package.json; no new dependencies required
- Architecture: HIGH — changes are in three specific, well-understood files with clear, small diffs
- Pitfalls: HIGH — stale closure and transition wiring pitfalls identified from direct code inspection, not speculation

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable — no third-party APIs involved, pure internal codebase changes)
