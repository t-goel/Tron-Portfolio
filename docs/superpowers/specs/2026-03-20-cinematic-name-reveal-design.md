# Cinematic Name Reveal — Design Spec

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Replace the static Phase 2 title screen (name + "ENTER THE GRID" button) with a fully automatic cinematic sequence. After the boot sequence, the camera starts close on a 3D name backdrop deep in the scene, pauses briefly, then pulls back to reveal the full grid world. No user interaction required — the transition to Phase 3 is triggered automatically on animation complete.

---

## Phase Structure

| Phase | Before | After |
|-------|--------|-------|
| 1 | Boot Sequence | Boot Sequence (unchanged) |
| 2 | Static title screen + Enter button | Cinematic name reveal (auto-play) |
| 3 | Disc dock → HUD | Disc dock → HUD (unchanged, auto-triggered) |
| 4+ | Grid world / Sectors | Unchanged |

`TitleOverlay`, `EnterButton`, and the `titleGlitch` state in `App.jsx` are removed entirely.

---

## Component: NameBackdrop

**File:** `src/components/3D/NameBackdrop.jsx`

A new 3D component mounted inside `Scene` whenever `phase >= 2`. Uses `@react-three/drei`'s `Text` component to render two lines of text deep in the scene.

**Text content:**
- Line 1: `TANMAY GOEL` — TR2N font (`/src/assets/fonts/Tron-JOAa.ttf`), large, crimson red (`#FFE8E8`) with emissive red glow matching the existing title style
- Line 2: `SOFTWARE DEVELOPER` — Roboto Mono, smaller, off-white (`#F0F0F0`), positioned below Line 1

**Position:** `[0, 3, -40]` — far behind the gateway panes (projects pane sits around z=-12), ensuring the text reads as a distant backdrop from the home camera at `[0, 8, 14]`.

**Sizing:** Large enough to fill the frame when the camera is at the close-up start position, but legible at distance from home. Exact font size tuned during implementation.

**Persistence:** Remains mounted for all phases >= 2, so the name is always visible as a backdrop in the grid world.

---

## Camera Cinematic Sequence

**Modified file:** `src/components/3D/CameraController.jsx`

The intro sequence fires once when phase becomes 2. It does not conflict with the existing sector camera logic (which only runs on `activeSector` changes).

**Timing:**

1. **Phase 2 start** — camera is immediately repositioned (no animation, instant) to `[0, 3, -34]` facing the text at `[0, 3, -40]`
2. **1.5s pause** — name is readable, nothing moves
3. **GSAP pull-back, ~2.5s, `power2.inOut`** — animates `camera.position` from `[0, 3, -34]` to `[0, 8, 14]` (home); simultaneously animates the camera's lookAt target from `[0, 3, -40]` to `[0, 0, 0]`
4. **On complete** — calls `setPhase(3)`, triggering the existing disc dock → HUD sequence

**Implementation note on lookAt:** R3F cameras require an explicit `camera.lookAt()` call each frame when animating the look target. The GSAP tween will animate a `lookAt` proxy object `{ x, y, z }` and call `camera.lookAt(x, y, z)` in the `onUpdate` callback.

---

## App.jsx Changes

- Remove `TitleOverlay` import and render
- Remove `EnterButton` import and render
- Remove `titleGlitch` state and `setTitleGlitch`
- Phase 2 no longer renders any 2D overlay — the cinematic is fully 3D
- The `sessionStorage` repeat-visit skip (if present) should skip to phase 3, not phase 2

---

## Data Flow

```
Boot ends
  → setPhase(2)
  → CameraController detects phase 2
  → Instant reposition to [0, 3, -34]
  → 1.5s setTimeout
  → GSAP tween: position + lookAt → home
  → onComplete: setPhase(3)
  → Existing disc dock animation fires
  → setHudVisible(true)
  → Grid world interactive
```

---

## What Is Not Changing

- Phase 1 (BootSequence) — unchanged
- Phase 3+ disc dock and HUD animations — unchanged
- Sector camera transitions (about/skills/projects) — unchanged
- `appState.js` phase numbering — unchanged
- `MuteToggle`, `SocialIcons`, `GridAffordanceHint` — unchanged
- Mobile path (`MobileGateway`) — unchanged

---

## Success Criteria

- After boot, camera opens tight on the name text with no user interaction required
- Name and subtitle are clearly readable during the 1.5s pause
- Pull-back is smooth and cinematic (~2.5s)
- Once at home position, the name is visible as a backdrop in the distance behind the gateway panes
- Phase 3 disc dock fires automatically with no regression
- `TitleOverlay` and `EnterButton` are fully removed with no dead code remaining
