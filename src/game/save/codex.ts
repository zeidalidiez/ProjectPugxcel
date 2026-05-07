import type { CompletedRun, CodexState } from '../../types/save'
import type { StatBlock } from '../../types/stats'
import type { NodeDef } from '../../types/nodes'
import type { ItemDef } from '../../types/items'
import { codexModifiers, type CodexModifier } from '../../data/codex/modifiers'
import { getNodeById } from '../../data/nodes'
import { getItemById } from '../../data/items'
import { Archetype, StatType } from '../../types/enums'

export function checkCodexUnlocks(run: CompletedRun, currentCodex: CodexState, peakStats?: StatBlock, gearEverEquipped?: boolean): string[] {
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
        if (gearEverEquipped === false && cond.value !== undefined && run.turnReached >= cond.value) {
          met = true
        }
        break
      }
      case 'stat_threshold': {
        if (peakStats && cond.value !== undefined) {
          const maxStat = Math.max(...Object.values(peakStats))
          if (maxStat >= cond.value) met = true
        }
        break
      }
    }

    if (met) {
      newlyUnlocked.push(modifier.id)
    }
  }

  return newlyUnlocked
}

export interface CodexModifierResult {
  bonusStats: Partial<StatBlock>
  bonusGold: number
  extraNodes: NodeDef[]
  extraItems: ItemDef[]
}

export function applyCodexModifiers(
  archetype: Archetype,
  unlockedIds: string[],
): CodexModifierResult {
  const result: CodexModifierResult = {
    bonusStats: {},
    bonusGold: 0,
    extraNodes: [],
    extraItems: [],
  }

  const sorted = unlockedIds
    .map((id) => codexModifiers.find((m) => m.id === id))
    .filter((m): m is CodexModifier => m !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id))

  for (const mod of sorted) {
    switch (mod.effect.type) {
      case 'stat_boost': {
        if (!mod.effect.statBonus) break
        const stat = mod.effect.stat
          ? (mod.effect.stat as StatType)
          : archetype === Archetype.SPORGK ? StatType.STR
          : archetype === Archetype.ELF ? StatType.AGI
          : StatType.INT
        result.bonusStats[stat] = (result.bonusStats[stat] ?? 0) + mod.effect.statBonus
        break
      }
      case 'start_gold': {
        result.bonusGold += mod.effect.value ?? 0
        break
      }
      case 'add_node_to_pool': {
        if (!mod.effect.nodeId) break
        const node = getNodeById(archetype, mod.effect.nodeId)
        if (node) result.extraNodes.push(node)
        break
      }
      case 'add_item_to_pool': {
        if (!mod.effect.itemId) break
        const item = getItemById(mod.effect.itemId)
        if (item) result.extraItems.push(item)
        break
      }
    }
  }

  return result
}
