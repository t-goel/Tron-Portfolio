# Gateway Pane Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the noisy character-grid canvas texture on the three gateway panes with a clean "Glowing Portal" design — breathing glow at idle, corner-bracket lock-on on hover, orange CTA footer.

**Architecture:** The draw logic lives entirely in a single function (`drawPortalFrame`) inside `GatewayPane.jsx`. The `useFrame` hook drives hover progress and passes `elapsedTime` for the breathe animation. `GatewayPanes.jsx` needs a small cleanup to remove stale references to the `<lineSegments>` element being removed.

**Tech Stack:** React Three Fiber, Three.js `CanvasTexture`, HTML Canvas 2D API, GSAP (existing, untouched)

---

## File Map

| File | What changes |
|---|---|
| `src/components/3D/GatewayPane.jsx` | Remove `CHAR_SET` + `drawFrame`; add `drawPortalFrame`; remove `<lineSegments>` JSX; update hover speed |
| `src/components/3D/GatewayPanes.jsx` | Remove `lines` variable and all references from `useLayoutEffect` and both `useEffect` hooks |

---

## Task 1: Clean up GatewayPanes.jsx — remove stale `lines` references

Removing `<lineSegments>` from `GatewayPane.jsx` (Task 2) will make `group.children[1]` undefined. The existing `if (!mesh || !lines) return` guard then silently prevents mesh fades from running. Fix this first so Task 2 can't break fades.

**Files:**
- Modify: `src/components/3D/GatewayPanes.jsx`

- [ ] **Step 1: Open the file and read lines 28–74**

  Read `src/components/3D/GatewayPanes.jsx`. Identify all three hooks that reference `lines`:
  - `useLayoutEffect` (around line 29): declares `lines` from `children[1]`, sets `lines.material.opacity = 0`
  - Rise `useEffect` (around line 43): declares `lines`, calls `gsap.to(lines.material, ...)`
  - Sector fade `useEffect` (around line 56): declares `lines`, uses `!lines` in guard, calls two `gsap.to(lines.material, ...)` calls

- [ ] **Step 2: Edit `useLayoutEffect` — remove `lines` references**

  In `useLayoutEffect`, remove these two lines (keep everything else):
  ```js
  const lines = ref.current.children[1]           // DELETE THIS LINE
  if (lines?.material) lines.material.opacity = 0  // DELETE THIS LINE
  ```
  The `mesh` declaration and `mesh.material.opacity = 0` line stay.

- [ ] **Step 3: Edit rise `useEffect` — remove `lines` tween**

  In the `useEffect` that fires when `phase >= 3` (rise animation), remove:
  ```js
  const lines = ref.current.children[1]                              // DELETE
  if (lines?.material) gsap.to(lines.material, { opacity: 0.8, duration: 1.0 })  // DELETE
  ```
  The `mesh` declaration and its `gsap.to` call stay.

- [ ] **Step 4: Edit sector fade `useEffect` — remove `lines` guard and tweens**

  In the `useEffect` that fires when `activeSector` changes, make these changes:

  Remove:
  ```js
  const lines = group.children[1]     // DELETE
  if (!mesh || !lines) return         // REPLACE with: if (!mesh) return
  ```
  Change the guard to `if (!mesh) return`.

  Remove both `lines.material` GSAP calls:
  ```js
  gsap.to(lines.material, { opacity: 0, duration: 0.5 })   // DELETE
  gsap.to(lines.material, { opacity: 0.8, duration: 0.5 }) // DELETE
  ```

  Update the inline comment near the top of that effect from:
  ```js
  // children[0] = mesh (has material), children[1] = lineSegments (has material)
  ```
  to:
  ```js
  // children[0] = mesh
  ```

