import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { M } from '../materials'
import { screen, type ScreenKind } from '../textures'
import { tod } from '../timeOfDay'

export type MonitorSpec = {
  w: number
  h: number
  bezel: number
  chin: number
  thick: number
  stand: 'rect' | 'v' | 'slim' | 'clamp' | 'wide' | 'studio'
  elev: number
  curved?: number
  aluminum?: boolean
}

export const MONITOR_SPECS: Record<string, MonitorSpec> = {
  'mon-24': { w: 0.54, h: 0.318, bezel: 0.007, chin: 0.012, thick: 0.018, stand: 'rect', elev: 0.1 },
  'mon-27': { w: 0.615, h: 0.36, bezel: 0.007, chin: 0.014, thick: 0.018, stand: 'v', elev: 0.1 },
  'mon-27-4k': { w: 0.615, h: 0.36, bezel: 0.006, chin: 0.01, thick: 0.016, stand: 'slim', elev: 0.11 },
  'mon-32': { w: 0.715, h: 0.41, bezel: 0.007, chin: 0.012, thick: 0.02, stand: 'clamp', elev: 0.17 },
  'mon-34': { w: 0.81, h: 0.345, bezel: 0.007, chin: 0.014, thick: 0.02, stand: 'wide', elev: 0.1, curved: 1.5 },
  'mon-studio': { w: 0.623, h: 0.362, bezel: 0.014, chin: 0, thick: 0.03, stand: 'studio', elev: 0.09, aluminum: true },
}

/** Bends a geometry around a vertical axis so its front face is concave toward +z. */
function bend(g: THREE.BufferGeometry, R: number) {
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const th = x / R
    const r = R - z
    pos.setX(i, r * Math.sin(th))
    pos.setZ(i, R - r * Math.cos(th))
  }
  g.computeVertexNormals()
  return g
}

export function Monitor({ id, content, lift = 0 }: { id: string; content: ScreenKind; lift?: number }) {
  const spec = MONITOR_SPECS[id] ?? MONITOR_SPECS['mon-24']
  const { w, h, bezel, chin, thick, curved } = spec
  const screenMat = useMemo(() => {
    const tex = screen(content)
    return new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0,
      toneMapped: false,
    })
  }, [content])
  const body = spec.aluminum ? M.aluminum() : M.black()
  const matRef = useRef(screenMat)
  matRef.current = screenMat

  useFrame(() => {
    // Screens are bright by day and glow at night.
    matRef.current.emissiveIntensity = 0.55 + tod.night * 0.55
    matRef.current.color.setScalar(0.45 * (1 - tod.night) + 0.05)
  })

  const geoms = useMemo(() => {
    if (!curved) return null
    const housing = bend(new THREE.BoxGeometry(w, h, thick, 40, 1, 1).translate(0, 0, -thick / 2), curved)
    const face = bend(new THREE.PlaneGeometry(w - bezel * 2, h - bezel * 2 - chin, 40, 1).translate(0, chin / 2, 0.0008), curved)
    return { housing, face }
  }, [curved, w, h, thick, bezel, chin])

  const panelY = spec.elev + h / 2 + lift
  const neckTop = panelY
  const backZ = -thick

  return (
    <group>
      {/* Panel */}
      <group position={[0, panelY, 0]} rotation={[-0.05, 0, 0]}>
        {geoms ? (
          <>
            <mesh geometry={geoms.housing} material={body} castShadow />
            <mesh geometry={geoms.face} material={screenMat} />
          </>
        ) : (
          <>
            <RoundedBox args={[w, h, thick]} radius={Math.min(0.006, thick / 2.5)} smoothness={3} position={[0, 0, -thick / 2]} material={body} castShadow />
            <mesh position={[0, chin / 2, 0.0006]} material={screenMat}>
              <planeGeometry args={[w - bezel * 2, h - bezel * 2 - chin]} />
            </mesh>
          </>
        )}
        {spec.aluminum ? (
          <mesh position={[0, 0, 0.0004]}>
            <planeGeometry args={[w - 0.004, h - 0.004]} />
            <meshStandardMaterial color="#0b0c0e" roughness={0.2} polygonOffset polygonOffsetFactor={1} />
          </mesh>
        ) : (
          <RoundedBox args={[w * 0.42, h * 0.5, 0.03]} radius={0.01} position={[0, -h * 0.05, backZ - 0.012]} material={body} />
        )}
      </group>

      {/* Stands */}
      {spec.stand === 'rect' && (
        <>
          <RoundedBox args={[0.23, 0.012, 0.17]} radius={0.005} position={[0, 0.006, -0.04]} material={M.black()} castShadow receiveShadow />
          <mesh position={[0, neckTop / 2, backZ - 0.04]} material={M.black()} castShadow>
            <boxGeometry args={[0.045, neckTop, 0.022]} />
          </mesh>
        </>
      )}
      {spec.stand === 'v' && (
        <>
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * 0.07, 0.007, -0.02]} rotation={[0, k * 0.55, 0]} material={M.black()} castShadow>
              <boxGeometry args={[0.035, 0.014, 0.22]} />
            </mesh>
          ))}
          <mesh position={[0, neckTop / 2, backZ - 0.05]} material={M.black()} castShadow>
            <boxGeometry args={[0.05, neckTop, 0.024]} />
          </mesh>
        </>
      )}
      {spec.stand === 'slim' && (
        <>
          <mesh position={[0, 0.006, -0.04]} scale={[1.35, 1, 1]} material={M.black()} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.105, 0.012, 32]} />
          </mesh>
          <mesh position={[0, neckTop / 2, backZ - 0.05]} material={M.black()} castShadow>
            <boxGeometry args={[0.05, neckTop, 0.02]} />
          </mesh>
        </>
      )}
      {spec.stand === 'wide' && (
        <>
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * 0.12, 0.007, -0.03]} rotation={[0, k * 1.05, 0]} material={M.black()} castShadow>
              <boxGeometry args={[0.04, 0.014, 0.32]} />
            </mesh>
          ))}
          <mesh position={[0, neckTop / 2, backZ - 0.05]} material={M.black()} castShadow>
            <boxGeometry args={[0.06, neckTop, 0.026]} />
          </mesh>
        </>
      )}
      {spec.stand === 'clamp' && (
        <>
          {/* Desk clamp, pole and arm of the LG Ergo */}
          <mesh position={[0, 0.02, -0.17]} material={M.black()} castShadow>
            <boxGeometry args={[0.07, 0.04, 0.07]} />
          </mesh>
          <mesh position={[0, 0.25, -0.17]} material={M.black()} castShadow>
            <cylinderGeometry args={[0.017, 0.017, 0.5, 14]} />
          </mesh>
          <mesh position={[0, panelY, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={M.black()} castShadow>
            <boxGeometry args={[0.04, 0.14, 0.03]} />
          </mesh>
        </>
      )}
      {spec.stand === 'studio' && (
        <>
          <mesh position={[0, 0.004, -0.07]} material={M.aluminum()} castShadow receiveShadow>
            <boxGeometry args={[0.17, 0.008, 0.2]} />
          </mesh>
          <mesh position={[0, panelY * 0.55, -0.1]} rotation={[0.16, 0, 0]} material={M.aluminum()} castShadow>
            <boxGeometry args={[0.15, panelY * 1.05, 0.01]} />
          </mesh>
        </>
      )}
    </group>
  )
}

/** Top-edge height (above the desk) of a monitor, for mounting webcams and light bars. */
export function monitorTop(id: string, lift = 0) {
  const s = MONITOR_SPECS[id] ?? MONITOR_SPECS['mon-24']
  return s.elev + s.h + lift
}
