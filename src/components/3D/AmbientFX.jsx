import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Recursively builds lightning bolt vertex pairs.
 * Returns a flat Float32Array-compatible number array:
 * [x1,y1,z1, x2,y2,z2,  x1,y1,z1, x2,y2,z2, ...]
 * Each pair of 3-vectors is one line segment.
 */
function buildBoltSegments(origin, remainingDepth, config) {
  const { steps, jitter, branchProb } = config
  const segments = []
  const stepSize = 5 / steps // total ~5 units downward
  let current = origin.clone()

  for (let i = 0; i < steps; i++) {
    const next = new THREE.Vector3(
      current.x + (Math.random() - 0.5) * jitter,
      current.y - stepSize,
      current.z + (Math.random() - 0.5) * jitter
    )
    segments.push(current.x, current.y, current.z, next.x, next.y, next.z)

    if (remainingDepth > 0 && Math.random() < branchProb) {
      const angle = (Math.random() - 0.5) * (Math.PI / 3) // 30-60°
      const branchEnd = new THREE.Vector3(
        next.x + Math.sin(angle) * stepSize * 2,
        next.y - Math.abs(Math.cos(angle)) * stepSize * 2,
        next.z + (Math.random() - 0.5) * stepSize
      )
      segments.push(next.x, next.y, next.z, branchEnd.x, branchEnd.y, branchEnd.z)
      const sub = buildBoltSegments(next, remainingDepth - 1, {
        ...config,
        steps: Math.max(2, Math.floor(steps / 2)),
        branchProb: branchProb * 0.5,
      })
      segments.push(...sub)
    }

    current = next
  }

  return segments
}

function spawnBolt(group, activeBolts) {
  if (activeBolts.current.length >= 3) return

  const angle = Math.random() * Math.PI * 2   // 0 to 360°
  const radius = 45 + Math.random() * 35      // 45 to 80 units from center
  const origin = new THREE.Vector3(
    Math.cos(angle) * radius,
    8 + Math.random() * 8,                    // y: 8 to 16 (sky)
    Math.sin(angle) * radius
  )

  const config = {
    steps: 5 + Math.floor(Math.random() * 4), // 5-8
    jitter: 0.3 + Math.random() * 0.3,
    branchProb: 0.3,
  }

  const verts = buildBoltSegments(origin, 2, config)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 1.0,
  })
  const obj = new THREE.LineSegments(geometry, material)
  group.add(obj)

  activeBolts.current.push({
    obj,
    geometry,
    material,
    phase: 'hold',
    timer: 0.08 + Math.random() * 0.04, // 0.08-0.12s
  })
}

export default function AmbientFX() {
  const groupRef = useRef()
  const activeBolts = useRef([])
  const boltTimer = useRef(1 + Math.random() * 3)
  const pendingSecondaryBolt = useRef({ active: false, timer: 0 })

  useEffect(() => {
    return () => {
      const group = groupRef.current
      for (const { obj, geometry, material } of activeBolts.current) {
        geometry.dispose()
        material.dispose()
        if (group) group.remove(obj)
      }
      activeBolts.current = []
    }
  }, [])

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return

    // ── Bolt scheduler ──
    boltTimer.current -= delta
    if (boltTimer.current <= 0) {
      spawnBolt(group, activeBolts)
      boltTimer.current = 2

      if (Math.random() < 0.2) {
        pendingSecondaryBolt.current = {
          active: true,
          timer: 0.05 + Math.random() * 0.1,
        }
      }
    }

    // ── Secondary bolt countdown ──
    if (pendingSecondaryBolt.current.active) {
      pendingSecondaryBolt.current.timer -= delta
      if (pendingSecondaryBolt.current.timer <= 0) {
        spawnBolt(group, activeBolts)
        pendingSecondaryBolt.current.active = false
      }
    }

    // ── Bolt lifecycle ──
    for (let i = activeBolts.current.length - 1; i >= 0; i--) {
      const bolt = activeBolts.current[i]
      bolt.timer -= delta

      if (bolt.phase === 'hold' && bolt.timer <= 0) {
        bolt.phase = 'fade'
        bolt.timer = 0.2
      } else if (bolt.phase === 'fade') {
        bolt.material.opacity = Math.max(0, bolt.timer / 0.2)
        if (bolt.timer <= 0) {
          bolt.geometry.dispose()
          bolt.material.dispose()
          group.remove(bolt.obj)
          activeBolts.current.splice(i, 1)
        }
      }
    }
  })

  return <group ref={groupRef} />
}
