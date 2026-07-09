import type { Constellation, ConstellationNode, NodeDef } from '../../types/nodes'
import type { StatBlock } from '../../types/stats'
import { EMPTY_STATS } from '../../types/stats'
import { getNodeById } from '../../data/nodes'
import { Archetype, NodeType } from '../../types/enums'
import { canPurchaseNode } from './canPurchase'
import {
  applyAntiSynergyPenalty,
  canPurchaseWithCondition,
  type ConditionContext,
} from './conditions'

export interface PurchaseResult {
  node: ConstellationNode
  statGain: StatBlock
  abilityUnlocked: string | null
  mutexLockedNodeId: string | null
  newNodeDrafts: number
}

export function resolveNodeDef(
  constellation: Constellation,
  nodeId: string,
  archetype: Archetype,
): NodeDef | undefined {
  const node = constellation.nodes.get(nodeId)
  if (!node) return undefined
  return constellation.defMap?.get(node.defId) ?? getNodeById(archetype, node.defId)
}

function computeStatGain(nodeDef: NodeDef): StatBlock {
  const gain = { ...EMPTY_STATS }
  for (const effect of nodeDef.effects) {
    if (effect.kind === 'flat') {
      gain[effect.stat] += effect.value
    }
  }
  return gain
}

export function purchaseNode(
  constellation: Constellation,
  purchasedIds: string[],
  nodeId: string,
  archetype: Archetype,
  conditionCtx?: ConditionContext,
): PurchaseResult | null {
  if (!canPurchaseNode(constellation, nodeId, purchasedIds)) return null

  const node = constellation.nodes.get(nodeId)!
  const nodeDef = constellation.defMap?.get(node.defId) ?? getNodeById(archetype, node.defId)
  if (!nodeDef) return null

  if (conditionCtx && !canPurchaseWithCondition(nodeDef, conditionCtx)) {
    return null
  }

  let statGain = computeStatGain(nodeDef)

  if (conditionCtx) {
    const ownedDefs = purchasedIds
      .map((id) => resolveNodeDef(constellation, id, archetype))
      .filter((d): d is NodeDef => d !== undefined)
    statGain = applyAntiSynergyPenalty(statGain, nodeDef, ownedDefs)
  }

  const abilityUnlocked = nodeDef.unlocksAbility ?? null

  let mutexLockedNodeId: string | null = null
  if (nodeDef.type === NodeType.MUTEX && nodeDef.mutexPairId) {
    const pairNode = [...constellation.nodes.values()].find((n) => {
      if (n.id === nodeId) return false
      const pd =
        constellation.defMap?.get(n.defId) ?? getNodeById(archetype, n.defId)
      return pd?.mutexPairId === nodeDef.mutexPairId
    })
    if (pairNode) {
      mutexLockedNodeId = pairNode.id
    }
  }

  const newNodeDrafts = nodeDef.effects.filter(
    (e) => e.kind === 'special' && e.specialId === 'extra_draft',
  ).length

  const purchasedNode: ConstellationNode = {
    ...node,
    purchased: true,
  }

  return {
    node: purchasedNode,
    statGain,
    abilityUnlocked,
    mutexLockedNodeId,
    newNodeDrafts,
  }
}

export function applyNodeEffects(currentStats: StatBlock, nodeDef: NodeDef): StatBlock {
  const result = { ...currentStats }
  for (const effect of nodeDef.effects) {
    if (effect.kind === 'flat') {
      result[effect.stat] += effect.value
    } else if (effect.kind === 'mult') {
      result[effect.stat] = Math.round(result[effect.stat] * effect.value)
    }
  }
  return result
}
