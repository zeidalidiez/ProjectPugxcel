import { create } from 'zustand'
import type { RunState } from './types/run'
import type { CodexState, SettingsState, SavedBuild } from './types/save'
import type { InventoryItem } from './types/items'
import type { StatBlock } from './types/stats'
import type { BalanceWeights, DifficultyPresetId } from './types/balance'
import { RunPhase, Archetype, StatType } from './types/enums'
import { EMPTY_STATS, addStats } from './types/stats'
import { createRNG } from './game/rng/create'
import { generateConstellation } from './game/constellation/generate'
import { canPurchaseNode } from './game/constellation/canPurchase'
import { purchaseNode } from './game/constellation/purchase'
import { generateStore } from './game/economy/store'
import { calculatePayout } from './game/economy/payout'
import { applyDiscount } from './game/economy/cost'
import { generateEncounters } from './game/resolve/encounter'
import { resolve } from './game/resolve/resolve'
import { encodeShareString, createCompletedRun } from './game/save/serialize'
import { checkCodexUnlocks, applyCodexModifiers } from './game/save/codex'
import { loadFromDisk, saveCodex, saveSettings } from './game/save/storage'
import { getItemById } from './data/items'
import { getNodeById } from './data/nodes'
import { PRESETS, DEFAULT_PRESET } from './data/balance-presets'

const PREP_TURNS = 0

const STARTING_STATS: Record<Archetype, StatBlock> = {
  [Archetype.SPORGK]: { ...EMPTY_STATS, [StatType.STR]: 8, [StatType.STA]: 4, [StatType.AGI]: 5 },
  [Archetype.ELF]: { ...EMPTY_STATS, [StatType.STR]: 4, [StatType.AGI]: 8, [StatType.LCK]: 5 },
  [Archetype.VAMPIRE]: { ...EMPTY_STATS, [StatType.STR]: 5, [StatType.AGI]: 5, [StatType.INT]: 5, [StatType.STA]: 4 },
}

let instanceCounter = 0

function nextInstanceId(): string {
  return `inst_${Date.now()}_${++instanceCounter}`
}

const DEFAULT_SETTINGS: SettingsState = {
  fontSize: 125,
  reducedMotion: false,
  uncertaintyMode: false,
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.4,
}

const DEFAULT_CODEX: CodexState = {
  unlockedModifiers: [],
  completedRuns: [],
  achievements: [],
  builds: [],
}

interface GameStore {
  phase: RunPhase
  run: RunState | null
  codex: CodexState
  settings: SettingsState
  initialized: boolean

  /** Currently selected difficulty preset (persisted in MetaState) */
  selectedPresetId: DifficultyPresetId
  /** Currently active balance weights (from preset or custom) */
  balanceWeights: BalanceWeights
  /** Last used custom weights, preserved when switching back to custom */
  lastCustomWeights: BalanceWeights | null

  init: () => void
  startRun: (seed: string, archetype: Archetype, weights?: BalanceWeights) => void
  setDifficulty: (presetId: DifficultyPresetId, customWeights?: BalanceWeights) => void
  advanceToForecast: () => void
  advanceToPayout: () => void
  initDraft: () => void
  purchaseNode: (nodeId: string) => boolean
  purchaseItem: (itemId: string) => boolean
  execute: () => void
  endRun: () => void
  resetRun: () => void
  updateSettings: (partial: Partial<SettingsState>) => void
  getRng: () => ReturnType<typeof createRNG>
  getPurchasableNodeIds: () => string[]
  canAffordNode: (nodeId: string) => boolean
  canAffordItem: (itemId: string) => boolean
  saveBuild: (name: string) => void
  hasDraftsRemaining: () => boolean
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: RunPhase.ARCHETYPE_SELECT,
  run: null,
  codex: DEFAULT_CODEX,
  settings: DEFAULT_SETTINGS,
  initialized: false,

  selectedPresetId: DEFAULT_PRESET,
  balanceWeights: PRESETS[DEFAULT_PRESET as keyof typeof PRESETS],
  lastCustomWeights: null,

