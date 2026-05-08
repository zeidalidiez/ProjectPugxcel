import { z } from 'zod/v4'
import { Archetype } from '../../types/enums'
import { BalanceWeightsSchema } from '../../types/balance'

const settingsSchema = z.object({
  fontSize: z.union([z.literal(100), z.literal(125), z.literal(150)]),
  reducedMotion: z.boolean(),
  uncertaintyMode: z.boolean(),
  soundEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  soundVolume: z.number().min(0).max(1),
  musicVolume: z.number().min(0).max(1),
})

const codexSchema = z.object({
  unlockedModifiers: z.array(z.string()),
  completedRuns: z.array(z.object({
    id: z.string(),
    seed: z.string(),
    archetype: z.enum([Archetype.SPORGK, Archetype.ELF, Archetype.VAMPIRE]),
    turnReached: z.number(),
    passed: z.boolean(),
    deficitOrMargin: z.number(),
    draftedNodeIds: z.array(z.string()),
    shareString: z.string(),
    timestamp: z.number(),
  })),
  achievements: z.array(z.string()),
  builds: z.array(z.object({
    name: z.string(),
    runId: z.string(),
  })),
})

const metaSchema = z.object({
  selectedPresetId: z.enum(['easy', 'normal', 'hard', 'nightmare', 'custom']).optional(),
  balanceWeights: BalanceWeightsSchema.optional(),
  lastCustomWeights: BalanceWeightsSchema.nullable().optional(),
})

export const saveSchema = z.object({
  version: z.number(),
  run: z.unknown(),
  codex: codexSchema,
  settings: settingsSchema,
  meta: metaSchema.optional(),
})

export type ValidatedSave = z.infer<typeof saveSchema>

export function validateSave(data: unknown): ValidatedSave | null {
  const result = saveSchema.safeParse(data)
  return result.success ? result.data : null
}
