# Tron Light Cycle Game — Design Spec
**Date:** 2026-04-09  
**Status:** Approved

---

## Overview

Replace the gateway pane navigation system with a fully playable Tron light cycle game rendered on the existing R3F scene. The game IS the portfolio landing experience. Portfolio content sections (About, Skills, Projects) are deferred as stretch goals accessible via on-grid ramp entry zones.

---

## What Gets Removed

- `src/components/3D/GatewayPanes.jsx` and `GatewayPane.jsx` — deleted entirely
- `src/components/UI/ProjectsSector.jsx`, `AboutSector.jsx`, `SkillsSector.jsx` — deleted entirely
- `src/components/UI/MobileGateway.jsx`, `GridAffordanceHint.jsx` — deleted entirely
- `OrbitControls` from `Scene.jsx` — removed entirely (camera is now a chase cam)
- `activeSector` state from `appState.js` — removed (no sectors)
- HUD home button in `App.jsx` — removed
- All `activeSector` conditionals in `App.jsx` and `Scene.jsx`

---

## Arena

- **Size:** 40×40 cells, centered at world origin (`x: ±20`, `z: ±20`)
- **Cell size:** 1 Three.js unit — aligns exactly with the existing `GridFloor` `cellSize={1}`
- **Visual edges:** Unchanged — the existing `fadeDistance={55}` on `GridFloor` keeps edges fading naturally to black. The arena does not have visible hard walls.
- **Soft boundary:** When a bike is within 5 cells of any edge, a faint light-blue (`#AADDFF`) glow plane fades in on that wall face (`opacity` lerps 0 → 0.35 based on proximity). On reaching 1 cell from the edge, the bike is automatically turned. The glow dissipates once the bike turns away.

---

## Bikes

### Player Bike
- **Color:** Cyan `#00FFFF`
- **Spawn:** `{ x: 0, z: 14 }`, facing `−Z` (toward the name / NPCs)
- **Controls:** Arrow keys and WASD — queue next requested 90° turn, applied at the next game tick. 180° reversal is ignored.
- **Invincibility:** The player cannot die. Running into an NPC trail kills that NPC. The player's own trail does not harm the player.

### NPC Bikes
- **NPC 1 color:** Orange `#FF5E00`
- **NPC 2 color:** Red `#FF0000`
- **Spawn:** `{ x: -3, z: -18 }` and `{ x: 3, z: -18 }` respectively, facing `+Z` (toward player)
- **Speed:** Same as player — 10 cells/sec (1 cell per 100ms tick)

---

## Game Loop

Fixed-interval tick at **100ms** via `setInterval` inside `useGameLoop.js`. Each tick:

1. **Move** each live bike 1 cell forward in its current direction
2. **Record** previous cell into the bike's trail `Set<string>` (key: `"x,z"`)
3. **Collision check** (in order):
   - If new player position is in an NPC's trail → kill that NPC
   - If new NPC position is in player's trail, player's current cell, or any other NPC's trail → kill that NPC
   - NPCs do not kill the player under any circumstance
4. **Boundary check:** If any bike's next cell would be outside `±20`, auto-turn it (prefer right, fallback left, fallback 180° only if both are blocked)
5. **NPC AI:** Before moving, each NPC looks 3 cells ahead in its current direction. If the path is blocked (trail or boundary within 3 cells), it picks a valid turn direction. Tie-breaking is randomized with a small bias toward the player's position to keep NPCs aggressive.

---

## Trails

Each bike owns a single `THREE.BufferGeometry` mesh that grows as the bike moves. Trail segments are thin vertical ribbon walls:

- **Thickness:** 0.08 units (razor thin, seen edge-on)
- **Height:** 1.8 units tall — bottom at `y = -3` (grid floor), top at `y = -1.2`
- **Material:** `MeshBasicMaterial` with `color` = bike color, `transparent: true`, `opacity: 0.7`, `side: THREE.DoubleSide`
- **Construction:** For each new waypoint appended to the trail, add a quad (4 vertices, 2 triangles) connecting the previous waypoint to the new one as a vertical face. Vertices are appended to the `BufferGeometry` position array; `drawRange` is updated each tick rather than recreating the geometry.
- **Glow:** No additional work needed — the existing `Bloom` post-processing in `Scene.jsx` picks up the emissive color automatically.

---

## NPC Death & Respawn

