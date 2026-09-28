import { useShallow } from 'zustand/react/shallow'
import { selectSetup, totals, useStore } from '../state/store'
import { DURATIONS, money, type DurationKey } from '../lib/pricing'

export function DurationControl({ className = '', onPaper = false }: { className?: string; onPaper?: boolean }) {
  const duration = useStore((s) => s.duration)
  const setDuration = useStore((s) => s.setDuration)
  return (
    <div className={`segmented ${onPaper ? 'on-paper' : ''} ${className}`} role="group" aria-label="Rental period">
      {DURATIONS.map((d) => (
        <button key={d.key} aria-pressed={duration === d.key} onClick={() => setDuration(d.key)} aria-label={d.label}>
          {d.short}
        </button>
      ))}
    </div>
  )
}

export function Dock({ onReview }: { onReview: () => void }) {
  const setup = useStore(useShallow(selectSetup))
  const setDuration = useStore((s) => s.setDuration)
  const t = totals(setup)
  const thumbs = t.lines.slice(0, 6)
  return (
    <div className="dock">
      <div className="dock-inner">
        <div className="thumbs">
          {thumbs.map((l) => (
            <img key={l.key} src={l.product.image} alt="" width={38} height={38} />
          ))}
          <div className="thumbs-count">
            <strong>{t.count} items</strong>
            <span>in your setup</span>
          </div>
        </div>
        <DurationControl className="dock-duration on-paper" onPaper />
        <label className="dock-select">
          <span className="sr-only">Rental period</span>
          <select className="select-pill" value={setup.duration} onChange={(e) => setDuration(e.target.value as DurationKey)}>
            {DURATIONS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.short}
              </option>
            ))}
          </select>
        </label>
        <div className="total" aria-live="polite">
          <span className="total-value">{money(t.total)}</span>
          <span className="total-sub">
            
            for {t.duration.label}
            {t.savings > 0.5 && (
              <span className="save">
                , <em>saving {money(t.savings)}</em>
              </span>
            )}
          </span>
        </div>
        <button className="cta" onClick={onReview}>
          Review and rent
        </button>
      </div>
    </div>
  )
}
