import { useState } from 'react'
import { useGameStore } from '../store'
import { Archetype } from '../types/enums'
import { useSeed } from '../hooks/useSeed'
import { parseShareString } from '../game/save/deserialize'
import CodexModal from './CodexModal'

const ARCHETYPES = [
  {
    key: Archetype.SPORGK,
    name: 'Sporgk',
    subtitle: 'The Asteroid Barbarian',
    description: 'Brutal raiders wielding rocket-greataxes. STR + STA. Brute force.',
    color: 'bg-terminal-sporgk',
    border: 'border-terminal-sporgk',
  },
  {
    key: Archetype.ELF,
    name: 'Space Pug Elf',
    subtitle: 'The Crystalline Star-Farer',
    description: 'Graceful ancients on crystal galleons. AGI + LCK. Weak-then-exponential.',
    color: 'bg-terminal-elf',
    border: 'border-terminal-elf',
  },
  {
    key: Archetype.VAMPIRE,
    name: 'Space Pug Vampire',
    subtitle: 'The Void Lord',
    description: 'Gothic undead in cathedral-ships. INT + STA. Synergy puzzle.',
    color: 'bg-terminal-vampire',
    border: 'border-terminal-vampire',
  },
]

export default function ArchetypeSelect({ onReplay }: { onReplay: (share: string) => void }) {
  const startRun = useGameStore((s) => s.startRun)
  const { dailySeed } = useSeed()
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [codexOpen, setCodexOpen] = useState(false)
  const [shareInput, setShareInput] = useState('')
  const [shareError, setShareError] = useState('')

  function handleSelect(archetype: Archetype) {
    startRun(dailySeed, archetype)
  }

  function handleReplay() {
    const parsed = parseShareString(shareInput.trim())
    if (!parsed) {
      setShareError('Invalid share string')
      return
    }
    const validArches = ['SPRGK', 'ELF', 'VAMP']
    if (!validArches.includes(parsed.archetype)) {
      setShareError('Unknown archetype in share string')
      return
    }
    setShareError('')
    onReplay(shareInput.trim())
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-12 relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-terminal-text-bright tracking-widest mb-2">
          PROJECT ANTIGRAVITY
        </h1>
        <p className="text-terminal-text text-sm">Choose your archetype</p>
      </div>

      <div className="flex gap-6 max-w-4xl w-full justify-center flex-wrap">
        {ARCHETYPES.map((arch) => (
          <button
            key={arch.key}
            onClick={() => handleSelect(arch.key)}
            className={`
              flex flex-col items-center text-center gap-4 rounded-lg border-2 border-terminal-border
              bg-terminal-surface hover:border-terminal-accent transition-colors
              w-72 cursor-pointer focus-visible:ring-2 focus-visible:ring-terminal-accent
            `}
            style={{ padding: '28px' }}
            aria-label={`Select ${arch.name}`}
          >
            <div className={`w-5 h-5 rounded-full ${arch.color} flex-shrink-0`} style={{ marginBottom: '4px' }} />
            <div>
              <div className="text-terminal-text-bright font-bold text-lg">{arch.name}</div>
              <div className="text-terminal-text text-xs">{arch.subtitle}</div>
            </div>
            <p className="text-terminal-text text-sm leading-relaxed">{arch.description}</p>
          </button>
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
    </div>
  )
}
