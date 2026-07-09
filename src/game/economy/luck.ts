/** Crit chance from LCK (cap 50%), scaled by luckEfficacyMultiplier. */
export function critChanceFromLuck(lck: number, luckEfficacyMultiplier = 1.0): number {
  return Math.min(lck * 0.02 * luckEfficacyMultiplier, 0.5)
}
