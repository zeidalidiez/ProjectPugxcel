import type { NodeCondition, NodeDef } from '../../types/nodes'
import type { StatBlock } from '../../types/stats'
import type { InventoryItem } from '../../types/items'
import { NodeType } from '../../types/enums'

export interface ConditionContext {
  turn: number
  stats: StatBlock
  inventory: InventoryItem[]
  /** Gold spent this run (optional; defaults to treating gold_spent as unmet if unknown) */
  goldSpent?: number
  goldHeld?: number
}

/**
 * Evaluate whether a structural node condition is currently satisfied.
 * Nodes without a condition always pass.
 */
export function isConditionMet(
  condition: NodeCondition | undefined,
  ctx: ConditionContext,
): boolean {
  if (!condition) return true

  switch (condition.type) {
    case 'gear_equipped':
      return ctx.inventory.some((i) => i.equipped)
    case 'gear_unequipped':
      return !ctx.inventory.some((i) => i.equipped)
    case 'stat_threshold': {
      if (!condition.stat) return true
      return (ctx.stats[condition.stat] ?? 0) >= condition.value
    }
    case 'turn_threshold':
      return ctx.turn >= condition.value
    case 'gold_spent':
      return (ctx.goldSpent ?? 0) >= condition.value
    case 'gold_unspent':
      return (ctx.goldHeld ?? 0) >= condition.value
    default:
      return true
  }
}

/**
 * Whether a node may be purchased given structural rules.
 * Mutex locked flag is handled in canPurchaseNode.
 * CONDITIONAL / THRESHOLD nodes require their condition to be met.
 * ANTI_SYNERGY does not block purchase (penalty applied on stat gain).
 */
export function canPurchaseWithCondition(
  def: NodeDef | undefined,
  ctx: ConditionContext,
): boolean {
  if (!def) return true
  if (def.type === NodeType.CONDITIONAL || def.type === NodeType.THRESHOLD) {
    return isConditionMet(def.condition, ctx)
  }
  return true
}

/**
 * Anti-synergy: if the player already owns `count` nodes of the same type
 * (ANTI_SYNERGY), reduce incoming flat stat gains by half (rounded down, min 0).
 */
export function applyAntiSynergyPenalty(
  statGain: StatBlock,
  def: NodeDef | undefined,
  ownedDefs: NodeDef[],
): StatBlock {
  if (!def || def.type !== NodeType.ANTI_SYNERGY) return statGain
  const similar = ownedDefs.filter((d) => d.type === NodeType.ANTI_SYNERGY).length
  if (similar < 1) return statGain
  const result = { ...statGain }
  for (const key of Object.keys(result) as (keyof StatBlock)[]) {
    result[key] = Math.floor(result[key] * 0.5)
  }
  return result
}
