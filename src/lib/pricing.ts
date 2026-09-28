import type { Rate } from '../data/catalog'

export type DurationKey = '1w' | '2w' | '1m' | '3m' | '6m'

export type Duration = {
  key: DurationKey
  short: string
  label: string
  unit: 'week' | 'month'
  n: number
}

export const DURATIONS: Duration[] = [
  { key: '1w', short: '1 wk', label: '1 week', unit: 'week', n: 1 },
  { key: '2w', short: '2 wk', label: '2 weeks', unit: 'week', n: 2 },
  { key: '1m', short: '1 mo', label: '1 month', unit: 'month', n: 1 },
  { key: '3m', short: '3 mo', label: '3 months', unit: 'month', n: 3 },
  { key: '6m', short: '6 mo', label: '6 months', unit: 'month', n: 6 },
]

export const durationOf = (key: DurationKey) => DURATIONS.find((d) => d.key === key) ?? DURATIONS[2]

/** Price of one item over the whole rental period. */
export function priceFor(rate: Rate, d: Duration) {
  return d.unit === 'week' ? rate.weekly * d.n : rate.monthly * d.n
}

export function unitPrice(rate: Rate, d: Duration) {
  return d.unit === 'week' ? { amount: rate.weekly, per: 'wk' } : { amount: rate.monthly, per: 'mo' }
}

export function money(v: number) {
  const rounded = Math.round(v * 100) / 100
  const hasCents = Math.abs(rounded - Math.round(rounded)) > 0.001
  return `$${rounded.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
