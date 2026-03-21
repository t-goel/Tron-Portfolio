// src/components/3D/NameBackdrop.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import fontUrl from '../../assets/fonts/Tron-JOAa.ttf'
import { contact } from '../../data/contact'
import useAppState from '../../store/appState'

const dimColor = new THREE.Color('#00CCCC')
const brightColor = new THREE.Color('#00FFFF')

export default function NameBackdrop() {
  const phase = useAppState((s) => s.phase)
  const textRef = useRef()
  const lightRef = useRef()
  const flickerValue = useRef(1)
  const flickerTarget = useRef(1)
  const timeToNextJump = useRef(0)

  useFrame((_, delta) => {
    if (phase !== 2) return

    timeToNextJump.current -= delta
    if (timeToNextJump.current <= 0) {
      flickerTarget.current = Math.random()
      timeToNextJump.current = 0.08 + Math.random() * 0.12
    }

    flickerValue.current =
      flickerValue.current +
      (flickerTarget.current - flickerValue.current) * (1 - Math.exp(-8 * delta))

    if (textRef.current?.material?.color) {
      textRef.current.material.color.lerpColors(dimColor, brightColor, flickerValue.current)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + flickerValue.current * 2.5
    }
  })

  return (
    <>
      <Text
        ref={textRef}
        position={[0, 3, -40]}
        fontSize={3}
        color="#00FFFF"
        font={fontUrl}
        anchorX="center"
        anchorY="middle"
      >
        {contact.name}
      </Text>
      <Text
        position={[0, -0.5, -40]}
        fontSize={0.8}
        color="#F0F0F0"
        anchorX="center"
        anchorY="middle"
      >
        {contact.title}
      </Text>
      <pointLight ref={lightRef} color="#00FFFF" position={[0, 3, -38]} />
    </>
  )
}
