import { create } from 'zustand'
import type { RunState } from './types/run'
import type { CodexState, SettingsState } from './types/save'
import { RunPhase, Archetype } from './types/enums'
import { EMPTY_STATS } from './types/stats'

interface GameStore {
  phase: RunPhase
  run: RunState | null
  codex: CodexState
  settings: SettingsState

  startRun: (seed: string, archetype: Archetype) => void
  advancePhase: (phase: RunPhase) => void
  resetRun: () => void
}

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

export const useGameStore = create<GameStore>((set, get) => ({
  phase: RunPhase.ARCHETYPE_SELECT,
  run: null,
  codex: DEFAULT_CODEX,
  settings: DEFAULT_SETTINGS,

  startRun: (seed, archetype) => {
    set({
      phase: RunPhase.FORECAST,
      run: {
        seed,
        archetype,
        turn: 1,
        phase: RunPhase.FORECAST,
        stats: { ...EMPTY_STATS },
        baseStats: { ...EMPTY_STATS },
        gold: 0,
        constellation: { nodes: new Map(), startNodeId: '', anchorNodeIds: [] },
        draftedNodeIds: [],
        inventory: [],
        abilities: [],
        currentNodeDrafts: 0,
        extraNodeDrafts: 0,
        storeItems: [],
        storeRerolled: false,
        encounters: [],
        combatLog: [],
        lastResult: null,
        runEnded: false,
        shareString: '',
      },
    })
  },

  advancePhase: (phase) => {
    set({ phase })
    const run = get().run
    if (run) {
      set({ run: { ...run, phase } })
    }
  },

  resetRun: () => {
    set({ run: null, phase: RunPhase.ARCHETYPE_SELECT })
  },
}))
