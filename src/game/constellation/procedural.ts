import { Archetype, StatType, NodeType } from '../../types/enums'
import type { PRNG } from '../../types/rng'
import type { NodeDef, NodeEffect, NodeCondition } from '../../types/nodes'
import type { ArchetypeFlavor } from '../../types/archetype-flavor'
import type { BalanceWeights } from '../../types/balance'

const ANCHOR_COUNT = 5
const ABILITY_RATIO = 0.18
const NODE_DENSITY = 7

export function generateName(flavor: ArchetypeFlavor, rng: PRNG): string {
  const template = rng.pick(flavor.flavor.templates)
  return template
    .replace('{prefix}', rng.pick(flavor.flavor.prefixes))
    .replace('{core}', rng.pick(flavor.flavor.cores))
    .replace('{suffix}', rng.pick(flavor.flavor.suffixes))
}

function pickWeightedStat(weights: Record<string, number>, rng: PRNG): StatType {
  const entries = Object.entries(weights).filter(([, w]) => w > 0)
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng.next() * totalWeight
  for (const [stat, w] of entries) {
    roll -= w
    if (roll <= 0) return stat as StatType
  }
  return StatType.STR
}

function generateEffects(budget: number, statWeights: Record<string, number>, rng: PRNG): NodeEffect[] {
  const effects: NodeEffect[] = []
  let remaining = Math.max(1, Math.floor(budget))
  const numEffects = rng.nextInt(1, Math.min(3, remaining))
  for (let i = 0; i < numEffects && remaining >= 1; i++) {
    const stat = pickWeightedStat(statWeights, rng)
    const share = Math.max(1, Math.floor(remaining / (numEffects - i)))
    const value = Math.min(share, remaining)
    effects.push({ stat, value, kind: 'flat' })
    remaining -= value
  }
  if (remaining > 0 && effects.length > 0) {
    const idx = rng.nextInt(0, effects.length - 1)
    effects[idx] = { ...effects[idx], value: effects[idx].value + remaining }
  }
  return effects
}

function generateAnchorNames(flavor: ArchetypeFlavor, rng: PRNG): string[] {
  if (flavor.anchorNames && flavor.anchorNames.length > 0) {
    return [...flavor.anchorNames]
  }
  const names: string[] = []
  for (let i = 0; i < ANCHOR_COUNT; i++) {
    const prefix = rng.pick(flavor.flavor.prefixes)
    const core = rng.pick(flavor.flavor.cores)
    names.push(`${prefix} ${core}`)
  }
  return names
}

function generateAbilityNames(flavor: ArchetypeFlavor, rng: PRNG, count: number): string[] {
  if (flavor.abilityNames && flavor.abilityNames.length > 0) {
    return rng.shuffle([...flavor.abilityNames]).slice(0, count)
  }
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    const core = rng.pick(flavor.flavor.cores)
    const suffix = rng.pick(flavor.flavor.suffixes)
    names.push(`${core} ${suffix}`)
  }
  return names
}

function mapConditionKind(raw: string): NodeCondition['type'] {
  const m: Record<string, NodeCondition['type']> = {
    gear_equipped: 'gear_equipped',
    gear_unequipped: 'gear_unequipped',
    stat_threshold: 'stat_threshold',
    turn: 'turn_threshold',
    turn_threshold: 'turn_threshold',
    gold_spent: 'gold_spent',
    gold_spent_below: 'gold_spent',
    gold_unspent: 'gold_unspent',
    abilities_count_below: 'gold_unspent',
  }
  return m[raw] ?? 'stat_threshold'
}

function mapTemplateToNodeType(kind: string): NodeType {
  const m: Record<string, NodeType> = {
    CONDITIONAL: NodeType.CONDITIONAL,
    MUTEX: NodeType.MUTEX,
    ANTI_SYNERGY: NodeType.ANTI_SYNERGY,
    THRESHOLD: NodeType.THRESHOLD,
    HYBRID_BRIDGE: NodeType.HYBRID_BRIDGE,
  }
  return m[kind] ?? NodeType.STANDARD
}

function ringNodeCount(ring: number, ringTotal: number, density: number): number {
  if (ring === 0) return 1
  const mid = ringTotal / 2
  const factor = 1 - Math.abs(ring - mid) / mid
  return Math.max(2, Math.round(NODE_DENSITY * density * (0.5 + 0.5 * factor)))
}

