# AmbientFX — Design Spec

**Date:** 2026-03-21
**Feature:** Background ambient effects — lightning bolts + vertical data streaks
**Status:** Approved

---

## Overview

Add an `AmbientFX` component to the 3D scene that renders two types of infrequent, unpredictable background effects: branching cyan lightning bolts and falling vertical data streaks with binary text. Both effects are 3D world-space geometry that benefit from the existing bloom post-processing.

---

## Scope

- Visible only during **phase 3+** (Grid World onward — after the title screen)
- No floating ambient particles for now (can be added later)
- No new npm dependencies — uses Three.js imperatively + a fixed JSX pool of `<Text>` from `@react-three/drei` for streak labels
- No Zustand state — entirely self-contained

---

## Component Structure

**New file:** `src/components/3D/AmbientFX.jsx`

**Integration:** Added to `src/components/Scene.jsx` alongside existing phase-gated components:
```jsx
{phase >= 3 && <AmbientFX />}
```

### Internal architecture

The component renders a single `<group ref={groupRef}>` in JSX. All bolt and streak objects are created **imperatively** using the Three.js API (`new THREE.LineSegments`, `new THREE.Line`) and attached to / removed from this group via `groupRef.current.add(obj)` / `groupRef.current.remove(obj)`.

Two `useRef` arrays track active effects:
- `activeBolts` — `{ obj: THREE.LineSegments, holdTimer, fadeTimer, opacity }` per bolt
- `activeStreaks` — `{ group: THREE.Group, mat: THREE.LineBasicMaterial, yVelocity, textPoolIndex }` per streak

A single `useFrame((_state, delta) => { ... })` tick drives all scheduling, animation, and lifecycle cleanup.

A fixed **JSX pool of `<Text>` elements** (max 6, one per possible simultaneous streak label slot) is pre-mounted and managed by repositioning and toggling visibility in `useFrame`. This avoids imperative instantiation of drei's `<Text>` component, which is a React component and cannot be created with `new`.

**Caps:** Maximum 3 simultaneous bolts, maximum 4 simultaneous streaks. New spawns are discarded if the active array is at cap.

### Cleanup on unmount

A `useEffect` cleanup function:
1. Iterates all objects in `activeBolts` and `activeStreaks`
2. Calls `geometry.dispose()` and `material.dispose()` on each
3. Calls `groupRef.current.remove(obj)` for each
4. Clears the active arrays

This also covers the phase-change unmount case (when `phase` drops below 3, `Scene.jsx` unmounts `<AmbientFX />` and cleanup fires automatically).

---

## Effect 1: Lightning Bolts

### Trigger
- Random interval: **8–25 seconds** between strikes
- Occasional **double-strike**: 20% chance on each spawn; a second bolt fires **0.05–0.15 seconds** after the first
- Fully random — never on a fixed cadence
- Scheduler tracks elapsed time via accumulated `delta`; when elapsed >= next interval, spawn a bolt and draw a new random interval
- Double-strike state tracked via a `pendingSecondaryBolt` ref: `{ active: false, timer: 0 }`. When a primary bolt spawns with the double-strike roll, set `active = true` and `timer = randomSeconds(0.05, 0.15)`. In the same `useFrame` tick, count down `timer -= delta`; when `timer <= 0` and `active`, spawn the secondary bolt and reset `active = false`.

### Spawn
- Position: random x/z spread across the scene (x: -12 to 12, z: -10 to 5)
- Origin: y = 5–8 units (above the scene, in the "sky")
- Strikes downward

### Shape — branching algorithm
- Main trunk: divided into **5–8 steps**, each step ~0.6–1.0 units downward with random x/z jitter (±0.3–0.6 units per step)
- Branches: at each trunk node, 30% chance to spawn a branch; branch angle 30–60° from trunk direction; branches recurse 2–3 levels with probability halving each level
- Each segment (trunk or branch) is a pair of vertices in the `THREE.BufferGeometry` for a `THREE.LineSegments` object
- Material: `new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 1.0 })`
- Object created with `new THREE.LineSegments(geometry, material)`, added to group

### Lifecycle — all timing in seconds (delta-accumulated)
1. Appear instantly at full opacity (`material.opacity = 1.0`)
2. Hold for **0.08–0.12s** (`holdTimer` counts down via delta)
3. Fade `material.opacity` to 0 over **~0.2s** (subtract `delta / 0.2` per frame)
4. When opacity ≤ 0: call `geometry.dispose()`, `material.dispose()`, `group.remove(obj)`, remove from `activeBolts`

