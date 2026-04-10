# Arena Design Spec
**Date:** 2026-04-10  
**Feature:** Tron Colosseum Arena surrounding the light cycle playing field

---

## Overview

A segmented-panel Tron-style arena wall enclosing the light cycle playing field. Purely aesthetic in Phase 1, with structure designed to support future interactive portfolio section portals embedded in the walls.

---

## Geometry

- **Shape:** Square, **50×50 units**, centered at world origin `[0, 0, 0]`
- **Floor level:** `y = -3` (matching the player start position and grid floor)
- **Wall height:** 8 units (base at `y = -3`, top at `y = 5`)
- **Corner pillar height:** 12 units (base at `y = -3`, top at `y = 9`) — taller than walls for visual accent
- **Wall thickness:** 1 unit (depth)
- **Open top:** No ceiling — camera can freely look in/out

### Panel Layout (per wall)

- Panel size: **4u wide × 3u tall × 1u deep**
- Gap between panels: **0.5u**
- Two rows of panels stacked vertically (bottom row: `y = -3` to `y = 0`, top row: `y = 0.5` to `y = 3.5`), with a 2u solid base strip below and a 1u cap strip at top
- Approx **10 panels per row** per wall (4u panel + 0.5u gap × 10 ≈ 45u, leaving ~2.5u for corner pillar insets)

---

## Materials

| Element | Material | Color | Notes |
|---|---|---|---|
| Panel body | `MeshStandardMaterial` | `#001a1a` | Very dark, no visible glow |
| Panel edge strips (top/bottom) | `MeshBasicMaterial` | `#00FFFF` | `toneMapped: false` — Bloom halos |
| Corner pillar body | `MeshStandardMaterial` | `#002020` | Slightly lighter than panels |
| Corner pillar cap | `MeshBasicMaterial` | `#00FFFF` | `toneMapped: false` — bright glow |
| Base strip | `MeshStandardMaterial` | `#001a1a` | Continuous along wall bottom |

Bloom post-processing (already in `Scene.jsx`) handles all glow — no custom shader needed.

---

## Component Structure

**File:** `src/components/3D/Arena.jsx`

```
<Arena>
  <group name="wall-north">   <!-- z = -25 -->
    <mesh name="base-strip" />
    <mesh name="panel-row-bottom" />  <!-- repeated per panel -->
    <mesh name="panel-row-top" />
    <mesh name="cap-strip" />
  </group>
  <group name="wall-south">   <!-- z = +25 -->
  <group name="wall-east">    <!-- x = +25 -->
  <group name="wall-west">    <!-- x = -25 -->
  <mesh name="pillar-NW" />
  <mesh name="pillar-NE" />
  <mesh name="pillar-SW" />
  <mesh name="pillar-SE" />
</Arena>
```

Each wall group is named for future section portal injection. A `sectionIndex` prop (currently unused) is reserved per wall group for later `SectionPortal` swap-in.

---

## Scene Integration

- Added to `Scene.jsx` at `phase >= 3` alongside `LightCycles`
- No physics, no collision — visual only in this phase

```jsx
{phase >= 3 && <Arena />}
```

---

## Future Section Portal Support

The center 2–3 panels of each named wall group will later be replaced by a `SectionPortal` component:
- Different emissive color (orange `#FF5E00` for active portal)
- Collision/proximity trigger zone (invisible box in front of wall)
- On player approach: transition to portfolio sector view

Wall naming convention: `wall-north`, `wall-south`, `wall-east`, `wall-west` — maps to portfolio sections TBD.

---

## Performance

- All panels use shared geometry instances where possible (`BoxGeometry` reused across panels of same size)
- Static meshes — no per-frame updates
- Frustum culling enabled (default)
