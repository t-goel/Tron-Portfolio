# AmbientFX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-contained `AmbientFX` R3F component that renders infrequent branching lightning bolts and falling vertical data streaks with binary text labels, visible from phase 3 onward.

**Architecture:** All effect objects are created imperatively with Three.js (`new THREE.LineSegments`, `new THREE.Line`) and attached to a `<group ref>`. A single `useFrame` loop drives all scheduling, animation, and lifecycle cleanup. A fixed JSX pool of 6 `<Text>` nodes handles streak labels, repositioned via callback refs.

**Tech Stack:** React 19, Three.js 0.183, React Three Fiber 9, @react-three/drei 10

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/components/3D/AmbientFX.jsx` | All ambient effect logic |
| Modify | `src/components/Scene.jsx` | Add `<AmbientFX />` gated on `phase >= 3` |
| Modify | `.gitignore` | Add `.superpowers/` to prevent committing brainstorm artifacts |

---

## Task 1: Housekeeping — add `.superpowers` to `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add entry**

Open `.gitignore` and append:
```
.superpowers/
```

- [ ] **Step 2: Commit**
```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm artifacts"
```

---

## Task 2: Scaffold AmbientFX — group ref, text pool, empty useFrame

**Files:**
- Create: `src/components/3D/AmbientFX.jsx`

> **No test framework exists in this project.** Verification is visual via `npm run dev`.

- [ ] **Step 1: Create the scaffold**

Create `src/components/3D/AmbientFX.jsx`:

```jsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'

const TEXT_POOL_SIZE = 6

export default function AmbientFX() {
  const groupRef = useRef()
  const activeBolts = useRef([])
  const activeStreaks = useRef([])
  const boltTimer = useRef(8 + Math.random() * 17)
  const streakTimer = useRef(4 + Math.random() * 8)
  const pendingSecondaryBolt = useRef({ active: false, timer: 0 })
  const pendingSecondaryStreak = useRef({ active: false, timer: 0, x: 0, z: 0 })
  const usedTextSlots = useRef(new Array(TEXT_POOL_SIZE).fill(false))
  const textContents = useRef(new Array(TEXT_POOL_SIZE).fill(''))
  const textRefs = useRef(new Array(TEXT_POOL_SIZE).fill(null))

  const { invalidate } = useThree()

  useEffect(() => {
    return () => {
      const group = groupRef.current
      for (const { obj, geometry, material } of activeBolts.current) {
        geometry.dispose()
        material.dispose()
        if (group) group.remove(obj)
      }
      activeBolts.current = []
      for (const { streakGroup, geometry, material } of activeStreaks.current) {
        geometry.dispose()
        material.dispose()
        if (group) group.remove(streakGroup)
      }
      activeStreaks.current = []
    }
  }, [])

  useFrame((_state, _delta) => {
    // schedulers and lifecycle — filled in subsequent tasks
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: TEXT_POOL_SIZE }, (_, i) => (
        <Text
          key={i}
          ref={el => { textRefs.current[i] = el }}
          fontSize={0.25}
          color="#00FFFF"
          visible={false}
          anchorX="left"
          anchorY="middle"
        >
          {''}
        </Text>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Verify dev server starts without errors**

```bash
npm run dev
```

Open browser, navigate to the app. No console errors expected.

- [ ] **Step 3: Commit**
```bash
git add src/components/3D/AmbientFX.jsx
git commit -m "feat: scaffold AmbientFX with group ref and text pool"
```

---

## Task 3: Implement `buildBoltSegments` utility

**Files:**
- Modify: `src/components/3D/AmbientFX.jsx`

- [ ] **Step 1: Add the utility function above the component**

Insert this above the `AmbientFX` component definition:

```jsx
import * as THREE from 'three'

/**
 * Recursively builds lightning bolt vertex pairs.
 * Returns a flat Float32Array-compatible number array:
 * [x1,y1,z1, x2,y2,z2,  x1,y1,z1, x2,y2,z2, ...]
 * Each pair of 3-vectors is one line segment.
 */
