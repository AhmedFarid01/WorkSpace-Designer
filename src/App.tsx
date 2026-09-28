import { Suspense, lazy, useEffect, useState } from 'react'
import { useStore } from './state/store'
import { webglAvailable } from './lib/webgl'
import { TopBar } from './ui/TopBar'
import { SceneControls } from './ui/SceneControls'
import { Panel } from './ui/Panel'
import { Dock } from './ui/Dock'
import { Checkout } from './ui/Checkout'
import { Confirmation } from './ui/Confirmation'
import { Toast } from './ui/Toast'
import { SceneOverlay } from './ui/SceneOverlay'
import { partOfDay } from './lib/bali'

const SceneCanvas = lazy(() => import('./scene/Scene'))

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export default function App() {
  const view = useStore((s) => s.view)
  const night = useStore((s) => partOfDay(s.hour) === 'Night')
  const started = useStore((s) => s.lastAdded !== null)
  const compact = useMedia('(max-width: 900px)')
  const narrowPanel = useMedia('(max-width: 1180px)')
  const inset = compact ? 0 : (narrowPanel ? 372 : 404) + 32

  // Keep the villa's light in step with the clock in Bali.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (useStore.getState().followBali) useStore.getState().syncBaliTime()
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const review = () => {
    const s = useStore.getState()
    s.setHover(null)
    s.requestSnapshot()
    // Give the canvas one frame to capture the postcard before the sheet covers it.
    requestAnimationFrame(() => requestAnimationFrame(() => useStore.getState().setView('checkout')))
  }

  const building = view === 'build'

  return (
    <div className={`app ${night ? 'is-night' : ''}`}>
      <div className="stage">
        {webglAvailable ? (
          <Suspense fallback={<div className="stage-loading">Setting up the villa</div>}>
            <SceneCanvas inset={inset} compact={compact} paused={!building} />
          </Suspense>
        ) : (
          <div className="stage-fallback">
            <p>Your browser can't show the 3D room, but you can still build your setup and rent it.</p>
          </div>
        )}
        {building && <SceneOverlay />}
      </div>
      <div className="builder" inert={!building}>
        <TopBar />
        <section className={`intro ${started ? 'is-started' : ''}`}>
          <h1>Build your Bali office</h1>
          <p>Pick your gear, watch it land in the villa, then rent the whole setup. Delivery, setup and pickup are free.</p>
        </section>
        <SceneControls />
        <Panel />
        <Dock onReview={review} />
      </div>
      {view === 'checkout' && <Checkout />}
      {view === 'done' && <Confirmation />}
      <Toast />
    </div>
  )
}
