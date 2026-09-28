import * as THREE from 'three'

// Every surface texture is painted on a canvas at runtime, so the scene ships no image assets.

const cache = new Map<string, THREE.Texture>()

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

function make(key: string, w: number, h: number, draw: Draw, opts: { repeat?: [number, number]; srgb?: boolean } = {}) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...opts.repeat)
  }
  cache.set(key, tex)
  return tex
}

export function terrazzo() {
  return make('terrazzo', 1024, 1024, (c, w, h) => {
    const r = rng(7)
    c.fillStyle = '#e6dfd4'
    c.fillRect(0, 0, w, h)
    const chips = ['#cfc4b3', '#b8ab98', '#f5f0e8', '#a9b1a6', '#d8b9a1', '#8f877c', '#efe7db']
    for (let i = 0; i < 2600; i++) {
      const x = r() * w
      const y = r() * h
      const s = 2 + r() ** 3 * 12
      c.fillStyle = chips[Math.floor(r() * chips.length)]
      c.beginPath()
      const sides = 4 + Math.floor(r() * 3)
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2 + r()
        const rr = s * (0.6 + r() * 0.5)
        c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      c.fill()
    }
  }, { repeat: [2, 2] })
}

export function limestone() {
  return make('limestone', 1024, 1024, (c, w, h) => {
    const r = rng(11)
    c.fillStyle = '#efe8dc'
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      c.fillStyle = `rgba(${170 + r() * 40},${150 + r() * 40},${120 + r() * 30},${0.02 + r() * 0.04})`
      c.beginPath()
      c.arc(r() * w, r() * h, 6 + r() * 40, 0, Math.PI * 2)
      c.fill()
    }
    for (let i = 0; i < 4000; i++) {
      c.fillStyle = `rgba(120,100,80,${r() * 0.12})`
      c.fillRect(r() * w, r() * h, 1.5, 1.5)
    }
    // Large stone blocks with soft joints.
    c.strokeStyle = 'rgba(140,120,95,0.18)'
    c.lineWidth = 2
    const rows = 4
    for (let y = 0; y < rows; y++) {
      const yy = (y / rows) * h
      c.beginPath()
      c.moveTo(0, yy)
      c.lineTo(w, yy)
      c.stroke()
      const off = y % 2 ? w / 4 : 0
      for (let x = 0; x < 3; x++) {
        const xx = off + (x / 2) * w
        c.beginPath()
        c.moveTo(xx, yy)
        c.lineTo(xx, yy + h / rows)
        c.stroke()
      }
    }
  }, { repeat: [2, 1.3] })
}

export function travertine() {
  return make('travertine', 1024, 1024, (c, w, h) => {
    const r = rng(3)
    const n = 6
    const s = w / n
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const l = 86 + r() * 5
        c.fillStyle = `hsl(${34 + r() * 6}, ${24 + r() * 8}%, ${l}%)`
        c.fillRect(x * s, y * s, s, s)
        for (let k = 0; k < 40; k++) {
          c.fillStyle = `rgba(150,120,90,${r() * 0.12})`
          c.fillRect(x * s + r() * s, y * s + r() * s, 3 + r() * 16, 1 + r() * 2)
        }
      }
    c.strokeStyle = 'rgba(120,100,80,0.35)'
    c.lineWidth = 3
    for (let i = 0; i <= n; i++) {
      c.beginPath()
      c.moveTo(i * s, 0)
      c.lineTo(i * s, h)
      c.stroke()
      c.beginPath()
      c.moveTo(0, i * s)
      c.lineTo(w, i * s)
      c.stroke()
    }
  }, { repeat: [1.6, 2.4] })
}

export function wood(kind: 'walnut' | 'teak') {
  const base = { walnut: [28, 38, 26], teak: [28, 45, 38] }[kind]
  return make(`wood-${kind}`, 1024, 256, (c, w, h) => {
    const r = rng(kind.length * 17)
    const [hue, sat, light] = base
    c.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 140; i++) {
      const y = r() * h
      const amp = 2 + r() * 6
      const freq = 0.004 + r() * 0.01
      c.strokeStyle = `hsla(${hue + r() * 6 - 3}, ${sat}%, ${light + (r() - 0.6) * 16}%, ${0.25 + r() * 0.35})`
      c.lineWidth = 0.6 + r() * 2.4
      c.beginPath()
      for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * freq + i) * amp)
      c.stroke()
    }
  })
}

