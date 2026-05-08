import type { Archetype, RunPhase, StingerVariant } from './enums'
import type { StatBlock } from './stats'
import type { Constellation } from './nodes'
import type { InventoryItem } from './items'
import type { Encounter } from './encounters'
import type { BalanceWeights } from './balance'

export interface CombatLogLine {
  text: string
  type: 'info' | 'crit' | 'ability' | 'total' | 'result'
}

export interface ResolutionResult {
  pass: boolean
  damageDealt: number
  threshold: number
  deficit: number
  stingerVariant: StingerVariant
}

export interface RunState {
  seed: string
  archetype: Archetype
  turn: number
  phase: RunPhase

  stats: StatBlock
  baseStats: StatBlock
  gold: number

  constellation: Constellation
  draftedNodeIds: string[]

  inventory: InventoryItem[]
  abilities: string[]

  currentNodeDrafts: number
  extraNodeDrafts: number

  storeItems: string[]
  storeRerolled: boolean

  encounters: Encounter[]

  combatLog: CombatLogLine[]
  lastResult: ResolutionResult | null
  runEnded: boolean

  shareString: string

  /** Snapshot of the BalanceWeights active when this run was started. */
  balanceWeights: BalanceWeights
}
