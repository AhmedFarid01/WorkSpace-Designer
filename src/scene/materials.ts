import * as THREE from 'three'
import { cane, limestone, terrazzo, travertine, wood } from './textures'

// Shared materials, created lazily once and reused by every model.
function lazy<T>(f: () => T) {
  let v: T | undefined
  return () => (v ??= f())
}

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)

export const M = {
  black: lazy(() => std({ color: '#1d1f22', roughness: 0.5, metalness: 0.35 })),
  blackMatte: lazy(() => std({ color: '#1a1b1e', roughness: 0.85, metalness: 0.05 })),
  graphite: lazy(() => std({ color: '#34373c', roughness: 0.6, metalness: 0.15 })),
  rubber: lazy(() => std({ color: '#121314', roughness: 0.95 })),
  chrome: lazy(() => std({ color: '#dfe2e6', roughness: 0.26, metalness: 1 })),
  aluminum: lazy(() => std({ color: '#c8cbd0', roughness: 0.32, metalness: 0.85 })),
  silverColumn: lazy(() => std({ color: '#b8bcc2', roughness: 0.35, metalness: 0.8 })),
  whitePlastic: lazy(() => std({ color: '#f3f3f0', roughness: 0.42 })),
  greyPlastic: lazy(() => std({ color: '#8d9197', roughness: 0.5, metalness: 0.2 })),
  fabric: lazy(() => std({ color: '#25272a', roughness: 0.95 })),
  glassDark: lazy(() => std({ color: '#0a0b0d', roughness: 0.08, metalness: 0.6 })),
  topBlack: lazy(() => std({ color: '#222427', roughness: 0.55, metalness: 0.05 })),
  topWhite: lazy(() => std({ color: '#f2f1ec', roughness: 0.45 })),
  walnut: lazy(() => std({ map: wood('walnut'), roughness: 0.55, color: '#ffffff' })),
  teak: lazy(() => std({ map: wood('teak'), roughness: 0.62 })),
  cane: lazy(() => std({ map: cane(), roughness: 0.8 })),
  wall: lazy(() => std({ map: limestone(), roughness: 0.92 })),
  floor: lazy(() => std({ map: terrazzo(), roughness: 0.38, metalness: 0.02 })),
  deck: lazy(() => std({ map: travertine(), roughness: 0.8 })),
  stoneSide: lazy(() => std({ color: '#cbbfa9', roughness: 0.95 })),
  ceramic: lazy(() => std({ color: '#f4f1ea', roughness: 0.25 })),
  terracotta: lazy(() => std({ color: '#b86a48', roughness: 0.85 })),
  leaf: lazy(() => std({ color: '#2f6b3d', roughness: 0.65, side: THREE.DoubleSide })),
  leafLight: lazy(() => std({ color: '#4f8f4a', roughness: 0.65, side: THREE.DoubleSide })),
  leafDeep: lazy(() => std({ color: '#1f4d2e', roughness: 0.7, side: THREE.DoubleSide })),
  soil: lazy(() => std({ color: '#3b2a20', roughness: 1 })),
  red: lazy(() => std({ color: '#c3161c', roughness: 0.3, metalness: 0.1 })),
  brass: lazy(() => std({ color: '#c8a45c', roughness: 0.3, metalness: 1 })),
}

export const BOOK_COLORS = ['#3d5a4c', '#c9b28f', '#1f3a5f', '#b5553c', '#e8e1d3', '#6b7b8c', '#2c2c2c']
