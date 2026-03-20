import { useState, useEffect, useRef } from 'react'
import { playWithFade, initAudio } from '../../utils/audioManager'
import useAppState from '../../store/appState'

const BOOT_LINES = [
  'GRID OS v7.2.1 — INITIALIZING...',
  'Loading kernel modules...',
  'Mounting /dev/grid0 ... [OK]',
  'Calibrating light cycle array...',
  'Authenticating user identity...',
  'Neural bridge established.',
  'Welcome to the Grid.',
]

export default function BootSequence({ onComplete }) {
  const setPhase = useAppState((s) => s.setPhase)
  const [fadingOut, setFadingOut] = useState(false)
  const audioInitialized = useRef(false)

  useEffect(() => {
    if (!audioInitialized.current) {
      audioInitialized.current = true
      const sound = initAudio()
      if (sound) {
        sound.on('playerror', () => {
          document.addEventListener('click', () => playWithFade(2000), { once: true })
        })
      }
    }

    const t1 = setTimeout(() => {
      playWithFade(2000)
      setPhase(2)
    }, 800)

    const t2 = setTimeout(() => setFadingOut(true), 2500)

    const t3 = setTimeout(() => {
      if (onComplete) onComplete()
    }, 3000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete, setPhase])

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        background: '#000',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '0 16px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            style={{
              opacity: 0,
              animation: 'bootLineIn 0.3s ease forwards',
              animationDelay: `${i * 0.25}s`,
              fontFamily: "'Roboto Mono', monospace",
              color: '#00FFFF',
              fontSize: '0.75rem',
              lineHeight: '1.8',
              letterSpacing: '0.05em',
              textShadow: '0 0 6px #00FFFF',
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
