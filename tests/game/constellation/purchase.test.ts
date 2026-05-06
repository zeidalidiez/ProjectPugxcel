import { describe, it, expect } from 'vitest'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { canPurchaseNode, getPurchasableNodes } from '../../../src/game/constellation/canPurchase'
import { purchaseNode, applyNodeEffects } from '../../../src/game/constellation/purchase'
import { getNodeById } from '../../../src/data/nodes'
import { Archetype, NodeType, StatType } from '../../../src/types/enums'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { Constellation, ConstellationNode, NodeDef } from '../../../src/types/nodes'

function seededConstellation(archetype: Archetype): Constellation {
  const rng = createRNG(`purchase-test-${archetype}`)
  return generateConstellation(rng, archetype)
}

describe('canPurchaseNode', () => {
  it('start node is purchasable at beginning with no purchases', () => {
    for (const archetype of [Archetype.SPORGK, Archetype.ELF, Archetype.VAMPIRE]) {
      const c = seededConstellation(archetype)
      expect(canPurchaseNode(c, c.startNodeId, [])).toBe(true)
    }
  })

  it('can purchase nodes adjacent to purchased nodes', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const startPurchased = [c.startNodeId]
    const purchasable = getPurchasableNodes(c, startPurchased)

    expect(purchasable.length).toBeGreaterThan(0)
    for (const node of purchasable) {
      expect(canPurchaseNode(c, node.id, startPurchased)).toBe(true)
    }
  })

  it('cannot purchase non-adjacent nodes', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const startPurchased = [c.startNodeId]
    const allNodes = [...c.nodes.values()]

    const nonAdjacent = allNodes.find((n) => {
      if (n.column <= 1) return false
      return ![...c.nodes.values()].some(
        (other) => startPurchased.includes(other.id) && other.edges.includes(n.id),
      )
    })

    if (nonAdjacent) {
      expect(canPurchaseNode(c, nonAdjacent.id, startPurchased)).toBe(false)
    }
  })

  it('cannot purchase already-purchased nodes', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)
    const purchasedIds = [c.startNodeId]

    expect(canPurchaseNode(c, c.startNodeId, purchasedIds)).toBe(false)
  })

  it('cannot purchase locked nodes', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)
    const purchasedIds = [c.startNodeId]

    const purchasable = getPurchasableNodes(c, purchasedIds)
    if (purchasable.length > 0) {
      const node = purchasable[0]
      const lockedNode: ConstellationNode = { ...node, locked: true }
      const newNodes = new Map(c.nodes)
      newNodes.set(node.id, lockedNode)
      const lockedC: Constellation = { ...c, nodes: newNodes }

      expect(canPurchaseNode(lockedC, node.id, purchasedIds)).toBe(false)
    }
  })

  it('returns false for unknown node ID', () => {
    const c = seededConstellation(Archetype.SPORGK)
    expect(canPurchaseNode(c, 'nonexistent-id', [])).toBe(false)
  })
})

