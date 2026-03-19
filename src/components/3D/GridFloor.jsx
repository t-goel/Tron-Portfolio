import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const materialRef = useRef()
  const startTimeRef = useRef(null)
  const TARGET_OPACITY = 0.6
  const FADE_DURATION = 2.0

  const geometry = useMemo(() => {
    const points = []
    for (let x = -40; x <= 40; x++) {
      points.push(new THREE.Vector3(x, 0, -40))
      points.push(new THREE.Vector3(x, 0, 40))
    }
    for (let z = -40; z <= 40; z++) {
      points.push(new THREE.Vector3(-40, 0, z))
      points.push(new THREE.Vector3(40, 0, z))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame((state) => {
    if (!materialRef.current) return
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    const progress = Math.min(elapsed / FADE_DURATION, 1)
    materialRef.current.opacity = progress * TARGET_OPACITY
  })

  return (
    <lineSegments geometry={geometry} position={[0, -3, 0]}>
      <lineBasicMaterial
        ref={materialRef}
        color="#00FFFF"
        transparent
        opacity={0}
        toneMapped={false}
      />
    </lineSegments>
  )
}