- [ ] **Step 5: Run dev server and verify panes still rise and fade correctly**

  ```bash
  npm run dev
  ```
  Open the app. Navigate through phases until the grid appears with the three panes. Verify:
  - Panes rise up and fade in as before (rise animation works)
  - Clicking a pane (entering a sector) fades panes out (sector fade works)
  - Returning to grid (pressing Esc / back) fades panes back in
  - No console errors

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/3D/GatewayPanes.jsx
  git commit -m "refactor: remove stale lineSegments refs from GatewayPanes"
  ```

---

## Task 2: Rewrite `GatewayPane.jsx` — portal draw function + JSX cleanup

Replace the entire `drawFrame` character-grid function with `drawPortalFrame`. Remove `<lineSegments>`. Update hover speed. Canvas size and all other behavior stay the same.

**Files:**
- Modify: `src/components/3D/GatewayPane.jsx`

- [ ] **Step 1: Remove `CHAR_SET` and `drawFrame`**

  Delete the `CHAR_SET` constant (line 5) and the entire `drawFrame` function (lines 7–97 in the original). Leave everything from the `GatewayPane` component definition downward untouched for now.

- [ ] **Step 2: Add `drawPortalFrame` above the component**

  Insert this function in place of the deleted code:

  ```js
  function drawPortalFrame(ctx, label, hoverProgress, breathePhase) {
    const W = 240, H = 160

    // 1. Background
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#000810'
    ctx.fillRect(0, 0, W, H)

    // 2. Radial gradient overlay
    const radialOpacity = 0.7 + 0.25 * hoverProgress
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7)
    grad.addColorStop(0, `rgba(0,50,60,${radialOpacity})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // 3. Border with breathing glow
    const breatheShadow = 18 + 9 * Math.sin((breathePhase / 3) * 2 * Math.PI)
    const borderBlur = breatheShadow + (40 - breatheShadow) * hoverProgress
    const borderAlpha = 0.18 + 0.37 * hoverProgress
    ctx.shadowBlur = borderBlur
    ctx.shadowColor = 'rgba(0,255,255,0.5)'
    ctx.strokeStyle = `rgba(0,255,255,${borderAlpha})`
    ctx.lineWidth = 1
    ctx.strokeRect(6.5, 6.5, W - 13, H - 13)
    ctx.shadowBlur = 0

    // 4 & 5. H-lines (upper at y=48, lower at y=112)
    const lineAlpha = 0.25 + 0.30 * hoverProgress
    ;[48, 112].forEach((y) => {
      const hGrad = ctx.createLinearGradient(40, y, 200, y)
      hGrad.addColorStop(0, 'rgba(0,255,255,0)')
      hGrad.addColorStop(0.5, `rgba(0,255,255,${lineAlpha})`)
      hGrad.addColorStop(1, 'rgba(0,255,255,0)')
      ctx.strokeStyle = hGrad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(200, y)
      ctx.stroke()
    })

    // 6. Label
    const labelBlur = 30 + 30 * hoverProgress
    ctx.shadowBlur = labelBlur
    ctx.shadowColor = 'rgba(0,255,255,0.6)'
    ctx.fillStyle = '#ffffff'
    ctx.font = "600 16px 'Roboto Mono', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(label.replace('>_ ', ''), W / 2, 85)
    ctx.shadowBlur = 0

    // 7. Subtitle crossfade
    ctx.font = "7px 'Roboto Mono', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    if (hoverProgress < 0.5) {
      const a = 0.20 * (1 - hoverProgress * 2)
      ctx.fillStyle = `rgba(0,255,255,${a})`
      ctx.fillText('GATEWAY ACCESS POINT', W / 2, 148)
    }
    if (hoverProgress > 0.5) {
      const a = 0.85 * ((hoverProgress - 0.5) * 2)
      ctx.fillStyle = `rgba(255,94,0,${a})`
      ctx.fillText('[ ENTER SECTOR ]', W / 2, 148)
    }

    // 8. Corner brackets (only when hovering)
    if (hoverProgress > 0) {
      const co = -4 + 8 * hoverProgress   // slides from off-canvas to 4px inset
      const arm = 16
      const cornerOpacity = hoverProgress
      ctx.shadowBlur = 12
      ctx.shadowColor = '#00FFFF'
      ctx.strokeStyle = `rgba(0,255,255,${cornerOpacity})`
      ctx.lineWidth = 2
      ctx.beginPath()
      // Top-left
      ctx.moveTo(co, co + arm); ctx.lineTo(co, co); ctx.lineTo(co + arm, co)
      // Top-right
      ctx.moveTo(W - co, co + arm); ctx.lineTo(W - co, co); ctx.lineTo(W - co - arm, co)
      // Bottom-left
      ctx.moveTo(co, H - co - arm); ctx.lineTo(co, H - co); ctx.lineTo(co + arm, H - co)
      // Bottom-right
      ctx.moveTo(W - co, H - co - arm); ctx.lineTo(W - co, H - co); ctx.lineTo(W - co - arm, H - co)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // 9. Top-right tag (only when hovering)
    if (hoverProgress > 0) {
      ctx.font = "6px 'Roboto Mono', monospace"
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = `rgba(0,255,255,${0.45 * hoverProgress})`
      ctx.fillText('SECTOR READY', 200, 20)
    }

    // Reset text alignment for safety
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }
  ```

- [ ] **Step 3: Update the `useMemo` initial draw call**

  In the `useMemo` block (around line 121 in original), change the initial draw call from:
  ```js
  drawFrame(ctx, seed, 0, label)
  ```
  to:
  ```js
  drawPortalFrame(ctx, label, 0, 0)
  ```

- [ ] **Step 4: Update the `useFrame` draw calls**

  In `useFrame`, there are two places that call `drawFrame`. Replace **both** with `drawPortalFrame`:

  ```js
  // Animating (was: drawFrame(ctx, seed, d.progress, label))
  drawPortalFrame(ctx, label, d.progress, state.clock.elapsedTime)

  // Idle throttle (was: drawFrame(ctx, seed, d.progress, label))
  drawPortalFrame(ctx, label, d.progress, state.clock.elapsedTime)
  ```

  Note: `state` is available as the first argument to the `useFrame((state, delta) => {...})` callback.

- [ ] **Step 5: Update hover enter speed**

  Find the line:
  ```js
  const speed = d.direction > 0 ? delta / 1.2 : delta / 0.6
  ```
  Change `delta / 1.2` to `delta / 0.3`:
  ```js
  const speed = d.direction > 0 ? delta / 0.3 : delta / 0.6
  ```

- [ ] **Step 6: Remove `<lineSegments>` from JSX**

  In the returned JSX, find and delete the entire `<lineSegments>` element:
  ```jsx
  <lineSegments geometry={edgesGeo}>
    <lineBasicMaterial color="#00FFFF" transparent opacity={0.8} toneMapped={false} />
  </lineSegments>
  ```

- [ ] **Step 7: Remove `edgesGeo` useMemo**

  Now that `<lineSegments>` is gone, remove the `useMemo` that created its geometry:
  ```js
  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(5, 3.5)),
    []
  )
  ```

- [ ] **Step 8: Run dev server and visually verify**

  ```bash
  npm run dev
  ```
  Check each of the following:

  **Idle:**
  - Three panes visible in the grid, each with a label (`PROJECTS`, `ABOUT_ME`, `SKILLS`) — no character noise
  - Border glows softly and breathes (brightens/dims on a ~3s cycle)
  - Radial glow behind label visible

  **Hover:**
  - Move cursor over a pane — corner brackets slide in from edges
  - Border and label glow intensify
  - Subtitle changes from cyan `GATEWAY ACCESS POINT` to orange `[ ENTER SECTOR ]`
  - `SECTOR READY` tag appears top-right
  - Removing cursor — everything smoothly reverts

  **Click/sector:**
  - Clicking a pane still navigates to the sector
  - Panes fade out when a sector is active, fade back in on return
  - No console errors

- [ ] **Step 9: Commit**

  ```bash
  git add src/components/3D/GatewayPane.jsx
  git commit -m "feat: gateway pane redesign — glowing portal with corner lock-on hover"
  ```
