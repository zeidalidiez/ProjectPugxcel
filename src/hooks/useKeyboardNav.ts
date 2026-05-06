import { useEffect } from 'react'
import { useGameStore } from '../store'

export function useKeyboardNav() {
  const phase = useGameStore((s) => s.phase)
  const advance = useGameStore((s) => s.advanceToForecast)
  const resetRun = useGameStore((s) => s.resetRun)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement
        if (active && active !== document.body && active.tagName !== 'BODY') {
          return
        }
        e.preventDefault()
        advance()
      }
      if (e.key === 'Escape') {
        const run = useGameStore.getState().run
        if (run?.runEnded) {
          resetRun()
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, advance, resetRun])
}
