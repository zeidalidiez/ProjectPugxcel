import type { Constellation } from '../../types/nodes'
import type { Archetype } from '../../types/enums'
import { getNodeById } from '../../data/nodes'

/** LCK discount rate per point (before luckEfficacyMultiplier). */
export const LCK_DISCOUNT_PER_POINT = 0.015

/**
 * Apply LCK-based store/node discount.
 * Floor is 50% of base. luckEfficacyMultiplier scales the LCK→discount conversion.
 */
export function applyDiscount(
  baseCost: number,
  lck: number,
  luckEfficacyMultiplier = 1.0,
): number {
  const rate = lck * LCK_DISCOUNT_PER_POINT * luckEfficacyMultiplier
  const discounted = Math.floor(baseCost * (1 - rate))
  return Math.max(discounted, Math.floor(baseCost * 0.5))
}

/**
 * Resolve a constellation node's base gold cost from defMap (procedural)
 * or handwritten pool fallback. Returns null if the node/def is missing.
 */
export function getNodeBaseCost(
  constellation: Constellation,
  nodeId: string,
  archetype: Archetype,
): number | null {
  const node = constellation.nodes.get(nodeId)
  if (!node) return null
  const def =
    constellation.defMap?.get(node.defId) ?? getNodeById(archetype, node.defId)
  if (!def) return null
  return def.cost
}

/** Discounted purchase price for a constellation node, or null if unknown. */
export function getNodePurchasePrice(
  constellation: Constellation,
  nodeId: string,
  archetype: Archetype,
  lck: number,
  luckEfficacyMultiplier = 1.0,
): number | null {
  const base = getNodeBaseCost(constellation, nodeId, archetype)
  if (base === null) return null
  return applyDiscount(base, lck, luckEfficacyMultiplier)
}
