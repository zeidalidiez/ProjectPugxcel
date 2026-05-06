import type { Archetype, NodeType, StatType } from './enums'

export interface NodeEffect {
  stat: StatType
  value: number
  kind: 'flat' | 'mult' | 'special'
  specialId?: string
}

export interface NodeCondition {
  type: 'gear_equipped' | 'gear_unequipped' | 'stat_threshold' | 'turn_threshold' | 'gold_spent' | 'gold_unspent'
  stat?: StatType
  value: number
}

export interface NodeDef {
  id: string
  name: string
  description: string
  type: NodeType
  archetype: Archetype
  cost: number
  effects: NodeEffect[]
  mutexPairId?: string
  condition?: NodeCondition
  unlocksAbility?: string
  rarity: number
  column: number
  isAnchor: boolean
}

export interface ConstellationNode {
  defId: string
  id: string
  x: number
  y: number
  column: number
  edges: string[]
  purchased: boolean
  locked: boolean
}

export interface Constellation {
  nodes: Map<string, ConstellationNode>
  startNodeId: string
  anchorNodeIds: string[]
}
