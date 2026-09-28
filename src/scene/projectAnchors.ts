import * as THREE from 'three'
import { anchors } from './anchors'
import { SIT_HEIGHT, deskState } from './deskState'

const v = new THREE.Vector3()

export function projectAnchors(camera: THREE.Camera, width: number, height: number) {
  for (const a of anchors.values()) {
    if (!a.el) continue
    v.set(a.x, a.y + (a.followDesk ? deskState.h - SIT_HEIGHT : 0), a.z).project(camera)
    const hidden = v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2
    a.el.style.visibility = hidden ? 'hidden' : 'visible'
    if (!hidden) {
      const x = (v.x * 0.5 + 0.5) * width
      const y = (-v.y * 0.5 + 0.5) * height
      a.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
    }
  }
}
