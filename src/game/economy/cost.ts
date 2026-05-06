export function applyDiscount(baseCost: number, lck: number): number {
  const discounted = Math.floor(baseCost * (1 - lck * 0.015))
  return Math.max(discounted, Math.floor(baseCost * 0.5))
}
