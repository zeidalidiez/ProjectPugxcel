import type { StatBlock } from '../../types/stats'
import type { Encounter } from '../../types/encounters'
import type { InventoryItem, ItemDef } from '../../types/items'
import type { CombatLogLine } from '../../types/run'
import { ItemCategory, StatType } from '../../types/enums'

export interface DamageInput {
  stats: StatBlock
  encounter: Encounter
  inventory: InventoryItem[]
  critPayload: boolean[]
  evadePayload: boolean[]
  getItemDef: (defId: string) => ItemDef | undefined
  primaryStat?: StatType
}

export interface DamageResult {
  damage: number
  attacks: number
  lines: CombatLogLine[]
}

export function computeDamage(input: DamageInput): DamageResult {
  const { stats, encounter, inventory, critPayload, evadePayload, getItemDef, primaryStat = StatType.STR } =
    input

  let strMult = 1.0
  let flatBonuses = 0

  for (const item of inventory) {
    if (!item.equipped) continue
    const def = getItemDef(item.defId)
    if (!def) continue

    if (def.category === ItemCategory.WEAPON) {
      for (const effect of def.effects) {
        if (effect.strMult !== undefined) strMult = effect.strMult
        if (effect.flatBonus !== undefined) flatBonuses += effect.flatBonus
      }
    } else {
      for (const effect of def.effects) {
        if (effect.flatBonus !== undefined) flatBonuses += effect.flatBonus
      }
    }
  }

  const base = stats[primaryStat] * strMult + flatBonuses
  const attacks = Math.floor(1 + stats.AGI / 5)

  const effectiveArmor = Math.max(0, encounter.armor - stats.STR * 2)
  const armorMod = primaryStat === StatType.INT
    ? 1.0
    : Math.max(0.1, 1 - effectiveArmor / (effectiveArmor + 100))

  const bypassEvasion = primaryStat === StatType.INT

  const lines: CombatLogLine[] = []
  let total = 0

  for (let i = 0; i < attacks; i++) {
    const crit = critPayload[i] ? 2 : 1
    const evaded = bypassEvasion ? false : evadePayload[i]
    const perAttack = Math.floor(base * crit * armorMod * (evaded ? 0 : 1))
    total += perAttack

    lines.push({
      text: `ATTACK ${i + 1}: ${perAttack}${crit > 1 ? ' CRIT' : ''}${evaded ? ' EVADED' : ''}`,
      type: crit > 1 ? 'crit' : 'info',
    })
  }

  return { damage: total, attacks, lines }
}
