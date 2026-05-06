import type { PRNG } from '../../types/rng'
import type { Encounter } from '../../types/encounters'
import type { ThreatTag } from '../../types/enums'
import { encounterTemplates, getTemplateKeys } from '../../data/encounters/templates'
import { enemyNames } from '../../data/encounters/enemies'

function pickEnemyPoolKey(tags: ThreatTag[]): string {
  const poolOrder: Array<{ tag: ThreatTag; pool: string }> = [
    { tag: 'ARMORED' as ThreatTag, pool: 'armored' },
    { tag: 'EVASIVE' as ThreatTag, pool: 'evasive' },
    { tag: 'RESISTANT' as ThreatTag, pool: 'resistant' },
    { tag: 'STAMINA_DRAIN' as ThreatTag, pool: 'draining' },
  ]
  for (const { tag, pool } of poolOrder) {
    if (tags.includes(tag)) return pool
  }
  return 'mixed'
}

export function generateEncounter(rng: PRNG, turn: number): Encounter {
  const isBoss = turn % 5 === 0
  const scalingFactor = 1 + (turn - 1) * 0.1

  const allKeys = getTemplateKeys()
  let candidateKeys: string[]

  if (isBoss) {
    candidateKeys = allKeys.filter((k) => k.startsWith('boss_'))
  } else if (turn <= 2) {
    candidateKeys = allKeys.filter((k) => {
      if (k.startsWith('boss_')) return false
      const t = encounterTemplates[k]
      return t.armorBase <= 30 && t.evasionBase <= 0.1 && t.staminaDrainBase <= 1
    })
  } else if (turn <= 5) {
    candidateKeys = allKeys.filter((k) => {
      if (k.startsWith('boss_')) return false
      const t = encounterTemplates[k]
      return t.armorBase <= 50 && t.evasionBase <= 0.2
    })
  } else {
    candidateKeys = allKeys.filter((k) => !k.startsWith('boss_'))
  }

  const templateKey = rng.pick(candidateKeys)
  const template = encounterTemplates[templateKey]

  let armor = Math.floor(template.armorBase * scalingFactor)
  let evasion = Math.min(template.evasionBase * scalingFactor, 0.5)
  const intResist = Math.min(template.intResistBase * scalingFactor, 0.8)
  const staminaDrain = Math.floor(template.staminaDrainBase * scalingFactor)

  if (isBoss) {
    armor = Math.floor(armor * 1.5)
    evasion = Math.min(evasion * 1.5, 0.5)
  }

  const poolKey = isBoss ? 'boss' : pickEnemyPoolKey(template.tags)
  const pool = enemyNames[poolKey] ?? enemyNames.mixed
  const enemy = rng.pick(pool)

  return {
    enemyName: enemy.name,
    flavorText: enemy.flavorText,
    armor,
    evasion,
    intResist,
    staminaDrain,
    threatTags: template.tags,
  }
}

export function generateEncounters(
  rng: PRNG,
  startTurn: number,
  count: number,
): Encounter[] {
  return Array.from({ length: count }, (_, i) =>
    generateEncounter(rng, startTurn + i),
  )
}
