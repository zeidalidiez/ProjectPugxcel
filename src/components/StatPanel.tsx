import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../store'
import { StatType, STAT_TYPE_VALUES } from '../types/enums'
import { STAT_LABELS } from '../types/stats'
import { loadArchetypeFlavor } from '../data/nodes'

const STAT_DESCRIPTIONS: Record<StatType, string> = {
  [StatType.STR]: 'Base damage per attack',
  [StatType.AGI]: 'Attack count multiplier',
  [StatType.STA]: 'Resource for ability fires',
  [StatType.INT]: 'Bypass armor & evasion',
  [StatType.LCK]: 'Crit chance & store discount',
}

export default function StatPanel() {
  const { stats, baseStats, archetype } = useGameStore(
    useShallow((s) => ({
      stats: s.run?.stats,
      baseStats: s.run?.baseStats,
      archetype: s.run?.archetype,
    })),
  )

  if (!stats || !baseStats || !archetype) return null

  const flavor = loadArchetypeFlavor(archetype)
  const primary = flavor.primaryStat
  const secondary = flavor.secondaryStat

  return (
    <div className="flex flex-col gap-1 border border-terminal-border rounded bg-terminal-surface" style={{ padding: '14px' }} role="region" aria-label="Player Stats">
      <div className="text-terminal-text text-xs uppercase tracking-widest mb-2">Stats</div>
      {STAT_TYPE_VALUES.map((stat) => {
        const val = stats[stat]
        const base = baseStats[stat]
        const gearBonus = val - base
        const isPrimary = stat === primary
        const isSecondary = stat === secondary

        return (
          <div key={stat} className="flex items-center gap-2 text-sm" title={STAT_DESCRIPTIONS[stat]}>
            <span
              className={`font-bold w-8 rounded px-1 whitespace-nowrap ${
                isPrimary
                  ? 'text-black'
                  : isSecondary
                    ? 'text-terminal-accent'
                    : 'text-terminal-accent'
              }`}
              style={{
                backgroundColor: isPrimary
                  ? 'var(--accent, #fb923c)'
                  : isSecondary
                    ? 'var(--accent-soft, rgba(251,146,60,0.15))'
                    : 'transparent',
                boxShadow: isPrimary
                  ? '0 0 8px var(--accent-glow, rgba(251,176,60,0.4))'
                  : isSecondary
                    ? '0 0 4px var(--accent-glow, rgba(251,176,60,0.15))'
                    : undefined,
              }}
            >
              {STAT_LABELS[stat]}
              {(isPrimary || isSecondary) && (
                <span className="text-[8px] align-super">{isPrimary ? '★' : '☆'}</span>
              )}
            </span>
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
