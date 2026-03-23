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

- **Background:** `#000810` flat fill + centered radial cyan gradient overlay
- **Border:** Drawn on canvas as a stroked rect with `ctx.shadowBlur` glow; opacity and blur lerp on hover
- **Label:** Uppercase sector name in white `#ffffff` with cyan text-shadow bloom
- **H-lines:** Two 1px horizontal gradient lines flanking the label (one above, one below)
- **Subtitle:** Small all-caps string below the lower h-line; crossfades from cyan to orange on hover
- **Font:** `Roboto Mono` for all text on the canvas

### Canvas Coordinate Reference

Canvas size: `240 × 160` px. Key Y positions:

| Element | Y |
|---|---|
| Upper h-line | 48 (30% of 160) |
| Label baseline | 85 (center ~80 + cap-height offset) |
| Lower h-line | 112 (70% of 160) |
| Subtitle baseline | 148 |
| Top-right tag baseline | 20 |

H-lines span from `x=40` to `x=200` (centered, ~67% of width).

Corner brackets: final resting position 4px from each edge; at idle (`hoverProgress=0`) they are drawn 8px off-canvas (i.e. `tl corner x = -4, y = -4`) and slide to `x=4, y=4` as `hoverProgress → 1`. The canvas clip region naturally hides the off-canvas portion at low progress values — no explicit clipping needed.

### Idle State

| Element | Value |
|---|---|
| Background fill | `#000810` |
| Radial overlay | `rgba(0,50,60,0.7)` center → transparent at 70% radius |
| Border | 1px stroked rect inset 6px, `rgba(0,255,255,0.18)` |
| Border glow | `ctx.shadowBlur` = **breathe formula** (see below), `ctx.shadowColor = 'rgba(0,255,255,0.5)'` |
| Label font | `600 16px 'Roboto Mono'`, letter-spacing applied via char spacing trick |
| Label color | `#ffffff` |
| Label glow | `shadowBlur=30`, `shadowColor='rgba(0,255,255,0.6)'` |
| H-lines | 1px stroke, gradient `rgba(0,255,255,0.25)` peak, fade to transparent at x=40 and x=200 |
| Subtitle | `GATEWAY ACCESS POINT`, 7px Roboto Mono, `rgba(0,255,255,0.20)`, centered at x=120 |
| Corners | Not drawn |
| Top-right tag | Not drawn |

**Breathe formula** (border shadowBlur idle cycle):

```js
// breathePhase = state.clock.elapsedTime (seconds, passed into draw function)
const breatheShadow = 18 + 9 * Math.sin((breathePhase / 3) * 2 * Math.PI)
// oscillates between 9 and 27, period = 3 seconds
```

### Hover State

Hover drives a `hoverProgress` value `[0 → 1]`. All lerps below use linear interpolation unless noted.

| Element | At hoverProgress=0 | At hoverProgress=1 |
|---|---|---|
| Radial bg opacity | 0.7 | 0.95 |
| Border opacity | 0.18 | 0.55 |
| Border shadowBlur | breathe formula | 40 (overrides breathe) |
| Label shadowBlur | 30 | 60 |
| Corner brackets | off-canvas (−4px) | at 4px from edge |
| Corner opacity | 0 | 1 |
| Subtitle text/color | see crossfade below | see crossfade below |
| Top-right tag opacity | 0 | 1 |

**Border shadowBlur during hover:** lerp between `breatheShadow` (at progress=0) and `40` (at progress=1):
```js
const borderBlur = breatheShadow + (40 - breatheShadow) * hoverProgress
```

**Subtitle crossfade:** Two `fillText` calls with complementary alphas:
```js
// Idle subtitle fades out in first half
if (hoverProgress < 0.5) {
  ctx.fillStyle = `rgba(0,255,255,${0.20 * (1 - hoverProgress * 2)})`
  ctx.fillText('GATEWAY ACCESS POINT', 120, 148)
}
// Hover subtitle fades in in second half
if (hoverProgress > 0.5) {
  ctx.fillStyle = `rgba(255,94,0,${0.85 * ((hoverProgress - 0.5) * 2)})`
  ctx.fillText('[ ENTER SECTOR ]', 120, 148)
}
// At exactly 0.5 both are invisible — a clean gap
```

**Top-right tag:** `x=200, y=20`, `6px Roboto Mono`, `rgba(0,255,255, 0.45 * hoverProgress)`, text: `SECTOR READY`.

**Corner brackets:** Each bracket is two line segments forming an L-shape, 16px per arm, 2px lineWidth, `#00FFFF`, `shadowBlur=12, shadowColor='#00FFFF'`.

Corner offset = `lerp(−4, 4, hoverProgress)` px from each edge.

```js
const co = -4 + 8 * hoverProgress  // co = corner offset from edge
const arm = 16
// Top-left
ctx.moveTo(co, co + arm); ctx.lineTo(co, co); ctx.lineTo(co + arm, co)
// Top-right
ctx.moveTo(240 - co, co + arm); ctx.lineTo(240 - co, co); ctx.lineTo(240 - co - arm, co)
// Bottom-left
ctx.moveTo(co, 160 - co - arm); ctx.lineTo(co, 160 - co); ctx.lineTo(co + arm, 160 - co)
// Bottom-right
ctx.moveTo(240 - co, 160 - co - arm); ctx.lineTo(240 - co, 160 - co); ctx.lineTo(240 - co - arm, 160 - co)
```

