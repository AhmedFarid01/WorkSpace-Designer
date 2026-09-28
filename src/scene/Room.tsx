import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { BOOK_COLORS, M } from './materials'
import { CREDENZA, ROOM, SPOTS } from './layout'
import { cane, oceanPrint, rattan } from './textures'
import { tod } from './timeOfDay'
import { useStore } from '../state/store'

const { floorX0, floorX1, floorZ0, floorZ1, wallH, wallT, openingX1 } = ROOM

/** Woven floor lamp in the corner. It switches itself on after sunset so nights feel warm. */
function RattanLamp() {
  const light = useRef<THREE.PointLight>(null)
  const shade = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cane(),
        color: '#f3dcae',
        emissive: '#ffb45e',
        emissiveMap: cane(),
        emissiveIntensity: 0,
        side: THREE.DoubleSide,
        roughness: 0.85,
      }),
    [],
  )
  const bulb = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd9a0', toneMapped: false }), [])
  useFrame(() => {
    const n = tod.night
    shade.emissiveIntensity = n * 1.4
    bulb.color.setRGB(1 + n * 3, 0.85 + n * 2.2, 0.62 + n * 1.2)
    if (light.current) light.current.intensity = n * 3.2
  })
  return (
    <group position={SPOTS.floorLamp}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
          <mesh position={[0, 0.62, 0.1]} rotation={[0.16, 0, 0]} material={M.teak()} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 1.26, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.36, 0]} material={shade} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.42, 28, 1, true]} />
      </mesh>
      <mesh position={[0, 1.3, 0]} material={bulb}>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
      <pointLight ref={light} position={[0, 1.3, 0]} color="#ffc584" distance={7} decay={1.4} />
    </group>
  )
}

