import { anchorRef } from '../scene/anchors'
import { PRODUCT_BY_ID, rateOf } from '../data/catalog'
import { durationOf, money, unitPrice } from '../lib/pricing'
import { useStore } from '../state/store'

function HoverLabel() {
  const id = useStore((s) => s.hoverId)
  const duration = useStore((s) => s.duration)
  const variant = useStore((s) => {
    if (!s.hoverId) return undefined
    if (s.deskId === s.hoverId) return s.deskVariant
    const v = s.extras[s.hoverId]
    return typeof v === 'string' ? v : s.screens.find((x) => x.id === s.hoverId)?.variant
  })
  const p = id ? PRODUCT_BY_ID[id] : undefined
  const u = p ? unitPrice(rateOf(p, variant), durationOf(duration)) : null
  return (
    <div className="anchor anchor-label" ref={anchorRef('hover')} aria-hidden="true" style={{ display: p ? undefined : 'none' }}>
      {p && u && (
        <div className="scene-label">
          <strong>{p.name}</strong>
          <span>
            {money(u.amount)}/{u.per === 'wk' ? 'week' : 'month'}. Click to change
          </span>
        </div>
      )}
    </div>
  )
}

/** DOM layer over the canvas: hover labels and "+ add" pins, positioned by the 3D projector. */
export function SceneOverlay() {
  const hotspots = useStore((s) => s.hotspots)
  const focusProduct = useStore((s) => s.focusProduct)
  return (
    <div className="anchors-layer">
      {hotspots.map((h) => (
        <div key={h.key} className="anchor" ref={anchorRef(`spot-${h.key}`)}>
          <button className="hotspot" onClick={() => focusProduct(h.to)}>
            <span aria-hidden="true">+</span>
            {h.label}
          </button>
        </div>
      ))}
      <HoverLabel />
    </div>
  )
}
