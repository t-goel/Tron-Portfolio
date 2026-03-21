// src/components/Scene.jsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import useAppState from '../store/appState'
import GridFloor from './3D/GridFloor'
import GatewayPanes from './3D/GatewayPanes'
import CameraController from './3D/CameraController'
import Monolith from './3D/Monolith'
import NameBackdrop from './3D/NameBackdrop'
import CinematicIntro from './3D/CinematicIntro'
import { projects } from '../data/projects'
import { useMobile } from '../hooks/useMobile'

export default function Scene({ mainVisible }) {
  const phase = useAppState((s) => s.phase)
  const activeSector = useAppState((s) => s.activeSector)
  const isMobile = useMobile()

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.5} color="#FF0000" />

      {phase >= 2 && <NameBackdrop />}
      {phase === 2 && mainVisible && <CinematicIntro />}

      {phase >= 3 && <CameraController />}
      {phase >= 2 && <GridFloor />}
      {phase >= 3 && !isMobile && <GatewayPanes />}
      {activeSector === 'projects' && projects.map((p) => (
        <Monolith
          key={p.id}
          position={p.position}
          accentColor={p.active ? '#FF0000' : '#FF5E00'}
          active={p.active}
          name={p.name}
        />
      ))}

      {phase >= 3 && !activeSector && !isMobile && (
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
