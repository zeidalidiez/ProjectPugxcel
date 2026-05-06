import type { CompletedRun, CodexState } from '../../types/save'
import { codexModifiers } from '../../data/codex/modifiers'

export function checkCodexUnlocks(run: CompletedRun, currentCodex: CodexState): string[] {
  const unlocked = new Set(currentCodex.unlockedModifiers)
  const newlyUnlocked: string[] = []

  for (const modifier of codexModifiers) {
    if (unlocked.has(modifier.id)) continue

    const cond = modifier.unlockCondition
    let met = false

    switch (cond.type) {
      case 'win_run': {
        if (!run.passed) break
        if (cond.archetype && run.archetype !== cond.archetype) break
        met = true
        break
      }
      case 'reach_turn': {
        if (cond.value !== undefined && run.turnReached >= cond.value) {
          met = true
        }
        break
      }
      case 'boss_kill': {
        if (run.turnReached % 5 === 0 && run.passed) {
          met = true
        }
        break
      }
      case 'archetype_challenge': {
        if (run.passed && run.archetype === cond.archetype && cond.value !== undefined && run.turnReached >= cond.value) {
          met = true
        }
        break
      }
      case 'no_gear_run': {
        met = false
        break
      }
      case 'stat_threshold': {
        met = false
        break
      }
    }

    if (met) {
      newlyUnlocked.push(modifier.id)
    }
  }

  return newlyUnlocked
}