export function generateNodes(
  flavor: ArchetypeFlavor,
  weights: BalanceWeights,
  rng: PRNG,
  archetype: Archetype,
): NodeDef[] {
  const ringKeys = Object.keys(flavor.rings).sort((a, b) => Number(a) - Number(b))
  const ringTotal = ringKeys.length
  const structuralScale = weights.structuralNodeAvailability

  const ringCounts: number[] = []
  let totalNodes = 0
  for (let ri = 0; ri < ringTotal; ri++) {
    const count = ringNodeCount(ri, ringTotal, weights.nodeDensity)
    ringCounts.push(count)
    totalNodes += count
  }

  const abilityCount = Math.max(2, Math.round(totalNodes * ABILITY_RATIO))
  const abilityNames = generateAbilityNames(flavor, rng, abilityCount)
  const anchorNames = generateAnchorNames(flavor, rng)

  const abilityRings: number[] = []
  while (abilityRings.length < abilityCount) {
    const r = rng.nextInt(1, ringTotal - 1)
    if (!abilityRings.includes(r)) abilityRings.push(r)
  }
  abilityRings.sort((a, b) => a - b)

  const result: NodeDef[] = []
  let globalIdx = 0
  let anchorIdx = 0
  let abilityIdx = 0
  let mutexGlobalIdx = 0

  for (let ri = 0; ri < ringTotal; ri++) {
    const ringKey = ringKeys[ri]
    const ringCfg = flavor.rings[ringKey]
    const count = ringCounts[ri]
    const isRing0 = ri === 0
    const rawStructural = isRing0 ? 0 : Math.floor(count * ringCfg.structuralRatio * structuralScale)
    const structural = Math.min(rawStructural, count)

    let structUsed = 0
    let localAnchorIdx = 0
    let anchorPlaced = false

    for (let ni = 0; ni < count; ni++) {
      const isStructural = structUsed < structural && !isRing0
      const template = isStructural
        ? flavor.structuralTemplates[structUsed % flavor.structuralTemplates.length]
        : null
      if (isStructural) structUsed++

      const isAnchor = isRing0
        ? (ni === 0)
        : (!anchorPlaced && ri >= 1 && ri <= 6 && localAnchorIdx < Math.ceil(ANCHOR_COUNT / (ringTotal - 1)))
      if (isAnchor) { anchorPlaced = true; localAnchorIdx++ }

      const name = isAnchor
        ? anchorNames[anchorIdx % anchorNames.length]
        : generateName(flavor, rng)
      if (isAnchor) anchorIdx++

      const nodeType = template ? mapTemplateToNodeType(template.kind) : NodeType.STANDARD
      const effectiveBudget = ringCfg.ppBudget + (template?.ppBonus ?? 0)
      const effects = generateEffects(effectiveBudget, flavor.statWeights, rng)
      const cost = rng.nextInt(ringCfg.costRange[0], ringCfg.costRange[1])

      let condition: NodeCondition | undefined
      if (template?.condition) {
        condition = {
          type: mapConditionKind(template.condition),
          value: template.value ?? 0,
        }
        if (template.stat) {
          condition.stat = template.stat as StatType
        }
      }

      let mutexPairId: string | undefined
      if (nodeType === NodeType.MUTEX) {
        mutexPairId = `${archetype.toLowerCase()}_mutex_${Math.floor(mutexGlobalIdx / 2)}`
        mutexGlobalIdx++
      }

      let unlocksAbility: string | undefined
      if (abilityRings.includes(ri) && abilityIdx < abilityNames.length && !isRing0) {
        unlocksAbility = abilityNames[abilityIdx]
        abilityIdx++
      }

      const id = `${archetype.toLowerCase()}_r${ri}_n${globalIdx}`
      result.push({
        id,
        name,
        description: name,
        type: nodeType,
        archetype,
        cost,
        effects,
        mutexPairId,
        condition,
        unlocksAbility,
        rarity: isAnchor ? 95 : isStructural ? 75 : rng.nextInt(30, 70),
        column: ri,
        isAnchor,
      })
      globalIdx++
    }
  }

  return result
}
