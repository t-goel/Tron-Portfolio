# Cinematic Name Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Phase 2 title screen + "ENTER THE GRID" button with a fully automatic cinematic camera pull-back from the 3D name backdrop to the home position, then auto-advance to Phase 3.

**Architecture:** Two new R3F components mount inside `<Scene>` at phase 2: `NameBackdrop` renders the 3D name text permanently (phase >= 2), and `CinematicIntro` drives the camera from a close-up on the text to the home position using GSAP tweens, then calls `setPhase(3)` on complete. `App.jsx` passes `mainVisible` to `Scene` so `CinematicIntro` only mounts after the black overlay has faded enough for the camera snap to be hidden. A module-level `hasPlayed` flag in `CinematicIntro` ensures the cinematic runs only once per page load — if the user clicks the home button to return to phase 2, the cinematic is skipped and phase immediately advances to 3. `TitleOverlay`, `EnterButton`, and `titleGlitch` state are deleted entirely.

**Tech Stack:** React Three Fiber (`useThree`), `@react-three/drei` (`Text`), GSAP, Zustand (`useAppState`)

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/components/3D/NameBackdrop.jsx` | Renders the 3D "TANMAY GOEL" + "SOFTWARE DEVELOPER" text in the scene |
| Create | `src/components/3D/CinematicIntro.jsx` | GSAP camera tween from close-up to home position; calls `setPhase(3)` on complete; skips on repeat visits within same page load |
| Modify | `src/components/Scene.jsx` | Accept `mainVisible` prop; mount `NameBackdrop` and `CinematicIntro` |
| Modify | `src/App.jsx` | Pass `mainVisible` to `<Scene>`; remove `TitleOverlay`, `EnterButton`, `titleGlitch` |
| Delete (content) | `src/components/UI/TitleOverlay.jsx` | File can be left on disk but is no longer imported — no action needed |
| Delete (content) | `src/components/UI/EnterButton.jsx` | File can be left on disk but is no longer imported — no action needed |

> **Note:** This codebase has no automated test suite. Verification steps are manual browser checks. Each task ends with a commit.

---

## Task 1: Create `NameBackdrop`

**Files:**
- Create: `src/components/3D/NameBackdrop.jsx`

### Context

`@react-three/drei`'s `<Text>` component renders 3D text using SDF fonts. It is already a dependency (`@react-three/drei` ^10.7.7). The font file lives at `src/assets/fonts/Tron-JOAa.ttf` and must be imported via ES module (`import fontUrl from ...`) so Vite hashes and bundles it correctly — **do not use a hard-coded string path like `/src/assets/fonts/...`**, which will 404 in production.

The scene's Bloom postprocessing (luminanceThreshold=0.2) will make the bright-red title glow.

The spec calls for:
- Line 1: `TANMAY GOEL` — TR2N font, `fontSize={3}`, `color="#FF0000"`, position `[0, 3, -40]`
- Line 2: `SOFTWARE DEVELOPER` — Roboto Mono (system fallback; drei's `Text` default), `fontSize={0.8}`, `color="#F0F0F0"`, position `[0, 1.5, -40]`

Mount condition (managed by `Scene.jsx`): `phase >= 2`.

- [ ] **Step 1: Create the component**

```jsx
// src/components/3D/NameBackdrop.jsx
import { Text } from '@react-three/drei'
import fontUrl from '../../assets/fonts/Tron-JOAa.ttf'

