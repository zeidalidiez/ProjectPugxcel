import { useState, lazy, Suspense } from 'react'
import { useGameStore } from '../store'
import { Archetype } from '../types/enums'
import { useSeed } from '../hooks/useSeed'
import { parseShareString, messageForError } from '../game/save/deserialize'
import DifficultySelect from './DifficultySelect'
import ArchetypeCard from './ArchetypeCard'
import type { ArchetypeCardData } from './ArchetypeCard'

const CodexModal = lazy(() => import('./CodexModal'))
const CustomDifficultyPanel = lazy(() => import('./CustomDifficultyPanel'))
const SettingsModal = lazy(() => import('./SettingsModal'))

const ARCHETYPES: ArchetypeCardData[] = [
  {
    key: Archetype.SPORGK,
    name: 'Sporgk',
    subtitle: 'The Asteroid Barbarian',
    description: 'Brutal raiders wielding rocket-greataxes. STR + STA. Brute force.',
    accentClass: 'bg-terminal-sporgk',
    borderClass: 'border-terminal-sporgk',
    bgTint: 'rgba(251, 146, 60, 0.08)',
  },
  {
    key: Archetype.ELF,
    name: 'Space Pug Elf',
    subtitle: 'The Crystalline Star-Farer',
    description: 'Graceful ancients on crystal galleons. AGI + LCK. Weak-then-exponential.',
    accentClass: 'bg-terminal-elf',
    borderClass: 'border-terminal-elf',
    bgTint: 'rgba(34, 211, 238, 0.08)',
  },
  {
    key: Archetype.VAMPIRE,
    name: 'Space Pug Vampire',
    subtitle: 'The Void Lord',
    description: 'Gothic undead in cathedral-ships. INT + STA. Synergy puzzle.',
    accentClass: 'bg-terminal-vampire',
    borderClass: 'border-terminal-vampire',
    bgTint: 'rgba(168, 85, 247, 0.08)',
  },
]

export default function ArchetypeSelect({ onReplay }: { onReplay: (share: string) => void }) {
  const startRun = useGameStore((s) => s.startRun)
  const { dailySeed } = useSeed()
  const balanceWeights = useGameStore((s) => s.balanceWeights)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [codexOpen, setCodexOpen] = useState(false)
  const [customPanelOpen, setCustomPanelOpen] = useState(false)
  const [shareInput, setShareInput] = useState('')
  const [shareError, setShareError] = useState('')
  const [carouselIdx, setCarouselIdx] = useState(0)

  function handleSelect(archetype: Archetype) {
    startRun(dailySeed, archetype, balanceWeights)
  }

  function handleReplay() {
    const result = parseShareString(shareInput.trim())
    if (!result.ok) {
      setShareError(messageForError(result.error))
      return
    }
    const validArches = ['SPRGK', 'ELF', 'VAMP']
    if (!validArches.includes(result.data.archetype)) {
      setShareError('Unknown archetype in share string')
      return
    }
    setShareError('')
    onReplay(shareInput.trim())
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-6 sm:p-12 relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-terminal-text-bright tracking-widest mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          PROJECT ANTIGRAVITY
        </h1>
        <p className="text-terminal-text text-sm">Choose your archetype</p>
      </div>

      <DifficultySelect onCustomClick={() => setCustomPanelOpen(true)} />

      <div className="flex items-center gap-4 max-w-xl w-full">
        <button
          onClick={() => setCarouselIdx((i) => (i - 1 + ARCHETYPES.length) % ARCHETYPES.length)}
          className="w-10 h-10 flex items-center justify-center rounded border border-terminal-border text-terminal-text/60 hover:text-terminal-text-bright hover:border-terminal-accent transition-colors flex-shrink-0"
          aria-label="Previous archetype"
        >
          ‹
        </button>

        {(() => {
          const arch = ARCHETYPES[carouselIdx]
          return (
            <ArchetypeCard
              key={arch.key}
              arch={arch}
              onSelect={handleSelect}
            />
          )
        })()}

        <button
          onClick={() => setCarouselIdx((i) => (i + 1) % ARCHETYPES.length)}
          className="w-10 h-10 flex items-center justify-center rounded border border-terminal-border text-terminal-text/60 hover:text-terminal-text-bright hover:border-terminal-accent transition-colors flex-shrink-0"
          aria-label="Next archetype"
        >
          ›
        </button>
      </div>

      <div className="flex gap-2">
        {ARCHETYPES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCarouselIdx(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === carouselIdx ? 'bg-terminal-accent' : 'bg-terminal-border'}`}
            aria-label={`Go to archetype ${i + 1}`}
          />
        ))}
      </div>

      <p className="text-terminal-text text-xs">
        Daily Seed: <span className="text-terminal-accent font-mono">{dailySeed}</span>
      </p>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={shareInput}
          onChange={(e) => { setShareInput(e.target.value); setShareError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleReplay() }}
          placeholder="Paste share string to replay..."
          className="px-3 py-1.5 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs w-64 font-mono outline-none focus:border-terminal-accent"
          aria-label="Share string input"
        />
        <button
          onClick={handleReplay}
          disabled={!shareInput.trim()}
          className="px-3 py-1.5 rounded border border-terminal-accent text-terminal-accent text-xs hover:bg-terminal-accent/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Replay
        </button>
      </div>
      {shareError && <p className="text-terminal-fail text-xs">{shareError}</p>}

      <button
        onClick={() => setCodexOpen(true)}
        className="absolute bottom-4 left-4 px-3 py-1.5 rounded border border-terminal-border text-terminal-text/60 text-xs hover:text-terminal-text-bright hover:border-terminal-accent transition-colors"
        aria-label="Open Codex"
      >
        Codex
      </button>

      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute bottom-4 right-4 px-3 py-1.5 rounded border border-terminal-border text-terminal-text/60 text-xs hover:text-terminal-text-bright hover:border-terminal-accent transition-colors"
        aria-label="Open Settings"
      >
        Settings
      </button>

      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        </Suspense>
      )}
      {codexOpen && (
        <Suspense fallback={null}>
          <CodexModal onClose={() => setCodexOpen(false)} />
        </Suspense>
      )}
      {customPanelOpen && (
        <Suspense fallback={null}>
          <CustomDifficultyPanel onClose={() => setCustomPanelOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
