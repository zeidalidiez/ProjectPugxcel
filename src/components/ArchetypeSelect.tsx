import { useState } from 'react'
import { useGameStore } from '../store'
import { Archetype } from '../types/enums'
import { useSeed } from '../hooks/useSeed'
import { parseShareString, messageForError } from '../game/save/deserialize'
import CodexModal from './CodexModal'
import DifficultySelect from './DifficultySelect'
import CustomDifficultyPanel from './CustomDifficultyPanel'

const ARCHETYPES = [
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
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
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
    <div className="h-full flex flex-col items-center justify-center gap-8 p-12 relative">
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
            <button
              onClick={() => handleSelect(arch.key)}
              onMouseEnter={() => document.documentElement.setAttribute('data-archetype', arch.key.toLowerCase())}
              onMouseLeave={() => document.documentElement.removeAttribute('data-archetype')}
              className="flex flex-col items-center text-center gap-5 rounded-lg border-2 border-terminal-border hover:border-terminal-accent transition-all flex-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-terminal-accent"
              style={{ padding: '36px 28px', backgroundColor: arch.bgTint, borderColor: 'var(--accent)', borderWidth: '1px' }}
              aria-label={`Select ${arch.name}`}
            >
              <div>
                <div className="text-terminal-text-bright font-bold text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{arch.name}</div>
                <div className="text-terminal-text text-sm mt-1">{arch.subtitle}</div>
              </div>
              <p className="text-terminal-text text-sm leading-relaxed max-w-sm">{arch.description}</p>
              <div className="flex gap-2">
                {arch.key === Archetype.SPORGK && (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>STR</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>STA</span>
                  </>
                )}
                {arch.key === Archetype.ELF && (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>AGI</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>LCK</span>
                  </>
                )}
                {arch.key === Archetype.VAMPIRE && (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>INT</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>STA</span>
                  </>
                )}
              </div>
            </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setSettingsOpen(false)}>
          <div className="bg-terminal-surface border border-terminal-accent rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-terminal-text-bright text-lg font-bold mb-4 tracking-wider">SETTINGS</h2>

            <div className="mb-5">
              <div className="text-terminal-text text-xs mb-2 uppercase tracking-widest">Font Size</div>
              <div className="flex gap-2">
                {([100, 125, 150] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSettings({ fontSize: s })}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                      settings.fontSize === s
                        ? 'bg-terminal-accent text-black font-bold'
                        : 'border border-terminal-border text-terminal-text hover:border-terminal-accent'
                    }`}
                    aria-label={`Font size ${s}%`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'Sound', key: 'soundEnabled' as const },
                { label: 'Music', key: 'musicEnabled' as const },
                { label: 'Uncertainty Mode', key: 'uncertaintyMode' as const },
                { label: 'Reduced Motion', key: 'reducedMotion' as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-terminal-text text-xs">{label}</span>
                  <button
                    onClick={() => updateSettings({ [key]: !settings[key] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings[key] ? 'bg-terminal-accent' : 'bg-terminal-border'
                    }`}
                    role="switch"
                    aria-checked={settings[key]}
                    aria-label={`Toggle ${label}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings[key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2 rounded bg-terminal-accent text-black text-sm font-bold hover:bg-terminal-accent/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {codexOpen && <CodexModal onClose={() => setCodexOpen(false)} />}
      {customPanelOpen && <CustomDifficultyPanel onClose={() => setCustomPanelOpen(false)} />}
    </div>
  )
}
