import { StatType } from './enums'

export type StatBlock = Record<StatType, number>

export const EMPTY_STATS: StatBlock = {
  [StatType.STR]: 0,
  [StatType.AGI]: 0,
  [StatType.STA]: 0,
  [StatType.INT]: 0,
  [StatType.LCK]: 0,
}

export const STAT_LABELS: Record<StatType, string> = {
  [StatType.STR]: 'STR',
  [StatType.AGI]: 'AGI',
  [StatType.STA]: 'STA',
  [StatType.INT]: 'INT',
  [StatType.LCK]: 'LCK',
}

export const ALL_STATS: StatType[] = [StatType.STR, StatType.AGI, StatType.STA, StatType.INT, StatType.LCK]

export function addStats(a: StatBlock, b: Partial<StatBlock>): StatBlock {
  const result = { ...a }
  for (const stat of ALL_STATS) {
    result[stat] += b[stat] ?? 0
  }
  return result
}

export function sumStats(blocks: Partial<StatBlock>[]): StatBlock {
  const result = { ...EMPTY_STATS }
  for (const block of blocks) {
    for (const stat of ALL_STATS) {
      result[stat] += block[stat] ?? 0
    }
  }
  return result
}
