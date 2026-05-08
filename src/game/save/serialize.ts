import type { RunState } from '../../types/run'
import type { CompletedRun } from '../../types/save'
import type { DifficultyPresetId, BalanceWeights } from '../../types/balance'
import { Archetype } from '../../types/enums'
import type { ConstellationNode } from '../../types/nodes'
import { PRESETS } from '../../data/balance-presets'

const ARCH_MAP: Record<string, string> = {
  [Archetype.SPORGK]: 'SPRGK',
  [Archetype.ELF]: 'ELF',
  [Archetype.VAMPIRE]: 'VAMP',
}

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const PRESET_CODE: Record<Exclude<DifficultyPresetId, 'custom'>, string> = {
  easy: 'EZ',
  normal: 'NM',
  hard: 'HD',
  nightmare: 'NT',
}

function toBase36(n: number): string {
  if (n < 0 || n >= 36) return 'Z'
  return BASE36[n]
}

function getSortedNodeList(nodes: Map<string, ConstellationNode>): ConstellationNode[] {
  return [...nodes.values()].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column
    if (a.y !== b.y) return a.y - b.y
    if (a.x !== b.x) return a.x - b.x
    return a.id.localeCompare(b.id)
  })
}

function getNodeIndex(nodeId: string, sortedNodes: ConstellationNode[]): number {
  return sortedNodes.findIndex((n) => n.id === nodeId)
}

/**
 * Produce a short, stable 4-char hash of a BalanceWeights object for the
 * custom preset code (CS-XXXX). The hash is deterministic for the same weights.
 */
function hashWeights(weights: BalanceWeights): string {
  const str = [
    weights.curveType,
    weights.curve.base,
    weights.curve.primarySlope,
    weights.curve.secondarySlope ?? 0,
    weights.curve.breakpointTurn ?? 0,
    weights.curve.quadraticCoeff ?? 0,
    weights.bossMultiplier,
    weights.finalBossMultiplier,
    weights.itemPowerMultiplier,
    weights.nodePowerMultiplier,
    weights.startingGoldMultiplier,
    weights.perTurnPayoutMultiplier,
    weights.luckEfficacyMultiplier,
    weights.poolSizeMultiplier,
  ].join(',')

  // djb2-style hash truncated to 4 base-36 chars
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h >>> 0 // keep unsigned 32-bit
  }
  const chars: string[] = []
  for (let i = 0; i < 4; i++) {
    chars.push(BASE36[h % 36])
    h = Math.floor(h / 36)
  }
  return chars.join('')
}

/** Determine which preset code matches the given weights, or 'CS-XXXX' for custom. */
function resolvePresetCode(weights: BalanceWeights): string {
  for (const [id, code] of Object.entries(PRESET_CODE) as [Exclude<DifficultyPresetId, 'custom'>, string][]) {
    const preset = PRESETS[id]
    if (JSON.stringify(preset) === JSON.stringify(weights)) {
      return code
    }
  }
  return `CS-${hashWeights(weights)}`
}

export function encodeShareString(state: RunState): string {
  const arch = ARCH_MAP[state.archetype] ?? state.archetype
  const seedAlpha = state.seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const seed8 = seedAlpha.slice(0, 8)

  const sortedNodes = getSortedNodeList(state.constellation.nodes)

  const draftChars: string[] = []
  for (const nodeId of state.draftedNodeIds) {
    const idx = getNodeIndex(nodeId, sortedNodes)
    if (idx === -1) {
      draftChars.push('Z')
    } else {
      draftChars.push(toBase36(idx))
    }
  }
  const draftSeq = draftChars.join('')

  const presetCode = resolvePresetCode(state.balanceWeights ?? PRESETS.normal)

  return `ANTIGRAV/${arch}-${seed8}/${presetCode}/${draftSeq}`
}

export function createCompletedRun(state: RunState): CompletedRun {
  const shareString = encodeShareString(state)

  return {
    id: crypto.randomUUID(),
    seed: state.seed,
    archetype: state.archetype,
    turnReached: state.turn,
    passed: !state.runEnded || (state.lastResult?.pass ?? false),
    deficitOrMargin: state.lastResult
      ? (state.lastResult.pass ? state.lastResult.deficit : state.lastResult.deficit)
      : 0,
    draftedNodeIds: [...state.draftedNodeIds],
    shareString,
    timestamp: Date.now(),
  }
}
