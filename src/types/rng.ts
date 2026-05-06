export interface PRNG {
  next(): number
  nextInt(min: number, max: number): number
  pick<T>(arr: T[]): T
  shuffle<T>(arr: T[]): T[]
  getState(): string
}
