export function calculateThreshold(turn: number): number {
  const threshold = Math.floor(20 * Math.pow(1.18, turn - 1))
  if (turn % 5 === 0) {
    return Math.floor(threshold * 1.5)
  }
  return threshold
}
