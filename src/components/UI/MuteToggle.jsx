import useAppState from '../../store/appState'

export default function MuteToggle() {
  const audioEnabled = useAppState((s) => s.audioEnabled)
  const toggleAudio = useAppState((s) => s.toggleAudio)

  return (
    <button
      onClick={toggleAudio}
      aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
      style={{
        background: 'transparent',
        border: '1px solid #00FFFF',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 8px #00FFFF',
        color: '#00FFFF',
        padding: 0,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 14px #00FFFF' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 8px #00FFFF' }}
    >
      {audioEnabled ? (
        /* Heroicons speaker-wave (outline, 24x24 viewBox, rendered at 20x20) */
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ) : (
        /* Heroicons speaker-x-mark (outline, 24x24 viewBox, rendered at 20x20) */
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      )}
    </button>
  )
}
