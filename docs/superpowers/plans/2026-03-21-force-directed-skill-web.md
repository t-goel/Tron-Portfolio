# Force-Directed Skill Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing canvas skill graph in `SkillsSector.jsx` with a force-directed physics web using d3-force — category nodes auto-animate in on mount, skill nodes expand/collapse on category click with spring physics.

**Architecture:** Canvas 2D rendering loop driven by a d3-force simulation. The hub and category nodes are pinned (fixed positions). Skill nodes are free-floating, pulled toward their parent category via link forces and repelled from each other via charge forces. The draw loop reads simulation node positions each frame.

**Tech Stack:** React, Canvas 2D, d3-force (new dep), existing skillCategories data

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` | Modify | Add `d3-force` dependency |
| `src/components/UI/SkillsSector.jsx` | Rewrite | Full force-directed implementation |

---

### Task 1: Install d3-force

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install d3-force
```

- [ ] **Step 2: Verify it installed**

```bash
cat package.json | grep d3-force
```

Expected: `"d3-force": "^3.x.x"` appears in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add d3-force for skill web physics"
```

---

### Task 2: Rewrite SkillsSector with force-directed physics

This is the full replacement. The existing file is completely rewritten.

**Files:**
- Modify: `src/components/UI/SkillsSector.jsx`

**Node model:**

There are three kinds of nodes in the simulation:
- **Hub node** — fixed at canvas center (`fx`, `fy` set). Id: `"hub"`.
- **Category nodes** — fixed at evenly-spaced positions on a circle of radius 200 around center. Id: `cat:<id>`. Never move.
- **Skill nodes** — free floating. Id: `skill:<catId>:<label>`. Pulled toward parent category via a link force. Only exist in the simulation while their category is expanded.

**Edges drawn:**
1. Hub → each category node (always visible, cyan, `rgba(0,255,255,0.2)`)
2. Category → each of its visible skill nodes (category's color, `0.35` opacity, brightens to `0.8` on hover)

**Racer pulses:** Same system as current — each edge can have an active racer (t from 0→1) that draws a bright dot travelling along the edge. Racers are spawned when skill nodes are added (expand) and when they are removed (collapse, reversed direction).

**Hover:** On `mousemove`, hit-test nodes. Hovering a node sets `hoveredId`. The hovered node draws with full opacity and an outer glow ring. Its parent edge brightens.

**Expand on click:**
1. Add skill nodes for the clicked category into the simulation at the category node's position (with a small random jitter so they don't stack).
2. Spawn a racer on each new edge (category → skill node).
3. d3-force simulation is reheated (`simulation.alpha(0.8).restart()`).

**Collapse on click:**
1. Spawn reverse racers on each edge (skill → category direction).
2. After 400ms, remove skill nodes for that category from the simulation and reheat.

**Entry animation (category nodes):**
- Category nodes are rendered with an `opacity` that starts at 0 and ramps to 1. Each category staggers by 80ms: node i becomes visible at `i * 80ms` after mount.
- Implemented by tracking a `entryOpacity` Map keyed by category id, updated via `setTimeout` callbacks in `useEffect`.

- [ ] **Step 1: Set up the component shell and canvas boilerplate**

Replace the entire file with the following. This gets the canvas mounted and sized, with an empty draw loop — no nodes yet:

```jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3-force'
import { skillCategories } from '../../data/skills'

const HUB_RADIUS = 16
const CAT_RADIUS = 28
const SKILL_RADIUS = 16
const FORMATION_RADIUS = 200

