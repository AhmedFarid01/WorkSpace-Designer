import { useEffect, useState } from 'react'
import { useStore } from '../state/store'

export function Toast() {
  const toast = useStore((s) => s.toast)
  const [visible, setVisible] = useState<typeof toast>(null)
  useEffect(() => {
    if (!toast) return
    setVisible(toast)
    const t = window.setTimeout(() => setVisible(null), 3200)
    return () => window.clearTimeout(t)
  }, [toast])
  return (
    <div aria-live="polite" role="status">
      {visible && (
        <div className="toast" key={visible.nonce}>
          {visible.msg}
        </div>
      )}
    </div>
  )
}
