import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { cane } from '../textures'
import { prefersReducedMotion } from '../deskState'

/** Monstera leaf outline: an oval with a heart notch at the stem and deep splits cut in from the edge. */
function monsteraLeafGeometry() {
  const s = new THREE.Shape()
  const splits = [0.55, 0.95, 1.35, 1.8, 2.2, 2.6]
  const N = 220
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2
    let r = 1
    // Heart notch where the stem meets the leaf.
    const fromBase = Math.abs(((a + Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI)
    r *= 1 - 0.55 * Math.exp(-((fromBase / 0.22) ** 2))
    // Splits on both sides, measured from the tip.
    const fromTip = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
    for (const sp of splits) r *= 1 - 0.5 * Math.exp(-(((fromTip - sp) / 0.045) ** 2))
    const x = Math.cos(a) * r * 0.19
    const y = Math.sin(a) * r * 0.23 + 0.23
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  const g = new THREE.ShapeGeometry(s, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, -0.5 * y * y + 0.9 * x * x)
  }
  g.computeVertexNormals()
  return g
}

function useSway(amount: number, speed: number) {
  const ref = useRef<THREE.Group>(null)
  const phase = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    if (!ref.current || prefersReducedMotion) return
    const t = clock.elapsedTime * speed + phase
    ref.current.rotation.z = Math.sin(t) * amount
    ref.current.rotation.x = Math.cos(t * 0.8) * amount * 0.6
  })
  return ref
}

export function Monstera() {
  const leaf = useMemo(() => monsteraLeafGeometry(), [])
  const basket = useMemo(() => new THREE.MeshStandardMaterial({ map: cane(), roughness: 0.85, color: '#e8d2a8' }), [])
  const sway = useSway(0.025, 0.7)
  const leaves = [
    { a: 0.2, tilt: 0.7, len: 0.5, s: 1.25 },
    { a: 0.95, tilt: 0.45, len: 0.68, s: 1.3 },
    { a: 1.7, tilt: 0.8, len: 0.46, s: 1.1 },
    { a: 2.45, tilt: 0.55, len: 0.62, s: 1.35 },
    { a: 3.2, tilt: 0.85, len: 0.42, s: 1.05 },
    { a: 3.95, tilt: 0.5, len: 0.66, s: 1.3 },
    { a: 4.7, tilt: 0.75, len: 0.5, s: 1.2 },
    { a: 5.45, tilt: 0.4, len: 0.72, s: 1.35 },
    { a: 1.3, tilt: 0.15, len: 0.8, s: 1.15 },
    { a: 4.2, tilt: 0.2, len: 0.76, s: 1.1 },
  ]
  return (
    <group>
      <mesh position={[0, 0.17, 0]} material={basket} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.34, 28]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.soil()}>
        <circleGeometry args={[0.185, 24]} />
      </mesh>
      <group ref={sway} position={[0, 0.32, 0]}>
        {leaves.map((l, i) => (
          <group key={i} rotation={[0, l.a, 0]}>
            <group rotation={[l.tilt * 1.3, 0, 0]}>
              <mesh position={[0, l.len / 2, 0]} material={M.leafLight()}>
                <cylinderGeometry args={[0.006, 0.008, l.len, 6]} />
              </mesh>
              <mesh
                geometry={leaf}
                position={[0, l.len, 0]}
                rotation={[-0.35 - l.tilt * 0.9, 0, 0]}
                scale={l.s * 1.3}
                material={i % 3 === 0 ? M.leafDeep() : M.leaf()}
                castShadow
              />
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}

export function SnakePlant() {
  const blade = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.04, 0)
    s.bezierCurveTo(-0.07, 0.3, -0.05, 0.56, 0, 0.74)
    s.bezierCurveTo(0.05, 0.56, 0.07, 0.3, 0.04, 0)
    s.lineTo(-0.04, 0)
    const g = new THREE.ShapeGeometry(s, 10)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.05 * pos.getX(i) * pos.getX(i) * 40)
    g.computeVertexNormals()
    return g
  }, [])
  const bladeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#35613c', roughness: 0.55, side: THREE.DoubleSide }), [])
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b7b25a', roughness: 0.55, side: THREE.DoubleSide }), [])
  const blades = Array.from({ length: 12 }, (_, i) => ({
    a: i * 2.39,
    t: 0.06 + ((i * 7) % 5) * 0.045,
    s: 0.7 + ((i * 5) % 6) * 0.09,
    r: i < 4 ? 0.02 : 0.07,
  }))
  return (
    <group>
      <mesh position={[0, 0.15, 0]} material={M.ceramic()} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 28]} />
      </mesh>
      <mesh position={[0, 0.295, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.soil()}>
        <circleGeometry args={[0.14, 24]} />
      </mesh>
      {blades.map((b, i) => (
        <group key={i} position={[Math.cos(b.a) * b.r, 0.28, Math.sin(b.a) * b.r]} rotation={[0, b.a, b.t]}>
          <mesh geometry={blade} scale={[1, b.s, 1]} material={i % 3 === 0 ? edgeMat : bladeMat} castShadow />
        </group>
      ))}
    </group>
  )
}

