import { Archetype, ARCHETYPE_VALUES } from '../../types/enums'

const REV_ARCH_MAP: Record<string, string> = {
  SPRGK: Archetype.SPORGK,
  ELF: Archetype.ELF,
  VAMP: Archetype.VAMPIRE,
}

export interface ParsedShare {
  archetype: string
  seed: string
  draftSeq: string
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

  const draftSeq = parts.slice(2).join('/')

  if (draftSeq.length > 40) {
    return { ok: false, error: { kind: 'too_long', length: draftSeq.length, max: 40 } }
  }

  return {
    ok: true,
    data: {
      archetype,
      seed: seed8,
      draftSeq,
    },
  }
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
