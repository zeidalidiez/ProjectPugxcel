import seedrandom from 'seedrandom'
import type { PRNG } from '../../types/rng'

export function createRNG(seed: string): PRNG {
  const instance = seedrandom(seed)

  function next(): number {
    return instance()
  }

  return {
    next,

    nextInt(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min
    },

    pick<T>(arr: T[]): T {
      return arr[Math.floor(next() * arr.length)]
    },

    shuffle<T>(arr: T[]): T[] {
      const result = [...arr]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    },

    getState(): string {
      return String(instance)
    },
  }
}
