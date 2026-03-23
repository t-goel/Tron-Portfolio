import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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

const GatewayPane = forwardRef(function GatewayPane({ position, label, onPaneClick }, ref) {
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
    drawPortalFrame(ctx, label, 0, 0)
    texture.needsUpdate = true
    return { canvas, texture }
  }, [label])

  // Dispose texture on unmount
  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

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
      const speed = d.direction > 0 ? delta / 0.3 : delta / 0.6
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
      drawPortalFrame(ctx, label, d.progress, state.clock.elapsedTime)
      texture.needsUpdate = true
      lastDrawRef.current = elapsed
    } else if (elapsed - lastDrawRef.current > 0.125) {
      // Idle throttle: ~8fps
      const ctx = canvas.getContext('2d')
      drawPortalFrame(ctx, label, d.progress, state.clock.elapsedTime)
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
