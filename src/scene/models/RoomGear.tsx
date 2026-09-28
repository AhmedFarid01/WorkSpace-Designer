import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { M } from '../materials'
import { grille, marshallFront, whiteboardDoodles } from '../textures'
import { prefersReducedMotion } from '../deskState'

export function TowerFan() {
  const body = useRef<THREE.Group>(null)
  const grilleMat = useMemo(() => new THREE.MeshStandardMaterial({ map: grille('#e9e9e6', '#3a3c40'), roughness: 0.6 }), [])
  useFrame(({ clock }) => {
    if (body.current && !prefersReducedMotion) body.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.7
  })
  return (
    <group>
      <mesh position={[0, 0.015, 0]} material={M.whitePlastic()} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.14, 0.03, 32]} />
      </mesh>
      <group ref={body}>
        <RoundedBox args={[0.12, 0.98, 0.12]} radius={0.05} smoothness={4} position={[0, 0.52, 0]} material={M.whitePlastic()} castShadow />
        <mesh position={[0, 0.5, 0.0605]} material={grilleMat}>
          <planeGeometry args={[0.05, 0.72]} />
        </mesh>
        <mesh position={[0, 1.011, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.greyPlastic()}>
          <circleGeometry args={[0.03, 20]} />
        </mesh>
      </group>
    </group>
  )
}

export function Dehumidifier() {
  const top = useMemo(() => new THREE.MeshStandardMaterial({ map: grille('#d8d9d6', '#8d9095'), roughness: 0.6 }), [])
  return (
    <group>
      <mesh position={[0, 0.22, 0]} material={M.whitePlastic()} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.44, 40]} />
      </mesh>
      <mesh position={[0, 0.441, 0]} rotation={[-Math.PI / 2, 0, 0]} material={top}>
        <circleGeometry args={[0.13, 40]} />
      </mesh>
      <mesh position={[0, 0.36, 0.1405]}>
        <planeGeometry args={[0.05, 0.02]} />
        <meshBasicMaterial color="#8ee6ff" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function AirPurifier() {
  const side = useMemo(() => new THREE.MeshStandardMaterial({ map: grille('#f4f4f1', '#c9cac7'), roughness: 0.5 }), [])
  return (
    <group>
      <mesh position={[0, 0.26, 0]} material={side} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.52, 0.24]} />
      </mesh>
      <mesh position={[0, 0.521, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.greyPlastic()}>
        <circleGeometry args={[0.1, 32]} />
      </mesh>
      <mesh position={[0, 0.44, 0.1205]}>
        <circleGeometry args={[0.02, 20]} />
        <meshBasicMaterial color="#78e08f" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Starlink() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} material={M.whitePlastic()} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.28]} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={M.whitePlastic()} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.45, 12]} />
      </mesh>
      <group position={[0, 0.48, 0]} rotation={[-0.95, 0.5, 0]}>
        <RoundedBox args={[0.51, 0.3, 0.03]} radius={0.012} material={M.whitePlastic()} castShadow receiveShadow />
      </group>
    </group>
  )
}

export function WalkingPad() {
  return (
    <group>
      <RoundedBox args={[0.55, 0.09, 1.3]} radius={0.03} smoothness={3} position={[0, 0.045, 0]} material={M.graphite()} castShadow receiveShadow />
      <mesh position={[0, 0.0915, 0.02]} rotation={[-Math.PI / 2, 0, 0]} material={M.rubber()}>
        <planeGeometry args={[0.44, 1.12]} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.25, 0.092, 0]} material={M.aluminum()}>
          <boxGeometry args={[0.035, 0.004, 1.2]} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, -0.64]} material={M.black()}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
      </mesh>
    </group>
  )
}

export function Whiteboard() {
  const board = useMemo(() => new THREE.MeshStandardMaterial({ map: whiteboardDoodles(), roughness: 0.25 }), [])
  return (
    <group>
      <RoundedBox args={[0.65, 0.95, 0.025]} radius={0.008} material={M.aluminum()} castShadow />
      <mesh position={[0, 0, 0.0131]} material={board}>
        <planeGeometry args={[0.61, 0.91]} />
      </mesh>
      <mesh position={[0, -0.47, 0.03]} material={M.aluminum()}>
        <boxGeometry args={[0.5, 0.012, 0.05]} />
      </mesh>
      {[['#1f6fd1', -0.1], ['#d64545', 0], ['#2b2b2b', 0.1]].map(([c, x]) => (
        <mesh key={c as string} position={[x as number, -0.458, 0.035]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, 0.1, 10]} />
          <meshStandardMaterial color={c as string} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Faces +z by default. */
export function Nespresso() {
  return (
    <group>
      <RoundedBox args={[0.085, 0.2, 0.3]} radius={0.02} smoothness={4} position={[0, 0.1, -0.02]} material={M.red()} castShadow />
      <RoundedBox args={[0.087, 0.03, 0.2]} radius={0.01} position={[0, 0.2, -0.05]} material={M.black()} />
      <mesh position={[0, 0.012, 0.11]} material={M.black()}>
        <boxGeometry args={[0.08, 0.024, 0.1]} />
      </mesh>
      <mesh position={[0, 0.135, 0.132]} material={M.black()}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 0.05, 0.11]} material={M.ceramic()} castShadow>
        <cylinderGeometry args={[0.025, 0.02, 0.05, 18]} />
      </mesh>
    </group>
  )
}

export function MiniFridge() {
  return (
    <group>
      <RoundedBox args={[0.44, 0.5, 0.47]} radius={0.015} position={[0, 0.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8e9297" roughness={0.45} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.25, 0.236]}>
        <planeGeometry args={[0.42, 0.48]} />
        <meshStandardMaterial color="#9a9ea3" roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[0.18, 0.3, 0.24]} material={M.black()}>
        <boxGeometry args={[0.02, 0.16, 0.01]} />
      </mesh>
    </group>
  )
}

export function Speaker() {
  const front = useMemo(() => new THREE.MeshStandardMaterial({ map: marshallFront(), roughness: 0.9 }), [])
  return (
    <group>
      <RoundedBox args={[0.4, 0.31, 0.2]} radius={0.02} position={[0, 0.155, 0]} material={M.blackMatte()} castShadow />
      <mesh position={[0, 0.15, 0.1005]} material={front}>
        <planeGeometry args={[0.37, 0.24]} />
      </mesh>
      {[-0.12, -0.07, -0.02, 0.03, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.315, 0.06]} material={M.brass()}>
          <cylinderGeometry args={[0.011, 0.011, 0.014, 16]} />
        </mesh>
      ))}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.17, 0.005, 0]} material={M.brass()}>
          <boxGeometry args={[0.02, 0.01, 0.16]} />
        </mesh>
      ))}
    </group>
  )
}
