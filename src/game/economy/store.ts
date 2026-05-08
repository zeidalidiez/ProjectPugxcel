import type { PRNG } from '../../types/rng'
import { Archetype, ItemTier } from '../../types/enums'
import type { ItemDef } from '../../types/items'
import { getItemPool, getItemById } from '../../data/items'

const ALL_TIERS = Object.values(ItemTier) as ItemTier[]

function tierSlots(turn: number): ItemTier[] {
  if (turn < 8) {
    return [ItemTier.T1, ItemTier.T2, ItemTier.T3, ItemTier.T1, ItemTier.T2]
  }
  return [ItemTier.T1, ItemTier.T2, ItemTier.T3, ItemTier.T4, null as unknown as ItemTier]
}

export function generateStore(
  rng: PRNG,
  turn: number,
  archetype: Archetype,
  extraItems: ItemDef[] = [],
  poolSizeMultiplier = 1.0,
): string[] {
  const slots = tierSlots(turn)
  const basePool = getItemPool(archetype)
  const pool = [...basePool, ...extraItems]
  const used = new Set<string>()
  const result: string[] = []

  for (const slotTier of slots) {
    const tier = slotTier ?? rng.pick(ALL_TIERS)
    const candidates = pool.filter((item) => item.tier === tier && !used.has(item.id))
    if (candidates.length === 0) {
      continue
    }
    const picked = rng.pick(candidates)
    used.add(picked.id)
    result.push(picked.id)
  }

  const maxItems = Math.max(1, Math.round(5 * poolSizeMultiplier))
  return result.slice(0, maxItems)
}

export function getStoreItems(storeItemIds: string[], _archetype: Archetype): ItemDef[] {
  return storeItemIds
    .map((id) => getItemById(id))
    .filter((item): item is ItemDef => item !== undefined)
}
