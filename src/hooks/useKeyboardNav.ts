import { useEffect } from 'react'
import { useGameStore } from '../store'
import { RunPhase } from '../types/enums'

export function useKeyboardNav() {
  const phase = useGameStore((s) => s.phase)
  const initDraft = useGameStore((s) => s.initDraft)
  const resetRun = useGameStore((s) => s.resetRun)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') return

      const active = document.activeElement
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.tagName === 'BUTTON')
      if (isInput && active !== document.body) return

      const currentPhase = useGameStore.getState().phase
      const run = useGameStore.getState().run

      if (currentPhase === RunPhase.ARCHETYPE_SELECT) return

      if (currentPhase === RunPhase.POST_RUN && run?.runEnded) {
        e.preventDefault()
        resetRun()
        return
      }

      if (currentPhase === RunPhase.FORECAST) {
        e.preventDefault()
        initDraft()
      } else if (currentPhase === RunPhase.PAYOUT) {
        e.preventDefault()
        initDraft()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, initDraft, resetRun])
}
