import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const DISC_RADIUS = 1.8

export default function IdentityDisc({ onClick, onHoverChange }) {
  const discGroupRef = useRef()
  const detailMeshRef = useRef()
  const particlesRef = useRef()
  const gridRef = useRef()
  const [hovered, setHovered] = useState(false)
  const hoverIntensity = useRef(0)
  const rotationSpeed = useRef(0.4)

  // Load reference image as disc texture
  const refTexture = useLoader(THREE.TextureLoader, '/disc-reference.png')

  // Texture is a pre-cropped 652x652 square — no UV adjustment needed
  useMemo(() => {
    refTexture.needsUpdate = true
  }, [refTexture])

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

  // Grid floor
  const gridLines = useMemo(() => {
    const points = []
    const width = 60
    const depth = 40
    const divisionsX = 40
    const divisionsZ = 30
    const stepX = width / divisionsX
    const stepZ = depth / divisionsZ
    for (let i = -width / 2; i <= width / 2; i += stepX) {
      points.push(new THREE.Vector3(i, 0, -depth / 2))
      points.push(new THREE.Vector3(i, 0, depth / 2))
    }
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

    // Hover intensity lerp
    const target = hovered ? 1 : 0
    hoverIntensity.current += (target - hoverIntensity.current) * dt * 5
    const hi = hoverIntensity.current

    // Rotation
    const idleSpeed = 0.4
    const hoverBoost = hi * 6
    rotationSpeed.current += ((idleSpeed + hoverBoost) - rotationSpeed.current) * dt * 3
    discGroupRef.current.rotation.z += dt * rotationSpeed.current

    // Subtle opacity shift on face texture at high rotation speed
    if (detailMeshRef.current) {
      const blurFactor = Math.min(rotationSpeed.current / 5, 0.6)
      detailMeshRef.current.material.opacity = 1 - blurFactor * 0.15
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
      <lineSegments ref={gridRef} geometry={gridLines} position={[0, -3, 0]}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0} />
      </lineSegments>

      {/* Disc assembly — rotates around Z */}
      <group
        ref={discGroupRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {/* Thin cylinder body — gives the disc 3D edge depth */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.08, 128]} />
          <meshStandardMaterial color="#050510" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Disc face — front */}
        <mesh ref={detailMeshRef} position={[0, 0, 0.045]}>
          <circleGeometry args={[DISC_RADIUS, 128]} />
          <meshBasicMaterial
            map={refTexture}
            toneMapped={false}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Disc face — back */}
        <mesh position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[DISC_RADIUS, 128]} />
          <meshBasicMaterial
            map={refTexture}
            toneMapped={false}
            transparent
            opacity={1}
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
