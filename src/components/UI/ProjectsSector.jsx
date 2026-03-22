import { useState, useEffect } from 'react'
import { projects } from '../../data/projects'

// Inject @keyframes once per page load (module-level guard survives HMR remounts)
let styleInjected = false
function injectStyles() {
  if (styleInjected) return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes scanDown {
      0%   { top: 0%;   opacity: 1; }
      92%  { top: 100%; opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes revealRow {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

export default function ProjectsSector() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    injectStyles()
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 30,
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease-in',
    }}>
      <div style={{ pointerEvents: 'auto', overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
          <p style={{ color: '#00FFFF', fontFamily: 'Roboto Mono', fontSize: 12 }}>SCAFFOLD OK</p>
        </div>
      </div>
    </div>
  )
}
