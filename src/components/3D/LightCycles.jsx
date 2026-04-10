import { useEffect, useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const MODEL_PATH = '/models/tron_uprising_-_argoncity_light_cycle/scene.gltf'

function cloneScene(source) {
  const clone = SkeletonUtils.clone(source)
  // Give each clone its own material instances so colors don't bleed across bikes
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

  const player = useRef({})
  const red    = useRef({})
  const org    = useRef({})

  useEffect(() => {
    applyGlow(playerScene, '#00FFFF', 2)
    applyGlow(redScene,    '#FF0000', 3)
    applyGlow(orgScene,    '#FF5E00', 3)

    player.current = getTires(playerScene)
    red.current    = getTires(redScene)
    org.current    = getTires(orgScene)
  }, [playerScene, redScene, orgScene])

  useFrame((_, delta) => {
    const fs = 12 * delta
    const rs =  9 * delta

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
  })

  return (
    <>
      <primitive object={playerScene} position={[0,  -3, 0]} rotation={[0, Math.PI, 0]} scale={1} />
      <primitive object={redScene}    position={[-3, -3, -8]} rotation={[0, 0, 0]} scale={1} />
      <primitive object={orgScene}    position={[3,  -3, -8]} rotation={[0, 0, 0]} scale={1} />
    </>
  )
}

useGLTF.preload(MODEL_PATH)
