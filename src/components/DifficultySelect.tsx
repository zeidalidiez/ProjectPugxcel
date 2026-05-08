import type { DifficultyPresetId } from '../types/balance'
import { PRESET_DISPLAY } from '../data/balance-presets'
import { useGameStore } from '../store'

interface DifficultySelectProps {
  onCustomClick: () => void
}

const PRESET_IDS: DifficultyPresetId[] = ['easy', 'normal', 'hard', 'nightmare', 'custom']

export default function DifficultySelect({ onCustomClick }: DifficultySelectProps) {
  const selectedPresetId = useGameStore((s) => s.selectedPresetId)
  const setDifficulty = useGameStore((s) => s.setDifficulty)

  function handleSelect(id: DifficultyPresetId) {
    if (id === 'custom') {
      onCustomClick()
      return
    }
    setDifficulty(id)
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-3xl">
      <div className="text-terminal-text text-xs uppercase tracking-widest">Difficulty</div>
      <div className="flex gap-1.5 w-full justify-center">
        {PRESET_IDS.map((id) => {
          const display = PRESET_DISPLAY[id]
          const isSelected = selectedPresetId === id
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-28 h-16 rounded border text-xs transition-colors focus-visible:ring-2 focus-visible:ring-terminal-accent ${
                isSelected
                  ? 'border-terminal-accent bg-terminal-accent/15 text-terminal-text-bright shadow-[inset_0_0_12px_var(--accent-glow)]'
                  : 'border-terminal-border bg-terminal-surface text-terminal-text hover:border-terminal-accent/40'
              }`}
              aria-pressed={isSelected}
              aria-label={`${display.label} difficulty`}
            >
              <span className="font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', fontSize: '11px' }}>
                {display.label.toUpperCase()}
              </span>
              <span className="text-terminal-text/50 text-[9px] leading-tight font-mono">{display.sub}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
