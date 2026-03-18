import { useState, useEffect, useRef } from 'react'

const GLITCH_CHARS = '0123456789ABCDEF!@#$%^&*01010110'

export default function TitleOverlay({ glitch, visible = true, children }) {
  const [displayName, setDisplayName] = useState('TANMAY GOEL')
  const glitchInterval = useRef(null)
  const originalName = 'TANMAY GOEL'

  useEffect(() => {
    let timeoutId = null
    let activeGlitchInterval = null

    const triggerOccasionalGlitch = () => {
      let tick = 0
      const durationTicks = Math.floor(1500 / 60) // 1.5 seconds

      activeGlitchInterval = setInterval(() => {
        tick++
        if (tick <= durationTicks) {
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
        } else {
          setDisplayName(originalName)
          clearInterval(activeGlitchInterval)

          // Queue up the next random glitch between 2 and 4 seconds from now
          const nextGlitchDelay = 2000 + Math.random() * 2000
          timeoutId = setTimeout(triggerOccasionalGlitch, nextGlitchDelay)
        }
      }, 60)
    }

    if (glitch) {
      // Start the occasional glitch cycle
      const initialDelay = 500 + Math.random() * 1000
      timeoutId = setTimeout(triggerOccasionalGlitch, initialDelay)
    } else {
      setDisplayName(originalName)
    }

    return () => {
      clearTimeout(timeoutId)
      clearInterval(activeGlitchInterval)
    }
  }, [glitch])

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        pointerEvents: 'none',
        zIndex: 10,
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease-in',
      }}
    >
      <h1
        style={{
          fontFamily: "'TR2N', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#FFE8E8',
          letterSpacing: '0.3em',
          margin: 0,
          textShadow:
            '0 0 3px #fff, 0 0 6px #fff, 0 0 15px #FF0000, 0 0 30px #FF0000, 0 0 50px #FF0000, 0 0 80px #FF0000, 0 0 100px #FF0000',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </h1>
      <p
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
          color: 'rgba(240, 240, 240, 1)',
          letterSpacing: '0.5em',
          margin: 0,
          marginTop: '1.5rem',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        SOFTWARE DEVELOPER
      </p>
      <div
        style={{
          marginTop: '2rem',
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
