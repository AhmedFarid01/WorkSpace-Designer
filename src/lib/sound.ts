// Tiny synthesized UI sounds. No audio files, nothing plays until the user interacts.
let ctx: AudioContext | null = null
let muted = false

try {
  muted = localStorage.getItem('monis-muted') === '1'
} catch {
  /* storage unavailable */
}

export function isMuted() {
  return muted
}

export function setMuted(v: boolean) {
  muted = v
  try {
    localStorage.setItem('monis-muted', v ? '1' : '0')
  } catch {
    /* storage unavailable */
  }
}

function audio() {
  if (muted) return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freqFrom: number, freqTo: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + delay
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freqFrom, t0)
  osc.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export type Sfx = 'add' | 'remove' | 'swap' | 'motor' | 'success' | 'tick'

export function play(sfx: Sfx) {
  switch (sfx) {
    case 'add':
      tone(520, 880, 0.12, 'sine', 0.08)
      tone(880, 1320, 0.1, 'sine', 0.04, 0.05)
      break
    case 'remove':
      tone(660, 330, 0.14, 'sine', 0.06)
      break
    case 'swap':
      tone(440, 660, 0.1, 'triangle', 0.06)
      break
    case 'tick':
      tone(1200, 1000, 0.04, 'square', 0.015)
      break
    case 'motor': {
      const a = audio()
      if (!a) return
      const t0 = a.currentTime
      const osc = a.createOscillator()
      const filter = a.createBiquadFilter()
      const g = a.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(90, t0)
      osc.frequency.linearRampToValueAtTime(120, t0 + 1.1)
      filter.type = 'lowpass'
      filter.frequency.value = 420
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(0.035, t0 + 0.15)
      g.gain.setValueAtTime(0.035, t0 + 0.95)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.25)
      osc.connect(filter).connect(g).connect(a.destination)
      osc.start(t0)
      osc.stop(t0 + 1.3)
      break
    }
    case 'success':
      ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, f * 1.01, 0.28, 'sine', 0.06, i * 0.09))
      break
  }
}
