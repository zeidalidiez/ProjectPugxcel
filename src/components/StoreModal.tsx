import { useState } from 'react'
import { useGameStore } from '../store'
import { getItemById } from '../data/items'
import { applyDiscount } from '../game/economy/cost'
import { StatType } from '../types/enums'
import { STAT_LABELS } from '../types/stats'
import type { ItemDef } from '../types/items'

export default function StoreModal() {
  const storeItems = useGameStore((s) => s.run?.storeItems)
  const archetype = useGameStore((s) => s.run?.archetype)
  const lck = useGameStore((s) => s.run?.stats?.[StatType.LCK]) ?? 0
  const purchaseItem = useGameStore((s) => s.purchaseItem)
  const canAffordItem = useGameStore((s) => s.canAffordItem)
  const [hoveredDef, setHoveredDef] = useState<ItemDef | null>(null)

  if (!storeItems || storeItems.length === 0 || !archetype) return null

  return (
    <div className="flex flex-col gap-2 p-3 border border-terminal-border rounded bg-terminal-surface relative" role="region" aria-label="Store">
      <div className="text-terminal-text text-xs uppercase tracking-widest">Store</div>
      <div className="grid grid-cols-5 gap-2">
        {storeItems.map((itemId) => {
          const def = getItemById(itemId)
          if (!def) return null
          const price = applyDiscount(def.cost, lck)
          const affordable = canAffordItem(itemId)

          return (
            <button
              key={itemId}
              onClick={() => purchaseItem(itemId)}
              onMouseEnter={() => setHoveredDef(def)}
              onMouseLeave={() => setHoveredDef(null)}
              disabled={!affordable}
              className={`
                flex flex-col gap-1 p-2 rounded border text-left text-xs transition-colors
                ${def.tier === 'T4' ? 'border-terminal-vampire bg-terminal-vampire/10' : ''}
                ${def.tier === 'T3' ? 'border-terminal-elf bg-terminal-elf/10' : ''}
                ${def.tier !== 'T4' && def.tier !== 'T3' ? 'border-terminal-border' : ''}
                ${affordable ? 'hover:border-terminal-accent cursor-pointer' : 'opacity-40 cursor-not-allowed'}
              `}
              aria-label={`${def.name}: ${def.description}. Cost: ${price}g`}
            >
              <div className="flex justify-between items-start">
                <span className="text-terminal-text-bright font-bold text-[11px] leading-tight">{def.name}</span>
                <span className={`text-[9px] px-1 rounded flex-shrink-0 ${def.tier === 'T4' ? 'bg-terminal-vampire/20 text-terminal-vampire' : 'text-terminal-text'}`}>
                  {def.tier}
                </span>
              </div>
              <span className="text-terminal-text/70 text-[10px] leading-tight">{def.description}</span>

              {def.effects.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {def.effects.map((eff, i) => (
                    <span key={i} className="text-[8px] px-1 rounded bg-terminal-accent/10 text-terminal-accent font-mono">
                      {eff.strMult !== undefined && `×${eff.strMult}`}
                      {eff.flatBonus !== undefined && `+${eff.flatBonus}dmg`}
                      {eff.statBonus && Object.entries(eff.statBonus).map(([k, v]) => (
                        <span key={k}>+{v} {STAT_LABELS[k as StatType]}</span>
                      ))}
                      {eff.grantsAbility && 'Ability'}
                      {eff.extraNodeDraft && '+Draft'}
                    </span>
                  ))}
                </div>
              )}

              {def.statRequirements && (
                <div className="flex flex-wrap gap-0.5">
                  {Object.entries(def.statRequirements).map(([k, v]) => (
                    <span key={k} className="text-[8px] text-terminal-warn/60">
                      Req: {v} {STAT_LABELS[k as StatType]}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-auto">
                <span className="text-terminal-text/50 text-[9px]">{def.slot}</span>
                <span className={`font-mono text-[11px] ${affordable ? 'text-terminal-warn' : 'text-terminal-fail'}`}>
                  {price}g
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {hoveredDef && (
        <div className="absolute bottom-full left-4 mb-2 z-50 pointer-events-none p-3 rounded border border-terminal-accent bg-terminal-surface shadow-lg max-w-64">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-terminal-text-bright font-bold text-xs">{hoveredDef.name}</span>
            <span className="text-terminal-text/40 text-[10px] ml-auto">{hoveredDef.tier} · {hoveredDef.slot}</span>
          </div>
          <p className="text-terminal-text text-[10px] leading-snug mb-2">{hoveredDef.description}</p>
          {hoveredDef.effects.map((eff, i) => (
            <div key={i} className="text-[9px] text-terminal-text/70 mb-0.5">
              {eff.strMult !== undefined && `Weapon multiplier: ×${eff.strMult}`}
              {eff.flatBonus !== undefined && `+${eff.flatBonus} flat damage per hit`}
              {eff.statBonus && Object.entries(eff.statBonus).map(([k, v]) => (
                <div key={k}>+{v} {STAT_LABELS[k as StatType]}</div>
              ))}
              {eff.grantsAbility && `Grants ability`}
              {eff.extraNodeDraft && `+1 extra node draft this turn`}
            </div>
          ))}
          {hoveredDef.statRequirements && (
            <div className="mt-1 pt-1 border-t border-terminal-border">
              <div className="text-[9px] text-terminal-warn/60">Requirements:</div>
              {Object.entries(hoveredDef.statRequirements).map(([k, v]) => (
                <div key={k} className="text-[9px] text-terminal-warn/60">{v} {STAT_LABELS[k as StatType]}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
