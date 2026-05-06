import type { ThreatTag } from '../../types/enums'

export interface EncounterTemplate {
  tags: ThreatTag[]
  armorBase: number
  evasionBase: number
  intResistBase: number
  staminaDrainBase: number
}

export const encounterTemplates: Record<string, EncounterTemplate> = {
  light_armored: {
    tags: ['ARMORED'],
    armorBase: 30,
    evasionBase: 0,
    intResistBase: 0.05,
    staminaDrainBase: 0,
  },
  heavy_armored: {
    tags: ['ARMORED'],
    armorBase: 60,
    evasionBase: 0,
    intResistBase: 0.1,
    staminaDrainBase: 1,
  },
  evasive: {
    tags: ['EVASIVE'],
    armorBase: 5,
    evasionBase: 0.25,
    intResistBase: 0,
    staminaDrainBase: 0,
  },
  resistant: {
    tags: ['RESISTANT'],
    armorBase: 10,
    evasionBase: 0.05,
    intResistBase: 0.3,
    staminaDrainBase: 0,
  },
  draining: {
    tags: ['STAMINA_DRAIN'],
    armorBase: 10,
    evasionBase: 0.05,
    intResistBase: 0.1,
    staminaDrainBase: 4,
  },
  kinetic_assault: {
    tags: ['KINETIC'],
    armorBase: 25,
    evasionBase: 0,
    intResistBase: 0,
    staminaDrainBase: 0,
  },
  void_touched: {
    tags: ['VOID'],
    armorBase: 5,
    evasionBase: 0.1,
    intResistBase: 0.15,
    staminaDrainBase: 1,
  },
  crystalline: {
    tags: ['CRYSTALLINE'],
    armorBase: 20,
    evasionBase: 0.1,
    intResistBase: 0.1,
    staminaDrainBase: 0,
  },

  mixed_armored_evasive: {
    tags: ['ARMORED', 'EVASIVE'],
    armorBase: 35,
    evasionBase: 0.15,
    intResistBase: 0.05,
    staminaDrainBase: 1,
  },
  mixed_armored_draining: {
    tags: ['ARMORED', 'STAMINA_DRAIN'],
    armorBase: 40,
    evasionBase: 0,
    intResistBase: 0.1,
    staminaDrainBase: 3,
  },
  mixed_resistant_evasive: {
    tags: ['RESISTANT', 'EVASIVE'],
    armorBase: 5,
    evasionBase: 0.2,
    intResistBase: 0.25,
    staminaDrainBase: 0,
  },
  mixed_kinetic_armored: {
    tags: ['KINETIC', 'ARMORED'],
    armorBase: 45,
    evasionBase: 0,
    intResistBase: 0.05,
    staminaDrainBase: 1,
  },
  mixed_void_resistant: {
    tags: ['VOID', 'RESISTANT'],
    armorBase: 10,
    evasionBase: 0.05,
    intResistBase: 0.35,
    staminaDrainBase: 1,
  },
  mixed_crystalline_evasive: {
    tags: ['CRYSTALLINE', 'EVASIVE'],
    armorBase: 15,
    evasionBase: 0.25,
    intResistBase: 0.1,
    staminaDrainBase: 0,
  },
  mixed_void_draining: {
    tags: ['VOID', 'STAMINA_DRAIN'],
    armorBase: 5,
    evasionBase: 0.1,
    intResistBase: 0.15,
    staminaDrainBase: 5,
  },
  mixed_kinetic_evasive: {
    tags: ['KINETIC', 'EVASIVE'],
    armorBase: 15,
    evasionBase: 0.2,
    intResistBase: 0,
    staminaDrainBase: 1,
  },
  mixed_crystalline_armored: {
    tags: ['CRYSTALLINE', 'ARMORED'],
    armorBase: 40,
    evasionBase: 0.05,
    intResistBase: 0.1,
    staminaDrainBase: 0,
  },
  mixed_void_kinetic: {
    tags: ['VOID', 'KINETIC'],
    armorBase: 20,
    evasionBase: 0.05,
    intResistBase: 0.1,
    staminaDrainBase: 2,
  },
  mixed_resistant_draining: {
    tags: ['RESISTANT', 'STAMINA_DRAIN'],
    armorBase: 10,
    evasionBase: 0.05,
    intResistBase: 0.3,
    staminaDrainBase: 5,
  },
  mixed_resistant_armored: {
    tags: ['RESISTANT', 'ARMORED'],
    armorBase: 40,
    evasionBase: 0.05,
    intResistBase: 0.25,
    staminaDrainBase: 1,
  },
  mixed_crystalline_draining: {
    tags: ['CRYSTALLINE', 'STAMINA_DRAIN'],
    armorBase: 15,
    evasionBase: 0.1,
    intResistBase: 0.1,
    staminaDrainBase: 3,
  },
  mixed_kinetic_draining: {
    tags: ['KINETIC', 'STAMINA_DRAIN'],
    armorBase: 20,
    evasionBase: 0,
    intResistBase: 0.05,
    staminaDrainBase: 4,
  },

  boss_general: {
    tags: ['ARMORED', 'RESISTANT'],
    armorBase: 50,
    evasionBase: 0.1,
    intResistBase: 0.2,
    staminaDrainBase: 2,
  },
  boss_armored: {
    tags: ['ARMORED'],
    armorBase: 90,
    evasionBase: 0,
    intResistBase: 0.15,
    staminaDrainBase: 3,
  },
  boss_evasive: {
    tags: ['EVASIVE', 'RESISTANT'],
    armorBase: 10,
    evasionBase: 0.4,
    intResistBase: 0.2,
    staminaDrainBase: 1,
  },
  boss_draining: {
    tags: ['STAMINA_DRAIN', 'ARMORED'],
    armorBase: 40,
    evasionBase: 0.05,
    intResistBase: 0.15,
    staminaDrainBase: 6,
  },
  boss_void: {
    tags: ['VOID', 'RESISTANT', 'ARMORED'],
    armorBase: 45,
    evasionBase: 0.05,
    intResistBase: 0.3,
    staminaDrainBase: 4,
  },
  boss_crystalline: {
    tags: ['CRYSTALLINE', 'EVASIVE'],
    armorBase: 30,
    evasionBase: 0.25,
    intResistBase: 0.15,
    staminaDrainBase: 2,
  },
  boss_kinetic: {
    tags: ['KINETIC', 'ARMORED'],
    armorBase: 60,
    evasionBase: 0.05,
    intResistBase: 0.1,
    staminaDrainBase: 3,
  },
  boss_trifecta: {
    tags: ['ARMORED', 'EVASIVE', 'RESISTANT'],
    armorBase: 55,
    evasionBase: 0.2,
    intResistBase: 0.25,
    staminaDrainBase: 3,
  },
}

export function getTemplateKeys(): string[] {
  return Object.keys(encounterTemplates)
}
