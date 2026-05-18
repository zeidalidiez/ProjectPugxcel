import { describe, it, expect } from 'vitest'
import { createRNG } from '../../../src/game/rng/create'
import { generateConstellation } from '../../../src/game/constellation/generate'
import { getNodeById } from '../../../src/data/nodes'
import { PRESETS } from '../../../src/data/balance-presets'
import { Archetype, NodeType } from '../../../src/types/enums'
import type { ConstellationNode } from '../../../src/types/nodes'

const ALL_ARCHETYPES = [Archetype.SPORGK, Archetype.ELF, Archetype.VAMPIRE]

function generate(rng: ReturnType<typeof createRNG>, archetype: Archetype) {
  return generateConstellation(rng, archetype, PRESETS.normal)
}

function bfsReachable(nodes: Map<string, ConstellationNode>, startId: string): Set<string> {
  const visited = new Set<string>()
  const queue = [startId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    const node = nodes.get(id)!
    for (const edgeId of node.edges) {
      if (!visited.has(edgeId)) queue.push(edgeId)
    }
  }
  return visited
}

describe('generateConstellation', () => {
  it('generates a valid constellation for each archetype', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`test-${archetype}`)
      const c = generate(rng, archetype)
      expect(c).toBeDefined()
      expect(c.nodes.size).toBeGreaterThan(0)
      expect(c.startNodeId).toBeTruthy()
      expect(c.nodes.has(c.startNodeId)).toBe(true)
    }
  })

  it('has exactly 1 start node at column 0', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`start-col-${archetype}`)
      const c = generate(rng, archetype)
      const startNode = c.nodes.get(c.startNodeId)!
      expect(startNode.column).toBe(0)

      const col0Nodes = [...c.nodes.values()].filter((n) => n.column === 0)
      expect(col0Nodes).toHaveLength(1)
    }
  })

    it('has 3-8 anchors', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`anchors-${archetype}`)
      const c = generate(rng, archetype)
      expect(c.anchorNodeIds.length).toBeGreaterThanOrEqual(3)
      expect(c.anchorNodeIds.length).toBeLessThanOrEqual(8)

      for (const id of c.anchorNodeIds) {
        const node = c.nodes.get(id)!
        const def = c.defMap?.get(node.defId) ?? getNodeById(archetype, node.defId)
        expect(def?.isAnchor).toBe(true)
      }
    }
  })

  it('all nodes have unique instance IDs', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`uniq-id-${archetype}`)
      const c = generate(rng, archetype)
      const ids = [...c.nodes.keys()]
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('all nodes are reachable from start via BFS', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`reachable-${archetype}`)
      const c = generate(rng, archetype)
      const reachable = bfsReachable(c.nodes, c.startNodeId)
      expect(reachable.size).toBe(c.nodes.size)
    }
  })

  it('has no backward edges (DAG invariant)', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`dag-${archetype}`)
      const c = generate(rng, archetype)

      for (const node of c.nodes.values()) {
        for (const edgeId of node.edges) {
          const target = c.nodes.get(edgeId)
          expect(target).toBeDefined()
          expect(target!.column).toBeGreaterThanOrEqual(node.column)
        }
      }
    }
  })

  it('same seed produces identical constellations', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng1 = createRNG(`deterministic-${archetype}`)
      const rng2 = createRNG(`deterministic-${archetype}`)
      const c1 = generate(rng1, archetype)
      const c2 = generate(rng2, archetype)

      expect(c1.startNodeId).toBe(c2.startNodeId)
      expect(c1.anchorNodeIds).toEqual(c2.anchorNodeIds)
      expect(c1.nodes.size).toBe(c2.nodes.size)

      for (const [id, node1] of c1.nodes) {
        const node2 = c2.nodes.get(id)
        expect(node2).toBeDefined()
        expect(node1.x).toBe(node2!.x)
        expect(node1.y).toBe(node2!.y)
        expect(node1.column).toBe(node2!.column)
        expect(node1.edges).toEqual(node2!.edges)
      }
    }
  })

  it('different seeds produce different constellations', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng1 = createRNG(`seed-alpha-${archetype}`)
      const rng2 = createRNG(`seed-beta-${archetype}`)
      const c1 = generate(rng1, archetype)
      const c2 = generate(rng2, archetype)

      const ids1 = [...c1.nodes.keys()].join(',')
      const ids2 = [...c2.nodes.keys()].join(',')
      expect(ids1).not.toBe(ids2)
    }
  })

  it('mutex pairs are placed in same or adjacent columns', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`mutex-col-${archetype}`)
      const c = generate(rng, archetype)

      const mutexNodes = [...c.nodes.values()].filter((n) => {
        const def = getNodeById(archetype, n.defId)
        return def?.type === NodeType.MUTEX && def.mutexPairId
      })

      const seenPairs = new Set<string>()
      for (const node of mutexNodes) {
        const def = getNodeById(archetype, node.defId)!
        if (seenPairs.has(def.mutexPairId!)) continue
        seenPairs.add(def.mutexPairId!)

        const partner = mutexNodes.find((n) => {
          const pd = getNodeById(archetype, n.defId)
          return pd?.mutexPairId === def.mutexPairId && n.id !== node.id
        })
        if (partner) {
          const colDiff = Math.abs(node.column - partner.column)
          expect(colDiff).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('start node has outgoing edges to column 1', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const rng = createRNG(`start-edges-${archetype}`)
      const c = generate(rng, archetype)
      const startNode = c.nodes.get(c.startNodeId)!
      expect(startNode.edges.length).toBeGreaterThan(0)

      for (const edgeId of startNode.edges) {
        const target = c.nodes.get(edgeId)!
        expect(target.column).toBeGreaterThan(0)
      }
    }
  })
})
