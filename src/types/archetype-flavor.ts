import { z } from 'zod/v4'
import { StatType } from './enums'

export interface RingConfig {
  ppBudget: number
  costRange: [number, number]
  structuralRatio: number
}

export interface StructuralTemplate {
  kind: string
  condition?: string
  stat?: string
  value?: number
  count?: number
  ppBonus: number
}

export interface ArchetypeFlavor {
  id: string
  name: string
  subtitle: string
  description: string
  primaryStat: StatType
  secondaryStat: StatType
  statWeights: Record<string, number>
  flavor: {
    prefixes: string[]
    cores: string[]
    suffixes: string[]
    templates: string[]
  }
  rings: Record<string, RingConfig>
  structuralTemplates: StructuralTemplate[]
  anchorNames?: string[]
  abilityNames?: string[]
  theme?: Record<string, string>
}

export const ArchetypeFlavorSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  description: z.string(),
  primaryStat: z.enum([StatType.STR, StatType.AGI, StatType.STA, StatType.INT, StatType.LCK]),
  secondaryStat: z.enum([StatType.STR, StatType.AGI, StatType.STA, StatType.INT, StatType.LCK]),
  statWeights: z.record(z.string(), z.number().min(0).max(2)),
  flavor: z.object({
    prefixes: z.array(z.string()),
    cores: z.array(z.string()),
    suffixes: z.array(z.string()),
    templates: z.array(z.string()),
  }),
  rings: z.record(z.string(), z.object({
    ppBudget: z.number(),
    costRange: z.tuple([z.number(), z.number()]),
    structuralRatio: z.number(),
  })),
  structuralTemplates: z.array(z.object({
    kind: z.string(),
    condition: z.string().optional(),
    stat: z.string().optional(),
    value: z.number().optional(),
    count: z.number().optional(),
    ppBonus: z.number(),
  })),
  anchorNames: z.array(z.string()).optional(),
  abilityNames: z.array(z.string()).optional(),
  theme: z.record(z.string(), z.string()).optional(),
})
