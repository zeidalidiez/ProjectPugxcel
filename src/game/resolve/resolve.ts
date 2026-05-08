import type { RunState, CombatLogLine, ResolutionResult } from '../../types/run'
import type { PRNG } from '../../types/rng'
import { StingerVariant, Archetype, StatType } from '../../types/enums'
import { calculateThreshold } from '../economy/threshold'
import { getAbilityById } from '../../data/abilities'
import { getItemById } from '../../data/items'
import { computeDamage } from './damage'
import { fireAbilities, getMaxStamina } from './abilities'

const PRIMARY_STAT: Record<Archetype, StatType> = {
  [Archetype.SPORGK]: StatType.STR,
  [Archetype.ELF]: StatType.AGI,
  [Archetype.VAMPIRE]: StatType.INT,
}

export function resolve(
  state: RunState,
  rng: PRNG,
): { result: ResolutionResult; log: CombatLogLine[] } {
  const encounter = state.encounters[0]
  const log: CombatLogLine[] = []

  const attacks = Math.floor(1 + state.stats.AGI / 5)
  const critChance = Math.min(state.stats.LCK * 0.02, 0.5)

  const critPayload: boolean[] = []
  const evadePayload: boolean[] = []
  for (let i = 0; i < attacks; i++) {
    critPayload.push(rng.next() < critChance)
    evadePayload.push(rng.next() < encounter.evasion)
  }

  const damageResult = computeDamage({
    stats: state.stats,
    encounter,
    inventory: state.inventory,
    critPayload,
    evadePayload,
    getItemDef: getItemById,
    primaryStat: PRIMARY_STAT[state.archetype],
  })
  log.push(...damageResult.lines)

  const maxStamina = getMaxStamina(state.stats.STA)

  const abilityDefs = state.abilities
    .map((id) => getAbilityById(id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id))

  const abilityResult = fireAbilities({
    stats: state.stats,
    encounter,
    abilities: abilityDefs,
    maxStamina,
  })
  log.push(...abilityResult.lines)

  const total = damageResult.damage + abilityResult.totalDamage
  const threshold = calculateThreshold(state.turn, state.balanceWeights)
  const pass = total >= threshold
  const deficit = threshold - total
  const margin = (total - threshold) / threshold

  let stingerVariant: typeof StingerVariant[keyof typeof StingerVariant]
  if (pass && state.turn % 5 === 0) {
    stingerVariant = StingerVariant.BOSS_PASS
  } else if (pass && margin < 0.05) {
    stingerVariant = StingerVariant.BARELY_PASS
  } else if (pass) {
    stingerVariant = StingerVariant.PASS
  } else if (!pass && margin >= -0.05) {
    stingerVariant = StingerVariant.BARELY_FAIL
  } else {
    stingerVariant = StingerVariant.FAIL
  }

  log.push({
    text: `TOTAL DAMAGE: ${total} / REQUIRED: ${threshold}`,
    type: 'total',
  })
  log.push({
    text: `RESULT: ${pass ? 'PASS' : 'FAIL'}`,
    type: 'result',
  })

  return {
    result: {
      pass,
      damageDealt: total,
      threshold,
      deficit,
      stingerVariant,
    },
    log,
  }
}
