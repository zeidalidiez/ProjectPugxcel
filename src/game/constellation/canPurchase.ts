import type { Constellation, ConstellationNode } from '../../types/nodes'

export function canPurchaseNode(
  constellation: Constellation,
  nodeId: string,
  purchasedIds: string[],
): boolean {
  if (purchasedIds.includes(nodeId)) return false

  const node = constellation.nodes.get(nodeId)
  if (!node) return false
  if (node.locked) return false

  if (nodeId === constellation.startNodeId && purchasedIds.length === 0) return true

  return [...constellation.nodes.values()].some(
    (n) => purchasedIds.includes(n.id) && n.edges.includes(nodeId),
  )
}

export function getPurchasableNodes(
  constellation: Constellation,
  purchasedIds: string[],
): ConstellationNode[] {
  return [...constellation.nodes.values()].filter((n) =>
    canPurchaseNode(constellation, n.id, purchasedIds),
  )
}
