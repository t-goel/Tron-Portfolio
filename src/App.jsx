import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import BootSequence from './components/UI/BootSequence'
import SocialIcons from './components/UI/SocialIcons'
import MuteToggle from './components/UI/MuteToggle'
import ProjectsSector from './components/UI/ProjectsSector'
import AboutSector from './components/UI/AboutSector'
import SkillsSector from './components/UI/SkillsSector'
import MobileGateway from './components/UI/MobileGateway'
import GridAffordanceHint from './components/UI/GridAffordanceHint'
import useAppState from './store/appState'
import { setMuted } from './utils/audioManager'
import { detectWebGL } from './utils/webglDetect'
import WebGLFallback from './components/WebGLFallback'
import { useMobile } from './hooks/useMobile'

function App() {
  const webglAvailable = useMemo(() => detectWebGL(), [])
  const isMobile = useMobile()
  const [showBoot, setShowBoot] = useState(true)
  const [mainVisible, setMainVisible] = useState(false)
  const phase = useAppState((s) => s.phase)
  const hudVisible = useAppState((s) => s.hudVisible)
  const setHudVisible = useAppState((s) => s.setHudVisible)
  const activeSector = useAppState((s) => s.activeSector)
  const audioEnabled = useAppState((s) => s.audioEnabled)

  // Sync audioEnabled → Howler mute
  useEffect(() => {
    setMuted(!audioEnabled)
  }, [audioEnabled])

  // NAV-04: ESC exits any active sector back to grid
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && useAppState.getState().activeSector !== null) {
        useAppState.getState().setActiveSector(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show HUD when phase transitions to 3
  useEffect(() => {
    if (phase !== 3) return
    const timer = setTimeout(() => setHudVisible(true), 400)
    return () => clearTimeout(timer)
  }, [phase, setHudVisible])

  function handleBootComplete() {
    setShowBoot(false)
    // Brief black pause before fading in the main scene
    setTimeout(() => setMainVisible(true), 350)
  }

  if (!webglAvailable) {
    return <WebGLFallback />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {showBoot && <BootSequence onComplete={handleBootComplete} />}
      <Canvas
        frameloop={showBoot ? 'never' : 'always'}
        camera={{ position: [0, 8, 14], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Scene mainVisible={mainVisible} />
      </Canvas>
      {/* Sector overlays — mounted outside Canvas */}
      {activeSector === 'projects' && <ProjectsSector />}
      {activeSector === 'about' && <AboutSector />}
      {activeSector === 'skills' && <SkillsSector />}
      {isMobile && phase >= 3 && hudVisible && !activeSector && <MobileGateway />}
      {hudVisible && !activeSector && <GridAffordanceHint />}

      {/* HUD home button: icon-only, top-left, only visible inside a sector */}
      {hudVisible && activeSector && (
        <button
          aria-label="Return to grid"
          onClick={() => useAppState.getState().setActiveSector(null)}
          style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
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
            zIndex: 40,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 14px #00FFFF' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 8px #00FFFF' }}
        >
          {/* House icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>
      )}

      {/* HUD controls: mute toggle bottom-left, social icons bottom-right */}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 20,
          }}
        >
          <MuteToggle />
        </div>
      )}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 20,
          }}
        >
          <SocialIcons />
        </div>
      )}

      {/* Black fade-in overlay: sits on top until mainVisible, then fades out */}
      {!showBoot && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            zIndex: 40,
            opacity: mainVisible ? 0 : 1,
            transition: 'opacity 1.2s ease-in',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

export default App
