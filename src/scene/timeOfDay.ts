import * as THREE from 'three'

// Light keyframes over a Bali day. Sampled every frame from a damped hour value.
type Key = {
  h: number
  sun: string
  sunI: number
  elev: number
  az: number
  skyTop: string
  skyHorizon: string
  sea: string
  hemiSky: string
  hemiGround: string
  hemiI: number
  env: number
  night: number
}

const KEYS: Key[] = [
  { h: 0, sun: '#a9bbff', sunI: 0.55, elev: 45, az: 40, skyTop: '#0a1330', skyHorizon: '#253066', sea: '#0c1d40', hemiSky: '#4454a0', hemiGround: '#1b1b28', hemiI: 0.5, env: 0.22, night: 1 },
  { h: 5.3, sun: '#a9bbff', sunI: 0.55, elev: 30, az: 20, skyTop: '#0d1738', skyHorizon: '#2f356c', sea: '#0e1e40', hemiSky: '#4454a0', hemiGround: '#1b1b28', hemiI: 0.5, env: 0.22, night: 1 },
  { h: 6.3, sun: '#ff9f73', sunI: 1.3, elev: 7, az: 8, skyTop: '#5f7fc4', skyHorizon: '#ffc0a0', sea: '#5f86b8', hemiSky: '#ffd0ba', hemiGround: '#6a5a50', hemiI: 0.62, env: 0.45, night: 0.3 },
  { h: 8, sun: '#ffe3c2', sunI: 2.6, elev: 26, az: 14, skyTop: '#4ea3e6', skyHorizon: '#cdeaf8', sea: '#2e90ba', hemiSky: '#e1f1ff', hemiGround: '#b9a68d', hemiI: 0.95, env: 0.85, night: 0 },
  { h: 12.5, sun: '#fff7ec', sunI: 3.1, elev: 58, az: 32, skyTop: '#2f8fe0', skyHorizon: '#d5f0fb', sea: '#1d8fbe', hemiSky: '#e8f5ff', hemiGround: '#c2ae93', hemiI: 1.05, env: 1, night: 0 },
  { h: 15.8, sun: '#ffe2b8', sunI: 2.8, elev: 34, az: 48, skyTop: '#3b8fdb', skyHorizon: '#f1e6cf', sea: '#2587b3', hemiSky: '#fff0dc', hemiGround: '#bfa588', hemiI: 0.95, env: 0.9, night: 0 },
  { h: 17.6, sun: '#ffa05a', sunI: 2.3, elev: 11, az: 60, skyTop: '#5a6db8', skyHorizon: '#ffb277', sea: '#5c77a6', hemiSky: '#ffc9a0', hemiGround: '#8a6a55', hemiI: 0.72, env: 0.6, night: 0.12 },
  { h: 18.5, sun: '#ff6d63', sunI: 0.9, elev: 3, az: 66, skyTop: '#2c3576', skyHorizon: '#f07c6c', sea: '#414c80', hemiSky: '#b08aa6', hemiGround: '#40303a', hemiI: 0.5, env: 0.35, night: 0.55 },
  { h: 19.6, sun: '#a9bbff', sunI: 0.55, elev: 25, az: 60, skyTop: '#0f1a3d', skyHorizon: '#3d4582', sea: '#102044', hemiSky: '#4454a0', hemiGround: '#1b1b28', hemiI: 0.5, env: 0.24, night: 0.95 },
  { h: 24, sun: '#a9bbff', sunI: 0.55, elev: 45, az: 40, skyTop: '#0a1330', skyHorizon: '#253066', sea: '#0c1d40', hemiSky: '#4454a0', hemiGround: '#1b1b28', hemiI: 0.5, env: 0.22, night: 1 },
]

const c1 = new THREE.Color()
const c2 = new THREE.Color()

function mix(out: THREE.Color, a: string, b: string, t: number) {
  c1.set(a)
  c2.set(b)
  return out.copy(c1).lerp(c2, t)
}

export const tod = {
  hour: 12,
  sun: new THREE.Color(),
  sunI: 1,
  sunDir: new THREE.Vector3(),
  skyTop: new THREE.Color(),
  skyHorizon: new THREE.Color(),
  sea: new THREE.Color(),
  hemiSky: new THREE.Color(),
  hemiGround: new THREE.Color(),
  hemiI: 1,
  env: 1,
  night: 0,
}

export function sampleTod(hour: number) {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const raw = (h - a.h) / (b.h - a.h)
  const t = raw * raw * (3 - 2 * raw)
  tod.hour = h
  mix(tod.sun, a.sun, b.sun, t)
  mix(tod.skyTop, a.skyTop, b.skyTop, t)
  mix(tod.skyHorizon, a.skyHorizon, b.skyHorizon, t)
  mix(tod.sea, a.sea, b.sea, t)
  mix(tod.hemiSky, a.hemiSky, b.hemiSky, t)
  mix(tod.hemiGround, a.hemiGround, b.hemiGround, t)
  tod.sunI = THREE.MathUtils.lerp(a.sunI, b.sunI, t)
  tod.hemiI = THREE.MathUtils.lerp(a.hemiI, b.hemiI, t)
  tod.env = THREE.MathUtils.lerp(a.env, b.env, t)
  tod.night = THREE.MathUtils.lerp(a.night, b.night, t)
  const elev = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(a.elev, b.elev, t))
  const az = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(a.az, b.az, t))
  // Light pours in from the open terrace on the left (-x) and the open front (+z).
  tod.sunDir.set(-Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev)).normalize()
  return tod
}

sampleTod(12)

/** Shortest signed distance between two hours on a 24h clock. */
export function hourDelta(from: number, to: number) {
  let d = (to - from) % 24
  if (d > 12) d -= 24
  if (d < -12) d += 24
  return d
}
