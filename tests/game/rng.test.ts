import { describe, it, expect } from 'vitest'
import { createRNG } from '../../src/game/rng/create'

describe('createRNG', () => {
  it('produces consistent sequences for the same seed', () => {
    const rng1 = createRNG('test-seed-123')
    const rng2 = createRNG('test-seed-123')

    const seq1 = Array.from({ length: 20 }, () => rng1.next())
    const seq2 = Array.from({ length: 20 }, () => rng2.next())

    expect(seq1).toEqual(seq2)
  })

  it('produces different sequences for different seeds', () => {
    const rng1 = createRNG('seed-a')
    const rng2 = createRNG('seed-b')

    const val1 = rng1.next()
    const val2 = rng2.next()

    expect(val1).not.toBe(val2)
  })

  it('next() returns values in [0, 1)', () => {
    const rng = createRNG('bounds-test')
    for (let i = 0; i < 1000; i++) {
      const val = rng.next()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('nextInt() returns integers in [min, max]', () => {
    const rng = createRNG('int-test')
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 10)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThanOrEqual(10)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('shuffle() does not mutate the original array', () => {
    const rng = createRNG('shuffle')
    const original = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(original)
    expect(original).toEqual([1, 2, 3, 4, 5])
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('pick() returns an element from the array', () => {
    const rng = createRNG('pick')
    const arr = ['a', 'b', 'c']
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(rng.pick(arr))
    }
  })

  it('getState() is consistent with same seed', () => {
    const rng1 = createRNG('state')
    const rng2 = createRNG('state')
    rng1.next()
    rng2.next()
    expect(rng1.getState()).toBe(rng2.getState())
  })
})
