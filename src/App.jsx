import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import TitleOverlay from './components/UI/TitleOverlay'

function App() {
  const [discHovered, setDiscHovered] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        onPointerMissed={() => setDiscHovered(false)}
      >
        <Scene onDiscHover={setDiscHovered} />
      </Canvas>
      <TitleOverlay glitch={discHovered} />
    </div>
  )
}

export default App
