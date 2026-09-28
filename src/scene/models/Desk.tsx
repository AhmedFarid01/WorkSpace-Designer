import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { M } from '../materials'
import { deskState } from '../deskState'

type DeskStyle = {
  top: () => THREE.Material
  column: () => THREE.Material
  inner: () => THREE.Material
  frame: () => THREE.Material
  crank?: boolean
  columnW: number
}

const STYLES: Record<string, DeskStyle> = {
  'desk-electric': { top: M.topBlack, column: M.silverColumn, inner: M.aluminum, frame: M.black, columnW: 0.075 },
  'desk-dual': { top: M.walnut, column: M.black, inner: M.black, frame: M.black, columnW: 0.085 },
  'desk-mech': { top: M.topWhite, column: M.black, inner: M.black, frame: M.black, crank: true, columnW: 0.07 },
}

const T = 0.026
const OUTER_TOP = 0.56
const INNER_BOTTOM = 0.44

export function Desk({ productId, width, depth }: { productId: string; width: number; depth: number }) {
  const style = STYLES[productId] ?? STYLES['desk-electric']
  const top = useRef<THREE.Group>(null)
  const innerCols = useRef<(THREE.Mesh | null)[]>([])
  const legX = width / 2 - 0.12

  useFrame(() => {
    const h = deskState.h
    if (top.current) top.current.position.y = h
    const upper = h - T - 0.03
    const len = upper - INNER_BOTTOM
    for (const m of innerCols.current) {
      if (!m) continue
      m.scale.y = len
      m.position.y = INNER_BOTTOM + len / 2
    }
  })

  return (
    <group>
      {[-1, 1].map((s, i) => (
        <group key={s} position={[s * legX, 0, 0]}>
          <mesh position={[0, 0.018, 0]} castShadow receiveShadow material={style.frame()}>
            <boxGeometry args={[0.07, 0.036, depth * 0.86]} />
          </mesh>
          {[-1, 1].map((f) => (
            <mesh key={f} position={[0, 0.004, f * depth * 0.4]} material={M.rubber()}>
              <cylinderGeometry args={[0.018, 0.02, 0.008, 12]} />
            </mesh>
          ))}
          <mesh position={[0, 0.036 + (OUTER_TOP - 0.036) / 2, 0]} castShadow material={style.column()}>
            <boxGeometry args={[style.columnW, OUTER_TOP - 0.036, style.columnW * 0.72]} />
          </mesh>
          <mesh
            ref={(m) => {
              innerCols.current[i] = m
            }}
            castShadow
            material={style.inner()}
          >
            <boxGeometry args={[style.columnW * 0.82, 1, style.columnW * 0.56]} />
          </mesh>
        </group>
      ))}

      <group ref={top}>
        <RoundedBox args={[width, T, depth]} radius={0.006} smoothness={3} position={[0, -T / 2, 0]} castShadow receiveShadow material={style.top()} />
        {/* Frame under the top */}
        <mesh position={[0, -T - 0.02, -0.04]} castShadow material={style.frame()}>
          <boxGeometry args={[width - 0.26, 0.036, 0.05]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * legX, -T - 0.016, 0]} material={style.frame()}>
            <boxGeometry args={[0.06, 0.03, depth - 0.1]} />
          </mesh>
        ))}
        {style.crank ? (
          <group position={[width / 2 - 0.2, -T - 0.03, depth / 2 - 0.05]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={M.chrome()}>
              <cylinderGeometry args={[0.008, 0.008, 0.08, 10]} />
            </mesh>
            <mesh position={[0.045, -0.035, 0]} material={M.black()}>
              <boxGeometry args={[0.012, 0.075, 0.016]} />
            </mesh>
            <mesh position={[0.045, -0.075, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={M.black()}>
              <cylinderGeometry args={[0.01, 0.01, 0.045, 10]} />
            </mesh>
          </group>
        ) : (
          <group position={[width / 2 - 0.28, -T - 0.012, depth / 2 - 0.03]}>
            <mesh material={M.blackMatte()}>
              <boxGeometry args={[0.12, 0.02, 0.05]} />
            </mesh>
            <mesh position={[-0.02, 0, 0.0255]}>
              <planeGeometry args={[0.03, 0.01]} />
              <meshBasicMaterial color="#6fe3ff" toneMapped={false} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}