export function Room() {
  const hasWhiteboard = useStore((s) => s.extras.whiteboard !== undefined)
  const rug = useMemo(() => new THREE.MeshStandardMaterial({ map: rattan(), roughness: 0.95 }), [])
  const floorW = floorX1 - floorX0
  const floorD = floorZ1 - floorZ0

  return (
    <group>
      {/* Interior floor */}
      <mesh position={[(floorX0 + floorX1) / 2, -0.17, (floorZ0 + floorZ1) / 2]} castShadow receiveShadow material={M.stoneSide()}>
        <boxGeometry args={[floorW, 0.34, floorD]} />
      </mesh>
      <mesh position={[(floorX0 + floorX1) / 2, 0.0005, (floorZ0 + floorZ1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={M.floor()}>
        <planeGeometry args={[floorW, floorD]} />
      </mesh>

      {/* Round rattan rug under the chair */}
      <mesh position={[0.15, 0.004, -0.75]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={rug}>
        <circleGeometry args={[1.25, 64]} />
      </mesh>

      {/* Right wall */}
      <mesh position={[floorX1 + wallT / 2, wallH / 2, (floorZ0 - wallT + floorZ1) / 2]} castShadow receiveShadow material={M.wall()}>
        <boxGeometry args={[wallT, wallH, floorD + wallT]} />
      </mesh>
      {/* Solid part of the back wall */}
      <mesh position={[(openingX1 + floorX1 + wallT) / 2, wallH / 2, floorZ0 - wallT / 2]} castShadow receiveShadow material={M.wall()}>
        <boxGeometry args={[floorX1 + wallT - openingX1, wallH, wallT]} />
      </mesh>
      {/* Teak skirting */}
      <mesh position={[floorX1 - 0.004, 0.04, (floorZ0 + floorZ1) / 2]} material={M.teak()}>
        <boxGeometry args={[0.01, 0.08, floorD]} />
      </mesh>

      {/* Open back wall: teak post, header beam and threshold */}
      <mesh position={[floorX0 + 0.06, 1.3, floorZ0 - 0.06]} castShadow material={M.teak()}>
        <boxGeometry args={[0.12, 2.6, 0.14]} />
      </mesh>
      <mesh position={[(floorX0 + openingX1) / 2, 2.56, floorZ0 - 0.06]} castShadow material={M.teak()}>
        <boxGeometry args={[openingX1 - floorX0, 0.16, 0.16]} />
      </mesh>
      <mesh position={[(floorX0 + openingX1) / 2, 0.012, floorZ0 - 0.06]} material={M.teak()} receiveShadow>
        <boxGeometry args={[openingX1 - floorX0, 0.024, 0.16]} />
      </mesh>
      {/* Floating shelf on the back wall */}
      <group position={[1.95, 1.68, floorZ0 + 0.12]}>
        <mesh castShadow receiveShadow material={M.teak()}>
          <boxGeometry args={[1.0, 0.035, 0.24]} />
        </mesh>
        {BOOK_COLORS.map((c, i) => {
          const h = 0.18 + ((i * 37) % 7) * 0.012
          return (
            <mesh key={c} position={[-0.42 + i * 0.045, 0.0175 + h / 2, 0]} rotation={[0, 0, i === 6 ? 0.18 : 0]} castShadow>
              <boxGeometry args={[0.038, h, 0.16]} />
              <meshStandardMaterial color={c} roughness={0.85} />
            </mesh>
          )
        })}
        <mesh position={[0.1, 0.1, 0]} material={M.ceramic()} castShadow>
          <sphereGeometry args={[0.07, 20, 16]} />
        </mesh>
        <mesh position={[0.1, 0.18, 0]} material={M.ceramic()}>
          <cylinderGeometry args={[0.018, 0.03, 0.06, 16]} />
        </mesh>
        <group position={[0.34, 0.0175, 0]}>
          <mesh position={[0, 0.05, 0]} material={M.terracotta()} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.1, 16]} />
          </mesh>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i) * 0.05, 0.02 - i * 0.03, 0.03 + Math.sin(i) * 0.03]} material={M.leafLight()}>
              <icosahedronGeometry args={[0.035, 0]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Teak credenza with cane doors, against the right wall */}
      <group position={[CREDENZA.x, 0, CREDENZA.z]}>
        <mesh position={[0, CREDENZA.h / 2 + 0.05, 0]} castShadow receiveShadow material={M.teak()}>
          <boxGeometry args={[CREDENZA.depth, CREDENZA.h - 0.1, CREDENZA.len]} />
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[-CREDENZA.depth / 2 - 0.002, CREDENZA.h / 2 + 0.05, k * CREDENZA.len * 0.25]} rotation={[0, -Math.PI / 2, 0]} material={M.cane()}>
            <planeGeometry args={[CREDENZA.len / 2 - 0.08, CREDENZA.h - 0.2]} />
          </mesh>
        ))}
        {[
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ].map(([a, b], i) => (
          <mesh key={i} position={[a * (CREDENZA.depth / 2 - 0.04), 0.05, b * (CREDENZA.len / 2 - 0.05)]} material={M.teak()}>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
          </mesh>
        ))}
        <mesh position={[0, CREDENZA.h - 0.03, 0]} castShadow receiveShadow material={M.teak()}>
          <boxGeometry args={[CREDENZA.depth + 0.02, 0.04, CREDENZA.len + 0.02]} />
        </mesh>
      </group>

      <RattanLamp />

      {/* Wall decor that makes way for the whiteboard */}
      {!hasWhiteboard && (
        <group position={[floorX1 - 0.02, 1.5, CREDENZA.z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[-0.28, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.02, 48]} />
            <meshStandardMaterial map={rattan()} roughness={0.9} />
          </mesh>
          <group position={[0.3, 0.02, 0]}>
            <RoundedBox args={[0.42, 0.54, 0.03]} radius={0.006} material={M.teak()} castShadow />
            <mesh position={[0, 0, 0.016]}>
              <planeGeometry args={[0.36, 0.48]} />
              <meshStandardMaterial map={oceanPrint()} roughness={0.8} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}
