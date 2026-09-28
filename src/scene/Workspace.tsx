import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useShallow } from 'zustand/react/shallow'
import * as THREE from 'three'
import { useStore, selectSetup, type Setup } from '../state/store'
import { PRODUCT_BY_ID, getVariant } from '../data/catalog'
import { Item } from './Item'
import { Desk } from './models/Desk'
import { Chair } from './models/Chair'
import { MONITOR_SPECS, Monitor } from './models/Monitor'
import type { ScreenKind } from './textures'
import {
  BoomArm,
  CoffeeCup,
  Dock,
  Headphones,
  HueSigne,
  Keyboard,
  Lamp1S,
  Laptop,
  LaptopStand,
  LightBar,
  MacMini,
  MicTripod,
  MonitorRiser,
  Mouse,
  MousePad,
  PowerStrip,
  Succulents,
  Trackpad,
  Webcam,
} from './models/DeskGear'
import { AirPurifier, Dehumidifier, MiniFridge, Nespresso, Speaker, Starlink, TowerFan, WalkingPad, Whiteboard } from './models/RoomGear'
import { Monstera, SnakePlant } from './models/Plants'
import { CREDENZA, DESK_BACK_Z, DESK_X, SPOTS } from './layout'
import { SIT_HEIGHT, STAND_HEIGHT, deskState, prefersReducedMotion } from './deskState'
import { tod } from './timeOfDay'
import { setAnchorPos } from './anchors'

type V3 = [number, number, number]
type Placed = { uid: number; id: string; pos: V3; rot: number; content: ScreenKind; lift: number }

const RISER = 0.12

function screenContent(id: string, index: number, n: number): ScreenKind {
  if (id === 'mon-studio') return 'studio'
  if (id === 'mon-34') return 'chart'
  const primary = Math.floor((n - 1) / 2)
  if (index === primary) return 'code'
  return index < primary || (n === 2 && index === 1) ? 'design' : 'call'
}

/** Where monitors go on a desk of depth D: side screens angle in toward the chair. */
function layoutScreens(setup: Setup, D: number, riserOn: boolean): Placed[] {
  const n = setup.screens.length
  const z0 = -D / 2 + 0.2
  const gap = 0.012
  const riserIndex = riserOn ? pickRiserIndex(setup) : -1
  const out: Placed[] = []
  const w = (i: number) => MONITOR_SPECS[setup.screens[i].id]?.w ?? 0.55
  setup.screens.forEach((s, i) => {
    let x = 0
    let z = z0
    let rot = 0
    if (n === 2) {
      const th = 0.2
      const half = w(i) / 2
      if (i === 0) {
        x = -gap - half * Math.cos(th)
        z = z0 + half * Math.sin(th)
        rot = th
      } else {
        x = gap + half * Math.cos(th)
        z = z0 + half * Math.sin(th)
        rot = -th
      }
    } else if (n === 3) {
      const th = 0.42
      const wc = w(1)
      if (i === 0) {
        const half = w(0) / 2
        x = -wc / 2 - gap - half * Math.cos(th)
        z = z0 + half * Math.sin(th)
        rot = th
      } else if (i === 2) {
        const half = w(2) / 2
        x = wc / 2 + gap + half * Math.cos(th)
        z = z0 + half * Math.sin(th)
        rot = -th
      }
    }
    out.push({ uid: s.uid, id: s.id, pos: [x, i === riserIndex ? RISER : 0, z], rot, content: screenContent(s.id, i, n), lift: 0 })
  })
  return out
}

function pickRiserIndex(setup: Setup) {
  const n = setup.screens.length
  if (!n) return -1
  const primary = Math.floor((n - 1) / 2)
  const ok = (i: number) => MONITOR_SPECS[setup.screens[i].id]?.stand !== 'clamp'
  if (ok(primary)) return primary
  const other = setup.screens.findIndex((_, i) => ok(i))
  return other
}

