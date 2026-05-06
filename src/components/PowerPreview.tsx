import { useMemo } from 'react'
import { useGameStore } from '../store'
import { StatType, ItemCategory, Archetype } from '../types/enums'
import { calculateThreshold } from '../game/economy/threshold'
import { getItemById } from '../data/items'

const PRIMARY_STAT: Record<Archetype, StatType> = {
  [Archetype.SPORGK]: StatType.STR,
  [Archetype.ELF]: StatType.AGI,
  [Archetype.VAMPIRE]: StatType.INT,
}

export default function PowerPreview() {
  const stats = useGameStore((s) => s.run?.stats)
  const inventory = useGameStore((s) => s.run?.inventory)
  const turn = useGameStore((s) => s.run?.turn)
  const lck = useGameStore((s) => s.run?.stats?.[StatType.LCK]) ?? 0
  const phase = useGameStore((s) => s.run?.phase)
  const archetype = useGameStore((s) => s.run?.archetype)

  const power = useMemo(() => {
    if (!stats || !inventory || turn === undefined || !archetype) return null
    const primary = PRIMARY_STAT[archetype]

    let strMult = 1.0
    let flatBonuses = 0

    for (const item of inventory) {
      if (!item.equipped) continue
      const def = getItemById(item.defId)
      if (!def) continue
      for (const effect of def.effects) {
        if (def.category === ItemCategory.WEAPON) {
          if (effect.strMult !== undefined) strMult = effect.strMult
        }
        if (effect.flatBonus !== undefined) flatBonuses += effect.flatBonus
      }
    }

    const perAttack = stats[primary] * strMult + flatBonuses
    const attacks = Math.floor(1 + stats[StatType.AGI] / 5)
    const rawPower = Math.floor(perAttack * attacks)
    const critChance = Math.min(lck * 0.02, 0.5) * 100

    return { perAttack, attacks, rawPower, critChance }
  }, [stats, inventory, turn, lck, archetype])

  if (!power || !stats || turn === undefined) return null

  const threshold = calculateThreshold(turn)
  const pct = Math.min(100, (power.rawPower / threshold) * 100)
  const isDraft = phase === 'DRAFT'
  const chance = isDraft ? 'Current' : 'Last'

  return (
    <div className="flex flex-col gap-2 p-3 border border-terminal-accent/30 rounded bg-terminal-surface" role="region" aria-label="Power Preview">
      <div className="flex items-center justify-between">
        <span className="text-terminal-text text-xs uppercase tracking-widest">{chance} Power</span>
        <span className="text-terminal-accent text-xs font-mono">
          {power.rawPower} / {threshold}
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-terminal-bg border border-terminal-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${pct >= 100 ? 'bg-terminal-pass' : pct >= 50 ? 'bg-terminal-warn' : 'bg-terminal-fail'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-terminal-text/60">
        <span>{power.attacks} atk{power.attacks !== 1 ? 's' : ''} × {Math.floor(power.perAttack)}</span>
        {power.critChance > 0 && <span>{power.critChance}% crit</span>}
      </div>
    </div>
  )
}
