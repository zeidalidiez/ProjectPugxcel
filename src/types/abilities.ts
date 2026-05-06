import type { StatType } from './enums'

export interface AbilityDef {
  id: string
  name: string
  staCost: number
  baseDamage: number
  maxFires: number
  scalingStat: StatType
  scalingFactor: number
  bypassArmor: boolean
  bypassEvasion: boolean
  description: string
}
