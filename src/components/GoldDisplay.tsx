import { useGameStore } from '../store'
import { StatType } from '../types/enums'

export default function GoldDisplay() {
  const gold = useGameStore((s) => s.run?.gold)
  const lck = useGameStore((s) => s.run?.stats?.[StatType.LCK])

  if (gold === undefined) return null

  const discountPct = lck ? Math.floor(lck * 1.5) : 0

  return (
    <div className="flex items-center gap-4 px-3 py-1" aria-label="Gold">
      <span className="text-terminal-warn font-bold text-lg">Gold</span>
      <span className="text-terminal-text-bright font-mono text-lg">{gold}</span>
      {discountPct > 0 && (
        <span className="text-terminal-pass text-xs">-{discountPct}% discount</span>
      )}
    </div>
  )
}
