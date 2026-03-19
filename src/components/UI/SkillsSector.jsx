import { useEffect, useRef, useState } from 'react'
import { skillCategories } from '../../data/skills'

export default function SkillsSector() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const nodesRef = useRef([])
  const tier2Ref = useRef([])
  const racersRef = useRef([])
  const hoverRef = useRef(null)
  const expandedRef = useRef({})
  const rafRef = useRef(null)
  const ctxRef = useRef(null)
  const dimsRef = useRef({ w: 0, h: 0 })
  const [visible, setVisible] = useState(false)

  // Helper: parse hex color to rgba string at given opacity
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // Compute Tier 1 node positions from container dimensions
  function computeTier1Nodes(w, h) {
    const centerX = w / 2
    const centerY = h / 2
    const formationRadius = 200
    return skillCategories.map((cat, i) => {
      const angle = (2 * Math.PI * i) / 5 - Math.PI / 2
      return {
        id: cat.id,
        label: cat.label,
        color: cat.color,
        skills: cat.skills,
        x: centerX + formationRadius * Math.cos(angle),
        y: centerY + formationRadius * Math.sin(angle),
        radius: 30,
        expanded: false,
        angle,
      }
    })
  }

  // Compute Tier 2 node target positions for a given Tier 1 node
  function computeTier2Targets(node) {
    const count = node.skills.length
    return node.skills.map((skill, i) => {
      const angle = (2 * Math.PI * i) / count + node.angle
      const targetX = node.x + 80 * Math.cos(angle)
      const targetY = node.y + 80 * Math.sin(angle)
      return {
        parentId: node.id,
        label: skill,
        x: node.x,
        y: node.y,
        targetX,
        targetY,
        radius: 18,
        color: node.color,
        visible: false,
      }
    })
  }

  function draw(ctx, w, h) {
    ctx.clearRect(0, 0, w, h)

    const nodes = nodesRef.current
    const tier2 = tier2Ref.current
    const racers = racersRef.current
    const hoverId = hoverRef.current
    const centerX = w / 2
    const centerY = h / 2

    // Draw hub edges (center to each Tier 1 node)
    ctx.strokeStyle = 'rgba(0,255,255,0.2)'
    ctx.lineWidth = 1
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(node.x, node.y)
      ctx.stroke()
    })

    // Draw connecting lines from Tier 1 to visible Tier 2 nodes
    tier2.forEach((t2) => {
      if (!t2.visible) return
      const parent = nodes.find((n) => n.id === t2.parentId)
      if (!parent) return
      const isHovered = hoverId === `t2:${t2.parentId}:${t2.label}`
      ctx.strokeStyle = hexToRgba(parent.color, isHovered ? 0.8 : 0.4)
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(parent.x, parent.y)
      ctx.lineTo(t2.targetX, t2.targetY)
      ctx.stroke()
    })

    // Draw Tier 1 nodes
    nodes.forEach((node) => {
      const isHovered = hoverId === `t1:${node.id}`
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.fill()
      if (isHovered) {
        ctx.strokeStyle = node.color
        ctx.lineWidth = 3
        ctx.stroke()
        // Outer glow ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba(node.color, 0.4)
        ctx.lineWidth = 2
        ctx.stroke()
      }
      // Tier 1 label
      ctx.font = "14px 'Roboto Mono', monospace"
      ctx.fillStyle = node.color
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y + node.radius + 18)
    })

    // Draw visible Tier 2 nodes
    tier2.forEach((t2) => {
      if (!t2.visible) return
      const isHovered = hoverId === `t2:${t2.parentId}:${t2.label}`
      ctx.beginPath()
      ctx.arc(t2.targetX, t2.targetY, t2.radius, 0, Math.PI * 2)
      ctx.fillStyle = hexToRgba(t2.color, isHovered ? 1.0 : 0.7)
      ctx.fill()
      if (isHovered) {
        ctx.strokeStyle = t2.color
        ctx.lineWidth = 2
        ctx.stroke()
      }
      // Tier 2 label
      ctx.font = "12px 'Roboto Mono', monospace"
      ctx.fillStyle = t2.color
      ctx.textAlign = 'left'
      ctx.fillText(t2.label, t2.targetX + 22, t2.targetY + 4)
    })

    // Draw active racer trails
    racers.forEach((racer) => {
      const curX = racer.fromX + (racer.toX - racer.fromX) * racer.progress
      const curY = racer.fromY + (racer.toY - racer.fromY) * racer.progress
      ctx.beginPath()
      ctx.moveTo(racer.fromX, racer.fromY)
      ctx.lineTo(curX, curY)
      ctx.strokeStyle = 'rgba(0,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.stroke()
      // Bright dot at racer head
      ctx.beginPath()
      ctx.arc(curX, curY, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#00FFFF'
      ctx.fill()
    })
  }

  function startExpansion(node) {
    // Cancel any running rAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    expandedRef.current[node.id] = true

    // Compute targets and create Tier 2 entries (replacing existing for this parent)
    const newTier2 = computeTier2Targets(node)
    // Remove existing tier2 for this parent, add new ones (invisible initially)
    tier2Ref.current = [
      ...tier2Ref.current.filter((t) => t.parentId !== node.id),
      ...newTier2,
    ]

    // Create racers
    const newRacers = newTier2.map((t2, i) => ({
      fromX: node.x,
      fromY: node.y,
      toX: t2.targetX,
      toY: t2.targetY,
      progress: 0,
      color: node.color,
      parentId: node.id,
      skillLabel: t2.label,
    }))
    racersRef.current = [...racersRef.current.filter((r) => r.parentId !== node.id), ...newRacers]

    const duration = 600
    const startTime = performance.now()
    const ctx = ctxRef.current
    const { w, h } = dimsRef.current

    function tick(timestamp) {
      const elapsed = timestamp - startTime
      let anyRunning = false

      racersRef.current = racersRef.current.map((racer) => {
        if (racer.parentId !== node.id) return racer
        const progress = Math.min(elapsed / duration, 1)
        if (progress >= 1) {
          // Mark corresponding Tier 2 node as visible
          tier2Ref.current = tier2Ref.current.map((t2) =>
            t2.parentId === node.id && t2.label === racer.skillLabel
              ? { ...t2, visible: true }
              : t2
          )
        } else {
          anyRunning = true
        }
        return { ...racer, progress }
      })

      draw(ctx, w, h)

      if (anyRunning) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Clear racers for this parent once done
        racersRef.current = racersRef.current.filter((r) => r.parentId !== node.id)
        rafRef.current = null
        draw(ctx, w, h)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  function startCollapse(node) {
    // Cancel any running rAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    expandedRef.current[node.id] = false

    const visibleT2 = tier2Ref.current.filter((t) => t.parentId === node.id && t.visible)

    // Create reverse racers
    const reverseRacers = visibleT2.map((t2) => ({
      fromX: t2.targetX,
      fromY: t2.targetY,
      toX: node.x,
      toY: node.y,
      progress: 0,
      color: node.color,
      parentId: node.id,
      skillLabel: t2.label,
      isCollapse: true,
    }))
    racersRef.current = [...racersRef.current.filter((r) => r.parentId !== node.id), ...reverseRacers]

    // Hide Tier 2 nodes immediately so they don't render while collapsing
    tier2Ref.current = tier2Ref.current.map((t2) =>
      t2.parentId === node.id ? { ...t2, visible: false } : t2
    )

    const duration = 400
    const startTime = performance.now()
    const ctx = ctxRef.current
    const { w, h } = dimsRef.current

    function tick(timestamp) {
      const elapsed = timestamp - startTime
      let anyRunning = false

      racersRef.current = racersRef.current.map((racer) => {
        if (racer.parentId !== node.id || !racer.isCollapse) return racer
        const progress = Math.min(elapsed / duration, 1)
        if (progress < 1) anyRunning = true
        return { ...racer, progress }
      })

      draw(ctx, w, h)

      if (anyRunning) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        racersRef.current = racersRef.current.filter((r) => r.parentId !== node.id)
        rafRef.current = null
        draw(ctx, w, h)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    function setupCanvas() {
      const dpr = window.devicePixelRatio || 1
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      dimsRef.current = { w, h }
      // Recompute node positions
      nodesRef.current = computeTier1Nodes(w, h)
      // Recompute tier2 positions for any expanded nodes
      const newTier2 = []
      nodesRef.current.forEach((node) => {
        if (expandedRef.current[node.id]) {
          const targets = computeTier2Targets(node)
          const existing = tier2Ref.current.filter((t) => t.parentId === node.id)
          targets.forEach((t2) => {
            const prev = existing.find((e) => e.label === t2.label)
            newTier2.push({ ...t2, visible: prev ? prev.visible : false })
          })
        }
      })
      tier2Ref.current = newTier2
      draw(ctx, w, h)
    }

    setupCanvas()

    const ro = new ResizeObserver(() => {
      // Reset scale before re-setup
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      setupCanvas()
    })
    ro.observe(container)

    // Fade in
    requestAnimationFrame(() => setVisible(true))

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  function handleClick(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const nodes = nodesRef.current
    for (const node of nodes) {
      const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2)
      if (dist <= node.radius) {
        if (!expandedRef.current[node.id]) {
          startExpansion(node)
        } else {
          startCollapse(node)
        }
        return
      }
    }
  }

  function handleMouseMove(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const nodes = nodesRef.current
    const tier2 = tier2Ref.current
    let found = null

    // Check Tier 2 first (smaller, on top visually)
    for (const t2 of tier2) {
      if (!t2.visible) continue
      const dist = Math.sqrt((mx - t2.targetX) ** 2 + (my - t2.targetY) ** 2)
      if (dist <= 35) {
        found = `t2:${t2.parentId}:${t2.label}`
        break
      }
    }

    // Check Tier 1
    if (!found) {
      for (const node of nodes) {
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2)
        if (dist <= 35) {
          found = `t1:${node.id}`
          break
        }
      }
    }

    const prev = hoverRef.current
    hoverRef.current = found
    canvas.style.cursor = found ? 'pointer' : 'default'

    if (prev !== found) {
      const { w, h } = dimsRef.current
      draw(ctxRef.current, w, h)
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
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />
    </div>
  )
}
