import { describe, it, expect, beforeEach } from 'vitest'
import { encodeShareString, createCompletedRun } from '../../../src/game/save/serialize'
import { parseShareString } from '../../../src/game/save/deserialize'
import { checkCodexUnlocks } from '../../../src/game/save/codex'
import {
  saveToDisk,
  loadFromDisk,
  saveCodex,
  loadCodex,
  saveSettings,
  loadSettings,
} from '../../../src/game/save/storage'
import { Archetype, RunPhase } from '../../../src/types/enums'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { ConstellationNode } from '../../../src/types/nodes'
import type { RunState } from '../../../src/types/run'
import type { CompletedRun as CompletedRunType, CodexState as CodexStateType, SaveState as SaveStateType } from '../../../src/types/save'

function makeConstellationNode(
  id: string,
  column: number,
  y: number,
  x: number,
): ConstellationNode {
  return {
    defId: `def_${id}`,
    id,
    x,
    y,
    column,
    edges: [],
    purchased: false,
    locked: false,
  }
}

function buildRunState(overrides: Partial<RunState> = {}): RunState {
  const node0 = makeConstellationNode('node_0', 0, 0, 0)
  const node1 = makeConstellationNode('node_1', 1, 0, 10)
  const node2 = makeConstellationNode('node_2', 2, 0, 20)
  const node3 = makeConstellationNode('node_3', 3, 0, 30)
  const node4 = makeConstellationNode('node_4', 1, 5, 10)
  const node5 = makeConstellationNode('node_5', 2, 5, 20)
  const nodes = new Map<string, ConstellationNode>()
  for (const n of [node0, node1, node2, node3, node4, node5]) {
    nodes.set(n.id, n)
  }

  return {
    seed: 'test-seed-abc-123',
    archetype: Archetype.SPORGK,
    turn: 5,
    phase: RunPhase.DRAFT,
    stats: { ...EMPTY_STATS },
    baseStats: { ...EMPTY_STATS },
    gold: 200,
    constellation: {
      nodes,
      startNodeId: 'node_0',
      anchorNodeIds: ['node_0'],
    },
    draftedNodeIds: ['node_1', 'node_3', 'node_5'],
    inventory: [],
    abilities: [],
    currentNodeDrafts: 1,
    extraNodeDrafts: 0,
    storeItems: [],
    storeRerolled: false,
    encounters: [],
    combatLog: [],
    lastResult: null,
    runEnded: false,
    shareString: '',
    ...overrides,
  }
}

// ============================================================
// serialize.ts tests
// ============================================================

