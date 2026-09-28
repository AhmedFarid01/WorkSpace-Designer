import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { productUrl } from '../data/catalog'
import { selectSetup, totals, useStore, type Delivery } from '../state/store'
import { money, unitPrice } from '../lib/pricing'
import { addDaysISO, baliNow, formatDateLong } from '../lib/bali'
import { DurationControl } from './Dock'

export const AREAS = ['Canggu', 'Pererenan', 'Berawa', 'Seminyak', 'Kuta', 'Jimbaran', 'Uluwatu', 'Nusa Dua', 'Sanur', 'Denpasar', 'Ubud']
export const WINDOWS = [
  { id: 'morning', label: 'Morning', hours: '9:00–12:00' },
  { id: 'afternoon', label: 'Afternoon', hours: '12:00–16:00' },
  { id: 'evening', label: 'Evening', hours: '16:00–20:00' },
]

type Errors = Partial<Record<keyof Delivery, string>>

function validate(d: Delivery, today: string): Errors {
  const e: Errors = {}
  if (!d.area) e.area = 'Choose where we should deliver.'
  if (!d.date) e.date = 'Pick a delivery date.'
  else if (d.date < today) e.date = 'Pick today or a later date.'
  if (!d.name.trim()) e.name = 'Enter the name for the delivery.'
  if (!/^\S+@\S+\.\S+$/.test(d.email.trim())) e.email = 'Enter an email so we can send your rental details.'
  return e
}

export function Postcard({ area, date }: { area?: string; date?: string }) {
  const snapshot = useStore((s) => s.snapshot)
  return (
    <figure className="postcard">
      {snapshot ? <img src={snapshot} alt="Your workspace in the villa" /> : <div className="postcard-empty" role="img" aria-label="Your workspace" />}
      <span className="stamp" aria-hidden="true">
        <span>
          <b>Bali</b>
          monis.rent
        </span>
      </span>
      <figcaption>
        <strong>Your office{area ? ` in ${area}` : ' in Bali'}</strong>
        <span>{date ? formatDateLong(date) : 'Ready when you land'}</span>
      </figcaption>
    </figure>
  )
}

