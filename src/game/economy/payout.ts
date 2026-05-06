export function calculatePayout(turn: number, lck: number): number {
  const base = 50 + (turn - 1) * 10
  return Math.floor(base * (1 + lck * 0.015))
}
