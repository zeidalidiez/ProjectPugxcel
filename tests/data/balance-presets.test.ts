import { describe, it, expect } from 'vitest'
import { PRESETS } from '../../src/data/balance-presets'
import { BalanceWeightsSchema } from '../../src/types/balance'
import { computeThreshold } from '../../src/game/balance/computeThreshold'

describe('balance-presets', () => {
  it('all 4 preset weights pass Zod validation', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      const result = BalanceWeightsSchema.safeParse(preset)
      expect(result.success, `Preset ${key} failed validation`).toBe(true)
    }
  })

  it('Easy turn-1 threshold < Normal < Hard < Nightmare', () => {
    const easy = computeThreshold(1, PRESETS.easy)
    const normal = computeThreshold(1, PRESETS.normal)
    const hard = computeThreshold(1, PRESETS.hard)
    const nightmare = computeThreshold(1, PRESETS.nightmare)
    expect(easy).toBeLessThan(normal)
    expect(normal).toBeLessThan(hard)
    expect(hard).toBeLessThan(nightmare)
  })

  it('all presets produce thresholds within sensible bounds turns 1-20', () => {
    for (const [_key, preset] of Object.entries(PRESETS)) {
      for (let turn = 1; turn <= 20; turn++) {
        const threshold = computeThreshold(turn, preset)
        expect(threshold).toBeGreaterThan(0)
        expect(threshold).toBeLessThan(10000)
      }
    }
  })

  it('boss turns produce higher thresholds than adjacent turns', () => {
    for (const [_key, preset] of Object.entries(PRESETS)) {
      const boss5 = computeThreshold(5, preset)
      const turn4 = computeThreshold(4, preset)
      const turn6 = computeThreshold(6, preset)
      expect(boss5).toBeGreaterThan(turn4)
      expect(boss5).toBeGreaterThan(turn6)
    }
  })

  it('final boss (turn 20) uses finalBossMultiplier, not bossMultiplier', () => {
    const normal = PRESETS.normal
    const turn20 = computeThreshold(20, normal)
    const turn15 = computeThreshold(15, normal)
    expect(normal.finalBossMultiplier).toBeGreaterThan(normal.bossMultiplier)
    expect(turn20).toBeGreaterThan(turn15)
  })
})
