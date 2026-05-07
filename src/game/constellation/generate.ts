import type { Constellation, ConstellationNode, NodeDef } from '../../types/nodes'
import type { PRNG } from '../../types/rng'
import { Archetype, NodeType } from '../../types/enums'
import { getNodePool } from '../../data/nodes'

const PADDING_X = 100
const PADDING_Y = 80
const CANVAS_W = 1600
const CANVAS_H = 900
const TARGET_MINORS = 50

function selectWeighted(pool: NodeDef[], rng: PRNG, count: number): NodeDef[] {
  const scored = pool.map((n) => ({ node: n, score: rng.next() * n.rarity }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map((x) => x.node)
}

function distance(a: ConstellationNode, b: ConstellationNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function generateConstellation(rng: PRNG, archetype: Archetype, extraNodes: NodeDef[] = []): Constellation {
  const basePool = getNodePool(archetype)
  const pool = [...basePool, ...extraNodes]
  const defMap = new Map(pool.map((d) => [d.id, d]))

  const col0Nodes = pool.filter((n) => n.column === 0)
  const startDef = col0Nodes.find((n) => n.isAnchor) ?? col0Nodes[0]
  if (!startDef) {
    throw new Error(`No start node found for archetype ${archetype}`)
  }

  const anchorDefs = pool.filter((n) => n.isAnchor && n.id !== startDef.id)

  const excludedIds = new Set([startDef.id, ...anchorDefs.map((a) => a.id)])
  const minorsPool = pool.filter((n) => !excludedIds.has(n.id) && n.column !== 0)

  const minorCount = Math.min(TARGET_MINORS, minorsPool.length)
  const selectedMinors = selectWeighted(minorsPool, rng, minorCount)

  const selected = [startDef, ...anchorDefs, ...selectedMinors]

  const columnAssignments = new Map(selected.map((n) => [n.id, n.column]))

  for (const nodeDef of selected) {
    if (nodeDef.type !== NodeType.MUTEX || !nodeDef.mutexPairId) continue
    const pairDef = selected.find(
      (n) => n.mutexPairId === nodeDef.mutexPairId && n.id !== nodeDef.id,
    )
    if (!pairDef) continue

    const colA = columnAssignments.get(nodeDef.id)!
    const colB = columnAssignments.get(pairDef.id)!
    if (Math.abs(colA - colB) > 1) {
      const shallowerCol = Math.min(colA, colB)
      columnAssignments.set(colA > colB ? nodeDef.id : pairDef.id, shallowerCol + 1)
    }
  }

  const columnGroups = new Map<number, NodeDef[]>()
  for (const nodeDef of selected) {
    const col = columnAssignments.get(nodeDef.id)!
    if (!columnGroups.has(col)) columnGroups.set(col, [])
    columnGroups.get(col)!.push(nodeDef)
  }

  const sortedColumns = [...columnGroups.keys()].sort((a, b) => a - b)
  const maxColumn = sortedColumns[sortedColumns.length - 1]

  const usableW = CANVAS_W - 2 * PADDING_X
  const usableH = CANVAS_H - 2 * PADDING_Y

  const nodes = new Map<string, ConstellationNode>()
  const columnNodes = new Map<number, ConstellationNode[]>()

  for (const column of sortedColumns) {
    const defs = columnGroups.get(column)!
    const shuffled = rng.shuffle([...defs])

    const colNodes: ConstellationNode[] = []
    for (let i = 0; i < shuffled.length; i++) {
      const def = shuffled[i]
      const colX = PADDING_X + (column / maxColumn) * usableW

      let colY: number
      if (shuffled.length === 1) {
        colY = CANVAS_H / 2
      } else {
        colY = PADDING_Y + (i / (shuffled.length - 1)) * usableH
      }

      const jx = rng.nextInt(-10, 10)
      const jy = rng.nextInt(-10, 10)

      const cnode: ConstellationNode = {
        defId: def.id,
        id: '',
        x: Math.round(colX + jx),
        y: Math.round(colY + jy),
        column: columnAssignments.get(def.id)!,
        edges: [],
        purchased: false,
        locked: false,
      }
      colNodes.push(cnode)
    }
    columnNodes.set(column, colNodes)
  }

  for (const cnodeList of columnNodes.values()) {
    for (const cnode of cnodeList) {
      cnode.id = `${cnode.defId}_${rng.nextInt(1000, 9999)}`
      nodes.set(cnode.id, cnode)
    }
  }

  for (let ci = 0; ci < sortedColumns.length - 1; ci++) {
    const currentCol = sortedColumns[ci]
    const nextCol = sortedColumns[ci + 1]
    const currentNodes = columnNodes.get(currentCol)!
    const nextNodes = columnNodes.get(nextCol)!

    if (nextNodes.length === 0) continue

    for (const cnode of currentNodes) {
      const anchorDef = defMap.get(cnode.defId)
      const isAnchor = (anchorDef?.isAnchor ?? false) || cnode.defId === startDef.id
      const edgeCount = rng.nextInt(1, Math.min(3, nextNodes.length))

      const sortedNext = [...nextNodes].sort((a, b) => {
        if (isAnchor) {
          const defA = defMap.get(a.defId)
          const defB = defMap.get(b.defId)
          return (defB?.rarity ?? 0) - (defA?.rarity ?? 0)
        }
        return distance(cnode, a) - distance(cnode, b)
      })

      cnode.edges = sortedNext.slice(0, edgeCount).map((n) => n.id)
    }
  }

  const startNode = [...nodes.values()].find((n) => n.defId === startDef.id)!

  const reachable = new Set<string>()
  const queue: string[] = [startNode.id]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    const cn = nodes.get(id)!
    for (const edgeId of cn.edges) {
      if (!reachable.has(edgeId)) queue.push(edgeId)
    }
  }

  const columnIndex = new Map(sortedColumns.map((c, i) => [c, i]))

  for (const cnode of nodes.values()) {
    if (reachable.has(cnode.id)) continue

    const ci = columnIndex.get(cnode.column)
    if (ci === undefined) continue

    for (let pi = ci - 1; pi >= 0; pi--) {
      const prevCol = sortedColumns[pi]
      const prevNodes = columnNodes.get(prevCol)!
      const reachablePrev = prevNodes.filter((n) => reachable.has(n.id))

      if (reachablePrev.length > 0) {
        const nearest = reachablePrev.sort(
          (a, b) => distance(a, cnode) - distance(b, cnode),
        )[0]
        nearest.edges.push(cnode.id)

        const subQueue = [cnode.id]
        while (subQueue.length > 0) {
          const sid = subQueue.shift()!
          if (reachable.has(sid)) continue
          reachable.add(sid)
          const scn = nodes.get(sid)!
          for (const eid of scn.edges) {
            if (!reachable.has(eid)) subQueue.push(eid)
          }
        }
        break
      }
    }
  }

  const startNodeId = startNode.id
  const anchorNodeIds = anchorDefs
    .map((def) => {
      const node = [...nodes.values()].find((n) => n.defId === def.id)
      return node!.id
    })
    .filter(Boolean)

  return {
    nodes,
    startNodeId,
    anchorNodeIds,
  }
}