function buildBoltSegments(origin, remainingDepth, config) {
  const { steps, jitter, branchProb } = config
  const segments = []
  const stepSize = 5 / steps // total ~5 units downward
  let current = origin.clone()

  for (let i = 0; i < steps; i++) {
    const next = new THREE.Vector3(
      current.x + (Math.random() - 0.5) * jitter,
      current.y - stepSize,
      current.z + (Math.random() - 0.5) * jitter
    )
    segments.push(current.x, current.y, current.z, next.x, next.y, next.z)

    if (remainingDepth > 0 && Math.random() < branchProb) {
      const angle = (Math.random() - 0.5) * (Math.PI / 3) // 30-60°
      const branchEnd = new THREE.Vector3(
        next.x + Math.sin(angle) * stepSize * 2,
        next.y - Math.abs(Math.cos(angle)) * stepSize * 2,
        next.z + (Math.random() - 0.5) * stepSize
      )
      segments.push(next.x, next.y, next.z, branchEnd.x, branchEnd.y, branchEnd.z)
      const sub = buildBoltSegments(next, remainingDepth - 1, {
        ...config,
        steps: Math.max(2, Math.floor(steps / 2)),
        branchProb: branchProb * 0.5,
      })
      segments.push(...sub)
    }

    current = next
  }

  return segments
}
```

Also add `import * as THREE from 'three'` at the top of the file (alongside existing imports).

- [ ] **Step 2: Smoke-test the function in the browser console**

In `npm run dev`, open the browser console and paste:
```js
// Just a quick sanity check — the function is not exported,
// but you can manually call buildBoltSegments in a temp console test
// by temporarily adding: window._bbs = buildBoltSegments
// Verify it returns a non-empty array with length divisible by 6
```

No errors expected from the build. Verify `npm run dev` still compiles cleanly.

- [ ] **Step 3: Commit**
```bash
git add src/components/3D/AmbientFX.jsx
git commit -m "feat: add buildBoltSegments branching lightning utility"
```

---

## Task 4: Implement `spawnBolt` and bolt lifecycle in `useFrame`

**Files:**
- Modify: `src/components/3D/AmbientFX.jsx`

- [ ] **Step 1: Add `spawnBolt` function above the component**

```jsx
function spawnBolt(group, activeBolts) {
  if (activeBolts.current.length >= 3) return

  const origin = new THREE.Vector3(
    (Math.random() - 0.5) * 24,       // x: -12 to 12
    5 + Math.random() * 3,             // y: 5 to 8
    -10 + Math.random() * 15           // z: -10 to 5
  )

  const config = {
    steps: 5 + Math.floor(Math.random() * 4), // 5-8
    jitter: 0.3 + Math.random() * 0.3,
    branchProb: 0.3,
  }

  const verts = buildBoltSegments(origin, 2, config)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 1.0,
  })
  const obj = new THREE.LineSegments(geometry, material)
  group.add(obj)

  activeBolts.current.push({
    obj,
    geometry,
    material,
    phase: 'hold',
    timer: 0.08 + Math.random() * 0.04, // 0.08-0.12s
  })
}
```

- [ ] **Step 2: Replace the empty `useFrame` body with bolt scheduling and lifecycle**

```jsx
useFrame((_state, delta) => {
  const group = groupRef.current
  if (!group) return

  // ── Bolt scheduler ──
  boltTimer.current -= delta
  if (boltTimer.current <= 0) {
    spawnBolt(group, activeBolts)
    boltTimer.current = 8 + Math.random() * 17

    if (Math.random() < 0.2) {
      pendingSecondaryBolt.current = {
        active: true,
        timer: 0.05 + Math.random() * 0.1,
      }
    }
  }

  // ── Bolt lifecycle ──
  for (let i = activeBolts.current.length - 1; i >= 0; i--) {
    const bolt = activeBolts.current[i]
    bolt.timer -= delta

    if (bolt.phase === 'hold' && bolt.timer <= 0) {
      bolt.phase = 'fade'
      bolt.timer = 0.2
    } else if (bolt.phase === 'fade') {
      bolt.material.opacity = Math.max(0, bolt.timer / 0.2)
      if (bolt.timer <= 0) {
        bolt.geometry.dispose()
        bolt.material.dispose()
        group.remove(bolt.obj)
        activeBolts.current.splice(i, 1)
      }
    }
  }
})
```

(Leave streak sections as `// TODO: streaks` comments for now — will be filled in Task 6.)

- [ ] **Step 3: Wire AmbientFX into Scene temporarily to verify bolts render**

In `src/components/Scene.jsx`, temporarily add at the top and in JSX (will make permanent in Task 8):

```jsx
// Temporary — remove if testing only
import AmbientFX from './3D/AmbientFX'
// In JSX:
<AmbientFX />
```

Run `npm run dev`. Navigate to phase 3 (Grid World). Wait ~10 seconds — a cyan branching lightning bolt should flash and fade with glow from the bloom post-processing.

- [ ] **Step 4: Remove temporary Scene.jsx changes (will be added properly in Task 8)**

Revert the temporary Scene.jsx import and JSX usage.

