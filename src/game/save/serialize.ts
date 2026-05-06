import type { RunState } from '../../types/run'
import type { CompletedRun } from '../../types/save'
import { Archetype } from '../../types/enums'
import type { ConstellationNode } from '../../types/nodes'

const ARCH_MAP: Record<string, string> = {
  [Archetype.SPORGK]: 'SPRGK',
  [Archetype.ELF]: 'ELF',
  [Archetype.VAMPIRE]: 'VAMP',
}

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

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

  return `ANTIGRAV/${arch}-${seed8}/${draftSeq}`
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
