// src/components/3D/NameBackdrop.jsx
import { Text } from '@react-three/drei'
import fontUrl from '../../assets/fonts/Tron-JOAa.ttf'
import { contact } from '../../data/contact'

export default function NameBackdrop() {
  return (
    <>
      <Text
        position={[0, 3, -40]}
        fontSize={3}
        color="#FF0000"
        font={fontUrl}
        anchorX="center"
        anchorY="middle"
      >
        {contact.name}
      </Text>
      <Text
        position={[0, 1.5, -40]}
        fontSize={0.8}
        color="#F0F0F0"
        anchorX="center"
        anchorY="middle"
      >
        {contact.title}
      </Text>
    </>
  )
}
