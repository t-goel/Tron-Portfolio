import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import useAppState from '../store/appState'
import GridFloor from './3D/GridFloor'
import GatewayPanes from './3D/GatewayPanes'

export default function Scene() {
  const phase = useAppState((s) => s.phase)

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.5} color="#FF0000" />

      {phase >= 3 && <GridFloor />}
      {phase >= 3 && <GatewayPanes />}
      {phase >= 3 && (
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={6}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
          target={[0, 1, 0]}
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
