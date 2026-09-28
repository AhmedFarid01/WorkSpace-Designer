import { useEffect, useRef, useState } from 'react'
import { Moon, Share2, Sun, Sunrise, Sunset, Volume2, VolumeX } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { selectSetup, shareUrl, useStore } from '../state/store'
import { formatClock, partOfDay } from '../lib/bali'

const PRESETS: [string, number][] = [
  ['Sunrise', 6.4],
  ['Midday', 12.5],
  ['Sunset', 18.1],
  ['Night', 21.5],
]

export function TimeIcon({ hour }: { hour: number }) {
  const part = partOfDay(hour)
  if (part === 'Night') return <Moon size={18} aria-hidden="true" />
  if (part === 'Sunrise') return <Sunrise size={18} aria-hidden="true" />
  if (part === 'Sunset') return <Sunset size={18} aria-hidden="true" />
  return <Sun size={18} aria-hidden="true" />
}

export async function copyShareLink() {
  const url = shareUrl(selectSetup(useStore.getState()))
  const { showToast } = useStore.getState()
  try {
    await navigator.clipboard.writeText(url)
    showToast('Link copied. Anyone who opens it sees this exact setup.')
  } catch {
    window.prompt('Copy this link to share your setup', url)
  }
}

export function TopBar() {
  const { hour, followBali, muted } = useStore(useShallow((s) => ({ hour: s.hour, followBali: s.followBali, muted: s.muted })))
  const setHour = useStore((s) => s.setHour)
  const syncBaliTime = useStore((s) => s.syncBaliTime)
  const toggleMuted = useStore((s) => s.toggleMuted)
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="topbar">
      <div className="brand">
        <span className="wordmark">monis</span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-sub">Workspace builder</span>
      </div>
      <div className="topbar-spacer" />
      <div className="clock-wrap" ref={wrap}>
        <button className="pill-button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
          <TimeIcon hour={hour} />
          <span className="label">Bali</span>
          <span className="clock-value">{formatClock(hour)}</span>
        </button>
        {open && (
          <div className="clock-pop" role="dialog" aria-label="Time of day in the villa">
            <h2>Light in the villa</h2>
            <p>{followBali ? 'Following the current time in Bali.' : 'Previewing your setup at another hour.'}</p>
            <input
              className="range"
              type="range"
              min={0}
              max={23.75}
              step={0.25}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              aria-label="Hour of day"
              aria-valuetext={formatClock(hour)}
            />
            <div className="clock-presets">
              {PRESETS.map(([label, h]) => (
                <button key={label} className="chip" aria-pressed={Math.abs(hour - h) < 0.3} onClick={() => setHour(h)}>
                  {label}
                </button>
              ))}
            </div>
            {!followBali && (
              <p style={{ margin: '14px 0 0' }}>
                <button className="link-button" onClick={syncBaliTime}>
                  Back to Bali time now
                </button>
              </p>
            )}
          </div>
        )}
      </div>
      <button className="pill-button icon-button" aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted} onClick={toggleMuted}>
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      </button>
      <button className="pill-button" onClick={() => void copyShareLink()}>
        <Share2 size={17} aria-hidden="true" />
        <span className="label">Share setup</span>
      </button>
    </header>
  )
}
