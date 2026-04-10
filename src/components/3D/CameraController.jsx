import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useAppState from '../../store/appState'

// Chase camera config
const CAM_HEIGHT = 10   // height above the bike
const CAM_DISTANCE = 14   // distance behind the bike
const CAM_LERP = 0.08 // smoothing factor (0 = no move, 1 = instant snap)
const LOOK_AHEAD = 3    // how far ahead of the bike to look

const _camTarget = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()

export default function CameraController() {
  const { camera } = useThree()
  const initialized = useRef(false)

  useFrame(() => {
    const playerRef = useAppState.getState().playerRef
    if (!playerRef) return

    const px = playerRef.position.x
    const py = playerRef.position.y
    const pz = playerRef.position.z
    const rot = playerRef.rotation.y

    // Forward direction the bike is facing
    const fwdX = Math.sin(rot)
    const fwdZ = Math.cos(rot)

    // Desired camera position: behind and above the bike
    _camTarget.set(
      px - fwdX * CAM_DISTANCE,
      py + CAM_HEIGHT,
      pz - fwdZ * CAM_DISTANCE
    )

    // Look-at point: slightly ahead of the bike
    _lookTarget.set(
      px + fwdX * LOOK_AHEAD,
      py + 1,
      pz + fwdZ * LOOK_AHEAD
    )

    if (!initialized.current) {
      // Snap on first frame
      camera.position.copy(_camTarget)
      initialized.current = true
    } else {
      // Smooth follow
      camera.position.lerp(_camTarget, CAM_LERP)
    }

    camera.lookAt(_lookTarget)
  })

  return null
}
