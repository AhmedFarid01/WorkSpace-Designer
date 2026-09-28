import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode, type BloomEffect } from 'postprocessing'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import { useStore } from '../state/store'
import { hourDelta, sampleTod, tod } from './timeOfDay'
import { prefersReducedMotion } from './deskState'
import { Sky } from './Sky'
import { Room } from './Room'
import { Garden } from './Garden'
import { Workspace } from './Workspace'
import { projectAnchors } from './projectAnchors'

const HOME = { pos: [2.55, 3.9, 4.35] as const, target: [0.45, 0.72, -1.25] as const }
const INTRO = [5.2, 4.8, 9.8] as const

function TimeDriver() {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const scene = useThree((s) => s.scene)
  const current = useRef(useStore.getState().hour)
  const focus = useRef(new THREE.Vector3(0.3, 0, -1.4))

  useFrame((_, dt) => {
    const goal = useStore.getState().hour
    const d = hourDelta(current.current, goal)
    current.current = prefersReducedMotion || Math.abs(d) < 0.001 ? goal : current.current + d * Math.min(1, dt * 2.5)
    sampleTod(current.current)
    const s = sun.current
    if (s) {
      s.position.copy(focus.current).addScaledVector(tod.sunDir, 14)
      s.target.position.copy(focus.current)
      s.target.updateMatrixWorld()
      s.color.copy(tod.sun)
      s.intensity = tod.sunI
    }
    const h = hemi.current
    if (h) {
      h.color.copy(tod.hemiSky)
      h.groundColor.copy(tod.hemiGround)
      h.intensity = tod.hemiI
    }
    scene.environmentIntensity = tod.env * 0.9
  })

  return (
    <>
      <directionalLight ref={sun} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.025}>
        <orthographicCamera attach="shadow-camera" args={[-6.5, 6.5, 6.5, -6.5, 0.5, 40]} />
      </directionalLight>
      <hemisphereLight ref={hemi} />
    </>
  )
}

function CameraRig({ inset }: { inset: number }) {
  const ref = useRef<CameraControlsImpl>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera & { manual?: boolean }
  const size = useThree((s) => s.size)
  const nonce = useStore((s) => s.cameraNonce)

  useLayoutEffect(() => {
    camera.manual = true
    const { width: W, height: H } = size
    if (inset > 0) {
      camera.aspect = (W + inset) / H
      camera.setViewOffset(W + inset, H, inset, 0, W, H)
    } else {
      camera.aspect = W / H
      camera.clearViewOffset()
    }
    // Pull back a little on tall, narrow screens so the whole desk fits.
    camera.fov = camera.aspect < 1 ? 40 : 30
    camera.updateProjectionMatrix()
  }, [camera, size, inset])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (prefersReducedMotion) {
      c.setLookAt(...HOME.pos, ...HOME.target, false)
      return
    }
    c.setLookAt(...INTRO, ...HOME.target, false)
    c.smoothTime = 1.1
    void c.setLookAt(...HOME.pos, ...HOME.target, true).then(() => {
      c.smoothTime = 0.3
    })
  }, [])

  useEffect(() => {
    if (nonce) void ref.current?.setLookAt(...HOME.pos, ...HOME.target, !prefersReducedMotion)
  }, [nonce])

  const A = CameraControlsImpl.ACTION
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={1.6}
      maxDistance={8.5}
      minPolarAngle={0.62}
      maxPolarAngle={1.5}
      minAzimuthAngle={-0.75}
      maxAzimuthAngle={1.1}
      draggingSmoothTime={0.12}
      mouseButtons={{ left: A.ROTATE, middle: A.DOLLY, right: A.NONE, wheel: A.DOLLY }}
      touches={{ one: A.TOUCH_ROTATE, two: A.TOUCH_DOLLY, three: A.NONE }}
    />
  )
}

function Effects({ multisampling }: { multisampling: number }) {
  const bloom = useRef<BloomEffect>(null)
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.2 + tod.night * 0.55
  })
  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.4} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

function AnchorProjector() {
  useFrame(({ camera, size }) => projectAnchors(camera, size.width, size.height))
  return null
}

/** Crops the rendered frame into a 4:3 postcard for the checkout page. */
function Snapshotter({ inset }: { inset: number }) {
  const request = useStore((s) => s.snapshotRequest)
  const pending = useRef(0)
  useEffect(() => {
    if (request) pending.current = request
  }, [request])
  useFrame(({ gl }) => {
    if (!pending.current) return
    pending.current = 0
    const src = gl.domElement
    const ratio = src.width / Math.max(1, src.clientWidth)
    const visibleW = src.width - inset * ratio
    let w = visibleW
    let h = src.height
    if (w / h > 4 / 3) w = h * (4 / 3)
    else h = w * (3 / 4)
    const x = (visibleW - w) / 2
    const y = (src.height - h) / 2 + h * 0.02
    const out = document.createElement('canvas')
    out.width = Math.min(1200, Math.round(w))
    out.height = Math.round(out.width * 0.75)
    try {
      out.getContext('2d')?.drawImage(src, x, y, w, h, 0, 0, out.width, out.height)
      useStore.getState().setSnapshot(out.toDataURL('image/jpeg', 0.88))
    } catch {
      useStore.getState().setSnapshot('')
    }
  }, 2)
  return null
}

export default function SceneCanvas({ inset, compact, paused }: { inset: number; compact: boolean; paused: boolean }) {
  const setHover = useStore((s) => s.setHover)
  return (
    <Canvas
      shadows
      frameloop={paused ? 'never' : 'always'}
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [...INTRO], fov: 32, near: 0.05, far: 300 }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      onPointerMissed={() => {
        setHover(null)
        document.body.style.cursor = ''
      }}
      aria-label="3D preview of your workspace"
    >
      <TimeDriver />
      <Sky />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#8fa5b3']} />
        <Lightformer form="rect" intensity={2.2} color="#fff4e2" position={[0, 6, -1]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#cdeeff" position={[-7, 2.5, -1]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#ffe0bd" position={[7, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[1, 3, 7]} scale={3} />
      </Environment>
      <Suspense fallback={null}>
        <Room />
        <Garden />
        <Workspace />
      </Suspense>
      <CameraRig inset={inset} />
      <Effects multisampling={compact ? 0 : 4} />
      <Snapshotter inset={inset} />
      <AnchorProjector />
    </Canvas>
  )
}
