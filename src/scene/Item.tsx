import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { easing } from 'maath'
import * as THREE from 'three'
import { useStore } from '../state/store'
import { prefersReducedMotion } from './deskState'
import { setAnchorPos } from './anchors'

type Vec3 = [number, number, number]

type Props = {
  id: string
  position: Vec3
  rotationY?: number
  /** Height of the hover label above the item origin. */
  labelY?: number
  children: ReactNode
  /** Glide to new positions instead of jumping (layout changes). */
  smooth?: number
  pop?: boolean
}

const tmp = new THREE.Vector3()

const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Places a product in the scene: pops in when added, glides when the layout shifts, and is clickable. */
export function Item({ id, position, rotationY = 0, labelY = 0.4, children, smooth = 0.22, pop = true }: Props) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const born = useRef(prefersReducedMotion || !pop ? -1e9 : performance.now())
  const placed = useRef(false)
  const [px, py, pz] = position
  const target = useMemo(() => new THREE.Vector3(px, py, pz), [px, py, pz])
  const setHover = useStore((s) => s.setHover)
  const focusProduct = useStore((s) => s.focusProduct)

  useFrame((_, dt) => {
    const g = outer.current
    const p = inner.current
    if (!g || !p) return
    if (useStore.getState().hoverId === id) {
      g.getWorldPosition(tmp)
      setAnchorPos('hover', tmp.x, tmp.y + labelY, tmp.z)
    }
    if (!placed.current) {
      g.position.copy(target)
      g.rotation.y = rotationY
      placed.current = true
    } else if (prefersReducedMotion) {
      g.position.copy(target)
      g.rotation.y = rotationY
    } else {
      easing.damp3(g.position, target, smooth, dt)
      easing.dampAngle(g.rotation, 'y', rotationY, smooth, dt)
    }
    const t = Math.min(1, (performance.now() - born.current) / 560)
    if (t < 1) {
      const s = Math.max(0.001, easeOutBack(t))
      p.scale.setScalar(s)
      p.position.y = (1 - t) * (1 - t) * 0.35
    } else if (p.scale.x !== 1) {
      p.scale.setScalar(1)
      p.position.y = 0
    }
  })

  useEffect(() => {
    return () => {
      if (useStore.getState().hoverId === id) {
        useStore.getState().setHover(null)
        document.body.style.cursor = ''
      }
    }
  }, [id])

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHover(id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    if (useStore.getState().hoverId === id) setHover(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return
    focusProduct(id)
  }

  return (
    <group ref={outer} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>{children}</group>
    </group>
  )
}