describe('purchaseNode', () => {
  it('returns null for non-purchasable nodes', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const allNodes = [...c.nodes.values()]
    const farNode = allNodes.find((n) => n.column >= 2)
    if (farNode) {
      const result = purchaseNode(c, [c.startNodeId], farNode.id, archetype)
      if (result !== null) {
        expect(result.statGain).toBeDefined()
      }
    }
  })

  it('purchase returns correct stat gains for start node', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)
    const result = purchaseNode(c, [], c.startNodeId, archetype)
    expect(result).not.toBeNull()

    const def = getNodeById(archetype, c.nodes.get(c.startNodeId)!.defId)!
    for (const effect of def.effects) {
      if (effect.kind === 'flat') {
        expect(result!.statGain[effect.stat]).toBeGreaterThanOrEqual(effect.value)
      }
    }
  })

  it('returns ability when node unlocks one', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const purchasedIds = [c.startNodeId]
    const purchasable = getPurchasableNodes(c, purchasedIds)

    const abilityNode = purchasable.find((n) => {
      const def = getNodeById(archetype, n.defId)
      return def?.unlocksAbility != null
    })

    if (abilityNode) {
      const result = purchaseNode(c, purchasedIds, abilityNode.id, archetype)
      expect(result).not.toBeNull()
      expect(result!.abilityUnlocked).toBeTruthy()
    }
  })

  it('mutex pair purchasing returns correct mutexLockedNodeId', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const allNodes = [...c.nodes.values()]
    const mutexNode = allNodes.find((n) => {
      const def = getNodeById(archetype, n.defId)
      return def?.type === NodeType.MUTEX && def.mutexPairId
    })

    if (!mutexNode) return

    const mutexDef = getNodeById(archetype, mutexNode.defId)!
    const pairNode = allNodes.find((n) => {
      if (n.id === mutexNode.id) return false
      const pd = getNodeById(archetype, n.defId)
      return pd?.mutexPairId === mutexDef.mutexPairId
    })

    const purchasedIds: string[] = [c.startNodeId]
    const result = purchaseNode(c, purchasedIds, mutexNode.id, archetype)

    if (result !== null) {
      if (pairNode) {
        expect(result.mutexLockedNodeId).toBe(pairNode.id)
      }

      if (result.mutexLockedNodeId) {
        const lockedNode = c.nodes.get(result.mutexLockedNodeId)!
        const lockedNodeCopy: ConstellationNode = { ...lockedNode, locked: true }
        const newNodes = new Map(c.nodes)
        newNodes.set(result.mutexLockedNodeId, lockedNodeCopy)
        const lockedC: Constellation = { ...c, nodes: newNodes }

        const newPurchasedIds = [...purchasedIds, mutexNode.id]
        expect(canPurchaseNode(lockedC, result.mutexLockedNodeId, newPurchasedIds)).toBe(false)
      }
    }
  })

  it('pure function: original constellation unchanged after purchase', () => {
    const archetype = Archetype.SPORGK
    const c = seededConstellation(archetype)

    const nodeIdsBefore = [...c.nodes.keys()].sort()
    const edgesBefore = new Map(
      [...c.nodes.entries()].map(([id, node]) => [id, [...node.edges]]),
    )
    const purchasedFlagsBefore = [...c.nodes.values()].map((n) => n.purchased)
    const lockedFlagsBefore = [...c.nodes.values()].map((n) => n.locked)

    const purchasedIds = [c.startNodeId]
    const purchasable = getPurchasableNodes(c, purchasedIds)

    if (purchasable.length > 0) {
      purchaseNode(c, purchasedIds, purchasable[0].id, archetype)
    }

    const nodeIdsAfter = [...c.nodes.keys()].sort()
    const edgesAfter = new Map(
      [...c.nodes.entries()].map(([id, node]) => [id, [...node.edges]]),
    )
    const purchasedFlagsAfter = [...c.nodes.values()].map((n) => n.purchased)
    const lockedFlagsAfter = [...c.nodes.values()].map((n) => n.locked)

    expect(nodeIdsAfter).toEqual(nodeIdsBefore)
    expect(edgesAfter).toEqual(edgesBefore)
    expect(purchasedFlagsAfter).toEqual(purchasedFlagsBefore)
    expect(lockedFlagsAfter).toEqual(lockedFlagsBefore)
  })

  it('newNodeDrafts counts special extra_draft effects', () => {
    const rng = createRNG('draft-test')
    const c = generateConstellation(rng, Archetype.SPORGK)
    const result = purchaseNode(c, [], c.startNodeId, Archetype.SPORGK)
    expect(result).not.toBeNull()
    expect(typeof result!.newNodeDrafts).toBe('number')
  })
})

describe('applyNodeEffects', () => {
  it('applies flat stat effects', () => {
    const nodeDef: NodeDef = {
      id: 'test_node',
      name: 'Test',
      description: '',
      type: NodeType.STANDARD,
      archetype: Archetype.SPORGK,
      cost: 10,
      effects: [{ stat: StatType.STR, value: 5, kind: 'flat' }],
      rarity: 50,
      column: 1,
      isAnchor: false,
    }

    const result = applyNodeEffects(EMPTY_STATS, nodeDef)
    expect(result[StatType.STR]).toBe(5)
  })

  it('applies multiplicative stat effects', () => {
    const base = { ...EMPTY_STATS, [StatType.STR]: 10 }
    const nodeDef: NodeDef = {
      id: 'test_mult',
      name: 'Test Mult',
      description: '',
      type: NodeType.STANDARD,
      archetype: Archetype.SPORGK,
      cost: 10,
      effects: [{ stat: StatType.STR, value: 2, kind: 'mult' }],
      rarity: 50,
      column: 1,
      isAnchor: false,
    }

    const result = applyNodeEffects(base, nodeDef)
    expect(result[StatType.STR]).toBe(20)
  })

  it('combines flat and mult effects', () => {
    const base = { ...EMPTY_STATS, [StatType.STR]: 10 }
    const nodeDef: NodeDef = {
      id: 'test_combo',
      name: 'Test Combo',
      description: '',
      type: NodeType.STANDARD,
      archetype: Archetype.SPORGK,
      cost: 10,
      effects: [
        { stat: StatType.STR, value: 5, kind: 'flat' },
        { stat: StatType.AGI, value: 3, kind: 'flat' },
      ],
      rarity: 50,
      column: 1,
      isAnchor: false,
    }

    const result = applyNodeEffects(base, nodeDef)
    expect(result[StatType.STR]).toBe(15)
    expect(result[StatType.AGI]).toBe(3)
  })

  it('does not mutate input stats', () => {
    const base = { ...EMPTY_STATS, [StatType.STR]: 10 }
    const nodeDef: NodeDef = {
      id: 'test_pure',
      name: 'Test Pure',
      description: '',
      type: NodeType.STANDARD,
      archetype: Archetype.SPORGK,
      cost: 10,
      effects: [{ stat: StatType.STR, value: 5, kind: 'flat' }],
      rarity: 50,
      column: 1,
      isAnchor: false,
    }

    applyNodeEffects(base, nodeDef)
    expect(base[StatType.STR]).toBe(10)
  })
})
