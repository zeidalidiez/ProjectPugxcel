import type { SaveState, CodexState, SettingsState, MetaState } from '../../types/save'
import { validateSave } from './schemas'

const SAVE_KEY = 'antigravity_save'

const DEFAULT_SETTINGS: SettingsState = {
  fontSize: 125,
  reducedMotion: false,
  uncertaintyMode: false,
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.4,
}

const DEFAULT_CODEX: CodexState = {
  unlockedModifiers: [],
  completedRuns: [],
  achievements: [],
  builds: [],
}

export function saveToDisk(state: SaveState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function loadFromDisk(): SaveState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return validateSave(parsed)
  } catch {
    return null
  }
}

export function saveCodex(codex: CodexState): void {
  const existing = loadFromDisk()
  if (existing) {
    saveToDisk({ ...existing, codex })
  } else {
    saveToDisk({
      version: 1,
      run: null,
      codex,
      settings: DEFAULT_SETTINGS,
    })
  }
}

export function loadCodex(): CodexState {
  const save = loadFromDisk()
  return save?.codex ?? DEFAULT_CODEX
}

export function saveSettings(settings: SettingsState): void {
  const existing = loadFromDisk()
  if (existing) {
    saveToDisk({ ...existing, settings })
  } else {
    saveToDisk({
      version: 1,
      run: null,
      codex: DEFAULT_CODEX,
      settings,
    })
  }
}

export function loadSettings(): SettingsState | null {
  const save = loadFromDisk()
  return save?.settings ?? null
}

export function saveMeta(meta: MetaState): void {
  const existing = loadFromDisk()
  if (existing) {
    saveToDisk({ ...existing, meta: { ...existing.meta, ...meta } })
  } else {
    saveToDisk({
      version: 1,
      run: null,
      codex: DEFAULT_CODEX,
      settings: DEFAULT_SETTINGS,
      meta,
    })
  }
}

export function loadMeta(): MetaState | null {
  const save = loadFromDisk()
  return save?.meta ?? null
}
