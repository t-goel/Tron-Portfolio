import { useRef, useEffect } from 'react'
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

  // Initial rise animation on mount
  useEffect(() => {
    paneRefs.forEach((ref) => {
      if (!ref.current) return
      ref.current.position.y = -5
      gsap.to(ref.current.position, {
        y: 1.5,
        duration: 1.5,
        ease: 'power2.out',
      })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fade panes out when entering a sector, fade back in when returning
  useEffect(() => {
    paneRefs.forEach((ref) => {
      if (!ref.current) return
      const group = ref.current
      // children[0] = mesh (has material), children[1] = lineSegments (has material)
      const mesh = group.children[0]
      const lines = group.children[1]
      if (!mesh || !lines) return

      if (activeSector) {
        gsap.to(mesh.material, { opacity: 0, duration: 0.5 })
        gsap.to(lines.material, { opacity: 0, duration: 0.5 })
      } else {
        gsap.to(mesh.material, { opacity: 0.82, duration: 0.5 })
        gsap.to(lines.material, { opacity: 0.8, duration: 0.5 })
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
