import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { M } from '../materials'
import { hueGradient, keyboardKeys, screen } from '../textures'
import { tod } from '../timeOfDay'
import { prefersReducedMotion } from '../deskState'

export function Keyboard({ kind }: { kind: 'mx' | 'magic' }) {
  const keys = useMemo(() => new THREE.MeshStandardMaterial({ map: keyboardKeys(kind), roughness: 0.6 }), [kind])
  if (kind === 'mx') {
    return (
      <group rotation={[0.05, 0, 0]}>
        <RoundedBox args={[0.43, 0.02, 0.13]} radius={0.008} position={[0, 0.011, 0]} material={M.graphite()} castShadow receiveShadow />
        <mesh position={[0, 0.0215, 0.004]} rotation={[-Math.PI / 2, 0, 0]} material={keys}>
          <planeGeometry args={[0.415, 0.115]} />
        </mesh>
      </group>
    )
  }
  return (
    <group rotation={[0.04, 0, 0]}>
      <RoundedBox args={[0.42, 0.01, 0.115]} radius={0.004} position={[0, 0.006, 0]} material={M.aluminum()} castShadow receiveShadow />
      <mesh position={[0, 0.0112, 0.002]} rotation={[-Math.PI / 2, 0, 0]} material={keys}>
        <planeGeometry args={[0.405, 0.105]} />
      </mesh>
    </group>
  )
}

export function Mouse({ kind }: { kind: 'mx' | 'magic' }) {
  if (kind === 'mx') {
    return (
      <group>
        <mesh position={[0, 0.02, 0]} scale={[0.042, 0.024, 0.062]} material={M.graphite()} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        <mesh position={[-0.03, 0.012, 0.005]} scale={[0.018, 0.012, 0.04]} material={M.black()}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <mesh position={[0, 0.043, -0.022]} rotation={[0, 0, Math.PI / 2]} material={M.aluminum()}>
          <cylinderGeometry args={[0.009, 0.009, 0.012, 16]} />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh position={[0, 0.004, 0]} scale={[0.03, 0.004, 0.057]} material={M.whitePlastic()}>
        <sphereGeometry args={[1, 20, 10]} />
      </mesh>
      <mesh position={[0, 0.009, 0]} scale={[0.028, 0.011, 0.056]} material={M.black()} castShadow>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
}

export function Trackpad() {
  return (
    <group rotation={[0.03, 0, 0]}>
      <RoundedBox args={[0.16, 0.007, 0.115]} radius={0.003} position={[0, 0.004, 0]} material={M.black()} castShadow receiveShadow />
    </group>
  )
}

export function MousePad() {
  return <RoundedBox args={[0.25, 0.003, 0.2]} radius={0.0012} position={[0, 0.0015, 0]} material={M.blackMatte()} receiveShadow />
}

const LAPTOP_COLORS: Record<string, string> = {
  silver: '#d6d8dc',
  blush: '#e7bdb6',
  citrus: '#dcdc78',
  indigo: '#4d56a4',
}

export function Laptop({ color = 'silver' }: { color?: string }) {
  const body = useMemo(
    () => new THREE.MeshStandardMaterial({ color: LAPTOP_COLORS[color] ?? LAPTOP_COLORS.silver, metalness: 0.7, roughness: 0.35 }),
    [color],
  )
  const screenMat = useMemo(() => {
    const t = screen('mac')
    return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 0.8, toneMapped: false, roughness: 0.2 })
  }, [])
  const keys = useMemo(() => new THREE.MeshStandardMaterial({ map: keyboardKeys('mx'), roughness: 0.7 }), [])
  useFrame(() => {
    screenMat.emissiveIntensity = 0.5 + tod.night * 0.8
    screenMat.color.setScalar(0.45 * (1 - tod.night) + 0.05)
  })
  return (
    <group>
      <RoundedBox args={[0.3, 0.012, 0.21]} radius={0.005} position={[0, 0.006, 0]} material={body} castShadow receiveShadow />
      <mesh position={[0, 0.0122, -0.03]} rotation={[-Math.PI / 2, 0, 0]} material={keys}>
        <planeGeometry args={[0.26, 0.095]} />
      </mesh>
      <mesh position={[0, 0.0122, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.11, 0.07]} />
        <meshStandardMaterial color={LAPTOP_COLORS[color] ?? LAPTOP_COLORS.silver} metalness={0.5} roughness={0.25} />
      </mesh>
      <group position={[0, 0.012, -0.103]} rotation={[-0.3, 0, 0]}>
        <RoundedBox args={[0.3, 0.2, 0.006]} radius={0.0028} position={[0, 0.1, -0.003]} material={body} castShadow />
        <mesh position={[0, 0.101, 0.0004]}>
          <planeGeometry args={[0.292, 0.192]} />
          <meshStandardMaterial color="#0b0c0e" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.102, 0.0008]} material={screenMat}>
          <planeGeometry args={[0.278, 0.178]} />
        </mesh>
      </group>
    </group>
  )
}

