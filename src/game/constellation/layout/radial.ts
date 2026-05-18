import type { PRNG } from '../../../types/rng'
import type { Constellation, ConstellationNode, NodeDef } from '../../../types/nodes'
import type { BalanceWeights } from '../../../types/balance'

const CENTER_X = 800
const CENTER_Y = 450
const RADIUS_STEP = 130
const JITTER_DEG = 8
const MAX_FORWARD_EDGES = 3
const LATERAL_CHANCE = 0.3
const MIN_DIST = 75
const REPULSION_PASSES = 5
const SPRING_PASSES = 2
const SPRING_FORCE = 0.15
const IDEAL_EDGE_RATIO = 0.75
const SPREAD_FACTOR = 1.25

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function dist(a: ConstellationNode, b: ConstellationNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function uniqueNodeId(defId: string, rng: PRNG): string {
  return `${defId}_${rng.nextInt(1000, 9999)}`
}

export function layoutRadial(
  rng: PRNG,
  nodes: NodeDef[],
  weights: BalanceWeights,
): Constellation {
  const ringDefGroups = new Map<number, NodeDef[]>()
  for (const node of nodes) {
    const r = node.column
    if (!ringDefGroups.has(r)) ringDefGroups.set(r, [])
    ringDefGroups.get(r)!.push(node)
  }

  const sortedRings = [...ringDefGroups.keys()].sort((a, b) => a - b)
  const resultNodes = new Map<string, ConstellationNode>()
  const ringCnLists = new Map<number, ConstellationNode[]>()
  const edgeMax = Math.max(1, Math.round(MAX_FORWARD_EDGES * weights.structuralNodeAvailability))

  for (const ring of sortedRings) {
    const defs = ringDefGroups.get(ring)!
    const shuffled = rng.shuffle([...defs])
    const baseRadius = ring * RADIUS_STEP
    const radius = baseRadius * Math.max(1, weights.nodeDensity * 0.85)
    const nodeCount = shuffled.length

    if (ring === 0) {
      const count = Math.min(weights.ringZeroNodes, nodeCount)
      for (let i = 0; i < count; i++) {
        const def = shuffled[i]
        const cn: ConstellationNode = {
          defId: def.id,
          id: uniqueNodeId(def.id, rng),
          x: CENTER_X + (count > 1 ? rng.nextInt(-30, 30) : 0),
          y: CENTER_Y + (count > 1 ? rng.nextInt(-30, 30) : 0),
          column: ring,
          edges: [],
          purchased: false,
          locked: false,
        }
        resultNodes.set(cn.id, cn)
        ringCnLists.set(ring, [...(ringCnLists.get(ring) ?? []), cn])
      }
      if (defs.length > 0) continue
    }

    const ringList: ConstellationNode[] = []
    for (let i = 0; i < nodeCount; i++) {
      const baseAngle = (2 * Math.PI * i) / nodeCount
      const jitter = toRad(rng.nextInt(-JITTER_DEG, JITTER_DEG))
      const angle = baseAngle + jitter
      const x = Math.round(CENTER_X + Math.cos(angle) * radius)
      const y = Math.round(CENTER_Y + Math.sin(angle) * radius)

      const cn: ConstellationNode = {
        defId: shuffled[i].id,
        id: uniqueNodeId(shuffled[i].id, rng),
        x,
        y,
        column: ring,
        edges: [],
        purchased: false,
        locked: false,
      }
      resultNodes.set(cn.id, cn)
      ringList.push(cn)
    }
    ringCnLists.set(ring, ringList)
  }

  const minDist = MIN_DIST
  for (let pass = 0; pass < REPULSION_PASSES; pass++) {
    const allNodes = [...resultNodes.values()]
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const a = allNodes[i]
        const b = allNodes[j]
        const d = dist(a, b)
        if (d < minDist && d > 0) {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const push = (minDist - d) / 2
          const nx = dx / d
          const ny = dy / d
          a.x = Math.round(a.x + nx * push)
          a.y = Math.round(a.y + ny * push)
          b.x = Math.round(b.x - nx * push)
          b.y = Math.round(b.y - ny * push)
        }
      }
    }
  }

  for (let pass = 0; pass < SPRING_PASSES; pass++) {
    for (const cn of resultNodes.values()) {
      for (const targetId of cn.edges) {
        const target = resultNodes.get(targetId)
        if (!target) continue
        const d = dist(cn, target)
        if (d > 0) {
          const ideal = RADIUS_STEP * IDEAL_EDGE_RATIO
          const force = (d - ideal) * SPRING_FORCE
          const nx = (target.x - cn.x) / d
          const ny = (target.y - cn.y) / d
          cn.x = Math.round(cn.x + nx * force)
          cn.y = Math.round(cn.y + ny * force)
          target.x = Math.round(target.x - nx * force)
          target.y = Math.round(target.y - ny * force)
        }
      }
    }
  }

  for (let ri = 0; ri < sortedRings.length - 1; ri++) {
    const curRing = sortedRings[ri]
    const nextRing = sortedRings[ri + 1]
    const curNodes = ringCnLists.get(curRing) ?? []
    const nextNodes = ringCnLists.get(nextRing) ?? []

    if (nextNodes.length === 0) continue

    for (const cn of curNodes) {
      const def = nodes.find((n) => n.id === cn.defId)
      const isAnchorDef = def?.isAnchor ?? false
      const maxEdges = Math.min(edgeMax, nextNodes.length)
      const edgeCount = isAnchorDef
        ? maxEdges
        : rng.nextInt(1, maxEdges)

      const candidates = [...nextNodes].sort((a, b) => {
        if (isAnchorDef) {
          const aDef = nodes.find((n) => n.id === a.defId)
          const bDef = nodes.find((n) => n.id === b.defId)
          return (bDef?.rarity ?? 0) - (aDef?.rarity ?? 0)
        }
        return dist(cn, a) - dist(cn, b)
      })

      for (const target of candidates.slice(0, edgeCount)) {
        if (!cn.edges.includes(target.id)) {
          cn.edges.push(target.id)
        }
      }
    }
  }

  for (const ring of sortedRings) {
    const ringNodes = ringCnLists.get(ring) ?? []
    if (ringNodes.length < 2) continue

    for (const cn of ringNodes) {
      if (rng.next() >= LATERAL_CHANCE) continue
      const others = ringNodes.filter(
        (o) => o.id !== cn.id && !cn.edges.includes(o.id) && !o.edges.includes(cn.id),
      )
      if (others.length === 0) continue
      const nearest = others.sort((a, b) => dist(cn, a) - dist(cn, b))[0]
      cn.edges.push(nearest.id)
    }
  }

  const startNode = resultNodes.values().next().value
  const startNodeId = startNode?.id ?? ''

  const reachable = new Set<string>()
  const queue: string[] = [startNodeId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    const cn = resultNodes.get(id)
    if (!cn) continue
    for (const eid of cn.edges) {
      if (!reachable.has(eid)) queue.push(eid)
    }
  }

  const ringIndex = new Map(sortedRings.map((r, i) => [r, i]))

  for (const cn of resultNodes.values()) {
    if (reachable.has(cn.id)) continue

    const ci = ringIndex.get(cn.column)
    if (ci === undefined || ci === 0) continue

    for (let pi = ci - 1; pi >= 0; pi--) {
      const prevRing = sortedRings[pi]
      const prevNodes = ringCnLists.get(prevRing) ?? []
      const reachablePrev = prevNodes.filter((n) => reachable.has(n.id))

      if (reachablePrev.length > 0) {
        const nearest = reachablePrev.sort((a, b) => dist(a, cn) - dist(b, cn))[0]
        nearest.edges.push(cn.id)

        const subQueue = [cn.id]
        while (subQueue.length > 0) {
          const sid = subQueue.shift()!
          if (reachable.has(sid)) continue
          reachable.add(sid)
          const scn = resultNodes.get(sid)
          if (!scn) continue
          for (const eid of scn.edges) {
            if (!reachable.has(eid)) subQueue.push(eid)
          }
        }
        break
      }
    }
  }

  const anchorNodeIds: string[] = []
  for (const cn of resultNodes.values()) {
    const def = nodes.find((n) => n.id === cn.defId)
    if (def?.isAnchor) {
      anchorNodeIds.push(cn.id)
    }
  }

  for (const node of resultNodes.values()) {
    node.x = Math.round(node.x * SPREAD_FACTOR)
    node.y = Math.round(node.y * SPREAD_FACTOR)
  }

  return {
    nodes: resultNodes,
    startNodeId,
    anchorNodeIds,
  }
}
