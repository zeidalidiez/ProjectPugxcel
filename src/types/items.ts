import type { Archetype, ItemCategory, ItemSlot, ItemTier, ThreatTag } from './enums'
import type { StatBlock } from './stats'

export interface ItemEffect {
  statBonus?: Partial<StatBlock>
  strMult?: number
  flatBonus?: number
  grantsAbility?: string
  passiveId?: string
  resistance?: { tag: ThreatTag; value: number }
  extraNodeDraft?: boolean
}

export interface ItemDef {
  id: string
  name: string
  tier: ItemTier
  slot: ItemSlot
  category: ItemCategory
  archetype: Archetype | 'universal'
  cost: number
  description: string
  effects: ItemEffect[]
  statRequirements?: Partial<StatBlock>
}

export interface InventoryItem {
  defId: string
  instanceId: string
  slot: ItemSlot
  equipped: boolean
}
