import { describe, it, expect } from 'vitest'
import { calculatePayout } from '../../src/game/economy/payout'
import { PRESETS } from '../../src/data/balance-presets'

describe('applyWeights economy integration', () => {
  describe('calculatePayout with perTurnPayoutMultiplier', () => {
    it('multiplier=1.0 matches baseline (backwards compatible)', () => {
      const base = calculatePayout(1, 0, 1.0)
      const legacy = calculatePayout(1, 0)
      expect(base).toBe(legacy)
    })

    it('easy preset multiplier increases payout', () => {
      const normal = calculatePayout(5, 0, PRESETS.normal.perTurnPayoutMultiplier)
      const easy = calculatePayout(5, 0, PRESETS.easy.perTurnPayoutMultiplier)
      expect(easy).toBeGreaterThan(normal)
    })

    it('nightmare preset multiplier decreases payout', () => {
      const normal = calculatePayout(5, 0, PRESETS.normal.perTurnPayoutMultiplier)
      const nightmare = calculatePayout(5, 0, PRESETS.nightmare.perTurnPayoutMultiplier)
      expect(nightmare).toBeLessThan(normal)
    })

    it('lck still scales payout with multiplier', () => {
      const noLuck = calculatePayout(5, 0, 1.0)
      const withLuck = calculatePayout(5, 10, 1.0)
      expect(withLuck).toBeGreaterThan(noLuck)
    })

    it('multiplier and lck compound multiplicatively', () => {
      const lck = 10
      const mult = 1.2
      const turn = 5
      const base = 50 + (turn - 1) * 10  // 90
      const expected = Math.floor(base * (1 + lck * 0.015) * mult)
      expect(calculatePayout(turn, lck, mult)).toBe(expected)
    })

    it('result is always a non-negative integer', () => {
      for (const preset of [PRESETS.easy, PRESETS.normal, PRESETS.hard, PRESETS.nightmare]) {
        for (let turn = 1; turn <= 20; turn++) {
          const val = calculatePayout(turn, 0, preset.perTurnPayoutMultiplier)
          expect(val).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(val)).toBe(true)
        }
      }
    })
  })

  describe('startingGoldMultiplier values by preset', () => {
    it('easy has higher starting gold than normal', () => {
      expect(PRESETS.easy.startingGoldMultiplier).toBeGreaterThan(PRESETS.normal.startingGoldMultiplier)
    })

    it('hard has lower starting gold than normal', () => {
      expect(PRESETS.hard.startingGoldMultiplier).toBeLessThan(PRESETS.normal.startingGoldMultiplier)
    })

    it('nightmare has lower starting gold than hard', () => {
      expect(PRESETS.nightmare.startingGoldMultiplier).toBeLessThan(PRESETS.hard.startingGoldMultiplier)
    })

    it('all presets have startingGoldMultiplier > 0', () => {
      for (const key of ['easy', 'normal', 'hard', 'nightmare'] as const) {
        expect(PRESETS[key].startingGoldMultiplier).toBeGreaterThan(0)
      }
    })
  })

  describe('poolSizeMultiplier values by preset', () => {
    it('nightmare has fewer pool items than normal', () => {
      expect(PRESETS.nightmare.poolSizeMultiplier).toBeLessThan(PRESETS.normal.poolSizeMultiplier)
    })

    it('normal multiplier = 1.0', () => {
      expect(PRESETS.normal.poolSizeMultiplier).toBe(1.0)
    })
  })

  describe('itemPowerMultiplier and nodePowerMultiplier', () => {
    it('easy gives item power boost', () => {
      expect(PRESETS.easy.itemPowerMultiplier).toBeGreaterThan(1.0)
    })

    it('nightmare gives reduced item power', () => {
      expect(PRESETS.nightmare.itemPowerMultiplier).toBeLessThan(1.0)
    })

    it('easy gives node power boost', () => {
      expect(PRESETS.easy.nodePowerMultiplier).toBeGreaterThan(1.0)
    })

    it('nightmare gives reduced node power', () => {
      expect(PRESETS.nightmare.nodePowerMultiplier).toBeLessThan(1.0)
    })
  })
})
