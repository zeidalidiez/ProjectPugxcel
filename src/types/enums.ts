export const Archetype = {
  SPORGK: 'SPORGK',
  ELF: 'ELF',
  VAMPIRE: 'VAMPIRE',
} as const
export type Archetype = (typeof Archetype)[keyof typeof Archetype]
export const ARCHETYPE_VALUES = Object.values(Archetype) as Archetype[]

export const StatType = {
  STR: 'STR',
  AGI: 'AGI',
  STA: 'STA',
  INT: 'INT',
  LCK: 'LCK',
} as const
export type StatType = (typeof StatType)[keyof typeof StatType]
export const STAT_TYPE_VALUES = Object.values(StatType) as StatType[]

export const NodeType = {
  STANDARD: 'STANDARD',
  CONDITIONAL: 'CONDITIONAL',
  MUTEX: 'MUTEX',
  ANTI_SYNERGY: 'ANTI_SYNERGY',
  THRESHOLD: 'THRESHOLD',
  HYBRID_BRIDGE: 'HYBRID_BRIDGE',
} as const
export type NodeType = (typeof NodeType)[keyof typeof NodeType]

export const ItemTier = {
  T1: 'T1',
  T2: 'T2',
  T3: 'T3',
  T4: 'T4',
} as const
export type ItemTier = (typeof ItemTier)[keyof typeof ItemTier]

export const ItemSlot = {
  HEAD: 'HEAD',
  BODY: 'BODY',
  PAWS: 'PAWS',
  ARTIFACT: 'ARTIFACT',
} as const
export type ItemSlot = (typeof ItemSlot)[keyof typeof ItemSlot]

export const ItemCategory = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  TRINKET: 'TRINKET',
  ABILITY: 'ABILITY',
} as const
export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory]

export const RunPhase = {
  ARCHETYPE_SELECT: 'ARCHETYPE_SELECT',
  FORECAST: 'FORECAST',
  PAYOUT: 'PAYOUT',
  DRAFT: 'DRAFT',
  EXECUTE: 'EXECUTE',
  STINGER: 'STINGER',
  POST_RUN: 'POST_RUN',
} as const
export type RunPhase = (typeof RunPhase)[keyof typeof RunPhase]

export const ThreatTag = {
  ARMORED: 'ARMORED',
  EVASIVE: 'EVASIVE',
  RESISTANT: 'RESISTANT',
  STAMINA_DRAIN: 'STAMINA_DRAIN',
  KINETIC: 'KINETIC',
  VOID: 'VOID',
  CRYSTALLINE: 'CRYSTALLINE',
} as const
export type ThreatTag = (typeof ThreatTag)[keyof typeof ThreatTag]

export const StingerVariant = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  BARELY_PASS: 'BARELY_PASS',
  BARELY_FAIL: 'BARELY_FAIL',
  BOSS_PASS: 'BOSS_PASS',
} as const
export type StingerVariant = (typeof StingerVariant)[keyof typeof StingerVariant]
