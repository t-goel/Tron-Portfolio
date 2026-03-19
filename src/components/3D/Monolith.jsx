import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Monolith({ position, accentColor, active, name }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const baseY = position ? position[1] : 0

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 3, 0.3)),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    if (hovered) {
      // Bob animation while hovered
      meshRef.current.position.y = baseY + Math.sin(t * 2) * 0.1
      // Lerp emissive intensity toward 0.8
      const mat = meshRef.current.material
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.8, 0.05)
    } else {
      // Return to base position
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, baseY, 0.05)
      // Lerp emissive intensity back to 0.3
      const mat = meshRef.current.material
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.05)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[1.5, 3, 0.3]} />
        <meshStandardMaterial
          color="#111"
          emissive={accentColor}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Edge wireframe overlay */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={accentColor} transparent opacity={0.8} toneMapped={false} />
      </lineSegments>
    </group>
  )
}