1. **Death flash:** On kill, the NPC's trail and mesh flash white for 150ms, then the trail geometry is cleared and the mesh disappears.
2. **Respawn travel:** After a 500ms pause, the NPC bike reappears at its spawn position (`z = -18`) with a cleared trail and drives toward the player again following the same intro path.
3. **Trail reset:** The NPC's trail `Set` is cleared on respawn. Old trail geometry is discarded and a new empty `BufferGeometry` is created.

---

## Intro Animation (Phase 2 → Phase 3 Transition)

The existing `CinematicIntro` handles the camera sweep. After it completes and `phase` becomes `3`:

1. NPCs spawn at `z = -18` already facing `+Z` — they begin moving immediately (game loop starts)
2. Player bike appears at `z = +14` facing `−Z` — player input is enabled immediately
3. `NameBackdrop` fades out over 1 second as phase 3 begins (add `opacity` animation keyed on phase)
4. No separate "countdown" — the approach of the two NPC bikes IS the dramatic opener

---

## Camera (Chase Cam)

Replaces `OrbitControls` entirely. Implemented in `CameraController.jsx` (existing file, logic replaced):

- **Offset:** 6 units behind the player, 4 units above: `offset = dir * -6 + up * 4`
- **Target position:** `camera.position` lerps toward `bikeWorldPos + offset` each frame with factor `1 - exp(-8 * delta)`
- **Look target:** `camera.lookAt` targets `bikeWorldPos + dir * 4` (4 cells ahead of bike), also lerped
- **Tilt:** Camera rolls ±3° smoothly when turning (purely cosmetic, adds cinematic feel)

---

## New Files

| File | Purpose |
|------|---------|
| `src/components/3D/TronGame.jsx` | Game orchestrator — mounts LightCycles, ArenaBoundary, wires up game loop |
| `src/components/3D/LightCycle.jsx` | Single bike mesh + trail geometry; props: `position`, `direction`, `trail`, `color`, `alive`. Contains a `BikeModel` sub-component (procedural primitives by default). See **Swapping in a Custom Model** below. |
| `src/components/3D/ArenaBoundary.jsx` | 4 soft boundary wall planes, opacity driven by proximity to nearest bike |
| `src/hooks/useGameLoop.js` | Fixed 100ms tick, owns all mutable game state via refs, exposes read-only state snapshot via `useState` |
| `src/hooks/usePlayerInput.js` | Keydown listener, buffers next requested turn direction |

## Modified Files

| File | Change |
|------|--------|
| `src/components/Scene.jsx` | Swap `<GatewayPanes />` → `<TronGame />`, remove `OrbitControls`, remove `activeSector` usage |
| `src/components/3D/CameraController.jsx` | Replace orbit logic with chase cam lerp |
| `src/components/3D/NameBackdrop.jsx` | Fade out when phase transitions from 2 → 3 |
| `src/store/appState.js` | Remove `activeSector`, `setActiveSector`, `transitioning`, `setTransitioning` |
| `src/App.jsx` | Remove sector overlay imports and renders, remove HUD home button, remove sector-related `useEffect` |

---

## Swapping in a Custom Model

When you have a `.glb` file ready, one change in one file:

**`src/components/3D/LightCycle.jsx`** contains a `BikeModel` component near the top:

```jsx
// SWAP HERE — replace this component with your GLTF model
function BikeModel({ color }) {
  // procedural primitives...
}
```

Replace it with:

```jsx
import { useGLTF } from '@react-three/drei'

function BikeModel({ color }) {
  const { scene } = useGLTF('/models/light-cycle.glb')
  // Clone so each bike gets its own material instance
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => {
    clone.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone()
        node.material.color.set(color)
        node.material.emissive.set(color)
        node.material.emissiveIntensity = 0.8
      }
    })
  }, [clone, color])
  return <primitive object={clone} />
}
```

Drop your `.glb` into `public/models/light-cycle.glb`. The trail, collision logic, camera, and NPC AI are completely unaffected.

---

## Stretch Goals (Out of Scope for This Spec)

- **Ramp entry zones:** Marked cells near arena edges that, when entered, transition to a portfolio section overlay. One per section (About, Skills, Projects). Visual indicator: glowing ramp geometry on the grid.
- **Mobile support:** Touch swipe controls for turning.
- **Score / survival timer:** UI overlay showing time survived and NPC kill count.

---

## Design System Alignment

- All bike/trail colors drawn from existing palette: Cyan `#00FFFF`, Orange `#FF5E00`, Red `#FF0000`
- Font: existing TR2N font (Tron-JOAa.ttf) if any game UI labels are needed
- Bloom intensity unchanged — `1.2` with `luminanceThreshold: 0.2` already makes neon geometry glow correctly
