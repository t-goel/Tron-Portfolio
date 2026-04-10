import { useEffect, useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import useAppState from '../../store/appState'

const MODEL_PATH = '/models/tron_uprising_-_argoncity_light_cycle/scene.gltf'
const SPEED = 10    // units per second
const TRAIL_WIDTH = 0.05 // half-width of the trail
const TRAIL_HEIGHT = 0.758 // height of the trail wall
const MAX_TRAIL = 600  // max trail segments

function cloneScene(source) {
  const clone = SkeletonUtils.clone(source)
  clone.traverse((obj) => {
    if (!obj.isMesh) return
    obj.frustumCulled = false
    obj.material = Array.isArray(obj.material)
      ? obj.material.map((m) => m.clone())
      : obj.material.clone()
  })
  return clone
}

function applyGlow(scene, hexColor, intensity = 2) {
  const color = new THREE.Color(hexColor)
  scene.traverse((obj) => {
    if (!obj.isMesh) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((mat) => {
      if (mat.name === 'Glow' || mat.name === 'Headlights') {
        mat.emissive = color
        mat.emissiveIntensity = intensity
      }
    })
  })
}

function getTires(scene) {
  const t = {}
  scene.traverse((obj) => {
    if (obj.name === 'Front_Tire_02') t.front = obj
    if (obj.name === 'Rear_Tire_04') t.rear = obj
    if (obj.name === 'Rear_Engine_03') t.engine = obj
  })
  return t
}

export default function LightCycles() {
  const { scene } = useGLTF(MODEL_PATH)

  const playerScene = useMemo(() => cloneScene(scene), [scene])
  const redScene = useMemo(() => cloneScene(scene), [scene])
  const orgScene = useMemo(() => cloneScene(scene), [scene])

  const player = useRef({})
  const red = useRef({})
  const org = useRef({})
  const playerGrp = useRef()
  const keys = useRef(new Set())
  const lastTurn = useRef({ left: false, right: false })
  const trailPoints = useRef([])  // array of {x, z} positions
  const trailRef = useRef()    // ref to trail mesh

  // Callback ref to register player group in Zustand immediately on mount
  const playerGrpCallback = (node) => {
    playerGrp.current = node
    if (node) {
      useAppState.getState().setPlayerRef(node)
    } else {
      useAppState.getState().setPlayerRef(null)
    }
  }

  // Create trail geometry + material once
  const trailGeo = useMemo(() => new THREE.BufferGeometry(), [])
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00FFFF',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    toneMapped: false,
    depthWrite: false,
  }), [])

  useEffect(() => {
    applyGlow(playerScene, '#00FFFF', 2)
    applyGlow(redScene, '#FF0000', 3)
    applyGlow(orgScene, '#FF5E00', 3)

    player.current = getTires(playerScene)
    red.current = getTires(redScene)
    org.current = getTires(orgScene)
  }, [playerScene, redScene, orgScene])

  useEffect(() => {
    const onDown = (e) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
      keys.current.add(e.key)
    }
    const onUp = (e) => keys.current.delete(e.key)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    const fs = 12 * delta
    const rs = 9 * delta

    // Wheel spin — all three bikes
    const p = player.current
    if (p.front) p.front.rotation.x -= fs
    if (p.rear) p.rear.rotation.x += rs
    if (p.engine) p.engine.rotation.x += rs

    const r = red.current
    if (r.front) r.front.rotation.x -= fs
    if (r.rear) r.rear.rotation.x += rs
    if (r.engine) r.engine.rotation.x += rs

    const o = org.current
    if (o.front) o.front.rotation.x -= fs
    if (o.rear) o.rear.rotation.x += rs
    if (o.engine) o.engine.rotation.x += rs

    // Player movement — always moving forward, left/right snap 90°
    const grp = playerGrp.current
    if (!grp) return
    const k = keys.current
    const lt = lastTurn.current

    // Snap-turn on key press (not hold)
    const turning = (k.has('ArrowLeft') && !lt.left) || (k.has('ArrowRight') && !lt.right)
    if (turning) {
      // Insert a corner point BEFORE the rotation so the trail makes a clean 90° turn
      const pts = trailPoints.current
      const rot = grp.rotation.y
      const perpX = Math.cos(rot)
      const perpZ = -Math.sin(rot)
      pts.push({ x: grp.position.x, z: grp.position.z, perpX, perpZ })
    }
    if (k.has('ArrowLeft') && !lt.left) { grp.rotation.y += Math.PI / 2; lt.left = true }
    if (k.has('ArrowRight') && !lt.right) { grp.rotation.y -= Math.PI / 2; lt.right = true }
    if (!k.has('ArrowLeft')) lt.left = false
    if (!k.has('ArrowRight')) lt.right = false

    // Constant forward movement in the direction the bike is facing
    const d = SPEED * delta
    grp.position.x += Math.sin(grp.rotation.y) * d
    grp.position.z += Math.cos(grp.rotation.y) * d

    // Update light trail — record at group center for clean 90° corners
    {
      const rot = grp.rotation.y
      const perpX = Math.cos(rot)
      const perpZ = -Math.sin(rot)
      trailPoints.current.push({ x: grp.position.x, z: grp.position.z, perpX, perpZ })
    }
    if (trailPoints.current.length > MAX_TRAIL) trailPoints.current.shift()

    // Render trail
    const allPts = trailPoints.current
    if (allPts.length >= 2) {
      const segCount = allPts.length - 1
      // 4 faces per segment (top, bottom, left wall, right wall), 2 tris each = 8 tris = 24 verts
      const verts = new Float32Array(segCount * 24 * 3)
      const baseY = grp.position.y + 0.01
      const topY = baseY + TRAIL_HEIGHT

      for (let i = 0; i < segCount; i++) {
        const a = allPts[i]
        const b = allPts[i + 1]
        const vi = i * 72 // 24 verts * 3 components

        // 4 corners at point a
        const alx = a.x - a.perpX * TRAIL_WIDTH, alz = a.z - a.perpZ * TRAIL_WIDTH
        const arx = a.x + a.perpX * TRAIL_WIDTH, arz = a.z + a.perpZ * TRAIL_WIDTH
        // 4 corners at point b
        const blx = b.x - b.perpX * TRAIL_WIDTH, blz = b.z - b.perpZ * TRAIL_WIDTH
        const brx = b.x + b.perpX * TRAIL_WIDTH, brz = b.z + b.perpZ * TRAIL_WIDTH

        let v = vi
        // Top face
        verts[v] = alx; verts[v + 1] = topY; verts[v + 2] = alz; v += 3
        verts[v] = blx; verts[v + 1] = topY; verts[v + 2] = blz; v += 3
        verts[v] = brx; verts[v + 1] = topY; verts[v + 2] = brz; v += 3
        verts[v] = alx; verts[v + 1] = topY; verts[v + 2] = alz; v += 3
        verts[v] = brx; verts[v + 1] = topY; verts[v + 2] = brz; v += 3
        verts[v] = arx; verts[v + 1] = topY; verts[v + 2] = arz; v += 3

        // Bottom face
        verts[v] = alx; verts[v + 1] = baseY; verts[v + 2] = alz; v += 3
        verts[v] = brx; verts[v + 1] = baseY; verts[v + 2] = brz; v += 3
        verts[v] = blx; verts[v + 1] = baseY; verts[v + 2] = blz; v += 3
        verts[v] = alx; verts[v + 1] = baseY; verts[v + 2] = alz; v += 3
        verts[v] = arx; verts[v + 1] = baseY; verts[v + 2] = arz; v += 3
        verts[v] = brx; verts[v + 1] = baseY; verts[v + 2] = brz; v += 3

        // Left wall
        verts[v] = alx; verts[v + 1] = baseY; verts[v + 2] = alz; v += 3
        verts[v] = blx; verts[v + 1] = baseY; verts[v + 2] = blz; v += 3
        verts[v] = blx; verts[v + 1] = topY; verts[v + 2] = blz; v += 3
        verts[v] = alx; verts[v + 1] = baseY; verts[v + 2] = alz; v += 3
        verts[v] = blx; verts[v + 1] = topY; verts[v + 2] = blz; v += 3
        verts[v] = alx; verts[v + 1] = topY; verts[v + 2] = alz; v += 3

        // Right wall
        verts[v] = arx; verts[v + 1] = baseY; verts[v + 2] = arz; v += 3
        verts[v] = brx; verts[v + 1] = topY; verts[v + 2] = brz; v += 3
        verts[v] = brx; verts[v + 1] = baseY; verts[v + 2] = brz; v += 3
        verts[v] = arx; verts[v + 1] = baseY; verts[v + 2] = arz; v += 3
        verts[v] = arx; verts[v + 1] = topY; verts[v + 2] = arz; v += 3
        verts[v] = brx; verts[v + 1] = topY; verts[v + 2] = brz; v += 3
      }

      trailGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      trailGeo.computeVertexNormals()
    }
  })

  return (
    <>
      <group ref={playerGrpCallback} position={[0, -3, 0]} rotation={[0, Math.PI, 0]}>
        <primitive object={playerScene} />
      </group>
      <mesh ref={trailRef} geometry={trailGeo} material={trailMat} frustumCulled={false} />
      <primitive object={redScene} position={[-3, -3, -8]} rotation={[0, 0, 0]} scale={1} />
      <primitive object={orgScene} position={[3, -3, -8]} rotation={[0, 0, 0]} scale={1} />
    </>
  )
}

useGLTF.preload(MODEL_PATH)
