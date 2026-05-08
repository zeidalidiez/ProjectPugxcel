import type { BalanceWeights } from '../../types/balance'

export function computeThreshold(turn: number, weights: BalanceWeights): number {
  const baseValue = computeBaseCurve(turn, weights)
  if (turn === 20) return Math.floor(baseValue * weights.finalBossMultiplier)
  if (turn % 5 === 0 && turn > 0) return Math.floor(baseValue * weights.bossMultiplier)
  return Math.floor(baseValue)
}

function computeBaseCurve(turn: number, weights: BalanceWeights): number {
  const { curveType, curve } = weights
  const t = turn - 1
  switch (curveType) {
    case 'linear':
      return curve.base + curve.primarySlope * t
    case 'breakpoint': {
      const bp = curve.breakpointTurn ?? 9
      const sLate = curve.secondarySlope ?? curve.primarySlope
      const earlyDelta = curve.primarySlope * Math.min(t, bp)
      const lateDelta = sLate * Math.max(0, t - bp)
      return curve.base + earlyDelta + lateDelta
    }
    case 'quadratic':
      return curve.base + curve.primarySlope * t + (curve.quadraticCoeff ?? 0.3) * t * t
  }
}
