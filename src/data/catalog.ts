// Product data mirrors the monis.rent catalog (names, weekly/monthly rates, photos).
// Items flagged `concept` are styling ideas that are not in the live catalog yet.

export type Rate = { weekly: number; monthly: number }

export type Variant = {
  id: string
  label: string
  rate?: Rate
  /** Desk top size in metres, used by the 3D desk. */
  dims?: [number, number]
  /** Colour swatch shown in the picker and used by the 3D model. */
  swatch?: string
}

export type Tab = 'desk' | 'chair' | 'screens' | 'gear' | 'room'

export type Product = {
  id: string
  name: string
  short: string
  tab: Tab
  group: string
  /** Products sharing a slot replace each other (one keyboard, one mouse...). */
  slot?: string
  rate: Rate
  variants?: Variant[]
  defaultVariant?: string
  image: string
  slug?: string
  concept?: boolean
}

const img = (name: string) => `${import.meta.env.BASE_URL}products/${name}.webp`

export const PRODUCTS: Product[] = [
  // Desks
  {
    id: 'desk-electric',
    name: 'Electrical Adjustable Desk',
    short: 'Quiet single-motor sit-stand desk, 70–118 cm, matte black top.',
    tab: 'desk',
    group: 'Desks',
    rate: { weekly: 10, monthly: 28 },
    variants: [
      { id: '120', label: '120 × 60', rate: { weekly: 9, monthly: 26 }, dims: [1.2, 0.6] },
      { id: '140', label: '140 × 60', rate: { weekly: 10, monthly: 28 }, dims: [1.4, 0.6] },
      { id: '140w', label: '140 × 70', rate: { weekly: 12, monthly: 32 }, dims: [1.4, 0.7] },
    ],
    defaultVariant: '140',
    image: img('desk-electric'),
    slug: 'electrical-adjustable-desk',
  },
  {
    id: 'desk-dual',
    name: 'Dual-Motor Electric Standing Desk',
    short: 'Two motors, 3-stage columns, 120 kg capacity, walnut-finish top.',
    tab: 'desk',
    group: 'Desks',
    rate: { weekly: 14, monthly: 36 },
    variants: [
      { id: '120', label: '120 × 70', rate: { weekly: 12, monthly: 32 }, dims: [1.2, 0.7] },
      { id: '140', label: '140 × 70', rate: { weekly: 14, monthly: 36 }, dims: [1.4, 0.7] },
      { id: '160', label: '160 × 70', rate: { weekly: 16, monthly: 40 }, dims: [1.6, 0.7] },
    ],
    defaultVariant: '140',
    image: img('desk-dual'),
    slug: 'dual-motor-electric-standing-desk',
  },
  {
    id: 'desk-mech',
    name: 'Mechanical Adjustable Desk',
    short: 'Hand-crank height from 70 to 120 cm. No power needed, white top.',
    tab: 'desk',
    group: 'Desks',
    rate: { weekly: 12, monthly: 28 },
    variants: [
      { id: '120', label: '120 × 70', rate: { weekly: 12, monthly: 28 }, dims: [1.2, 0.7] },
      { id: '160', label: '160 × 80', rate: { weekly: 15, monthly: 36 }, dims: [1.6, 0.8] },
    ],
    defaultVariant: '120',
    image: img('desk-mech'),
    slug: 'adjustable-wooden-desk',
  },

  // Chairs
  {
    id: 'chair-fantech',
    name: 'Ergonomic Office Chair',
    short: 'Mesh back, 4D armrests, adjustable headrest and a retractable leg rest.',
    tab: 'chair',
    group: 'Chairs',
    rate: { weekly: 9, monthly: 24 },
    image: img('chair-fantech'),
    slug: 'ergonomic-office-chair',
  },
  {
    id: 'chair-haru',
    name: 'Ergonomic Chair Furradec',
    short: 'Furradec Haru Plus with a sculpted mesh back and dynamic lumbar.',
    tab: 'chair',
    group: 'Chairs',
    rate: { weekly: 13, monthly: 32 },
    image: img('chair-haru'),
    slug: 'ergonomic-chair-furradec-cm',
  },
  {
    id: 'chair-anya',
    name: 'Ergonomic Office Chair Anya',
    short: 'Modena Anya in grey mesh with a polished chrome base.',
    tab: 'chair',
    group: 'Chairs',
    rate: { weekly: 13, monthly: 32 },
    image: img('chair-anya'),
    slug: 'ergonomic-office-chair-anya-cm',
  },

  // Screens
  {
    id: 'mon-24',
    name: '24" Full HD Office Monitor A24i',
    short: 'Xiaomi 23.8" IPS, 144 Hz, 99% sRGB. The everyday workhorse.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 9, monthly: 26 },
    image: img('mon-24'),
    slug: '24-full-hd-office-monitor-a24i-2026',
  },
  {
    id: 'mon-27',
    name: '27" Full HD Office Monitor A27i',
    short: 'Xiaomi 27" IPS at 100 Hz with 100% sRGB.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 10, monthly: 32 },
    image: img('mon-27a'),
    slug: '27-work-monitor-a27i',
  },
  {
    id: 'mon-27-4k',
    name: '27" 4K Multimedia Monitor',
    short: 'Redmi 4K IPS with one-cable USB-C, 95% DCI-P3, HDR.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 17, monthly: 52 },
    variants: [
      { id: 'usbc', label: 'USB-C', rate: { weekly: 17, monthly: 52 } },
      { id: 'hdmi', label: 'HDMI', rate: { weekly: 16, monthly: 48 } },
    ],
    defaultVariant: 'usbc',
    image: img('mon-27-4k'),
    slug: '27-4-k-multimedia-monitor',
  },
  {
    id: 'mon-32',
    name: '32" QHD Ergonomic Monitor',
    short: 'LG Ergo on a clamp arm that floats the screen off your desk. 96 W USB-C.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 26, monthly: 76 },
    image: img('mon-32'),
    slug: '32-4-k-ergonomic-monitor',
  },
  {
    id: 'mon-34',
    name: '34" 4K Curved Monitor',
    short: 'Xiaomi ultrawide 3440 × 1440 at 144 Hz. Wraps around your view.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 23, monthly: 76 },
    image: img('mon-34'),
    slug: '4-k-ultra-wide-34',
  },
  {
    id: 'mon-studio',
    name: '27" 5K Apple Studio Display',
    short: '5K Retina, 600 nits, 12 MP Center Stage camera and six speakers.',
    tab: 'screens',
    group: 'Monitors',
    rate: { weekly: 109, monthly: 316 },
    variants: [
      { id: 'standard', label: 'Standard glass', rate: { weekly: 109, monthly: 316 } },
      { id: 'nano', label: 'Nano-texture', rate: { weekly: 119, monthly: 340 } },
    ],
    defaultVariant: 'standard',
    image: img('mon-studio'),
    slug: 'apple-studio-display',
  },

  // Desk gear
  {
    id: 'macbook',
    name: 'Apple MacBook Neo',
    short: '13" Liquid Retina, A18 Pro, up to 16 hours of battery.',
    tab: 'gear',
    group: 'Computers',
    slot: 'laptop',
    rate: { weekly: 32, monthly: 96 },
    variants: [
      { id: 'silver', label: 'Silver', swatch: '#d9dbde' },
      { id: 'blush', label: 'Blush', swatch: '#e9c3bd' },
      { id: 'citrus', label: 'Citrus', swatch: '#dfe07e' },
      { id: 'indigo', label: 'Indigo', swatch: '#4c55a3' },
    ],
    defaultVariant: 'silver',
    image: img('macbook'),
    slug: 'apple-mac-book-neo',
  },
  {
    id: 'macmini',
    name: 'Apple Mac Mini M4',
    short: 'M4, 16 GB memory, Thunderbolt 4. Tiny desktop, serious power.',
    tab: 'gear',
    group: 'Computers',
    rate: { weekly: 39, monthly: 116 },
    image: img('macmini'),
    slug: 'apple-mac-mini-m4',
  },
  {
    id: 'kb-mx',
    name: 'Logitech MX Keyboard',
    short: 'Backlit keys, Easy-Switch between three computers.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    slot: 'keyboard',
    rate: { weekly: 9, monthly: 24 },
    variants: [
      { id: 'qwerty', label: 'QWERTY' },
      { id: 'qwertz', label: 'QWERTZ' },
    ],
    defaultVariant: 'qwerty',
    image: img('kb-mx'),
    slug: 'logitech-mx-keyboard',
  },
  {
    id: 'kb-magic',
    name: 'Apple Magic Keyboard',
    short: 'Touch ID and a numeric keypad.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    slot: 'keyboard',
    rate: { weekly: 12, monthly: 32 },
    variants: [
      { id: 'qwerty', label: 'QWERTY' },
      { id: 'qwertz', label: 'QWERTZ' },
    ],
    defaultVariant: 'qwerty',
    image: img('kb-magic'),
    slug: 'apple-magic-keyboard',
  },
  {
    id: 'mouse-mx',
    name: 'Logitech MX Master Mouse S3',
    short: 'Sculpted, 8,000 DPI, 70 days on a charge.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    slot: 'mouse',
    rate: { weekly: 5, monthly: 12 },
    image: img('mouse-mx'),
    slug: 'logitech-mx-master-mouse-s3',
  },
  {
    id: 'mouse-magic',
    name: 'Apple Magic Mouse',
    short: 'Multi-touch surface, pairs automatically.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    slot: 'mouse',
    rate: { weekly: 9, monthly: 24 },
    image: img('mouse-magic'),
    slug: 'apple-magic-mouse',
  },
  {
    id: 'trackpad',
    name: 'Apple Magic Trackpad',
    short: 'Big multi-touch glass surface.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    rate: { weekly: 10, monthly: 28 },
    image: img('trackpad'),
    slug: 'apple-magic-trackpad',
  },
  {
    id: 'mousepad',
    name: 'Mouse Pad',
    short: 'Smooth fabric, anti-slip base, stitched edges.',
    tab: 'gear',
    group: 'Keyboard and mouse',
    rate: { weekly: 2, monthly: 4 },
    image: img('mousepad'),
    slug: 'mouse-pad',
  },
  {
    id: 'laptop-stand',
    name: 'Ergonomic Laptop Stand',
    short: 'Raises any 10–17" laptop to a healthier angle.',
    tab: 'gear',
    group: 'Desk upgrades',
    rate: { weekly: 3, monthly: 8 },
    image: img('laptop-stand'),
    slug: 'ergonomic-laptop-stand',
  },
  {
    id: 'monitor-stand',
    name: 'Adjustable Monitor Stand',
    short: 'Lifts your main screen 11–18 cm to eye level.',
    tab: 'gear',
    group: 'Desk upgrades',
    rate: { weekly: 3, monthly: 8 },
    image: img('monitor-stand'),
    slug: 'adjustable-monitor-stand',
  },
  {
    id: 'lightbar',
    name: 'Monitor Light Bar',
    short: 'Clips on your screen and lights the desk, not your eyes.',
    tab: 'gear',
    group: 'Desk upgrades',
    rate: { weekly: 5, monthly: 12 },
    image: img('lightbar'),
    slug: 'metal-monitor-light-bar',
  },
  {
    id: 'dock',
    name: 'Display Docking Station',
    short: 'Triple-display dock with 100 W laptop charging.',
    tab: 'gear',
    group: 'Desk upgrades',
    rate: { weekly: 8, monthly: 18 },
    image: img('dock'),
    slug: 'display-docking-station',
  },
  {
    id: 'powerstrip',
    name: 'Smart Power Strip 3',
    short: 'EU, US and AU sockets plus 3 USB ports. No adapter hunt.',
    tab: 'gear',
    group: 'Desk upgrades',
    rate: { weekly: 1.5, monthly: 4 },
    image: img('powerstrip'),
    slug: 'international-power-strip',
  },
  {
    id: 'webcam',
    name: 'Logitech 4K Webcam',
    short: 'Brio 4K with 5× zoom and noise-cancelling mics.',
    tab: 'gear',
    group: 'Calls and audio',
    rate: { weekly: 9, monthly: 24 },
    image: img('webcam'),
    slug: 'logitech-4-k-webcam',
  },
  {
    id: 'headphones',
    name: 'Wireless Headphones',
    short: 'Logitech Zone 300 with dual noise-cancelling mics.',
    tab: 'gear',
    group: 'Calls and audio',
    rate: { weekly: 7, monthly: 25.2 },
    image: img('headphones'),
    slug: 'logitech-wireless-headphones',
  },
  {
    id: 'mic',
    name: 'Podcast Microphone Kit',
    short: 'Shure MV7 with USB and XLR. Sounds like a studio.',
    tab: 'gear',
    group: 'Calls and audio',
    rate: { weekly: 18, monthly: 48 },
    variants: [
      { id: 'mv7', label: 'MV7', rate: { weekly: 18, monthly: 48 } },
      { id: 'mv7plus', label: 'MV7+', rate: { weekly: 18, monthly: 56 } },
    ],
    defaultVariant: 'mv7',
    image: img('mic'),
    slug: 'podcast-microphone-kit',
  },
  {
    id: 'boom-arm',
    name: 'Microphone Boom Arm',
    short: '800 mm reach, clamps to the desk edge.',
    tab: 'gear',
    group: 'Calls and audio',
    rate: { weekly: 3, monthly: 10.8 },
    image: img('boom-arm'),
    slug: 'microphone-boom-arm',
  },

  // Room
  {
    id: 'lamp-1s',
    name: 'Smart LED Desk Lamp 1S',
    short: '520 lm, warm to cool white, flicker-free.',
    tab: 'room',
    group: 'Lighting',
    rate: { weekly: 4, monthly: 12 },
    variants: [
      { id: 'white', label: 'White', swatch: '#f2f2f0' },
      { id: 'black', label: 'Black', swatch: '#222426' },
    ],
    defaultVariant: 'black',
    image: img('lamp-1s'),
    slug: 'smart-led-desk-lamp-1-s',
  },
  {
    id: 'lamp-hue',
    name: 'Hue Signe Gradient Lamp',
    short: 'Multicolour gradient light that paints the wall behind your desk.',
    tab: 'room',
    group: 'Lighting',
    rate: { weekly: 14, monthly: 36 },
    variants: [
      { id: 'black', label: 'Black', swatch: '#222426' },
      { id: 'white', label: 'White', swatch: '#f2f2f0' },
    ],
    defaultVariant: 'black',
    image: img('lamp-hue'),
    slug: 'hue-signe-gradient-lamp',
  },
  {
    id: 'plant-monstera',
    name: 'Monstera in a woven basket',
    short: 'A big-leaf floor plant for the corner.',
    tab: 'room',
    group: 'Plants',
    rate: { weekly: 4, monthly: 10 },
    image: img('plant-monstera'),
    concept: true,
  },
  {
    id: 'plant-snake',
    name: 'Snake plant',
    short: 'Upright, hard to kill, cleans the air.',
    tab: 'room',
    group: 'Plants',
    rate: { weekly: 3, monthly: 8 },
    image: img('plant-snake'),
    concept: true,
  },
  {
    id: 'plant-desk',
    name: 'Desk succulents',
    short: 'Three tiny pots for the corner of your desk.',
    tab: 'room',
    group: 'Plants',
    rate: { weekly: 2, monthly: 5 },
    image: img('plant-desk'),
    concept: true,
  },
  {
    id: 'fan',
    name: 'Smart Tower Fan',
    short: '150° oscillation at 28.7 dB. Quieter than the geckos.',
    tab: 'room',
    group: 'Bali comfort',
    rate: { weekly: 8, monthly: 20 },
    image: img('fan'),
    slug: 'smart-tower-fan',
  },
  {
    id: 'dehumidifier',
    name: 'Smart Dehumidifier Lite',
    short: 'Pulls 13 L a day out of the air. Your gear will thank you.',
    tab: 'room',
    group: 'Bali comfort',
    rate: { weekly: 9, monthly: 24 },
    image: img('dehumid'),
    slug: 'smart-dehumidifier-lite',
  },
  {
    id: 'purifier',
    name: 'Smart Air Purifier',
    short: 'Covers 50 m² with 5-layer filtration.',
    tab: 'room',
    group: 'Bali comfort',
    rate: { weekly: 11, monthly: 28 },
    image: img('purifier'),
    slug: 'smart-air-purifier',
  },
  {
    id: 'starlink',
    name: 'Starlink Kit (incl. plan)',
    short: 'Up to 220 Mbps from the sky. Calls survive the rainy season.',
    tab: 'room',
    group: 'Bali comfort',
    rate: { weekly: 62, monthly: 196 },
    variants: [
      { id: 'standard', label: 'Standard', rate: { weekly: 62, monthly: 196 } },
      { id: 'v4', label: 'V4 Gen 3', rate: { weekly: 75, monthly: 236 } },
    ],
    defaultVariant: 'standard',
    image: img('starlink'),
    slug: 'starlink-kit-incl-plan',
  },
  {
    id: 'nespresso',
    name: 'Nespresso Essenza Mini',
    short: '19-bar espresso in 25 seconds, in red.',
    tab: 'room',
    group: 'Coffee and breaks',
    rate: { weekly: 12, monthly: 28 },
    image: img('nespresso'),
    slug: 'nespresso-essenza-coffee-machine',
  },
  {
    id: 'fridge',
    name: 'Mini Bar Fridge',
    short: '46 L for cold brew and coconuts.',
    tab: 'room',
    group: 'Coffee and breaks',
    rate: { weekly: 6, monthly: 14 },
    image: img('minifridge'),
    slug: 'mini-bar-fridge',
  },
  {
    id: 'speaker',
    name: 'Marshall Woburn III',
    short: '110 W Bluetooth speaker with analog knobs.',
    tab: 'room',
    group: 'Coffee and breaks',
    rate: { weekly: 24, monthly: 68 },
    image: img('marshall'),
    slug: 'marshall-woburn-ii-bluetooth',
  },
  {
    id: 'walkpad',
    name: 'Foldable Walking Pad R2 Pro',
    short: 'Walk while you work. Slides under a standing desk.',
    tab: 'room',
    group: 'Move and focus',
    rate: { weekly: 28, monthly: 72 },
    image: img('walkpad'),
    slug: 'foldable-walk-pad',
  },
  {
    id: 'whiteboard',
    name: 'Magnetic Whiteboard',
    short: '60 × 90 cm board for plans, sprints and doodles.',
    tab: 'room',
    group: 'Move and focus',
    rate: { weekly: 6.5, monthly: 18 },
    image: img('whiteboard'),
    slug: 'magnetic-whiteboard',
  },
]

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export const DESK_IDS = PRODUCTS.filter((p) => p.tab === 'desk').map((p) => p.id)
export const CHAIR_IDS = PRODUCTS.filter((p) => p.tab === 'chair').map((p) => p.id)
export const MONITOR_IDS = PRODUCTS.filter((p) => p.tab === 'screens').map((p) => p.id)

