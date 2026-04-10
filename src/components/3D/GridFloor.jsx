import { Grid } from '@react-three/drei'
import * as THREE from 'three'

export default function GridFloor() {
  return (
    <Grid
      position={[2.5, -3, 2.5]}
      args={[10, 10]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#009999"
      sectionSize={5}
      sectionThickness={1.2}
      sectionColor="#00FFFF"
      fadeDistance={55}
      fadeStrength={2}
      infiniteGrid
      side={THREE.DoubleSide}
    />
  )
}
