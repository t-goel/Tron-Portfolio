import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RING_COUNT = 4
const RING_RADII = [1.5, 1.2, 0.9, 0.6]
const RING_TUBE = 0.03

export default function IdentityDisc({ onClick, onHoverChange }) {
  const groupRef = useRef()
  const outerRingRef = useRef()
  const particlesRef = useRef()
  const gridRef = useRef()
  const [hovered, setHovered] = useState(false)
  const hoverIntensity = useRef(0)

  // Particle system for hover effect
  const particleCount = 80
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.5 + Math.random() * 1
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      positions[i * 3 + 2] = Math.sin(angle) * r
      velocities.push({
        x: Math.cos(angle) * (0.5 + Math.random() * 2),
        y: (Math.random() - 0.5) * 0.5,
        z: Math.sin(angle) * (0.5 + Math.random() * 2),
      })
    }
    return { positions, velocities }
  }, [])

  // Grid lines for hover reveal
  const gridLines = useMemo(() => {
    const points = []
    const size = 20
    const divisions = 30
    const step = size / divisions
    for (let i = -size / 2; i <= size / 2; i += step) {
      points.push(new THREE.Vector3(i, 0, -size / 2))
      points.push(new THREE.Vector3(i, 0, size / 2))
      points.push(new THREE.Vector3(-size / 2, 0, i))
      points.push(new THREE.Vector3(size / 2, 0, i))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Idle rotation
    groupRef.current.rotation.y += delta * 0.3

    // Hover intensity lerp
    const target = hovered ? 1 : 0
    hoverIntensity.current += (target - hoverIntensity.current) * delta * 4

    // Outer ring rapid spin on hover
    if (outerRingRef.current) {
      const spinSpeed = hovered ? 8 : 0
      outerRingRef.current.rotation.z += delta * spinSpeed
    }

    // Particles — shoot outward on hover
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        if (hovered) {
          posAttr.array[i * 3] += particleData.velocities[i].x * delta
          posAttr.array[i * 3 + 1] += particleData.velocities[i].y * delta
          posAttr.array[i * 3 + 2] += particleData.velocities[i].z * delta
        } else {
          // Reset particles back toward disc
          const angle = Math.random() * Math.PI * 2
          const r = 0.5 + Math.random() * 1
          posAttr.array[i * 3] += (Math.cos(angle) * r - posAttr.array[i * 3]) * delta * 3
          posAttr.array[i * 3 + 1] += (0 - posAttr.array[i * 3 + 1]) * delta * 3
          posAttr.array[i * 3 + 2] += (Math.sin(angle) * r - posAttr.array[i * 3 + 2]) * delta * 3
        }
      }
      posAttr.needsUpdate = true
      particlesRef.current.material.opacity = hoverIntensity.current * 0.8
    }

    // Grid opacity
    if (gridRef.current) {
      gridRef.current.material.opacity = hoverIntensity.current * 0.15
    }
  })

  return (
    <group>
      {/* Hover-reveal grid floor */}
      <lineSegments ref={gridRef} geometry={gridLines} position={[0, -2.5, 0]}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0} />
      </lineSegments>

      {/* Main disc group — rotates */}
      <group
        ref={groupRef}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); onHoverChange?.(true); document.body.style.cursor = 'pointer' }}
        onPointerLeave={() => { setHovered(false); onHoverChange?.(false); document.body.style.cursor = 'default' }}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
      >
        {/* Disc body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 64]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>

        {/* Glowing rings */}
        {RING_RADII.map((radius, i) => (
          <mesh
            key={i}
            ref={i === 0 ? outerRingRef : undefined}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[radius, RING_TUBE, 16, 64]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={hovered ? 2 : 0.8}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Center glow */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1.5}
            toneMapped={false}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Circuit line details on disc face */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          const innerR = 0.45
          const outerR = 1.1
          return (
            <line key={`line-${i}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    Math.cos(angle) * innerR, 0.05, Math.sin(angle) * innerR,
                    Math.cos(angle) * outerR, 0.05, Math.sin(angle) * outerR,
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#FF0000" transparent opacity={0.5} />
            </line>
          )
        })}

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
            size={0.05}
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
