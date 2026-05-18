import type { Constellation, NodeDef } from '../../types/nodes'
import type { PRNG } from '../../types/rng'
import type { BalanceWeights } from '../../types/balance'
import type { Archetype } from '../../types/enums'
import { loadArchetypeFlavor } from '../../data/nodes'
import { generateNodes } from './procedural'
import { layoutRadial } from './layout/radial'
import { layoutLeftToRight } from './layout/leftToRight'

export function generateConstellation(
  rng: PRNG,
  archetype: Archetype,
  weights: BalanceWeights,
  extraNodes: NodeDef[] = [],
): Constellation {
  const flavor = loadArchetypeFlavor(archetype)
  const nodes = generateNodes(flavor, weights, rng, archetype)
  const allNodes = [...nodes, ...extraNodes]
  const defMap = new Map(allNodes.map((n) => [n.id, n]))

  if (weights.constellationLayout === 'radial') {
    const constellation = layoutRadial(rng, allNodes, weights)
    constellation.defMap = defMap
    return constellation
  }

  const constellation = layoutLeftToRight(rng, allNodes, weights)
  constellation.defMap = defMap
  return constellation
}
