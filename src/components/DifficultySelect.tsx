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
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
      <div className="text-terminal-text text-xs uppercase tracking-widest mb-1">Difficulty</div>
      <div className="flex gap-2 flex-wrap justify-center">
        {PRESET_IDS.map((id) => {
          const display = PRESET_DISPLAY[id]
          const isSelected = selectedPresetId === id
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded border text-xs transition-colors focus-visible:ring-2 focus-visible:ring-terminal-accent ${
                isSelected
                  ? 'border-terminal-accent bg-terminal-accent/10 text-terminal-text-bright'
                  : 'border-terminal-border bg-terminal-surface text-terminal-text hover:border-terminal-accent/60'
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${display.label} difficulty`}
            >
              <span className="font-bold tracking-wider">{display.label}</span>
              <span className="text-terminal-text/60 text-[10px] leading-tight">{display.sub}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
