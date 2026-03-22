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
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', position: 'relative' }}>

          {/* Scan bar — purely decorative, sweeps top→bottom then fades */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.7) 30%, #00FFFF 50%, rgba(0,255,255,0.7) 70%, transparent 100%)',
            boxShadow: '0 0 18px 6px rgba(0,255,255,0.3)',
            top: 0,
            animation: 'scanDown 1.4s cubic-bezier(0.4,0,0.6,1) 0.3s forwards',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Column header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 10,
            color: 'rgba(0,255,255,0.25)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(0,255,255,0.1)',
            paddingBottom: 10,
            marginBottom: 4,
            opacity: 0,
            animation: 'revealRow 0.2s ease-out 0.3s forwards',
          }}>
            <span>ID / NAME</span>
            <span>STACK / STATUS</span>
          </div>

        </div>
      </div>
    </div>
  )
}
