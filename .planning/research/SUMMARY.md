# Project Research Summary

**Project:** Digital Dominion — Tron Portfolio v1.1 Immersion Polish
**Domain:** UX polish milestone for an existing WebGL/R3F/GSAP single-page portfolio SPA
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This is a polish milestone on a fully shipped product, not a greenfield build. The v1.1 feature set (8 distinct UX improvements) is entirely implementable with the existing stack — React 19, Three.js, R3F 9.x, GSAP 3.x, Zustand 5.x, Tailwind — with no new dependencies. The work is about using existing tools more expressively: extending GSAP camera animation, adding keyboard event handling, replacing the boot animation internals, and wiring a simple command parser. The architecture is clean with a single Zustand store, a phase state machine, and a clear DOM-overlay-over-R3F-Canvas layering pattern that all new features follow.

The recommended approach is a staged build ordered by dependency depth: low-risk constant/CSS changes first (PANE-01, TITLE-01), then new-but-isolated components (NavHint, terminal boot log), then the core camera warp mechanic (NAV-05), and finally the interactive terminal that depends on the warp being wired (ABOUT-05/06). This ordering minimizes integration risk and produces visible wins immediately. All 8 features are P1 for this milestone — there is no feature triage to do, only sequencing.

The top risks are not architectural but implementation-level: GSAP tweens outliving React effects (stale `onComplete` closures), keyboard listener leaks, the R3F canvas stealing focus from the terminal input, and the sessionStorage boot gate causing a black screen on repeat visits if placed inside the component rather than in App.jsx. All five critical pitfalls have clear, well-established prevention patterns that already exist elsewhere in this codebase — the team just needs to follow them consistently.

---

## Key Findings

### Recommended Stack

No new libraries are required. The entire v1.1 feature set maps directly onto existing installed packages. Specifically: `useState`/`useEffect`/`useRef` handle the terminal boot log and interactive terminal input; GSAP's `gsap.timeline()` with `onUpdate` handles the camera warp (including the critical `camera.updateProjectionMatrix()` call on each FOV tick); Zustand's `getState()` escape hatch is the correct pattern for event handler closures to avoid stale state. The one rejected candidate worth noting is `xterm.js` — it adds 300KB+ for functionality this project's hand-rolled typewriter already exceeds.

**Core technologies in v1.1:**
- **GSAP 3.14.2:** Two-phase timeline for camera warp (`power3.in` out, `expo.out` return) — already installed, no plugin needed
- **Three.js 0.183.2:** `camera.fov` + `camera.updateProjectionMatrix()` for FOV stretch effect — stable API since r100+
- **React 19.2.0:** `useEffect` + `useRef` pattern for keyboard listeners and typed input — no library needed
- **Zustand 5.0.11:** `getState()` in event handlers for live state reads without stale closure risk — existing pattern in `App.jsx`
- **Tailwind CSS 4.2.1:** Boot terminal layout (`bg-black text-[#00FFFF] font-mono`) — zero new utilities needed

### Expected Features

Research confirmed all 8 features are feasible and correctly scoped. The priority matrix is flat — everything is P1 for this milestone.

**Must have (table stakes):**
- **ESC exits sectors (NAV-04)** — universal modal-dismiss convention; users feel trapped without it
- **Visible pane labels at rest (PANE-01)** — already 80% implemented at opacity 0.35; needs opacity increase to ~0.65
- **Fast title clear on CTA (TITLE-01)** — 1s ease-in exit feels sluggish; a CSS transition change to 0.25s ease-out is one line
- **Disc click returns to grid not home (NAV-03)** — already implemented in `App.jsx`; needs visual verification only

**Should have (differentiators):**
- **Tron terminal boot screen (BOOT-05)** — replaces jarring white-background shatter with dark void terminal log; first-impression differentiator
- **Hyper-reverse camera warp on exit (NAV-05)** — demonstrates GSAP + Three.js mastery to every technical recruiter; signature feature
- **Interactive terminal with "exit" command (ABOUT-05/06)** — elevates the About sector from passive typewriter to interactive CLI; memorable moment
- **Navigation affordance hint (PANE-02)** — one-time overlay prompting "CLICK A PANEL TO ENTER"; sessionStorage-gated, auto-dismisses in 4s

**Defer (v2+):**
- `aria-live` on terminal for screen readers — add once ABOUT-05 stabilizes
- `help` command in terminal — only if user testing reveals confusion
- Sound cue for warp exit — requires new audio asset
- Keyboard navigation between sectors from the grid — significant R3F interaction refactor

### Architecture Approach

