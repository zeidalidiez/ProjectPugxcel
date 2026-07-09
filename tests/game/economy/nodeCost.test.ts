import { describe, it, expect } from 'vitest'
import { applyDiscount, getNodeBaseCost, getNodePurchasePrice } from '../../../src/game/economy/cost'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { PRESETS } from '../../../src/data/balance-presets'
import { Archetype } from '../../../src/types/enums'
import { constellationSeed } from '../../../src/game/save/runSeed'

describe('node cost from defMap (procedural)', () => {
  it('getNodeBaseCost returns procedural def.cost, not 50 fallback', () => {
    const rng = createRNG(constellationSeed('COSTTEST', Archetype.SPORGK))
    const constellation = generateConstellation(rng, Archetype.SPORGK, PRESETS.normal)
    const nodes = [...constellation.nodes.values()].filter((n) => n.id !== constellation.startNodeId)
    expect(nodes.length).toBeGreaterThan(0)

    for (const node of nodes.slice(0, 8)) {
      const base = getNodeBaseCost(constellation, node.id, Archetype.SPORGK)
      expect(base).not.toBeNull()
      const def = constellation.defMap?.get(node.defId)
      expect(def).toBeDefined()
      expect(base).toBe(def!.cost)
      // Procedural ring costs are typically not the old blanket 50 for every node
      expect(typeof base).toBe('number')
    }
  })

  it('purchase price applies LCK discount to real def cost', () => {
    const rng = createRNG(constellationSeed('PRICETST', Archetype.ELF))
    const constellation = generateConstellation(rng, Archetype.ELF, PRESETS.normal)
    const node = [...constellation.nodes.values()].find((n) => n.id !== constellation.startNodeId)!
    const base = getNodeBaseCost(constellation, node.id, Archetype.ELF)!
    const price = getNodePurchasePrice(constellation, node.id, Archetype.ELF, 10, 1.0)!
    expect(price).toBe(applyDiscount(base, 10, 1.0))
    expect(price).toBeLessThanOrEqual(base)
  })

  it('luckEfficacyMultiplier changes discount vs baseline', () => {
    const base = 100
    const normal = applyDiscount(base, 20, 1.0)
    const boosted = applyDiscount(base, 20, 2.0)
    expect(boosted).toBeLessThan(normal)
  })
})
