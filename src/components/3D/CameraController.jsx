import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import useAppState from '../../store/appState'

const SECTOR_CAMERAS = {
  projects: { position: [0, 4, -10], lookAt: [0, 1, -12] },
  about:    { position: [-6.93, 4, 2], lookAt: [-6.93, 1, 0] },
  skills:   { position: [6.93, 4, 2],  lookAt: [6.93, 1, 0] },
}

const HOME_POSITION = [0, 8, 14]

export default function CameraController() {
  const { camera } = useThree()
  const tweenRef = useRef(null)
  const activeSector = useAppState((s) => s.activeSector)
  const setTransitioning = useAppState((s) => s.setTransitioning)

  useEffect(() => {
    // Kill any existing tween to prevent conflicts
    if (tweenRef.current) tweenRef.current.kill()

    if (activeSector) {
      const target = SECTOR_CAMERAS[activeSector]
      if (!target) return
      setTransitioning(true)
      tweenRef.current = gsap.to(camera.position, {
        x: target.position[0],
        y: target.position[1],
        z: target.position[2],
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => setTransitioning(false),
      })
    } else {
      // Return to home
      setTransitioning(true)
      tweenRef.current = gsap.to(camera.position, {
        x: HOME_POSITION[0],
        y: HOME_POSITION[1],
        z: HOME_POSITION[2],
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => setTransitioning(false),
      })
    }

    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [activeSector]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
