import { Archetype } from '../../types/enums'

export interface CodexChallenge {
  id: string
  name: string
  description: string
  condition: {
    type: 'win_with_archetype' | 'reach_turn' | 'no_items_equipped' | 'stat_total' | 'gold_hoarded' | 'boss_perfect' | 'all_archetypes_won'
    archetype?: Archetype
    value?: number
  }
}

export const codexChallenges: CodexChallenge[] = [
  {
    id: 'ch_sporgk_victory',
    name: 'Asteroid Cleaver',
    description: 'Win a run as Sporgk.',
    condition: { type: 'win_with_archetype', archetype: Archetype.SPORGK },
  },
  {
    id: 'ch_elf_victory',
    name: 'Crystalline Zenith',
    description: 'Win a run as Elf.',
    condition: { type: 'win_with_archetype', archetype: Archetype.ELF },
  },
  {
    id: 'ch_vampire_victory',
    name: 'Void Ascendant',
    description: 'Win a run as Vampire.',
    condition: { type: 'win_with_archetype', archetype: Archetype.VAMPIRE },
  },
  {
    id: 'ch_constellations_aligned',
    name: 'Constellations Aligned',
    description: 'Win a run with all three archetypes.',
    condition: { type: 'all_archetypes_won' },
  },
  {
    id: 'ch_bare_knuckle',
    name: 'Bare Knuckle',
    description: 'Reach turn 10 without equipping any items.',
    condition: { type: 'no_items_equipped', value: 10 },
  },
  {
    id: 'ch_perfect_boss',
    name: 'Flawless Victory',
    description: 'Beat a boss turn with at least 25% damage above threshold.',
    condition: { type: 'boss_perfect', value: 25 },
  },
  {
    id: 'ch_dragon_hoard',
    name: 'Dragon Hoard',
    description: 'Finish a run with over 400 unspent gold.',
    condition: { type: 'gold_hoarded', value: 400 },
  },
  {
    id: 'ch_stat_monster',
    name: 'Stat Monster',
    description: 'Reach 50 total STR in a single run.',
    condition: { type: 'stat_total', value: 50 },
  },
  {
    id: 'ch_speed_demon',
    name: 'Speed Demon',
    description: 'Reach 50 total AGI in a single run.',
    condition: { type: 'stat_total', value: 50 },
  },
  {
    id: 'ch_brainiac',
    name: 'Brainiac',
    description: 'Reach 50 total INT in a single run.',
    condition: { type: 'stat_total', value: 50 },
  },
  {
    id: 'ch_deep_run',
    name: 'Deep Space',
    description: 'Reach turn 15.',
    condition: { type: 'reach_turn', value: 15 },
  },
  {
    id: 'ch_survivor',
    name: 'Survivor',
    description: 'Reach turn 10.',
    condition: { type: 'reach_turn', value: 10 },
  },
]

export function getAllChallenges(): CodexChallenge[] {
  return codexChallenges
}