export function LaptopStand({ children }: { children?: React.ReactNode }) {
  return (
    <group>
      <mesh position={[0, 0.004, 0]} material={M.black()} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.008, 0.2]} />
      </mesh>
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.1, 0, 0]}>
          <mesh position={[0, 0.07, 0.02]} rotation={[-0.75, 0, 0]} material={M.black()} castShadow>
            <boxGeometry args={[0.012, 0.18, 0.02]} />
          </mesh>
          <mesh position={[0, 0.1, -0.03]} rotation={[0.55, 0, 0]} material={M.black()}>
            <boxGeometry args={[0.012, 0.13, 0.018]} />
          </mesh>
        </group>
      ))}
      <group position={[0, 0.15, 0]} rotation={[0.32, 0, 0]}>
        <mesh material={M.black()} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.006, 0.22]} />
        </mesh>
        <mesh position={[0, 0.012, 0.11]} material={M.black()}>
          <boxGeometry args={[0.24, 0.018, 0.008]} />
        </mesh>
        <group position={[0, 0.004, 0]}>{children}</group>
      </group>
    </group>
  )
}

export function MacMini() {
  return (
    <group>
      <RoundedBox args={[0.127, 0.05, 0.127]} radius={0.014} smoothness={4} position={[0, 0.025, 0]} material={M.aluminum()} castShadow receiveShadow />
      {[-0.03, -0.018].map((x) => (
        <mesh key={x} position={[x, 0.024, 0.0637]} material={M.black()}>
          <boxGeometry args={[0.006, 0.012, 0.001]} />
        </mesh>
      ))}
      <mesh position={[0.045, 0.025, 0.0637]}>
        <planeGeometry args={[0.003, 0.003]} />
        <meshBasicMaterial color="#b6ffcf" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function MonitorRiser({ width = 0.56 }: { width?: number }) {
  return (
    <group>
      <mesh position={[0, 0.008, 0]} material={M.black()} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.016, 0.2]} />
      </mesh>
      <mesh position={[0, 0.06, 0]} material={M.black()} castShadow>
        <boxGeometry args={[0.07, 0.09, 0.05]} />
      </mesh>
      <RoundedBox args={[width, 0.014, 0.24]} radius={0.004} position={[0, 0.113, 0]} material={M.black()} castShadow receiveShadow />
    </group>
  )
}

function useGlow(min: number, max: number) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff4dd', emissive: '#ffe2b0', emissiveIntensity: min, toneMapped: false }), [min])
  useFrame(() => {
    mat.emissiveIntensity = THREE.MathUtils.lerp(min, max, tod.night)
  })
  return mat
}

export function LightBar({ width = 0.45 }: { width?: number }) {
  const glow = useGlow(0.6, 5)
  return (
    <group>
      <mesh position={[0, 0.012, 0.02]} rotation={[0, 0, Math.PI / 2]} material={M.black()} castShadow>
        <cylinderGeometry args={[0.012, 0.012, width, 16]} />
      </mesh>
      <mesh position={[0, 0.0005, 0.026]} rotation={[Math.PI / 2 + 0.5, 0, 0]} material={glow}>
        <planeGeometry args={[width - 0.02, 0.008]} />
      </mesh>
      <mesh position={[0, -0.005, -0.012]} material={M.black()}>
        <boxGeometry args={[0.04, 0.03, 0.05]} />
      </mesh>
      <mesh position={[0, -0.03, -0.04]} material={M.black()}>
        <boxGeometry args={[0.035, 0.04, 0.012]} />
      </mesh>
    </group>
  )
}

