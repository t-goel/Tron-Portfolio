import { useRef, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import GatewayPane from './GatewayPane'
import useAppState from '../../store/appState'

const PANES = [
  { position: [0, 1.5, -8], label: '>_ PROJECTS', seed: 1 },
  { position: [-6.93, 1.5, 4], label: '>_ ABOUT_ME', seed: 2 },
  { position: [6.93, 1.5, 4], label: '>_ SKILLS', seed: 3 },
]

const LABEL_TO_SECTOR = {
  '>_ PROJECTS': 'projects',
  '>_ ABOUT_ME': 'about',
  '>_ SKILLS':   'skills',
}

export default function GatewayPanes() {
  const paneRefs = [useRef(), useRef(), useRef()]
  const setActiveSector = useAppState((s) => s.setActiveSector)
  const activeSector = useAppState((s) => s.activeSector)
  const phase = useAppState((s) => s.phase)
  const hasRisen = useRef(false)

  // Snap to underground + invisible before the first paint.
  // Runs synchronously after React commits, so Three.js never renders the
  // panes at their final position — eliminates the 1-frame flash.
  useLayoutEffect(() => {
    paneRefs.forEach((ref) => {
      if (!ref.current) return
      ref.current.position.y = -5
      const mesh = ref.current.children[0]
      if (mesh?.material) mesh.material.opacity = 0
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Rise + fade-in animation — fires once when phase reaches 3.
  // Mounting early (phase >= 2) pre-warms shaders/GPU uploads during the
  // cinematic so the transition frame itself stays fast.
  useEffect(() => {
    if (phase < 3 || hasRisen.current) return
    hasRisen.current = true
    paneRefs.forEach((ref) => {
      if (!ref.current) return
      gsap.to(ref.current.position, { y: 1.5, duration: 1.5, ease: 'power2.out' })
      const mesh = ref.current.children[0]
      if (mesh?.material) gsap.to(mesh.material, { opacity: 0.82, duration: 1.0 })
    })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fade panes out when entering a sector, fade back in when returning
  useEffect(() => {
    if (!hasRisen.current) return
    paneRefs.forEach((ref) => {
      if (!ref.current) return
      const group = ref.current
      // children[0] = mesh
      const mesh = group.children[0]
      if (!mesh) return

      if (activeSector) {
        gsap.to(mesh.material, { opacity: 0, duration: 0.5 })
      } else {
        gsap.to(mesh.material, { opacity: 0.82, duration: 0.5 })
      }
    })
  }, [activeSector]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePaneClick(label) {
    const state = useAppState.getState()
    if (state.transitioning || state.activeSector) return
    setActiveSector(LABEL_TO_SECTOR[label])
  }

  return (
    <>
      {PANES.map((pane, i) => (
        <GatewayPane
          key={pane.label}
          ref={paneRefs[i]}
          position={pane.position}
          label={pane.label}
          seed={pane.seed}
          onPaneClick={() => handlePaneClick(pane.label)}
        />
      ))}
    </>
  )
}
