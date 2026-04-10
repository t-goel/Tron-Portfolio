import { useEffect, useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const MODEL_PATH = '/models/tron_uprising_-_argoncity_light_cycle/scene.gltf'
const SPEED = 6 // units per second

// Rotation Y for each direction (bike model's forward is -Z at Math.PI)
const DIR_ROT = {
  ArrowUp:    Math.PI,
  ArrowDown:  0,
  ArrowLeft:  Math.PI / 2,
  ArrowRight: -Math.PI / 2,
}

function cloneScene(source) {
  const clone = SkeletonUtils.clone(source)
  clone.traverse((obj) => {
    if (!obj.isMesh) return
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
    if (obj.name === 'Front_Tire_02')  t.front  = obj
    if (obj.name === 'Rear_Tire_04')   t.rear   = obj
    if (obj.name === 'Rear_Engine_03') t.engine = obj
  })
  return t
}

export default function LightCycles() {
  const { scene } = useGLTF(MODEL_PATH)

  const playerScene = useMemo(() => cloneScene(scene), [scene])
  const redScene    = useMemo(() => cloneScene(scene), [scene])
  const orgScene    = useMemo(() => cloneScene(scene), [scene])

  const player    = useRef({})
  const red       = useRef({})
  const org       = useRef({})
  const playerGrp = useRef()
  const keys      = useRef(new Set())

  useEffect(() => {
    applyGlow(playerScene, '#00FFFF', 2)
    applyGlow(redScene,    '#FF0000', 3)
    applyGlow(orgScene,    '#FF5E00', 3)

    player.current = getTires(playerScene)
    red.current    = getTires(redScene)
    org.current    = getTires(orgScene)
  }, [playerScene, redScene, orgScene])

  useEffect(() => {
    const onDown = (e) => {
      if (DIR_ROT[e.key] !== undefined) e.preventDefault()
      keys.current.add(e.key)
    }
    const onUp = (e) => keys.current.delete(e.key)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [])

  useFrame((_, delta) => {
    const fs = 12 * delta
    const rs =  9 * delta

    // Wheel spin — all three bikes
    const p = player.current
    if (p.front)  p.front.rotation.x  -= fs
    if (p.rear)   p.rear.rotation.x   += rs
    if (p.engine) p.engine.rotation.x += rs

    const r = red.current
    if (r.front)  r.front.rotation.x  -= fs
    if (r.rear)   r.rear.rotation.x   += rs
    if (r.engine) r.engine.rotation.x += rs

    const o = org.current
    if (o.front)  o.front.rotation.x  -= fs
    if (o.rear)   o.rear.rotation.x   += rs
    if (o.engine) o.engine.rotation.x += rs

    // Player movement
    const grp = playerGrp.current
    if (!grp) return
    const k = keys.current
    const d = SPEED * delta

    if (k.has('ArrowUp'))    { grp.position.z -= d; grp.rotation.y = DIR_ROT.ArrowUp }
    if (k.has('ArrowDown'))  { grp.position.z += d; grp.rotation.y = DIR_ROT.ArrowDown }
    if (k.has('ArrowLeft'))  { grp.position.x -= d; grp.rotation.y = DIR_ROT.ArrowLeft }
    if (k.has('ArrowRight')) { grp.position.x += d; grp.rotation.y = DIR_ROT.ArrowRight }
  })

  return (
    <>
      <group ref={playerGrp} position={[0, -3, 0]} rotation={[0, Math.PI, 0]}>
        <primitive object={playerScene} />
      </group>
      <primitive object={redScene} position={[-3, -3, -8]} rotation={[0, 0, 0]} scale={1} />
      <primitive object={orgScene} position={[3,  -3, -8]} rotation={[0, 0, 0]} scale={1} />
    </>
  )
}

useGLTF.preload(MODEL_PATH)