export function Webcam() {
  return (
    <group>
      <RoundedBox args={[0.1, 0.028, 0.03]} radius={0.012} position={[0, 0.02, 0.01]} material={M.black()} castShadow />
      <mesh position={[0, 0.02, 0.026]} rotation={[Math.PI / 2, 0, 0]} material={M.glassDark()}>
        <cylinderGeometry args={[0.009, 0.009, 0.004, 20]} />
      </mesh>
      <mesh position={[0, 0.003, -0.01]} material={M.black()}>
        <boxGeometry args={[0.03, 0.008, 0.05]} />
      </mesh>
    </group>
  )
}

function MicBody() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.black()} castShadow>
        <cylinderGeometry args={[0.028, 0.026, 0.15, 20]} />
      </mesh>
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={M.graphite()}>
        <cylinderGeometry args={[0.031, 0.031, 0.04, 20]} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={M.blackMatte()}>
        <circleGeometry args={[0.029, 20]} />
      </mesh>
    </group>
  )
}

export function MicTripod() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
          <mesh position={[0, 0.04, 0.04]} rotation={[0.9, 0, 0]} material={M.black()}>
            <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.11, 0]} material={M.black()}>
        <cylinderGeometry args={[0.007, 0.007, 0.08, 10]} />
      </mesh>
      <group position={[0, 0.17, 0]} rotation={[0.35, 0, 0]}>
        <MicBody />
      </group>
    </group>
  )
}

export function BoomArm({ withMic }: { withMic: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} material={M.black()} castShadow>
        <boxGeometry args={[0.06, 0.03, 0.08]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} material={M.black()}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 10]} />
      </mesh>
      <group position={[0, 0.19, 0]} rotation={[-0.85, 0, 0]}>
        <mesh position={[0, 0.2, 0]} material={M.black()} castShadow>
          <boxGeometry args={[0.02, 0.4, 0.025]} />
        </mesh>
        <group position={[0, 0.4, 0]} rotation={[2.05, 0, 0]}>
          <mesh position={[0, 0.17, 0]} material={M.black()} castShadow>
            <boxGeometry args={[0.018, 0.34, 0.022]} />
          </mesh>
          {withMic && (
            <group position={[0, 0.38, 0.02]} rotation={[-1.9, 0, 0]}>
              <MicBody />
            </group>
          )}
        </group>
      </group>
    </group>
  )
}

export function Headphones() {
  return (
    <group rotation={[0, 0.4, 0]}>
      <mesh position={[0, 0.018, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.graphite()} castShadow>
        <torusGeometry args={[0.085, 0.008, 10, 32, Math.PI]} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.085, 0.022, 0.005]} rotation={[0, 0, Math.PI / 2]} material={M.fabric()} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.035, 20]} />
        </mesh>
      ))}
    </group>
  )
}

export function Dock() {
  return (
    <group>
      <RoundedBox args={[0.12, 0.022, 0.075]} radius={0.006} position={[0, 0.011, 0]} material={M.graphite()} castShadow />
      <mesh position={[0.045, 0.012, 0.0376]}>
        <planeGeometry args={[0.004, 0.004]} />
        <meshBasicMaterial color="#6fd3ff" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function PowerStrip() {
  const cable = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, 0.02, 0),
      new THREE.Vector3(0.3, 0.03, -0.05),
      new THREE.Vector3(0.36, 0.3, -0.06),
      new THREE.Vector3(0.34, 0.6, -0.02),
    ])
    return new THREE.TubeGeometry(curve, 24, 0.004, 6)
  }, [])
  return (
    <group>
      <RoundedBox args={[0.3, 0.035, 0.065]} radius={0.01} position={[0, 0.0175, 0]} material={M.black()} castShadow />
      {[-0.08, 0, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.0355, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.rubber()}>
          <circleGeometry args={[0.018, 16]} />
        </mesh>
      ))}
      <mesh geometry={cable} material={M.black()} />
    </group>
  )
}

