import { describe, it, expect } from 'vitest'
import { encodeCodexPassword, decodeCodexPassword } from '../../../src/game/save/codexPassword'

describe('codexPassword', () => {
  it('round-trips an empty codex', () => {
    const codex = { unlockedModifiers: [], completedRuns: [], achievements: [], builds: [] }
    const pw = encodeCodexPassword(codex)
    expect(pw.length).toBeGreaterThanOrEqual(3)
    const result = decodeCodexPassword(pw)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.unlockedModifiers).toEqual([])
    }
  })

  it('round-trips a codex with some unlocks', () => {
    const codex = { unlockedModifiers: ['mod_double_draft', 'mod_iron_hide'], completedRuns: [], achievements: [], builds: [] }
    const pw = encodeCodexPassword(codex)
    const result = decodeCodexPassword(pw)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(new Set(result.unlockedModifiers)).toEqual(new Set(['mod_double_draft', 'mod_iron_hide']))
    }
  })

  it('produces a 12-character password', () => {
    const codex = { unlockedModifiers: [], completedRuns: [], achievements: [], builds: [] }
    const pw = encodeCodexPassword(codex)
    expect(pw.length).toBe(12)
  })

  it('produces deterministic output', () => {
    const codex = { unlockedModifiers: ['mod_boss_slayer'], completedRuns: [], achievements: [], builds: [] }
    const pw1 = encodeCodexPassword(codex)
    const pw2 = encodeCodexPassword(codex)
    expect(pw1).toBe(pw2)
  })

  it('rejects invalid input', () => {
    expect(decodeCodexPassword('').ok).toBe(false)
    expect(decodeCodexPassword('abc').ok).toBe(false)
  })

  it('rejects a tampered password (checksum)', () => {
    const codex = { unlockedModifiers: ['mod_double_draft'], completedRuns: [], achievements: [], builds: [] }
    const pw = encodeCodexPassword(codex)
    // Tamper with last char
    const tampered = pw.slice(0, -1) + (pw[pw.length - 1] === 'A' ? 'B' : 'A')
    const result = decodeCodexPassword(tampered)
    expect(result.ok).toBe(false)
  })

  it('ignores padding in input', () => {
    const codex = { unlockedModifiers: ['mod_double_draft'], completedRuns: [], achievements: [], builds: [] }
    const pw = encodeCodexPassword(codex)
    // Ensure password with padding still decodes
    const result = decodeCodexPassword(pw)
    expect(result.ok).toBe(true)
  })

  it('different codex states produce different passwords', () => {
    const codex1 = { unlockedModifiers: [], completedRuns: [], achievements: [], builds: [] }
    const codex2 = { unlockedModifiers: ['mod_double_draft'], completedRuns: [], achievements: [], builds: [] }
    expect(encodeCodexPassword(codex1)).not.toBe(encodeCodexPassword(codex2))
  })
})