export default function NameBackdrop() {
  return (
    <>
      <Text
        position={[0, 3, -40]}
        fontSize={3}
        color="#FF0000"
        font={fontUrl}
        anchorX="center"
        anchorY="middle"
      >
        TANMAY GOEL
      </Text>
      <Text
        position={[0, 1.5, -40]}
        fontSize={0.8}
        color="#F0F0F0"
        anchorX="center"
        anchorY="middle"
      >
        SOFTWARE DEVELOPER
      </Text>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/3D/NameBackdrop.jsx
git commit -m "feat: add NameBackdrop 3D text component"
```

---

## Task 2: Create `CinematicIntro`

**Files:**
- Create: `src/components/3D/CinematicIntro.jsx`

### Context

`useThree()` provides the live R3F camera object. GSAP tweens `camera.position` directly — R3F re-renders automatically because GSAP mutates the object in-place and Three.js marks it dirty. A `lookAtProxy` object is tweened in parallel so `camera.lookAt()` interpolates smoothly from the name text center `[0, 3, -40]` to the OrbitControls target `[0, 1, 0]`.

Timing per spec:
- Camera starts at `[0, 3, -34]` looking at `[0, 3, -40]` (mounted synchronously in useEffect, hidden by overlay)
- 1.5s delay (user reads name during fade-in)
- 2.5s pull-back tween (`power2.inOut`) to position `[0, 8, 14]` with lookAt interpolating to `[0, 1, 0]`
- `onComplete`: `setPhase(3)` (guarded by `mountedRef`)

**Repeat-visit guard:** The module-level `let hasPlayed = false` flag ensures the cinematic runs only once per page load. The HUD home button calls `setPhase(2)` to go back to the name backdrop — without this guard, `CinematicIntro` would re-mount and run the full 4-second sequence again before advancing to phase 3. With the guard: `hasPlayed` is true, the `useEffect` immediately calls `setPhase(3)`, and the user is back at the grid instantly.

Mount condition (managed by `Scene.jsx`): `phase === 2 && mainVisible`. Unmounts when phase becomes 3.

- [ ] **Step 1: Create the component**

```jsx
// src/components/3D/CinematicIntro.jsx
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import useAppState from '../../store/appState'

// Module-level flag: cinematic plays once per page load.
// If the user navigates home (setPhase(2)) after seeing it,
// this component mounts again and immediately calls setPhase(3).
let hasPlayed = false

export default function CinematicIntro() {
  const { camera } = useThree()
  const setPhase = useAppState((s) => s.setPhase)

  useEffect(() => {
    // Skip cinematic on repeat mount (home-button back-navigation)
    if (hasPlayed) {
      setPhase(3)
      return
    }

    const mountedRef = { current: true }

    // Synchronously snap camera before first rendered frame
    camera.position.set(0, 3, -34)
    camera.lookAt(0, 3, -40)

    // Proxy object for interpolating lookAt target
    const lookAtProxy = { x: 0, y: 3, z: -40 }

    const positionTween = gsap.to(camera.position, {
      x: 0, y: 8, z: 14,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z),
      onComplete: () => {
        if (mountedRef.current) {
          hasPlayed = true
          setPhase(3)
        }
      },
    })

    const lookAtTween = gsap.to(lookAtProxy, {
      x: 0, y: 1, z: 0,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
    })

    return () => {
      mountedRef.current = false
      positionTween.kill()
      lookAtTween.kill()
    }
  }, [camera, setPhase])

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/3D/CinematicIntro.jsx
git commit -m "feat: add CinematicIntro GSAP camera tween component"
```

---

## Task 3: Update `Scene.jsx`

**Files:**
- Modify: `src/components/Scene.jsx`

### Context

`Scene` currently accepts no props and has this signature: `export default function Scene()`. Write the full updated file as shown below — do not try to apply incremental edits.

Key changes:
- Add two imports: `NameBackdrop` and `CinematicIntro`
- Change function signature to accept `{ mainVisible }`
- Add two JSX lines immediately before `{phase >= 3 && <CameraController />}`:
  - `{phase >= 2 && <NameBackdrop />}`
  - `{phase === 2 && mainVisible && <CinematicIntro />}`

- [ ] **Step 1: Write the full updated file**

```jsx
// src/components/Scene.jsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import useAppState from '../store/appState'
import GridFloor from './3D/GridFloor'
import GatewayPanes from './3D/GatewayPanes'
import CameraController from './3D/CameraController'
import Monolith from './3D/Monolith'
import NameBackdrop from './3D/NameBackdrop'
import CinematicIntro from './3D/CinematicIntro'
import { projects } from '../data/projects'
import { useMobile } from '../hooks/useMobile'

export default function Scene({ mainVisible }) {
  const phase = useAppState((s) => s.phase)
  const activeSector = useAppState((s) => s.activeSector)
  const isMobile = useMobile()

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.5} color="#FF0000" />

      {phase >= 2 && <NameBackdrop />}
      {phase === 2 && mainVisible && <CinematicIntro />}

      {phase >= 3 && <CameraController />}
      {phase >= 3 && <GridFloor />}
      {phase >= 3 && !isMobile && <GatewayPanes />}
      {activeSector === 'projects' && projects.map((p) => (
        <Monolith
          key={p.id}
          position={p.position}
          accentColor={p.active ? '#FF0000' : '#FF5E00'}
          active={p.active}
          name={p.name}
        />
      ))}

      {phase >= 3 && !activeSector && !isMobile && (
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={6}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
          target={[0, 1, 0]}
        />
      )}

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene.jsx
git commit -m "feat: mount NameBackdrop and CinematicIntro in Scene"
```

---

## Task 4: Update `App.jsx`

**Files:**
- Modify: `src/App.jsx`

### Context

Four changes to `App.jsx`:
1. Pass `mainVisible` prop to `<Scene mainVisible={mainVisible} />`
2. Remove `import TitleOverlay` and its render block
3. Remove `import EnterButton` and its render (inside TitleOverlay block)
4. Remove `titleGlitch` state (`useState(false)`) and `setTitleGlitch`

The block to remove is lines 102–106:
```jsx
{!showBoot && phase >= 2 && (
  <TitleOverlay visible={phase === 2} glitch={titleGlitch}>
    {phase === 2 && <EnterButton onHoverChange={setTitleGlitch} />}
  </TitleOverlay>
)}
```

**Re-entry behavior (informational — no action required):** When the user clicks the HUD home button, it calls `setPhase(2)` and `setHudVisible(false)`. `CinematicIntro` will re-mount because `phase === 2 && mainVisible` becomes true. The `hasPlayed` module flag causes it to immediately call `setPhase(3)`, which triggers the disc dock `useEffect` in `App.jsx` (lines 55–71) to re-run the dock animation. `domDiscRef.current` exists at this point (the disc DOM element renders when `phase >= 3 && !hudVisible`), and `setHudVisible(true)` fires on dock completion. The re-entry path is correct with no additional changes needed.

- [ ] **Step 1: Remove `titleGlitch` state**

Remove line 26:
```jsx
const [titleGlitch, setTitleGlitch] = useState(false)
```

- [ ] **Step 2: Remove TitleOverlay and EnterButton imports**

Remove lines 5–6:
```jsx
import TitleOverlay from './components/UI/TitleOverlay'
import EnterButton from './components/UI/EnterButton'
```

- [ ] **Step 3: Remove TitleOverlay + EnterButton render block**

Remove lines 102–106:
```jsx
{!showBoot && phase >= 2 && (
  <TitleOverlay visible={phase === 2} glitch={titleGlitch}>
    {phase === 2 && <EnterButton onHoverChange={setTitleGlitch} />}
  </TitleOverlay>
)}
```

- [ ] **Step 4: Pass `mainVisible` to `<Scene>`**

Change line 93:
```jsx
<Scene />
```
to:
```jsx
<Scene mainVisible={mainVisible} />
```

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire mainVisible to Scene, remove TitleOverlay and EnterButton"
```

---

## Task 5: Visual Verification

> No automated tests exist — verify manually in the browser.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify the full first-load flow**

Check each criterion from the spec:
- [ ] After boot sequence, camera opens tight on the name text (no user interaction needed)
- [ ] "TANMAY GOEL" in red TR2N font is clearly readable during the 1.5s pause before pull-back
- [ ] "SOFTWARE DEVELOPER" subtitle is visible below
- [ ] Pull-back is smooth and cinematic (~2.5s)
- [ ] After pull-back, the name text is visible in the distant background behind the gateway panes
- [ ] Disc dock animation fires automatically (no button press)
- [ ] HUD appears correctly after disc dock completes
- [ ] Grid world is interactive (OrbitControls work)
- [ ] No visible camera jump or flash during overlay fade-in

- [ ] **Step 3: Verify the home-button back-navigation flow**

Click the HUD disc/name button (top-left) to return home, then verify:
- [ ] Phase jumps directly to 3 with no cinematic replay
- [ ] Disc dock animation runs again
- [ ] HUD reappears
- [ ] Grid world is interactive again

- [ ] **Step 4: Check legibility**

Per spec: if "TANMAY GOEL" at `fontSize={3}` and `z=-40` is too small during the close-up, adjust to one of:
- `z=-30` and/or `fontSize={5}` in `NameBackdrop.jsx`

If adjustment is made, commit the change:
```bash
git add src/components/3D/NameBackdrop.jsx
git commit -m "fix: adjust NameBackdrop position/size for legibility"
```

- [ ] **Step 5: Verify no dead code**

```bash
grep -r "TitleOverlay\|EnterButton\|titleGlitch" src/
```

Expected: no matches (files exist on disk but are no longer imported anywhere).

---

## Task 6: Production Build Check

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: exits with no errors. Warnings about unused variables or missing exports are acceptable only if they existed before this change.

- [ ] **Step 2: Preview**

```bash
npm run preview
```

Repeat the visual verification checklist from Task 5 Steps 2–3 on the production build. Pay special attention to the font loading — the TR2N font must render correctly (it would fail in dev if the import path was wrong, but confirm in prod preview as well).

- [ ] **Step 3: Final commit (if any fixes were made during build)**

```bash
git add -p
git commit -m "fix: resolve build issues from cinematic name reveal"
```
