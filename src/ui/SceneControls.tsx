import { Armchair, Dices, PersonStanding, RotateCcw } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store'
import { partOfDay } from '../lib/bali'

export function SceneControls() {
  const { standing, night, hasLamp } = useStore(
    useShallow((s) => ({
      standing: s.standing,
      night: partOfDay(s.hour) === 'Night',
      hasLamp: s.extras['lamp-1s'] !== undefined || s.extras['lamp-hue'] !== undefined,
    })),
  )
  const setStanding = useStore((s) => s.setStanding)
  const surprise = useStore((s) => s.surprise)
  const resetCamera = useStore((s) => s.resetCamera)
  const focusProduct = useStore((s) => s.focusProduct)

  return (
    <div className="scene-controls">
      <div className="segmented" role="group" aria-label="Desk height">
        <button aria-pressed={!standing} onClick={() => setStanding(false)}>
          <Armchair size={16} aria-hidden="true" />
          Sit
        </button>
        <button aria-pressed={standing} onClick={() => setStanding(true)}>
          <PersonStanding size={16} aria-hidden="true" />
          Stand
        </button>
      </div>
      <button className="pill-button" onClick={surprise}>
        <Dices size={17} aria-hidden="true" />
        <span className="label">Surprise me</span>
      </button>
      <button className="pill-button icon-button" aria-label="Reset the view" title="Reset the view" onClick={resetCamera}>
        <RotateCcw size={17} aria-hidden="true" />
      </button>
      {night && !hasLamp ? (
        <div className="night-hint" role="status">
          It's dark in here.
          <button onClick={() => focusProduct('lamp-1s')}>Add a lamp</button>
        </div>
      ) : (
        <span className="drag-hint">Drag to look around. Click anything in the room to swap it.</span>
      )}
    </div>
  )
}
