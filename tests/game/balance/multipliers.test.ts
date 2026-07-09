import { describe, it, expect } from 'vitest'
import { applyDiscount } from '../../../src/game/economy/cost'
import { critChanceFromLuck } from '../../../src/game/economy/luck'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { PRESETS } from '../../../src/data/balance-presets'
import { Archetype, StatType, RunPhase, ThreatTag } from '../../../src/types/enums'
import { constellationSeed, executeSeed } from '../../../src/game/save/runSeed'
import { resolve } from '../../../src/game/resolve/resolve'
import { computeDamage } from '../../../src/game/resolve/damage'
import { getItemById } from '../../../src/data/items'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { RunState } from '../../../src/types/run'
import type { Encounter } from '../../../src/types/encounters'
import type { BalanceWeights } from '../../../src/types/balance'

const soft: Encounter = {
  enemyName: 'Soft',
  armor: 0,
  evasion: 0,
  intResist: 0,
  staminaDrain: 0,
  threatTags: [ThreatTag.KINETIC],
  flavorText: '',
}

describe('difficulty weight multipliers', () => {
  it('luckEfficacyMultiplier scales crit chance', () => {
    expect(critChanceFromLuck(10, 1.0)).toBe(0.2)
    expect(critChanceFromLuck(10, 2.0)).toBe(0.4)
    expect(critChanceFromLuck(10, 0.5)).toBe(0.1)
  })

  it('luckEfficacyMultiplier scales discount', () => {
    const a = applyDiscount(100, 10, 1.0)
    const b = applyDiscount(100, 10, 2.0)
    expect(b).toBeLessThan(a)
  })

  it('nodePowerMultiplier changes procedural node flat stats', () => {
    const seed = 'NODEPOW1'
    const low: BalanceWeights = { ...PRESETS.normal, nodePowerMultiplier: 0.5 }
    const high: BalanceWeights = { ...PRESETS.normal, nodePowerMultiplier: 2.0 }
    const cLow = generateConstellation(createRNG(constellationSeed(seed, Archetype.SPORGK)), Archetype.SPORGK, low)
    const cHigh = generateConstellation(createRNG(constellationSeed(seed, Archetype.SPORGK)), Archetype.SPORGK, high)

    const sumFlat = (c: typeof cLow) =>
      [...(c.defMap?.values() ?? [])].reduce((acc, d) => {
        return acc + d.effects.filter((e) => e.kind === 'flat').reduce((s, e) => s + e.value, 0)
      }, 0)

    expect(sumFlat(cHigh)).toBeGreaterThan(sumFlat(cLow))
  })

  it('itemPowerMultiplier changes weapon flat damage contribution', () => {
    const weapon = getItemById('sporgk_item_warpfire_hatchet')
    expect(weapon).toBeDefined()
    const inventory = [{ defId: weapon!.id, instanceId: 'i1', slot: weapon!.slot, equipped: true }]
    const stats = { ...EMPTY_STATS, [StatType.STR]: 10, [StatType.AGI]: 5 }

    const base = computeDamage({
      stats,
      encounter: soft,
      inventory,
      critPayload: [false],
      evadePayload: [false],
      getItemDef: getItemById,
      primaryStat: StatType.STR,
      itemPowerMultiplier: 1.0,
    })
    const boosted = computeDamage({
      stats,
      encounter: soft,
      inventory,
      critPayload: [false],
      evadePayload: [false],
      getItemDef: getItemById,
      primaryStat: StatType.STR,
      itemPowerMultiplier: 2.0,
    })
    expect(boosted.damage).toBeGreaterThan(base.damage)
  })

  it('resolve uses luckEfficacyMultiplier for crit path (higher mult → more crits over many rolls)', () => {
    const rng = createRNG(constellationSeed('LUCKRES1', Archetype.ELF))
    const constellation = generateConstellation(rng, Archetype.ELF, PRESETS.normal)

    function damageWithLuck(luckEff: number): number {
      const run: RunState = {
        seed: 'LUCKRES1',
        archetype: Archetype.ELF,
        turn: 1,
        phase: RunPhase.DRAFT,
        stats: { ...EMPTY_STATS, STR: 5, AGI: 25, STA: 5, INT: 5, LCK: 25 },
        baseStats: { ...EMPTY_STATS },
        gold: 0,
        constellation,
        draftedNodeIds: [constellation.startNodeId],
        inventory: [],
        abilities: [],
        currentNodeDrafts: 0,
        extraNodeDrafts: 0,
        storeItems: [],
        storeRerolled: false,
        encounters: [soft],
        combatLog: [],
        lastResult: null,
        runEnded: false,
        balanceWeights: { ...PRESETS.normal, luckEfficacyMultiplier: luckEff },
        shareString: '',
      }
      // Sum damage over several independent seeds to reduce flakiness
      let total = 0
      for (let i = 0; i < 20; i++) {
        const r = resolve(run, createRNG(executeSeed(`LUCKRES1_${i}`, Archetype.ELF, 1)))
        total += r.result.damageDealt
      }
      return total
    }

    expect(damageWithLuck(2.0)).toBeGreaterThan(damageWithLuck(0.1))
  })
})
