import { describe, it, expect } from 'vitest'
import { computeThreshold } from '../../../src/game/balance/computeThreshold'
import { PRESETS } from '../../../src/data/balance-presets'
import type { BalanceWeights } from '../../../src/types/balance'

describe('computeThreshold', () => {
  describe('linear curve', () => {
    const weights: BalanceWeights = {
      curveType: 'linear',
      curve: { base: 20, primarySlope: 5 },
      bossMultiplier: 1.5,
      finalBossMultiplier: 2.0,
      itemPowerMultiplier: 1.0,
      nodePowerMultiplier: 1.0,
      structuralNodeAvailability: 1.0,
      startingGoldMultiplier: 1.0,
      perTurnPayoutMultiplier: 1.0,
      luckEfficacyMultiplier: 1.0,
      poolSizeMultiplier: 1.0,
    }

    it('turn 1 returns base', () => {
      // t=0: 20 + 5*0 = 20
      expect(computeThreshold(1, weights)).toBe(20)
    })

    it('turn 2 returns base + primarySlope', () => {
      // t=1: 20 + 5*1 = 25
      expect(computeThreshold(2, weights)).toBe(25)
    })

    it('boss turn 5 applies bossMultiplier', () => {
      // t=4: 20 + 5*4 = 40, * 1.5 = 60
      expect(computeThreshold(5, weights)).toBe(60)
    })

    it('boss turn 10 applies bossMultiplier', () => {
      // t=9: 20 + 5*9 = 65, * 1.5 = 97
      expect(computeThreshold(10, weights)).toBe(97)
    })

    it('final boss turn 20 applies finalBossMultiplier', () => {
      // t=19: 20 + 5*19 = 115, * 2.0 = 230
      expect(computeThreshold(20, weights)).toBe(230)
    })

    it('increments by primarySlope on non-boss turns', () => {
      const t2 = computeThreshold(2, weights)
      const t3 = computeThreshold(3, weights)
      expect(t3 - t2).toBe(5)
    })
  })

  describe('breakpoint curve', () => {
    const weights: BalanceWeights = {
      curveType: 'breakpoint',
      curve: { base: 10, primarySlope: 6, secondarySlope: 9, breakpointTurn: 9 },
      bossMultiplier: 1.5,
      finalBossMultiplier: 1.8,
      itemPowerMultiplier: 1.0,
      nodePowerMultiplier: 1.0,
      structuralNodeAvailability: 1.0,
      startingGoldMultiplier: 1.0,
      perTurnPayoutMultiplier: 1.0,
      luckEfficacyMultiplier: 1.0,
      poolSizeMultiplier: 1.0,
    }

    it('turn 1 returns base', () => {
      expect(computeThreshold(1, weights)).toBe(10)
    })

    it('turn 9 is still in early segment (no boss)', () => {
      // t=8, 9%5!=0 => no boss: 10 + 6*min(8,9) + 9*max(0,8-9) = 10+48+0 = 58
      expect(computeThreshold(9, weights)).toBe(58)
    })

    it('turn 10 uses bossMultiplier with breakpoint calc', () => {
      // t=9: 10 + 6*9 + 9*0 = 64, * 1.5 = 96
      expect(computeThreshold(10, weights)).toBe(96)
    })

    it('late turns (after breakpoint) scale at secondary slope', () => {
      // turn 14: t=13, 10+6*9+9*(13-9) = 10+54+36 = 100
      // turn 13: t=12, 10+6*9+9*(12-9) = 10+54+27 = 91
      expect(computeThreshold(14, weights) - computeThreshold(13, weights)).toBe(9)
    })

    it('early turns scale at primary slope', () => {
      // turn 3: t=2, 10+6*2=22; turn 2: t=1, 10+6*1=16
      expect(computeThreshold(3, weights) - computeThreshold(2, weights)).toBe(6)
    })
  })

  describe('quadratic curve', () => {
    const weights: BalanceWeights = {
      curveType: 'quadratic',
      curve: { base: 10, primarySlope: 3, quadraticCoeff: 0.5 },
      bossMultiplier: 1.5,
      finalBossMultiplier: 2.0,
      itemPowerMultiplier: 1.0,
      nodePowerMultiplier: 1.0,
      structuralNodeAvailability: 1.0,
      startingGoldMultiplier: 1.0,
      perTurnPayoutMultiplier: 1.0,
      luckEfficacyMultiplier: 1.0,
      poolSizeMultiplier: 1.0,
    }

    it('turn 1 returns base', () => {
      // t=0: 10 + 0 + 0 = 10
      expect(computeThreshold(1, weights)).toBe(10)
    })

    it('matches formula at turn 3', () => {
      // t=2: 10 + 3*2 + 0.5*4 = 18
      expect(computeThreshold(3, weights)).toBe(18)
    })

    it('accelerates over time (later diffs are larger)', () => {
      // diff turn 8→9 > diff turn 2→3 (both non-boss)
      const earlyDiff = computeThreshold(3, weights) - computeThreshold(2, weights) // 5
      const lateDiff = computeThreshold(9, weights) - computeThreshold(8, weights)  // 11
      expect(lateDiff).toBeGreaterThan(earlyDiff)
    })
  })

  describe('preset integration', () => {
    it('normal preset turn 1 is deterministic', () => {
      expect(computeThreshold(1, PRESETS.normal)).toBe(computeThreshold(1, PRESETS.normal))
    })

    it('hard preset turn 1 > normal turn 1', () => {
      expect(computeThreshold(1, PRESETS.hard)).toBeGreaterThan(computeThreshold(1, PRESETS.normal))
    })

    it('nightmare preset turn 1 > hard turn 1', () => {
      expect(computeThreshold(1, PRESETS.nightmare)).toBeGreaterThan(computeThreshold(1, PRESETS.hard))
    })

    it('easy preset turn 1 < normal turn 1', () => {
      expect(computeThreshold(1, PRESETS.easy)).toBeLessThan(computeThreshold(1, PRESETS.normal))
    })

    it('boss turns (multiple of 5, not 20) exceed adjacent non-boss turns', () => {
      for (const preset of [PRESETS.easy, PRESETS.normal, PRESETS.hard, PRESETS.nightmare]) {
        for (const bossTurn of [5, 10, 15]) {
          const bossValue = computeThreshold(bossTurn, preset)
          const prevValue = computeThreshold(bossTurn - 1, preset)
          expect(bossValue).toBeGreaterThan(prevValue)
        }
      }
    })

    it('turn 20 uses finalBossMultiplier and exceeds turn 19', () => {
      for (const preset of [PRESETS.easy, PRESETS.normal, PRESETS.hard, PRESETS.nightmare]) {
        expect(computeThreshold(20, preset)).toBeGreaterThan(computeThreshold(19, preset))
      }
    })

    it('values are always positive integers for all turns 1-20', () => {
      for (const preset of [PRESETS.easy, PRESETS.normal, PRESETS.hard, PRESETS.nightmare]) {
        for (let turn = 1; turn <= 20; turn++) {
          const val = computeThreshold(turn, preset)
          expect(val).toBeGreaterThan(0)
          expect(Number.isInteger(val)).toBe(true)
        }
      }
    })
  })

  describe('determinism', () => {
    it('same inputs always produce identical output', () => {
      const weights = PRESETS.normal
      for (let turn = 1; turn <= 20; turn++) {
        expect(computeThreshold(turn, weights)).toBe(computeThreshold(turn, weights))
      }
    })
  })
})
