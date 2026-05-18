import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../store'
import { StatType, STAT_TYPE_VALUES } from '../types/enums'
import { STAT_LABELS } from '../types/stats'

const STAT_DESCRIPTIONS: Record<StatType, string> = {
  [StatType.STR]: 'Base damage per attack',
  [StatType.AGI]: 'Attack count multiplier',
  [StatType.STA]: 'Resource for ability fires',
  [StatType.INT]: 'Bypass armor & evasion',
  [StatType.LCK]: 'Crit chance & store discount',
}

export default function StatPanel() {
  const { stats, baseStats } = useGameStore(
    useShallow((s) => ({
      stats: s.run?.stats,
      baseStats: s.run?.baseStats,
    })),
  )

  if (!stats || !baseStats) return null

  return (
    <div className="flex flex-col gap-1 border border-terminal-border rounded bg-terminal-surface" style={{ padding: '14px' }} role="region" aria-label="Player Stats">
      <div className="text-terminal-text text-xs uppercase tracking-widest mb-2">Stats</div>
      {STAT_TYPE_VALUES.map((stat) => {
        const val = stats[stat]
        const base = baseStats[stat]
        const gearBonus = val - base
        return (
          <div key={stat} className="flex items-center gap-2 text-sm" title={STAT_DESCRIPTIONS[stat]}>
            <span className="text-terminal-accent font-bold w-8">{STAT_LABELS[stat]}</span>
            <span className="text-terminal-text-bright font-mono w-8 text-right" style={{ fontFamily: 'var(--font-display)' }}>{val}</span>
            {gearBonus > 0 && (
              <span className="text-terminal-pass text-xs font-mono">+{gearBonus}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