- [ ] **Step 5: Commit**
```bash
git add src/components/3D/AmbientFX.jsx
git commit -m "feat: implement lightning bolt spawning and fade lifecycle"
```

---

## Task 5: Implement double-strike secondary bolt

**Files:**
- Modify: `src/components/3D/AmbientFX.jsx`

- [ ] **Step 1: Add secondary bolt countdown to `useFrame` after the bolt scheduler block**

After the `boltTimer` block (before the lifecycle loop), add:

```jsx
// ── Secondary bolt countdown ──
if (pendingSecondaryBolt.current.active) {
  pendingSecondaryBolt.current.timer -= delta
  if (pendingSecondaryBolt.current.timer <= 0) {
    spawnBolt(group, activeBolts)
    pendingSecondaryBolt.current.active = false
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/3D/AmbientFX.jsx
git commit -m "feat: implement double-strike secondary bolt timer"
```

---

## Task 6: Implement vertical data streaks with text labels

**Files:**
- Modify: `src/components/3D/AmbientFX.jsx`

- [ ] **Step 1: Add `spawnStreak` function above the component**

```jsx
function spawnStreak(group, activeStreaks, textRefs, textContents, usedTextSlots, invalidate, overridePos) {
  if (activeStreaks.current.length >= 4) return

  const x = overridePos ? overridePos.x : (Math.random() - 0.5) * 24
  const z = overridePos ? overridePos.z : -10 + Math.random() * 15
  const length = 2 + Math.random() * 3        // 2-5 units
  const yVelocity = 3 + Math.random() * 4     // 3-7 units/sec
  const startY = 12 + Math.random() * 2       // 12-14

  // Static geometry: tip at local y=0 (bottom), tail at local y=+length (top)
  // Group's y position is the tip; tail is length above.
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 0, length, 0], 3)
  )
  // vertexColors: tip = bright cyan, tail = black (transparent-equivalent)
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute([0, 1, 1, 0, 0, 0], 3)
  )
  const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true })
  const line = new THREE.Line(geometry, material)

  const streakGroup = new THREE.Group()
  streakGroup.position.set(x, startY, z)
  streakGroup.add(line)
  group.add(streakGroup)

  // Claim text pool slot
  let textSlot = -1
  for (let i = 0; i < TEXT_POOL_SIZE; i++) {
    if (!usedTextSlots.current[i]) {
      textSlot = i
      usedTextSlots.current[i] = true
      break
    }
  }

  if (textSlot >= 0 && textRefs.current[textSlot]) {
    const charCount = 1 + Math.floor(Math.random() * 3)
    let text = ''
    for (let c = 0; c < charCount; c++) text += Math.random() > 0.5 ? '1' : '0'
    textContents.current[textSlot] = text
    const ref = textRefs.current[textSlot]
    ref.position.set(x + 0.3, startY + length / 2, z)
    ref.visible = true
    invalidate()
  }

  activeStreaks.current.push({
    streakGroup,
    geometry,
    material,
    yVelocity,
    textSlot,
  })
}
```

- [ ] **Step 2: Add streak scheduler and lifecycle to `useFrame`**

After the secondary bolt countdown block, add:

```jsx
// ── Streak scheduler ──
streakTimer.current -= delta
if (streakTimer.current <= 0) {
  spawnStreak(group, activeStreaks, textRefs, textContents, usedTextSlots, invalidate)
  streakTimer.current = 4 + Math.random() * 8

  if (Math.random() < 0.25) {
    const last = activeStreaks.current[activeStreaks.current.length - 1]
    if (last) {
      pendingSecondaryStreak.current = {
        active: true,
        timer: 0.1 + Math.random() * 0.2,
        x: last.streakGroup.position.x + (Math.random() - 0.5) * 2,
        z: last.streakGroup.position.z + (Math.random() - 0.5) * 2,
      }
    }
  }
}

// ── Secondary streak countdown ──
if (pendingSecondaryStreak.current.active) {
  pendingSecondaryStreak.current.timer -= delta
  if (pendingSecondaryStreak.current.timer <= 0) {
    const { x, z } = pendingSecondaryStreak.current
    spawnStreak(group, activeStreaks, textRefs, textContents, usedTextSlots, invalidate, { x, z })
    pendingSecondaryStreak.current.active = false
  }
}

// ── Streak lifecycle ──
for (let i = activeStreaks.current.length - 1; i >= 0; i--) {
  const streak = activeStreaks.current[i]
  streak.streakGroup.position.y -= streak.yVelocity * delta

  // Follow text label
  if (streak.textSlot >= 0 && textRefs.current[streak.textSlot]) {
    textRefs.current[streak.textSlot].position.y = streak.streakGroup.position.y
  }

  // Exit when tip reaches grid floor
  if (streak.streakGroup.position.y <= -2) {
    streak.geometry.dispose()
    streak.material.dispose()
    group.remove(streak.streakGroup)

    if (streak.textSlot >= 0) {
      usedTextSlots.current[streak.textSlot] = false
      textContents.current[streak.textSlot] = ''
      if (textRefs.current[streak.textSlot]) {
        textRefs.current[streak.textSlot].visible = false
      }
      invalidate()
    }

    activeStreaks.current.splice(i, 1)
  }
}
```

