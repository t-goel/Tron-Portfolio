// src/components/3D/Arena.jsx

const ARENA_HALF = 25
const FLOOR_Y    = -3
const WALL_H     = 8
const WALL_THICK = 1
const PILLAR_W   = 2
const PILLAR_H   = 12
const PANEL_W    = 4
const PANEL_H    = 3
const PANEL_GAP  = 0.5
const GLOW_H        = 0.07
const GLOW_PROTRUDE = 0.05

const INNER      = ARENA_HALF * 2 - PILLAR_W * 2 // 46
const N_PANELS   = Math.floor((INNER + PANEL_GAP) / (PANEL_W + PANEL_GAP)) // 10
const PANEL_SPAN = N_PANELS * PANEL_W + (N_PANELS - 1) * PANEL_GAP         // 44.5
const PANEL_START = -PANEL_SPAN / 2        // -22.25

// Y positions in wall-local space (0 = floor level)
const BASE_TOP  = 0.5
const ROW1_CY   = BASE_TOP + PANEL_H / 2
const ROW1_TOP  = BASE_TOP + PANEL_H
const ROW2_CY   = ROW1_TOP + PANEL_GAP + PANEL_H / 2
const WALL_TOP    = WALL_H
const CAP_STRIP_Y = WALL_H - 1      // 7.0 — top panel row upper edge
const CAP_TOP_Y   = WALL_H - GLOW_H // ~7.93 — very top edge of wall

const PANEL_XS = Array.from({ length: N_PANELS }, (_, i) =>
  PANEL_START + i * (PANEL_W + PANEL_GAP) + PANEL_W / 2
)

const PANEL_MAT_PROPS  = { color: '#001a1a', roughness: 0.9 }
const GLOW_MAT_PROPS   = { color: '#00FFFF', toneMapped: false }
const PILLAR_MAT_PROPS = { color: '#002020', roughness: 0.8 }

function WallPanels() {
  return (
    <>
      {/* Continuous base strip */}
      <mesh position={[0, BASE_TOP / 2, 0]}>
        <boxGeometry args={[INNER, BASE_TOP, WALL_THICK]} />
        <meshStandardMaterial {...PANEL_MAT_PROPS} />
      </mesh>

      {/* Bottom panel row */}
      {PANEL_XS.map((x, i) => (
        <mesh key={`b${i}`} position={[x, ROW1_CY, 0]}>
          <boxGeometry args={[PANEL_W, PANEL_H, WALL_THICK * 0.85]} />
          <meshStandardMaterial {...PANEL_MAT_PROPS} />
        </mesh>
      ))}

      {/* Top panel row */}
      {PANEL_XS.map((x, i) => (
        <mesh key={`t${i}`} position={[x, ROW2_CY, 0]}>
          <boxGeometry args={[PANEL_W, PANEL_H, WALL_THICK * 0.85]} />
          <meshStandardMaterial {...PANEL_MAT_PROPS} />
        </mesh>
      ))}

      {/* Horizontal glow strips at panel edges */}
      {[BASE_TOP, ROW1_TOP, CAP_STRIP_Y, CAP_TOP_Y].map((y, i) => (
        <mesh key={`g${i}`} position={[0, y, 0]}>
          <boxGeometry args={[INNER, GLOW_H, WALL_THICK + GLOW_PROTRUDE]} />{/* slight protrusion avoids z-fighting with panel faces */}
          <meshBasicMaterial {...GLOW_MAT_PROPS} />
        </mesh>
      ))}
    </>
  )
}

function CornerPillar({ position }) {
  return (
    <group position={position}>
      {/* Pillar body */}
      <mesh position={[0, PILLAR_H / 2, 0]}>
        <boxGeometry args={[PILLAR_W, PILLAR_H, PILLAR_W]} />
        <meshStandardMaterial {...PILLAR_MAT_PROPS} />
      </mesh>

      {/* Glow cap at very top */}
      <mesh position={[0, PILLAR_H + GLOW_H / 2, 0]}>
        <boxGeometry args={[PILLAR_W + 0.1, GLOW_H * 2, PILLAR_W + 0.1]} />
        <meshBasicMaterial {...GLOW_MAT_PROPS} />
      </mesh>

      {/* Accent ring at wall height */}
      <mesh position={[0, WALL_H, 0]}>
        <boxGeometry args={[PILLAR_W + 0.15, GLOW_H * 1.5, PILLAR_W + 0.15]} />
        <meshBasicMaterial {...GLOW_MAT_PROPS} />
      </mesh>
    </group>
  )
}

export default function Arena() {
  return (
    <group name="arena">
      {/* North wall — z = -ARENA_HALF, panels run along X axis */}
      <group name="wall-north" position={[0, FLOOR_Y, -ARENA_HALF]}>
        <WallPanels />
      </group>

      {/* South wall — z = +ARENA_HALF */}
      <group name="wall-south" position={[0, FLOOR_Y, ARENA_HALF]}>
        <WallPanels />
      </group>

      {/* East wall — x = +ARENA_HALF, rotated 90° so panels run along Z */}
      <group name="wall-east" position={[ARENA_HALF, FLOOR_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <WallPanels />
      </group>

      {/* West wall — x = -ARENA_HALF */}
      <group name="wall-west" position={[-ARENA_HALF, FLOOR_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <WallPanels />
      </group>

      {/* Corner pillars */}
      <CornerPillar position={[-ARENA_HALF, FLOOR_Y, -ARENA_HALF]} />
      <CornerPillar position={[ ARENA_HALF, FLOOR_Y, -ARENA_HALF]} />
      <CornerPillar position={[-ARENA_HALF, FLOOR_Y,  ARENA_HALF]} />
      <CornerPillar position={[ ARENA_HALF, FLOOR_Y,  ARENA_HALF]} />
    </group>
  )
}