export default function SkillsSector() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const simRef = useRef(null)
  const nodesRef = useRef([])   // all nodes currently in simulation
  const linksRef = useRef([])   // all links currently in simulation
  const racersRef = useRef([])  // active light-racer pulses
  const hoverRef = useRef(null)
  const expandedRef = useRef(new Set())
  const entryOpacityRef = useRef({})  // catId -> 0..1
  const dimsRef = useRef({ w: 0, h: 0 })
  const rafRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // ── helpers ──────────────────────────────────────────────────────────────

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  function catAngle(i) {
    return (2 * Math.PI * i) / skillCategories.length - Math.PI / 2
  }

  function catFixedPos(i, cx, cy) {
    const angle = catAngle(i)
    return {
      fx: cx + FORMATION_RADIUS * Math.cos(angle),
      fy: cy + FORMATION_RADIUS * Math.sin(angle),
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        background: 'rgba(0,0,0,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify it renders (smoke test)**

```bash
npm run dev
```

Navigate to the Skills sector. The panel should open with a black blurred overlay and no content (empty canvas). No console errors.

---

- [ ] **Step 3: Build the node/link builders**

Add these functions inside the component (before the `return`):

```jsx
function buildHubNode(cx, cy) {
  return { id: 'hub', kind: 'hub', fx: cx, fy: cy, x: cx, y: cy }
}

function buildCatNodes(cx, cy) {
  return skillCategories.map((cat, i) => {
    const pos = catFixedPos(i, cx, cy)
    return {
      id: `cat:${cat.id}`,
      kind: 'cat',
      catId: cat.id,
      label: cat.label,
      color: cat.color,
      skills: cat.skills,
      angle: catAngle(i),
      ...pos,
      x: pos.fx,
      y: pos.fy,
    }
  })
}

function buildSkillNodes(catNode) {
  return catNode.skills.map((skill) => ({
    id: `skill:${catNode.catId}:${skill}`,
    kind: 'skill',
    catId: catNode.catId,
    label: skill,
    color: catNode.color,
    // start at parent position with small jitter
    x: catNode.x + (Math.random() - 0.5) * 10,
    y: catNode.y + (Math.random() - 0.5) * 10,
  }))
}

function buildLinks(nodes) {
  const links = []
  const hub = nodes.find((n) => n.id === 'hub')
  nodes.forEach((n) => {
    if (n.kind === 'cat') links.push({ source: hub, target: n, kind: 'hub-cat' })
    if (n.kind === 'skill') {
      const cat = nodes.find((c) => c.id === `cat:${n.catId}`)
      if (cat) links.push({ source: cat, target: n, kind: 'cat-skill' })
    }
  })
  return links
}
```

---

- [ ] **Step 4: Initialize the d3-force simulation in useEffect**

Add this `useEffect` (runs once on mount) inside the component:

```jsx
useEffect(() => {
  const canvas = canvasRef.current
  const container = containerRef.current
  if (!canvas || !container) return

  const dpr = window.devicePixelRatio || 1
  const w = container.clientWidth
  const h = container.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  dimsRef.current = { w, h }

  const cx = w / 2
  const cy = h / 2

  // Build initial nodes (hub + categories, no skills yet)
  const hub = buildHubNode(cx, cy)
  const catNodes = buildCatNodes(cx, cy)
  const initialNodes = [hub, ...catNodes]
  nodesRef.current = initialNodes
  linksRef.current = buildLinks(initialNodes)

  // Entry opacity: stagger category nodes in with a fade (track start time per node)
  // entryOpacityRef stores { startTime } per catId; draw loop computes current opacity
  skillCategories.forEach((cat, i) => {
    entryOpacityRef.current[cat.id] = { startTime: null }
    setTimeout(() => {
      entryOpacityRef.current[cat.id] = { startTime: performance.now() }
    }, i * 80)
  })

  // d3-force simulation
  const sim = d3.forceSimulation(initialNodes)
    .force('link', d3.forceLink(linksRef.current).id((d) => d.id).distance(90).strength(0.8))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('collide', d3.forceCollide(30))
    .alphaDecay(0.03)
    .on('tick', () => draw(ctx, w, h))

  simRef.current = sim

  // Fade panel in
  requestAnimationFrame(() => setVisible(true))

  return () => {
    sim.stop()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }
}, [])
```

---

- [ ] **Step 5: Write the draw function**

Add `draw` before the `useEffect`. This reads current node positions from `nodesRef` and `linksRef` each frame:

```jsx
function draw(ctx, w, h) {
  ctx.clearRect(0, 0, w, h)

  const nodes = nodesRef.current
  const links = linksRef.current
  const racers = racersRef.current
  const hoverId = hoverRef.current

  // ── Draw edges ──────────────────────────────────────────────────────────
  links.forEach((link) => {
    const s = link.source
    const t = link.target
    if (!s || !t) return

    // Determine opacity
    const isHovered =
      hoverId === t.id || hoverId === s.id
    const baseAlpha = link.kind === 'hub-cat' ? 0.2 : 0.35
    const alpha = isHovered ? 0.8 : baseAlpha
    const color = link.kind === 'hub-cat' ? '#00FFFF' : (t.color || s.color)

    ctx.strokeStyle = hexToRgba(color, alpha)
    ctx.lineWidth = isHovered ? 1.5 : 1
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  })

  // ── Draw racer pulses ───────────────────────────────────────────────────
  racers.forEach((racer) => {
    const px = racer.fromX + (racer.toX - racer.fromX) * racer.t
    const py = racer.fromY + (racer.toY - racer.fromY) * racer.t
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#00FFFF'
    ctx.fill()
  })

  // ── Draw nodes ──────────────────────────────────────────────────────────
  nodes.forEach((node) => {
    const isHovered = hoverId === node.id

    let opacity = 1
    if (node.kind === 'cat') {
      const entry = entryOpacityRef.current[node.catId]
      if (!entry || entry.startTime === null) {
        opacity = 0
      } else {
        const FADE_MS = 400
        opacity = Math.min((performance.now() - entry.startTime) / FADE_MS, 1)
      }
    }
    if (opacity === 0) return

    const radius = node.kind === 'hub' ? HUB_RADIUS : node.kind === 'cat' ? CAT_RADIUS : SKILL_RADIUS
    const color = node.kind === 'hub' ? '#00FFFF' : node.color

    // Fill
    ctx.globalAlpha = opacity * (node.kind === 'skill' ? 0.85 : 1)
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(color, node.kind === 'skill' ? 0.18 : 0.22)
    ctx.fill()

    // Border
    ctx.strokeStyle = isHovered ? color : hexToRgba(color, 0.9)
    ctx.lineWidth = isHovered ? 2 : 1.5
    ctx.stroke()

    // Outer glow ring on hover
    if (isHovered) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2)
      ctx.strokeStyle = hexToRgba(color, 0.35)
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Label
    ctx.globalAlpha = opacity
    ctx.font = node.kind === 'hub'
      ? "bold 10px 'Roboto Mono', monospace"
      : node.kind === 'cat'
      ? "11px 'Roboto Mono', monospace"
      : "10px 'Roboto Mono', monospace"
    ctx.fillStyle = color
    ctx.textAlign = 'center'

    if (node.kind === 'hub') {
      ctx.fillText('SKILLS', node.x, node.y + 4)
    } else if (node.kind === 'cat') {
      ctx.fillText(node.label, node.x, node.y + radius + 16)
    } else {
      ctx.fillText(node.label, node.x, node.y + SKILL_RADIUS + 13)
    }

    ctx.globalAlpha = 1
  })
}
```

- [ ] **Step 6: Verify the base graph renders**

```bash
npm run dev
```

Open the Skills sector. You should see: hub node in center, 5 category nodes arranged in a circle, edges connecting hub to each category, category labels below nodes, category nodes fading in with a stagger. No skills yet (clicking does nothing).

---

- [ ] **Step 7: Implement expand/collapse on click**

Add these two functions before the `useEffect`:

```jsx
function expandCategory(catNode) {
  const newSkillNodes = buildSkillNodes(catNode)
  const updatedNodes = [...nodesRef.current, ...newSkillNodes]
  nodesRef.current = updatedNodes

  const newLinks = buildLinks(updatedNodes)
  linksRef.current = newLinks

  // Spawn racers: one per new skill node, catNode → skillNode
  const newRacers = newSkillNodes.map((sn) => ({
    id: `racer:${sn.id}`,
    fromX: catNode.x, fromY: catNode.y,
    toX: catNode.x, toY: catNode.y, // destination updates each frame
    skillId: sn.id,
    t: 0,
    duration: 500,
    startTime: performance.now(),
  }))
  racersRef.current = [...racersRef.current, ...newRacers]

  // Update simulation
  const sim = simRef.current
  sim.nodes(updatedNodes)
  sim.force('link').links(newLinks)
  sim.alpha(0.8).restart()
}

function collapseCategory(catNode) {
  // Spawn reverse racers: skill node position → category position
  const skillNodes = nodesRef.current.filter(
    (n) => n.kind === 'skill' && n.catId === catNode.catId
  )
  const reverseRacers = skillNodes.map((sn) => ({
    id: `racer:collapse:${sn.id}`,
    fromX: sn.x, fromY: sn.y,
    toX: catNode.x, toY: catNode.y,
    skillId: null,  // destination is fixed (catNode), not a moving skill node
    t: 0,
    duration: 400,
    startTime: performance.now(),
  }))
  racersRef.current = [...racersRef.current, ...reverseRacers]

  // After animation completes, remove skill nodes from simulation
  setTimeout(() => {
    const remainingNodes = nodesRef.current.filter(
      (n) => !(n.kind === 'skill' && n.catId === catNode.catId)
    )
    nodesRef.current = remainingNodes
    linksRef.current = buildLinks(remainingNodes)
    const sim = simRef.current
    sim.nodes(remainingNodes)
    sim.force('link').links(linksRef.current)
    sim.alpha(0.3).restart()
  }, 420)
}
```

Then add click handling via a `useEffect` that attaches after mount:

```jsx
useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = dimsRef.current.w / rect.width
    const scaleY = dimsRef.current.h / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    for (const node of nodesRef.current) {
      if (node.kind !== 'cat') continue
      const dist = Math.hypot(mx - node.x, my - node.y)
      if (dist <= CAT_RADIUS + 8) {
        if (expandedRef.current.has(node.catId)) {
          expandedRef.current.delete(node.catId)
          collapseCategory(node)
        } else {
          expandedRef.current.add(node.catId)
          expandCategory(node)
        }
        return
      }
    }
  }

  canvas.addEventListener('click', handleClick)
  return () => canvas.removeEventListener('click', handleClick)
}, [])
```

- [ ] **Step 8: Verify expand/collapse works**

```bash
npm run dev
```

Click a category node. Skill nodes should spring out from the category position and settle via physics. Click the same category again — skill nodes should disappear. Clicking multiple categories should show multiple expanded groups simultaneously.

---

- [ ] **Step 9: Animate racer pulses**

Racers need their destination updated each frame (skill nodes move while the physics settles) and their `t` value advanced. Add a separate rAF loop for racers:

```jsx
useEffect(() => {
  let running = true

  function tickRacers() {
    if (!running) return
    const now = performance.now()
    let changed = false

    racersRef.current = racersRef.current
      .map((racer) => {
        const elapsed = now - racer.startTime
        const t = Math.min(elapsed / racer.duration, 1)
        // For expand racers: update destination to current skill node position (node is moving)
        // For collapse racers: skillId is null, destination is fixed
        let toX = racer.toX
        let toY = racer.toY
        if (racer.skillId) {
          const skillNode = nodesRef.current.find((n) => n.id === racer.skillId)
          if (skillNode) { toX = skillNode.x; toY = skillNode.y }
        }
        changed = true
        return { ...racer, t, toX, toY }
      })
      .filter((r) => r.t < 1)

    if (changed) {
      const { w, h } = dimsRef.current
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) draw(ctx, w, h)
    }

    rafRef.current = requestAnimationFrame(tickRacers)
  }

  rafRef.current = requestAnimationFrame(tickRacers)
  return () => {
    running = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }
}, [])
```

- [ ] **Step 10: Verify racers animate**

```bash
npm run dev
```

Click a category — you should see a bright cyan dot travel from the category node outward to each spawning skill node.

---

- [ ] **Step 11: Add mousemove hover**

```jsx
useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = dimsRef.current.w / rect.width
    const scaleY = dimsRef.current.h / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    let found = null
    for (const node of nodesRef.current) {
      const r = node.kind === 'hub' ? HUB_RADIUS : node.kind === 'cat' ? CAT_RADIUS : SKILL_RADIUS
      if (Math.hypot(mx - node.x, my - node.y) <= r + 8) {
        found = node.id
        break
      }
    }

    const prev = hoverRef.current
    hoverRef.current = found
    canvas.style.cursor = found ? 'pointer' : 'default'

    if (prev !== found) {
      const { w, h } = dimsRef.current
      const ctx = canvas.getContext('2d')
      draw(ctx, w, h)
    }
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  return () => canvas.removeEventListener('mousemove', handleMouseMove)
}, [])
```

- [ ] **Step 12: Full smoke test**

```bash
npm run dev
```

Verify all of the following:
- [ ] Panel opens with black blurred background
- [ ] Hub node appears in center labeled "SKILLS"
- [ ] 5 category nodes stagger in (80ms apart) arranged in a circle
- [ ] Edges connect hub → categories
- [ ] Clicking a category springs its skills out with physics
- [ ] Skills repel each other and settle naturally
- [ ] A racer pulse travels from category → each skill on expand
- [ ] Clicking the category again collapses the skills (they disappear)
- [ ] Multiple categories can be expanded simultaneously
- [ ] Hovering a node highlights it with a glow ring
- [ ] Hovering a node brightens the edge connecting it to its parent
- [ ] Cursor changes to pointer over any node

- [ ] **Step 13: Commit**

```bash
git add src/components/UI/SkillsSector.jsx package.json package-lock.json
git commit -m "feat: replace skill graph with force-directed physics web"
```