### Leave Transition

On pointer-leave, `hoverProgress` animates back 1→0. Use `delta / 0.6` speed (matching existing reverse speed ~600ms).

---

## Implementation

### What changes

**`GatewayPane.jsx`**

1. Remove `CHAR_SET` constant and all character-grid logic.
2. Rename `drawFrame(ctx, seed, decryptProgress, label)` → `drawPortalFrame(ctx, label, hoverProgress, breathePhase)`.
3. Replace body of draw function entirely with the portal design (draw order below).
4. Update `useFrame` to pass `state.clock.elapsedTime` as `breathePhase`:
   ```js
   // inside useFrame callback, replace drawFrame call with:
   drawPortalFrame(ctx, label, d.progress, state.clock.elapsedTime)
   ```
5. Remove the `<lineSegments>` element from JSX — the canvas border with glow replaces it visually.
6. The `seed` prop can remain in the component signature as an unused no-op for backward compatibility with `GatewayPanes.jsx`.
7. Hover enter speed: change `delta / 1.2` to `delta / 0.3` to achieve ~300ms enter time (leave speed stays `delta / 0.6`).

**`GatewayPanes.jsx`** — one small change required.

Removing `<lineSegments>` makes `group.children[1]` undefined. The existing guard at lines 64-65:
```js
const lines = group.children[1]
if (!mesh || !lines) return   // ← this will now bail before animating mesh.material
```
…will short-circuit before running the mesh fade GSAP tweens, breaking pane fade-in and sector fade-out.

Fix: in all three hooks (`useLayoutEffect` and both `useEffect` blocks), remove the `lines` variable and any reference to it.

**`useLayoutEffect`** — remove these two lines:
```js
const lines = ref.current.children[1]           // remove
if (lines?.material) lines.material.opacity = 0  // remove
```
The optional-chain prevents a runtime crash, but they become dead code once `<lineSegments>` is gone.

**Rise `useEffect`** — remove the lines tween, keep the mesh tween:
```js
if (mesh?.material) gsap.to(mesh.material, { opacity: 0.82, duration: 1.0 })
// (remove the lines?.material gsap.to line)
```

**Sector fade `useEffect`** — replace the `!lines` guard and remove lines tweens:
```js
if (!mesh) return   // was: if (!mesh || !lines) return
if (activeSector) {
  gsap.to(mesh.material, { opacity: 0, duration: 0.5 })
} else {
  gsap.to(mesh.material, { opacity: 0.82, duration: 0.5 })
}
// (remove the two lines.material gsap.to calls)
```

Also update the inline comment on that block from `// children[0] = mesh (has material), children[1] = lineSegments (has material)` to just `// children[0] = mesh`.

### Canvas draw order

Execute these steps in order inside `drawPortalFrame`:

1. `ctx.clearRect(0, 0, 240, 160)` + `fillRect` with `#000810`
2. Draw radial gradient overlay (opacity lerped by hoverProgress)
3. Set `ctx.shadowBlur = borderBlur`, `ctx.shadowColor`, draw border stroked rect inset 6px with lerped opacity
4. Reset shadow (`ctx.shadowBlur = 0`) before gradient strokes to avoid bleeding
5. Draw upper h-line at y=48 (createLinearGradient x=40→200, peak alpha 0.25 lerped up to 0.55 on hover)
6. Draw lower h-line at y=112 (same)
7. Set label glow shadow, draw label centered at x=120, y=85
8. Reset shadow, draw subtitle crossfade (two conditional fillText calls)
9. If `hoverProgress > 0`: set corner shadow, draw all 4 corner brackets in a single path
10. If `hoverProgress > 0`: draw top-right tag at x=200, y=20, `textAlign='right'`

**Important:** Reset `ctx.shadowBlur = 0` after any step that sets it, before the next step, to prevent glow from bleeding onto subsequent draws.

### What stays the same

- Billboard rotation (`Math.atan2` facing camera) applied to the outer `<group ref={groupRef}>` containing the `<mesh>` child — do not restructure JSX nesting
- Ring pulse on pointer-enter (`ringRef`, `ringStateRef`)
- Render throttling: every frame while `d.direction !== 0`, throttle to ~8fps at idle
- Canvas size `240×160`, `CanvasTexture`, `texture.needsUpdate = true`
- `planeGeometry args={[5, 3.5]}` mesh size
- Fade in/out via `GatewayPanes.jsx` animating `mesh.material.opacity` (the `<mesh>` remains `children[0]` of the group)

---

## Files Affected

| File | Change |
|---|---|
| `src/components/3D/GatewayPane.jsx` | Replace draw function; remove lineSegments; update hover speed |
| `src/components/3D/GatewayPanes.jsx` | Remove `lines` variable and `!lines` guard from both fade `useEffect` blocks |
