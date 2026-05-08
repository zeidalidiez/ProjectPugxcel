import { describe, it, expect } from 'vitest'
import { parseShareString, resolveWeightsForParsedShare } from '../../../src/game/save/deserialize'
import { PRESETS } from '../../../src/data/balance-presets'

describe('parseShareString', () => {
  describe('new format (4 parts with preset code)', () => {
    it('parses a normal preset share string', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/NM/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.archetype).toBe('elf')
        expect(result.data.seed).toBe('ABCD1234')
        expect(result.data.draftSeq).toBe('012')
        expect(result.data.presetId).toBe('normal')
      }
    })

    it('parses an easy preset share string', () => {
      const result = parseShareString('ANTIGRAV/SPRGK-TESTABCD/EZ/0123')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.presetId).toBe('easy')
      }
    })

    it('parses a hard preset share string', () => {
      const result = parseShareString('ANTIGRAV/VAMP-DEADBEEF/HD/01')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.presetId).toBe('hard')
      }
    })

    it('parses a nightmare preset share string', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCDEFGH/NT/0')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.presetId).toBe('nightmare')
      }
    })

    it('parses a custom preset share string (CS-XXXX)', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/CS-ABCD/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.presetId).toBe('custom')
      }
    })

    it('treats unknown preset code as normal (forward compat)', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/XX/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.presetId).toBe('normal')
      }
    })
  })

  describe('legacy format (3 parts, no preset code)', () => {
    it('parses legacy format and defaults to normal preset', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.archetype).toBe('elf')
        expect(result.data.seed).toBe('ABCD1234')
        expect(result.data.draftSeq).toBe('012')
        expect(result.data.presetId).toBe('normal')
      }
    })

    it('parses SPRGK legacy format', () => {
      const result = parseShareString('ANTIGRAV/SPRGK-TESTTEST/0A1B')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.archetype).toBe('sporgk')
      }
    })

    it('parses VAMP legacy format', () => {
      const result = parseShareString('ANTIGRAV/VAMP-DEADBEE1/01234')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.archetype).toBe('vampire')
      }
    })
  })

  describe('error cases', () => {
    it('returns malformed for empty string', () => {
      const result = parseShareString('')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.kind).toBe('malformed')
    })

    it('returns malformed for wrong prefix', () => {
      const result = parseShareString('GRAVITY/ELF-ABCD1234/012')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.kind).toBe('malformed')
    })

    it('returns invalid_archetype for unknown arch code', () => {
      const result = parseShareString('ANTIGRAV/XXX-ABCD1234/NM/012')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.kind).toBe('invalid_archetype')
    })

    it('returns too_long for draft seq > 40 chars', () => {
      const longDraft = '0'.repeat(41)
      const result = parseShareString(`ANTIGRAV/ELF-ABCD1234/NM/${longDraft}`)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.kind).toBe('too_long')
    })

    it('returns malformed for missing dash in segment 2', () => {
      const result = parseShareString('ANTIGRAV/ELFABCD1234/NM/012')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.kind).toBe('malformed')
    })
  })

  describe('resolveWeightsForParsedShare', () => {
    it('resolves normal preset weights', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/NM/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        const weights = resolveWeightsForParsedShare(result.data)
        expect(weights).toEqual(PRESETS.normal)
      }
    })

    it('resolves nightmare preset weights', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/NT/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        const weights = resolveWeightsForParsedShare(result.data)
        expect(weights).toEqual(PRESETS.nightmare)
      }
    })

    it('falls back to normal weights for custom preset', () => {
      const result = parseShareString('ANTIGRAV/ELF-ABCD1234/CS-ABCD/012')
      expect(result.ok).toBe(true)
      if (result.ok) {
        const weights = resolveWeightsForParsedShare(result.data)
        expect(weights).toEqual(PRESETS.normal)
      }
    })
  })
})
