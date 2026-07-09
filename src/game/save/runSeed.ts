import type { Archetype } from '../../types/enums'

/**
 * Canonical seed form used in share strings and RNG envelopes.
 * Matches encodeShareString truncation so live play and replay agree.
 */
export function normalizeSeed(seed: string): string {
  const alpha = seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return alpha.slice(0, 8) || 'DEFAULT1'
}

/** Master RNG seed for constellation generation — live startRun and replay must match. */
export function constellationSeed(seed: string, archetype: Archetype | string): string {
  return `${normalizeSeed(seed)}_${archetype}`
}

/** Forecast / encounter seed slice for a turn. */
export function forecastSeed(seed: string, archetype: Archetype | string, turn: number): string {
  return `${normalizeSeed(seed)}_${archetype}_t${turn}_f`
}

/** Store roll seed slice for a turn. */
export function storeSeed(seed: string, archetype: Archetype | string, turn: number): string {
  return `${normalizeSeed(seed)}_${archetype}_t${turn}_s`
}

/** Execute / resolve seed slice for a turn. */
export function executeSeed(seed: string, archetype: Archetype | string, turn: number): string {
  return `${normalizeSeed(seed)}_${archetype}_t${turn}_ex`
}
