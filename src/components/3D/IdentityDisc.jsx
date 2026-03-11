import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DISC_RADIUS = 1.8
const TEX_SIZE = 1024

// Generate the disc face texture — concentric rings, tick marks, circuit segments
function createDiscTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE
  canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  const cx = TEX_SIZE / 2
  const cy = TEX_SIZE / 2

  // Background — dark metallic
  ctx.fillStyle = '#050510'
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  // Helper: draw a ring
  const drawRing = (r, width, color, alpha = 1) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = width
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // Helper: draw an arc segment
  const drawArc = (r, startAngle, endAngle, width, color, alpha = 1) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = width
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // Helper: draw a radial tick
  const drawTick = (angle, innerR, outerR, width, color, alpha = 1) => {
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = width
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const RED = '#FF2020'
  const DIM_RED = '#DD1010'
  const DARK_RED = '#991010'
  const FAINT = '#550808'

  // === OUTER ZONE ===
  // Thick bright outer rim
  drawRing(480, 14, RED)
  drawRing(465, 6, DIM_RED, 0.8)
  // Segmented ring just inside
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const gap = (1 / 60) * Math.PI * 2 * 0.3
    drawArc(448, a, a + (1 / 60) * Math.PI * 2 - gap, 8, RED, 0.9)
  }
  // Fine tick marks around outer edge
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2
    drawTick(a, 456, 465, 2, DIM_RED, 0.7)
  }
  // Outer detail ring
  drawRing(435, 5, DARK_RED, 0.7)

  // === MID-OUTER ZONE ===
  drawRing(418, 10, RED, 0.95)
  drawRing(405, 5, DIM_RED, 0.6)
  // Dashed segments
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2
    const gap = (1 / 36) * Math.PI * 2 * 0.25
    drawArc(395, a, a + (1 / 36) * Math.PI * 2 - gap, 7, RED, 0.7)
  }
  // Radial circuit lines — outer zone
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    drawTick(a, 418, 448, 5, RED, 0.8)
  }
  // Shorter alternating ticks
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16
    drawTick(a, 420, 435, 3, DIM_RED, 0.6)
  }

  // === MID ZONE ===
  drawRing(375, 8, RED, 0.9)
  drawRing(360, 5, DIM_RED, 0.5)
  drawRing(345, 7, RED, 0.8)
  // Segmented detail
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const gap = (1 / 48) * Math.PI * 2 * 0.35
    drawArc(362, a, a + (1 / 48) * Math.PI * 2 - gap, 5, DARK_RED, 0.6)
  }
  // Radial lines mid zone
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    drawTick(a, 345, 375, 4, RED, 0.7)
  }

  // === INNER-MID ZONE ===
  drawRing(325, 10, RED, 0.95)
  drawRing(310, 5, DIM_RED, 0.6)
  // Dense tick marks
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    drawTick(a, 312, 323, 3, DIM_RED, 0.5)
  }
  // Circuit arc segments
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const gap = (1 / 24) * Math.PI * 2 * 0.2
    drawArc(317, a, a + (1 / 24) * Math.PI * 2 - gap, 6, RED, 0.65)
  }
  drawRing(295, 7, RED, 0.8)
  // Radial circuit lines
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 12
    drawTick(a, 295, 325, 5, RED, 0.75)
  }

  // === INNER ZONE ===
  drawRing(270, 8, RED, 0.85)
  drawRing(255, 5, DARK_RED, 0.6)
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2
    const gap = (1 / 32) * Math.PI * 2 * 0.3
    drawArc(262, a, a + (1 / 32) * Math.PI * 2 - gap, 5, DIM_RED, 0.6)
  }
  drawRing(240, 7, RED, 0.8)
  // Ticks
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    drawTick(a, 240, 270, 3, DIM_RED, 0.55)
  }

  // === DEEP INNER ===
  drawRing(215, 10, RED, 0.9)
  drawRing(198, 5, DIM_RED, 0.6)
  drawRing(182, 7, RED, 0.75)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    drawTick(a, 182, 215, 4, RED, 0.65)
  }
  // Small segmented ring
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const gap = (1 / 16) * Math.PI * 2 * 0.25
    drawArc(198, a, a + (1 / 16) * Math.PI * 2 - gap, 5, DARK_RED, 0.55)
  }

  // === CORE ZONE ===
  drawRing(155, 8, RED, 0.85)
  drawRing(138, 5, DIM_RED, 0.6)
  drawRing(118, 7, RED, 0.8)
  // Core ticks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    drawTick(a, 118, 155, 4, DIM_RED, 0.6)
  }

  // === CENTER VOID ===
  // Dark center
  ctx.beginPath()
  ctx.arc(cx, cy, 100, 0, Math.PI * 2)
  ctx.fillStyle = '#020208'
  ctx.fill()
  // Bright inner ring around void
  drawRing(100, 8, RED, 0.95)
  drawRing(88, 5, DIM_RED, 0.7)
  // Innermost glow ring
  drawRing(68, 6, RED, 0.6)
  // Center glow
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65)
  gradient.addColorStop(0, 'rgba(255, 30, 30, 0.6)')
  gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)')
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
  ctx.beginPath()
  ctx.arc(cx, cy, 65, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // Mask to circle
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, cy, 490, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export default function IdentityDisc({ onClick, onHoverChange }) {
  const discGroupRef = useRef()
  const detailMeshRef = useRef()
  const particlesRef = useRef()
  const gridRef = useRef()
  const [hovered, setHovered] = useState(false)
  const hoverIntensity = useRef(0)
  const rotationSpeed = useRef(0.4)

  // Create disc texture
  const discTexture = useMemo(() => createDiscTexture(), [])

  // Particle system
  const particleCount = 150
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.3 + Math.random() * 1.5
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = Math.sin(angle) * r
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1
      const speed = 1.5 + Math.random() * 3.5
      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        z: (Math.random() - 0.5) * 2,
      })
    }
    return { positions, velocities }
  }, [])

  // Grid floor — wide enough to fill screen edges at camera fov 60, z=8
  const gridLines = useMemo(() => {
    const points = []
    const width = 60   // X-axis span (left-right)
    const depth = 40   // Z-axis span (into screen)
    const divisionsX = 60
    const divisionsZ = 40
    const stepX = width / divisionsX
    const stepZ = depth / divisionsZ
    // Lines along Z (left-to-right columns)
    for (let i = -width / 2; i <= width / 2; i += stepX) {
      points.push(new THREE.Vector3(i, 0, -depth / 2))
      points.push(new THREE.Vector3(i, 0, depth / 2))
    }
    // Lines along X (front-to-back rows)
    for (let i = -depth / 2; i <= depth / 2; i += stepZ) {
      points.push(new THREE.Vector3(-width / 2, 0, i))
      points.push(new THREE.Vector3(width / 2, 0, i))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  const handlePointerEnter = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    onHoverChange?.(true)
    document.body.style.cursor = 'pointer'
  }, [onHoverChange])

  const handlePointerLeave = useCallback(() => {
    setHovered(false)
    onHoverChange?.(false)
    document.body.style.cursor = 'default'
  }, [onHoverChange])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick?.()
  }, [onClick])

  useFrame((state, delta) => {
    if (!discGroupRef.current) return
    const dt = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime

    // Hover intensity lerp
    const target = hovered ? 1 : 0
    hoverIntensity.current += (target - hoverIntensity.current) * dt * 5
    const hi = hoverIntensity.current

    // Rotation — idle slow spin, faster on hover for outer ring effect
    const idleSpeed = 0.4
    const hoverBoost = hi * 6
    rotationSpeed.current += ((idleSpeed + hoverBoost) - rotationSpeed.current) * dt * 3
    discGroupRef.current.rotation.z += dt * rotationSpeed.current

    // Motion blur simulation — reduce detail texture opacity at high speed
    if (detailMeshRef.current) {
      const blurFactor = Math.min(rotationSpeed.current / 5, 0.6)
      detailMeshRef.current.material.opacity = 1 - blurFactor * 0.3
    }

    // Particles — shoot outward on hover
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        if (hovered) {
          posAttr.array[i * 3] += particleData.velocities[i].x * dt
          posAttr.array[i * 3 + 1] += particleData.velocities[i].y * dt
          posAttr.array[i * 3 + 2] += particleData.velocities[i].z * dt

          const dist = Math.sqrt(
            posAttr.array[i * 3] ** 2 +
            posAttr.array[i * 3 + 1] ** 2 +
            posAttr.array[i * 3 + 2] ** 2
          )
          if (dist > 7) {
            const angle = Math.random() * Math.PI * 2
            const r = 0.3 + Math.random() * 1.5
            posAttr.array[i * 3] = Math.cos(angle) * r
            posAttr.array[i * 3 + 1] = Math.sin(angle) * r
            posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.1
          }
        } else {
          const angle = Math.random() * Math.PI * 2
          const r = 0.3 + Math.random() * 1.5
          posAttr.array[i * 3] += (Math.cos(angle) * r - posAttr.array[i * 3]) * dt * 4
          posAttr.array[i * 3 + 1] += (Math.sin(angle) * r - posAttr.array[i * 3 + 1]) * dt * 4
          posAttr.array[i * 3 + 2] += (0 - posAttr.array[i * 3 + 2]) * dt * 4
        }
      }
      posAttr.needsUpdate = true
      particlesRef.current.material.opacity = hi * 0.85
    }

    // Grid floor
    if (gridRef.current) {
      gridRef.current.material.opacity = hi * 0.2
    }
  })

  return (
    <group>
      {/* Hover-reveal grid floor */}
      <lineSegments ref={gridRef} geometry={gridLines} position={[0, -3, 0]} rotation={[0, 0, 0]}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0} />
      </lineSegments>

      {/* Disc assembly — lies flat on XY plane, rotates around Z */}
      <group
        ref={discGroupRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {/* Disc body — thin cylinder facing camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.06, 64]} />
          <meshStandardMaterial
            color="#050510"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Disc detail face — front */}
        <mesh ref={detailMeshRef} position={[0, 0, 0.05]}>
          <planeGeometry args={[DISC_RADIUS * 2, DISC_RADIUS * 2]} />
          <meshBasicMaterial
            map={discTexture}
            transparent
            opacity={1}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Disc detail face — back */}
        <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[DISC_RADIUS * 2, DISC_RADIUS * 2]} />
          <meshBasicMaterial
            map={discTexture}
            transparent
            opacity={0.8}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Bright outer rim ring — 3D torus for glow */}
        <mesh>
          <torusGeometry args={[DISC_RADIUS, 0.035, 16, 100]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* Second outer ring */}
        <mesh>
          <torusGeometry args={[DISC_RADIUS * 0.88, 0.02, 16, 80]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        </mesh>

        {/* Mid ring */}
        <mesh>
          <torusGeometry args={[DISC_RADIUS * 0.69, 0.025, 16, 80]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>

        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[DISC_RADIUS * 0.46, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </mesh>

        {/* Core ring */}
        <mesh>
          <torusGeometry args={[DISC_RADIUS * 0.21, 0.025, 16, 48]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>

        {/* Hover particles */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particleData.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#FF0000"
            size={0.04}
            transparent
            opacity={0}
            sizeAttenuation
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  )
}
