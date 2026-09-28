import { create } from 'zustand'
import {
  BUNDLES,
  CHAIR_IDS,
  DESK_IDS,
  MAX_SCREENS,
  MONITOR_IDS,
  PRODUCTS,
  PRODUCT_BY_ID,
  getVariant,
  rateOf,
  type Product,
  type Tab,
} from '../data/catalog'
import { DURATIONS, durationOf, priceFor, type DurationKey } from '../lib/pricing'
import { baliNow } from '../lib/bali'
import { play, setMuted as persistMuted, isMuted } from '../lib/sound'

export type Screen = { uid: number; id: string; variant?: string }
export type Extras = Record<string, string | true>

export type Setup = {
  deskId: string
  deskVariant: string
  chairId: string
  screens: Screen[]
  extras: Extras
  duration: DurationKey
  standing: boolean
}

export type Delivery = {
  area: string
  date: string
  window: string
  name: string
  email: string
  phone: string
}

export type Hotspot = { key: string; label: string; to: string }

export type Order = { ref: string; delivery: Delivery; total: number; placedAt: number }

type View = 'build' | 'checkout' | 'done'

type State = Setup & {
  tab: Tab
  view: View
  hour: number
  followBali: boolean
  muted: boolean
  focus: { id: string; nonce: number } | null
  hoverId: string | null
  toast: { msg: string; nonce: number } | null
  lastAdded: { id: string; nonce: number } | null
  snapshot: string | null
  snapshotRequest: number
  cameraNonce: number
  hotspots: Hotspot[]
  order: Order | null
}

type Actions = {
  setTab: (t: Tab) => void
  setDesk: (id: string) => void
  setDeskVariant: (v: string) => void
  setChair: (id: string) => void
  addScreen: (id: string, variant?: string) => void
  removeScreen: (uid: number) => void
  setScreenVariant: (uid: number, variant: string) => void
  toggleExtra: (id: string, variant?: string) => void
  setExtraVariant: (id: string, variant: string) => void
  applyBundle: (id: string) => void
  surprise: () => void
  setStanding: (v: boolean) => void
  setHour: (h: number) => void
  syncBaliTime: () => void
  setDuration: (d: DurationKey) => void
  setView: (v: View) => void
  toggleMuted: () => void
  focusProduct: (id: string) => void
  setHover: (id: string | null) => void
  showToast: (msg: string) => void
  requestSnapshot: () => void
  resetCamera: () => void
  setHotspots: (h: Hotspot[]) => void
  setSnapshot: (url: string) => void
  placeOrder: (delivery: Delivery) => void
}

let uid = 1
const nextUid = () => uid++

const DEFAULT_SETUP: Setup = {
  deskId: 'desk-electric',
  deskVariant: '140',
  chairId: 'chair-fantech',
  screens: [],
  extras: { powerstrip: true },
  duration: '1m',
  standing: false,
}

// ---------- share links ----------

export function encodeSetup(s: Setup) {
  const p = new URLSearchParams()
  p.set('d', `${s.deskId}:${s.deskVariant}`)
  p.set('c', s.chairId)
  if (s.screens.length) p.set('s', s.screens.map((x) => (x.variant ? `${x.id}:${x.variant}` : x.id)).join(','))
  const ex = Object.entries(s.extras).map(([k, v]) => (v === true ? k : `${k}:${v}`))
  if (ex.length) p.set('x', ex.join(','))
  p.set('t', s.duration)
  if (s.standing) p.set('up', '1')
  return p.toString()
}