export function rattan() {
  return make('rattan', 1024, 1024, (c, w, h) => {
    const r = rng(5)
    c.fillStyle = '#c9a26b'
    c.fillRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    for (let ring = 0; ring < 46; ring++) {
      const rad = (ring / 46) * (w / 2)
      const segs = 12 + ring * 6
      for (let s = 0; s < segs; s++) {
        const a0 = (s / segs) * Math.PI * 2
        const a1 = ((s + 0.8) / segs) * Math.PI * 2
        c.strokeStyle = (s + ring) % 2 ? `rgba(120,82,40,${0.45 + r() * 0.2})` : `rgba(235,205,150,${0.35 + r() * 0.2})`
        c.lineWidth = w / 46 / 2
        c.beginPath()
        c.arc(cx, cy, rad, a0, a1)
        c.stroke()
      }
    }
    c.strokeStyle = 'rgba(90,60,30,0.5)'
    c.lineWidth = 10
    c.beginPath()
    c.arc(cx, cy, w / 2 - 8, 0, Math.PI * 2)
    c.stroke()
  })
}

export function cane() {
  return make('cane', 512, 512, (c, w, h) => {
    c.fillStyle = '#d8b680'
    c.fillRect(0, 0, w, h)
    const step = 22
    c.strokeStyle = 'rgba(110,75,35,0.55)'
    c.lineWidth = 3
    for (let i = -h; i < w + h; i += step) {
      c.beginPath()
      c.moveTo(i, 0)
      c.lineTo(i + h, h)
      c.stroke()
      c.beginPath()
      c.moveTo(i + h, 0)
      c.lineTo(i, h)
      c.stroke()
    }
    c.fillStyle = 'rgba(60,40,20,0.55)'
    for (let x = 0; x < w; x += step)
      for (let y = 0; y < h; y += step) {
        c.beginPath()
        c.arc(x + step / 2, y + step / 2, 4, 0, Math.PI * 2)
        c.fill()
      }
  }, { repeat: [2, 2] })
}

export function chairMesh(tone: 'black' | 'grey') {
  return make(`mesh-${tone}`, 256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h)
    c.strokeStyle = tone === 'black' ? '#fff' : '#fff'
    c.lineWidth = 3.2
    const step = 10
    for (let i = 0; i <= w; i += step) {
      c.beginPath()
      c.moveTo(i, 0)
      c.lineTo(i, h)
      c.stroke()
      c.beginPath()
      c.moveTo(0, i)
      c.lineTo(w, i)
      c.stroke()
    }
  }, { repeat: [3, 4], srgb: false })
}

export function keyboardKeys(style: 'mx' | 'magic') {
  return make(`kb-${style}`, 1024, 320, (c, w, h) => {
    c.fillStyle = style === 'mx' ? '#2b2e33' : '#c9ccd1'
    c.fillRect(0, 0, w, h)
    const rows = [15, 15, 14, 13, 12]
    const numpad = style === 'magic'
    const mainW = numpad ? w * 0.78 : w
    const pad = 10
    const rowH = (h - pad * 2) / 6
    c.fillStyle = style === 'mx' ? '#3a3e44' : '#1d1f22'
    // Function row
    for (let i = 0; i < 14; i++) {
      const kw = (mainW - pad * 2) / 14
      c.beginPath()
      c.roundRect(pad + i * kw + 3, pad + 3, kw - 6, rowH * 0.7, 6)
      c.fill()
    }
    rows.forEach((n, ri) => {
      const kw = (mainW - pad * 2) / 15
      const y = pad + rowH * (ri + 1) + 3
      let x = pad + (15 - n) * kw * 0.5
      for (let i = 0; i < n; i++) {
        const wide = ri === 4 && i === 5 ? kw * 4 : kw
        c.beginPath()
        c.roundRect(x + 3, y, wide - 6, rowH - 6, 7)
        c.fill()
        x += wide
        if (ri === 4 && x > mainW - pad) break
      }
    })
    if (numpad) {
      const kw = (w - mainW - pad) / 4
      for (let ry = 0; ry < 5; ry++)
        for (let rx = 0; rx < 4; rx++) {
          c.beginPath()
          c.roundRect(mainW + rx * kw + 3, pad + rowH * (ry + 1) + 3, kw - 6, rowH - 6, 7)
          c.fill()
        }
    }
    if (style === 'mx') {
      c.fillStyle = 'rgba(255,255,255,0.35)'
      c.font = '600 18px sans-serif'
      c.fillText('logi', w - 70, h - 14)
    }
  })
}