describe('encodeShareString', () => {
  it('produces a string starting with ANTIGRAV/', () => {
    const state = buildRunState()
    const result = encodeShareString(state)
    expect(result.startsWith('ANTIGRAV/')).toBe(true)
  })

  it('includes the archetype abbreviation and seed prefix', () => {
    const state = buildRunState({ seed: 'my-special-seed-999' })
    const result = encodeShareString(state)
    const parts = result.split('/')
    expect(parts.length).toBeGreaterThanOrEqual(3)
    const segment2 = parts[1]
    expect(segment2).toContain('SPRGK')
    expect(segment2).toContain('MYSPECIA')
  })

  it('filters seed to alphanumeric and uppercases', () => {
    const state = buildRunState({ seed: 'a_b-c!d@e#f$g%h' })
    const result = encodeShareString(state)
    const parts = result.split('/')
    const seed8 = parts[1].split('-')[1]
    expect(seed8).toBe('ABCDEFGH')
    expect(seed8.length).toBeLessThanOrEqual(8)
  })

  it('is under 100 characters', () => {
    const state = buildRunState({
      draftedNodeIds: ['node_0', 'node_1', 'node_2', 'node_3', 'node_4', 'node_5'],
    })
    const result = encodeShareString(state)
    expect(result.length).toBeLessThan(100)
  })

  it('produces the same string for the same state (deterministic)', () => {
    const state = buildRunState()
    const r1 = encodeShareString(state)
    const r2 = encodeShareString(state)
    expect(r1).toBe(r2)
  })

  it('produces different strings for different draft picks', () => {
    const state1 = buildRunState({ draftedNodeIds: ['node_1', 'node_2'] })
    const state2 = buildRunState({ draftedNodeIds: ['node_1', 'node_3'] })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('produces different strings for different seeds', () => {
    const state1 = buildRunState({ seed: 'seed-aaa' })
    const state2 = buildRunState({ seed: 'seed-bbb' })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('produces different strings for different archetypes', () => {
    const state1 = buildRunState({ archetype: Archetype.SPORGK })
    const state2 = buildRunState({ archetype: Archetype.ELF })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('encodes vampire archetype as VAMP', () => {
    const state = buildRunState({ archetype: Archetype.VAMPIRE })
    const result = encodeShareString(state)
    const archPart = result.split('/')[1].split('-')[0]
    expect(archPart).toBe('VAMP')
  })

  it('uses Z for nodes not found in constellation', () => {
    const state = buildRunState({ draftedNodeIds: ['nonexistent_node'] })
    const result = encodeShareString(state)
    const draftSeq = result.split('/')[2]
    expect(draftSeq).toBe('Z')
  })

  it('encodes empty draft sequence as empty string', () => {
    const state = buildRunState({ draftedNodeIds: [] })
    const result = encodeShareString(state)
    const draftSeq = result.split('/')[2]
    expect(draftSeq).toBe('')
  })
})

describe('createCompletedRun', () => {
  it('creates a CompletedRun with a unique ID', () => {
    const state = buildRunState({ turn: 10 })
    const run1 = createCompletedRun(state)
    const run2 = createCompletedRun(state)
    expect(run1.id).toBeTruthy()
    expect(run2.id).toBeTruthy()
    expect(run1.id).not.toBe(run2.id)
  })

  it('sets passed correctly when lastResult exists and pass is true', () => {
    const state = buildRunState({
      turn: 8,
      runEnded: true,
      lastResult: {
        pass: true,
        damageDealt: 500,
        threshold: 400,
        deficit: 100,
        stingerVariant: 'PASS' as any,
      },
    })
    const run = createCompletedRun(state)
    expect(run.passed).toBe(true)
  })

  it('sets passed to false when lastResult pass is false', () => {
    const state = buildRunState({
      turn: 5,
      runEnded: true,
      lastResult: {
        pass: false,
        damageDealt: 200,
        threshold: 400,
        deficit: 200,
        stingerVariant: 'FAIL' as any,
      },
    })
    const run = createCompletedRun(state)
    expect(run.passed).toBe(false)
  })

  it('preserves the share string', () => {
    const state = buildRunState({ turn: 12 })
    const run = createCompletedRun(state)
    expect(run.shareString).toBe(encodeShareString(state))
  })

  it('preserves draftedNodeIds', () => {
    const state = buildRunState({ draftedNodeIds: ['node_1', 'node_2'] })
    const run = createCompletedRun(state)
    expect(run.draftedNodeIds).toEqual(['node_1', 'node_2'])
  })
})

// ============================================================
// deserialize.ts tests
// ============================================================

describe('parseShareString', () => {
  it('parses a valid share string correctly', () => {
    const result = parseShareString('ANTIGRAV/SPRGK-ABCDEFGH/012Z')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.archetype).toBe(Archetype.SPORGK)
      expect(result.data.seed).toBe('ABCDEFGH')
      expect(result.data.draftSeq).toBe('012Z')
    }
  })

  it('parses ELF archetype', () => {
    const result = parseShareString('ANTIGRAV/ELF-12345678/ABC')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.archetype).toBe(Archetype.ELF)
    }
  })

  it('parses VAMP archetype', () => {
    const result = parseShareString('ANTIGRAV/VAMP-SEED1234/XYZ')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.archetype).toBe(Archetype.VAMPIRE)
    }
  })

  it('returns error for non-ANTIGRAV tag', () => {
    const result = parseShareString('OTHER/SPRGK-SEED/DRAFT')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('malformed')
  })

  it('returns error for missing segments', () => {
    expect(parseShareString('ANTIGRAV/SPRGK-SEED').ok).toBe(false)
    expect(parseShareString('ANTIGRAV').ok).toBe(false)
  })

  it('returns error for unknown archetype abbreviation', () => {
    const result = parseShareString('ANTIGRAV/XXXX-SEED1234/DRAFT')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('invalid_archetype')
  })

  it('returns error for missing separator in segment 2', () => {
    const result = parseShareString('ANTIGRAV/SPRGKABCDEFGH/DRAFT')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('malformed')
  })

  it('returns error for empty seed', () => {
    const result = parseShareString('ANTIGRAV/SPRGK-/DRAFT')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('invalid_seed')
  })

  it('returns error for null/undefined input', () => {
    expect(parseShareString(null as any).ok).toBe(false)
    expect(parseShareString(undefined as any).ok).toBe(false)
  })

  it('preserves draft sequence with multiple slashes', () => {
    const result = parseShareString('ANTIGRAV/ELF-SEED1234/DRAFT/EXTRA')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.draftSeq).toBe('DRAFT/EXTRA')
  })
})

