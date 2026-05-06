import { describe, it, expect } from 'vitest'
import { getNodePool, getAnchors } from '../../src/data/nodes'
import { getItemPool } from '../../src/data/items'
import { getAbilityById, allAbilities } from '../../src/data/abilities'
import { Archetype, StatType, NodeType } from '../../src/types/enums'
import { ALL_STATS } from '../../src/types/stats'

const ALL_ARCHETYPES = [Archetype.SPORGK, Archetype.ELF, Archetype.VAMPIRE]

describe('Node pools', () => {
  for (const archetype of ALL_ARCHETYPES) {
    describe(archetype, () => {
      const pool = getNodePool(archetype)

      it('has 75-90 nodes', () => {
        expect(pool.length).toBeGreaterThanOrEqual(75)
        expect(pool.length).toBeLessThanOrEqual(90)
      })

      it('has all unique IDs', () => {
        const ids = pool.map((n) => n.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('has 4-6 anchor nodes', () => {
        const anchors = getAnchors(archetype)
        expect(anchors.length).toBeGreaterThanOrEqual(4)
        expect(anchors.length).toBeLessThanOrEqual(6)
      })

      it('all nodes have valid columns (0-7)', () => {
        for (const node of pool) {
          expect(node.column).toBeGreaterThanOrEqual(0)
          expect(node.column).toBeLessThanOrEqual(7)
        }
      })

      it('all nodes have positive costs (except start/column-0 nodes)', () => {
        for (const node of pool) {
          if (node.column === 0) {
            expect(node.cost).toBeGreaterThanOrEqual(0)
          } else {
            expect(node.cost).toBeGreaterThan(0)
          }
        }
      })

      it('all effect stats are valid StatType values', () => {
        for (const node of pool) {
          for (const effect of node.effects) {
            expect(ALL_STATS).toContain(effect.stat)
          }
        }
      })

      it('all effect values are integers', () => {
        for (const node of pool) {
          for (const effect of node.effects) {
            expect(Number.isInteger(effect.value)).toBe(true)
          }
        }
      })

      it('all nodes have non-empty names and descriptions', () => {
        for (const node of pool) {
          expect(node.name.length).toBeGreaterThan(0)
          expect(node.description.length).toBeGreaterThan(0)
        }
      })

      it('has valid structural composition (~80% standard)', () => {
        const standard = pool.filter((n) => n.type === NodeType.STANDARD)
        const structural = pool.filter((n) => n.type !== NodeType.STANDARD)
        expect(standard.length).toBeGreaterThan(50)
        expect(structural.length).toBeGreaterThanOrEqual(10)
        expect(structural.length).toBeLessThanOrEqual(30)
      })

      it('has valid rarity values (0-100)', () => {
        for (const node of pool) {
          expect(node.rarity).toBeGreaterThan(0)
          expect(node.rarity).toBeLessThanOrEqual(100)
        }
      })

      it('all nodes have matching archetype', () => {
        for (const node of pool) {
          expect(node.archetype).toBe(archetype)
        }
      })
    })
  }
})

describe('Item pools', () => {
  for (const archetype of ALL_ARCHETYPES) {
    describe(archetype, () => {
      const pool = getItemPool(archetype)

      it('has 50-60 items', () => {
        expect(pool.length).toBeGreaterThanOrEqual(50)
        expect(pool.length).toBeLessThanOrEqual(60)
      })

      it('has all unique IDs', () => {
        const ids = pool.map((i) => i.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('all items have valid tiers', () => {
        for (const item of pool) {
          expect(['T1', 'T2', 'T3', 'T4']).toContain(item.tier)
        }
      })

      it('all items have valid slots', () => {
        for (const item of pool) {
          expect(['HEAD', 'BODY', 'PAWS', 'ARTIFACT']).toContain(item.slot)
        }
      })

      it('all items have positive costs', () => {
        for (const item of pool) {
          expect(item.cost).toBeGreaterThan(0)
        }
      })

      it('all items have non-empty names and descriptions', () => {
        for (const item of pool) {
          expect(item.name.length).toBeGreaterThan(0)
          expect(item.description.length).toBeGreaterThan(0)
        }
      })
    })
  }
})

describe('Abilities', () => {
  it('has 15-25 abilities', () => {
    expect(allAbilities.length).toBeGreaterThanOrEqual(15)
    expect(allAbilities.length).toBeLessThanOrEqual(25)
  })

  it('has all unique IDs', () => {
    const ids = allAbilities.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all abilities have valid staCost (1-15)', () => {
    for (const ability of allAbilities) {
      expect(ability.staCost).toBeGreaterThanOrEqual(1)
      expect(ability.staCost).toBeLessThanOrEqual(15)
    }
  })

  it('all abilities have valid maxFires (1-5)', () => {
    for (const ability of allAbilities) {
      expect(ability.maxFires).toBeGreaterThanOrEqual(1)
      expect(ability.maxFires).toBeLessThanOrEqual(5)
    }
  })

  it('all abilities have positive baseDamage', () => {
    for (const ability of allAbilities) {
      expect(ability.baseDamage).toBeGreaterThan(0)
    }
  })

  it('all ability IDs referenced in nodes exist', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const pool = getNodePool(archetype)
      for (const node of pool) {
        if (node.unlocksAbility) {
          const ability = getAbilityById(node.unlocksAbility)
          expect(ability).toBeDefined()
          if (ability) {
            expect(ability.id).toBe(node.unlocksAbility)
          }
        }
      }
    }
  })
})
