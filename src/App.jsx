import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
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
  const phase = useAppState((s) => s.phase)
  const hudVisible = useAppState((s) => s.hudVisible)
  const setHudVisible = useAppState((s) => s.setHudVisible)
  const audioEnabled = useAppState((s) => s.audioEnabled)

  // Sync audioEnabled → Howler mute
  useEffect(() => {
    setMuted(!audioEnabled)
  }, [audioEnabled])

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
        frameloop="always"
        camera={{ position: [0, 8, 14], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Scene mainVisible={mainVisible} />
      </Canvas>
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