// ============================================================
// codex.ts tests
// ============================================================

function makeCompletedRun(overrides: Partial<CompletedRunType> = {}): CompletedRunType {
  return {
    id: 'run-001',
    seed: 'test-seed',
    archetype: Archetype.SPORGK,
    turnReached: 10,
    passed: true,
    deficitOrMargin: 50,
    draftedNodeIds: [],
    shareString: '',
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeCodexState(overrides: Partial<CodexStateType> = {}): CodexStateType {
  return {
    unlockedModifiers: [],
    completedRuns: [],
    achievements: [],
    builds: [],
    ...overrides,
  }
}

describe('checkCodexUnlocks', () => {
  it('unlocks generic win_run modifier on victory', () => {
    const run = makeCompletedRun({ passed: true })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toContain('mod_double_draft')
  })

  it('unlocks archetype-specific win_run modifier', () => {
    const run = makeCompletedRun({ passed: true, archetype: Archetype.SPORGK })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toContain('mod_iron_hide')
  })

  it('does not unlock wrong-archetype win_run modifier', () => {
    const run = makeCompletedRun({ passed: true, archetype: Archetype.SPORGK })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_crystalline_focus')
    expect(unlocks).not.toContain('mod_void_touched')
  })

  it('unlocks reach_turn modifiers', () => {
    const run = makeCompletedRun({ turnReached: 16, passed: false })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toContain('mod_war_chest')
    expect(unlocks).toContain('mod_lucky_charm')
    expect(unlocks).toContain('mod_golden_paws')
    expect(unlocks).toContain('mod_endurance')
  })

  it('does not unlock reach_turn when value not met', () => {
    const run = makeCompletedRun({ turnReached: 4, passed: false })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_war_chest')
    expect(unlocks).not.toContain('mod_lucky_charm')
  })

  it('unlocks archetype_challenge modifiers', () => {
    const run = makeCompletedRun({
      passed: true,
      archetype: Archetype.SPORGK,
      turnReached: 15,
    })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toContain('mod_sporgk_berserker')
  })

  it('does not unlock archetype_challenge when wrong archetype', () => {
    const run = makeCompletedRun({
      passed: true,
      archetype: Archetype.ELF,
      turnReached: 15,
    })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_sporgk_berserker')
    expect(unlocks).toContain('mod_elf_starweaver')
  })

  it('unlocks boss_kill when run passed and turn is divisible by 5', () => {
    const run = makeCompletedRun({ passed: true, turnReached: 5 })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toContain('mod_boss_slayer')
  })

  it('does not unlock boss_kill when run did not pass', () => {
    const run = makeCompletedRun({ passed: false, turnReached: 5 })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_boss_slayer')
  })

  it('does not unlock boss_kill when turn not divisible by 5', () => {
    const run = makeCompletedRun({ passed: true, turnReached: 7 })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_boss_slayer')
  })

  it('does not re-unlock already owned modifiers', () => {
    const run = makeCompletedRun({ passed: true, turnReached: 20, archetype: Archetype.SPORGK })
    const codex = makeCodexState({ unlockedModifiers: ['mod_double_draft', 'mod_iron_hide'] })
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_double_draft')
    expect(unlocks).not.toContain('mod_iron_hide')
    expect(unlocks).toContain('mod_boss_slayer')
  })

  it('does not unlock no_gear_run or stat_threshold (deferred)', () => {
    const run = makeCompletedRun({ passed: true, turnReached: 20 })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.toContain('mod_naked_brawler')
    expect(unlocks).not.toContain('mod_astral_wealth')
    expect(unlocks).not.toContain('mod_collector')
  })

  it('returns empty array when nothing unlocks', () => {
    const run = makeCompletedRun({ passed: false, turnReached: 1 })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).toEqual([])
  })
})

// ============================================================
// storage.ts tests
// ============================================================

function makeSaveState(overrides: Partial<SaveStateType> = {}): SaveStateType {
  return {
    version: 1,
    run: null,
    codex: {
      unlockedModifiers: ['mod_double_draft'],
      completedRuns: [],
      achievements: ['ch_sporgk_victory'],
      builds: [],
    },
    settings: {
      fontSize: 125,
      reducedMotion: false,
      uncertaintyMode: false,
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.8,
      musicVolume: 0.4,
    },
    ...overrides,
  }
}

describe('saveToDisk / loadFromDisk', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a SaveState preserving all fields', () => {
    const state = makeSaveState()
    saveToDisk(state)
    const loaded = loadFromDisk()
    expect(loaded).not.toBeNull()
    expect(loaded!.version).toBe(state.version)
    expect(loaded!.codex.unlockedModifiers).toEqual(state.codex.unlockedModifiers)
    expect(loaded!.codex.achievements).toEqual(state.codex.achievements)
    expect(loaded!.settings.fontSize).toBe(state.settings.fontSize)
    expect(loaded!.settings.soundEnabled).toBe(state.settings.soundEnabled)
  })

  it('returns null when no save exists', () => {
    const loaded = loadFromDisk()
    expect(loaded).toBeNull()
  })

  it('returns null for corrupted JSON', () => {
    localStorage.setItem('antigravity_save', 'not-valid-json{{{')
    const loaded = loadFromDisk()
    expect(loaded).toBeNull()
  })

  it('returns null for invalid save data (wrong schema)', () => {
    localStorage.setItem('antigravity_save', JSON.stringify({ version: 'wrong', run: null }))
    const loaded = loadFromDisk()
    expect(loaded).toBeNull()
  })

  it('returns null for empty object', () => {
    localStorage.setItem('antigravity_save', JSON.stringify({}))
    const loaded = loadFromDisk()
    expect(loaded).toBeNull()
  })

  it('overwrites existing save', () => {
    const state1 = makeSaveState({ version: 1 })
    const state2 = makeSaveState({ version: 2 })
    saveToDisk(state1)
    saveToDisk(state2)
    const loaded = loadFromDisk()
    expect(loaded!.version).toBe(2)
  })
})

