// World layout for the villa (metres). The desk faces the open back wall and the pool behind it.
export const ROOM = {
  floorX0: -1.7,
  floorX1: 2.6,
  floorZ0: -1.9,
  floorZ1: 2.1,
  wallH: 2.7,
  wallT: 0.16,
  openingX1: 1.3,
  terraceY: -0.12,
  poolY: -0.24,
  platform: { x0: -2.4, x1: 2.9, z0: -5.0, z1: 2.25 },
}

export const DESK_X = 0.2
/** z of the desk's back edge (against the open back wall). */
export const DESK_BACK_Z = ROOM.floorZ0 + 0.04

export const CREDENZA = { x: 2.37, z: -0.2, len: 1.5, depth: 0.46, h: 0.62 }

export const SPOTS = {
  monstera: [-1.3, 0, -1.55] as [number, number, number],
  snake: [1.55, 0, -1.62] as [number, number, number],
  purifier: [2.28, 0, -1.63] as [number, number, number],
  dehumidifier: [-1.35, 0, 1.55] as [number, number, number],
  floorLamp: [2.3, 0, 1.7] as [number, number, number],
  fan: [1.22, 0, -1.25] as [number, number, number],
  fridge: [2.36, 0, 0.98] as [number, number, number],
  starlink: [-1.2, ROOM.terraceY, -2.35] as [number, number, number],
  whiteboard: [ROOM.floorX1 - 0.015, 1.42, -0.2] as [number, number, number],
  walkpadParked: [-1.3, 0, 0.3] as [number, number, number],
}
