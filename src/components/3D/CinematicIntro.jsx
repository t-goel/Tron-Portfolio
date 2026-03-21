// src/components/3D/CinematicIntro.jsx
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import useAppState from '../../store/appState'

// Module-level flag: cinematic plays once per page load.
// If the user navigates home (setPhase(2)) after seeing it,
// this component mounts again and immediately calls setPhase(3).
let hasPlayed = false

export default function CinematicIntro() {
  const { camera } = useThree()
  const setPhase = useAppState((s) => s.setPhase)

  useEffect(() => {
    // Skip cinematic on repeat mount (home-button back-navigation)
    if (hasPlayed) {
      setPhase(3)
      return
    }

    const mountedRef = { current: true }

    // Synchronously snap camera before first rendered frame
    camera.position.set(0, 3, -34)
    camera.lookAt(0, 3, -40)

    // Proxy object for interpolating lookAt target
    const lookAtProxy = { x: 0, y: 3, z: -40 }

    const positionTween = gsap.to(camera.position, {
      x: 0, y: 8, z: 14,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z),
      onComplete: () => {
        if (mountedRef.current) {
          hasPlayed = true
          setPhase(3)
        }
      },
    })

    const lookAtTween = gsap.to(lookAtProxy, {
      x: 0, y: 1, z: 0,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.inOut',
    })

    return () => {
      mountedRef.current = false
      positionTween.kill()
      lookAtTween.kill()
    }
  }, [camera, setPhase])

  return null
}
