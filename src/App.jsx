import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import TitleOverlay from './components/UI/TitleOverlay'
import EnterButton from './components/UI/EnterButton'
import BootSequence from './components/UI/BootSequence'
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

  // Subscribe to audioEnabled changes — sync with Howler mute
  useEffect(() => {
    const unsub = useAppState.subscribe(
      (s) => s.audioEnabled,
      (enabled) => setMuted(!enabled)
    )
    return unsub
  }, [])

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
      {!showBoot && phase >= 2 && <TitleOverlay visible={phase === 2} glitch={titleGlitch} />}
      {!showBoot && phase === 2 && <EnterButton onHoverChange={setTitleGlitch} />}
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
