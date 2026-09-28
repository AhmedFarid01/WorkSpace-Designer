// DOM elements pinned to points in the 3D scene. The canvas projects them every frame
// (see projectAnchors.ts), so labels and "add" pins stay glued to the room.
export type Anchor = { x: number; y: number; z: number; followDesk: boolean; el: HTMLElement | null }

export const anchors = new Map<string, Anchor>()

function get(key: string) {
  let a = anchors.get(key)
  if (!a) {
    a = { x: 0, y: 0, z: 0, followDesk: false, el: null }
    anchors.set(key, a)
  }
  return a
}

export function setAnchorPos(key: string, x: number, y: number, z: number, followDesk = false) {
  const a = get(key)
  a.x = x
  a.y = y
  a.z = z
  a.followDesk = followDesk
}

export function anchorRef(key: string) {
  return (el: HTMLElement | null) => {
    const a = get(key)
    a.el = el
    if (el) el.style.visibility = 'hidden'
  }
}
