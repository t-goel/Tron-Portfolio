import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CHAR_SET = '0123456789ABCDEF\u2554\u2557\u255A\u255D\u2551\u2550\u2560\u2563\u2566\u2569\u256C01>_/\\'

function drawIdleFrame(ctx, seed) {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 240, 160)

  ctx.font = "8px 'Roboto Mono', monospace"

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 30; col++) {
      const charIndex = Math.floor((Math.random() + seed * 0.1) * CHAR_SET.length) % CHAR_SET.length
      const char = CHAR_SET[charIndex]
      const colorRoll = Math.random()
      if (colorRoll < 0.4) {
        ctx.fillStyle = '#00FFFF'
      } else if (colorRoll < 0.7) {
        ctx.fillStyle = 'rgba(255,94,0,0.6)'
      } else {
        ctx.fillStyle = 'rgba(240,240,240,0.4)'
      }
      ctx.fillText(char, col * 8 + 1, row * 8 + 7)
    }
  }

  // Draw 3-5 faint wireframe lines
  const lineCount = 3 + Math.floor(Math.random() * 3)
  ctx.strokeStyle = 'rgba(0,255,255,0.15)'
  ctx.lineWidth = 1
  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * 240, Math.random() * 160)
    ctx.lineTo(Math.random() * 240, Math.random() * 160)
    ctx.stroke()
  }
}

const GatewayPane = forwardRef(function GatewayPane({ position, label, seed }, ref) {
  const groupRef = useRef()
  const lastDrawRef = useRef(0)
  const { camera } = useThree()

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
    drawIdleFrame(ctx, seed)
    texture.needsUpdate = true
    return { canvas, texture }
  }, [seed])

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

  useFrame((state) => {
    if (!groupRef.current) return

    // Billboard: rotate group to face camera (Y-axis only)
    const gx = groupRef.current.position.x
    const gz = groupRef.current.position.z
    groupRef.current.rotation.y = Math.atan2(
      camera.position.x - gx,
      camera.position.z - gz
    )

    // Texture throttle: ~8fps (every 0.125s)
    const elapsed = state.clock.elapsedTime
    if (elapsed - lastDrawRef.current > 0.125) {
      const ctx = canvas.getContext('2d')
      drawIdleFrame(ctx, seed)
      texture.needsUpdate = true
      lastDrawRef.current = elapsed
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <planeGeometry args={[5, 3.5]} />
        <meshStandardMaterial
          map={texture}
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.04}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0.8} toneMapped={false} />
      </lineSegments>
    </group>
  )
})

export default GatewayPane
