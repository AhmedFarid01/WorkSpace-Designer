import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { M } from '../materials'
import { chairMesh } from '../textures'

type ChairStyle = {
  mesh: 'black' | 'grey'
  frame: string
  base: 'chrome' | 'black'
  legRest?: boolean
  hanger?: boolean
  wings?: boolean
  backW: number
  backH: number
  seatColor: string
}

const STYLES: Record<string, ChairStyle> = {
  'chair-fantech': { mesh: 'black', frame: '#1b1c1f', base: 'chrome', legRest: true, hanger: true, backW: 0.47, backH: 0.6, seatColor: '#232427' },
  'chair-haru': { mesh: 'black', frame: '#141517', base: 'black', wings: true, backW: 0.5, backH: 0.63, seatColor: '#1c1d20' },
  'chair-anya': { mesh: 'grey', frame: '#7b8087', base: 'chrome', backW: 0.45, backH: 0.58, seatColor: '#50545a' },
}

/** Rounded-rectangle outline following a gentle horizontal curve. */
function framePath(w: number, h: number, curve: number) {
  const r = 0.07
  const pts: THREE.Vector3[] = []
  const hw = w / 2
  const z = (x: number) => -curve * (x / hw) ** 2
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 5; i++) {
      const a = a0 + (i / 5) * (Math.PI / 2)
      const x = cx + Math.cos(a) * r
      pts.push(new THREE.Vector3(x, cy + Math.sin(a) * r, z(x)))
    }
  }
  corner(hw - r, h - r, 0)
  corner(-hw + r, h - r, Math.PI / 2)
  corner(-hw + r, r, Math.PI)
  corner(hw - r, r, (3 * Math.PI) / 2)
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal')
}

function curvedPanel(w: number, h: number, curve: number) {
  const g = new THREE.PlaneGeometry(w, h, 16, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, -curve * (x / (w / 2)) ** 2)
    pos.setY(i, pos.getY(i) + h / 2)
  }
  g.computeVertexNormals()
  return g
}

