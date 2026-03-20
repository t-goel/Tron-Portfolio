import { useState, useEffect } from 'react'

const SESSION_KEY = 'grid_hint_shown'

export default function GridAffordanceHint() {
  const [visible, setVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    setVisible(true)

    const fadeTimer = setTimeout(() => setFadingOut(true), 3000)
    const hideTimer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(false)
    }, 3600)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        fontFamily: "'Roboto Mono', monospace",
        color: '#00FFFF',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        textShadow: '0 0 8px #00FFFF',
      }}
    >
      Click and drag to explore
    </div>
  )
}
