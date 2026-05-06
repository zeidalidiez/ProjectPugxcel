import { useEffect, useState } from 'react'
import { useGameStore } from '../store'

export function useReducedMotion() {
  const settingsReduced = useGameStore((s) => s.settings.reducedMotion)
  const [systemPrefers, setSystemPrefers] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemPrefers(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemPrefers(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return settingsReduced || systemPrefers
}
