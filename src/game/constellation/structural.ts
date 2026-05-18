import type { PRNG } from '../../types/rng'
import type { NodeDef, NodeCondition, NodeEffect } from '../../types/nodes'
import type { ArchetypeFlavor } from '../../types/archetype-flavor'
import { Archetype, NodeType, StatType, STAT_TYPE_VALUES } from '../../types/enums'

export interface StructuralTemplate {
  kind: string
  condition?: string
  stat?: string
  value?: number
  count?: number
  ppBonus: number
}

function templateKindToNodeType(kind: string): NodeType {
  switch (kind) {
    case 'CONDITIONAL':
      return NodeType.CONDITIONAL
    case 'MUTEX':
      return NodeType.MUTEX
    case 'ANTI_SYNERGY':
      return NodeType.ANTI_SYNERGY
    case 'THRESHOLD':
      return NodeType.THRESHOLD
    case 'HYBRID_BRIDGE':
      return NodeType.HYBRID_BRIDGE
    default:
      return NodeType.STANDARD
  }
}

function resolveCondition(template: StructuralTemplate): NodeCondition | undefined {
  if (!template.condition) return undefined
  switch (template.condition) {
    case 'gear_unequipped':
      return { type: 'gear_unequipped', value: 0 }
    case 'gear_equipped':
      return { type: 'gear_equipped', value: template.value ?? 1 }
    case 'stat_threshold':
      return {
        type: 'stat_threshold',
        stat: template.stat as StatType,
        value: template.value ?? 20,
      }
    case 'gold_spent_below':
      return { type: 'gold_spent', value: template.value ?? 100 }
    case 'gold_unspent':
      return { type: 'gold_unspent', value: template.value ?? 100 }
    case 'turn':
      return { type: 'turn_threshold', value: template.value ?? 10 }
    case 'abilities_count_below':
      return { type: 'gear_unequipped', value: template.value ?? 2 }
    default:
      return undefined
  }
}

