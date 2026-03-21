# Cinematic Name Reveal — Improvements Spec
Date: 2026-03-20

## Overview

Four targeted improvements to the existing cinematic name reveal sequence (phase 2):
1. Fix title text clipping into the name
2. Fix camera start position (too close — font edges visible)
3. Add organic flicker glow with scene lighting to the name
4. Fix transition order (grid visible during cinematic, panes rise after)

---

## 1. NameBackdrop — Title Position Fix

**File:** `src/components/3D/NameBackdrop.jsx`

- Move title text (`contact.title`) from `position={[0, 1.5, -40]}` to `position={[0, -0.5, -40]}` to clear the name text's baseline and eliminate overlap.
- This value should be verified visually — the Tron display font may have ascenders/descenders beyond the nominal em-square. Aim for at least 0.5 world units of clear gap between the name's visual baseline and the title's cap-height. Adjust y further downward if needed.

---

## 2. CinematicIntro — Camera Start Position Fix

**File:** `src/components/3D/CinematicIntro.jsx`

- Change camera start position from `[0, 3, -34]` to `[0, 3, -20]` — moving the camera 14 units closer to the origin (and therefore 14 units further from the text at `z: -40`) so the full name is visible in frame without showing extreme font edge detail.
- Also update the synchronous `camera.position.set(0, 3, -34)` call inside `useEffect` (before the GSAP tween) to `camera.position.set(0, 3, -20)`.
- `lookAt` target, end position, timing, delay, and easing all unchanged.

---

## 3. NameBackdrop — Organic Flicker Glow

**File:** `src/components/3D/NameBackdrop.jsx`

### Color change
- Name text color changes from red (`#FF0000`) to cyan (`#00FFFF`) — cyan blooms more effectively with the existing Bloom post-processing and is more on-brand for the "powered on" Tron aesthetic.

### Flicker signal
- A `useFrame` loop maintains three refs: `flickerValue` (current), `flickerTarget` (next target), `timeToNextJump` (countdown in seconds).
- Each frame: decrement `timeToNextJump` by delta. When it reaches 0, pick a new random target in [0, 1] and a new random interval in [0.08, 0.20]s.
- Each frame lerp formula: `flickerValue = flickerValue + (flickerTarget - flickerValue) * (1 - Math.exp(-8 * delta))`. This is frame-rate-independent exponential smoothing with a half-life of ~87ms — the value reaches ~95% of target in ~375ms, giving a fast but not instantaneous response.
- This produces organic irregularity: brief stable periods with quick random spikes, like a Tron panel powering on.

### Text color animation
- Declare two `THREE.Color` instances at module or component level: `dimColor = new THREE.Color('#00CCCC')` and `brightColor = new THREE.Color('#00FFFF')`.
- Each frame, lerp between them and write to the troika text mesh: `textRef.current.color.lerpColors(dimColor, brightColor, flickerValue)`.
- `textRef` is a `useRef` attached via `ref={textRef}` on the `<Text>` component. `@react-three/drei`'s `Text` forwards its ref to the underlying troika-three-text mesh, so `textRef.current.color` is a `THREE.Color` instance after mount. Do NOT assign a hex string directly to `textRef.current.color` — that is a silent no-op on troika mesh instances.

### Point light
- Add `<pointLight ref={lightRef} color="#00FFFF" position={[0, 3, -38]} />` — just in front of the name text.
- Map `flickerValue` to intensity: range [0.5, 3.0].
- Update `lightRef.current.intensity` imperatively each frame.
- The light casts onto the grid floor and surrounding geometry, making the glow feel physically present.

### Phase gating
- Check `phase === 2` at the top of `useFrame` and early-return if false. This prevents animation work in phases 3+.
- Note: the `useFrame` callback remains registered (R3F subscriptions persist until unmount, and `NameBackdrop` stays mounted at `phase >= 2`). The overhead in phases 3+ is a single comparison per frame — negligible, and acceptable.

### Pre-existing red point light
- `Scene.jsx` has an existing `<pointLight color="#FF0000" position={[0, -3, -5]} intensity={0.5} />`. This is far from the name text at `z: -40` and does not significantly contaminate the cyan glow. Leave it in place.

---

## 4. Scene — Grid Visible During Cinematic

**File:** `src/components/Scene.jsx`

- Change `GridFloor` render condition from `{phase >= 3 && <GridFloor />}` to `{phase >= 2 && <GridFloor />}`.
- `GatewayPanes` remain at `phase >= 3` — they mount after the cinematic completes and perform their existing floor-rise entrance animation.
- No other changes to Scene.

**Visual result:** As the camera pulls back from the name, the dark grid floor is already lit below. When phase 3 triggers, the gateway panes rise up from the grid as they currently do.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/3D/NameBackdrop.jsx` | Title y: 1.5 → -0.5; name color: red → cyan; useFrame flicker; point light |
| `src/components/3D/CinematicIntro.jsx` | Camera start z: -34 → -20 |
| `src/components/Scene.jsx` | GridFloor condition: `phase >= 3` → `phase >= 2` |

---

## Success Criteria

- Title text is fully below the name with no overlap
- Full name is visible in frame at camera start position
- Name flickers with organic irregularity in cyan, casting light onto the scene
- Grid floor is visible during the camera pull-back
- Gateway panes rise up after phase 3 triggers, same as current behavior
- GatewayPanes are NOT visible during phase 2 (cinematic)
- No regressions in phase transitions, HUD, or disc dock behavior
