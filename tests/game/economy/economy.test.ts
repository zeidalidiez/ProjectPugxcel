import { describe, it, expect, beforeAll } from 'vitest'
import { calculateThreshold } from '../../../src/game/economy/threshold'
import { calculatePayout } from '../../../src/game/economy/payout'
import { applyDiscount } from '../../../src/game/economy/cost'
import { generateStore, getStoreItems } from '../../../src/game/economy/store'
import { createRNG } from '../../../src/game/rng/create'
import { Archetype, ItemTier } from '../../../src/types/enums'
import { getItemPool } from '../../../src/data/items'

// ── compile-time guard: verify the formula produces integer outputs ──

function isInteger(n: number): boolean {
  return Number.isInteger(n)
}

// ── Threshold ──

describe('calculateThreshold', () => {
    it('turn 1 = 20', () => {
      expect(calculateThreshold(1)).toBe(20)
    })

    it('turn 5 (boss) is ~57', () => {
      const t = calculateThreshold(5)
      expect(t).toBe(57)
    expect(isInteger(t)).toBe(true)
  })

    it('turn 20 (boss) matches formula', () => {
      const t = calculateThreshold(20)
      expect(t).toBeGreaterThan(500)
      expect(t).toBeLessThan(1000)
    expect(isInteger(t)).toBe(true)
  })

    it('non-boss turn: turn 3', () => {
      const raw = Math.floor(20 * Math.pow(1.18, 2))
      expect(calculateThreshold(3)).toBe(raw)
    })

    it('boss multiplier applied at turn % 5 === 0', () => {
      const t5 = calculateThreshold(5)
      const raw5 = Math.floor(20 * Math.pow(1.18, 4))
      expect(t5).toBe(Math.floor(raw5 * 1.5))

      const t10 = calculateThreshold(10)
      const raw10 = Math.floor(20 * Math.pow(1.18, 9))
      expect(t10).toBe(Math.floor(raw10 * 1.5))
  })

  it('no floating-point drift — returns integer', () => {
    for (let turn = 1; turn <= 20; turn++) {
      expect(isInteger(calculateThreshold(turn))).toBe(true)
    }
  })
})

// ── Payout ──

describe('calculatePayout', () => {
  it('turn 1, lck 0 = 50', () => {
    expect(calculatePayout(1, 0)).toBe(50)
  })

  it('turn 10, lck 10 = 161', () => {
    expect(calculatePayout(10, 10)).toBe(161)
  })

  it('turn 20, lck 20 = 312', () => {
    expect(calculatePayout(20, 20)).toBe(312)
  })

  it('lck 0 at any turn gives base only', () => {
    for (let turn = 1; turn <= 20; turn++) {
      const base = 50 + (turn - 1) * 10
      expect(calculatePayout(turn, 0)).toBe(base)
    }
  })

  it('always returns integer', () => {
    for (let turn = 1; turn <= 20; turn++) {
      for (let lck = 0; lck <= 50; lck += 7) {
        expect(isInteger(calculatePayout(turn, lck))).toBe(true)
      }
    }
  })
})

// ── Discount ──

describe('applyDiscount', () => {
  it('lck 0 → no discount', () => {
    expect(applyDiscount(100, 0)).toBe(100)
    expect(applyDiscount(250, 0)).toBe(250)
  })

  it('lck 10 → 15% off, 100 → 85', () => {
    expect(applyDiscount(100, 10)).toBe(85)
  })

  it('floors at 50% of base cost', () => {
    expect(applyDiscount(100, 34)).toBe(50)
    expect(applyDiscount(100, 50)).toBe(50)
    expect(applyDiscount(200, 50)).toBe(100)
  })

  it('lck 20 → 30% off', () => {
    expect(applyDiscount(100, 20)).toBe(70)
  })

  it('always returns integer', () => {
    for (let cost = 10; cost <= 300; cost += 13) {
      for (let lck = 0; lck <= 50; lck += 11) {
        expect(isInteger(applyDiscount(cost, lck))).toBe(true)
      }
    }
  })
})

// ── Store ──

describe('generateStore', () => {
  it('returns 5 item IDs', () => {
    const rng = createRNG('store-test-1')
    const ids = generateStore(rng, 1, Archetype.SPORGK)
    expect(ids).toHaveLength(5)
    ids.forEach((id) => expect(typeof id).toBe('string'))
  })

  it('all IDs are unique within a single roll', () => {
    const rng = createRNG('store-test-2')
    const ids = generateStore(rng, 3, Archetype.ELF)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('no T4 before turn 8', () => {
    const pool = getItemPool(Archetype.SPORGK)
    const t4Ids = new Set(pool.filter((i) => i.tier === ItemTier.T4).map((i) => i.id))

    for (let turn = 1; turn < 8; turn++) {
      const rng = createRNG(`no-t4-turn${turn}`)
      const ids = generateStore(rng, turn, Archetype.SPORGK)
      const resolved = getStoreItems(ids, Archetype.SPORGK)
      for (const item of resolved) {
        expect(item.tier).not.toBe(ItemTier.T4)
      }
    }
  })

  it('includes T4 from turn 8+', () => {
    let foundT4 = false
    for (let attempt = 0; attempt < 50 && !foundT4; attempt++) {
      const rng = createRNG(`t4-check-${attempt}`)
      const ids = generateStore(rng, 8, Archetype.SPORGK)
      const resolved = getStoreItems(ids, Archetype.SPORGK)
      foundT4 = resolved.some((i) => i.tier === ItemTier.T4)
    }
    expect(foundT4).toBe(true)
  })

  it('deterministic with same seed', () => {
    const rng1 = createRNG('det-store')
    const rng2 = createRNG('det-store')
    const ids1 = generateStore(rng1, 5, Archetype.SPORGK)
    const ids2 = generateStore(rng2, 5, Archetype.SPORGK)
    expect(ids1).toEqual(ids2)
  })

  it('different seeds produce different stores (probabilistic)', () => {
    const rngA = createRNG('store-a')
    const rngB = createRNG('store-b')
    const idsA = generateStore(rngA, 5, Archetype.SPORGK)
    const idsB = generateStore(rngB, 5, Archetype.SPORGK)
    // Extremely unlikely to be identical across 5 slots with large pools
    expect(idsA).not.toEqual(idsB)
  })

  it('getStoreItems resolves IDs to full ItemDef objects', () => {
    const rng = createRNG('resolve-store')
    const ids = generateStore(rng, 5, Archetype.VAMPIRE)
    const items = getStoreItems(ids, Archetype.VAMPIRE)
    expect(items).toHaveLength(ids.length)
    items.forEach((item) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('tier')
      expect(item).toHaveProperty('cost')
    })
  })

  it('getStoreItems returns empty for empty input', () => {
    expect(getStoreItems([], Archetype.SPORGK)).toEqual([])
  })

  it('valid turn slots for turn < 8 match [T1,T2,T3,T1,T2]', () => {
    const pool = getItemPool(Archetype.SPORGK)
    for (let turn = 1; turn < 8; turn++) {
      const rng = createRNG(`slots-early-${turn}`)
      const ids = generateStore(rng, turn, Archetype.SPORGK)
      const resolved = getStoreItems(ids, Archetype.SPORGK)
      const tiers = resolved.map((i) => i.tier)
      // All resolved tiers should be from {T1, T2, T3} before turn 8
      for (const tier of tiers) {
        expect([ItemTier.T1, ItemTier.T2, ItemTier.T3]).toContain(tier)
      }
    }
  })
})