export function decodeSetup(hash: string): Setup | null {
  const raw = hash.replace(/^#/, '')
  if (!raw.includes('d=')) return null
  const p = new URLSearchParams(raw)
  const [deskId, deskVariant] = (p.get('d') ?? '').split(':')
  const desk = PRODUCT_BY_ID[deskId]
  if (!desk || !DESK_IDS.includes(deskId)) return null
  const chairId = CHAIR_IDS.includes(p.get('c') ?? '') ? (p.get('c') as string) : DEFAULT_SETUP.chairId
  const screens: Screen[] = (p.get('s') ?? '')
    .split(',')
    .filter(Boolean)
    .map((token) => {
      const [id, variant] = token.split(':')
      return { uid: nextUid(), id, variant }
    })
    .filter((x) => MONITOR_IDS.includes(x.id))
    .slice(0, MAX_SCREENS)
  const extras: Extras = {}
  for (const token of (p.get('x') ?? '').split(',').filter(Boolean)) {
    const [id, variant] = token.split(':')
    const prod = PRODUCT_BY_ID[id]
    if (!prod || prod.tab === 'desk' || prod.tab === 'chair' || prod.tab === 'screens') continue
    extras[id] = variant && prod.variants?.some((v) => v.id === variant) ? variant : true
  }
  const t = p.get('t') as DurationKey
  return {
    deskId,
    deskVariant: getVariant(desk, deskVariant)?.id ?? desk.defaultVariant ?? '',
    chairId,
    screens,
    extras,
    duration: DURATIONS.some((d) => d.key === t) ? t : DEFAULT_SETUP.duration,
    standing: p.get('up') === '1',
  }
}

export function shareUrl(s: Setup) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${encodeSetup(s)}`
}

// ---------- helpers ----------

function withSlot(extras: Extras, product: Product, value: string | true): Extras {
  const next: Extras = { ...extras }
  if (product.slot) {
    for (const id of Object.keys(next)) {
      if (id !== product.id && PRODUCT_BY_ID[id]?.slot === product.slot) delete next[id]
    }
  }
  next[product.id] = value
  return next
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function initialSetup(): Setup {
  if (typeof window !== 'undefined') {
    const fromUrl = decodeSetup(window.location.hash)
    if (fromUrl) return fromUrl
  }
  return { ...DEFAULT_SETUP, extras: { ...DEFAULT_SETUP.extras } }
}

export const useStore = create<State & Actions>((set, get) => ({
  ...initialSetup(),
  tab: 'desk',
  view: 'build',
  hour: baliNow().hourFloat,
  followBali: true,
  muted: isMuted(),
  focus: null,
  hoverId: null,
  toast: null,
  lastAdded: null,
  snapshot: null,
  snapshotRequest: 0,
  cameraNonce: 0,
  hotspots: [],
  order: null,

  setTab: (tab) => set({ tab }),

  setDesk: (id) => {
    if (get().deskId === id) return
    const p = PRODUCT_BY_ID[id]
    play('swap')
    set({ deskId: id, deskVariant: p.defaultVariant ?? '', lastAdded: { id, nonce: Date.now() } })
  },
  setDeskVariant: (v) => {
    play('tick')
    set({ deskVariant: v })
  },

  setChair: (id) => {
    if (get().chairId === id) return
    play('swap')
    set({ chairId: id, lastAdded: { id, nonce: Date.now() } })
  },

  addScreen: (id, variant) => {
    const { screens } = get()
    if (screens.length >= MAX_SCREENS) {
      get().showToast('Your desk fits three screens. Remove one to add another.')
      return
    }
    play('add')
    const p = PRODUCT_BY_ID[id]
    set({
      screens: [...screens, { uid: nextUid(), id, variant: variant ?? p.defaultVariant }],
      lastAdded: { id, nonce: Date.now() },
    })
  },
  removeScreen: (u) => {
    play('remove')
    set({ screens: get().screens.filter((s) => s.uid !== u) })
  },
  setScreenVariant: (u, variant) => set({ screens: get().screens.map((s) => (s.uid === u ? { ...s, variant } : s)) }),

  toggleExtra: (id, variant) => {
    const { extras } = get()
    const p = PRODUCT_BY_ID[id]
    if (extras[id] !== undefined && variant === undefined) {
      const next = { ...extras }
      delete next[id]
      play('remove')
      set({ extras: next })
      return
    }
    play('add')
    const value = variant ?? (p.variants ? (p.defaultVariant ?? p.variants[0].id) : true)
    const replaced = p.slot ? Object.keys(extras).find((k) => k !== id && PRODUCT_BY_ID[k]?.slot === p.slot) : undefined
    set({ extras: withSlot(extras, p, value), lastAdded: { id, nonce: Date.now() } })
    if (replaced) get().showToast(`Swapped the ${PRODUCT_BY_ID[replaced].name} for the ${p.name}.`)
  },
  setExtraVariant: (id, variant) => {
    const p = PRODUCT_BY_ID[id]
    const wasOn = get().extras[id] !== undefined
    play(wasOn ? 'tick' : 'add')
    set({ extras: withSlot(get().extras, p, variant), ...(wasOn ? {} : { lastAdded: { id, nonce: Date.now() } }) })
  },

  applyBundle: (id) => {
    const b = BUNDLES.find((x) => x.id === id)
    if (!b) return
    play('success')
    set({
      deskId: b.desk.id,
      deskVariant: b.desk.variant,
      chairId: b.chair,
      screens: b.screens.map((s) => ({ uid: nextUid(), id: s, variant: PRODUCT_BY_ID[s].defaultVariant })),
      extras: { ...b.extras },
      lastAdded: { id: b.desk.id, nonce: Date.now() },
    })
    get().showToast(`${b.name} loaded. Change anything you like.`)
  },

  surprise: () => {
    const desk = PRODUCT_BY_ID[pick(DESK_IDS)]
    const variant = desk.variants ? pick(desk.variants).id : ''
    const nScreens = pick([1, 1, 2, 2, 3])
    const screenId = pick(MONITOR_IDS.filter((m) => m !== 'mon-studio' || nScreens === 1))
    const screens: Screen[] = Array.from({ length: nScreens }, () => ({
      uid: nextUid(),
      id: nScreens === 1 ? screenId : pick(['mon-24', 'mon-27', 'mon-27-4k', 'mon-24']),
      variant: undefined,
    }))
    if (nScreens === 3 && Math.random() < 0.5) screens[1] = { uid: nextUid(), id: 'mon-34' }
    let extras: Extras = {}
    const pool = PRODUCTS.filter((p) => p.tab === 'gear' || p.tab === 'room')
    const count = 5 + Math.floor(Math.random() * 5)
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
    for (const p of shuffled) extras = withSlot(extras, p, p.variants ? pick(p.variants).id : true)
    if (!Object.keys(extras).some((k) => PRODUCT_BY_ID[k].slot === 'keyboard')) extras = withSlot(extras, PRODUCT_BY_ID['kb-mx'], 'qwerty')
    play('success')
    set({
      deskId: desk.id,
      deskVariant: variant,
      chairId: pick(CHAIR_IDS),
      screens,
      extras,
      lastAdded: { id: desk.id, nonce: Date.now() },
    })
  },

  setStanding: (v) => {
    if (get().standing === v) return
    play('motor')
    set({ standing: v })
  },

  setHour: (h) => set({ hour: ((h % 24) + 24) % 24, followBali: false }),
  syncBaliTime: () => set({ hour: baliNow().hourFloat, followBali: true }),

  setDuration: (duration) => {
    play('tick')
    set({ duration })
  },

  setView: (view) => set({ view }),

  toggleMuted: () => {
    const muted = !get().muted
    persistMuted(muted)
    set({ muted })
  },

  focusProduct: (id) => {
    const p = PRODUCT_BY_ID[id]
    if (!p) return
    set({ tab: p.tab, focus: { id, nonce: Date.now() } })
  },
  setHover: (hoverId) => set({ hoverId }),

  showToast: (msg) => set({ toast: { msg, nonce: Date.now() } }),

  requestSnapshot: () => set({ snapshotRequest: get().snapshotRequest + 1 }),
  resetCamera: () => set({ cameraNonce: get().cameraNonce + 1 }),
  setHotspots: (hotspots) => set({ hotspots }),
  setSnapshot: (snapshot) => set({ snapshot }),

  placeOrder: (delivery) => {
    const ref = `MR-${Math.random().toString(36).slice(2, 6).toUpperCase()}${String(Date.now()).slice(-3)}`
    play('success')
    set({ order: { ref, delivery, total: totals(get()).total, placedAt: Date.now() }, view: 'done' })
  },
}))

// ---------- derived data ----------

export type Line = {
  key: string
  product: Product
  variantId?: string
  variantLabel?: string
  qty: number
  unitRate: { weekly: number; monthly: number }
  total: number
}

export function lines(s: Setup): Line[] {
  const d = durationOf(s.duration)
  const out: Line[] = []
  const push = (product: Product, variantId?: string) => {
    const key = `${product.id}:${variantId ?? ''}`
    const existing = out.find((l) => l.key === key)
    const unitRate = rateOf(product, variantId)
    if (existing) {
      existing.qty += 1
      existing.total = priceFor(unitRate, d) * existing.qty
      return
    }
    const v = getVariant(product, variantId)
    out.push({
      key,
      product,
      variantId: v?.id,
      variantLabel: v?.label,
      qty: 1,
      unitRate,
      total: priceFor(unitRate, d),
    })
  }
  push(PRODUCT_BY_ID[s.deskId], s.deskVariant)
  push(PRODUCT_BY_ID[s.chairId])
  for (const sc of s.screens) push(PRODUCT_BY_ID[sc.id], sc.variant)
  for (const [id, v] of Object.entries(s.extras)) {
    const p = PRODUCT_BY_ID[id]
    if (p) push(p, v === true ? undefined : v)
  }
  return out
}

export function totals(s: Setup) {
  const d = durationOf(s.duration)
  const ls = lines(s)
  const total = ls.reduce((a, l) => a + l.total, 0)
  const weeklyTotal = ls.reduce((a, l) => a + l.unitRate.weekly * l.qty, 0)
  // A month counts as four weeks, the same way monis.rent quotes its monthly plans.
  const atWeeklyRates = d.unit === 'week' ? total : weeklyTotal * d.n * 4
  const count = ls.reduce((a, l) => a + l.qty, 0)
  return { total, count, atWeeklyRates, savings: Math.max(0, atWeeklyRates - total), duration: d, lines: ls }
}

export const selectSetup = (s: State): Setup => ({
  deskId: s.deskId,
  deskVariant: s.deskVariant,
  chairId: s.chairId,
  screens: s.screens,
  extras: s.extras,
  duration: s.duration,
  standing: s.standing,
})

if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __store: typeof useStore }).__store = useStore

// Keep the address bar shareable as the setup changes.
if (typeof window !== 'undefined') {
  let last = ''
  useStore.subscribe((s) => {
    const enc = encodeSetup(selectSetup(s))
    if (enc !== last) {
      last = enc
      history.replaceState(null, '', `#${enc}`)
    }
  })
}
