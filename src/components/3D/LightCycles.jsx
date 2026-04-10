import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MODEL_PATH = '/models/tron_uprising_-_argoncity_light_cycle/scene.gltf'

// Tron cyan — change this to recolor the bike's glow
const GLOW_COLOR = new THREE.Color('#00FFFF')

export default function LightCycles() {
  const { scene } = useGLTF(MODEL_PATH)
  const frontTire = useRef()
  const rearTire = useRef()
  const rearEngine = useRef()

  useEffect(() => {
    scene.traverse((obj) => {
      // Grab wheel bones
      if (obj.name === 'Front_Tire_02')  frontTire.current  = obj
      if (obj.name === 'Rear_Tire_04')   rearTire.current   = obj
      if (obj.name === 'Rear_Engine_03') rearEngine.current = obj

      // Recolor the Glow material
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => {
        if (mat.name === 'Glow' || mat.name === 'Headlights') {
          mat.emissive = GLOW_COLOR
          mat.emissiveIntensity = 2
        }
      })
    })
  }, [scene])

  useFrame((_, delta) => {
    const frontSpeed = 12 * delta
    const rearSpeed  = 9 * delta
    if (frontTire.current)  frontTire.current.rotation.x  -= frontSpeed
    if (rearTire.current)   rearTire.current.rotation.x   += rearSpeed
    if (rearEngine.current) rearEngine.current.rotation.x += rearSpeed
  })

  return (
    <primitive
      object={scene}
      position={[0, -3, 0]}
      rotation={[0, Math.PI, 0]}
      scale={1}
    />
  )
}

useGLTF.preload(MODEL_PATH)
