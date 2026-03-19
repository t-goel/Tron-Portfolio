# Feature Research

**Domain:** UX polish features for immersive 3D Tron-themed portfolio SPA (v1.1 Immersion Polish milestone)
**Researched:** 2026-03-19
**Confidence:** HIGH (all features are incremental improvements to an existing working codebase; no unknowns about feasibility)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that recruiters/visitors expect from an immersive 3D portfolio. Missing these causes the experience to feel unfinished or hostile to exploration.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| ESC key exits sectors | Universal modal-dismiss convention (WCAG, browser standards); any overlay without an escape valve feels trapped | LOW | `keydown` listener on `document` in App.jsx; calls `setActiveSector(null)`. Already have click-disc fallback; this is parity. |
| Disc click returns to grid (not home) | The HUD disc is positioned at top-left with `TANMAY GOEL` label; clicking it while `activeSector` is set already calls `setActiveSector(null)` per existing App.jsx. But the behavior is implicit — the nav label does not reflect "grid" vs "home" context | LOW | Existing code already handles this in the `onClick` handler; needs verification that the right branch fires during sector view. |
| Visible pane labels at rest | Users who have not hovered should still know what each pane is before committing to a hover. Discovery without labels requires guesswork. The `drawFrame` in GatewayPane.jsx already draws a faint idle label at `rgba(0,255,255,0.35)` when `decryptProgress === 0` — this exists but may be too faint | LOW | Existing code has the hook; increase opacity from 0.35 to ~0.65–0.8 and optionally bump font size. No new architecture. |
| Title screen clears fast on CTA click | Clicking "ENTER THE GRID" triggers `setPhase(3)` immediately, but `TitleOverlay` uses `opacity: visible ? 1 : 0` with a `1s ease-in` transition. The 1-second ease-in (not ease-out) means the fade feels sluggish going away, not just on arrival | LOW | Change the opacity CSS transition to use a faster exit duration (~0.3s) when `visible` is false; distinguish enter vs exit transitions. |
| Navigation affordance hint for 3D space | A user landing in the grid for the first time has no affordance indicating the scene is draggable/orbital. Absence causes confusion or the impression it is a static background | LOW | One-time overlay (`sessionStorage` key, consistent with existing boot gate pattern). Auto-dismisses on first pointer drag or after 3–4 seconds. |

### Differentiators (Competitive Advantage)

Features that push beyond standard portfolio UX — these directly serve the "portfolio IS the proof of skill" value proposition.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tron terminal boot loading screen (BOOT-05) | Replaces the current shatter/crack animation that uses a light-colored background — jarring contrast with void-black Tron aesthetic. A dark terminal scrolling fake boot log aligns the loading moment with the Tron world identity. This is the first thing a recruiter sees. | MEDIUM | New component or replacement for `BootSequence.jsx`. Array of boot log lines, staggered `setTimeout` reveals. Needs careful sequencing: terminal lines scroll, then transition out to the grid world. Key interaction: lines like `INITIALIZING GRID...`, `LOADING IDENTITY DISC...`, `SYSTEM READY`. Auto-advance after last line. Replaces the white shard animation entirely. |
| Hyper-reverse camera warp animation on sector exit (NAV-05) | Most portfolio sites cut or fade between views. A cinematic warp reverse on exit reinforces the Tron world metaphor and signals "you are leaving the sector and returning through the grid." This is a demo of GSAP + Three.js mastery visible to every technical recruiter. | MEDIUM | In `CameraController.jsx`, the `activeSector === null` branch currently uses `power2.inOut` over 1.0s. Upgrade to a two-phase tween: (1) briefly push camera position further into the sector (depth plunge, 0.15s), then (2) fast snap back to `HOME_POSITION` with a high-power ease-out (0.7s `expo.out`). Simultaneously animate `camera.fov` from 60→110 then back to 60 over the same duration. **Critical**: must call `camera.updateProjectionMatrix()` on each frame — use GSAP's `onUpdate`. |
| Interactive About terminal with typed "exit" command (ABOUT-05/06) | Elevates the terminal from a passive typewriter to an interactive CLI shell. Demonstrates attention to detail and creates a memorable moment for technical visitors. The hint ("type `exit` to leave") lowers friction; the exit command itself is clever. | MEDIUM | After the typewriter sequence completes (`done === true`), enable a text `<input>` (or contenteditable) at the prompt line. Capture `Enter` keydown, parse typed value, handle `exit` → `setActiveSector(null)`. Show an inline hint line as part of the terminal output, not a separate UI widget. Maintain terminal aesthetics (monospace, cyan, cursor blink). |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good polish but would harm the experience in this context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full xterm.js or jQuery Terminal library for interactive terminal | Rich terminal emulation with autocomplete, scrollback, real command parsing | Adds 300–800KB to bundle; the terminal content is fixed bio content, not a real shell; library APIs fight the existing custom typewriter animation | Extend the existing handwritten terminal with a controlled-vocabulary command parser: whitelist `exit`, optionally `help`, `clear`, `whoami`. No library needed. |
| Particle warp "star field" during sector exit | Authentic hyperspace look | New particle system requires Three.js `Points` with custom shader or `BufferGeometry` — scope creep for a one-shot animation that most users will see once; budget/performance risk vs reward | FOV + position animation alone is cinematic enough. The existing bloom postprocessing on the grid will naturally streak as camera races backward. |
| Persistent "drag to navigate" hint that always shows | Ensures every user sees affordance | Clutters HUD after the first visit; feels patronizing to returning visitors; conflicts with Tron's clean aesthetic | Show once per session (`sessionStorage`), auto-dismiss after 3–4s or on first drag. Same gate pattern already used for boot sequence. |
| Looping boot screen on every page load | More "authentic" terminal feel | The existing `sessionStorage` gate for boot already solves this correctly. Removing the gate and looping on every refresh makes navigation feel punishing for returning visitors | Keep the `sessionStorage` gate. Apply the same gate to the new Tron terminal (check `hasSeenBoot` key, skip if set). |
| Typewriter "skip" button for terminal | Accessibility request | The terminal content is short (~6 commands, ~8 seconds total). A skip button adds visual noise for a brief sequence. If accessibility is the concern, add `aria-live` regions instead. | `aria-live="polite"` on the terminal body so screen readers announce lines as they appear. |