export function Chair({ productId }: { productId: string }) {
  const s = STYLES[productId] ?? STYLES['chair-fantech']
  const baseMat = s.base === 'chrome' ? M.chrome() : M.black()

  const { frameGeo, panelGeo, meshMat, frameMat, seatMat } = useMemo(() => {
    const curve = 0.05
    const frameGeo = new THREE.TubeGeometry(framePath(s.backW, s.backH, curve), 80, 0.014, 8, true)
    const panelGeo = curvedPanel(s.backW - 0.02, s.backH - 0.02, curve)
    const alpha = chairMesh(s.mesh).clone()
    alpha.needsUpdate = true
    alpha.repeat.set(5, 6)
    const meshMat = new THREE.MeshStandardMaterial({
      color: s.mesh === 'black' ? '#1b1c1f' : '#5d6168',
      alphaMap: alpha,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.9,
    })
    const frameMat = new THREE.MeshStandardMaterial({ color: s.frame, roughness: 0.45, metalness: 0.2 })
    const seatMat = new THREE.MeshStandardMaterial({ color: s.seatColor, roughness: 0.95 })
    return { frameGeo, panelGeo, meshMat, frameMat, seatMat }
  }, [s])

  const legs = [0, 1, 2, 3, 4]
  const backY = 0.56
  const backZ = -0.24

  return (
    <group>
      {/* Five-star base with casters */}
      <mesh position={[0, 0.1, 0]} material={baseMat} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.05, 20]} />
      </mesh>
      {legs.map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.085, 0.17]} rotation={[0.1, 0, 0]} material={baseMat} castShadow>
              <boxGeometry args={[0.05, 0.03, 0.3]} />
            </mesh>
            <mesh position={[0, 0.03, 0.315]} rotation={[0, 0, Math.PI / 2]} material={M.rubber()} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.04, 14]} />
            </mesh>
            <mesh position={[0, 0.062, 0.31]} material={M.black()}>
              <boxGeometry args={[0.02, 0.03, 0.03]} />
            </mesh>
          </group>
        )
      })}
      {/* Gas lift */}
      <mesh position={[0, 0.2, 0]} material={M.black()} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.14, 16]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={M.chrome()}>
        <cylinderGeometry args={[0.022, 0.022, 0.16, 16]} />
      </mesh>
      <mesh position={[0, 0.425, -0.02]} material={M.black()} castShadow>
        <boxGeometry args={[0.24, 0.045, 0.22]} />
      </mesh>

      {/* Seat */}
      <RoundedBox args={[0.5, 0.075, 0.49]} radius={0.03} smoothness={3} position={[0, 0.485, 0.01]} castShadow receiveShadow material={seatMat} />
      <RoundedBox args={[0.46, 0.02, 0.44]} radius={0.01} smoothness={2} position={[0, 0.528, 0.01]} material={seatMat} />

      {s.legRest && (
        <group position={[0, 0.41, 0.24]}>
          <RoundedBox args={[0.38, 0.045, 0.12]} radius={0.015} material={seatMat} castShadow />
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * 0.12, 0.01, -0.12]} material={M.chrome()}>
              <boxGeometry args={[0.015, 0.012, 0.16]} />
            </mesh>
          ))}
        </group>
      )}

      {/* Spine connecting seat to back */}
      <mesh position={[0, 0.5, -0.24]} rotation={[0.2, 0, 0]} material={frameMat} castShadow>
        <boxGeometry args={[0.07, 0.2, 0.03]} />
      </mesh>

      {/* Mesh backrest, tilted back slightly */}
      <group position={[0, backY, backZ]} rotation={[-0.14, 0, 0]}>
        <mesh geometry={frameGeo} material={frameMat} castShadow />
        <mesh geometry={panelGeo} material={meshMat} position={[0, 0.01, 0]} castShadow />
        {/* Lumbar pad */}
        <RoundedBox args={[s.backW * 0.62, 0.08, 0.035]} radius={0.015} position={[0, 0.16, 0.012]} material={frameMat} castShadow />
        {s.wings && (
          <>
            {[-1, 1].map((k) => (
              <mesh key={k} position={[k * (s.backW / 2 - 0.02), s.backH * 0.55, -0.03]} rotation={[0, k * -0.5, 0]} material={frameMat}>
                <boxGeometry args={[0.02, s.backH * 0.5, 0.06]} />
              </mesh>
            ))}
          </>
        )}
        {/* Headrest */}
        <mesh position={[0, s.backH + 0.04, -0.03]} material={frameMat}>
          <boxGeometry args={[0.03, 0.1, 0.02]} />
        </mesh>
        <group position={[0, s.backH + 0.11, -0.01]} rotation={[0.18, 0, 0]}>
          <RoundedBox args={[0.28, 0.12, 0.05]} radius={0.022} material={seatMat} castShadow />
        </group>
        {s.hanger && (
          <group position={[0, s.backH + 0.02, -0.07]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={M.chrome()}>
              <cylinderGeometry args={[0.008, 0.008, 0.36, 10]} />
            </mesh>
            <mesh position={[0, -0.02, 0.01]} material={M.black()}>
              <boxGeometry args={[0.03, 0.05, 0.02]} />
            </mesh>
          </group>
        )}
      </group>

      {/* Armrests */}
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.28, 0, -0.02]}>
          <mesh position={[0, 0.49, -0.04]} material={frameMat}>
            <boxGeometry args={[0.03, 0.05, 0.2]} />
          </mesh>
          <mesh position={[0, 0.58, -0.02]} material={M.black()} castShadow>
            <boxGeometry args={[0.035, 0.18, 0.045]} />
          </mesh>
          <RoundedBox args={[0.075, 0.03, 0.25]} radius={0.012} position={[0, 0.68, 0.01]} material={M.fabric()} castShadow />
        </group>
      ))}
    </group>
  )
}
