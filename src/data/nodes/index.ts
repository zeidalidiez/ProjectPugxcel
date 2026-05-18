import type { NodeDef } from '../../types/nodes'
import type { ArchetypeFlavor } from '../../types/archetype-flavor'
import { Archetype } from '../../types/enums'
import { sporgkNodes } from './sporgk'
import { elfNodes } from './elf'
import { vampireNodes } from './vampire'

const handWrittenPools: Partial<Record<Archetype, NodeDef[]>> = {
  [Archetype.SPORGK]: sporgkNodes,
  [Archetype.ELF]: elfNodes,
  [Archetype.VAMPIRE]: vampireNodes,
}

export function getNodePool(archetype: Archetype): NodeDef[] {
  return handWrittenPools[archetype] ?? []
}

export function getNodeById(archetype: Archetype, id: string): NodeDef | undefined {
  return handWrittenPools[archetype]?.find((n) => n.id === id)
}

export function getAnchors(archetype: Archetype): NodeDef[] {
  return (handWrittenPools[archetype] ?? []).filter((n) => n.isAnchor)
}

export function getNodesByColumn(_archetype: Archetype, _column: number): NodeDef[] {
  return []
}

export { sporgkNodes, elfNodes, vampireNodes }

export function loadArchetypeFlavor(archetype: Archetype): ArchetypeFlavor {
  const flavors: Record<string, ArchetypeFlavor> = {
    [Archetype.SPORGK]: {
      id: 'sporgk',
      name: 'Sporgk',
      subtitle: 'The Asteroid Barbarian',
      description: 'Brutal raiders wielding rocket-greataxes. STR + STA. Brute force.',
      primaryStat: 'STR' as const,
      secondaryStat: 'STA' as const,
      statWeights: { STR: 1.0, AGI: 0.3, STA: 0.6, INT: 0.2, LCK: 0.2 },
      flavor: {
        prefixes: ['Feral', 'Cosmic', 'Savage', 'Primal', 'Kinetic', 'Brutal', 'Unyielding', 'Stellar'],
        cores: ['Asteroid Strike', 'Warp-Fire Rage', 'Void Breach', 'Gravity Hammer', 'Titan Fury', 'Rocket Charge', 'Cosmic Impact', 'Iron Hide', 'Blood Frenzy', 'Bone Crusher', 'Hull Breaker', 'Star Splitter', 'Nebula Ram', 'Comet Smash', 'Meteor Storm', 'Void Smash', 'Greataxe Swing', 'Warp Pulse', 'Kinetic Slam', 'Armor Break'],
        suffixes: ['Calibration', 'Doctrine', 'Mastery', 'Protocol', 'Discipline', 'Conditioning', 'Stance', 'Enragement', 'Proficiency', 'Expertise', 'Devotion', 'Fury'],
        templates: ['{prefix} {core}', '{core} {suffix}', '{prefix} {core} {suffix}'],
      },
      rings: {
        '0': { ppBudget: 1.0, costRange: [0, 0], structuralRatio: 0.0 },
        '1': { ppBudget: 2.0, costRange: [25, 40], structuralRatio: 0.10 },
        '2': { ppBudget: 3.0, costRange: [35, 55], structuralRatio: 0.15 },
        '3': { ppBudget: 4.0, costRange: [50, 75], structuralRatio: 0.18 },
        '4': { ppBudget: 5.0, costRange: [70, 100], structuralRatio: 0.20 },
        '5': { ppBudget: 6.0, costRange: [90, 130], structuralRatio: 0.22 },
        '6': { ppBudget: 7.0, costRange: [110, 160], structuralRatio: 0.25 },
        '7': { ppBudget: 8.0, costRange: [140, 200], structuralRatio: 0.28 },
      },
      structuralTemplates: [
        { kind: 'CONDITIONAL', condition: 'gear_unequipped', value: 0, ppBonus: 1.5 },
        { kind: 'CONDITIONAL', condition: 'stat_threshold', stat: 'STR', value: 20, ppBonus: 1.5 },
        { kind: 'MUTEX', count: 4, ppBonus: 2.0 },
        { kind: 'ANTI_SYNERGY', count: 2, ppBonus: 2.5 },
        { kind: 'THRESHOLD', condition: 'turn', value: 10, ppBonus: 2.0 },
        { kind: 'HYBRID_BRIDGE', count: 2, ppBonus: 2.0 },
      ],
    },
    [Archetype.ELF]: {
      id: 'elf',
      name: 'Space Pug Elf',
      subtitle: 'The Crystalline Star-Farer',
      description: 'Graceful ancients on crystal galleons. AGI + LCK. Weak-then-exponential.',
      primaryStat: 'AGI' as const,
      secondaryStat: 'LCK' as const,
      statWeights: { STR: 0.2, AGI: 1.0, STA: 0.3, INT: 0.3, LCK: 0.6 },
      flavor: {
        prefixes: ['Crystalline', 'Prismatic', 'Ancient', 'Graceful', 'Stellar', 'Luminous', 'Ethereal', 'Astral'],
        cores: ['Plasma Volley', 'Star Wave', 'Light Arrow', 'Crystal Lance', 'Nebula Dance', 'Photon Strike', 'Comet Trail', 'Solar Flare', 'Lunar Arc', 'Prism Burst', 'Radiant Beam', 'Star Piercer', 'Cosmic Flow', 'Dawn Strike', 'Twilight Shot', 'Aether Pulse', 'Glimmer Cut', 'Shine Surge', 'Beam Cascade', 'Radiant Surge'],
        suffixes: ['Precision', 'Foresight', 'Grace', 'Refraction', 'Harmony', 'Balance', 'Agility', 'Clarity', 'Resonance', 'Zenith', 'Elegance', 'Flow'],
        templates: ['{prefix} {core}', '{core} {suffix}', '{prefix} {core} {suffix}'],
      },
      rings: {
        '0': { ppBudget: 1.0, costRange: [0, 0], structuralRatio: 0.0 },
        '1': { ppBudget: 2.0, costRange: [25, 40], structuralRatio: 0.10 },
        '2': { ppBudget: 3.0, costRange: [35, 55], structuralRatio: 0.15 },
        '3': { ppBudget: 4.0, costRange: [50, 75], structuralRatio: 0.18 },
        '4': { ppBudget: 5.0, costRange: [70, 100], structuralRatio: 0.20 },
        '5': { ppBudget: 6.0, costRange: [90, 130], structuralRatio: 0.22 },
        '6': { ppBudget: 7.0, costRange: [110, 160], structuralRatio: 0.25 },
        '7': { ppBudget: 8.0, costRange: [140, 200], structuralRatio: 0.28 },
      },
      structuralTemplates: [
        { kind: 'CONDITIONAL', condition: 'gold_spent_below', value: 100, ppBonus: 1.5 },
        { kind: 'CONDITIONAL', condition: 'stat_threshold', stat: 'AGI', value: 20, ppBonus: 1.5 },
        { kind: 'MUTEX', count: 4, ppBonus: 2.0 },
        { kind: 'ANTI_SYNERGY', count: 2, ppBonus: 2.5 },
        { kind: 'THRESHOLD', condition: 'turn', value: 10, ppBonus: 2.0 },
        { kind: 'HYBRID_BRIDGE', count: 2, ppBonus: 2.0 },
      ],
    },
    [Archetype.VAMPIRE]: {
      id: 'vampire',
      name: 'Space Pug Vampire',
      subtitle: 'The Void Lord',
      description: 'Gothic undead in cathedral-ships. INT + STA. Synergy puzzle.',
      primaryStat: 'INT' as const,
      secondaryStat: 'STA' as const,
      statWeights: { STR: 0.2, AGI: 0.2, STA: 0.6, INT: 1.0, LCK: 0.3 },
      flavor: {
        prefixes: ['Void', 'Gothic', 'Umbral', 'Ancient', 'Dark', 'Entropic', 'Spectral', 'Necrotic'],
        cores: ['Void Siphon', 'Shadow Strike', 'Cathedral Pulse', 'Dark Cascade', 'Entropy Wave', 'Life Drain', 'Soul Rend', 'Night Shroud', 'Void Bolt', 'Spectral Lance', 'Grave Touch', 'Abyss Gaze', 'Doom Arc', 'Blood Curse', 'Wraith Surge', 'Shade Pierce', 'Necro Surge', 'Void Grip', 'Dark Surge', 'Ritual Strike'],
        suffixes: ['Siphoning', 'Invocation', 'Requiem', 'Resonance', 'Eclipse', 'Convergence', 'Absorption', 'Dominance', 'Ascendance', 'Descent', 'Cascade', 'Ritual'],
        templates: ['{prefix} {core}', '{core} {suffix}', '{prefix} {core} {suffix}'],
      },
      rings: {
        '0': { ppBudget: 1.0, costRange: [0, 0], structuralRatio: 0.0 },
        '1': { ppBudget: 2.0, costRange: [25, 40], structuralRatio: 0.10 },
        '2': { ppBudget: 3.0, costRange: [35, 55], structuralRatio: 0.15 },
        '3': { ppBudget: 4.0, costRange: [50, 75], structuralRatio: 0.18 },
        '4': { ppBudget: 5.0, costRange: [70, 100], structuralRatio: 0.20 },
        '5': { ppBudget: 6.0, costRange: [90, 130], structuralRatio: 0.22 },
        '6': { ppBudget: 7.0, costRange: [110, 160], structuralRatio: 0.25 },
        '7': { ppBudget: 8.0, costRange: [140, 200], structuralRatio: 0.28 },
      },
      structuralTemplates: [
        { kind: 'CONDITIONAL', condition: 'abilities_count_below', value: 2, ppBonus: 1.5 },
        { kind: 'CONDITIONAL', condition: 'stat_threshold', stat: 'INT', value: 20, ppBonus: 1.5 },
        { kind: 'MUTEX', count: 4, ppBonus: 2.0 },
        { kind: 'ANTI_SYNERGY', count: 2, ppBonus: 2.5 },
        { kind: 'THRESHOLD', condition: 'turn', value: 10, ppBonus: 2.0 },
        { kind: 'HYBRID_BRIDGE', count: 2, ppBonus: 2.0 },
      ],
    },
  }
  return flavors[archetype]!
}
