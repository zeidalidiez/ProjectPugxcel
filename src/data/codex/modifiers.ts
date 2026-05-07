import { Archetype, StatType } from '../../types/enums'

export interface CodexModifier {
  id: string
  name: string
  description: string
  unlockCondition: {
    type: 'win_run' | 'reach_turn' | 'archetype_challenge' | 'no_gear_run' | 'boss_kill' | 'stat_threshold'
    archetype?: Archetype
    value?: number
  }
  effect: {
    type: 'add_node_to_pool' | 'add_item_to_pool' | 'stat_boost' | 'start_gold' | 'start_ability'
    nodeId?: string
    itemId?: string
    statBonus?: number
    stat?: string
    value?: number
  }
}

export const codexModifiers: CodexModifier[] = [
  {
    id: 'mod_iron_hide',
    name: 'Iron Hide',
    description: 'Start runs with +2 base STR.',
    unlockCondition: { type: 'win_run', archetype: Archetype.SPORGK },
    effect: { type: 'stat_boost', statBonus: 2 },
  },
  {
    id: 'mod_crystalline_focus',
    name: 'Crystalline Focus',
    description: 'Start runs with +2 base AGI.',
    unlockCondition: { type: 'win_run', archetype: Archetype.ELF },
    effect: { type: 'stat_boost', statBonus: 2 },
  },
  {
    id: 'mod_void_touched',
    name: 'Void-Touched',
    description: 'Start runs with +2 base INT.',
    unlockCondition: { type: 'win_run', archetype: Archetype.VAMPIRE },
    effect: { type: 'stat_boost', statBonus: 2 },
  },
  {
    id: 'mod_war_chest',
    name: 'War Chest',
    description: 'Start runs with +50 gold.',
    unlockCondition: { type: 'reach_turn', value: 15 },
    effect: { type: 'start_gold', value: 50 },
  },
  {
    id: 'mod_lucky_charm',
    name: 'Lucky Charm',
    description: 'Start runs with +3 base LCK.',
    unlockCondition: { type: 'reach_turn', value: 10 },
    effect: { type: 'stat_boost', statBonus: 3 },
  },
  {
    id: 'mod_naked_brawler',
    name: 'Naked Brawler',
    description: 'Unlocks the Void Knuckles item in the universal pool.',
    unlockCondition: { type: 'no_gear_run', value: 10 },
    effect: { type: 'add_item_to_pool', itemId: 'item_void_knuckles' },
  },
  {
    id: 'mod_boss_slayer',
    name: 'Boss Slayer',
    description: 'Start runs with +3 base STR.',
    unlockCondition: { type: 'boss_kill', value: 4 },
    effect: { type: 'stat_boost', statBonus: 3 },
  },
  {
    id: 'mod_astral_wealth',
    name: 'Astral Wealth',
    description: 'Start runs with +25 additional gold.',
    unlockCondition: { type: 'stat_threshold', value: 30 },
    effect: { type: 'start_gold', value: 25 },
  },
  {
    id: 'mod_sporgk_berserker',
    name: 'Berserker Blood',
    description: 'Unlocks the Berserker Rite node in the Sporgk pool.',
    unlockCondition: { type: 'archetype_challenge', archetype: Archetype.SPORGK, value: 12 },
    effect: { type: 'add_node_to_pool', nodeId: 'sporgk_berserker_rite' },
  },
  {
    id: 'mod_elf_starweaver',
    name: 'Star-Weaver',
    description: 'Unlocks the Star-Weaver node in the Elf pool.',
    unlockCondition: { type: 'archetype_challenge', archetype: Archetype.ELF, value: 12 },
    effect: { type: 'add_node_to_pool', nodeId: 'elf_starweaver' },
  },
  {
    id: 'mod_vampire_lich',
    name: 'Lich Ascendant',
    description: 'Unlocks the Lich Ascendant node in the Vampire pool.',
    unlockCondition: { type: 'archetype_challenge', archetype: Archetype.VAMPIRE, value: 12 },
    effect: { type: 'add_node_to_pool', nodeId: 'vamp_lich_ascendant' },
  },
  {
    id: 'mod_double_draft',
    name: 'Double Draft',
    description: 'Unlocks the Draft Token item in the universal pool.',
    unlockCondition: { type: 'win_run' },
    effect: { type: 'add_item_to_pool', itemId: 'item_draft_token' },
  },
  {
    id: 'mod_golden_paws',
    name: 'Golden Paws',
    description: 'Start runs with +25 gold and +1 LCK.',
    unlockCondition: { type: 'reach_turn', value: 8 },
    effect: { type: 'start_gold', value: 25 },
  },
  {
    id: 'mod_endurance',
    name: 'Endurance Training',
    description: 'Start runs with +2 base STA.',
    unlockCondition: { type: 'reach_turn', value: 5 },
    effect: { type: 'stat_boost', statBonus: 2, stat: StatType.STA },
  },
  {
    id: 'mod_collector',
    name: 'Collector',
    description: 'Start runs with +15 additional gold.',
    unlockCondition: { type: 'stat_threshold', value: 20 },
    effect: { type: 'start_gold', value: 15 },
  },
  {
    id: 'mod_asteroid_cache',
    name: 'Asteroid Cache',
    description: 'Unlocks the Warp-Fuel Tank item in the Sporgk pool.',
    unlockCondition: { type: 'win_run', archetype: Archetype.SPORGK },
    effect: { type: 'add_item_to_pool', itemId: 'sporgk_item_warp_fuel' },
  },
  {
    id: 'mod_crystalline_wisdom',
    name: 'Crystalline Wisdom',
    description: 'Unlocks the Prismatic Lens node in the Elf pool.',
    unlockCondition: { type: 'reach_turn', value: 15 },
    effect: { type: 'add_node_to_pool', nodeId: 'elf_prismatic_lens' },
  },
  {
    id: 'mod_void_resonance',
    name: 'Void Resonance',
    description: 'Unlocks the Entropic Cascade node in the Vampire pool.',
    unlockCondition: { type: 'reach_turn', value: 15 },
    effect: { type: 'add_node_to_pool', nodeId: 'vamp_entropic_cascade' },
  },
  {
    id: 'mod_ancient_trinket',
    name: 'Ancient Trinket',
    description: 'Start runs with +1 base LCK.',
    unlockCondition: { type: 'no_gear_run', value: 10 },
    effect: { type: 'stat_boost', statBonus: 1, stat: StatType.LCK },
  },
  {
    id: 'mod_veterans_stipend',
    name: 'Veteran\'s Stipend',
    description: 'Start runs with +20 additional gold.',
    unlockCondition: { type: 'stat_threshold', value: 30 },
    effect: { type: 'start_gold', value: 20 },
  },
]

export function getModifierById(id: string): CodexModifier | undefined {
  return codexModifiers.find((m) => m.id === id)
}

export function getUnlockedModifiers(unlockedIds: string[]): CodexModifier[] {
  return codexModifiers.filter((m) => unlockedIds.includes(m.id))
}
