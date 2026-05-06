import { Archetype, ARCHETYPE_VALUES } from '../../types/enums'

const REV_ARCH_MAP: Record<string, string> = {
  SPRGK: Archetype.SPORGK,
  ELF: Archetype.ELF,
  VAMP: Archetype.VAMPIRE,
}

interface ParsedShare {
  archetype: string
  seed: string
  draftSeq: string
}

export function parseShareString(shareStr: string): ParsedShare | null {
  if (!shareStr || typeof shareStr !== 'string') return null

  const parts = shareStr.split('/')
  if (parts.length < 3) return null

  const gameTag = parts[0]
  if (gameTag !== 'ANTIGRAV') return null

  const segment2 = parts[1]
  const dashIdx = segment2.indexOf('-')
  if (dashIdx === -1) return null

  const archAbbr = segment2.slice(0, dashIdx)
  const seed8 = segment2.slice(dashIdx + 1)

  if (!seed8 || seed8.length === 0) return null

  const archetype = REV_ARCH_MAP[archAbbr]
  if (!archetype) return null

  if (!ARCHETYPE_VALUES.includes(archetype as typeof ARCHETYPE_VALUES[number])) return null

  const draftSeq = parts.slice(2).join('/')

  return {
    archetype,
    seed: seed8,
    draftSeq,
  }
}