export type ScreenKind = 'code' | 'chart' | 'design' | 'wave' | 'studio' | 'call' | 'mac'

export function screen(kind: ScreenKind) {
  return make(`screen-${kind}`, 1024, 576, (c, w, h) => {
    const r = rng(kind.length * 31)
    if (kind === 'code') {
      c.fillStyle = '#1b1f27'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#232833'
      c.fillRect(0, 0, 150, h)
      c.fillStyle = '#2b3140'
      c.fillRect(0, 0, w, 34)
      ;['#ff6b6b', '#ffd166', '#06d6a0'].forEach((col, i) => {
        c.fillStyle = col
        c.beginPath()
        c.arc(22 + i * 22, 17, 6, 0, Math.PI * 2)
        c.fill()
      })
      for (let i = 0; i < 14; i++) {
        c.fillStyle = 'rgba(200,210,230,0.25)'
        c.fillRect(20, 56 + i * 30, 50 + r() * 60, 10)
      }
      const palette = ['#7cc4ff', '#c792ea', '#f78c6c', '#c3e88d', '#89ddff', '#ffcb6b', '#eeffff']
      for (let i = 0; i < 20; i++) {
        let x = 180 + (i % 5 === 0 ? 0 : Math.floor(r() * 3) * 34)
        const y = 58 + i * 25
        c.fillStyle = 'rgba(255,255,255,0.18)'
        c.fillRect(165, y, 6, 10)
        const tokens = 2 + Math.floor(r() * 5)
        for (let t = 0; t < tokens; t++) {
          const tw = 30 + r() * 110
          c.fillStyle = palette[Math.floor(r() * palette.length)]
          c.fillRect(x, y, tw, 11)
          x += tw + 12
        }
      }
      c.fillStyle = '#12151b'
      c.fillRect(150, h - 120, w - 150, 120)
      c.fillStyle = '#06d6a0'
      c.font = '500 18px monospace'
      c.fillText('$ npm run dev', 170, h - 84)
      c.fillStyle = 'rgba(255,255,255,0.55)'
      c.fillText('ready in 212 ms  ->  localhost:5173', 170, h - 52)
    } else if (kind === 'chart') {
      c.fillStyle = '#0f1420'
      c.fillRect(0, 0, w, h)
      c.strokeStyle = 'rgba(255,255,255,0.06)'
      for (let x = 0; x < w; x += 64) {
        c.beginPath()
        c.moveTo(x, 0)
        c.lineTo(x, h)
        c.stroke()
      }
      for (let y = 0; y < h; y += 64) {
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(w, y)
        c.stroke()
      }
      let price = h * 0.6
      for (let i = 0; i < 46; i++) {
        const open = price
        price += (r() - 0.47) * 40
        const close = price
        const hi = Math.min(open, close) - r() * 18
        const lo = Math.max(open, close) + r() * 18
        const x = 20 + i * 21
        const up = close < open
        c.strokeStyle = c.fillStyle = up ? '#26d07c' : '#ff5b6b'
        c.beginPath()
        c.moveTo(x + 6, hi)
        c.lineTo(x + 6, lo)
        c.stroke()
        c.fillRect(x, Math.min(open, close), 12, Math.max(3, Math.abs(close - open)))
      }
      c.fillStyle = '#26d07c'
      c.font = '700 34px sans-serif'
      c.fillText('IDR/USD  +2.4%', 26, 50)
    } else if (kind === 'design') {
      c.fillStyle = '#f4f5f7'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ffffff'
      c.fillRect(0, 0, 170, h)
      c.fillRect(w - 200, 0, 200, h)
      c.fillStyle = '#e8eaee'
      for (let i = 0; i < 9; i++) c.fillRect(18, 30 + i * 40, 120, 16)
      const g = c.createLinearGradient(260, 80, 760, 480)
      g.addColorStop(0, '#0e9aa7')
      g.addColorStop(1, '#f6c453')
      c.fillStyle = g
      c.beginPath()
      c.roundRect(240, 70, 540, 300, 18)
      c.fill()
      c.fillStyle = '#14212a'
      c.fillRect(240, 400, 300, 26)
      c.fillStyle = '#9aa3aa'
      c.fillRect(240, 440, 420, 14)
      c.fillRect(240, 466, 360, 14)
      c.fillStyle = '#0e9aa7'
      for (let i = 0; i < 6; i++) c.fillRect(w - 180, 40 + i * 56, 150, 34)
    } else if (kind === 'wave') {
      const g = c.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#a8e6f0')
      g.addColorStop(0.5, '#3f9fd6')
      g.addColorStop(1, '#1b3f8f')
      c.fillStyle = g
      c.fillRect(0, 0, w, h)
      for (let i = 0; i < 7; i++) {
        c.strokeStyle = `rgba(255,255,255,${0.12 + i * 0.05})`
        c.lineWidth = 26 - i * 2
        c.beginPath()
        for (let x = 0; x <= w; x += 12) c.lineTo(x, h * 0.3 + i * 44 + Math.sin(x / 120 + i) * 40)
        c.stroke()
      }
    } else if (kind === 'studio') {
      const cols = ['#ff4d6d', '#ffb703', '#3a86ff', '#8338ec', '#06d6a0', '#fb5607']
      c.fillStyle = '#1a1446'
      c.fillRect(0, 0, w, h)
      for (let i = 0; i < 26; i++) {
        c.fillStyle = cols[i % cols.length]
        c.beginPath()
        const x = r() * w
        const y = r() * h
        c.ellipse(x, y, 60 + r() * 140, 30 + r() * 80, r() * Math.PI, 0, Math.PI * 2)
        c.fill()
      }
    } else if (kind === 'call') {
      c.fillStyle = '#20242c'
      c.fillRect(0, 0, w, h)
      const tiles = [
        ['#e9c46a', '#264653'],
        ['#f4a261', '#2a9d8f'],
        ['#90be6d', '#577590'],
        ['#e76f51', '#f1faee'],
      ]
      tiles.forEach(([bg, fg], i) => {
        const x = 24 + (i % 2) * ((w - 60) / 2 + 12)
        const y = 24 + Math.floor(i / 2) * ((h - 110) / 2 + 12)
        const tw = (w - 60) / 2
        const th = (h - 110) / 2
        c.fillStyle = bg
        c.beginPath()
        c.roundRect(x, y, tw, th, 14)
        c.fill()
        c.fillStyle = fg
        c.beginPath()
        c.arc(x + tw / 2, y + th * 0.45, th * 0.2, 0, Math.PI * 2)
        c.fill()
        c.beginPath()
        c.ellipse(x + tw / 2, y + th * 0.95, th * 0.34, th * 0.28, 0, Math.PI, 0)
        c.fill()
      })
      c.fillStyle = '#ff5b6b'
      c.beginPath()
      c.roundRect(w / 2 - 50, h - 64, 100, 42, 21)
      c.fill()
    } else {
      const g = c.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#6a5cff')
      g.addColorStop(0.5, '#b86bff')
      g.addColorStop(1, '#3fd0ff')
      c.fillStyle = g
      c.fillRect(0, 0, w, h)
      for (let i = 0; i < 9; i++) {
        c.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`
        c.beginPath()
        c.roundRect(60 + i * 100, 120 + Math.sin(i) * 60, 70, 300, 35)
        c.fill()
      }
    }
  })
}

export function grille(color: string, dot: string) {
  return make(`grille-${color}-${dot}`, 256, 256, (c, w, h) => {
    c.fillStyle = color
    c.fillRect(0, 0, w, h)
    c.fillStyle = dot
    for (let y = 4; y < h; y += 8)
      for (let x = (y / 8) % 2 ? 8 : 4; x < w; x += 8) {
        c.beginPath()
        c.arc(x, y, 2.2, 0, Math.PI * 2)
        c.fill()
      }
  }, { repeat: [2, 2] })
}

export function marshallFront() {
  return make('marshall', 1024, 768, (c, w, h) => {
    const r = rng(4)
    c.fillStyle = '#1e1c1a'
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.04)`
      c.fillRect(r() * w, r() * h, 2, 2)
    }
    c.strokeStyle = '#b89a5e'
    c.lineWidth = 8
    c.strokeRect(20, 20, w - 40, h - 40)
    c.fillStyle = '#e8d9b0'
    c.font = 'italic 700 120px Georgia, serif'
    c.textAlign = 'center'
    c.fillText('Marshall', w / 2, h / 2 + 30)
  })
}

export function whiteboardDoodles() {
  return make('whiteboard', 640, 960, (c, w, h) => {
    c.fillStyle = '#fbfbfa'
    c.fillRect(0, 0, w, h)
    c.strokeStyle = '#1f6fd1'
    c.lineWidth = 6
    c.lineCap = 'round'
    c.font = '700 64px "Comic Sans MS", "Segoe Print", cursive'
    c.fillStyle = '#1f6fd1'
    c.fillText('Q4 launch', 60, 120)
    c.strokeStyle = '#d64545'
    c.beginPath()
    c.moveTo(60, 150)
    c.bezierCurveTo(200, 170, 360, 140, 440, 160)
    c.stroke()
    const notes = ['#ffe066', '#ffadad', '#9bf6ff', '#caffbf', '#ffe066', '#bdb2ff']
    notes.forEach((col, i) => {
      c.save()
      c.translate(80 + (i % 3) * 170, 240 + Math.floor(i / 3) * 190)
      c.rotate((i % 2 ? 1 : -1) * 0.05)
      c.fillStyle = col
      c.fillRect(0, 0, 140, 140)
      c.fillStyle = 'rgba(0,0,0,0.35)'
      for (let k = 0; k < 3; k++) c.fillRect(16, 30 + k * 30, 70 + ((k * 23 + i * 17) % 40), 8)
      c.restore()
    })
    c.strokeStyle = '#2b2b2b'
    c.lineWidth = 5
    c.beginPath()
    c.moveTo(80, 760)
    c.lineTo(80, 900)
    c.lineTo(560, 900)
    c.stroke()
    c.strokeStyle = '#0e9aa7'
    c.lineWidth = 8
    c.beginPath()
    c.moveTo(80, 880)
    c.bezierCurveTo(200, 860, 300, 800, 380, 810)
    c.bezierCurveTo(460, 820, 500, 760, 560, 740)
    c.stroke()
  })
}

export function hueGradient() {
  return make('hue-gradient', 64, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#ff3d8b')
    g.addColorStop(0.45, '#ff8a3d')
    g.addColorStop(1, '#6c3dff')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  })
}

export function oceanPrint() {
  return make('print', 512, 640, (c, w, h) => {
    c.fillStyle = '#f3efe8'
    c.fillRect(0, 0, w, h)
    const g = c.createLinearGradient(0, 60, 0, h - 60)
    g.addColorStop(0, '#f6c9a8')
    g.addColorStop(0.45, '#f39c7a')
    g.addColorStop(0.46, '#2d7f9a')
    g.addColorStop(1, '#154e66')
    c.fillStyle = g
    c.fillRect(50, 50, w - 100, h - 100)
    c.fillStyle = '#fff3d6'
    c.beginPath()
    c.arc(w / 2, h * 0.43, 60, Math.PI, 0)
    c.fill()
  })
}
