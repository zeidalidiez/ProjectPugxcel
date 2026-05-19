import { codexModifiers } from '../../data/codex/modifiers'
import type { CodexState } from '../../types/save'

const VERSION = 'A'
const PASSWORD_LENGTH = 12
const BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function charToByte(c: string): number {
  const idx = BASE64URL.indexOf(c)
  if (idx === -1) throw new Error(`Invalid password character: ${c}`)
  return idx
}

function byteToChar(b: number): string {
  return BASE64URL[b & 63]
}

function encodeBitfield(unlocked: Set<string>): string {
  // Build bitfield: bit N = 1 if modifier at index N is unlocked
  const bits: number[] = []
  for (let i = 0; i < codexModifiers.length; i++) {
    bits.push(unlocked.has(codexModifiers[i].id) ? 1 : 0)
  }
  // Pad to multiple of 6 for base64 encoding
  while (bits.length % 6 !== 0) bits.push(0)
  // Encode each 6-bit group
  let result = ''
  for (let i = 0; i < bits.length; i += 6) {
    let val = 0
    for (let j = 0; j < 6; j++) {
      val = (val << 1) | bits[i + j]
    }
    result += byteToChar(val)
  }
  return result
}

function decodeBitfield(encoded: string): Set<string> {
  const unlocked = new Set<string>()
  let bitIdx = 0
  for (const c of encoded) {
    const val = charToByte(c)
    for (let j = 5; j >= 0; j--) {
      if (bitIdx >= codexModifiers.length) return unlocked
      if ((val >> j) & 1) {
        unlocked.add(codexModifiers[bitIdx].id)
      }
      bitIdx++
    }
  }
  return unlocked
}

function checksum(s: string): string {
  let sum = 0
  for (let i = 0; i < s.length; i++) {
    sum += s.charCodeAt(i)
  }
  return byteToChar(sum % 64)
}

export function encodeCodexPassword(codex: CodexState): string {
  const unlocked = new Set(codex.unlockedModifiers)
  const bitfield = encodeBitfield(unlocked)
  const payload = VERSION + bitfield
  const chk = checksum(payload)
  let password = payload + chk
  // Pad to exactly PASSWORD_LENGTH
  while (password.length < PASSWORD_LENGTH) {
    password += '-'
  }
  return password
}

export function decodeCodexPassword(password: string): { ok: true; unlockedModifiers: string[] } | { ok: false; error: string } {
  // Strip padding
  const clean = password.replace(/-/g, '')
  if (clean.length < 3) {
    return { ok: false, error: 'Password too short' }
  }
  if (clean[0] !== VERSION) {
    return { ok: false, error: 'Unsupported password version' }
  }
  const payload = clean.slice(0, -1)
  const givenChecksum = clean[clean.length - 1]
  const expectedChecksum = checksum(payload)
  if (givenChecksum !== expectedChecksum) {
    return { ok: false, error: 'Invalid password (checksum mismatch)' }
  }
  const bitfield = payload.slice(1)
  const unlocked = decodeBitfield(bitfield)
  return { ok: true, unlockedModifiers: [...unlocked] }
}
