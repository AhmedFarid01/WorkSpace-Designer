import { useEffect, useRef } from 'react'
import { Check, Download, Link2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { selectSetup, totals, useStore } from '../state/store'
import { money } from '../lib/pricing'
import { formatDateLong } from '../lib/bali'
import { Postcard, WINDOWS } from './Checkout'
import { copyShareLink } from './TopBar'

/** Frangipani flowers drifting down once, for a few seconds. */
function Petals() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)
    const W = () => canvas.clientWidth
    const flowers = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random() * W(),
      y: -40 - Math.random() * 500,
      r: 9 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      vy: 0.7 + Math.random() * 1.1,
      sway: Math.random() * 10,
      pink: i % 4 === 0,
    }))
    const start = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const t = (now - start) / 1000
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      for (const f of flowers) {
        f.y += f.vy
        f.x += Math.sin(t * 1.2 + f.sway) * 0.6
        f.rot += f.spin
        if (f.y < canvas.clientHeight + 40) alive++
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.rot)
        for (let k = 0; k < 5; k++) {
          ctx.rotate((Math.PI * 2) / 5)
          const g = ctx.createLinearGradient(0, 0, 0, -f.r)
          g.addColorStop(0, '#ffcf4d')
          g.addColorStop(0.45, f.pink ? '#ffd6e2' : '#fffaf0')
          g.addColorStop(1, f.pink ? '#f7a8c0' : '#ffffff')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.ellipse(f.r * 0.22, -f.r * 0.5, f.r * 0.32, f.r * 0.55, 0.45, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (alive > 0 && t < 12) raf = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas className="petals" ref={ref} aria-hidden="true" style={{ width: '100%', height: '100%' }} />
}

export function Confirmation() {
  const order = useStore((s) => s.order)
  const snapshot = useStore((s) => s.snapshot)
  const setView = useStore((s) => s.setView)
  const setup = useStore(useShallow(selectSetup))
  const t = totals(setup)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  if (!order) return null
  const { delivery } = order
  const win = WINDOWS.find((w) => w.id === delivery.window)
  const firstName = delivery.name.trim().split(/\s+/)[0]

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="done-title">
      <div className="done">
        <Petals />
        <div className="done-card">
          <Postcard area={delivery.area} date={delivery.date} />
          <div>
            <div className="done-mark" aria-hidden="true">
              <Check strokeWidth={3} />
            </div>
            <h1 id="done-title" ref={heading} tabIndex={-1}>
              Your setup is rented{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="done-lede">
              We'll deliver and set everything up in {delivery.area} on {formatDateLong(delivery.date)}, between {win?.hours ?? 'your chosen hours'}. Your rental details
              go to {delivery.email}.
            </p>
            <dl className="facts">
              <div>
                <dt>Order</dt>
                <dd>{order.ref}</dd>
              </div>
              <div>
                <dt>Items</dt>
                <dd>{t.count}</dd>
              </div>
              <div>
                <dt>{t.duration.label}</dt>
                <dd>{money(order.total)}</dd>
              </div>
            </dl>
            <div className="done-actions">
              <button className="cta" onClick={() => setView('build')}>
                Back to my setup
              </button>
              <button className="ghost" onClick={() => void copyShareLink()}>
                <Link2 aria-hidden="true" />
                Copy share link
              </button>
              {snapshot && (
                <a className="ghost" href={snapshot} download="my-bali-office.jpg">
                  <Download aria-hidden="true" />
                  Save postcard
                </a>
              )}
            </div>
            <p className="line-meta" style={{ marginTop: 18 }}>
              Demo checkout. No payment was taken and no order was sent to monis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
