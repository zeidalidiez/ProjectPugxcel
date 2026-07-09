import type { StatBlock } from '../../types/stats'
import type { Encounter } from '../../types/encounters'
import type { InventoryItem, ItemDef } from '../../types/items'
import type { CombatLogLine } from '../../types/run'
import { ItemCategory, StatType, ThreatTag } from '../../types/enums'

export interface DamageInput {
  stats: StatBlock
  encounter: Encounter
  inventory: InventoryItem[]
  critPayload: boolean[]
  evadePayload: boolean[]
  getItemDef: (defId: string) => ItemDef | undefined
  primaryStat?: StatType
  /** Scales weapon flat bonuses and strMult contribution from items. */
  itemPowerMultiplier?: number
}

export interface DamageResult {
  damage: number
  attacks: number
  lines: CombatLogLine[]
}

const RESISTANCE_THREAT_MAP: Partial<Record<ThreatTag, string>> = {
  [ThreatTag.ARMORED]: 'armor',
  [ThreatTag.EVASIVE]: 'evasion',
  [ThreatTag.RESISTANT]: 'intResist',
}

export function computeDamage(input: DamageInput): DamageResult {
  const {
    stats,
    encounter,
    inventory,
    critPayload,
    evadePayload,
    getItemDef,
    primaryStat = StatType.STR,
    itemPowerMultiplier = 1.0,
  } = input

  let strMult = 1.0
  let flatBonuses = 0
  const resistanceBypass: Record<string, number> = { armor: 0, evasion: 0, intResist: 0 }
  const lines: CombatLogLine[] = []

  for (const item of inventory) {
    if (!item.equipped) continue
    const def = getItemDef(item.defId)
    if (!def) continue

    if (def.category === ItemCategory.WEAPON) {
      for (const effect of def.effects) {
        if (effect.strMult !== undefined) {
          // Scale weapon mult deviation from 1.0 by item power
          strMult = 1 + (effect.strMult - 1) * itemPowerMultiplier
        }
        if (effect.flatBonus !== undefined) {
          flatBonuses += effect.flatBonus * itemPowerMultiplier
        }
        if (effect.resistance) {
          const target = RESISTANCE_THREAT_MAP[effect.resistance.tag]
          if (target && encounter.threatTags.includes(effect.resistance.tag)) {
            resistanceBypass[target] += effect.resistance.value
          }
        }
      }
    } else {
      for (const effect of def.effects) {
        if (effect.flatBonus !== undefined) {
          flatBonuses += effect.flatBonus * itemPowerMultiplier
        }
        if (effect.resistance) {
          const target = RESISTANCE_THREAT_MAP[effect.resistance.tag]
          if (target && encounter.threatTags.includes(effect.resistance.tag)) {
            resistanceBypass[target] += effect.resistance.value
          }
        }
      }
    }
  }

  if (resistanceBypass.armor > 0) {
    lines.push({ text: `RESISTANCE: ARMOR bypassed by ${resistanceBypass.armor}`, type: 'info' })
  }
  if (resistanceBypass.evasion > 0) {
    lines.push({ text: `RESISTANCE: EVASION reduced by ${resistanceBypass.evasion}`, type: 'info' })
  }
  if (resistanceBypass.intResist > 0) {
    lines.push({ text: `RESISTANCE: INT resist reduced by ${resistanceBypass.intResist}`, type: 'info' })
  }

  const base = stats[primaryStat] * strMult + flatBonuses
  const attacks = Math.floor(1 + stats.AGI / 5)

  const effectiveArmor = Math.max(0, encounter.armor - stats.STR * 2 - resistanceBypass.armor)
  const armorMod = primaryStat === StatType.INT
    ? 1.0
    : Math.max(0.1, 1 - effectiveArmor / (effectiveArmor + 100))

  const bypassEvasion = primaryStat === StatType.INT

  const effectiveEvasion = Math.max(0, encounter.evasion - resistanceBypass.evasion * 0.01)
  const actualEvasion = bypassEvasion ? 0 : effectiveEvasion

  let total = 0

  for (let i = 0; i < attacks; i++) {
    const crit = critPayload[i] ? 2 : 1
    const evaded = bypassEvasion ? false : (evadePayload[i] && actualEvasion > 0)
    const perAttack = Math.floor(base * crit * armorMod * (evaded ? 0 : 1))
    total += perAttack

    lines.push({
      text: `ATTACK ${i + 1}: ${perAttack}${crit > 1 ? ' CRIT' : ''}${evaded ? ' EVADED' : ''}`,
      type: crit > 1 ? 'crit' : 'info',
    })
  }

  return { damage: total, attacks, lines }
}
