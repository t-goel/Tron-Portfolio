import { useGLTF } from '@react-three/drei'

const MODEL_PATH = '/models/tron_uprising_-_argoncity_light_cycle/scene.gltf'

export default function LightCycles() {
  const { scene } = useGLTF(MODEL_PATH)

  // Camera is at [0, 8, 14] — rotation Y=0 faces the bike away from camera
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
