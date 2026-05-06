import { useGameStore } from '../store'
import { Archetype } from '../types/enums'
import { useSeed } from '../hooks/useSeed'

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

export default function ArchetypeSelect() {
  const startRun = useGameStore((s) => s.startRun)
  const { dailySeed } = useSeed()

  function handleSelect(archetype: Archetype) {
    startRun(dailySeed, archetype)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
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
              flex flex-col gap-3 p-6 rounded-lg border-2 border-terminal-border
              bg-terminal-surface hover:border-terminal-accent transition-colors
              w-64 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-terminal-accent
            `}
            aria-label={`Select ${arch.name}`}
          >
            <div className={`w-4 h-4 rounded-full ${arch.color}`} />
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
    </div>
  )
}
