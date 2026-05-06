import { useGameStore } from '../store'
import { ItemSlot } from '../types/enums'
import { getItemById } from '../data/items'

const SLOT_ORDER: ItemSlot[] = ['HEAD' as ItemSlot, 'BODY' as ItemSlot, 'PAWS' as ItemSlot, 'ARTIFACT' as ItemSlot]

const SLOT_LABELS: Record<string, string> = {
  HEAD: 'Head',
  BODY: 'Body',
  PAWS: 'Paws',
  ARTIFACT: 'Artifact',
}

export default function EquipmentSlots() {
  const inventory = useGameStore((s) => s.run?.inventory)

  if (!inventory) return null

  const equipped = inventory.filter((i) => i.equipped)

  return (
    <div className="flex flex-col gap-1 p-3 border border-terminal-border rounded bg-terminal-surface" role="region" aria-label="Equipment">
      <div className="text-terminal-text text-xs uppercase tracking-widest mb-2">Equipment</div>
      {SLOT_ORDER.map((slot) => {
        const item = equipped.find((i) => i.slot === slot)
        const def = item ? getItemById(item.defId) : null
        return (
          <div
            key={slot}
            className={`
              flex items-center gap-2 text-xs px-2 py-1 rounded border
              ${item ? 'border-terminal-accent bg-terminal-accent/10' : 'border-terminal-border'}
            `}
          >
            <span className="text-terminal-text w-12">{SLOT_LABELS[slot]}</span>
            <span className={`font-mono truncate ${item ? 'text-terminal-text-bright' : 'text-terminal-text/40'}`}>
              {def?.name ?? 'Empty'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
