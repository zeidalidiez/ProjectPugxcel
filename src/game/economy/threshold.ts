import type { BalanceWeights } from '../../types/balance'
import { computeThreshold } from '../balance/computeThreshold'
import { PRESETS } from '../../data/balance-presets'

/** Legacy wrapper: uses normal-preset weights for backwards-compatible callers. */
export function calculateThreshold(turn: number, weights?: BalanceWeights): number {
  return computeThreshold(turn, weights ?? PRESETS.normal)
}