export function Workspace() {
  const setup = useStore(useShallow(selectSetup))
  const desk = PRODUCT_BY_ID[setup.deskId]
  const [W, D] = getVariant(desk, setup.deskVariant)?.dims ?? [1.4, 0.6]
  const deskZ = DESK_BACK_Z + D / 2
  const deskFrontZ = DESK_BACK_Z + D
  const has = (id: string) => setup.extras[id] !== undefined
  const variantOf = (id: string) => (typeof setup.extras[id] === 'string' ? (setup.extras[id] as string) : undefined)

  const top = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const target = setup.standing ? STAND_HEIGHT : SIT_HEIGHT
    if (prefersReducedMotion) deskState.h = target
    else easing.damp(deskState, 'h', target, 0.5, dt)
    if (top.current) top.current.position.y = deskState.h
  })

  const riserOn = has('monitor-stand')
  const screens = useMemo(() => layoutScreens(setup, D, riserOn), [setup, D, riserOn])
  const n = screens.length
  const primaryIndex = Math.floor((n - 1) / 2)
  const primary = n ? screens[primaryIndex] : null
  const primarySpec = primary ? MONITOR_SPECS[primary.id] : null
  const riserIndex = riserOn ? pickRiserIndex(setup) : -1

  const laptop = has('macbook')
  const laptopStand = has('laptop-stand')
  const keyboardId = has('kb-mx') ? 'kb-mx' : has('kb-magic') ? 'kb-magic' : null
  const mouseId = has('mouse-mx') ? 'mouse-mx' : has('mouse-magic') ? 'mouse-magic' : null

  const kbX = laptop && n > 0 ? -0.1 : 0
  const kbZ = D / 2 - 0.13
  const mouseX = kbX + 0.31
  const mouseZ = D / 2 - 0.15
  const laptopPos: V3 = n > 0 ? [W / 2 - 0.2, 0, laptopStand ? -0.02 : 0.0] : [0, 0, keyboardId ? -0.08 : 0.02]
  const lamp1s = has('lamp-1s')
  const hue = has('lamp-hue')
  const lampPos: V3 = [-W / 2 + 0.1, 0, -D / 2 + 0.1]
  const huePos: V3 = [W / 2 - 0.07, 0, -D / 2 + 0.06]
  const primaryTop = primarySpec ? primarySpec.elev + primarySpec.h + (riserIndex === primaryIndex ? RISER : 0) : 0

  // Chair and walking pad trade places when the desk goes up.
  const chairPos: V3 = setup.standing ? [DESK_X - 1.0, 0, deskFrontZ + 0.7] : [DESK_X - 0.24, 0, deskFrontZ + 0.4]
  const chairRot = setup.standing ? Math.PI - 0.95 : Math.PI - 0.32
  const walkPos: V3 = setup.standing ? [DESK_X, 0, deskFrontZ + 0.08] : SPOTS.walkpadParked

  const hasLamp = lamp1s || hue
  const hasPlant = has('plant-monstera') || has('plant-snake') || has('plant-desk')
  const creditTop = CREDENZA.h - 0.01

  return (
    <group>
      <group position={[DESK_X, 0, deskZ]}>
        <Item key={setup.deskId} id={setup.deskId} position={[0, 0, 0]} labelY={1.25} smooth={0.3}>
          <Desk productId={setup.deskId} width={W} depth={D} />
        </Item>

        {has('powerstrip') && (
          <Item id="powerstrip" position={[W / 2 - 0.35, 0, -D / 2 + 0.12]} labelY={0.25}>
            <PowerStrip />
          </Item>
        )}

        {/* Everything below rides up and down with the desk top. */}
        <group ref={top} position={[0, SIT_HEIGHT, 0]}>
          {screens.map((s, i) => (
            <Item key={s.uid} id={s.id} position={s.pos} rotationY={s.rot} labelY={0.62}>
              {i === riserIndex && (
                <group position={[0, -RISER, 0]}>
                  <MonitorRiser width={Math.min(0.6, (MONITOR_SPECS[s.id]?.w ?? 0.5) * 0.8)} />
                </group>
              )}
              <Monitor id={s.id} content={s.content} />
            </Item>
          ))}

          {riserOn && riserIndex < 0 && (
            <Item id="monitor-stand" position={[0, 0, -D / 2 + 0.16]} labelY={0.3}>
              <MonitorRiser />
            </Item>
          )}

          {has('lightbar') && primary && primarySpec && (
            <Item id="lightbar" position={[primary.pos[0], primaryTop, primary.pos[2] - primarySpec.thick * 0.5]} rotationY={primary.rot} labelY={0.18}>
              <LightBar width={Math.min(0.45, primarySpec.w * 0.75)} />
            </Item>
          )}
          {has('lightbar') && !primary && (
            <Item id="lightbar" position={[0, 0, -D / 2 + 0.1]} labelY={0.18}>
              <LightBar />
            </Item>
          )}

          {has('webcam') && primary && primarySpec && (
            <Item
              id="webcam"
              position={[
                primary.pos[0] + (has('lightbar') ? -primarySpec.w * 0.36 : 0) * Math.cos(primary.rot),
                primaryTop,
                primary.pos[2] - primarySpec.thick * 0.5 + (has('lightbar') ? primarySpec.w * 0.36 * Math.sin(primary.rot) : 0),
              ]}
              rotationY={primary.rot}
              labelY={0.15}
            >
              <Webcam />
            </Item>
          )}
          {has('webcam') && !primary && (
            <Item id="webcam" position={[0.18, 0, -D / 2 + 0.08]} labelY={0.15}>
              <Webcam />
            </Item>
          )}

          {laptopStand && (
            <Item id="laptop-stand" position={laptopPos} rotationY={n > 0 ? -0.35 : 0} labelY={0.4}>
              <LaptopStand>{laptop && <Laptop color={variantOf('macbook')} />}</LaptopStand>
            </Item>
          )}
          {laptop && !laptopStand && (
            <Item id="macbook" position={laptopPos} rotationY={n > 0 ? -0.35 : 0} labelY={0.32}>
              <Laptop color={variantOf('macbook')} />
            </Item>
          )}

          {keyboardId && (
            <Item key={keyboardId} id={keyboardId} position={[kbX, 0, kbZ]} labelY={0.12}>
              <Keyboard kind={keyboardId === 'kb-mx' ? 'mx' : 'magic'} />
            </Item>
          )}
          {has('mousepad') && (
            <Item id="mousepad" position={[mouseX, 0, mouseZ]} labelY={0.1}>
              <MousePad />
            </Item>
          )}
          {mouseId && (
            <Item key={mouseId} id={mouseId} position={[mouseX, has('mousepad') ? 0.003 : 0, mouseZ]} labelY={0.12}>
              <Mouse kind={mouseId === 'mouse-mx' ? 'mx' : 'magic'} />
            </Item>
          )}
          {has('trackpad') && (
            <Item id="trackpad" position={[mouseId ? kbX - 0.33 : mouseX + 0.02, 0, kbZ]} labelY={0.12}>
              <Trackpad />
            </Item>
          )}

          {has('macmini') && (
            <Item id="macmini" position={[W / 2 - (hue ? 0.24 : 0.12), 0, -D / 2 + 0.11]} labelY={0.18}>
              <MacMini />
            </Item>
          )}
          {has('dock') && (
            <Item id="dock" position={[-W / 2 + (lamp1s ? 0.3 : 0.14), 0, -D / 2 + 0.08]} labelY={0.12}>
              <Dock />
            </Item>
          )}

          {lamp1s && (
            <Item id="lamp-1s" position={lampPos} labelY={0.62}>
              <Lamp1S color={variantOf('lamp-1s')} />
            </Item>
          )}
          {hue && (
            <Item id="lamp-hue" position={huePos} labelY={0.7}>
              <HueSigne color={variantOf('lamp-hue')} />
            </Item>
          )}

          {has('headphones') && (
            <Item id="headphones" position={[-W / 2 + 0.17, 0, D / 2 - 0.17]} labelY={0.15}>
              <Headphones />
            </Item>
          )}
          {has('mic') && !has('boom-arm') && (
            <Item id="mic" position={[-W / 2 + 0.38, 0, D / 2 - 0.24]} rotationY={0.35} labelY={0.32}>
              <MicTripod />
            </Item>
          )}
          {has('boom-arm') && (
            <Item id="boom-arm" position={[-W / 2 + 0.04, 0, -D / 2 + 0.2]} rotationY={0.6} labelY={0.62}>
              <BoomArm withMic={has('mic')} />
            </Item>
          )}
          {has('plant-desk') && (
            <Item id="plant-desk" position={lamp1s ? [-W / 2 + 0.3, 0, -D / 2 + 0.12] : [-W / 2 + 0.1, 0, -D / 2 + 0.1]} labelY={0.18}>
              <Succulents />
            </Item>
          )}
          {has('nespresso') && (
            <Item id="nespresso" position={[W / 2 - 0.08, 0, D / 2 - 0.1]} labelY={0.16}>
              <CoffeeCup />
            </Item>
          )}

          <DeskLights W={W} D={D} lamp={lamp1s} lampPos={lampPos} hue={hue} huePos={huePos} bar={has('lightbar') && !!primary} barPos={primary ? [primary.pos[0], primaryTop - 0.08, primary.pos[2] + 0.25] : [0, 0.4, 0]} screens={n} />
        </group>
      </group>

      <Item key={setup.chairId} id={setup.chairId} position={chairPos} rotationY={chairRot} labelY={1.35} smooth={0.45}>
        <Chair productId={setup.chairId} />
      </Item>

      {has('walkpad') && (
        <Item id="walkpad" position={walkPos} labelY={0.3} smooth={0.5}>
          <WalkingPad />
        </Item>
      )}
      {has('plant-monstera') && (
        <Item id="plant-monstera" position={SPOTS.monstera} labelY={1.25}>
          <Monstera />
        </Item>
      )}
      {has('plant-snake') && (
        <Item id="plant-snake" position={SPOTS.snake} labelY={1.05}>
          <SnakePlant />
        </Item>
      )}
      {has('fan') && (
        <Item id="fan" position={SPOTS.fan} rotationY={-1.1} labelY={1.15}>
          <TowerFan />
        </Item>
      )}
      {has('purifier') && (
        <Item id="purifier" position={SPOTS.purifier} rotationY={-0.6} labelY={0.7}>
          <AirPurifier />
        </Item>
      )}
      {has('dehumidifier') && (
        <Item id="dehumidifier" position={SPOTS.dehumidifier} rotationY={-1.2} labelY={0.62}>
          <Dehumidifier />
        </Item>
      )}
      {has('fridge') && (
        <Item id="fridge" position={SPOTS.fridge} rotationY={-Math.PI / 2} labelY={0.7}>
          <MiniFridge />
        </Item>
      )}
      {has('starlink') && (
        <Item id="starlink" position={[-2.0, SPOTS.starlink[1], -2.3]} rotationY={0.4} labelY={0.85}>
          <Starlink />
        </Item>
      )}
      {has('whiteboard') && (
        <Item id="whiteboard" position={SPOTS.whiteboard} rotationY={-Math.PI / 2} labelY={0.6}>
          <Whiteboard />
        </Item>
      )}
      {has('nespresso') && (
        <Item id="nespresso" position={[CREDENZA.x - 0.02, creditTop, CREDENZA.z - 0.5]} rotationY={-Math.PI / 2} labelY={0.35}>
          <Nespresso />
        </Item>
      )}
      {has('speaker') && (
        <Item id="speaker" position={[CREDENZA.x + 0.02, creditTop, CREDENZA.z + 0.3]} rotationY={-Math.PI / 2} labelY={0.45}>
          <Speaker />
        </Item>
      )}

      <RoomLight />

      <Hotspots
        spots={[
          !n && { key: 'screens', label: 'Add a screen', to: 'mon-24', pos: [DESK_X + 0.12, SIT_HEIGHT + 0.5, DESK_BACK_Z + 0.2] as V3, desk: true },
          !hasLamp && { key: 'lamp', label: 'Add a lamp', to: 'lamp-1s', pos: [DESK_X - W / 2 + 0.02, SIT_HEIGHT + 0.06, DESK_BACK_Z + 0.3] as V3, desk: true },
          !hasPlant && { key: 'plant', label: 'Place a plant', to: 'plant-monstera', pos: [SPOTS.monstera[0], 0.5, SPOTS.monstera[2]] as V3 },
          !has('nespresso') && !has('speaker') && { key: 'coffee', label: 'Coffee station', to: 'nespresso', pos: [CREDENZA.x, CREDENZA.h + 0.18, CREDENZA.z] as V3 },
          !has('fan') && !has('purifier') && !has('dehumidifier') && { key: 'fan', label: 'Beat the heat', to: 'fan', pos: [SPOTS.fan[0], 0.7, SPOTS.fan[2]] as V3 },
        ]}
      />
    </group>
  )
}

