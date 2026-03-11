import { useState, useEffect, useRef } from 'react'

const GLITCH_CHARS = '0123456789ABCDEF!@#$%^&*01010110'

export default function TitleOverlay({ glitch }) {
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <h1
        style={{
          fontFamily: "'TR2N', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#FF0000',
          letterSpacing: '0.3em',
          marginBottom: '12rem',
          textShadow: '0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.3)',
          userSelect: 'none',
        }}
      >
        {displayName}
      </h1>
      <p
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
          color: '#F0F0F0',
          letterSpacing: '0.5em',
          marginTop: '0rem',
          textShadow: '0 0 10px rgba(240, 240, 240, 0.3)',
          userSelect: 'none',
        }}
      >
        SOFTWARE DEVELOPER
      </p>
    </div>
  )
}
