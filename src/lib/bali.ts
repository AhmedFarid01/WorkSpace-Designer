// Bali runs on WITA (UTC+8), the same zone as Makassar.
const TZ = 'Asia/Makassar'

export function baliNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  const hour = Number(get('hour')) % 24
  const minute = Number(get('minute'))
  return {
    iso: `${get('year')}-${get('month')}-${get('day')}`,
    hour,
    minute,
    hourFloat: hour + minute / 60,
  }
}

export function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

export function formatDateLong(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

export function formatClock(hourFloat: number) {
  const h = Math.floor(hourFloat) % 24
  const m = Math.floor((hourFloat - Math.floor(hourFloat)) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function partOfDay(hour: number) {
  if (hour >= 5 && hour < 7.5) return 'Sunrise'
  if (hour >= 7.5 && hour < 16.5) return 'Daylight'
  if (hour >= 16.5 && hour < 19) return 'Sunset'
  return 'Night'
}
