import { useState } from 'react'
import { useGameStore } from '../store'
import { ThreatTag } from '../types/enums'
import { getItemById } from '../data/items'

const THREAT_COUNTER_HINTS: Record<string, string> = {
  [ThreatTag.ARMORED]: 'STR pierce or Null Armored',
  [ThreatTag.EVASIVE]: 'INT bypass or Null Evasive',
  [ThreatTag.RESISTANT]: 'INT bypass or Null Resistant',
  [ThreatTag.STAMINA_DRAIN]: 'build STA',
  [ThreatTag.KINETIC]: 'raw STR or Null Kinetic',
  [ThreatTag.VOID]: 'raw damage or Null Void',
  [ThreatTag.CRYSTALLINE]: 'raw damage or Null Crystal',
}

export default function ThreatHeatmap() {
  const encounters = useGameStore((s) => s.run?.encounters)
  const inventory = useGameStore((s) => s.run?.inventory)
  const [expanded, setExpanded] = useState(false)

  if (!encounters || encounters.length === 0) return null

  const activeResistances = new Set<string>()
  if (inventory) {
    for (const item of inventory) {
      if (!item.equipped) continue
      const def = getItemById(item.defId)
      if (!def) continue
      for (const effect of def.effects) {
        if (effect.resistance) activeResistances.add(effect.resistance.tag)
      }
    }
  }

  const tagCounts: Record<string, number> = {}
  for (const enc of encounters.slice(0, 5)) {
    for (const tag of enc.threatTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
  }

  const allThreats = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])
  if (allThreats.length === 0) return null

  const summary = allThreats.slice(0, 3)

  return (
    <div className="relative px-2 text-xs mb-1" aria-label="Threat Analysis">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex gap-2 items-center hover:text-terminal-text-bright transition-colors cursor-pointer"
      >
        {summary.map(([tag, count]) => {
          const resisted = activeResistances.has(tag)
          return (
            <span key={tag} className={`font-bold ${resisted ? 'text-terminal-pass' : 'text-terminal-warn'}`}>
              {tag.replace('_', ' ')}×{count}
            </span>
          )
        })}
        <span className="text-terminal-text/40">({allThreats.length} threats)</span>
      </button>

      {expanded && (
        <div
          className="absolute top-full left-0 mt-1 z-50 p-3 rounded border border-terminal-border bg-terminal-surface shadow-lg min-w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-terminal-text text-[10px] uppercase tracking-widest mb-2">
            Upcoming Threats ({encounters.slice(0, 5).length} turns)
          </div>
          <div className="flex flex-col gap-2">
            {allThreats.map(([tag, count]) => {
              const hint = THREAT_COUNTER_HINTS[tag] ?? 'raw damage'
              const resisted = activeResistances.has(tag)
              return (
                <div key={tag} className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${resisted ? 'text-terminal-pass' : 'text-terminal-warn'}`}>
                    {tag.replace('_', ' ')}
                  </span>
                  <span className="text-terminal-text/60 text-[10px] font-mono">{hint}</span>
                  <span className="text-terminal-text/30 text-[10px] font-mono flex-shrink-0">
                    {count}/{encounters.length} turns
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-terminal-border text-terminal-text/40 text-[9px] font-mono">
            {activeResistances.size > 0
              ? `Equipped resistances: ${[...activeResistances].join(', ')}`
              : 'No resistance items equipped'}
          </div>
        </div>
      )}
    </div>
  )
}
