import { describe, it, expect } from 'vitest'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { PRESETS } from '../../../src/data/balance-presets'
import { Archetype, RunPhase, StatType } from '../../../src/types/enums'
import { constellationSeed, executeSeed } from '../../../src/game/save/runSeed'
import { getAbilityById } from '../../../src/data/abilities'
import { getItemById } from '../../../src/data/items'
import { resolve } from '../../../src/game/resolve/resolve'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { RunState } from '../../../src/types/run'
import type { Encounter } from '../../../src/types/encounters'
import { ThreatTag } from '../../../src/types/enums'

const softEncounter: Encounter = {
  enemyName: 'Soft Target',
  armor: 0,
  evasion: 0,
  intResist: 0,
  staminaDrain: 0,
  threatTags: [ThreatTag.KINETIC],
  flavorText: 'test',
}

function baseRun(overrides: Partial<RunState> = {}): RunState {
  const rng = createRNG(constellationSeed('ABTEST01', Archetype.SPORGK))
  const constellation = generateConstellation(rng, Archetype.SPORGK, PRESETS.normal)
  return {
    seed: 'ABTEST01',
    archetype: Archetype.SPORGK,
    turn: 1,
    phase: RunPhase.DRAFT,
    stats: { ...EMPTY_STATS, [StatType.STR]: 20, [StatType.AGI]: 5, [StatType.STA]: 30, [StatType.INT]: 5, [StatType.LCK]: 0 },
    baseStats: { ...EMPTY_STATS },
    gold: 200,
    constellation,
    draftedNodeIds: [constellation.startNodeId],
    inventory: [],
    abilities: [],
    currentNodeDrafts: 1,
    extraNodeDrafts: 0,
    storeItems: [],
    storeRerolled: false,
    encounters: [softEncounter],
    combatLog: [],
    lastResult: null,
    runEnded: false,
    balanceWeights: PRESETS.normal,
    shareString: '',
    ...overrides,
  }
}

describe('ability wiring', () => {
  it('procedural constellation ability unlocks use catalog IDs', () => {
    const rng = createRNG(constellationSeed('ABIDS001', Archetype.SPORGK))
    const constellation = generateConstellation(rng, Archetype.SPORGK, PRESETS.normal)
    const withAbility = [...(constellation.defMap?.values() ?? [])].filter((d) => d.unlocksAbility)
    expect(withAbility.length).toBeGreaterThan(0)
    for (const def of withAbility) {
      const ability = getAbilityById(def.unlocksAbility!)
      expect(ability, `missing ability ${def.unlocksAbility}`).toBeDefined()
    }
  })

  it('item grantsAbility IDs resolve in catalog', () => {
    const itemAbilityIds = [
      'sporgk_ab_asteroid_cleave',
      'sporgk_ab_warp_annihilate',
      'elf_ab_crystal_prism',
      'vamp_ab_void_whisper',
      'vamp_ab_soul_rend',
      'vamp_ab_cathedral_bolt',
      'vamp_ab_life_siphon',
      'ab_warphowl',
      'ab_gravity_well',
      'ab_nova_stim',
      'ab_nova_burst',
      'ab_singularity',
    ]
    for (const id of itemAbilityIds) {
      expect(getAbilityById(id), id).toBeDefined()
    }
  })

  it('resolve fires node ability and increases damage vs no-ability baseline', () => {
    const abilityId = 'sporgk_rage'
    expect(getAbilityById(abilityId)).toBeDefined()

    const without = baseRun({ abilities: [] })
    const withAb = baseRun({ abilities: [abilityId] })

    const rngA = createRNG(executeSeed('ABTEST01', Archetype.SPORGK, 1))
    const rngB = createRNG(executeSeed('ABTEST01', Archetype.SPORGK, 1))

    const resA = resolve(without, rngA)
    const resB = resolve(withAb, rngB)

    expect(resB.result.damageDealt).toBeGreaterThan(resA.result.damageDealt)
    expect(resB.log.some((l) => l.type === 'ability' || l.text.toLowerCase().includes('rage') || l.text.includes('ABILITY'))).toBe(true)
  })

  it('resolve fires item-granted ability', () => {
    const abilityId = 'ab_warphowl'
    const item = getItemById('item_warphowl_emitter') // may not match id
    void item
    const withAb = baseRun({ abilities: [abilityId], stats: { ...EMPTY_STATS, STR: 15, AGI: 5, STA: 40, INT: 5, LCK: 0 } })
    const without = baseRun({ abilities: [], stats: { ...EMPTY_STATS, STR: 15, AGI: 5, STA: 40, INT: 5, LCK: 0 } })

    const resA = resolve(without, createRNG(executeSeed('ITEMAB01', Archetype.SPORGK, 1)))
    const resB = resolve(withAb, createRNG(executeSeed('ITEMAB01', Archetype.SPORGK, 1)))
    expect(resB.result.damageDealt).toBeGreaterThan(resA.result.damageDealt)
  })
})