---

## Feature Dependencies

```
[BOOT-05: Tron terminal boot screen]
    └──replaces──> [BootSequence.jsx: current shatter animation]
    └──reuses──> [sessionStorage boot gate (existing)]
    └──reuses──> [audioManager.js playWithFade (existing)]

[ABOUT-05: Interactive terminal input]
    └──requires──> [AboutSector.jsx: done===true state (existing)]
    └──requires──> [setActiveSector (Zustand, existing)]
    └──enhances──> [ABOUT-06: exit hint line]

[ABOUT-06: Exit hint display]
    └──requires──> [ABOUT-05 — hint only makes sense if input is enabled]

[NAV-03: Disc returns to grid from sector]
    └──already implemented in App.jsx onClick, needs verification]
    └──enhances──> [NAV-05: warp animation — warp fires on this same state change]

[NAV-04: ESC exits sector]
    └──requires──> [setActiveSector(null) (Zustand, existing)]
    └──enhances──> [NAV-05: warp plays on any sector exit trigger]

[NAV-05: Hyper-reverse warp animation]
    └──requires──> [CameraController.jsx return-to-home branch (existing)]
    └──requires──> [camera.updateProjectionMatrix() called in GSAP onUpdate]
    └──conflicts──> [simultaneous sector overlay unmount timing — warp should complete before overlay fully fades, or at minimum start together]

[PANE-01: Visible labels by default]
    └──already partially implemented (opacity 0.35 idle label in drawFrame)]
    └──no dependencies — purely a constant change]

[PANE-02: Navigation affordance hint]
    └──requires──> [phase === 3 (grid visible, existing)]
    └──reuses──> [sessionStorage gate pattern (existing)]

[TITLE-01: Fast title clear on CTA]
    └──requires──> [TitleOverlay.jsx visible prop (existing)]
    └──no dependencies beyond CSS transition duration tweak]
```

### Dependency Notes

- **NAV-05 requires `camera.updateProjectionMatrix()`:** GSAP cannot auto-call Three.js-specific teardown; without `onUpdate: () => camera.updateProjectionMatrix()`, the FOV tween will silently fail to update the projection on-screen.
- **ABOUT-05 must wait for `done === true`:** Enabling the input field before the typewriter finishes would break the animation — the cursor is already rendered by the typewriter loop and the two would fight over DOM position.
- **BOOT-05 timing and audio:** The existing audio fade-in (`playWithFade(2000)`) is called at the `falling` phase of the current boot animation. The new terminal boot must hook audio at an equivalent point — recommended after the last boot log line appears or during a "SYSTEM READY" line reveal.
- **PANE-01 existing implementation:** `GatewayPane.jsx` line 88–96 already renders an idle label at `decryptProgress === 0`. The work is tuning opacity/size, not adding new rendering logic.

---

## MVP Definition

This is a polish milestone on a shipped product. Every feature listed is small enough to ship together. No feature is blocked by another unless noted above.

### Launch With (v1.1 — all in this milestone)

