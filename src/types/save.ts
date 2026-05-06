import type { Archetype } from './enums'

export interface CompletedRun {
  id: string
  seed: string
  archetype: Archetype
  turnReached: number
  passed: boolean
  deficitOrMargin: number
  draftedNodeIds: string[]
  shareString: string
  timestamp: number
}

export interface SavedBuild {
  name: string
  runId: string
}

export interface CodexState {
  unlockedModifiers: string[]
  completedRuns: CompletedRun[]
  achievements: string[]
  builds: SavedBuild[]
}

export interface SettingsState {
  fontSize: 100 | 125 | 150
  reducedMotion: boolean
  uncertaintyMode: boolean
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
}

export interface SaveState {
  version: number
  run: unknown
  codex: CodexState
  settings: SettingsState
}
