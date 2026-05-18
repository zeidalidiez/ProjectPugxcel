import { z } from 'zod/v4'

export type CurveType = 'linear' | 'breakpoint' | 'quadratic'

export type DifficultyPresetId = 'easy' | 'normal' | 'hard' | 'nightmare' | 'custom'

export interface CurveParams {
  base: number
  primarySlope: number
  secondarySlope?: number   // breakpoint only
  breakpointTurn?: number   // breakpoint only
  quadraticCoeff?: number   // quadratic only
}

export type ConstellationLayout = 'left-to-right' | 'radial'

export interface BalanceWeights {
  curveType: CurveType
  curve: CurveParams
  bossMultiplier: number
  finalBossMultiplier: number
  itemPowerMultiplier: number
  nodePowerMultiplier: number
  structuralNodeAvailability: number
  startingGoldMultiplier: number
  perTurnPayoutMultiplier: number
  luckEfficacyMultiplier: number
  poolSizeMultiplier: number
  constellationLayout: ConstellationLayout
  nodeDensity: number
  ringCount: number
  ringZeroNodes: number
}

const CurveParamsSchema = z.object({
  base: z.number(),
  primarySlope: z.number(),
  secondarySlope: z.number().optional(),
  breakpointTurn: z.number().optional(),
  quadraticCoeff: z.number().optional(),
})

export const BalanceWeightsSchema = z.object({
  curveType: z.enum(['linear', 'breakpoint', 'quadratic']),
  curve: CurveParamsSchema,
  bossMultiplier: z.number().min(1).max(5),
  finalBossMultiplier: z.number().min(1).max(5),
  itemPowerMultiplier: z.number().min(0).max(5),
  nodePowerMultiplier: z.number().min(0).max(5),
  structuralNodeAvailability: z.number().min(0).max(5),
  startingGoldMultiplier: z.number().min(0).max(5),
  perTurnPayoutMultiplier: z.number().min(0).max(5),
  luckEfficacyMultiplier: z.number().min(0).max(5),
  poolSizeMultiplier: z.number().min(0).max(5),
  constellationLayout: z.enum(['left-to-right', 'radial']),
  nodeDensity: z.number().min(0.2).max(5),
  ringCount: z.number().min(4).max(10),
  ringZeroNodes: z.number().min(1).max(5),
})
