import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import TitleOverlay from './components/UI/TitleOverlay'
import BootSequence from './components/UI/BootSequence'
import useAppState from './store/appState'
import { setMuted } from './utils/audioManager'

function App() {
  const [discHovered, setDiscHovered] = useState(false)
  const [showBoot, setShowBoot] = useState(true)
  const phase = useAppState((s) => s.phase)

  // Subscribe to audioEnabled changes — sync with Howler mute
  useEffect(() => {
    const unsub = useAppState.subscribe(
      (s) => s.audioEnabled,
      (enabled) => setMuted(!enabled)
    )
    return unsub
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {showBoot && <BootSequence onComplete={() => setShowBoot(false)} />}
      {!showBoot && (
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          onPointerMissed={() => setDiscHovered(false)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Scene onDiscHover={setDiscHovered} />
        </Canvas>
      )}
      {phase >= 2 && <TitleOverlay glitch={discHovered} visible={phase === 2} />}
    </div>
  )
}

export default App
