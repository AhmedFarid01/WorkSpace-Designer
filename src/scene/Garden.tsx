import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from './materials'
import { ROOM } from './layout'
import { tod } from './timeOfDay'
import { Bush, Frangipani, Palm } from './models/Plants'

const P = ROOM.platform
const TY = ROOM.terraceY
const POOL = { x0: -1.9, x1: 2.3, z0: -3.55, z1: -2.5 }
const BED_Z = -3.95
export const BASE_TOP = TY - 0.22

const waterVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNight;
  uniform float uLight;
  uniform vec3 uSky;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * vec2(16.0, 4.5);
    float c = 0.0;
    for (int i = 0; i < 3; i++) {
      p += vec2(sin(p.y * 1.3 + uTime * 0.55), cos(p.x * 1.1 + uTime * 0.45)) * 0.38;
      c += abs(sin(p.x) * sin(p.y));
    }
    float caustic = pow(1.0 - c / 3.0, 5.0);
    vec3 shallow = vec3(0.16, 0.62, 0.68);
    vec3 deep = vec3(0.02, 0.28, 0.42);
    float edge = smoothstep(0.0, 0.25, min(min(vUv.x, 1.0 - vUv.x) * 4.0, min(vUv.y, 1.0 - vUv.y)));
    vec3 col = mix(shallow, deep, edge * 0.6);
    col = mix(col, uSky, 0.18);
    col *= uLight;
    col += caustic * 0.45 * uLight;
    // Underwater lights switch on after dark.
    vec3 glow = vec3(0.05, 0.55, 0.65) * (1.0 - edge * 0.5) + caustic * vec3(0.2, 0.7, 0.8);
    col += glow * uNight * 0.9;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function Water() {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uNight: { value: 0 }, uLight: { value: 1 }, uSky: { value: new THREE.Color() } }),
    [],
  )
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uNight.value = tod.night
    uniforms.uLight.value = 0.25 + (tod.sunI / 3.1) * 0.9
    uniforms.uSky.value.copy(tod.skyTop)
  })
  return (
    <mesh position={[(POOL.x0 + POOL.x1) / 2, TY - 0.07, (POOL.z0 + POOL.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[POOL.x1 - POOL.x0, POOL.z1 - POOL.z0]} />
      <shaderMaterial vertexShader={waterVertex} fragmentShader={waterFragment} uniforms={uniforms} />
    </mesh>
  )
}

function Slab({ x0, x1, z0, z1, y = TY, h = 0.22, material }: { x0: number; x1: number; z0: number; z1: number; y?: number; h?: number; material: THREE.Material }) {
  return (
    <mesh position={[(x0 + x1) / 2, y - h / 2, (z0 + z1) / 2]} material={material} receiveShadow castShadow>
      <boxGeometry args={[x1 - x0, h, z1 - z0]} />
    </mesh>
  )
}

export function Garden() {
  const grass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6f9a4f', roughness: 1 }), [])
  const tile = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2f8fa6', roughness: 0.4 }), [])
  const coping = useMemo(() => new THREE.MeshStandardMaterial({ color: '#efe6d6', roughness: 0.7 }), [])
  const back = ROOM.floorZ0 - ROOM.wallT
  return (
    <group>
      {/* Diorama base */}
      <mesh position={[(P.x0 + P.x1) / 2, (BASE_TOP - 0.9) / 2, (P.z0 + P.z1) / 2]} material={M.stoneSide()} receiveShadow>
        <boxGeometry args={[P.x1 - P.x0, BASE_TOP + 0.9, P.z1 - P.z0]} />
      </mesh>

      {/* Terrace deck around the pool */}
      <Slab x0={P.x0} x1={P.x1} z0={POOL.z1} z1={back} material={M.deck()} />
      <Slab x0={P.x0} x1={P.x1} z0={BED_Z} z1={POOL.z0} material={M.deck()} />
      <Slab x0={P.x0} x1={POOL.x0} z0={POOL.z0} z1={POOL.z1} material={M.deck()} />
      <Slab x0={POOL.x1} x1={P.x1} z0={POOL.z0} z1={POOL.z1} material={M.deck()} />
      <Slab x0={POOL.x0} x1={POOL.x1} z0={POOL.z0} z1={POOL.z1} y={TY - 0.2} h={0.02} material={tile} />
      {/* Pool walls */}
      {[
        [POOL.x0, POOL.x1, POOL.z0 - 0.005, POOL.z0],
        [POOL.x0, POOL.x1, POOL.z1, POOL.z1 + 0.005],
      ].map(([x0, x1, z0, z1], i) => (
        <Slab key={i} x0={x0} x1={x1} z0={z0} z1={z1} y={TY} h={0.2} material={tile} />
      ))}
      {/* Coping stones */}
      <Slab x0={POOL.x0 - 0.06} x1={POOL.x1 + 0.06} z0={POOL.z1} z1={POOL.z1 + 0.08} y={TY + 0.015} h={0.03} material={coping} />
      <Slab x0={POOL.x0 - 0.06} x1={POOL.x1 + 0.06} z0={POOL.z0 - 0.08} z1={POOL.z0} y={TY + 0.015} h={0.03} material={coping} />
      <Water />

      {/* Garden bed behind the pool and a strip along the open side */}
      <Slab x0={P.x0} x1={P.x1} z0={P.z0} z1={BED_Z} y={TY + 0.04} h={0.26} material={grass} />
      <Slab x0={P.x0} x1={ROOM.floorX0} z0={back} z1={P.z1} y={TY + 0.02} h={0.24} material={grass} />
      <mesh position={[(P.x0 + P.x1) / 2, TY + 0.25, P.z0 + 0.1]} material={M.wall()} castShadow receiveShadow>
        <boxGeometry args={[P.x1 - P.x0, 0.5, 0.2]} />
      </mesh>

      <group position={[-1.5, TY + 0.08, -4.45]}>
        <Palm height={3.5} lean={0.3} seed={1} />
      </group>
      <group position={[1.4, TY + 0.08, -4.55]}>
        <Palm height={4.1} lean={-0.22} seed={2.5} />
      </group>
      <group position={[2.55, TY + 0.08, -4.2]}>
        <Palm height={2.9} lean={-0.35} seed={4} />
      </group>
      <group position={[-2.05, TY + 0.06, 0.9]}>
        <Frangipani />
      </group>
      {[
        [-0.4, -4.45, 1.2, 0],
        [0.4, -4.6, 0.9, 1],
        [2.1, -4.6, 1.1, 2],
        [-2.1, -4.3, 1, 1],
        [-2.1, -1.2, 0.9, 0],
        [-2.15, 1.9, 0.8, 2],
        [-2.1, -0.2, 0.6, 1],
      ].map(([x, z, s, c], i) => (
        <group key={i} position={[x, TY + 0.06, z]}>
          <Bush scale={s} color={c} />
        </group>
      ))}
    </group>
  )
}