function pickStatFromWeights(weights: Record<string, number>, rng: PRNG): StatType {
  const entries = Object.entries(weights) as [string, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  if (total <= 0) return rng.pick(STAT_TYPE_VALUES)
  let roll = rng.next() * total
  for (const [stat, weight] of entries) {
    roll -= weight
    if (roll <= 0) return stat as StatType
  }
  return entries[0][0] as StatType
}

function generateName(flavor: ArchetypeFlavor, rng: PRNG): string {
  const { prefixes, cores, suffixes, templates } = flavor.flavor
  const nameTemplate = rng.pick(templates)
  const fill: Record<string, string> = {
    '{prefix}': prefixes.length > 0 ? rng.pick(prefixes) : 'Deep',
    '{core}': cores.length > 0 ? rng.pick(cores) : 'Amplify Signal',
    '{suffix}': suffixes.length > 0 ? rng.pick(suffixes) : 'Protocol',
  }
  let name = nameTemplate
  for (const [key, val] of Object.entries(fill)) {
    name = name.replace(key, val)
  }
  return name.trim()
}

function conditionText(condition: NodeCondition): string {
  switch (condition.type) {
    case 'gear_unequipped':
      return 'No gear equipped'
    case 'gear_equipped':
      return 'Gear equipped'
    case 'stat_threshold':
      return `${condition.stat} >= ${condition.value}`
    case 'turn_threshold':
      return `After turn ${condition.value}`
    case 'gold_spent':
      return `Gold spent < ${condition.value}`
    case 'gold_unspent':
      return `${condition.value}+ gold held`
  }
}

function generateDescription(
  nodeType: NodeType,
  condition: NodeCondition | undefined,
  effects: NodeEffect[],
): string {
  const flatEffects = effects.filter((e) => e.kind === 'flat')
  const specialEffects = effects.filter((e) => e.kind === 'special')

  switch (nodeType) {
    case NodeType.ANTI_SYNERGY: {
      const spec = specialEffects.find((e) => e.specialId === 'anti_synergy')
      const disabled = spec ? `Disable ${spec.stat}` : ''
      const boosts = flatEffects.map((e) => `+${e.value} ${e.stat}`).join(', ')
      return [disabled, boosts].filter(Boolean).join(', ')
    }
    case NodeType.HYBRID_BRIDGE: {
      const boosts = flatEffects.map((e) => `+${e.value} ${e.stat}`).join(', ')
      return [`Hybrid bridge`, boosts].filter(Boolean).join(', ')
    }
    case NodeType.MUTEX: {
      const boosts = flatEffects.map((e) => `+${e.value} ${e.stat}`).join(', ')
      return `${boosts} (exclusive)`
    }
    case NodeType.CONDITIONAL:
    case NodeType.THRESHOLD: {
      const cond = condition ? `${conditionText(condition)}: ` : ''
      const boosts = flatEffects.map((e) => `+${e.value} ${e.stat}`).join(', ')
      return `${cond}${boosts}`
    }
    default: {
      const boosts = flatEffects.map((e) => `+${e.value} ${e.stat}`).join(', ')
      return boosts || 'Unknown'
    }
  }
}

function generateEffects(
  template: StructuralTemplate,
  nodeType: NodeType,
  flavor: ArchetypeFlavor,
  ppBudget: number,
  rng: PRNG,
): NodeEffect[] {
  const totalPP = ppBudget + template.ppBonus
  const effects: NodeEffect[] = []

  switch (nodeType) {
    case NodeType.CONDITIONAL: {
      const stat = pickStatFromWeights(flavor.statWeights, rng)
      const value = Math.max(1, Math.round(totalPP * 0.75))
      effects.push({ stat, value, kind: 'flat' })
      break
    }
    case NodeType.THRESHOLD: {
      const stat = pickStatFromWeights(flavor.statWeights, rng)
      const value = Math.max(1, Math.round(totalPP * 0.6))
      effects.push({ stat, value, kind: 'flat' })
      break
    }
    case NodeType.ANTI_SYNERGY: {
      const disabledStat = pickStatFromWeights(flavor.statWeights, rng)
      effects.push({
        stat: disabledStat,
        value: 0,
        kind: 'special',
        specialId: 'anti_synergy',
      })
      const boostedStat = pickStatFromWeights(flavor.statWeights, rng)
      const boostValue = Math.max(1, Math.round(totalPP * 0.5))
      effects.push({ stat: boostedStat, value: boostValue, kind: 'flat' })
      break
    }
    case NodeType.HYBRID_BRIDGE: {
      effects.push({
        stat: rng.pick(STAT_TYPE_VALUES),
        value: 0,
        kind: 'special',
        specialId: 'hybrid_bridge',
      })
      const stat = pickStatFromWeights(flavor.statWeights, rng)
      const value = Math.max(1, Math.round(totalPP * 0.75))
      effects.push({ stat, value, kind: 'flat' })
      break
    }
    case NodeType.MUTEX: {
      const stat = pickStatFromWeights(flavor.statWeights, rng)
      const value = Math.max(1, Math.round(totalPP * 0.5))
      effects.push({ stat, value, kind: 'flat' })
      break
    }
    default: {
      const stat = pickStatFromWeights(flavor.statWeights, rng)
      const value = Math.max(1, Math.round(totalPP))
      effects.push({ stat, value, kind: 'flat' })
      break
    }
  }

  return effects
}

export function generateStructuralNode(
  template: StructuralTemplate,
  flavor: ArchetypeFlavor,
  ppBudget: number,
  rng: PRNG,
  mutexPairId?: string,
): NodeDef {
  const nodeType = templateKindToNodeType(template.kind)
  const condition = resolveCondition(template)
  const effects = generateEffects(template, nodeType, flavor, ppBudget, rng)
  const name = generateName(flavor, rng)
  const description = generateDescription(nodeType, condition, effects)
  const cost = Math.round(ppBudget * 18 + rng.nextInt(-4, 4))
  const rarity = rng.next() * 0.4 + 0.3
  const column = Math.max(1, Math.round(ppBudget - 1))

  return {
    id: `struct_${template.kind.toLowerCase()}_${rng.nextInt(10000, 99999)}`,
    name,
    description,
    type: nodeType,
    archetype: flavor.id.toUpperCase() as Archetype,
    cost,
    effects,
    condition,
    mutexPairId:
      nodeType === NodeType.MUTEX
        ? (mutexPairId ?? `mutex_${rng.nextInt(10000, 99999)}`)
        : undefined,
    rarity,
    column,
    isAnchor: false,
  }
}
