import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import useAppState from '../../store/appState'

// Chase camera config
const CAM_HEIGHT   = 5    // height above the bike
const CAM_DISTANCE = 8    // distance behind the bike
const LOOK_AHEAD   = 3    // how far ahead of the bike to look

export default function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef()
  const initialized = useRef(false)

  useFrame(() => {
    const playerRef = useAppState.getState().playerRef
    if (!playerRef || !controlsRef.current) return

    const px = playerRef.position.x
    const py = playerRef.position.y
    const pz = playerRef.position.z
    const rot = playerRef.rotation.y

    const fwdX = Math.sin(rot)
    const fwdZ = Math.cos(rot)

    // Move orbit target to the bike's position (slightly ahead)
    const controls = controlsRef.current
    controls.target.set(
      px + fwdX * LOOK_AHEAD,
      py + 1,
      pz + fwdZ * LOOK_AHEAD
    )

    if (!initialized.current) {
      // Snap camera behind the bike on first frame
      camera.position.set(
        px - fwdX * CAM_DISTANCE,
        py + CAM_HEIGHT,
        pz - fwdZ * CAM_DISTANCE
      )
      initialized.current = true
    }

    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      maxPolarAngle={Math.PI / 1.5}
      minPolarAngle={0.2}
      minDistance={3}
      maxDistance={20}
      enableDamping
      dampingFactor={0.05}
    />
  )
}