- [x] **TITLE-01** — fastest to implement; fixes an immediately noticeable jankiness on the main CTA
- [x] **PANE-01** — already 80% implemented; opacity constant change + verify font size
- [x] **NAV-03/04** — ESC key listener and verify disc click; minimal code, high functional value
- [x] **PANE-02** — navigation hint overlay; one-time, sessionStorage-gated, auto-dismiss
- [x] **BOOT-05** — replaces boot sequence; MEDIUM complexity but high visual impact at first impression
- [x] **NAV-05** — warp animation on exit; MEDIUM complexity, signature differentiator
- [x] **ABOUT-05/06** — interactive terminal; MEDIUM complexity, memorable recruiter moment

### Add After Validation (v1.x)

- [ ] `aria-live` on terminal body for screen reader support — add once core interactive terminal ships and behavior stabilizes
- [ ] `help` command in terminal (lists available commands) — add only if user testing shows confusion about what to type

### Future Consideration (v2+)

- [ ] Sound design: distinct audio cue for warp exit (separate from background loop) — deferred; Howler integration exists but requires new audio asset
- [ ] Keyboard navigation between sectors from grid (Tab cycles panes, Enter enters) — deferred; requires significant R3F interaction refactor

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| TITLE-01: Title fast-clear | MEDIUM | LOW (CSS transition change only) | P1 |
| PANE-01: Visible labels | HIGH | LOW (constant tweak in drawFrame) | P1 |
| NAV-03: Disc→grid | HIGH | LOW (verify existing branch, already coded) | P1 |
| NAV-04: ESC exits sector | HIGH | LOW (one `keydown` listener) | P1 |
| PANE-02: Nav hint | MEDIUM | LOW (overlay div, sessionStorage gate) | P1 |
| BOOT-05: Tron terminal boot | HIGH | MEDIUM (new component, staggered lines, audio sync) | P1 |
| NAV-05: Warp animation | HIGH | MEDIUM (two-phase GSAP tween, FOV animation) | P1 |
| ABOUT-05/06: Interactive terminal | HIGH | MEDIUM (input layer on top of existing typewriter, command parser) | P1 |

All features are P1 for this milestone — this is a focused polish sprint, not a feature-selection exercise.

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Implementation Patterns (Interaction Conventions)

### Terminal Boot Screen (BOOT-05)

**Pattern:** Fake boot log with staggered line reveals.

The established convention (popularized by hacker-aesthetic sites and Tron-adjacent UI) is:
1. Dark void background (`#000`) from frame 0
2. Lines append top-to-bottom, each with a brief delay (80–150ms between lines for readability)
3. Lines are prefixed with system-style tokens: `[OK]`, `>>`, `INIT:`, `LOADING:`
4. A final "SYSTEM READY" or "GRID INITIALIZED" line triggers the transition out
5. Transition out: either the terminal fades to black (then grid fades in), or the terminal lines glitch/dissolve away
6. Total duration should match the existing boot (which transitions at ~5.8s per BootSequence.jsx)

**Key difference from existing boot:** The current BootSequence shows a light `#fafafa` background with a white-shard crack animation. The new boot should be dark from the start — recruiter's first impression matches the Tron void aesthetic immediately.

**Audio sync point:** Call `playWithFade(2000)` when the first boot line appears (not at screen crack), so audio starts with the boot log.

### Gateway Pane Labels (PANE-01)

**Pattern:** Always-visible ambient label at rest; hover decrypt takes over.

Current implementation in `drawFrame`: the idle label renders at `rgba(0,255,255,0.35)` in 14px TR2N font, centered at `(120, 80)`. This is the correct pattern — it mirrors how Tron UI panels show system identifiers at low luminance in their resting state. Recommended change: increase to `rgba(0,255,255,0.65)` and bump to 16px. The hover decrypt animation already correctly takes over when `decryptProgress > 0`, so no conflict.

### Navigation Affordance Hint (PANE-02)

**Pattern:** First-visit overlay, auto-dismiss, positioned bottom-center.

