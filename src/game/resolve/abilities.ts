import type { StatBlock } from '../../types/stats'
import type { Encounter } from '../../types/encounters'
import type { AbilityDef } from '../../types/abilities'
import type { CombatLogLine } from '../../types/run'
import { StatType } from '../../types/enums'

export interface AbilityInput {
  stats: StatBlock
  encounter: Encounter
  abilities: AbilityDef[]
  maxStamina: number
}

export interface AbilityResult {
  totalDamage: number
  lines: CombatLogLine[]
  staminaSpent: number
}

export function getMaxStamina(sta: number): number {
  return 10 + Math.floor(sta / 2)
}

export function fireAbilities(input: AbilityInput): AbilityResult {
  const { stats, encounter, abilities, maxStamina } = input
  let available = Math.max(0, maxStamina - encounter.staminaDrain)
  const initialAvailable = available
  let totalDamage = 0
  const lines: CombatLogLine[] = []

  const armorMod = Math.max(
    0.1,
    1 - encounter.armor / (encounter.armor + 100),
  )

  for (const ability of abilities) {
    let fires = 0
    while (available >= ability.staCost && fires < ability.maxFires) {
      let damage =
        ability.baseDamage +
        Math.floor(ability.scalingFactor * stats[ability.scalingStat])

      if (!ability.bypassArmor) {
        damage = Math.floor(damage * armorMod)
      }

      if (!ability.bypassEvasion) {
        damage = Math.floor(damage * (1 - encounter.evasion))
      }

      if (ability.scalingStat === StatType.INT) {
        damage = Math.floor(damage * (1 - encounter.intResist))
      }

      lines.push({
        text: `ABILITY: ${ability.name} x${damage}`,
        type: 'ability',
      })

      available -= ability.staCost
      fires++
      totalDamage += damage
    }
  }

  return {
    totalDamage,
    lines,
    staminaSpent: initialAvailable - available,
  }
}