describe('saveCodex / loadCodex', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads codex state', () => {
    const codex = {
      unlockedModifiers: ['mod_iron_hide', 'mod_double_draft'],
      completedRuns: [],
      achievements: [],
      builds: [],
    }
    saveCodex(codex)
    const loaded = loadCodex()
    expect(loaded.unlockedModifiers).toEqual(['mod_iron_hide', 'mod_double_draft'])
  })

  it('returns default codex when no save exists', () => {
    const loaded = loadCodex()
    expect(loaded.unlockedModifiers).toEqual([])
    expect(loaded.completedRuns).toEqual([])
    expect(loaded.achievements).toEqual([])
    expect(loaded.builds).toEqual([])
  })

  it('preserves other save data when updating codex', () => {
    const state = makeSaveState()
    saveToDisk(state)

    const newCodex = {
      unlockedModifiers: ['mod_boss_slayer'],
      completedRuns: [
        {
          id: 'r1',
          seed: 's',
          archetype: Archetype.SPORGK,
          turnReached: 5,
          passed: true,
          deficitOrMargin: 0,
          draftedNodeIds: [],
          shareString: '',
          timestamp: 0,
        },
      ],
      achievements: [],
      builds: [],
    }
    saveCodex(newCodex)

    const loaded = loadFromDisk()
    expect(loaded!.codex.unlockedModifiers).toEqual(['mod_boss_slayer'])
    expect(loaded!.codex.completedRuns.length).toBe(1)
    expect(loaded!.settings.fontSize).toBe(state.settings.fontSize)
  })
})

describe('saveSettings / loadSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads settings', () => {
    const settings = {
      fontSize: 150 as const,
      reducedMotion: true,
      uncertaintyMode: true,
      soundEnabled: false,
      musicEnabled: false,
      soundVolume: 0.5,
      musicVolume: 0.2,
    }
    saveSettings(settings)
    const loaded = loadSettings()
    expect(loaded?.fontSize).toBe(150)
    expect(loaded?.reducedMotion).toBe(true)
    expect(loaded?.soundEnabled).toBe(false)
  })

  it('returns null when no settings saved', () => {
    const loaded = loadSettings()
    expect(loaded).toBeNull()
  })

  it('preserves other save data when updating settings', () => {
    const state = makeSaveState()
    saveToDisk(state)

    const newSettings = {
      fontSize: 100 as const,
      reducedMotion: true,
      uncertaintyMode: true,
      soundEnabled: true,
      musicEnabled: false,
      soundVolume: 0.3,
      musicVolume: 0.1,
    }
    saveSettings(newSettings)

    const loaded = loadFromDisk()
    expect(loaded!.settings.fontSize).toBe(100)
    expect(loaded!.codex.unlockedModifiers).toEqual(state.codex.unlockedModifiers)
  })
})
