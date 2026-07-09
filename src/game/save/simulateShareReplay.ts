import { createRNG } from '../rng/create'
import { generateConstellation } from '../constellation/generate'
import { canPurchaseNode } from '../constellation/canPurchase'
import { purchaseNode } from '../constellation/purchase'
import { generateEncounters } from '../resolve/encounter'
import { resolve } from '../resolve/resolve'
import { calculatePayout } from '../economy/payout'
import { parseShareString, messageForError, resolveWeightsForParsedShare } from './deserialize'
import { constellationSeed, executeSeed, forecastSeed } from './runSeed'
import { EMPTY_STATS, addStats } from '../../types/stats'
import { Archetype, StatType, RunPhase } from '../../types/enums'
import type { RunState, CombatLogLine } from '../../types/run'

const STARTING_STATS: Record<Archetype, typeof EMPTY_STATS> = {
  [Archetype.SPORGK]: { ...EMPTY_STATS, [StatType.STR]: 8, [StatType.STA]: 4, [StatType.AGI]: 5 },
  [Archetype.ELF]: { ...EMPTY_STATS, [StatType.STR]: 4, [StatType.AGI]: 8, [StatType.LCK]: 5 },
  [Archetype.VAMPIRE]: { ...EMPTY_STATS, [StatType.STR]: 5, [StatType.AGI]: 5, [StatType.INT]: 5, [StatType.STA]: 4 },
}

const ARCH_MAP: Record<string, Archetype> = {
  SPRGK: Archetype.SPORGK,
  ELF: Archetype.ELF,
  VAMP: Archetype.VAMPIRE,
  SPORGK: Archetype.SPORGK,
  VAMPIRE: Archetype.VAMPIRE,
}

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function sortNodes(nodes: Map<string, { column: number; y: number; x: number; id: string }>) {
  return [...nodes.values()].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column
    if (a.y !== b.y) return a.y - b.y
    if (a.x !== b.x) return a.x - b.x
    return a.id.localeCompare(b.id)
  })
}

/**
 * Pure replay of a share string using the same seed envelope as live play.
 */
export function simulateShareReplay(shareString: string): {
  ok: true
  log: CombatLogLine[]
  finalResult: 'PASS' | 'FAIL'
  turnsPlayed: number
} | { ok: false; error: string } {
  const result = parseShareString(shareString.trim())
  if (!result.ok) {
    return { ok: false, error: messageForError(result.error) }
  }
  const parsed = result.data
  const archetype = ARCH_MAP[parsed.archetype]
  if (!archetype) {
    return { ok: false, error: `Unknown archetype: ${parsed.archetype}` }
  }

  const seed = parsed.seed
  const weights = resolveWeightsForParsedShare(parsed)
  const draftSeq = parsed.draftSeq

  const rng = createRNG(constellationSeed(seed, archetype))
  const constellation = generateConstellation(rng, archetype, weights)

  let draftedIds: string[] = []
  const startId = constellation.startNodeId
  if (startId) draftedIds = [startId]

  const sortedNodes = sortNodes(constellation.nodes)

  let stats = { ...STARTING_STATS[archetype] }
  let gold = Math.floor(80 * weights.startingGoldMultiplier)
  const inventory: RunState['inventory'] = []
  let abilities: string[] = []

  if (startId) {
    const purchase = purchaseNode(constellation, [], startId, archetype)
    if (purchase) {
      stats = addStats(stats, purchase.statGain)
      if (purchase.abilityUnlocked) abilities = [purchase.abilityUnlocked]
    }
  }

  const draftIndices: number[] = []
  for (const ch of draftSeq) {
    const idx = BASE36.indexOf(ch)
    if (idx >= 0) draftIndices.push(idx)
  }
  let draftPtr = 0
  if (draftIndices.length > 0 && startId) {
    const firstNode = sortedNodes[draftIndices[0]]
    if (firstNode && firstNode.id === startId) draftPtr = 1
  }

  const allLogs: CombatLogLine[] = []
  let turnsPlayed = 0

  for (let turn = 1; turn <= 20; turn++) {
    turnsPlayed = turn

    if (draftPtr < draftIndices.length) {
      const nodeIdx = draftIndices[draftPtr]
      draftPtr++
      if (nodeIdx >= 0 && nodeIdx < sortedNodes.length) {
        const node = sortedNodes[nodeIdx]
        if (canPurchaseNode(constellation, node.id, draftedIds)) {
          const purchase = purchaseNode(constellation, draftedIds, node.id, archetype, {
            turn,
            stats,
            inventory,
            goldHeld: gold,
          })
          if (purchase) {
            stats = addStats(stats, purchase.statGain)
            draftedIds = [...draftedIds, node.id]
            if (purchase.abilityUnlocked) abilities = [...abilities, purchase.abilityUnlocked]
          }
        }
      }
    }

    const turnForecastRng = createRNG(forecastSeed(seed, archetype, turn))
    const encounters = generateEncounters(turnForecastRng, turn, 5)

    gold += calculatePayout(turn, stats[StatType.LCK], weights.perTurnPayoutMultiplier)

    const tempRun: RunState = {
      seed,
      archetype,
      turn,
      phase: RunPhase.DRAFT,
      stats,
      baseStats: stats,
      gold,
      constellation,
      draftedNodeIds: draftedIds,
      inventory,
      abilities,
      currentNodeDrafts: 1,
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

    const resolveRng = createRNG(executeSeed(seed, archetype, turn))
    const { result: res, log: turnLog } = resolve(tempRun, resolveRng)

    allLogs.push({ text: `── TURN ${turn} ──`, type: 'info' })
    allLogs.push(...turnLog)
    allLogs.push({ text: '', type: 'info' })

    if (!res.pass) {
      return { ok: true, log: allLogs, finalResult: 'FAIL', turnsPlayed }
    }
  }

  return { ok: true, log: allLogs, finalResult: 'PASS', turnsPlayed }
}
