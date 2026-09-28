import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Armchair, Info, Keyboard, Monitor, TreePalm, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { BUNDLES, MAX_SCREENS, PRODUCTS, PRODUCT_BY_ID, TABS, type Product, type Tab } from '../data/catalog'
import { useStore } from '../state/store'
import { ExtraTile, OptionCard, ScreenTile, screenShortName } from './ProductCards'

function DeskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h18" />
      <path d="M6 8v11M18 8v11" />
      <path d="M4 19h4M16 19h4" />
      <path d="M9 5h6" />
    </svg>
  )
}

const ICONS: Record<Tab, ReactNode> = {
  desk: <DeskIcon />,
  chair: <Armchair aria-hidden="true" />,
  screens: <Monitor aria-hidden="true" />,
  gear: <Keyboard aria-hidden="true" />,
  room: <TreePalm aria-hidden="true" />,
}

const byTab = (t: Tab) => PRODUCTS.filter((p) => p.tab === t)

function grouped(t: Tab) {
  const out: { group: string; items: Product[] }[] = []
  for (const p of byTab(t)) {
    const g = out.find((x) => x.group === p.group)
    if (g) g.items.push(p)
    else out.push({ group: p.group, items: [p] })
  }
  return out
}

function DeskTab() {
  const { deskId, deskVariant } = useStore(useShallow((s) => ({ deskId: s.deskId, deskVariant: s.deskVariant })))
  const setDesk = useStore((s) => s.setDesk)
  const setDeskVariant = useStore((s) => s.setDeskVariant)
  return (
    <>
      <p className="tab-intro">All three go from sitting to standing height. Pick a size, then try Stand on the room.</p>
      <div className="stack">
        {byTab('desk').map((p) => (
          <OptionCard
            key={p.id}
            product={p}
            selected={deskId === p.id}
            onSelect={() => setDesk(p.id)}
            variant={deskId === p.id ? deskVariant : p.defaultVariant}
            variantLabel="Size"
            onVariant={(v) => {
              if (deskId !== p.id) setDesk(p.id)
              setDeskVariant(v)
            }}
          />
        ))}
      </div>
    </>
  )
}

function ChairTab() {
  const chairId = useStore((s) => s.chairId)
  const setChair = useStore((s) => s.setChair)
  return (
    <>
      <p className="tab-intro">Every chair has a breathable mesh back, which matters in Bali humidity.</p>
      <div className="stack">
        {byTab('chair').map((p) => (
          <OptionCard key={p.id} product={p} selected={chairId === p.id} onSelect={() => setChair(p.id)} />
        ))}
      </div>
    </>
  )
}

function ScreensTab() {
  const screens = useStore((s) => s.screens)
  const removeScreen = useStore((s) => s.removeScreen)
  const full = screens.length >= MAX_SCREENS
  return (
    <>
      <div className="on-desk">
        <div className="on-desk-head">
          On your desk
          <span>
            {screens.length} of {MAX_SCREENS}
          </span>
        </div>
        {screens.length ? (
          <div className="on-desk-list">
            {screens.map((s) => (
              <button key={s.uid} className="chip is-on" onClick={() => removeScreen(s.uid)} aria-label={`Remove ${PRODUCT_BY_ID[s.id].name}`}>
                {screenShortName(s.id)}
                <X aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-note">No screens yet. Add up to three and they line up left to right.</p>
        )}
        {full && (
          <p className="empty-note" id="screens-full">
            Your desk is full. Remove a screen to add another.
          </p>
        )}
      </div>
      <div className="grid">
        {byTab('screens').map((p) => (
          <ScreenTile key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}

function ExtrasTab({ tab }: { tab: 'gear' | 'room' }) {
  return (
    <>
      {grouped(tab).map((g) => (
        <section key={g.group}>
          <h3 className="group-title">{g.group}</h3>
          <div className="grid">
            {g.items.map((p) => (
              <ExtraTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
      {tab === 'room' && (
        <p className="note">
          <Info aria-hidden="true" />
          Plants are a styling idea for monis and are not in the catalog yet. Everything else is real gear with real prices.
        </p>
      )}
    </>
  )
}

export function Panel() {
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const applyBundle = useStore((s) => s.applyBundle)
  const focus = useStore((s) => s.focus)
  const counts = useStore(
    useShallow((s) => {
      const extras = Object.keys(s.extras)
      return {
        screens: s.screens.length,
        gear: extras.filter((id) => PRODUCT_BY_ID[id]?.tab === 'gear').length,
        room: extras.filter((id) => PRODUCT_BY_ID[id]?.tab === 'room').length,
      }
    }),
  )
  const body = useRef<HTMLDivElement>(null)
  const lastFocus = useRef(0)

  useLayoutEffect(() => {
    if (focus && focus.nonce !== lastFocus.current) return
    if (body.current) body.current.scrollTop = 0
  }, [tab, focus])

  useEffect(() => {
    if (!focus || focus.nonce === lastFocus.current) return
    lastFocus.current = focus.nonce
    const el = body.current?.querySelector<HTMLElement>(`[data-product="${focus.id}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    el.classList.remove('flash')
    void el.offsetWidth
    el.classList.add('flash')
    const t = window.setTimeout(() => el.classList.remove('flash'), 1500)
    return () => window.clearTimeout(t)
  }, [focus])

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab)
    if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length].id)
    else if (e.key === 'ArrowLeft') setTab(TABS[(i - 1 + TABS.length) % TABS.length].id)
    else return
    e.preventDefault()
  }

  return (
    <aside className="panel" aria-label="Choose your gear">
      <div className="panel-head">
        <h2>Start from a monis bundle</h2>
        <div className="bundles">
          {BUNDLES.map((b) => (
            <button key={b.id} className="bundle" onClick={() => applyBundle(b.id)}>
              <strong>{b.name}</strong>
              <span>{b.blurb}</span>
            </button>
          ))}
        </div>
        <div className="tabs" role="tablist" aria-label="Gear categories" onKeyDown={onTabKey}>
          {TABS.map((t) => {
            const count = t.id === 'screens' || t.id === 'gear' || t.id === 'room' ? counts[t.id] : 0
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                className="tab"
                aria-selected={tab === t.id}
                aria-controls="panel-body"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
              >
                {ICONS[t.id]}
                {t.label}
                {count > 0 && <span className="tab-badge">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="panel-body" id="panel-body" role="tabpanel" aria-labelledby={`tab-${tab}`} ref={body} tabIndex={0}>
        {tab === 'desk' && <DeskTab />}
        {tab === 'chair' && <ChairTab />}
        {tab === 'screens' && <ScreensTab />}
        {tab === 'gear' && <ExtrasTab tab="gear" />}
        {tab === 'room' && <ExtrasTab tab="room" />}
      </div>
    </aside>
  )
}