---

## Effect 2: Vertical Data Streaks

### Trigger
- Random interval: **4–12 seconds** between streaks
- Occasional **pair**: 25% chance on each spawn; second streak fires **0.1–0.3 seconds** after the first, at a nearby x/z position (±1 unit offset from the first)
- Independent scheduler from lightning
- Scheduler tracks elapsed time via accumulated `delta`
- Pair state tracked via `pendingSecondaryStreak` ref: `{ active: false, timer: 0, x, z }`. Same countdown pattern as `pendingSecondaryBolt`.

### Spawn
- Position: random x/z across the scene (x: -12 to 12, z: -10 to 5)
- Origin: y = 10–14 (high above the scene)
- Falls **downward**

### Shape and motion
- Straight vertical `THREE.Line` with a `THREE.BufferGeometry` of 2 vertices: `[x, yTop, z]` and `[x, yBottom, z]` where `yTop - yBottom = streakLength` (2–5 units, randomized per streak)
- Geometry and vertex positions are **static** — the comet motion is achieved by translating the streak's parent `THREE.Group` downward each frame: `streakGroup.position.y -= yVelocity * delta`
- Vertex colors: `[0, 1, 1]` (cyan, full opacity) at index 0 (bottom/tip), `[0, 0, 0]` (black, transparent-equivalent) at index 1 (top/tail) — using `vertexColors: true` on the material
- Material: `new THREE.LineBasicMaterial({ vertexColors: true, transparent: true })`
- `yVelocity`: 3–7 units/sec, randomized per streak

### Binary text labels
- A fixed pool of **6 `<Text>` JSX elements** (from `@react-three/drei`) is pre-mounted in `AmbientFX`'s render output, all initially `visible={false}`. 6 slots are used (not 4) to provide a buffer against race conditions where a new pair spawns before a prior pair's cleanup completes.
- Text content is driven by a `useRef` array: `textContents = useRef(['','','','','',''])`. The pool is rendered as `{textContents.current.map((str, i) => <Text key={i} ref={textRefs[i]} ...>{str}</Text>)}`. At spawn/release time only (not per frame), `textContents.current[slot]` is mutated and `invalidate()` from `useThree` is called to schedule a single React re-render. This avoids per-frame React state updates while keeping text content in React's render path.
- When a streak spawns, it claims the next available pool slot (round-robin index). `textContents.current[slot]` is set to 1–3 randomly chosen `"0"` / `"1"` characters. The `<Text>` ref's position is set to `[x + 0.3, yMidpoint, z]`, `visible = true`, font size `0.25`, color `#00FFFF`. `invalidate()` is called.
- In `useFrame`, `textRefs[slot].current.position.y` is updated each frame to follow the streak group's y translation (pure position mutation — no React re-render needed).
- When the streak exits, `textContents.current[slot] = ''`, `textRefs[slot].current.visible = false`, `invalidate()` called. The `<Text>` JSX nodes do **not** need explicit `dispose()` calls in the cleanup `useEffect` — React unmounting `<AmbientFX />` triggers Troika's own teardown automatically.

### Lifecycle
- `streakGroup.position.y` decrements each frame
- When leading tip y ≤ -2 (grid floor level): call `geometry.dispose()`, `material.dispose()`, `group.remove(streakGroup)`, release text pool slot, remove from `activeStreaks`
- No explicit fade — exits off-screen bottom

---

## Visual Parameters Summary

| Parameter | Value |
|---|---|
| Color | `#00FFFF` (Neon Cyan) |
| Post-processing | Existing bloom (no changes needed) |
| Lightning interval | 8–25s random |
| Streak interval | 4–12s random |
| Lightning hold time | 0.08–0.12s |
| Lightning fade duration | ~0.2s |
| Streak speed | 3–7 units/sec |
| Streak length | 2–5 units |
| Lightning trunk steps | 5–8 |
| Branch probability per node | 30% (halved per recursion level) |
| Max simultaneous bolts | 3 |
| Max simultaneous streaks | 4 |
| Text pool size | 6 slots |
| Scene spread (x) | -12 to 12 |
| Scene spread (z) | -10 to 5 |
| Lightning origin (y) | 5–8 |
| Streak origin (y) | 10–14 |
| Streak exit (y) | ~-2 |

---

## Out of Scope

- Floating ambient particles — deferred, add later if needed
- Sound effects on lightning
- Color variation (orange accents) — kept pure cyan for consistency with grid
- Mobile-specific handling — effects are subtle enough to leave on mobile
