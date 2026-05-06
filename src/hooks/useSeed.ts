import { useMemo } from 'react'
import { createRNG } from '../game/rng/create'
import { useGameStore } from '../store'

export function useSeed() {
  const seed = useGameStore((s) => s.run?.seed)
  const archetype = useGameStore((s) => s.run?.archetype)
  const turn = useGameStore((s) => s.run?.turn)

  const dailySeed = useMemo(() => {
    const now = new Date()
    const utc = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`
    return `daily_${utc}`
  }, [])

  const rng = useMemo(() => {
    if (!seed || !archetype) return null
    return createRNG(`${seed}_${archetype}`)
  }, [seed, archetype])

  return { seed, archetype, turn, dailySeed, rng }
}
