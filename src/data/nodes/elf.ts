import { Archetype, StatType, NodeType } from '../../types/enums'
import type { NodeDef } from '../../types/nodes'

function node(id: string, overrides: Partial<NodeDef> & Pick<NodeDef, 'name' | 'description' | 'cost' | 'column'>): NodeDef {
  return {
    id: `elf_${id}`,
    type: NodeType.STANDARD,
    archetype: Archetype.ELF,
    effects: [],
    rarity: 50,
    isAnchor: false,
    ...overrides,
  }
}

export const elfNodes: NodeDef[] = [
  // ========================================================================
  // COLUMN 0 — Starting nodes (cost 25–30g)
  // ========================================================================

  node('grace', {
    name: 'Elven Grace',
    description: 'The first step on the starlit path. Ancient blood remembers the rhythm of the void.',
    cost: 28,
    column: 0,
    effects: [{ stat: StatType.AGI, value: 2, kind: 'flat' }],
    rarity: 70,
  }),
  node('fortune', {
    name: "Star-Farer's Fortune",
    description: 'A newborn glimmer of cosmic luck. The stars have noticed you.',
    cost: 28,
    column: 0,
    effects: [{ stat: StatType.LCK, value: 2, kind: 'flat' }],
    rarity: 70,
  }),
  node('plasma_sight', {
    name: 'Plasma Sight',
    description: 'Perceive the flow of stellar currents. A bow drawn against ion trails.',
    cost: 25,
    column: 0,
    effects: [
      { stat: StatType.AGI, value: 1, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
    rarity: 65,
  }),
  node('crystal_step', {
    name: 'Crystal Step',
    description: 'Light-footed across astral galleon decks. Your stride echoes with precision.',
    cost: 30,
    column: 0,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    rarity: 60,
  }),
  node('ancient_lore', {
    name: 'Ancient Star-Lore',
    description: 'Millennia of accumulated cosmic wisdom, inscribed in crystalline memory.',
    cost: 30,
    column: 0,
    effects: [
      { stat: StatType.LCK, value: 2, kind: 'flat' },
      { stat: StatType.INT, value: 1, kind: 'flat' },
    ],
    rarity: 60,
  }),

  // ========================================================================
  // COLUMN 1 — Anchors, early mutexes, conditionals (cost 30–40g)
  // ========================================================================

  node('anchor_hull', {
    name: 'Crystalline Hull',
    description: 'The galleon endures star-storms and void-winds with unshaken brilliance.',
    cost: 32,
    column: 1,
    type: NodeType.STANDARD,
    effects: [{ stat: StatType.AGI, value: 3, kind: 'flat' }],
    rarity: 100,
    isAnchor: true,
  }),
  node('anchor_foresight', {
    name: "Ancient's Foresight",
    description: 'Peering across timelines, you see the moment to strike before it forms.',
    cost: 32,
    column: 1,
    type: NodeType.STANDARD,
    effects: [{ stat: StatType.LCK, value: 3, kind: 'flat' }],
    rarity: 100,
    isAnchor: true,
  }),

  // Mutex Pair A — "elf_pair_speed_precision"
  node('stellar_swiftness', {
    name: 'Stellar Swiftness',
    description: 'Faster than plasma-light. Strike before your opponent perceives the threat.',
    cost: 38,
    column: 1,
    type: NodeType.MUTEX,
    effects: [{ stat: StatType.AGI, value: 4, kind: 'flat' }],
    mutexPairId: 'elf_pair_speed_precision',
    rarity: 35,
  }),
  node('pristine_aim', {
    name: 'Pristine Aim',
    description: 'Every shot a calculated inevitability. Precision over raw speed.',
    cost: 35,
    column: 1,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.LCK, value: 3, kind: 'flat' },
      { stat: StatType.AGI, value: 1, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_speed_precision',
    rarity: 35,
  }),

  // Conditional
  node('star_gold_hoarder', {
    name: 'Star-Gold Hoarder',
    description: 'Wealth stockpiled aboard the crystal galleon radiates a luck-attracting aura.',
    cost: 35,
    column: 1,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
    condition: { type: 'gold_unspent', value: 50 },
    rarity: 30,
  }),
  node('unarmored_grace', {
    name: 'Unarmored Grace',
    description: 'Shedding weight unlocks true elven agility. Each empty slot is freedom.',
    cost: 33,
    column: 1,
    type: NodeType.CONDITIONAL,
    effects: [{ stat: StatType.AGI, value: 3, kind: 'flat' }],
    condition: { type: 'gear_unequipped', value: 1 },
    rarity: 30,
  }),

  // Standard
  node('crystalline_reflexes', {
    name: 'Crystalline Reflexes',
    description: 'Your body hums with the resonance of a tuned prism. Reaction eclipses thought.',
    cost: 35,
    column: 1,
    effects: [{ stat: StatType.AGI, value: 4, kind: 'flat' }],
    rarity: 65,
  }),
  node('fortunes_boon', {
    name: "Fortune's Boon",
    description: 'A subtle blessing tightens your store discounts and widens your crit window.',
    cost: 33,
    column: 1,
    effects: [{ stat: StatType.LCK, value: 3, kind: 'flat' }],
    rarity: 60,
  }),
  node('swift_step', {
    name: 'Swift Step',
    description: 'Footwork drilled across a thousand star-decks. Never be cornered in the void.',
    cost: 33,
    column: 1,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('plasma_readiness', {
    name: 'Plasma Readiness',
    description: 'A bowstring of living light, held steady between breaths of vacuum.',
    cost: 33,
    column: 1,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.INT, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('star_money_sense', {
    name: 'Star-Money Sense',
    description: 'You feel the pull of wealth across light-years. Store discounts improve with every point of luck.',
    cost: 35,
    column: 1,
    effects: [
      { stat: StatType.LCK, value: 2, kind: 'flat' },
      { stat: StatType.AGI, value: 1, kind: 'flat' },
    ],
    rarity: 60,
  }),

  // ========================================================================
  // COLUMN 2 — Mutexes, hybrid bridge, conditionals (cost 42–55g)
  // ========================================================================

  // Mutex Pair B — "elf_pair_wealth_power"
  node('gilded_constellation', {
    name: 'Gilded Constellation',
    description: 'Chart the stars by their gold-veins. Wealth compounds into luck and deeper store discounts.',
    cost: 48,
    column: 2,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.LCK, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 1, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_wealth_power',
    rarity: 35,
  }),
  node('plasma_burst', {
    name: 'Plasma Burst',
    description: 'Raw power channeled through the bow. Sacrifice economic finesse for immediate kill pressure.',
    cost: 45,
    column: 2,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_wealth_power',
    rarity: 35,
  }),

  // Conditional
  node('empty_slots_grace', {
    name: 'Void-Sail Grace',
    description: 'The fewer burdens you carry, the faster your plasma bolts fly.',
    cost: 42,
    column: 2,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
    condition: { type: 'gear_unequipped', value: 2 },
    rarity: 30,
  }),
  node('momentum_cascade', {
    name: 'Momentum Cascade',
    description: 'Agility begets agility. Once you start, you cannot be stopped.',
    cost: 50,
    column: 2,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    condition: { type: 'stat_threshold', stat: StatType.AGI, value: 15 },
    rarity: 30,
  }),

  // Hybrid Bridge
  node('barbarian_swiftness', {
    name: "Barbarian's Swiftness",
    description: 'A spark of asteroid-born fury finds its way into elven plasma. Strength and speed, fused.',
    cost: 48,
    column: 2,
    type: NodeType.HYBRID_BRIDGE,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
    rarity: 25,
  }),

  // Standard
  node('twin_stars', {
    name: 'Twin Stars',
    description: 'Two distant suns, locked in perfect orbit. Agility and luck rise in tandem.',
    cost: 48,
    column: 2,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('vaulting_grace', {
    name: 'Vaulting Grace',
    description: 'Leap from crystal spire to spire without touching the galleon deck.',
    cost: 45,
    column: 2,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('star_gazers_insight', {
    name: "Star-Gazer's Insight",
    description: 'A thousand years of astral observation sharpen your mind and luck.',
    cost: 48,
    column: 2,
    effects: [
      { stat: StatType.LCK, value: 3, kind: 'flat' },
      { stat: StatType.INT, value: 2, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('plasmatic_edge', {
    name: 'Plasmatic Edge',
    description: 'Imbue your strikes with superheated light. A touch of strength in the elven arsenal.',
    cost: 45,
    column: 2,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.STR, value: 1, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('astral_balance', {
    name: 'Astral Balance',
    description: 'The harmony of the void teaches patience. A measured blend of grace, fortune, and endurance.',
    cost: 50,
    column: 2,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    rarity: 50,
  }),

  // ========================================================================
  // COLUMN 3 — Anchor, mutex, anti-synergy, threshold, ability (cost 52–70g)
  // ========================================================================

  node('anchor_prismatic', {
    name: 'Prismatic Core',
    description: 'The heart of the galleon. A pulsing crystal that refracts agility into luck and luck into agility.',
    cost: 65,
    column: 3,
    type: NodeType.STANDARD,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 100,
    isAnchor: true,
  }),

  // Mutex Pair C — "elf_pair_plasma_crystal"
  node('plasma_infusion', {
    name: 'Plasma Infusion',
    description: 'Let the core\'s energy flood your limbs. Raw speed at the cost of defensive hardening.',
    cost: 65,
    column: 3,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_plasma_crystal',
    rarity: 35,
  }),
  node('crystal_fortress', {
    name: 'Crystal Fortress',
    description: 'Harden the hull around you. Trade speed for unbreakable staying power.',
    cost: 62,
    column: 3,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_plasma_crystal',
    rarity: 35,
  }),

  // Conditional
  node('late_ascendancy', {
    name: 'Late-Game Ascendancy',
    description: 'Elves bloom in the long vacuum. The deeper the run, the sharper your edge.',
    cost: 60,
    column: 3,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    condition: { type: 'turn_threshold', value: 8 },
    rarity: 30,
  }),
  node('untethered_grace', {
    name: 'Untethered Grace',
    description: 'Free of all earthly burdens, your agility enters a transcendent state.',
    cost: 55,
    column: 3,
    type: NodeType.CONDITIONAL,
    effects: [{ stat: StatType.AGI, value: 5, kind: 'flat' }],
    condition: { type: 'gear_unequipped', value: 3 },
    rarity: 30,
  }),

  // Anti-Synergy
  node('shattered_strength', {
    name: 'Shattered Strength',
    description: 'Break your mortal sinews to ascend. Raw power sacrificed for unparalleled agility.',
    cost: 58,
    column: 3,
    type: NodeType.ANTI_SYNERGY,
    effects: [
      { stat: StatType.STR, value: -4, kind: 'flat' },
      { stat: StatType.AGI, value: 6, kind: 'flat' },
    ],
    rarity: 30,
  }),

  // Threshold
  node('hoarders_dividend', {
    name: "Hoarder's Dividend",
    description: 'When your coffers overflow with star-gold, fortune pays you back in agility and luck.',
    cost: 65,
    column: 3,
    type: NodeType.THRESHOLD,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    condition: { type: 'gold_unspent', value: 100 },
    rarity: 30,
  }),

  // Ability Unlock
  node('ability_crystalline_volley', {
    name: 'Crystalline Volley',
    description: 'Unlock the signature plasma volley of the star-farers. A rain of crystalline bolts.',
    cost: 68,
    column: 3,
    effects: [
      { stat: StatType.AGI, value: 2, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'elf_crystalline_volley',
    rarity: 60,
  }),

  // Standard
  node('astral_alacrity', {
    name: 'Astral Alacrity',
    description: 'Move as light moves — instantly and in all directions at once.',
    cost: 60,
    column: 3,
    effects: [{ stat: StatType.AGI, value: 5, kind: 'flat' }],
    rarity: 55,
  }),
  node('prismatic_reflex', {
    name: 'Prismatic Reflex',
    description: 'Your reflexes refract incoming threats like a crystal lens splits a star beam.',
    cost: 60,
    column: 3,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('cosmic_favor', {
    name: 'Cosmic Favor',
    description: 'The universe tips the scales in your favor. Store discounts deepen; crit chance rises.',
    cost: 58,
    column: 3,
    effects: [{ stat: StatType.LCK, value: 4, kind: 'flat' }],
    rarity: 55,
  }),
  node('harmonized_flow', {
    name: 'Harmonized Flow',
    description: 'Agility and luck spiral together in an ascending helix of elven power.',
    cost: 62,
    column: 3,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('enduring_grace', {
    name: 'Enduring Grace',
    description: 'Beauty and stamina entwine. You fight as long as the stars burn.',
    cost: 58,
    column: 3,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('stellar_calculation', {
    name: 'Stellar Calculation',
    description: 'Plot firing solutions across orbital distances. Intelligence fuels fortune.',
    cost: 58,
    column: 3,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 50,
  }),

  // ========================================================================
  // COLUMN 4 — Conditional, anti-synergy, threshold, hybrid, ability (cost 70–95g)
  // ========================================================================

  // Conditional
  node('fortune_cascade', {
    name: 'Fortune Cascade',
    description: 'Once luck reaches critical mass, it begins generating itself. A self-sustaining blessing.',
    cost: 75,
    column: 4,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.LCK, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
    condition: { type: 'stat_threshold', stat: StatType.LCK, value: 20 },
    rarity: 30,
  }),

  // Anti-Synergy
  node('fortunes_bargain', {
    name: "Fortune's Bargain",
    description: 'Trade away your stamina reserves for a massive surge of luck. Every crit more lethal.',
    cost: 72,
    column: 4,
    type: NodeType.ANTI_SYNERGY,
    effects: [
      { stat: StatType.STA, value: -5, kind: 'flat' },
      { stat: StatType.LCK, value: 7, kind: 'flat' },
    ],
    rarity: 30,
  }),

  // Threshold
  node('survivor_insight', {
    name: "Survivor's Insight",
    description: 'Having endured the gauntlet this far, the cosmos rewards your persistence.',
    cost: 80,
    column: 4,
    type: NodeType.THRESHOLD,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    condition: { type: 'turn_threshold', value: 15 },
    rarity: 30,
  }),

  // Hybrid Bridge
  node('void_touched_grace', {
    name: 'Void-Touched Grace',
    description: 'The void-lords left their mark on this crystal. Intelligence and agility, an unholy fusion.',
    cost: 78,
    column: 4,
    type: NodeType.HYBRID_BRIDGE,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 3, kind: 'flat' },
    ],
    rarity: 25,
  }),

  // Ability Unlock
  node('ability_prismatic_refraction', {
    name: 'Prismatic Refraction',
    description: 'Bend plasma-light around obstacles. Unlock an ability that bypasses enemy evasion.',
    cost: 88,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'elf_prismatic_refraction',
    rarity: 55,
  }),

  // Standard
  node('plasma_dash', {
    name: 'Plasma Dash',
    description: 'Become the bolt. Close any distance in a single heartbeat of living light.',
    cost: 80,
    column: 4,
    effects: [{ stat: StatType.AGI, value: 6, kind: 'flat' }],
    rarity: 55,
  }),
  node('gravity_skimmer', {
    name: 'Gravity Skimmer',
    description: 'Skate along gravity wells like skipping stones across a still pond.',
    cost: 85,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('serendipity_field', {
    name: 'Serendipity Field',
    description: 'An invisible bubble of fortune surrounds you, bending probability in your favor.',
    cost: 78,
    column: 4,
    effects: [{ stat: StatType.LCK, value: 5, kind: 'flat' }],
    rarity: 55,
  }),
  node('triad_harmony', {
    name: 'Triad Harmony',
    description: 'Agility, luck, and stamina resonate as one chord in the symphony of the void.',
    cost: 82,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('prismatic_mind', {
    name: 'Prismatic Mind',
    description: 'A mind attuned to the crystal lattice thinks in spectra beyond mortal comprehension.',
    cost: 75,
    column: 4,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('solar_lancer', {
    name: 'Solar Lancer',
    description: 'Wield a beam of concentrated starlight. Strength from the sun, speed from the void.',
    cost: 75,
    column: 4,
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 3, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('crystal_galley_runner', {
    name: 'Crystal Galley Runner',
    description: 'Your feet know every beam and spire of the galleon. Unmatched agility on home ground.',
    cost: 80,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('starfire_volley', {
    name: 'Starfire Volley',
    description: 'A concentrated burst of star-heat. Crit chance rises with every subsequent shot.',
    cost: 85,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('void_wind_stride', {
    name: 'Void-Wind Stride',
    description: 'Ride the currents between stars. Distance is an illusion you have long since overcome.',
    cost: 78,
    column: 4,
    effects: [{ stat: StatType.AGI, value: 5, kind: 'flat' }],
    rarity: 55,
  }),

  // ========================================================================
  // COLUMN 5 — Anchor, mutex, threshold, conditional, ability (cost 88–120g)
  // ========================================================================

  node('anchor_starlight', {
    name: 'Starlight Volley',
    description: 'Unleash a cascade of plasma bolts — the signature technique of the crystalline star-farers.',
    cost: 100,
    column: 5,
    type: NodeType.STANDARD,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 100,
    isAnchor: true,
  }),

  // Mutex Pair D — "elf_pair_light_void"
  node('radiant_barrage', {
    name: 'Radiant Barrage',
    description: 'Become a prismatic storm of light. Overwhelming speed eclipses all other concerns.',
    cost: 105,
    column: 5,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.AGI, value: 7, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_light_void',
    rarity: 30,
  }),
  node('void_resonance', {
    name: 'Void Resonance',
    description: 'Embrace the darkness between stars. Your intellect becomes a weapon that bypasses all defenses.',
    cost: 100,
    column: 5,
    type: NodeType.MUTEX,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    mutexPairId: 'elf_pair_light_void',
    rarity: 30,
  }),

  // Threshold
  node('treasure_trove', {
    name: 'Treasure Trove',
    description: 'A dragon\'s hoard of star-gold amplifies every plasma bolt with the weight of riches.',
    cost: 110,
    column: 5,
    type: NodeType.THRESHOLD,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    condition: { type: 'gold_unspent', value: 200 },
    rarity: 30,
  }),

  // Conditional
  node('endgame_clarity', {
    name: 'Endgame Clarity',
    description: 'The final turns bring crystalline focus. All that training crystallizes into lethal precision.',
    cost: 100,
    column: 5,
    type: NodeType.CONDITIONAL,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    condition: { type: 'turn_threshold', value: 12 },
    rarity: 30,
  }),

  // Ability Unlock
  node('ability_plasma_storm', {
    name: 'Plasma Storm',
    description: 'Summon a localized ion tempest. Unlock a devastating AoE plasma ability.',
    cost: 108,
    column: 5,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'elf_plasma_storm',
    rarity: 50,
  }),

  // Standard
  node('infinite_agility', {
    name: 'Infinite Agility',
    description: 'Approach the asymptotic limit of elven motion. Each attack a blur.',
    cost: 100,
    column: 5,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('stellar_dance', {
    name: 'Stellar Dance',
    description: 'Weave between enemy fire as if choreographed by the cosmos itself.',
    cost: 100,
    column: 5,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('infinite_luck', {
    name: 'Infinite Luck',
    description: 'Fortune bends around you like light around a singularity. Store discounts hit their floor; crits flood.',
    cost: 95,
    column: 5,
    effects: [
      { stat: StatType.LCK, value: 6, kind: 'flat' },
      { stat: StatType.AGI, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('crystal_lance', {
    name: 'Crystal Lance',
    description: 'Forge a spear of compressed starlight. The strength to pierce any armored hull.',
    cost: 95,
    column: 5,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.AGI, value: 3, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('unending_vigil', {
    name: 'Unending Vigil',
    description: 'The ancients watched for eons without rest. Their endurance is now yours.',
    cost: 95,
    column: 5,
    effects: [
      { stat: StatType.STA, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 50,
  }),

  // ========================================================================
  // COLUMN 6 — Anti-synergy, threshold, deep standard nodes (cost 120–150g)
  // ========================================================================

  // Anti-Synergy
  node('blissful_ignorance', {
    name: 'Blissful Ignorance',
    description: 'Abandon calculated approaches entirely. Purely instinct-driven luck surges beyond all limits.',
    cost: 125,
    column: 6,
    type: NodeType.ANTI_SYNERGY,
    effects: [
      { stat: StatType.INT, value: -6, kind: 'flat' },
      { stat: StatType.LCK, value: 8, kind: 'flat' },
    ],
    rarity: 30,
  }),

  // Threshold
  node('dragon_hoard', {
    name: "Dragon's Hoard",
    description: 'A mountain of star-gold radiates so much fortune that reality itself bends.',
    cost: 140,
    column: 6,
    type: NodeType.THRESHOLD,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 5, kind: 'flat' },
    ],
    condition: { type: 'gold_unspent', value: 300 },
    rarity: 30,
  }),

  // Ability Unlock
  node('ability_ancients_wrath', {
    name: "Ancient's Wrath",
    description: 'Call upon the fury of eons. Unlock the ultimate elven ability — devastating and elegant.',
    cost: 145,
    column: 6,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    unlocksAbility: 'elf_ancients_wrath',
    rarity: 50,
  }),

  // Standard
  node('final_velocity', {
    name: 'Final Velocity',
    description: 'The terminal speed of an elf unchained. No barrier can slow your plasma bolts.',
    cost: 130,
    column: 6,
    effects: [{ stat: StatType.AGI, value: 7, kind: 'flat' }],
    rarity: 55,
  }),
  node('constellation_walker', {
    name: 'Constellation Walker',
    description: 'Stride from star to star along threads of pure fortune. Agility and luck entwined at their peak.',
    cost: 135,
    column: 6,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('final_fortune', {
    name: 'Final Fortune',
    description: 'The ultimate expression of cosmic luck. Crit every other strike; stores nearly give items away.',
    cost: 125,
    column: 6,
    effects: [
      { stat: StatType.LCK, value: 7, kind: 'flat' },
      { stat: StatType.AGI, value: 1, kind: 'flat' },
    ],
    rarity: 55,
  }),
  node('perfect_balance', {
    name: 'Perfect Balance',
    description: 'The ancients achieved a state of perfect equilibrium. Speed, luck, and stamina in sublime ratio.',
    cost: 140,
    column: 6,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('star_mind_synthesis', {
    name: 'Star-Mind Synthesis',
    description: 'Merge intellect with starlight. Intelligence fuels speed in a closed recursive loop.',
    cost: 130,
    column: 6,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.AGI, value: 3, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('plasma_maelstrom', {
    name: 'Plasma Maelstrom',
    description: 'Spiral plasma bolts around the battlefield. Unmatched AoE agility.',
    cost: 140,
    column: 6,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
    rarity: 50,
  }),
  node('nova_reflex', {
    name: 'Nova Reflex',
    description: 'Dodge a supernova at close range. Your reflexes now operate at light-speed.',
    cost: 138,
    column: 6,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    rarity: 50,
  }),

  // ========================================================================
  // COLUMN 7 — Final anchor, ability, capstone nodes (cost 150–180g)
  // ========================================================================

  node('anchor_eternal', {
    name: 'Eternal Vigil',
    description: 'The final form of crystalline perfection. An elf at the apex of grace, unassailable.',
    cost: 170,
    column: 7,
    type: NodeType.STANDARD,
    effects: [
      { stat: StatType.AGI, value: 8, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    rarity: 100,
    isAnchor: true,
  }),

  // Ability Unlock
  node('ability_star_farer_zenith', {
    name: "Star-Farer's Zenith",
    description: 'The ultimate technique of the crystalline ancients. Unlock a capstone ability that fires while STA permits.',
    cost: 175,
    column: 7,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    unlocksAbility: 'elf_star_farers_zenith',
    rarity: 50,
  }),

  // Codex unlock — add_node_to_pool targets
  node('starweaver', {
    name: 'Star-Weaver',
    description: 'Thread starlight into your constellation. Codex-unlocked advanced node.',
    cost: 95,
    column: 4,
    effects: [
      { stat: StatType.AGI, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 4, kind: 'flat' },
    ],
    rarity: 80,
  }),

  node('prismatic_lens', {
    name: 'Prismatic Lens',
    description: 'A focusing crystal that refracts luck into pure motion. Codex-unlocked.',
    cost: 110,
    column: 5,
    effects: [
      { stat: StatType.AGI, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 5, kind: 'flat' },
    ],
    rarity: 80,
  }),

  // Standard capstones
  node('perfect_crystalline_form', {
    name: 'Perfect Crystalline Form',
    description: 'Transcend flesh and become living crystal. Agility approaches the speed of thought itself.',
    cost: 170,
    column: 7,
    effects: [
      { stat: StatType.AGI, value: 8, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
    rarity: 45,
  }),
  node('star_fated_destiny', {
    name: 'Star-Fated Destiny',
    description: 'Your fate has been written in the stars since before the first sun ignited. Store discount reaches its absolute floor at 50%.',
    cost: 165,
    column: 7,
    effects: [
      { stat: StatType.LCK, value: 8, kind: 'flat' },
      { stat: StatType.AGI, value: 3, kind: 'flat' },
    ],
    rarity: 45,
  }),
  node('twin_ascendancy', {
    name: 'Twin Ascendancy',
    description: 'Agility and luck ascend together, a binary star system reaching its final, brilliant ignition.',
    cost: 175,
    column: 7,
    effects: [
      { stat: StatType.AGI, value: 6, kind: 'flat' },
      { stat: StatType.LCK, value: 6, kind: 'flat' },
    ],
    rarity: 45,
  }),
]
