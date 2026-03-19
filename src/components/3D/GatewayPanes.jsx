import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import GatewayPane from './GatewayPane'

const PANES = [
  { position: [0, 1.5, -8], label: '>_ PROJECTS', seed: 1 },
  { position: [-6.93, 1.5, 4], label: '>_ ABOUT_ME', seed: 2 },
  { position: [6.93, 1.5, 4], label: '>_ SKILLS', seed: 3 },
]

export default function GatewayPanes() {
  const paneRefs = [useRef(), useRef(), useRef()]

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
  }, [])

  return (
    <>
      {PANES.map((pane, i) => (
        <GatewayPane
          key={pane.label}
          ref={paneRefs[i]}
          position={pane.position}
          label={pane.label}
          seed={pane.seed}
        />
      ))}
    </>
  )
}
