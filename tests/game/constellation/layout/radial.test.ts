import { describe, it, expect } from 'vitest'
import { layoutRadial } from '../../../../src/game/constellation/layout/radial'
import { generateNodes } from '../../../../src/game/constellation/procedural'
import { createRNG } from '../../../../src/game/rng/create'
import { loadArchetypeFlavor } from '../../../../src/data/nodes'
import { PRESETS } from '../../../../src/data/balance-presets'
import { Archetype } from '../../../../src/types/enums'

const ALL_ARCHETYPES = [Archetype.SPORGK, Archetype.ELF, Archetype.VAMPIRE]

describe('layoutRadial', () => {
  it('produces identical layout for same seed and same inputs (determinism)', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const flavor = loadArchetypeFlavor(archetype)
      const nodes = generateNodes(flavor, PRESETS.normal, createRNG('gen'), archetype)

      const rng1 = createRNG('layout-det')
      const rng2 = createRNG('layout-det')
      const laidOut1 = layoutRadial(rng1, nodes, PRESETS.normal)
      const laidOut2 = layoutRadial(rng2, nodes, PRESETS.normal)

      expect(laidOut1.startNodeId).toBe(laidOut2.startNodeId)
      expect(laidOut1.anchorNodeIds).toEqual(laidOut2.anchorNodeIds)
      expect(laidOut1.nodes.size).toBe(laidOut2.nodes.size)

      for (const [id, node1] of laidOut1.nodes) {
        const node2 = laidOut2.nodes.get(id)
        expect(node2).toBeDefined()
        expect(node1.x).toBe(node2!.x)
        expect(node1.y).toBe(node2!.y)
        expect(node1.column).toBe(node2!.column)
        expect(node1.edges).toEqual(node2!.edges)
      }
    }
  })

  it('maintains minimum distance between nodes after repulsion', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const flavor = loadArchetypeFlavor(archetype)
      const nodes = generateNodes(flavor, PRESETS.normal, createRNG('dist'), archetype)
      const laidOut = layoutRadial(createRNG('dist-layout'), nodes, PRESETS.normal)

      const positions = [...laidOut.nodes.values()].map((n) => ({ x: n.x, y: n.y }))
      let minDist = Infinity

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x
          const dy = positions[i].y - positions[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < minDist) minDist = d
        }
      }

      expect(minDist).toBeGreaterThan(50)
    }
  })

  it('maintains minimum distance under high density', () => {
    const highDensity = { ...PRESETS.hard }
    const flavor = loadArchetypeFlavor(Archetype.SPORGK)
    const nodes = generateNodes(flavor, highDensity, createRNG('hi'), Archetype.SPORGK)
    const laidOut = layoutRadial(createRNG('hi-layout'), nodes, highDensity)

    const positions = [...laidOut.nodes.values()].map((n) => ({ x: n.x, y: n.y }))
    let minDist = Infinity

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < minDist) minDist = d
      }
    }

    expect(minDist).toBeGreaterThan(30)
  })

  it('places ring 0 nodes near the center (accounting for spread)', () => {
    const CENTER_X = 800
    const CENTER_Y = 450
    const SPREAD = 1.25

    for (const archetype of ALL_ARCHETYPES) {
      const flavor = loadArchetypeFlavor(archetype)
      const nodes = generateNodes(flavor, PRESETS.normal, createRNG('center'), archetype)
      const laidOut = layoutRadial(createRNG('center-layout'), nodes, PRESETS.normal)

      const ring0 = [...laidOut.nodes.values()].filter((n) => n.column === 0)
      expect(ring0.length).toBe(1)

      for (const node of ring0) {
        expect(Math.abs(node.x - CENTER_X * SPREAD)).toBeLessThan(60)
        expect(Math.abs(node.y - CENTER_Y * SPREAD)).toBeLessThan(60)
      }
    }
  })

  it('outer rings have larger average radius than inner rings', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const flavor = loadArchetypeFlavor(archetype)
      const nodes = generateNodes(flavor, PRESETS.normal, createRNG('rings'), archetype)
      const laidOut = layoutRadial(createRNG('rings-layout'), nodes, PRESETS.normal)

      const byRing = new Map<number, number[]>()
      for (const node of laidOut.nodes.values()) {
        if (!byRing.has(node.column)) byRing.set(node.column, [])
        const dx = node.x - 800
        const dy = node.y - 450
        byRing.get(node.column)!.push(Math.sqrt(dx * dx + dy * dy))
      }

      const rings = [...byRing.keys()].sort((a, b) => a - b)
      const avgDistances = rings.map((r) => {
        const dists = byRing.get(r)!
        return dists.reduce((s, d) => s + d, 0) / dists.length
      })

      for (let i = 1; i < avgDistances.length; i++) {
        expect(avgDistances[i]).toBeGreaterThan(avgDistances[i - 1])
      }
    }
  })

  it('all edges connect to existing nodes', () => {
    for (const archetype of ALL_ARCHETYPES) {
      const flavor = loadArchetypeFlavor(archetype)
      const nodes = generateNodes(flavor, PRESETS.normal, createRNG('edges'), archetype)
      const laidOut = layoutRadial(createRNG('edges-layout'), nodes, PRESETS.normal)

      for (const node of laidOut.nodes.values()) {
        for (const edgeId of node.edges) {
          expect(laidOut.nodes.has(edgeId)).toBe(true)
        }
      }
    }
  })
})