Convention from WebGL portfolio sites (Bruno Simon's portfolio, award-winning Three.js demos): a small icon + text overlay (e.g., mouse icon + "DRAG TO EXPLORE") appears centered or bottom-center on first grid entry, fades out after 3–4 seconds or on the first `pointermove`/`pointerdown` event. `sessionStorage` gate identical to the boot sequence gate.

Position recommendation: bottom-center, above the HUD controls. Style: monospace, dim cyan, `rgba(0,255,255,0.5)` — not intrusive.

### Disc + ESC Navigation (NAV-03 / NAV-04)

**Pattern:** Dual exit affordance (explicit click + universal keyboard shortcut).

The existing App.jsx disc click already calls `setActiveSector(null)` when `activeSector` is set — this is correct behavior. The ESC key adds the standard overlay-dismiss convention (WCAG 2.1 criterion 2.1.2 No Keyboard Trap requires keyboard users be able to exit all overlays). Implementation: `document.addEventListener('keydown', handler)` in `useEffect` in App.jsx, where `handler` checks `e.key === 'Escape'` and calls `setActiveSector(null)` if `activeSector` is set.

### Warp Reverse Animation (NAV-05)

**Pattern:** Two-phase GSAP tween with simultaneous FOV spike.

The hyperspace warp effect in Three.js is well-established: rapidly increase FOV (creates a wide-angle "rushing through space" feel), then snap to destination. For a "reverse warp leaving a sector":

Phase 1 (plunge-in, 0.15s): push camera 3–4 units deeper into the sector from current position, ease `power2.in`. Simultaneously spike `camera.fov` from 60 to 100.

Phase 2 (warp back, 0.65s): animate position to `HOME_POSITION [0, 8, 14]` with `expo.out` easing. Simultaneously animate `camera.fov` back to 60. Call `camera.updateProjectionMatrix()` in `onUpdate` on every tick.

Total duration: ~0.8s — cinematic but not slow. Chain via GSAP timeline (`gsap.timeline()`) for clean sequencing.

**Critical note:** The sector overlay (ProjectsSector, AboutSector, SkillsSector) must not unmount *before* the warp starts — otherwise the user sees a flash of empty grid before the warp plays. Use a brief delay on the overlay unmount (e.g., the warp starts immediately, overlay fades simultaneously over the first 0.3s of the warp) rather than unmounting first.

### Interactive Terminal (ABOUT-05/06)

**Pattern:** Enable input after typewriter completes; whitelist command vocabulary.

After `done === true` in `AboutSector.jsx`:
1. Append a hint line to `lines` state: `{ type: 'hint', text: '> type "exit" to leave the terminal' }` — rendered in dim cyan (~0.5 opacity), not white, so it reads as system output not bio content.
2. Render an `<input>` element styled to match the terminal (no border, transparent bg, `#00FFFF` text, `Roboto Mono`) prefixed with a `$` prompt character.
3. On `Enter`: read value, trim, lowercase. If `exit` → `setActiveSector(null)`. Otherwise echo the typed command back as a `cmd` line followed by an output line like `command not recognized — type "exit" to leave`.
4. After exit is triggered, append `{ type: 'cmd', text: '$ exit' }` to lines for ~300ms before calling `setActiveSector(null)`, so the user sees their command acknowledged before the sector closes.

**Do not** focus the input automatically on mount — wait for the typewriter to finish, then `inputRef.current.focus()`. Auto-focusing during typewrite interrupts mobile keyboards and disrupts the animation.

---

## Existing Code Hooks (Integration Points)

| Feature | File | Existing Hook | Change Type |
|---------|------|--------------|-------------|
| BOOT-05 | `src/components/UI/BootSequence.jsx` | Full component rewrite or replacement | New component |
| PANE-01 | `src/components/3D/GatewayPane.jsx` line 88 | `ctx.fillStyle = 'rgba(0,255,255,0.35)'` | Constant change |
| PANE-02 | `src/App.jsx` | Mount when `phase === 3 && hudVisible && !firstVisitHintDone` | New overlay component |
| NAV-03 | `src/App.jsx` line 128 | Already fires `setActiveSector(null)` — verify test | Verify + no-op if correct |
| NAV-04 | `src/App.jsx` | No ESC listener exists | Add `useEffect` keydown |
| NAV-05 | `src/components/3D/CameraController.jsx` line 36 | `power2.inOut` 1.0s return tween | Replace tween with two-phase GSAP timeline |
| ABOUT-05/06 | `src/components/UI/AboutSector.jsx` | `done` state, `setLines`, contact render | Add input after `done`, add hint line |
| TITLE-01 | `src/components/UI/TitleOverlay.jsx` line 69 | `transition: 'opacity 1s ease-in'` | Change to faster exit: `opacity 0.25s ease-out` |

---

## Sources

- Codebase analysis: `src/components/UI/AboutSector.jsx`, `src/components/3D/GatewayPane.jsx`, `src/components/3D/CameraController.jsx`, `src/App.jsx`, `src/components/UI/BootSequence.jsx`, `src/components/UI/TitleOverlay.jsx`, `src/store/appState.js`
- WCAG 2.1 G21 / 2.1.2 No Keyboard Trap: https://www.w3.org/TR/WCAG20-TECHS/G21.html
- NN/G Animation Duration Guidelines: https://www.nngroup.com/articles/animation-duration/
- Three.js GSAP camera FOV animation (requires `updateProjectionMatrix`): https://waelyasmina.net/articles/animating-camera-transitions-in-three-js-using-gsap/
- Space warp / hyperspace Three.js pattern: https://redstapler.co/space-warp-background-effect-three-js/
- Interactive web terminal patterns (ITNEXT): https://itnext.io/how-to-create-interactive-terminal-like-website-888bb0972288
- `.planning/PROJECT.md` — milestone requirements and existing feature inventory

---

*Feature research for: Digital Dominion — v1.1 Immersion Polish milestone*
*Researched: 2026-03-19*
