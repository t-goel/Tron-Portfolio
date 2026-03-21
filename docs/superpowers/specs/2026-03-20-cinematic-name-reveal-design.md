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

**sessionStorage repeat-visit skip:** Not currently implemented in the codebase. Out of scope for this feature.

---

## Timing Context (Boot Sequence)

The existing boot/canvas lifecycle:
- `t=800ms` — `BootSequence` calls `setPhase(2)` (still visually showing)
- `t=3000ms` — `handleBootComplete()` fires → `showBoot=false` → Canvas `frameloop` switches from `'never'` to `'always'`
- `t=3000ms–3350ms` — Canvas is rendering but fully covered by the black fade overlay (`opacity: mainVisible ? 0 : 1` = opaque black). No canvas content is visible to the user during this window.
- `t=3350ms` — `mainVisible=true` → black fade overlay begins transitioning out (`transition: 'opacity 1.2s ease-in'`, starting at opacity=1). Ease-in means opacity stays near 1 for the first several hundred milliseconds.

**The cinematic must not start until `mainVisible=true`.** By that point `frameloop='always'` is confirmed active. The 350ms window between `showBoot=false` and `mainVisible=true` is covered by the black overlay — there is no visible flash of the backdrop from the wrong camera angle during that interval.

**Camera snap at mount is hidden by the overlay:** `CinematicIntro` mounts at `t=3350ms`, when the overlay is at `opacity=1` (the fade has just begun). The `camera.position.set(0,3,-34)` call happens instantaneously at mount — before the overlay has faded at all. The 1.2s ease-in fade means the overlay remains near-opaque for several hundred milliseconds, well past when the camera snap occurs. There is no visible jump.

---

## Component: NameBackdrop

**File:** `src/components/3D/NameBackdrop.jsx`

**Mount condition:** `phase >= 2`

Uses `@react-three/drei`'s `Text` component.

**Text content:**
- Line 1: `TANMAY GOEL` — TR2N font (`/src/assets/fonts/Tron-JOAa.ttf`), `fontSize={3}`, `color="#FF0000"` (Crimson Red). The scene's Bloom postprocessing produces the glowing red effect.
- Line 2: `SOFTWARE DEVELOPER` — Roboto Mono, `fontSize={0.8}`, `color="#F0F0F0"`, positioned ~1.5 units below Line 1.

**Position:** `[0, 3, -40]`

**Legibility check:** At FOV=60, camera at `[0, 8, 14]` looking toward `[0, 0, 0]`, the text at z=-40 is ~54 units away. Starting `fontSize={3}` is approximately 3° vertical field — borderline for a hero element. **If legibility is insufficient at this distance, adjust to `z=-30` and/or increase `fontSize` to `{5}`.** Implementer should verify visually and adjust before considering this criterion met.

**Long-term visibility:** Permanently visible for all phases >= 2. Intentionally always present as a background element. No fade-out. Naturally occluded by foreground scene geometry.

---

## Component: CinematicIntro

**File:** `src/components/3D/CinematicIntro.jsx`

**Mount condition:** `phase === 2 && mainVisible`

Unmounts when phase advances to 3.

> **Why a separate component:** `CameraController` only mounts at `phase >= 3`. `CinematicIntro` runs exclusively at `phase === 2` — they never overlap, and both use the same default R3F canvas camera from `useThree()`.

**Implementation:**

```js
export default function CinematicIntro() {
  const { camera } = useThree()
  const setPhase = useAppState((s) => s.setPhase)

  useEffect(() => {
    const mountedRef = { current: true }

    // Synchronously position camera before first rendered frame
    camera.position.set(0, 3, -34)
    camera.lookAt(0, 3, -40)

    // Proxy for lookAt interpolation — tweened in parallel with camera.position
    const lookAtProxy = { x: 0, y: 3, z: -40 }

    const positionTween = gsap.to(camera.position, {
      x: 0, y: 8, z: 14,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z),
      onComplete: () => {
        if (mountedRef.current) setPhase(3)
      },
    })

    // Concurrent tween on lookAt proxy — same duration + delay as position tween
    const lookAtTween = gsap.to(lookAtProxy, {
      x: 0, y: 1, z: 0,   // matches OrbitControls target={[0, 1, 0]} in Scene.jsx
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
    })

    return () => {
      mountedRef.current = false
      positionTween.kill()
      lookAtTween.kill()
      // kill() prevents onComplete from firing if tween is mid-flight.
      // In the normal completion path: onComplete fires → setPhase(3) → component unmounts
      // → cleanup runs. mountedRef is still true when onComplete fires (component hasn't
      // unmounted yet), so setPhase(3) is called correctly.
      // The mountedRef guard covers the abnormal case: external unmount (dev HMR) while
      // the tween is still running. In that case cleanup kills the tween before completion,
      // so onComplete never fires anyway. The guard is a belt-and-suspenders safety net.
      // Known dev limitation: React Strict Mode double-invoke will
      // fire camera.position.set() twice; second invocation resets to start position,
      // which is correct behavior (tween restarts cleanly).
    }
  }, [camera, setPhase])

  return null
}
```

---

## Scene.jsx Changes

```jsx
// Before CameraController and GridFloor (which mount at phase >= 3):
{phase >= 2 && <NameBackdrop />}
{phase === 2 && mainVisible && <CinematicIntro />}
```

`mainVisible` is passed as a new prop from `App.jsx` to `Scene`.

---

## App.jsx Changes

- Pass `mainVisible` prop to `<Scene mainVisible={mainVisible} />`
- Remove `TitleOverlay` import and render
- Remove `EnterButton` import and render
- Remove `titleGlitch` state and `setTitleGlitch`
- Remove the `onHoverChange` prop wiring

---

## Data Flow

```
t=0       BootSequence starts
t=800ms   setPhase(2) — NameBackdrop not yet mounted (mainVisible still false)
t=3000ms  handleBootComplete → showBoot=false → frameloop='always'
t=3350ms  mainVisible=true

  → Scene mounts NameBackdrop (phase >= 2)
  → Scene mounts CinematicIntro (phase === 2 && mainVisible)
  → camera.position.set(0,3,-34), camera.lookAt(0,3,-40)
  → 1.5s GSAP delay

t≈4850ms  positionTween + lookAtTween fire simultaneously (2.5s)

t≈7350ms  onComplete: setPhase(3)
  → CinematicIntro unmounts (phase !== 2)
  → App.jsx disc dock useEffect fires (phase === 3)
  → disc dock GSAP completes → setHudVisible(true)
  → CameraController mounts, OrbitControls mounts (phase >= 3)
  → Grid world interactive
```

---

## What Is Not Changing

- Phase 1 (`BootSequence`) — unchanged; it already calls `setPhase(2)` and `onComplete`, both still used
- Phase 3+ disc dock and HUD (`App.jsx` lines 55-71) — purely reactive to `phase === 3`, no changes
- `CameraController` — unchanged
- Sector camera transitions — unchanged
- `appState.js` — unchanged
- `MuteToggle`, `SocialIcons`, `GridAffordanceHint`, `MobileGateway` — unchanged

---

## Success Criteria

- After boot, camera opens tight on the name text with no user interaction required
- Name and subtitle are clearly readable during the 1.5s pause
- Pull-back is smooth and cinematic (~2.5s)
- Once at home position, the name is visible as a permanent backdrop in the distance behind the gateway panes
- Phase 3 disc dock fires automatically with no regression in timing or behavior
- `TitleOverlay` and `EnterButton` are fully removed with no dead code remaining
