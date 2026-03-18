import { useState, useEffect, useRef } from 'react'

const GLITCH_CHARS = '0123456789ABCDEF!@#$%^&*01010110'

export default function TitleOverlay({ glitch, visible = true }) {
  const [displayName, setDisplayName] = useState('TANMAY GOEL')
  const glitchInterval = useRef(null)
  const originalName = 'TANMAY GOEL'

  useEffect(() => {
    if (glitch) {
      let tick = 0
      glitchInterval.current = setInterval(() => {
        tick++
        const glitched = originalName
          .split('')
          .map((char) => {
            if (char === ' ') return ' '
            return Math.random() > 0.4
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : char
          })
          .join('')
        setDisplayName(glitched)

        // Snap back after some cycles
        if (tick > 15) {
          setDisplayName(originalName)
          tick = 0
        }
      }, 60)
    } else {
      clearInterval(glitchInterval.current)
      setDisplayName(originalName)
    }
    return () => clearInterval(glitchInterval.current)
  }, [glitch])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease-in',
      }}
    >
      <h1
        style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'TR2N', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#FF0000',
          letterSpacing: '0.3em',
          margin: 0,
          textShadow: '0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.3)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </h1>
      <p
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
          color: '#F0F0F0',
          letterSpacing: '0.5em',
          margin: 0,
          textShadow: '0 0 10px rgba(240, 240, 240, 0.3)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        SOFTWARE DEVELOPER
      </p>
    </div>
  )
}