/** Palm frond: a drooping midrib with paired leaflets. */
function frondGeometry(len: number) {
  const geo: THREE.BufferGeometry[] = []
  const steps = 14
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const x = t * len
    const y = Math.sin(t * Math.PI * 0.55) * len * 0.28 - t * t * len * 0.45
    const leafLen = Math.sin(t * Math.PI) * 0.55 + 0.1
    for (const side of [-1, 1]) {
      const g = new THREE.PlaneGeometry(0.07, leafLen, 1, 3)
      g.translate(0, leafLen / 2, 0)
      g.rotateX(Math.PI / 2 - 0.35)
      g.rotateY(side * (Math.PI / 2 - 0.5))
      g.translate(x, y, 0)
      geo.push(g)
    }
  }
  const merged = mergeGeometries(geo)
  merged.computeVertexNormals()
  return merged
}

function mergeGeometries(list: THREE.BufferGeometry[]) {
  const positions: number[] = []
  const indices: number[] = []
  let offset = 0
  for (const g of list) {
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) positions.push(p.getX(i), p.getY(i), p.getZ(i))
    const idx = g.index!
    for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset)
    offset += p.count
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setIndex(indices)
  return out
}

export function Palm({ height = 4, lean = 0.2, seed = 0 }: { height?: number; lean?: number; seed?: number }) {
  const { trunk, top, frond } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 8
      pts.push(new THREE.Vector3(Math.sin(t * 1.4) * lean * height * 0.35, t * height, Math.sin(t * 2 + seed) * 0.08))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const trunk = new THREE.TubeGeometry(curve, 24, 0.09, 8)
    return { trunk, top: pts[pts.length - 1], frond: frondGeometry(1.6) }
  }, [height, lean, seed])
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b7155', roughness: 1 }), [])
  const sway = useSway(0.035, 0.5)
  const fronds = 9
  return (
    <group>
      <mesh geometry={trunk} material={trunkMat} castShadow />
      <group position={top}>
        <group ref={sway}>
          {Array.from({ length: fronds }).map((_, i) => (
            <group key={i} rotation={[0, (i / fronds) * Math.PI * 2 + seed, 0]}>
              <mesh geometry={frond} rotation={[0, 0, 0.15 + (i % 3) * 0.12]} material={i % 2 ? M.leafLight() : M.leaf()} castShadow />
            </group>
          ))}
          <mesh material={trunkMat}>
            <sphereGeometry args={[0.14, 10, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function Bush({ scale = 1, color = 0 }: { scale?: number; color?: number }) {
  const blobs = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        p: [Math.cos(i * 1.7) * 0.25, 0.22 + (i % 3) * 0.1, Math.sin(i * 1.7) * 0.2] as [number, number, number],
        r: 0.22 + (i % 2) * 0.08,
      })),
    [],
  )
  const mats = [M.leaf(), M.leafLight(), M.leafDeep()]
  return (
    <group scale={scale}>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} material={mats[(i + color) % 3]} castShadow receiveShadow>
          <icosahedronGeometry args={[b.r, 1]} />
        </mesh>
      ))}
    </group>
  )
}

export function Frangipani() {
  const flower = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff7e6', emissive: '#ffe9a8', emissiveIntensity: 0.08, roughness: 0.6 }), [])
  const spots = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => [Math.cos(i * 2.3) * 0.5, 1.45 + Math.sin(i * 1.3) * 0.18, Math.sin(i * 2.3) * 0.45] as [number, number, number]),
    [],
  )
  const bark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8c7a66', roughness: 1 }), [])
  return (
    <group>
      {[0, 1.2, 2.4, 3.6].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.14, 0.75, Math.sin(a) * 0.14]} rotation={[Math.sin(a) * 0.35, 0, Math.cos(a) * -0.35]} material={bark} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 1.5, 7]} />
        </mesh>
      ))}
      <group position={[0, 0.05, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.4, 1.45, Math.sin(i * 1.3) * 0.35]} material={M.leaf()} castShadow>
            <icosahedronGeometry args={[0.28, 1]} />
          </mesh>
        ))}
        {spots.map((p, i) => (
          <mesh key={i} position={p} material={flower}>
            <icosahedronGeometry args={[0.05, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
