import type { PRNG } from '../../../types/rng'
import type { Constellation, ConstellationNode, NodeDef } from '../../../types/nodes'
import type { BalanceWeights } from '../../../types/balance'

const PADDING_X = 100
const PADDING_Y = 80
const CANVAS_W = 1600
const CANVAS_H = 900

function uniqueNodeId(defId: string, rng: PRNG): string {
  return `${defId}_${rng.nextInt(1000, 9999)}`
}

function distance(a: ConstellationNode, b: ConstellationNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function layoutLeftToRight(
  rng: PRNG,
  nodes: NodeDef[],
  _weights: BalanceWeights,
): Constellation {
  const columnGroups = new Map<number, NodeDef[]>()
  for (const node of nodes) {
    const col = node.column
    if (!columnGroups.has(col)) columnGroups.set(col, [])
    columnGroups.get(col)!.push(node)
  }

  const sortedColumns = [...columnGroups.keys()].sort((a, b) => a - b)
  const maxColumn = sortedColumns[sortedColumns.length - 1] || 7

  const usableW = CANVAS_W - 2 * PADDING_X
  const usableH = CANVAS_H - 2 * PADDING_Y

  const resultNodes = new Map<string, ConstellationNode>()
  const columnNodeLists = new Map<number, ConstellationNode[]>()

  for (const column of sortedColumns) {
    const defs = columnGroups.get(column)!
    const shuffled = rng.shuffle([...defs])
    const colList: ConstellationNode[] = []

    for (let i = 0; i < shuffled.length; i++) {
      const def = shuffled[i]
      const colX = Math.round(PADDING_X + (column / maxColumn) * usableW + rng.nextInt(-10, 10))
      const colY = shuffled.length === 1
        ? Math.round(CANVAS_H / 2)
        : Math.round(PADDING_Y + (i / (shuffled.length - 1)) * usableH + rng.nextInt(-10, 10))

      const cn: ConstellationNode = {
        defId: def.id,
        id: uniqueNodeId(def.id, rng),
        x: colX,
        y: colY,
        column,
        edges: [],
        purchased: false,
        locked: false,
      }
      resultNodes.set(cn.id, cn)
      colList.push(cn)
    }
    columnNodeLists.set(column, colList)
  }

  for (let ci = 0; ci < sortedColumns.length - 1; ci++) {
    const curCol = sortedColumns[ci]
    const nextCol = sortedColumns[ci + 1]
    const curNodes = columnNodeLists.get(curCol) ?? []
    const nextNodes = columnNodeLists.get(nextCol) ?? []

    if (nextNodes.length === 0) continue

    for (const cn of curNodes) {
      const edgeCount = rng.nextInt(1, Math.min(3, nextNodes.length))
      const sortedNext = [...nextNodes].sort((a, b) => distance(cn, a) - distance(cn, b))
      cn.edges = sortedNext.slice(0, edgeCount).map((n) => n.id)
    }
  }

  const col0 = columnNodeLists.get(0)
  if (!col0 || col0.length === 0) {
    throw new Error('No start node (column 0) found for left-to-right layout')
  }
  const startNode = col0[0]

  const reachable = new Set<string>()
  const queue: string[] = [startNode.id]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    const cn = resultNodes.get(id)!
    for (const edgeId of cn.edges) {
      if (!reachable.has(edgeId)) queue.push(edgeId)
    }
  }

  const columnIndex = new Map(sortedColumns.map((c, i) => [c, i]))
  for (const cn of resultNodes.values()) {
    if (reachable.has(cn.id)) continue
    const ci = columnIndex.get(cn.column)
    if (ci === undefined) continue
    for (let pi = ci - 1; pi >= 0; pi--) {
      const prevCol = sortedColumns[pi]
      const prevNodes = columnNodeLists.get(prevCol) ?? []
      const reachablePrev = prevNodes.filter((n) => reachable.has(n.id))
      if (reachablePrev.length > 0) {
        const nearest = reachablePrev.sort((a, b) => distance(a, cn) - distance(b, cn))[0]
        nearest.edges.push(cn.id)
        const subQueue = [cn.id]
        while (subQueue.length > 0) {
          const sid = subQueue.shift()!
          if (reachable.has(sid)) continue
          reachable.add(sid)
          const scn = resultNodes.get(sid)!
          for (const eid of scn.edges) {
            if (!reachable.has(eid)) subQueue.push(eid)
          }
        }
        break
      }
    }
  }

  const startNodeId = startNode.id
  const anchorNodeIds = nodes
    .filter((n) => n.isAnchor)
    .map((def) => {
      const node = [...resultNodes.values()].find((n) => n.defId === def.id)
      return node!.id
    })
    .filter(Boolean)

  return {
    nodes: resultNodes,
    startNodeId,
    anchorNodeIds,
  }
}
