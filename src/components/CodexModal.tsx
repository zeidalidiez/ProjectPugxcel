import { useGameStore } from '../store'
import { getModifierById } from '../data/codex/modifiers'
import { getAllChallenges } from '../data/codex/challenges'
import { Archetype } from '../types/enums'

const ARCH_LABELS: Record<string, string> = {
  [Archetype.SPORGK]: 'Sporgk',
  [Archetype.ELF]: 'Elf',
  [Archetype.VAMPIRE]: 'Vampire',
}

export default function CodexModal({ onClose }: { onClose: () => void }) {
  const codex = useGameStore((s) => s.codex)

  const unlockedMods = codex.unlockedModifiers
    .map((id) => getModifierById(id))
    .filter(Boolean)

  const challenges = getAllChallenges()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-terminal-surface border border-terminal-accent rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-terminal-text-bright text-lg font-bold tracking-wider">CODEX</h2>
          <button onClick={onClose} className="text-terminal-text/60 hover:text-terminal-text text-sm" aria-label="Close">✕</button>
        </div>

        <div className="mb-6">
          <div className="text-terminal-accent text-xs uppercase tracking-widest mb-2">
            Unlocked Modifiers ({unlockedMods.length}/20)
          </div>
          {unlockedMods.length === 0 ? (
            <p className="text-terminal-text/50 text-xs">No modifiers unlocked yet. Complete runs to unlock them.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {unlockedMods.map((mod) => (
                mod && (
                  <div key={mod.id} className="flex items-start gap-2 p-2 rounded border border-terminal-border bg-terminal-bg/50">
                    <span className="text-terminal-accent text-xs mt-0.5">◆</span>
                    <div>
                      <div className="text-terminal-text-bright text-xs font-bold">{mod.name}</div>
                      <div className="text-terminal-text/60 text-[10px]">{mod.description}</div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-terminal-accent text-xs uppercase tracking-widest mb-2">
            Achievements ({challenges.length} total)
          </div>
          <div className="flex flex-col gap-1.5">
            {challenges.map((ch) => {
              const completed = codex.achievements.includes(ch.id)
              return (
                <div key={ch.id} className={`flex items-start gap-2 p-2 rounded border ${completed ? 'border-terminal-pass/30 bg-terminal-pass/5' : 'border-terminal-border bg-terminal-bg/50'}`}>
                  <span className={`text-xs mt-0.5 ${completed ? 'text-terminal-pass' : 'text-terminal-text/30'}`}>
                    {completed ? '✓' : '○'}
                  </span>
                  <div>
                    <div className={`text-xs font-bold ${completed ? 'text-terminal-pass' : 'text-terminal-text/50'}`}>{ch.name}</div>
                    <div className="text-terminal-text/40 text-[10px]">{ch.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-terminal-accent text-xs uppercase tracking-widest mb-2">
            Run History ({codex.completedRuns.length})
          </div>
          {codex.completedRuns.length === 0 ? (
            <p className="text-terminal-text/50 text-xs">No runs completed yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {[...codex.completedRuns].reverse().slice(0, 10).map((run) => (
                <div key={run.id} className="flex items-center justify-between p-2 rounded border border-terminal-border bg-terminal-bg/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-text/60">{ARCH_LABELS[run.archetype] ?? run.archetype}</span>
                    <span className={run.passed ? 'text-terminal-pass' : 'text-terminal-fail'}>
                      {run.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <span className="text-terminal-text/40 font-mono">T{run.turnReached}/20</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
