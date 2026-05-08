import { Archetype, ARCHETYPE_VALUES } from '../../types/enums'
import type { DifficultyPresetId } from '../../types/balance'
import { PRESETS } from '../../data/balance-presets'

const REV_ARCH_MAP: Record<string, string> = {
  SPRGK: Archetype.SPORGK,
  ELF: Archetype.ELF,
  VAMP: Archetype.VAMPIRE,
}

const REV_PRESET_CODE: Record<string, Exclude<DifficultyPresetId, 'custom'>> = {
  EZ: 'easy',
  NM: 'normal',
  HD: 'hard',
  NT: 'nightmare',
}

export interface ParsedShare {
  archetype: string
  seed: string
  draftSeq: string
  presetId: DifficultyPresetId
}

export type DecodeError =
  | { kind: 'malformed'; message: string }
  | { kind: 'invalid_archetype'; archetype: string }
  | { kind: 'invalid_seed'; seed: string }
  | { kind: 'too_long'; length: number; max: number }
  | { kind: 'invalid_draft'; turn: number; symbol: string }

export type ParseResult =
  | { ok: true; data: ParsedShare }
  | { ok: false; error: DecodeError }

export function parseShareString(shareStr: string): ParseResult {
  if (!shareStr || typeof shareStr !== 'string') {
    return { ok: false, error: { kind: 'malformed', message: 'Empty or invalid input' } }
  }

  const parts = shareStr.split('/')
  if (parts.length < 3 || parts[0] !== 'ANTIGRAV') {
    return { ok: false, error: { kind: 'malformed', message: 'Invalid share string format' } }
  }

  const segment2 = parts[1]
  const dashIdx = segment2.indexOf('-')
  if (dashIdx === -1) {
    return { ok: false, error: { kind: 'malformed', message: 'Invalid seed segment' } }
  }

  const archAbbr = segment2.slice(0, dashIdx)
  const seed8 = segment2.slice(dashIdx + 1)

  if (!seed8 || seed8.length === 0) {
    return { ok: false, error: { kind: 'invalid_seed', seed: seed8 || 'empty' } }
  }

  const archetype = REV_ARCH_MAP[archAbbr]
  if (!archetype || !ARCHETYPE_VALUES.includes(archetype as typeof ARCHETYPE_VALUES[number])) {
    return { ok: false, error: { kind: 'invalid_archetype', archetype: archAbbr } }
  }

  // Determine if new format (4 parts: ANTIGRAV/ARCH-SEED/PRESET/DRAFT)
  // or legacy format (3 parts: ANTIGRAV/ARCH-SEED/DRAFT)
  let presetId: DifficultyPresetId = 'normal'
  let draftSeq: string

  if (parts.length >= 4) {
    // New format: parts[2] = preset code, parts[3..] = draft seq
    const presetSegment = parts[2]
    draftSeq = parts.slice(3).join('/')

    if (presetSegment.startsWith('CS-')) {
      // Custom weights — we can't recover full weights from hash alone, use normal as fallback
      presetId = 'custom'
    } else {
      const resolved = REV_PRESET_CODE[presetSegment]
      if (resolved) {
        presetId = resolved
      } else {
        // Unknown preset code — treat as normal (forward compat)
        presetId = 'normal'
      }
    }
  } else {
    // Legacy 3-part format: parts[2] = draft seq, assume normal preset
    draftSeq = parts.slice(2).join('/')
    presetId = 'normal'
  }

  if (draftSeq.length > 40) {
    return { ok: false, error: { kind: 'too_long', length: draftSeq.length, max: 40 } }
  }

  return {
    ok: true,
    data: {
      archetype,
      seed: seed8,
      draftSeq,
      presetId,
    },
  }
}

/** Resolve the BalanceWeights for a parsed share result. */
export function resolveWeightsForParsedShare(parsed: ParsedShare) {
  if (parsed.presetId === 'custom') {
    return PRESETS.normal // best fallback for custom when weights can't be recovered
  }
  return PRESETS[parsed.presetId as Exclude<DifficultyPresetId, 'custom'>]
}

export function messageForError(error: DecodeError): string {
  switch (error.kind) {
    case 'malformed':
      return '> couldn\'t read share string format'
    case 'invalid_archetype':
      return '> share string from an older version'
    case 'invalid_seed':
      return '> seed format unrecognized'
    case 'too_long':
      return `> share string too long (max ${error.max} characters)`
    case 'invalid_draft':
      return '> draft data corrupted'
  }
}
