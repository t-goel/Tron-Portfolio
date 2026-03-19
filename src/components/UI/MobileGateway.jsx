import useAppState from '../../store/appState'

const CARDS = [
  { label: '>_ PROJECTS', sector: 'projects' },
  { label: '>_ ABOUT_ME', sector: 'about' },
  { label: '>_ SKILLS', sector: 'skills' },
]

export default function MobileGateway() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 25,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        padding: '32px 16px',
        background: '#000',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,255,255,0.08) 39px, rgba(0,255,255,0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,255,0.08) 39px, rgba(0,255,255,0.08) 40px)',
      }}
    >
      {CARDS.map(({ label, sector }) => (
        <div
          key={sector}
          onClick={() => useAppState.getState().setActiveSector(sector)}
          style={{
            border: '1px solid rgba(0,255,255,0.4)',
            background: 'rgba(0,255,255,0.05)',
            padding: '24px 16px',
            minHeight: 120,
            width: '100%',
            maxWidth: 400,
            cursor: 'pointer',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'TR2N', sans-serif",
              fontSize: 'clamp(1.2rem, 5vw, 2rem)',
              color: '#00FFFF',
              letterSpacing: '0.35em',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
