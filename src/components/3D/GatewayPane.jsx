import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CHAR_SET = '0123456789ABCDEF\u2554\u2557\u255A\u255D\u2551\u2550\u2560\u2563\u2566\u2569\u256C01>_/\\'

function drawFrame(ctx, seed, decryptProgress, label) {
  // Dark semi-transparent background so the teal glass shows through slightly
  ctx.clearRect(0, 0, 240, 160)
  ctx.fillStyle = 'rgba(0, 8, 12, 0.92)'
  ctx.fillRect(0, 0, 240, 160)

  ctx.font = "9px 'Roboto Mono', monospace"

  const labelChars = Array.from(label)
  const totalCols = 30
  const totalRows = 20
  const totalCells = totalCols * totalRows

  const labelStartCol = Math.floor((totalCols - labelChars.length) / 2)
  const labelRow = Math.floor(totalRows / 2)

  const labelCellMap = new Map()
  for (let i = 0; i < labelChars.length; i++) {
    const col = labelStartCol + i
    if (col >= 0 && col < totalCols) {
      const cellIndex = labelRow * totalCols + col
      labelCellMap.set(cellIndex, labelChars[i])
    }
  }

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      const cellIndex = row * totalCols + col
      const x = col * 8 + 1
      const y = row * 8 + 8

      if (cellIndex / totalCells < decryptProgress) {
        if (labelCellMap.has(cellIndex)) {
          ctx.fillStyle = '#00FFFF'
          ctx.fillText(labelCellMap.get(cellIndex), x, y)
        }
        // else blank (revealed zone, non-label)
      } else {
        const charIndex = Math.floor((Math.random() + seed * 0.1) * CHAR_SET.length) % CHAR_SET.length
        const char = CHAR_SET[charIndex]
        const colorRoll = Math.random()
        if (colorRoll < 0.5) {
          ctx.fillStyle = 'rgba(0,255,255,0.85)'
        } else if (colorRoll < 0.75) {
          ctx.fillStyle = 'rgba(255,94,0,0.7)'
        } else {
          ctx.fillStyle = 'rgba(240,240,240,0.5)'
        }
        ctx.fillText(char, x, y)
      }
    }
  }

  // Wireframe lines
  if (decryptProgress > 0.8) {
    ctx.strokeStyle = 'rgba(0,255,255,0.35)'
    ctx.lineWidth = 1
    const hLines = [40, 80, 120]
    const vLines = [60, 120, 180]
    for (const hy of hLines) {
      ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(240, hy); ctx.stroke()
    }
    for (const vx of vLines) {
      ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, 160); ctx.stroke()
    }
  } else {
    const lineCount = 3 + Math.floor(Math.random() * 3)
    ctx.strokeStyle = 'rgba(0,255,255,0.2)'
    ctx.lineWidth = 1
    for (let i = 0; i < lineCount; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 240, Math.random() * 160)
      ctx.lineTo(Math.random() * 240, Math.random() * 160)
      ctx.stroke()
    }
  }

  // Idle-only faint label: shown only when decryptProgress is zero so the
  // pane is always identifiable at rest. Once a hover begins the cell-loop
  // above takes over and renders the label as part of the reveal animation,
  // so this block must not run in parallel with that path.
  if (decryptProgress === 0) {
    ctx.font = "18px 'TR2N', sans-serif"
    ctx.fillStyle = 'rgba(0,255,255,0.75)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 120, 80)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }
}

const GatewayPane = forwardRef(function GatewayPane({ position, label, seed, onPaneClick }, ref) {
  const groupRef = useRef()
  const lastDrawRef = useRef(0)
  const { camera } = useThree()

  // Hover decrypt state
  const decryptRef = useRef({ progress: 0, direction: 0 })
  const ringRef = useRef()
  const ringStateRef = useRef({ active: false, progress: 0 })

  // Expose groupRef via forwarded ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(groupRef.current)
      } else {
        ref.current = groupRef.current
      }
    }
  })

  // Create canvas and texture synchronously via useMemo so map is available on first render
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 160
    const texture = new THREE.CanvasTexture(canvas)
    // Draw initial frame
    const ctx = canvas.getContext('2d')
    drawFrame(ctx, seed, 0, label)
    texture.needsUpdate = true
    return { canvas, texture }
  }, [seed, label])

  // Dispose texture on unmount
  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(5, 3.5)),
    []
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Billboard: rotate group to face camera (Y-axis only)
    const gx = groupRef.current.position.x
    const gz = groupRef.current.position.z
    groupRef.current.rotation.y = Math.atan2(
      camera.position.x - gx,
      camera.position.z - gz
    )

    // Decrypt progress update
    const d = decryptRef.current
    if (d.direction !== 0) {
      const speed = d.direction > 0 ? delta / 1.2 : delta / 0.6
      d.progress = Math.max(0, Math.min(1, d.progress + d.direction * speed))
      if (d.progress <= 0 || d.progress >= 1) d.direction = 0
    }

    // Ring pulse animation
    const rs = ringStateRef.current
    if (rs.active && ringRef.current) {
      rs.progress = Math.min(rs.progress + delta / 0.8, 1)
      const s = 0.5 + rs.progress * 4.5
      ringRef.current.scale.setScalar(s)
      ringRef.current.material.opacity = 0.8 * (1 - rs.progress)
      if (rs.progress >= 1) {
        rs.active = false
        ringRef.current.visible = false
      }
    }

    // Texture draw logic
    const elapsed = state.clock.elapsedTime
    const isAnimating = d.direction !== 0

    if (isAnimating) {
      // Draw every frame during decrypt animation for smooth reveal
      const ctx = canvas.getContext('2d')
      drawFrame(ctx, seed, d.progress, label)
      texture.needsUpdate = true
      lastDrawRef.current = elapsed
    } else if (elapsed - lastDrawRef.current > 0.125) {
      // Idle throttle: ~8fps
      const ctx = canvas.getContext('2d')
      drawFrame(ctx, seed, d.progress, label)
      texture.needsUpdate = true
      lastDrawRef.current = elapsed
    }
  })

  return (
    <>
      <group ref={groupRef} position={position}>
        <mesh
          onPointerEnter={(e) => {
            e.stopPropagation()
            decryptRef.current.direction = 1
            document.body.style.cursor = 'pointer'
            // Fire ring pulse
            const rs = ringStateRef.current
            if (!rs.active || rs.progress > 0.5) {
              rs.active = true
              rs.progress = 0
              if (ringRef.current) ringRef.current.visible = true
            }
          }}
          onPointerLeave={(e) => {
            e.stopPropagation()
            decryptRef.current.direction = -1
            document.body.style.cursor = 'auto'
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
            if (onPaneClick) onPaneClick()
          }}
        >
          <planeGeometry args={[5, 3.5]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial color="#00FFFF" transparent opacity={0.8} toneMapped={false} />
        </lineSegments>
      </group>
      <mesh
        ref={ringRef}
        position={[position[0], -3, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <ringGeometry args={[1, 1.08, 64]} />
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </>
  )
})

export default GatewayPane
