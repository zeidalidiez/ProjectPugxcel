import { Archetype } from '../../types/enums'
import { universalItems } from './universal'
import { sporgkItems } from './sporgk'
import { elfItems } from './elf'
import { vampItems } from './vampire'
import type { ItemDef } from '../../types/items'

const archetypeItemMap: Record<string, ItemDef[]> = {
  [Archetype.SPORGK]: sporgkItems,
  [Archetype.ELF]: elfItems,
  [Archetype.VAMPIRE]: vampItems,
}

export function getItemPool(archetype: Archetype): ItemDef[] {
  const archetypeItems = archetypeItemMap[archetype] ?? []
  return [...universalItems, ...archetypeItems]
}

export function getItemById(id: string): ItemDef | undefined {
  for (const items of [universalItems, sporgkItems, elfItems, vampItems]) {
    const found = items.find((item) => item.id === id)
    if (found) return found
  }
  return undefined
}

export { universalItems, sporgkItems, elfItems, vampItems }
