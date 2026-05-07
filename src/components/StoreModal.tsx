import { useGameStore } from '../store'
import { getItemById } from '../data/items'
import { applyDiscount } from '../game/economy/cost'
import { StatType } from '../types/enums'

export default function StoreModal() {
  const storeItems = useGameStore((s) => s.run?.storeItems)
  const archetype = useGameStore((s) => s.run?.archetype)
  const lck = useGameStore((s) => s.run?.stats?.[StatType.LCK]) ?? 0
  const purchaseItem = useGameStore((s) => s.purchaseItem)
  const canAffordItem = useGameStore((s) => s.canAffordItem)

  if (!storeItems || storeItems.length === 0 || !archetype) return null

  return (
    <div className="flex flex-col gap-2 p-3 border border-terminal-border rounded bg-terminal-surface" role="region" aria-label="Store">
      <div className="text-terminal-text text-xs uppercase tracking-widest">Store</div>
      <div className="text-terminal-text/30 text-[10px] font-mono mb-1">[Tab] to navigate items</div>
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
              disabled={!affordable}
              className={`
                flex flex-col gap-1 p-2 rounded border text-left text-xs transition-colors
                ${def.tier === 'T4' ? 'border-terminal-vampire bg-terminal-vampire/10' : ''}
                ${def.tier === 'T3' ? 'border-terminal-elf bg-terminal-elf/10' : ''}
                ${def.tier !== 'T4' && def.tier !== 'T3' ? 'border-terminal-border' : ''}
                ${affordable ? 'hover:border-terminal-accent cursor-pointer' : 'opacity-40 cursor-not-allowed'}
              `}
              title={def.description}
              aria-label={`${def.name}: ${def.description}. Cost: ${price}g`}
            >
              <div className="flex justify-between items-start">
                <span className="text-terminal-text-bright font-bold">{def.name}</span>
                <span className={`text-[10px] px-1 rounded ${def.tier === 'T4' ? 'bg-terminal-vampire/20 text-terminal-vampire' : 'text-terminal-text'}`}>
                  {def.tier}
                </span>
              </div>
              <span className="text-terminal-text/70 text-[10px] leading-tight">{def.description}</span>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-terminal-text/50 text-[10px]">{def.slot}</span>
                <span className={`font-mono text-xs ${affordable ? 'text-terminal-warn' : 'text-terminal-fail'}`}>
                  {price}g
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