  init: () => {
    const saved = loadFromDisk()
    if (saved) {
      set({
        codex: saved.codex,
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        initialized: true,
      })
    } else {
      set({ initialized: true })
    }
  },

  setDifficulty: (presetId, customWeights) => {
    if (presetId === 'custom') {
      const weights = customWeights ?? get().lastCustomWeights ?? PRESETS.normal
      set({
        selectedPresetId: 'custom',
        balanceWeights: weights,
        lastCustomWeights: weights,
      })
    } else {
      set({
        selectedPresetId: presetId,
        balanceWeights: PRESETS[presetId as keyof typeof PRESETS],
      })
    }
  },

  startRun: (seed, archetype, weights) => {
    const activeWeights = weights ?? get().balanceWeights
    const rng = createRNG(`${seed}_${archetype}`)
    const codexEffects = applyCodexModifiers(archetype, get().codex.unlockedModifiers)
    const constellation = generateConstellation(rng, archetype, codexEffects.extraNodes)
    const encounters = 1 <= PREP_TURNS ? [] : generateEncounters(rng, 1, 5)

    const startNodeId = constellation.startNodeId
    const startNode = constellation.nodes.get(startNodeId)

    const baseStats = addStats({ ...STARTING_STATS[archetype] }, codexEffects.bonusStats)

    const startingGold = Math.floor((80 + codexEffects.bonusGold) * activeWeights.startingGoldMultiplier)

    const run: RunState = {
      seed,
      archetype,
      turn: 1,
      phase: RunPhase.FORECAST,
      stats: { ...baseStats },
      baseStats: { ...baseStats },
      gold: startingGold,
      constellation,
      draftedNodeIds: startNodeId ? [startNodeId] : [],
      inventory: [],
      abilities: [],
      currentNodeDrafts: 0,
      extraNodeDrafts: 0,
      storeItems: [],
      storeRerolled: false,
      encounters,
      combatLog: [],
      lastResult: null,
      runEnded: false,
      shareString: '',
      balanceWeights: activeWeights,
    }

    if (startNode && startNodeId) {
      const nodePurchase = purchaseNode(constellation, [], startNodeId, archetype)
      if (nodePurchase) {
        run.stats = addStats(run.stats, nodePurchase.statGain)
        run.baseStats = addStats(run.baseStats, nodePurchase.statGain)
        if (nodePurchase.abilityUnlocked) {
          run.abilities = [...run.abilities, nodePurchase.abilityUnlocked]
        }
      }
    }

    set({ run, phase: RunPhase.FORECAST })
  },

  advanceToForecast: () => {
    const run = get().run
    if (!run) return
    const nextTurn = run.turn + 1
    const isPrep = nextTurn <= PREP_TURNS
    const rng = createRNG(`${run.seed}_${run.archetype}_t${nextTurn}_f`)
    const encounters = isPrep ? [] : generateEncounters(rng, nextTurn, 5)
    set({
      run: { ...run, turn: nextTurn, encounters, phase: RunPhase.FORECAST },
      phase: RunPhase.FORECAST,
    })
  },

  advanceToPayout: () => {
    const run = get().run
    if (!run) return
    const payout = calculatePayout(run.turn, run.stats[StatType.LCK], run.balanceWeights.perTurnPayoutMultiplier)
    set({
      run: {
        ...run,
        gold: run.gold + payout,
        phase: RunPhase.PAYOUT,
      },
      phase: RunPhase.PAYOUT,
    })
  },

  initDraft: () => {
    const run = get().run
    if (!run) return
    const rng = createRNG(`${run.seed}_${run.archetype}_t${run.turn}_s`)
    const extraItems = applyCodexModifiers(run.archetype, get().codex.unlockedModifiers).extraItems
    const storeItems = generateStore(rng, run.turn, run.archetype, extraItems, run.balanceWeights.poolSizeMultiplier)
    const drafts = 1 + run.extraNodeDrafts
    set({
      run: {
        ...run,
        storeItems,
        storeRerolled: false,
        currentNodeDrafts: drafts,
        extraNodeDrafts: 0,
        phase: RunPhase.DRAFT,
        encounters: run.turn <= PREP_TURNS ? [] : run.encounters,
      },
      phase: RunPhase.DRAFT,
    })
  },

