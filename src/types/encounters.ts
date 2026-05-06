import type { ThreatTag } from './enums'

export interface Encounter {
  enemyName: string
  flavorText: string
  armor: number
  evasion: number
  intResist: number
  staminaDrain: number
  threatTags: ThreatTag[]
}
