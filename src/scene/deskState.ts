// Mutable per-frame values shared by the desk and everything that sits on it.
export const SIT_HEIGHT = 0.73
export const STAND_HEIGHT = 1.08

export const deskState = {
  h: SIT_HEIGHT,
}

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