  purchaseNode: (nodeId) => {
    const run = get().run
    if (!run || run.phase !== RunPhase.DRAFT) return false
    if (!canPurchaseNode(run.constellation, nodeId, run.draftedNodeIds)) return false
    const result = purchaseNode(run.constellation, run.draftedNodeIds, nodeId, run.archetype)
    if (!result) return false
    const nodeDef = getNodeById(run.archetype, result.node.defId)
    const baseCost = nodeDef?.cost ?? 50
    const price = applyDiscount(baseCost, run.stats[StatType.LCK])
    if (run.gold < price) return false
    if (run.currentNodeDrafts <= 0) return false

    const newStats = addStats(run.stats, result.statGain)
    const newBaseStats = addStats(run.baseStats, result.statGain)
    const newAbilities = result.abilityUnlocked
      ? [...run.abilities, result.abilityUnlocked]
      : run.abilities
    const newDraftedIds = [...run.draftedNodeIds, nodeId]
    const newExtraDrafts = run.extraNodeDrafts + result.newNodeDrafts

    const newConstellation = new Map(run.constellation.nodes)
    const purchased = newConstellation.get(nodeId)
    if (purchased) newConstellation.set(nodeId, { ...purchased, purchased: true })
    if (result.mutexLockedNodeId) {
      const locked = newConstellation.get(result.mutexLockedNodeId)
      if (locked) newConstellation.set(result.mutexLockedNodeId, { ...locked, locked: true })
    }

    set({
      run: {
        ...run,
        stats: newStats,
        baseStats: newBaseStats,
        gold: run.gold - price,
        abilities: newAbilities,
        draftedNodeIds: newDraftedIds,
        currentNodeDrafts: run.currentNodeDrafts - 1,
        extraNodeDrafts: newExtraDrafts,
        constellation: {
          ...run.constellation,
          nodes: newConstellation,
        },
      },
    })
    return true
  },

  purchaseItem: (itemId) => {
    const run = get().run
    if (!run || run.phase !== RunPhase.DRAFT) return false
    const itemDef = getItemById(itemId)
    if (!itemDef) return false
    if (!run.storeItems.includes(itemId)) return false

    const price = applyDiscount(itemDef.cost, run.stats[StatType.LCK])
    if (run.gold < price) return false

    if (itemDef.statRequirements) {
      for (const stat of Object.values(StatType)) {
        const req = (itemDef.statRequirements as Record<string, number>)[stat]
        if (req !== undefined && run.stats[stat] < req) return false
      }
    }

    const slot = itemDef.slot
    const equipped = run.inventory.filter((i) => i.slot === slot && i.equipped)

    const newInventory: InventoryItem[] = [...run.inventory]
    for (const eq of equipped) {
      const idx = newInventory.findIndex((i) => i.instanceId === eq.instanceId)
      if (idx !== -1) newInventory[idx] = { ...newInventory[idx], equipped: false }
    }

    newInventory.push({
      defId: itemId,
      instanceId: nextInstanceId(),
      slot: itemDef.slot,
      equipped: true,
    })

    let newAbilities = run.abilities
    for (const effect of itemDef.effects) {
      if (effect.grantsAbility && !newAbilities.includes(effect.grantsAbility)) {
        newAbilities = [...newAbilities, effect.grantsAbility]
      }
    }

    let newStats = { ...run.stats }

    for (const eq of equipped) {
      const oldDef = getItemById(eq.defId)
      if (oldDef) {
        for (const effect of oldDef.effects) {
          if (effect.statBonus) {
            for (const [statKey, val] of Object.entries(effect.statBonus)) {
              newStats[statKey as StatType] = newStats[statKey as StatType] - val
            }
          }
        }
        if (oldDef.effects.some((e) => e.grantsAbility !== undefined)) {
          const oldAbility = oldDef.effects.find((e) => e.grantsAbility)?.grantsAbility
          if (oldAbility && !itemDef.effects.some((e) => e.grantsAbility === oldAbility)) {
            newAbilities = newAbilities.filter((a) => a !== oldAbility)
          }
        }
      }
    }

    for (const effect of itemDef.effects) {
      if (effect.statBonus) {
        newStats = addStats(newStats, effect.statBonus)
      }
    }

    let newExtraDrafts = run.extraNodeDrafts
    for (const effect of itemDef.effects) {
      if (effect.extraNodeDraft) newExtraDrafts++
    }

    set({
      run: {
        ...run,
        gold: run.gold - price,
        inventory: newInventory,
        abilities: newAbilities,
        stats: newStats,
        extraNodeDrafts: newExtraDrafts,
      },
    })
    return true
  },

