import { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import Scene from './components/Scene'
import TitleOverlay from './components/UI/TitleOverlay'
import EnterButton from './components/UI/EnterButton'
import BootSequence from './components/UI/BootSequence'
import SocialIcons from './components/UI/SocialIcons'
import MuteToggle from './components/UI/MuteToggle'
import useAppState from './store/appState'
import { setMuted } from './utils/audioManager'
import { detectWebGL } from './utils/webglDetect'
import WebGLFallback from './components/WebGLFallback'

function App() {
  const webglAvailable = useMemo(() => detectWebGL(), [])
  const [showBoot, setShowBoot] = useState(true)
  const [mainVisible, setMainVisible] = useState(false)
  const [titleGlitch, setTitleGlitch] = useState(false)
  const phase = useAppState((s) => s.phase)
  const hudVisible = useAppState((s) => s.hudVisible)
  const setHudVisible = useAppState((s) => s.setHudVisible)
  const setPhase = useAppState((s) => s.setPhase)
  const domDiscRef = useRef(null)

  // Subscribe to audioEnabled changes — sync with Howler mute
  useEffect(() => {
    const unsub = useAppState.subscribe(
      (s) => s.audioEnabled,
      (enabled) => setMuted(!enabled)
    )
    return unsub
  }, [])

  // GSAP dock animation: fires when phase transitions to 3
  useEffect(() => {
    if (phase !== 3 || !domDiscRef.current) return
    const tween = gsap.to(domDiscRef.current, {
      top: '24px',
      left: '24px',
      xPercent: 0,
      yPercent: 0,
      scale: 0.35,
      duration: 1.2,
      ease: 'power2.inOut',
      delay: 0.05,
      onComplete: () => {
        setHudVisible(true)
      },
    })
    return () => tween.kill()
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
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Scene />
      </Canvas>
      {!showBoot && phase >= 2 && (
        <TitleOverlay visible={phase === 2} glitch={titleGlitch}>
          {phase === 2 && <EnterButton onHoverChange={setTitleGlitch} />}
        </TitleOverlay>
      )}

      {/* DOM disc: visible during dock animation (phase 3 before HUD appears) */}
      {phase >= 3 && !hudVisible && (
        <div
          ref={domDiscRef}
          style={{
            position: 'fixed',
            top: 'calc(50vh - 60px)',
            left: 'calc(50vw - 60px)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '3px solid var(--crimson-red)',
            boxShadow: '0 0 15px var(--crimson-red), 0 0 40px rgba(255,0,0,0.4)',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* HUD home button: spinning disc + name at top-left */}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 20,
            cursor: 'pointer',
          }}
          onClick={() => { setPhase(2); setHudVisible(false); }}
        >
          <div className="hud-disc" />
          <span
            style={{
              fontFamily: "'TR2N', sans-serif",
              color: 'var(--crimson-red)',
              fontSize: '0.9rem',
              letterSpacing: '0.3em',
              pointerEvents: 'none',
            }}
          >
            TANMAY GOEL
          </span>
        </div>
      )}

      {/* HUD controls: mute toggle + social icons at bottom-right */}
      {hudVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            zIndex: 20,
          }}
        >
          <MuteToggle />
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
