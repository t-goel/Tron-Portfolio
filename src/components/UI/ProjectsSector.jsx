import { useState, useEffect } from 'react'
import { projects } from '../../data/projects'

export default function ProjectsSector() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    // Outer backdrop: pointerEvents:'none' so pointer events pass through to R3F canvas
    // enabling Monolith onPointerEnter/onPointerLeave hover detection
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-in',
      }}
    >
      {/* Inner content wrapper: pointerEvents:'auto' re-enables interaction for cards/links */}
      <div
        style={{
          pointerEvents: 'auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100%',
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '32px 16px',
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                position: 'relative',
                marginBottom: 24,
                paddingLeft: 16,
                borderLeft: `2px solid ${project.active ? '#FF0000' : '#FF5E00'}`,
              }}
            >
              {/* IN PROGRESS badge — only for active projects */}
              {project.active && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    fontSize: 14,
                    fontFamily: "'Roboto Mono', monospace",
                    border: '1px solid #FF0000',
                    background: 'rgba(255,0,0,0.15)',
                    color: '#FF0000',
                    padding: '4px 8px',
                    borderRadius: 4,
                  }}
                >
                  IN PROGRESS
                </div>
              )}

              {/* Project name */}
              <div
                style={{
                  fontFamily: "'TR2N', sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  color: '#F0F0F0',
                  letterSpacing: '0.3em',
                  lineHeight: 1.2,
                }}
              >
                {project.name}
              </div>

              {/* Tagline */}
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
                  color: 'rgba(240,240,240,0.8)',
                  marginTop: 8,
                }}
              >
                {project.tagline}
              </div>

              {/* Tech stack pills */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: 14,
                      fontFamily: "'Roboto Mono', monospace",
                      border: '1px solid rgba(0,255,255,0.4)',
                      background: 'rgba(0,255,255,0.08)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      color: '#00FFFF',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* VIEW ON GITHUB link */}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 16,
                  fontFamily: "'TR2N', sans-serif",
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  letterSpacing: '0.35em',
                  color: 'rgba(0,255,255,0.7)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00FFFF'
                  e.currentTarget.style.textShadow = '0 0 10px #00FFFF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(0,255,255,0.7)'
                  e.currentTarget.style.textShadow = 'none'
                }}
              >
                VIEW ON GITHUB ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