type Spot = { key: string; label: string; to: string; pos: V3; desk?: boolean }

/** Publishes the "+ add" pins; the DOM overlay renders them at these points. */
function Hotspots({ spots }: { spots: (Spot | false)[] }) {
  const setHotspots = useStore((s) => s.setHotspots)
  const list = spots.filter(Boolean).slice(0, 3) as Spot[]
  const sig = list.map((s) => `${s.key}:${s.pos.map((v) => v.toFixed(2)).join(',')}`).join('|')
  useEffect(() => {
    for (const s of list) setAnchorPos(`spot-${s.key}`, s.pos[0], s.pos[1], s.pos[2], !!s.desk)
    setHotspots(list.map(({ key, label, to }) => ({ key, label, to })))
  }, [sig])
  useEffect(() => () => setHotspots([]), [setHotspots])
  return null
}

/** A fixed set of lights (so shaders never recompile); intensity follows what's on the desk and the hour. */
function DeskLights(props: { W: number; D: number; lamp: boolean; lampPos: V3; hue: boolean; huePos: V3; bar: boolean; barPos: V3; screens: number }) {
  const lampL = useRef<THREE.PointLight>(null)
  const hueL = useRef<THREE.PointLight>(null)
  const barL = useRef<THREE.PointLight>(null)
  const screenL = useRef<THREE.PointLight>(null)
  const p = useRef(props)
  p.current = props
  useFrame(() => {
    const { lamp, hue, bar, screens } = p.current
    const night = tod.night
    if (lampL.current) lampL.current.intensity = lamp ? 0.15 + night * 2.4 : 0
    if (hueL.current) hueL.current.intensity = hue ? 0.25 + night * 2 : 0
    if (barL.current) barL.current.intensity = bar ? 0.1 + night * 1.6 : 0
    if (screenL.current) screenL.current.intensity = screens ? night * (0.5 + screens * 0.35) : 0
  })
  const { lampPos, huePos, barPos, D } = props
  return (
    <>
      <pointLight ref={lampL} color="#ffd9a3" position={[lampPos[0] + 0.2, 0.36, lampPos[2] + 0.2]} distance={2.4} decay={2} />
      <pointLight ref={hueL} color="#ff5f9e" position={[huePos[0], 0.35, huePos[2] - 0.12]} distance={2.2} decay={2} />
      <pointLight ref={barL} color="#fff3dd" position={barPos} distance={1.6} decay={2} />
      <pointLight ref={screenL} color="#9cc3ff" position={[0, 0.35, -D / 2 + 0.45]} distance={2.2} decay={2} />
    </>
  )
}

function RoomLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(() => {
    if (ref.current) ref.current.intensity = tod.night * 0.5
  })
  return <pointLight ref={ref} color="#ffcf9a" position={[1.2, 2.4, 0.4]} distance={6} decay={1.6} />
}
