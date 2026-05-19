import { useState } from 'react'
import { useGameStore } from '../store'
import { codexModifiers, type CodexModifier } from '../data/codex/modifiers'
import { getAllChallenges } from '../data/codex/challenges'
import { Archetype } from '../types/enums'
import { encodeCodexPassword, decodeCodexPassword } from '../game/save/codexPassword'
import { saveCodex } from '../game/save/storage'
import { useToast } from './Toast'

const ARCH_LABELS: Record<string, string> = {
  [Archetype.SPORGK]: 'Sporgk',
  [Archetype.ELF]: 'Elf',
  [Archetype.VAMPIRE]: 'Vampire',
}

function formatUnlockCondition(condition: CodexModifier['unlockCondition']): string {
  const label = condition.archetype ? (ARCH_LABELS[condition.archetype] ?? condition.archetype).toLowerCase() : ''
  switch (condition.type) {
    case 'win_run':
      return condition.archetype ? `> win a run as ${label}` : '> win any run'
    case 'reach_turn':
      return `> reach turn ${condition.value}`
    case 'boss_kill':
      return `> defeat ${condition.value} bosses`
    case 'archetype_challenge':
      return `> win as ${label} reaching turn ${condition.value}`
    case 'no_gear_run':
      return `> reach turn ${condition.value} with no gear ever equipped`
    case 'stat_threshold':
      return `> reach ${condition.value}+ total stats in any run`
    default:
      return '> ???'
  }
}

export default function CodexModal({ onClose }: { onClose: () => void }) {
  const codex = useGameStore((s) => s.codex)
  const [importInput, setImportInput] = useState('')
  const { showToast, ToastComponent } = useToast()

  const challenges = getAllChallenges()
  const password = encodeCodexPassword(codex)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
    } catch { /* fallback */ }
    showToast('Password copied', 'success')
  }

  function handleImport() {
    const input = importInput.trim()
    if (!input) {
      showToast('Paste a codex password', 'error')
      return
    }
    const result = decodeCodexPassword(input)
    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }
    const newCodex = { ...codex, unlockedModifiers: [...new Set([...codex.unlockedModifiers, ...result.unlockedModifiers])] }
    useGameStore.setState({ codex: newCodex })
    saveCodex(newCodex)
    showToast(`Imported ${result.unlockedModifiers.length} modifier${result.unlockedModifiers.length !== 1 ? 's' : ''}`, 'success')
    setImportInput('')
  }

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
            Modifiers ({codex.unlockedModifiers.length}/{codexModifiers.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {codexModifiers.map((mod) => {
              const unlocked = codex.unlockedModifiers.includes(mod.id)
              return (
                <div
                  key={mod.id}
                  className={`flex items-start gap-2 p-2 rounded border ${
                    unlocked
                      ? 'border-terminal-border bg-terminal-bg/50'
                      : 'border-terminal-border/40 bg-terminal-bg/20 opacity-40'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <span className="text-terminal-accent text-xs mt-0.5">◆</span>
                      <div>
                        <div className="text-terminal-text-bright text-xs font-bold">{mod.name}</div>
                        <div className="text-terminal-text/60 text-[10px]">{mod.description}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-terminal-text/30 text-xs mt-0.5">○</span>
                      <div>
                        <div className="text-terminal-text/50 text-xs font-bold">???</div>
                        <div className="text-terminal-text/40 text-[10px] font-mono">{formatUnlockCondition(mod.unlockCondition)}</div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
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

        <div className="mb-6">
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

        <div className="border-t border-terminal-border pt-4">
          <div className="text-terminal-accent text-xs uppercase tracking-widest mb-2">Codex Password</div>
          <p className="text-terminal-text/50 text-[10px] mb-2">
            Copy this password to transfer your unlocked modifiers to another device. Paste a password below to restore.
          </p>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-terminal-bg border border-terminal-border rounded px-3 py-1.5 text-terminal-text-bright font-mono text-sm tracking-widest select-all">
              {password}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded border border-terminal-accent text-terminal-accent text-xs hover:bg-terminal-accent/10 transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleImport() }}
              placeholder="Paste password to import..."
              className="flex-1 px-3 py-1.5 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
              maxLength={12}
            />
            <button
              onClick={handleImport}
              disabled={!importInput.trim()}
              className="px-3 py-1.5 rounded border border-terminal-accent text-terminal-accent text-xs hover:bg-terminal-accent/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Import
            </button>
          </div>
        </div>
      </div>
      {ToastComponent}
    </div>
  )
}