export function CoffeeCup() {
  const steam = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!steam.current || prefersReducedMotion) return
    const t = clock.elapsedTime
    steam.current.children.forEach((c, i) => {
      const p = (t * 0.35 + i / 3) % 1
      c.position.y = 0.08 + p * 0.12
      c.position.x = Math.sin(t * 1.5 + i * 2) * 0.01
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = Math.sin(p * Math.PI) * 0.35
      c.scale.setScalar(0.6 + p)
    })
  })
  return (
    <group>
      <mesh position={[0, 0.035, 0]} material={M.ceramic()} castShadow>
        <cylinderGeometry args={[0.034, 0.028, 0.07, 24]} />
      </mesh>
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.031, 24]} />
        <meshStandardMaterial color="#4a2a17" roughness={0.3} />
      </mesh>
      <mesh position={[0.038, 0.038, 0]} rotation={[0, 0, Math.PI / 2]} material={M.ceramic()}>
        <torusGeometry args={[0.016, 0.005, 8, 16]} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.012, 10, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Succulents() {
  const pots = [
    { x: 0, z: 0, s: 1, c: '#e9e3d6' },
    { x: 0.075, z: 0.03, s: 0.8, c: '#b86a48' },
    { x: 0.03, z: 0.075, s: 0.7, c: '#2f3a3f' },
  ]
  return (
    <group>
      {pots.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} scale={p.s}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.028, 0.06, 18]} />
            <meshStandardMaterial color={p.c} roughness={0.8} />
          </mesh>
          {Array.from({ length: 9 }).map((_, k) => {
            const a = (k / 9) * Math.PI * 2
            const r = k === 0 ? 0 : 0.016
            return (
              <mesh key={k} position={[Math.cos(a) * r, 0.07, Math.sin(a) * r]} rotation={[Math.sin(a) * 0.6, 0, Math.cos(a) * -0.6]} material={i === 1 ? M.leafLight() : M.leaf()}>
                <coneGeometry args={[0.012, 0.04, 6]} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export function Lamp1S({ color = 'black' }: { color?: string }) {
  const mat = color === 'white' ? M.whitePlastic() : M.black()
  const glow = useGlow(0.4, 6)
  return (
    <group>
      <mesh position={[0, 0.008, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.016, 32]} />
      </mesh>
      <mesh position={[0, 0.23, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.44, 12]} />
      </mesh>
      <mesh position={[0, 0.45, 0]} material={mat}>
        <sphereGeometry args={[0.013, 12, 10]} />
      </mesh>
      <group position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <group rotation={[0.08, 0, 0]}>
          <mesh position={[0, 0, 0.2]} material={mat} castShadow>
            <boxGeometry args={[0.032, 0.016, 0.42]} />
          </mesh>
          <mesh position={[0, -0.0085, 0.22]} rotation={[Math.PI / 2, 0, 0]} material={glow}>
            <planeGeometry args={[0.02, 0.34]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function HueSigne({ color = 'black' }: { color?: string }) {
  const mat = color === 'white' ? M.whitePlastic() : M.black()
  const glow = useMemo(() => {
    const t = hueGradient()
    return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 0.5, toneMapped: false })
  }, [])
  useFrame(() => {
    glow.emissiveIntensity = THREE.MathUtils.lerp(0.45, 2.2, tod.night)
  })
  return (
    <group>
      <mesh position={[0, 0.008, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.06, 0.065, 0.016, 32]} />
      </mesh>
      <mesh position={[0, 0.29, -0.006]} material={mat} castShadow>
        <boxGeometry args={[0.032, 0.54, 0.018]} />
      </mesh>
      <mesh position={[0, 0.3, -0.016]} rotation={[0, Math.PI, 0]} material={glow}>
        <planeGeometry args={[0.022, 0.5]} />
      </mesh>
    </group>
  )
}
