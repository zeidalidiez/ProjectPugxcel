import { describe, it, expect } from 'vitest'
import { encodeShareString } from '../../../src/game/save/serialize'
import { parseShareString, resolveWeightsForParsedShare } from '../../../src/game/save/deserialize'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { purchaseNode } from '../../../src/game/constellation/purchase'
import { PRESETS } from '../../../src/data/balance-presets'
import { Archetype, RunPhase } from '../../../src/types/enums'
import {
  constellationSeed,
  executeSeed,
  normalizeSeed,
  forecastSeed,
} from '../../../src/game/save/runSeed'
import { EMPTY_STATS, addStats } from '../../../src/types/stats'
import type { RunState } from '../../../src/types/run'
import { simulateShareReplay } from '../../../src/game/save/simulateShareReplay'
import { resolve } from '../../../src/game/resolve/resolve'
import { generateEncounters } from '../../../src/game/resolve/encounter'

describe('share string + replay fidelity', () => {
  it('normalizeSeed matches encode truncation', () => {
    expect(normalizeSeed('hello-world-123')).toBe('HELLOWOR')
    expect(normalizeSeed('AB12')).toBe('AB12')
  })

  it('encode → parse preserves archetype, seed, named preset', () => {
    const seed = normalizeSeed('SHARE001')
    const rng = createRNG(constellationSeed(seed, Archetype.SPORGK))
    const constellation = generateConstellation(rng, Archetype.SPORGK, PRESETS.hard)
    const state: RunState = {
      seed,
      archetype: Archetype.SPORGK,
      turn: 3,
      phase: RunPhase.DRAFT,
      stats: { ...EMPTY_STATS },
      baseStats: { ...EMPTY_STATS },
      gold: 100,
      constellation,
      draftedNodeIds: [constellation.startNodeId],
      inventory: [],
      abilities: [],
      currentNodeDrafts: 0,
      extraNodeDrafts: 0,
      storeItems: [],
      storeRerolled: false,
      encounters: [],
      combatLog: [],
      lastResult: null,
      runEnded: false,
      balanceWeights: PRESETS.hard,
      shareString: '',
    }
    const share = encodeShareString(state)
    const parsed = parseShareString(share)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.seed).toBe(seed)
    expect(parsed.data.archetype).toBe(Archetype.SPORGK)
    expect(parsed.data.presetId).toBe('hard')
    expect(resolveWeightsForParsedShare(parsed.data)).toEqual(PRESETS.hard)
  })

  it('replay setup uses same constellation seed formula as live start', () => {
    const seed = 'REPLAY01'
    const arch = Archetype.ELF
    const live = generateConstellation(
      createRNG(constellationSeed(seed, arch)),
      arch,
      PRESETS.normal,
    )
    const shareState: RunState = {
      seed: normalizeSeed(seed),
      archetype: arch,
      turn: 1,
      phase: RunPhase.DRAFT,
      stats: { ...EMPTY_STATS },
      baseStats: { ...EMPTY_STATS },
      gold: 80,
      constellation: live,
      draftedNodeIds: [live.startNodeId],
      inventory: [],
      abilities: [],
      currentNodeDrafts: 0,
      extraNodeDrafts: 0,
      storeItems: [],
      storeRerolled: false,
      encounters: [],
      combatLog: [],
      lastResult: null,
      runEnded: false,
      balanceWeights: PRESETS.normal,
      shareString: '',
    }
    const share = encodeShareString(shareState)
    const parsed = parseShareString(share)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const weights = resolveWeightsForParsedShare(parsed.data)
    const replayConstellation = generateConstellation(
      createRNG(constellationSeed(parsed.data.seed, arch)),
      arch,
      weights,
    )
    expect(replayConstellation.startNodeId).toBe(live.startNodeId)
    expect(replayConstellation.nodes.size).toBe(live.nodes.size)
  })

  it('simulateShareReplay runs without error on a valid share string', () => {
    const seed = normalizeSeed('SIMREP01')
    const arch = Archetype.SPORGK
    const constellation = generateConstellation(
      createRNG(constellationSeed(seed, arch)),
      arch,
      PRESETS.easy,
    )
    const state: RunState = {
      seed,
      archetype: arch,
      turn: 1,
      phase: RunPhase.DRAFT,
      stats: { ...EMPTY_STATS },
      baseStats: { ...EMPTY_STATS },
      gold: 80,
      constellation,
      draftedNodeIds: [constellation.startNodeId],
      inventory: [],
      abilities: [],
      currentNodeDrafts: 0,
      extraNodeDrafts: 0,
      storeItems: [],
      storeRerolled: false,
      encounters: [],
      combatLog: [],
      lastResult: null,
      runEnded: false,
      balanceWeights: PRESETS.easy,
      shareString: '',
    }
    // Encode only start node as draft
    const share = encodeShareString(state)
    const sim = simulateShareReplay(share)
    expect(sim.ok).toBe(true)
    if (!sim.ok) return
    expect(sim.log.length).toBeGreaterThan(0)
    expect(['PASS', 'FAIL']).toContain(sim.finalResult)
  })

  it('execute seed formula matches store executeSeed helper', () => {
    const s = executeSeed('ABC', Archetype.VAMPIRE, 7)
    expect(s).toBe(`${normalizeSeed('ABC')}_${Archetype.VAMPIRE}_t7_ex`)
    const f = forecastSeed('ABC', Archetype.VAMPIRE, 7)
    expect(f).toContain('_t7_f')
  })

  it('live startRun-shaped turn-1 damage matches simulateShareReplay for same share', () => {
    // Drive the real shipped helpers used by startRun + execute vs simulateShareReplay.
    // Start-only draft (no extra nodes) so both paths have identical stats/abilities.
    const rawSeed = 'LIVEVSREP'
    const seed = normalizeSeed(rawSeed)
    const arch = Archetype.SPORGK
    const weights = PRESETS.normal

    // --- Live path (mirrors store.startRun + execute for turn 1, no codex) ---
    const liveRng = createRNG(constellationSeed(seed, arch))
    const constellation = generateConstellation(liveRng, arch, weights)
    const encounters = generateEncounters(createRNG(forecastSeed(seed, arch, 1)), 1, 5)

    const STARTING = { ...EMPTY_STATS, STR: 8, STA: 4, AGI: 5, INT: 0, LCK: 0 }
    let stats = { ...STARTING }
    let abilities: string[] = []
    const startId = constellation.startNodeId
    if (startId) {
      const purchase = purchaseNode(constellation, [], startId, arch)
      if (purchase) {
        stats = addStats(stats, purchase.statGain)
        if (purchase.abilityUnlocked) abilities = [purchase.abilityUnlocked]
      }
    }

    const liveRun: RunState = {
      seed,
      archetype: arch,
      turn: 1,
      phase: RunPhase.DRAFT,
      stats,
      baseStats: { ...stats },
      gold: Math.floor(80 * weights.startingGoldMultiplier),
      constellation,
      draftedNodeIds: startId ? [startId] : [],
      inventory: [],
      abilities,
      currentNodeDrafts: 0,
      extraNodeDrafts: 0,
      storeItems: [],
      storeRerolled: false,
      encounters,
      combatLog: [],
      lastResult: null,
      runEnded: false,
      balanceWeights: weights,
      shareString: '',
    }

    const liveResolve = resolve(liveRun, createRNG(executeSeed(seed, arch, 1)))

    // --- Share + pure replay ---
    const share = encodeShareString(liveRun)
    const sim = simulateShareReplay(share)
    expect(sim.ok).toBe(true)
    if (!sim.ok) return

    // Extract turn-1 TOTAL DAMAGE line from replay log (same format as resolve)
    const turn1Block: string[] = []
    let inTurn1 = false
    for (const line of sim.log) {
      if (line.text.startsWith('── TURN 1')) {
        inTurn1 = true
        continue
      }
      if (inTurn1 && line.text.startsWith('── TURN')) break
      if (inTurn1) turn1Block.push(line.text)
    }
    const totalLine = turn1Block.find((t) => t.startsWith('TOTAL DAMAGE:'))
    expect(totalLine).toBeDefined()
    const match = totalLine!.match(/TOTAL DAMAGE: (\d+) \/ REQUIRED: (\d+)/)
    expect(match).not.toBeNull()
    const replayDamage = Number(match![1])
    const replayThreshold = Number(match![2])

    expect(replayDamage).toBe(liveResolve.result.damageDealt)
    expect(replayThreshold).toBe(liveResolve.result.threshold)
    expect(liveResolve.result.pass).toBe(replayDamage >= replayThreshold)
  })
})