export function Checkout() {
  const setup = useStore(useShallow(selectSetup))
  const setView = useStore((s) => s.setView)
  const placeOrder = useStore((s) => s.placeOrder)
  const t = totals(setup)
  const today = baliNow().iso
  const [d, setD] = useState<Delivery>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('monis-delivery') ?? 'null') as Partial<Delivery> | null
      return { area: '', window: 'morning', name: '', email: '', phone: '', ...saved, date: addDaysISO(today, 1) }
    } catch {
      return { area: '', date: addDaysISO(today, 1), window: 'morning', name: '', email: '', phone: '' }
    }
  })
  const [errors, setErrors] = useState<Errors>({})
  const [tried, setTried] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    heading.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setView('build')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView])

  const set = <K extends keyof Delivery>(k: K, v: Delivery[K]) => {
    const next = { ...d, [k]: v }
    setD(next)
    if (tried) setErrors(validate(next, today))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    const errs = validate(d, today)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      sheet.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    try {
      const { name, email, phone, area, window: w } = d
      localStorage.setItem('monis-delivery', JSON.stringify({ name, email, phone, area, window: w }))
    } catch {
      /* storage unavailable */
    }
    placeOrder(d)
  }

  const field = (k: keyof Delivery) => ({
    name: k,
    id: `f-${k}`,
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `e-${k}` : undefined,
  })

  return (
    <div className="sheet" ref={sheet} role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="sheet-bar">
        <button className="back" onClick={() => setView('build')}>
          <ArrowLeft aria-hidden="true" />
          Back to builder
        </button>
        <span className="wordmark" style={{ marginLeft: 'auto' }}>
          monis
        </span>
      </div>
      <div className="checkout">
        <div>
          <h1 id="checkout-title" ref={heading} tabIndex={-1}>
            Review and rent
          </h1>
          <Postcard area={d.area} date={d.date} />
          <h2 className="section-title">
            Your setup, {t.count} items
          </h2>
          <ul className="lines">
            {t.lines.map((l) => {
              const u = unitPrice(l.unitRate, t.duration)
              const url = productUrl(l.product)
              return (
                <li className="line" key={l.key}>
                  <img src={l.product.image} alt="" width={56} height={56} loading="lazy" />
                  <div>
                    <div className="line-name">
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          {l.product.name}
                          <ExternalLink size={12} aria-label="(opens monis.rent)" style={{ marginLeft: 6, verticalAlign: '-1px' }} />
                        </a>
                      ) : (
                        l.product.name
                      )}
                    </div>
                    <div className="line-meta">
                      {[l.variantLabel && `${l.variantLabel}${l.product.tab === 'desk' ? ' cm' : ''}`, l.qty > 1 && `${l.qty} units`, `${money(u.amount)}/${u.per === 'wk' ? 'week' : 'month'} each`]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                  <div className="line-price">
                    {money(l.total)}
                    <small>{t.duration.label}</small>
                  </div>
                </li>
              )
            })}
          </ul>
          <p style={{ marginTop: 16 }}>
            <button className="link-button" onClick={() => setView('build')}>
              Change something
            </button>
          </p>
        </div>

        <form className="summary-card" onSubmit={submit} noValidate>
          <div className="field-group">
            <h2>Rental period</h2>
            <DurationControl onPaper />
            {t.duration.unit === 'week' ? (
              <p className="line-meta" style={{ margin: 0 }}>
                Staying longer? Monthly plans cost less per week.
              </p>
            ) : (
              <p className="line-meta" style={{ margin: 0 }}>
                Monthly rates save you {money(t.savings)} compared to renting week by week.
              </p>
            )}
          </div>

          <div className="field-group">
            <h2>Delivery</h2>
            <div className="field" data-invalid={!!errors.area}>
              <label htmlFor="f-area">Area in Bali</label>
              <select {...field('area')} value={d.area} onChange={(e) => set('area', e.target.value)}>
                <option value="">Choose an area</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              {errors.area && (
                <span className="field-error" id="e-area">
                  {errors.area}
                </span>
              )}
            </div>
            <div className="field" data-invalid={!!errors.date}>
              <label htmlFor="f-date">Delivery date</label>
              <input type="date" {...field('date')} min={today} value={d.date} onChange={(e) => set('date', e.target.value)} />
              {errors.date && (
                <span className="field-error" id="e-date">
                  {errors.date}
                </span>
              )}
            </div>
            <div className="field">
              <span className="field-label" id="window-label">
                Time window
              </span>
              <div className="windows" role="radiogroup" aria-labelledby="window-label">
                {WINDOWS.map((w) => (
                  <button type="button" key={w.id} role="radio" aria-checked={d.window === w.id} className={`chip ${d.window === w.id ? 'is-on' : ''}`} onClick={() => set('window', w.id)}>
                    {w.label} {w.hours}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="field-group">
            <h2>Contact</h2>
            <div className="field" data-invalid={!!errors.name}>
              <label htmlFor="f-name">Full name</label>
              <input {...field('name')} autoComplete="name" value={d.name} onChange={(e) => set('name', e.target.value)} />
              {errors.name && (
                <span className="field-error" id="e-name">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="two-col">
              <div className="field" data-invalid={!!errors.email}>
                <label htmlFor="f-email">Email</label>
                <input type="email" {...field('email')} autoComplete="email" value={d.email} onChange={(e) => set('email', e.target.value)} />
                {errors.email && (
                  <span className="field-error" id="e-email">
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="field">
                <label htmlFor="f-phone">
                  WhatsApp <span>(optional)</span>
                </label>
                <input type="tel" {...field('phone')} autoComplete="tel" placeholder="+62" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
            </div>
          </div>

          <dl className="sums">
            <div>
              <dt>
                Rental, {t.count} items for {t.duration.label}
              </dt>
              <dd>{money(t.total)}</dd>
            </div>
            <div>
              <dt>Delivery and setup</dt>
              <dd className="free">Free</dd>
            </div>
            <div>
              <dt>Pickup when you're done</dt>
              <dd className="free">Free</dd>
            </div>
            <div className="grand">
              <dt>Total</dt>
              <dd>{money(t.total)}</dd>
            </div>
          </dl>

          <button type="submit" className="cta block">
            Rent this setup
          </button>
          <p className="fine">Demo checkout. No payment is taken and no order is sent to monis.</p>
        </form>
      </div>
    </div>
  )
}