The existing architecture is sound and requires no structural changes. All features integrate by extending existing component internals or adding small focused effects to `App.jsx`. The dominant patterns — render overlays in `App.jsx` gated on Zustand state, route all camera animation through `CameraController`, use `getState()` in event handlers — are already established and should be followed uniformly for v1.1. The Zustand store requires no new fields unless the optional postprocessing ChromaticAberration enhancement is added (which would need an `isWarping` boolean); even then, a `useRef` is a viable alternative that avoids store pollution.

**Major components and their v1.1 changes:**
1. **`BootSequence.jsx`** — replace shatter animation internals with terminal log scroll; `onComplete` contract unchanged
2. **`CameraController.jsx`** — replace flat `power2.inOut` home-return tween with two-phase GSAP timeline (depth plunge → warp back)
3. **`AboutSector.jsx`** — add `keydown` input layer after `done === true`; add hint to `TERMINAL_SEQUENCE` as data entry
4. **`App.jsx`** — add ESC `keydown` effect; add `showNavHint` state + effect; render `<NavHint />`
5. **`NavHint.jsx`** (new) — purely presentational; fixed bottom-center, sessionStorage-gated, auto-fades
6. **`GatewayPane.jsx`** — increase idle label opacity in `drawFrame` (one constant)
7. **`TitleOverlay.jsx`** — separate enter/exit opacity transitions (one style tweak)

### Critical Pitfalls

1. **GSAP stale `onComplete` closure fires on unmounted component** — always store timelines in `useRef`, kill in cleanup, call `useAppState.getState().setter()` inside callbacks instead of closing over React state. This is the single highest-risk pitfall for NAV-05.

2. **`camera.fov` tween silently fails without `camera.updateProjectionMatrix()`** — use `onUpdate: () => camera.updateProjectionMatrix()` on every FOV tween tick; without it the scene distorts or freezes visually mid-animation.

3. **OrbitControls remounts before camera reaches HOME_POSITION** — keep `setActiveSector(null)` inside `onComplete`, not at animation start; add `transitioning` as a second guard on `<OrbitControls enabled={!activeSector && !transitioning} />`.

4. **sessionStorage boot gate in wrong layer causes black screen on repeat visits** — gate must live in `App.jsx` (skip mounting or call `handleBootComplete` synchronously), never inside `BootSequence` which would silently return null without triggering `onComplete`.

5. **Keyboard listener conflicts: R3F canvas focus vs terminal input** — for NAV-04 ESC, guard with `getState().activeSector` check; for ABOUT-05 terminal input, use `onBlur={() => inputRef.current?.focus()}` to reclaim focus when the canvas steals it. Consider a shared `useKeydown(key, callback, active)` hook to eliminate ad-hoc `addEventListener` calls.

---

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md, the recommended four-stage build order is:

### Phase 1: Independent Low-Risk Wins
**Rationale:** These are constant/CSS changes with zero cross-feature dependencies. Ship them first to demonstrate visible progress and establish that the codebase is in a clean state before touching animation logic.
**Delivers:** Immediately improved UX across pane labels, title screen, and ESC navigation
**Addresses:** PANE-01, TITLE-01, NAV-04
**Avoids:** No pitfalls apply — these are purely cosmetic or additive one-liners
**Research flag:** Skip — standard patterns, no research needed

### Phase 2: New Isolated Components
**Rationale:** PANE-02 and BOOT-05 are self-contained: they either add a new presentational component or rewrite component internals with a preserved external contract. Neither touches the camera or animation systems, so they are safe to implement and verify before the riskier GSAP work.
**Delivers:** Polished first-impression (terminal boot log) and navigation discoverability (NavHint)
**Addresses:** PANE-02, BOOT-05
**Avoids:** Pitfall 4 (sessionStorage gate in wrong layer) — audit and fix the gate in `App.jsx` at this stage, before the boot animation changes
**Research flag:** Skip — patterns are well-documented and directly modeled on existing `AboutSector` typewriter

### Phase 3: Camera Warp Mechanic
**Rationale:** NAV-05 is the most technically complex feature and a prerequisite for the interactive terminal — the "exit" command should produce the full warp effect, not a flat tween. Build and fully verify the warp first in isolation.
**Delivers:** Cinematic two-phase sector exit animation — the portfolio's signature differentiator
**Addresses:** NAV-05, NAV-03 (verify disc click triggers warp)
**Avoids:** Pitfall 1 (stale onComplete), Pitfall 2 (missing updateProjectionMatrix), Pitfall 3 (OrbitControls snap)
**Research flag:** Skip — GSAP timeline + Three.js camera animation is a well-established pattern; the exact implementation is documented in STACK.md with verified code snippets