- [ ] **Step 3: Switch `textContents` from `useRef` to `useState` and update JSX**

`textContents` must be React state (not a ref) so that `<Text>` children re-render when content changes at spawn/release. Mutating a ref does not trigger React re-rendering. Since content only changes at spawn/release (never per frame), `useState` is safe here — no per-frame setState calls.

Replace the `useRef` declaration:
```jsx
// Remove this:
const textContents = useRef(new Array(TEXT_POOL_SIZE).fill(''))
```

Add at the top of the component alongside other hooks:
```jsx
import { useRef, useEffect, useState } from 'react'
// ...
const [textContents, setTextContents] = useState(() => new Array(TEXT_POOL_SIZE).fill(''))
```

In `spawnStreak` and the streak lifecycle cleanup, replace `textContents.current[slot] = ...` mutations with a `setTextContents` call. Pass `setTextContents` as a parameter alongside `textContents`:

Update `spawnStreak` signature:
```jsx
function spawnStreak(group, activeStreaks, textRefs, textContents, setTextContents, usedTextSlots, invalidate, overridePos) {
```

Inside `spawnStreak`, replace:
```jsx
textContents.current[textSlot] = text
```
With:
```jsx
setTextContents(prev => {
  const next = [...prev]
  next[textSlot] = text
  return next
})
```

In the streak lifecycle cleanup inside `useFrame`, replace:
```jsx
textContents.current[streak.textSlot] = ''
```
With:
```jsx
setTextContents(prev => {
  const next = [...prev]
  next[streak.textSlot] = ''
  return next
})
```

Update the JSX render to use the state array directly (not `.current`):
```jsx
return (
  <group ref={groupRef}>
    {textContents.map((content, i) => (
      <Text
        key={i}
        ref={el => { textRefs.current[i] = el }}
        fontSize={0.25}
        color="#00FFFF"
        visible={false}
        anchorX="left"
        anchorY="middle"
      >
        {content}
      </Text>
    ))}
  </group>
)
```

Also remove the `invalidate()` calls in `spawnStreak` and streak cleanup — they are no longer needed since `setTextContents` triggers a React re-render directly. Remove the `const { invalidate } = useThree()` line and the `invalidate` import from `useThree` destructuring (keep the `useThree` import only if used elsewhere, otherwise remove it).

- [ ] **Step 4: Commit**
```bash
git add src/components/3D/AmbientFX.jsx
git commit -m "feat: implement vertical data streaks with binary text labels"
```

---

## Task 7: Wire AmbientFX into Scene.jsx

**Files:**
- Modify: `src/components/Scene.jsx`

- [ ] **Step 1: Add import**

At the top of `src/components/Scene.jsx`, add:
```jsx
import AmbientFX from './3D/AmbientFX'
```

- [ ] **Step 2: Add to JSX, gated on phase >= 3**

In the Scene return, after the existing `{phase >= 3 && <CameraController />}` line, add:
```jsx
{phase >= 3 && <AmbientFX />}
```

- [ ] **Step 3: Visual verification**

```bash
npm run dev
```

1. Progress through the app to phase 3 (Grid World).
2. Observe: after ~4–12s, a glowing cyan vertical streak with binary digit(s) should fall from above the grid.
3. After ~8–25s, a branching cyan lightning bolt should flash and fade.
4. Both effects should have cyan bloom glow from the existing post-processing.
5. Open browser console — no errors or warnings expected.
6. Stay on the page for 60+ seconds to observe multiple events and verify no memory leaks (check Performance tab).

- [ ] **Step 4: Commit**
```bash
git add src/components/Scene.jsx
git commit -m "feat: wire AmbientFX into scene at phase >= 3"
```

---

## Done

All tasks complete. The `AmbientFX` component is live in the scene. Effects are:
- Self-contained with no Zustand state
- Properly cleaned up on unmount (geometry/material disposed)
- Gated to phase 3+, infrequent and unpredictable
- Enhanced by existing bloom post-processing automatically
