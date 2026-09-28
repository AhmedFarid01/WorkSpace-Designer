import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { MAX_SCREENS, rateOf, type Product } from '../data/catalog'
import { durationOf, money, unitPrice } from '../lib/pricing'
import { useStore } from '../state/store'

export function Price({ product, variant }: { product: Product; variant?: string }) {
  const duration = useStore((s) => s.duration)
  const u = unitPrice(rateOf(product, variant), durationOf(duration))
  return (
    <span className="price">
      {money(u.amount)}
      <small>/{u.per === 'wk' ? 'week' : 'month'}</small>
    </span>
  )
}

/** Large single-choice card, used for desks and chairs. */
export function OptionCard({
  product,
  selected,
  onSelect,
  variant,
  onVariant,
  variantLabel,
}: {
  product: Product
  selected: boolean
  onSelect: () => void
  variant?: string
  onVariant?: (v: string) => void
  variantLabel?: string
}) {
  return (
    <div className={`option ${selected ? 'is-on' : ''}`} data-product={product.id}>
      <button className="option-hit" aria-pressed={selected} onClick={onSelect}>
        <img src={product.image} alt="" width={92} height={92} loading="lazy" />
        <span className="option-text">
          <span className="option-name">{product.name}</span>
          <span className="option-desc">{product.short}</span>
          <Price product={product} variant={variant} />
        </span>
        {selected && (
          <span className="check" aria-hidden="true">
            <Check strokeWidth={3} />
          </span>
        )}
      </button>
      {product.variants && onVariant && (
        <div className="variants option-variants" role="group" aria-label={`${variantLabel ?? 'Option'} for ${product.name}`}>
          {product.variants.map((v) => (
            <button key={v.id} className="chip" aria-pressed={selected && variant === v.id} onClick={() => onVariant(v.id)}>
              {v.label}
              {v.dims ? ' cm' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Multi-select tile for desk gear and room extras. */
export function ExtraTile({ product }: { product: Product }) {
  const value = useStore((s) => s.extras[product.id])
  const toggleExtra = useStore((s) => s.toggleExtra)
  const setExtraVariant = useStore((s) => s.setExtraVariant)
  const on = value !== undefined
  const current = typeof value === 'string' ? value : product.defaultVariant
  return (
    <div className={`tile ${on ? 'is-on' : ''}`} data-product={product.id}>
      <button className="tile-main" aria-pressed={on} onClick={() => toggleExtra(product.id)}>
        <img src={product.image} alt="" loading="lazy" />
        <span className="tile-text">
          <span className="tile-name">{product.name}</span>
          <Price product={product} variant={current} />
          {product.concept && <span className="tag">Concept</span>}
        </span>
        <span className={on ? 'check' : 'check is-add'} aria-hidden="true">
          {on ? <Check strokeWidth={3} /> : <Plus strokeWidth={3} />}
        </span>
        <span className="sr-only">{on ? 'Added. Select to remove.' : 'Select to add.'}</span>
      </button>
      {product.variants && (
        <div className="tile-foot">
          <div className="variants" role="group" aria-label={`${product.name} options`}>
            {product.variants.map((v) =>
              v.swatch ? (
                <button
                  key={v.id}
                  className="swatch"
                  style={{ background: v.swatch }}
                  aria-label={v.label}
                  title={v.label}
                  aria-pressed={on && current === v.id}
                  onClick={() => setExtraVariant(product.id, v.id)}
                />
              ) : (
                <button key={v.id} className="chip" aria-pressed={on && current === v.id} onClick={() => setExtraVariant(product.id, v.id)}>
                  {v.label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SHORT: Record<string, string> = {
  'mon-24': '24" A24i',
  'mon-27': '27" A27i',
  'mon-27-4k': '27" 4K',
  'mon-32': '32" Ergo',
  'mon-34': '34" Curved',
  'mon-studio': 'Studio Display',
}

export const screenShortName = (id: string) => SHORT[id] ?? id

export function ScreenTile({ product }: { product: Product }) {
  const { count, total } = useStore(
    useShallow((s) => ({ count: s.screens.filter((x) => x.id === product.id).length, total: s.screens.length })),
  )
  const addScreen = useStore((s) => s.addScreen)
  const [variant, setVariant] = useState(product.defaultVariant)
  const full = total >= MAX_SCREENS
  return (
    <div className={`tile ${count ? 'is-on' : ''}`} data-product={product.id}>
      <button className="tile-main" onClick={() => addScreen(product.id, variant)} disabled={full} aria-describedby={full ? 'screens-full' : undefined}>
        <img src={product.image} alt="" loading="lazy" />
        <span className="tile-text">
          <span className="tile-name">{product.name}</span>
          <Price product={product} variant={variant} />
        </span>
        <span className="check is-add" aria-hidden="true">
          <Plus strokeWidth={3} />
        </span>
        <span className="sr-only">Add to desk</span>
      </button>
      {count > 0 && <span className="count-badge">{count} on desk</span>}
      {product.variants && (
        <div className="tile-foot">
          <div className="variants" role="group" aria-label={`${product.name} options`}>
            {product.variants.map((v) => (
              <button key={v.id} className="chip" aria-pressed={variant === v.id} onClick={() => setVariant(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