  execute: () => {
    const run = get().run
    if (!run || run.phase !== RunPhase.DRAFT) return
    const rng = createRNG(`${run.seed}_${run.archetype}_t${run.turn}_ex`)
    const { result, log } = resolve(run, rng)

    set({
      run: {
        ...run,
        phase: RunPhase.STINGER,
        combatLog: log,
        lastResult: result,
      },
      phase: RunPhase.STINGER,
    })
  },

  endRun: () => {
    const run = get().run
    if (!run || !run.lastResult) return

    const shareString = encodeShareString(run)
    const completed = createCompletedRun(run)
    completed.shareString = shareString

    const newUnlocks = checkCodexUnlocks(
      completed,
      get().codex,
      run.stats,
      run.inventory.length === 0,
    )
    const newCodex: CodexState = {
      ...get().codex,
      completedRuns: [...get().codex.completedRuns, completed],
      unlockedModifiers: [...new Set([...get().codex.unlockedModifiers, ...newUnlocks])],
    }

    saveCodex(newCodex)

    set({
      run: {
        ...run,
        runEnded: true,
        phase: RunPhase.POST_RUN,
        shareString,
      },
      phase: RunPhase.POST_RUN,
      codex: newCodex,
    })
  },

  resetRun: () => {
    set({ run: null, phase: RunPhase.ARCHETYPE_SELECT })
  },

  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial }
    saveSettings(newSettings)
    set({ settings: newSettings })
  },

  getRng: () => {
    const run = get().run
    if (!run) return createRNG('default')
    return createRNG(`${run.seed}_${run.archetype}`)
  },

  getPurchasableNodeIds: () => {
    const run = get().run
    if (!run) return []
    const ids: string[] = []
    for (const [id] of run.constellation.nodes) {
      if (canPurchaseNode(run.constellation, id, run.draftedNodeIds)) {
        ids.push(id)
      }
    }
    return ids
  },

  canAffordNode: (nodeId) => {
    const run = get().run
    if (!run) return false
    const node = run.constellation.nodes.get(nodeId)
    if (!node) return false
    const price = applyDiscount(30 + node.column * 15, run.stats[StatType.LCK])
    return run.gold >= price
  },

  canAffordItem: (itemId) => {
    const run = get().run
    if (!run) return false
    const itemDef = getItemById(itemId)
    if (!itemDef) return false
    const price = applyDiscount(itemDef.cost, run.stats[StatType.LCK])
    return run.gold >= price
  },

  saveBuild: (name) => {
    const run = get().run
    if (!run) return
    const build: SavedBuild = {
      name,
      runId: `${run.seed}_${run.archetype}`,
    }
    const newCodex: CodexState = {
      ...get().codex,
      builds: [...get().codex.builds, build],
    }
    saveCodex(newCodex)
    set({ codex: newCodex })
  },

  hasDraftsRemaining: () => {
    const run = get().run
    if (!run) return false
    return run.currentNodeDrafts > 0
  },
}))
