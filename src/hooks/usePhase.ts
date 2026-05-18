import { useCallback } from 'react'
import { RunPhase } from '../types/enums'
import { useGameStore } from '../store'

export function usePhase() {
  const phase = useGameStore((s) => s.phase)
  const lastResultPass = useGameStore((s) => s.run?.lastResult?.pass)
  const turn = useGameStore((s) => s.run?.turn)
  const advanceToForecast = useGameStore((s) => s.advanceToForecast)
  const advanceToPayout = useGameStore((s) => s.advanceToPayout)
  const initDraft = useGameStore((s) => s.initDraft)
  const execute = useGameStore((s) => s.execute)
  const endRun = useGameStore((s) => s.endRun)

  const advance = useCallback(() => {
    switch (phase) {
      case RunPhase.ARCHETYPE_SELECT:
        break
      case RunPhase.FORECAST:
        initDraft()
        break
      case RunPhase.PAYOUT:
        initDraft()
        break
      case RunPhase.DRAFT:
        execute()
        break
      case RunPhase.STINGER:
        if (lastResultPass) {
          if ((turn ?? 0) >= 20) {
            endRun()
          } else {
            advanceToForecast()
          }
        } else {
          endRun()
        }
        break
      case RunPhase.POST_RUN:
        break
    }
  }, [phase, lastResultPass, turn, advanceToForecast, advanceToPayout, initDraft, execute, endRun])

  const isTransitioning = phase === RunPhase.STINGER

  return { phase, advance, isTransitioning }
}
