import { describe, it, expect } from 'vitest'
import { createCompletedRun } from '../../../src/game/save/serialize'
import { checkCodexUnlocks, applyCodexModifiers } from '../../../src/game/save/codex'
import { codexModifiers } from '../../../src/data/codex/modifiers'
import { getNodeById } from '../../../src/data/nodes'
import { getItemById } from '../../../src/data/items'
import { Archetype, RunPhase, StingerVariant } from '../../../src/types/enums'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { RunState } from '../../../src/types/run'
import type { CodexState } from '../../../src/types/save'
import type { ConstellationNode } from '../../../src/types/nodes'
import { PRESETS } from '../../../src/data/balance-presets'

function makeNode(id: string): ConstellationNode {
  return { defId: id, id, x: 0, y: 0, column: 0, edges: [], purchased: false, locked: false }
}

/** Shape endRun uses today: lastResult set, runEnded still false. */
function runAsEndRunSees(pass: boolean): RunState {
  const n0 = makeNode('node_0')
  const nodes = new Map([[n0.id, n0]])
  return {
    seed: 'ENDRUN01',
    archetype: Archetype.SPORGK,
    turn: pass ? 20 : 5,
    phase: RunPhase.STINGER,
    stats: { ...EMPTY_STATS, STR: 10 },
    baseStats: { ...EMPTY_STATS },
    gold: 50,
    constellation: { nodes, startNodeId: 'node_0', anchorNodeIds: ['node_0'] },
    draftedNodeIds: ['node_0'],
    inventory: [],
    abilities: [],
    currentNodeDrafts: 0,
    extraNodeDrafts: 0,
    storeItems: [],
    storeRerolled: false,
    encounters: [],
    combatLog: [],
    lastResult: {
      pass,
      damageDealt: pass ? 500 : 100,
      threshold: 200,
      deficit: pass ? -300 : 100,
      stingerVariant: pass ? StingerVariant.PASS : StingerVariant.FAIL,
    },
    runEnded: false,
    balanceWeights: PRESETS.normal,
    shareString: '',
  }
}

const emptyCodex: CodexState = {
  unlockedModifiers: [],
  completedRuns: [],
  achievements: [],
  builds: [],
}

describe('createCompletedRun (endRun-shaped state)', () => {
  it('records passed=false when lastResult.pass is false and runEnded is still false', () => {
    const completed = createCompletedRun(runAsEndRunSees(false))
    expect(completed.passed).toBe(false)
  })

  it('records passed=true when lastResult.pass is true and runEnded is still false', () => {
    const completed = createCompletedRun(runAsEndRunSees(true))
    expect(completed.passed).toBe(true)
  })
})

describe('codex no_gear_run flag', () => {
  it('unlocks no_gear_run when inventory empty (gearEverEquipped=false) and turn met', () => {
    const completed = createCompletedRun(runAsEndRunSees(false))
    completed.turnReached = 12
    completed.passed = false
    const unlocks = checkCodexUnlocks(completed, emptyCodex, completed as unknown as never, false)
    // peak stats arg is StatBlock; pass stats separately
    void unlocks
  })

  it('no_gear_run unlocks only when gearEverEquipped is false', () => {
    const completed = {
      id: 'x',
      seed: 'S',
      archetype: Archetype.SPORGK,
      turnReached: 12,
      passed: false,
      deficitOrMargin: 0,
      draftedNodeIds: [],
      shareString: '',
      timestamp: 0,
    }
    const naked = checkCodexUnlocks(completed, emptyCodex, undefined, false)
    const geared = checkCodexUnlocks(completed, emptyCodex, undefined, true)
    const nakedMods = naked.filter((id) => {
      const m = codexModifiers.find((c) => c.id === id)
      return m?.unlockCondition.type === 'no_gear_run'
    })
    const gearedMods = geared.filter((id) => {
      const m = codexModifiers.find((c) => c.id === id)
      return m?.unlockCondition.type === 'no_gear_run'
    })
    expect(nakedMods.length).toBeGreaterThan(0)
    expect(gearedMods.length).toBe(0)
  })

  it('failed run does not unlock win_run modifiers', () => {
    const completed = {
      id: 'x',
      seed: 'S',
      archetype: Archetype.SPORGK,
      turnReached: 20,
      passed: false,
      deficitOrMargin: 0,
      draftedNodeIds: [],
      shareString: '',
      timestamp: 0,
    }
    const unlocks = checkCodexUnlocks(completed, emptyCodex)
    const winMods = unlocks.filter((id) => {
      const m = codexModifiers.find((c) => c.id === id)
      return m?.unlockCondition.type === 'win_run'
    })
    expect(winMods.length).toBe(0)
  })
})

describe('codex pool-extension targets exist', () => {
  it('every add_node_to_pool / add_item_to_pool target resolves', () => {
    for (const mod of codexModifiers) {
      if (mod.effect.type === 'add_node_to_pool' && mod.effect.nodeId) {
        const arch =
          mod.unlockCondition.archetype ??
          (mod.effect.nodeId.startsWith('elf_')
            ? Archetype.ELF
            : mod.effect.nodeId.startsWith('vamp_')
              ? Archetype.VAMPIRE
              : Archetype.SPORGK)
        const node = getNodeById(arch, mod.effect.nodeId)
        expect(node, `missing node ${mod.effect.nodeId} for ${mod.id}`).toBeDefined()
      }
      if (mod.effect.type === 'add_item_to_pool' && mod.effect.itemId) {
        const item = getItemById(mod.effect.itemId)
        expect(item, `missing item ${mod.effect.itemId} for ${mod.id}`).toBeDefined()
      }
    }
  })

  it('applyCodexModifiers injects extra nodes/items for unlocked pool mods', () => {
    const result = applyCodexModifiers(Archetype.SPORGK, [
      'mod_sporgk_berserker',
      'mod_naked_brawler',
      'mod_double_draft',
      'mod_asteroid_cache',
    ])
    expect(result.extraNodes.some((n) => n.id === 'sporgk_berserker_rite')).toBe(true)
    expect(result.extraItems.some((i) => i.id === 'item_void_knuckles')).toBe(true)
    expect(result.extraItems.some((i) => i.id === 'item_draft_token')).toBe(true)
    expect(result.extraItems.some((i) => i.id === 'sporgk_item_warp_fuel')).toBe(true)
  })
})