### Phase 4: Interactive Terminal
**Rationale:** ABOUT-05/06 builds on the warp being wired — typing "exit" should produce the full cinematic exit, not a flat transition. This phase also has the most nuanced keyboard focus interactions and benefits from the patterns established in Phase 1 (ESC listener) and Phase 3 (keyboard event cleanup discipline).
**Delivers:** Interactive CLI terminal with command parsing; "exit" command triggers full warp exit
**Addresses:** ABOUT-05, ABOUT-06
**Avoids:** Pitfall 5 (terminal input losing canvas focus), keyboard listener conflicts from Pitfall 3
**Research flag:** Skip — all interaction patterns are direct extensions of existing `AboutSector.jsx` code

### Phase Ordering Rationale

- **Dependency chain:** NAV-05 must precede ABOUT-05/06 so that `setActiveSector(null)` from the terminal produces the full warp effect at first integration
- **Risk escalation:** Stages go from zero-risk (CSS constants) to low-risk (new DOM component) to medium-risk (camera animation) to integration-risk (keyboard + focus + animation chain). Each stage's failures are isolated and correctable before the next
- **Pitfall coverage:** The four most critical pitfalls (stale GSAP closure, missing updateProjectionMatrix, OrbitControls snap, sessionStorage boot gate) all cluster around Phase 2 and Phase 3 — front-loading Phase 1 and the easy parts of Phase 2 buys time to plan these carefully

### Research Flags

Phases needing deeper research during planning:
- None for this milestone — all features are incremental extensions of existing, verified patterns in this codebase. The research files contain working code examples for the two most complex features (NAV-05 and ABOUT-05).

Phases with standard patterns (no additional research needed):
- All four phases — every implementation detail is resolved in STACK.md, FEATURES.md, and ARCHITECTURE.md with specific file/line references

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Full source read; installed versions verified against node_modules; no new dependencies required |
| Features | HIGH | All features are incremental on a working codebase; feasibility is not a question, only sequencing |
| Architecture | HIGH | Full source read of all modified files; integration points identified with specific line numbers |
| Pitfalls | HIGH | Pitfalls derived from direct codebase analysis plus known R3F/GSAP integration failure modes |

**Overall confidence:** HIGH

### Gaps to Address

- **OrbitControls `transitioning` guard:** ARCHITECTURE.md recommends adding `transitioning` as a second `enabled` guard on `<OrbitControls>`. This is described in PITFALLS.md as required but not yet present in `Scene.jsx`. Verify the exact conditional before implementing NAV-05 — it may already be handled by the `!activeSector` check if sectors always set `transitioning: true`.

- **BOOT-05 audio sync point:** The current `BootSequence.jsx` calls `playWithFade(2000)` and `initAudio()` internally. When the boot internals are replaced, these calls must be preserved at an equivalent timing point. The research recommends calling `playWithFade` when the first boot log line appears, but the exact hook point should be verified against `audioManager.js` behavior before implementation.

- **Optional ChromaticAberration postprocessing:** ARCHITECTURE.md notes this as a high-impact optional enhancement for the warp exit. It is deferred from the minimal viable warp implementation — if the Phase 3 warp feels visually thin, this is the first enhancement to add. It requires either an `isWarping` Zustand field or a ref-via-context approach; the decision should be made at Phase 3 planning time.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read: `src/App.jsx`, `src/store/appState.js`, `src/components/3D/CameraController.jsx`, `src/components/3D/GatewayPane.jsx`, `src/components/UI/BootSequence.jsx`, `src/components/UI/AboutSector.jsx`, `src/components/UI/TitleOverlay.jsx`, `src/components/Scene.jsx`
- GSAP 3.x Timeline API: https://gsap.com/docs/v3/GSAP/Timeline/ — `onUpdate` callback on individual tweens, confirmed available since GSAP 3.0
- Three.js `PerspectiveCamera.updateProjectionMatrix()`: https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.updateProjectionMatrix — required after any FOV change
- R3F `useThree` hook: https://docs.pmnd.rs/react-three-fiber/api/hooks#usethree — live camera ref

### Secondary (MEDIUM confidence)
- GSAP + Three.js camera FOV animation pattern: https://waelyasmina.net/articles/animating-camera-transitions-in-three-js-using-gsap/
- Interactive web terminal patterns: https://itnext.io/how-to-create-interactive-terminal-like-website-888bb0972288
- R3F Canvas focus conflict with DOM inputs: R3F GitHub discussions (known issue, multiple reports)
- WCAG 2.1 G21 / 2.1.2 No Keyboard Trap: https://www.w3.org/TR/WCAG20-TECHS/G21.html

### Tertiary (LOW confidence)
- Space warp hyperspace Three.js pattern: https://redstapler.co/space-warp-background-effect-three-js/ — reference for FOV animation feel, not implementation
- NN/g Animation Duration Guidelines: https://www.nngroup.com/articles/animation-duration/ — informs the ~0.8s total warp duration recommendation

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
