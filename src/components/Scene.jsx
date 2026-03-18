import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.5} color="#FF0000" />

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
