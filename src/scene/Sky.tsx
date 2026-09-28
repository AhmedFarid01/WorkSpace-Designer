import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tod } from './timeOfDay'

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSea;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform float uNight;
  uniform float uTime;
  varying vec3 vDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col;
    float horizonLine = -0.035;
    if (h > horizonLine) {
      float t = pow(clamp((h - horizonLine) / 0.6, 0.0, 1.0), 0.55);
      col = mix(uHorizon, uTop, t);
      float sunAmt = max(dot(d, normalize(uSunDir)), 0.0);
      col += uSun * pow(sunAmt, 400.0) * 2.5 * (1.0 - uNight);
      col += uSun * pow(sunAmt, 8.0) * 0.25 * (1.0 - uNight * 0.7);
      // Moon over the ocean
      vec3 md = normalize(vec3(-0.45, 0.32, -1.0));
      float moon = smoothstep(0.9994, 0.9997, dot(d, md));
      col += vec3(1.0, 0.97, 0.9) * moon * 1.6 * uNight;
      col += vec3(0.5, 0.55, 0.8) * pow(max(dot(d, md), 0.0), 60.0) * 0.25 * uNight;
      // Stars
      vec2 grid = floor(d.xz / max(d.y, 0.05) * 90.0);
      float s = step(0.9965, hash(grid)) * smoothstep(0.05, 0.4, h);
      float tw = 0.6 + 0.4 * sin(uTime * 2.0 + hash(grid + 1.0) * 30.0);
      col += vec3(s * tw) * uNight;
    } else {
      float t = clamp((horizonLine - h) / 0.35, 0.0, 1.0);
      vec3 deep = uSea * 0.6;
      col = mix(mix(uHorizon, uSea, 0.7), deep, pow(t, 0.7));
      // Project the view ray onto the sea plane for perspective-correct waves.
      vec2 p = d.xz / max(-d.y, 0.015);
      float fade = smoothstep(0.0, 0.25, t) * (1.0 - smoothstep(0.6, 1.0, t) * 0.5);
      float w = sin(p.x * 1.7 + p.y * 0.4 + uTime * 0.9) * sin(p.y * 2.3 - uTime * 0.7);
      col += vec3(0.035, 0.05, 0.06) * w * fade * (1.0 - uNight * 0.6);
      // Soft glitter toward the far horizon, behind the villa.
      vec2 gd = normalize(vec2(-0.35, -1.0));
      float along = max(dot(normalize(d.xz), gd), 0.0);
      float band = pow(along, 40.0) * (1.0 - t);
      vec3 glint = mix(uSun, vec3(0.8, 0.85, 1.0), uNight);
      col += glint * band * 0.1 * (1.0 - uNight * 0.4);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export function Sky() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSea: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uNight: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  )
  useFrame(({ clock }) => {
    uniforms.uTop.value.copy(tod.skyTop)
    uniforms.uHorizon.value.copy(tod.skyHorizon)
    uniforms.uSea.value.copy(tod.sea)
    uniforms.uSun.value.copy(tod.sun)
    uniforms.uSunDir.value.copy(tod.sunDir)
    uniforms.uNight.value = tod.night
    uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh scale={80} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}