export const MAX_SCREENS = 3

export const TABS: { id: Tab; label: string }[] = [
  { id: 'desk', label: 'Desk' },
  { id: 'chair', label: 'Chair' },
  { id: 'screens', label: 'Screens' },
  { id: 'gear', label: 'Desk gear' },
  { id: 'room', label: 'Room' },
]

export function getVariant(p: Product, variantId?: string): Variant | undefined {
  if (!p.variants) return undefined
  return p.variants.find((v) => v.id === variantId) ?? p.variants.find((v) => v.id === p.defaultVariant) ?? p.variants[0]
}

export function rateOf(p: Product, variantId?: string): Rate {
  return getVariant(p, variantId)?.rate ?? p.rate
}

export function productUrl(p: Product) {
  return p.slug ? `https://monis.rent/products/${p.slug}` : undefined
}

/** The four real monis.rent bundles, used as quick starts. */
export type Bundle = {
  id: string
  name: string
  blurb: string
  desk: { id: string; variant: string }
  chair: string
  screens: string[]
  extras: Record<string, string | true>
}

export const BUNDLES: Bundle[] = [
  {
    id: 'essentials',
    name: 'The Essentials',
    blurb: 'Standing desk, ergonomic chair, power strip.',
    desk: { id: 'desk-electric', variant: '140' },
    chair: 'chair-fantech',
    screens: [],
    extras: { powerstrip: true },
  },
  {
    id: 'trading',
    name: 'The Trading Setup',
    blurb: 'Ultrawide curved screen, MX combo, desk lamp.',
    desk: { id: 'desk-electric', variant: '140w' },
    chair: 'chair-fantech',
    screens: ['mon-34'],
    extras: { 'kb-mx': 'qwerty', 'mouse-mx': true, 'lamp-1s': 'black', powerstrip: true },
  },
  {
    id: 'founders',
    name: 'The Founders Setup',
    blurb: '4K USB-C screen, laptop stand, light bar.',
    desk: { id: 'desk-electric', variant: '140' },
    chair: 'chair-fantech',
    screens: ['mon-27-4k'],
    extras: { 'laptop-stand': true, 'kb-mx': 'qwerty', 'mouse-mx': true, lightbar: true, powerstrip: true },
  },
  {
    id: 'studio',
    name: 'The Studio Setup',
    blurb: 'Studio Display with Magic Keyboard and Mouse.',
    desk: { id: 'desk-electric', variant: '140' },
    chair: 'chair-fantech',
    screens: ['mon-studio'],
    extras: { 'kb-magic': 'qwerty', 'mouse-magic': true, 'lamp-1s': 'black', powerstrip: true },
  },
]
