import { useState } from 'react'
import useAppState from '../../store/appState'

export default function EnterButton({ onHoverChange }) {
  const setPhase = useAppState((s) => s.setPhase)
  const [hovered, setHovered] = useState(false)

  function handleEnter() {
    setHovered(true)
    onHoverChange?.(true)
  }

  function handleLeave() {
    setHovered(false)
    onHoverChange?.(false)
  }

  return (
    <>
      <style>{`
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255, 0, 0, 0.2), inset 0 0 8px rgba(255, 0, 0, 0.04); border-color: rgba(255, 0, 0, 0.35); }
          50% { box-shadow: 0 0 18px rgba(255, 0, 0, 0.6), inset 0 0 14px rgba(255, 0, 0, 0.1); border-color: rgba(255, 0, 0, 0.7); }
        }
        .enter-btn {
          animation: borderPulse 2s ease-in-out infinite;
        }
        .enter-btn:hover {
          animation: none;
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
      >
        <button
          className="enter-btn"
          onClick={() => setPhase(3)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            background: 'transparent',
            border: `1px solid ${hovered ? '#FF0000' : 'rgba(255, 0, 0, 0.35)'}`,
            color: hovered ? '#FF0000' : 'rgba(255, 0, 0, 0.75)',
            fontFamily: "'TR2N', sans-serif",
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            letterSpacing: '0.35em',
            padding: '1.2rem 3.5rem',
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            textShadow: hovered
              ? '0 0 12px rgba(255, 0, 0, 0.9), 0 0 24px rgba(255, 0, 0, 0.5)'
              : '0 0 8px rgba(255, 0, 0, 0.4)',
            boxShadow: hovered
              ? '0 0 20px rgba(255, 0, 0, 0.6), inset 0 0 16px rgba(255, 0, 0, 0.1)'
              : undefined,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.2s ease, color 0.2s ease, text-shadow 0.2s ease',
            outline: 'none',
          }}
        >
          ENTER THE GRID
        </button>
      </div>
    </>
  )
}
