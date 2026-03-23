# Gateway Pane Redesign — Spec

**Date:** 2026-03-22
**Status:** Approved

## Problem

The current `GatewayPane` uses a canvas texture that fills with randomly-shuffled hex characters and symbols on a near-black background. The decrypt-reveal hover animation sweeps these chars left-to-right before showing the label. The result is visually noisy — the label competes with the character field and is difficult to read.

## Goal

Replace the canvas drawing logic with a clean "Glowing Portal" design. The pane must be immediately legible at idle and satisfying to hover, with no character noise.

---

## Design

### Visual Language

- **Background:** `#000810` with a centered radial cyan gradient overlay (`rgba(0,50,60,0.7)` → transparent)
- **Border:** 1px solid cyan at low opacity (`rgba(0,255,255,0.18)` idle, `rgba(0,255,255,0.55)` hovered)
- **Label:** Uppercase sector name in white (`#ffffff`) with cyan text-shadow bloom
- **Horizontal rules:** Two thin gradient lines (transparent → cyan → transparent) flanking the label, at ~30% and ~70% height
- **Subtitle:** Small all-caps string below the lower h-line
- **Font:** `Roboto Mono` (already loaded) for all text on the canvas

### Idle State

| Element | Value |
|---|---|
| Background | `#000810` flat + radial cyan gradient at 70% opacity |
| Border | 1px, `rgba(0,255,255,0.18)` |
| Border glow | `ctx.shadowBlur=18`, `ctx.shadowColor=rgba(0,255,255,0.12)` |
| Label font | `600 16px Roboto Mono`, letter-spacing ~5px |
| Label color | `#ffffff` |
| Label glow | `shadowBlur=30`, `shadowColor=rgba(0,255,255,0.6)` |
| H-lines | `rgba(0,255,255,0.25)`, gradient fade left/right, span 64% of width |
| Subtitle | `GATEWAY ACCESS POINT`, 7px, `rgba(0,255,255,0.2)`, letter-spacing 4px |
| Idle animation | Border glow breathes on a 3s sine cycle (shadowBlur 18→36→18) |

### Hover State

Hover drives a `progress` value from 0→1 over ~300ms (ease-out). The same `drawPortalFrame(ctx, label, hoverProgress)` function handles both states continuously.

| Element | At progress=0 (idle) | At progress=1 (hovered) |
|---|---|---|
| Radial bg opacity | 0.7 | 0.95 |
| Border opacity | 0.18 | 0.55 |
| Border glow | shadowBlur=18 | shadowBlur=40 |
| Label glow | shadowBlur=30 | shadowBlur=60 |
| Corner brackets | not drawn | fully drawn |
| Corner position | offset 8px outside | at edge (0px offset) |
| Subtitle text | `GATEWAY ACCESS POINT` | `[ ENTER SECTOR ]` |
| Subtitle color | `rgba(0,255,255,0.20)` | `rgba(255,94,0,0.85)` |
| Top-right tag | not drawn | `SECTOR READY`, `rgba(0,255,255,0.45)` |

**Corner brackets:** Four L-shaped lines, each 16px per arm, 2px stroke width, `#00FFFF`, with `shadowBlur=12`. At `progress < 1` they are interpolated from 8px outside their final position inward.

### Leave Transition

On pointer-leave, `progress` animates back 1→0 at ~0.5× the enter speed (600ms).

---

## Implementation

### What changes

**`GatewayPane.jsx` — `drawFrame()` function**
Rename to `drawPortalFrame(ctx, label, hoverProgress, breathePhase)` and replace the body entirely. No character grid, no CHAR_SET, no decrypt sweep.

**Parameters:**
- `label` — sector name string (unchanged)
- `hoverProgress` — `[0, 1]`, driven by existing `decryptRef` (rename for clarity but reuse the same ref structure)
- `breathePhase` — `elapsedTime` passed in so the idle glow can sine-wave without separate state

**Render throttling:** Keep the existing strategy — draw every frame while animating, throttle to ~8fps at idle.

**Canvas size:** Keep `240×160`. The portal design is simple enough that this resolution is fine.

### What stays the same

- `decryptRef` hover direction/speed logic (reused as `hoverRef`)
- Billboard rotation (`Math.atan2` facing camera)
- Ring pulse on pointer-enter
- Fade in/out when entering/leaving a sector (`GatewayPanes.jsx` unchanged)
- `planeGeometry args={[5, 3.5]}` mesh size

### Canvas draw order

1. Clear + fill flat background `#000810`
2. Draw radial gradient overlay (opacity lerped by hoverProgress)
3. Draw border rect with glow (opacity + shadowBlur lerped)
4. Draw h-lines (opacity lerped slightly)
5. Draw label with glow (shadowBlur lerped)
6. Draw subtitle (color and text crossfaded by hoverProgress)
7. If hoverProgress > 0: draw corner brackets (position + opacity driven by hoverProgress)
8. If hoverProgress > 0: draw top-right tag (opacity = hoverProgress)

---

## Files Affected

| File | Change |
|---|---|
| `src/components/3D/GatewayPane.jsx` | Replace `drawFrame()` with `drawPortalFrame()`; update `useFrame` call signature |
| `src/components/3D/GatewayPanes.jsx` | No changes required |

---

## Out of Scope

- Font change (TR2N is used in idle label currently; this spec uses Roboto Mono throughout for consistency and canvas rendering reliability)
- Changing pane positions or sizes
- Changing the click/sector-dive behavior
- Mobile-specific changes
