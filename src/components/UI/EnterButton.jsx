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
          0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.3), inset 0 0 5px rgba(255, 0, 0, 0.1); 
            border-color: rgba(255, 0, 0, 0.5); 
            color: rgba(255, 136, 136, 0.85);
            text-shadow: 0 0 6px rgba(255, 0, 0, 0.6), 0 0 12px rgba(255, 0, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.6), inset 0 0 10px rgba(255, 0, 0, 0.2); 
            border-color: rgba(255, 0, 0, 0.8); 
            color: #FF8888;
            text-shadow: 0 0 10px rgba(255, 0, 0, 0.9), 0 0 18px rgba(255, 0, 0, 0.5);
          }
        }
        .enter-btn {
          animation: borderPulse 2s ease-in-out infinite;
        }
      `}</style>
      <button
        className="enter-btn"
        onClick={() => setPhase(3)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          background: 'transparent',
          color: hovered ? '#FFFFFF' : 'rgba(255, 0, 0, 0.75)',
          fontFamily: "'TR2N', sans-serif",
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          letterSpacing: '0.35em',
          padding: '1.2rem 3.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textShadow: hovered
            ? '0 0 5px #FFF, 0 0 15px #FF0000, 0 0 30px #FF0000'
            : undefined,
          transform: 'scale(1)',
          transition: 'transform 0.2s ease, color 0.2s ease, text-shadow 0.2s ease',
          outline: 'none',
          border: '2px solid transparent', // Let animation handle border color
        }}
      >
        ENTER THE GRID
      </button>
    </>
  )
}
