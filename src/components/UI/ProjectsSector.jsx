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

  // Active projects first, preserve relative order within each group
  const sorted = [...projects].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))

  // Hardcoded reveal delays tuned for 3 rows — extend manually if more projects are added
  const ROW_DELAYS = ['0.45s', '0.75s', '1.05s']

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

          {sorted.map((project, i) => {
            // Derive display index from id: 'project-3' → '03'
            const idNum = project.id.replace('project-', '').padStart(2, '0')
            const delay = ROW_DELAYS[i] ?? `${0.45 + i * 0.3}s`
            const isLast = i === sorted.length - 1

            return (
              <div
                key={project.id}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(0,255,255,0.08)',
                  padding: '16px 0',
                  opacity: 0,
                  animation: `revealRow 0.25s ease-out ${delay} forwards`,
                }}
              >
                {/* Index line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div>
                    <span style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(0,255,255,0.35)',
                      letterSpacing: '0.15em',
                      marginRight: 10,
                    }}>
                      {idNum} &gt;
                    </span>
                    <span style={{
                      fontFamily: "'TR2N', sans-serif",
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                      color: '#F0F0F0',
                      letterSpacing: '0.25em',
                    }}>
                      {project.name}
                    </span>
                  </div>
                  {project.active ? (
                    <span style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 10,
                      color: '#FF0000',
                      letterSpacing: '0.1em',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}>
                      ● IN PROGRESS
                    </span>
                  ) : (
                    <span style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(0,255,255,0.5)',
                      letterSpacing: '0.1em',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}>
                      ✓ COMPLETE
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <div style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 12,
                  color: 'rgba(240,240,240,0.55)',
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}>
                  {project.tagline}
                </div>

                {/* Tech stack pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {project.techStack.map((tech) => (
                    <span key={tech} style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 10,
                      border: '1px solid rgba(0,255,255,0.3)',
                      background: 'rgba(0,255,255,0.05)',
                      borderRadius: 3,
                      padding: '2px 8px',
                      color: 'rgba(0,255,255,0.8)',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>

                {/* GitHub link */}
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 11,
                    color: 'rgba(0,255,255,0.4)',
                    textDecoration: 'none',
                    letterSpacing: '0.1em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00FFFF'
                    e.currentTarget.style.textShadow = '0 0 10px #00FFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(0,255,255,0.4)'
                    e.currentTarget.style.textShadow = 'none'
                  }}
                >
                  VIEW ON GITHUB ↗
                </a>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
