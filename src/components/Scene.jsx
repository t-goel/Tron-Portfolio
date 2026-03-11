import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import useAppState from '../store/appState'
import IdentityDisc from './3D/IdentityDisc'

export default function Scene({ onDiscHover }) {
  const phase = useAppState((s) => s.phase)
  const setPhase = useAppState((s) => s.setPhase)

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.5} color="#FF0000" />

      {phase === 2 && (
        <IdentityDisc
          onClick={() => setPhase(3)}
          onHoverChange={onDiscHover}
        />
      )}

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  )
}
