import { Archetype, StatType, NodeType } from '../../types/enums'
import type { NodeDef } from '../../types/nodes'

function node(id: string, overrides: Partial<NodeDef> & Pick<NodeDef, 'name' | 'description' | 'cost' | 'column'>): NodeDef {
  return {
    id: `sporgk_${id}`,
    type: NodeType.STANDARD,
    archetype: Archetype.SPORGK,
    effects: [],
    rarity: 50,
    isAnchor: false,
    ...overrides,
  }
}

export const sporgkNodes: NodeDef[] = [
  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 0 — The Hollowed Core (Start)
  // ═══════════════════════════════════════════════════════════════════

  node('start', {
    name: 'The Hollowed Core',
    description: 'A dormant star-furnace stirs within your asteroid vessel. The first ember of cosmic violence.',
    cost: 0,
    column: 0,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.STR, value: 1, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c0_feral_grip', {
    name: 'Feral Grip',
    description: 'Claws honed on asteroid shards. Raw strength courses through scarred knuckles.',
    cost: 25,
    column: 0,
    rarity: 60,
    effects: [{ stat: StatType.STR, value: 2, kind: 'flat' }],
  }),

  node('c0_first_breath', {
    name: 'Titan\'s First Breath',
    description: 'Warp-tainted air fills lungs never meant for vacuum. Stamina blooms like a wounded star.',
    cost: 25,
    column: 0,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 2, kind: 'flat' }],
  }),

  node('c0_gravity_well', {
    name: 'Gravity Well Conditioning',
    description: 'Training in the crushing embrace of a micro-singularity. Muscle and endurance forged together.',
    cost: 30,
    column: 0,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c0_chip_armor', {
    name: 'Asteroid Chip Armor',
    description: 'Fragments of a shattered moon hammered into crude plating. More stubborn than elegant.',
    cost: 25,
    column: 0,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 2, kind: 'flat' }],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 1 — Early Violence
  // ═══════════════════════════════════════════════════════════════════

  node('anchor_greataxe', {
    name: 'Asteroid Greataxe Calibration',
    description: 'The rocket-greataxe hums with buried fury. Each swing carries the weight of a hollowed world.',
    cost: 35,
    column: 1,
    isAnchor: true,
    rarity: 100,
    effects: [{ stat: StatType.STR, value: 4, kind: 'flat' }],
  }),

  node('c1_warp_rage', {
    name: 'Warp-Fire Enragement',
    description: 'Cosmic flame licks at the edges of thought. Pain becomes a distant suggestion.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 3, kind: 'flat' }],
    unlocksAbility: 'sporgk_rage',
  }),

  node('c1_kinetic_stance', {
    name: 'Kinetic Impact Stance',
    description: 'Plant your feet in zero-G and let inertia do the work. The asteroid does not dodge.',
    cost: 35,
    column: 1,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c1_void_hound', {
    name: 'Void Hound Endurance',
    description: 'Bred in the kennels of abandoned dreadnoughts. Never stops, never questions.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 3, kind: 'flat' }],
  }),

  node('c1_rocket_blood', {
    name: 'Rocket Propellant Blood',
    description: 'Your veins carry refined promethium. Faster reactions, quicker violence.',
    cost: 30,
    column: 1,
    rarity: 45,
    effects: [{ stat: StatType.AGI, value: 2, kind: 'flat' }],
  }),

  node('c1_barbarian_gambit', {
    name: 'Barbarian\'s Gambit',
    description: 'Throw your weight behind the blow and trust the void to catch you. Or not.',
    cost: 35,
    column: 1,
    rarity: 45,
    effects: [
      { stat: StatType.STR, value: 2, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
  }),

  node('c1_thruster_vitality', {
    name: 'Thruster-Core Vitality',
    description: 'Plasma thrusters vent excess heat into bio-conduits. The ship feeds the body.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 2, kind: 'flat' }],
  }),

  node('c1_cosmic_lifting', {
    name: 'Cosmic Heavy Lifting',
    description: 'Hauling asteroid fragments by hand builds a frame that laughs at gravity.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 3, kind: 'flat' }],
  }),

  node('c1_asteroid_instincts', {
    name: 'Asteroid Field Instincts',
    description: 'Navigate debris clouds at combat speed. Reflexes honed by near-misses and cosmic luck.',
    cost: 35,
    column: 1,
    rarity: 45,
    effects: [
      { stat: StatType.AGI, value: 1, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c1_unarmored_fury', {
    name: 'Unarmored Fury',
    description: 'Shed your plating and let pain become fuel. Raw flesh carries its own defense.',
    cost: 40,
    column: 1,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'gear_unequipped', value: 2 },
    effects: [{ stat: StatType.STR, value: 5, kind: 'flat' }],
  }),

  node('c1_berserker', {
    name: 'Berserker Stance',
    description: 'Abandon all guard. Every fiber commits to the kill. Defensive instinct is a luxury for the unblooded.',
    cost: 35,
    column: 1,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_stance_a',
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: -1, kind: 'flat' },
    ],
  }),

  node('c1_juggernaut', {
    name: 'Juggernaut Stance',
    description: 'Become the unbreakable rock. Let the enemy exhaust themselves against your wall of flesh.',
    cost: 35,
    column: 1,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_stance_a',
    effects: [
      { stat: StatType.STR, value: -1, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 2 — Tempering the Brute
  // ═══════════════════════════════════════════════════════════════════

  node('c2_titan_carapace', {
    name: 'Titan Plate Carapace',
    description: 'Fused asteroid ore grafted to bone. Your skeleton remembers the pressure of planetary birth.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 4, kind: 'flat' }],
  }),

  node('c2_greataxe_mastery', {
    name: 'Rocket Greataxe Mastery',
    description: 'The weapon becomes an extension of kill-intent. Every swing is a trajectory plotted in rage.',
    cost: 55,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_void_shatter', {
    name: 'Void-Shatter Impact',
    description: 'Strike the space between atoms. The resulting shockwave obeys only you.',
    cost: 55,
    column: 2,
    rarity: 50,
    effects: [{ stat: StatType.STR, value: 5, kind: 'flat' }],
    unlocksAbility: 'sporgk_crush',
  }),

  node('c2_warp_endurance', {
    name: 'Warp-Fire Endurance',
    description: 'Standing inside a controlled warp-conflagration builds tolerance few species possess.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 4, kind: 'flat' }],
  }),

  node('c2_lowg_pounce', {
    name: 'Low-Gravity Pounce',
    description: 'Zero-G wrestling pits teach explosive movement. Close distance before the enemy blinks.',
    cost: 45,
    column: 2,
    rarity: 45,
    effects: [{ stat: StatType.AGI, value: 3, kind: 'flat' }],
  }),

  node('c2_barbaric_intuition', {
    name: 'Barbaric Intuition',
    description: 'The void speaks in frequencies only the truly reckless can hear. Listen with your scars.',
    cost: 45,
    column: 2,
    rarity: 40,
    effects: [{ stat: StatType.INT, value: 3, kind: 'flat' }],
  }),

  node('c2_armorbreaker', {
    name: 'Armorbreaker\'s Rhythm',
    description: 'Once you\'ve tasted enough hull-metal, your fists learn to find the welds and rivets. Precision through repetition.',
    cost: 50,
    column: 2,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'stat_threshold', stat: StatType.STR, value: 12 },
    effects: [{ stat: StatType.STR, value: 6, kind: 'flat' }],
  }),

  node('c2_warp_overload', {
    name: 'Warp-Fire Overload',
    description: 'Crank the warp-core past safety thresholds. More power, more carnage, more collateral.',
    cost: 55,
    column: 2,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_warp',
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_warp_containment', {
    name: 'Warp-Fire Containment',
    description: 'Reinforce the reactor with ritual scarring. Stable, eternal, unquenchable heat.',
    cost: 55,
    column: 2,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_warp',
    effects: [
      { stat: StatType.STR, value: 1, kind: 'flat' },
      { stat: StatType.STA, value: 5, kind: 'flat' },
    ],
  }),

  node('c2_hull_training', {
    name: 'Asteroid Hull Training',
    description: 'Patrol the outer hull during warp. The radiation burns and the cold strengthens.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c2_reckless_charge', {
    name: 'Reckless Charge',
    description: 'The shortest distance between you and violence is a straight line, regardless of obstacles.',
    cost: 45,
    column: 2,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
  }),

  node('c2_stellar_detritus', {
    name: 'Stellar Detritus Armor',
    description: 'Asteroid trash fused into battle-plate. Ugly, heavy, and shockingly lucky.',
    cost: 50,
    column: 2,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 3 — Warp-Fire Heart
  // ═══════════════════════════════════════════════════════════════════

  node('anchor_warp_heart', {
    name: 'Warp-Fire Heart',
    description: 'A captive star-core beats where your heart once was. Each pulse is a furnace-pledge to destruction.',
    cost: 65,
    column: 3,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c3_void_smash', {
    name: 'Void-Smash Posture',
    description: 'Cock your fist back to the elbow of reality. When it lands, even the vacuum recoils.',
    cost: 65,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 5, kind: 'flat' }],
  }),

  node('c3_second_wind', {
    name: 'Titan\'s Second Wind',
    description: 'When lesser beings collapse, you discover reservoirs of violence they will never know.',
    cost: 65,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 5, kind: 'flat' }],
  }),

  node('c3_gravity_hammer', {
    name: 'Gravity-Hammer Strike',
    description: 'A localized singularity condenses on impact. The enemy is crushed from every direction at once.',
    cost: 70,
    column: 3,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'sporgk_hammer',
  }),

  node('c3_cosmic_blood_rage', {
    name: 'Cosmic Blood Rage',
    description: 'Your ichor ignites on contact with hostile atmosphere. Bleeding is now a tactical decision.',
    cost: 70,
    column: 3,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c3_rotation_discipline', {
    name: 'Asteroid Rotation Discipline',
    description: 'Run against the spin of your hollowed world. Build coordination that defies orbital mechanics.',
    cost: 60,
    column: 3,
    rarity: 45,
    effects: [{ stat: StatType.AGI, value: 4, kind: 'flat' }],
  }),

  node('c3_predator_cunning', {
    name: 'Predator\'s Cunning',
    description: 'Killing is not enough. You must understand why the prey chose to die.',
    cost: 60,
    column: 3,
    rarity: 40,
    effects: [{ stat: StatType.INT, value: 4, kind: 'flat' }],
  }),

  node('c3_uncharted_drift', {
    name: 'Uncharted Void Drift',
    description: 'Navigate by instinct across unmapped sectors. Fortune favors the oblivious.',
    cost: 60,
    column: 3,
    rarity: 40,
    effects: [{ stat: StatType.LCK, value: 4, kind: 'flat' }],
  }),

  node('c3_kinetic_absorption', {
    name: 'Kinetic Absorption',
    description: 'You\'ve endured enough asteroid strikes that blunt force now feels like applause.',
    cost: 70,
    column: 3,
    type: NodeType.CONDITIONAL,
    rarity: 25,
    condition: { type: 'stat_threshold', stat: StatType.STA, value: 18 },
    effects: [{ stat: StatType.STA, value: 7, kind: 'flat' }],
  }),

  node('c3_berserker_sacrifice', {
    name: 'Berserker\'s Sacrifice',
    description: 'Rend your higher cognition from your skull and feed it to the warp-fires. Thought was slowing you down.',
    cost: 75,
    column: 3,
    type: NodeType.ANTI_SYNERGY,
    rarity: 20,
    effects: [
      { stat: StatType.INT, value: -5, kind: 'flat' },
      { stat: StatType.STR, value: 10, kind: 'flat' },
    ],
  }),

  node('c3_fifth_turn_surge', {
    name: 'Fifth Turn Surge',
    description: 'The rhythm of the raid becomes muscle memory. By the second boss, bloodlust is autonomic.',
    cost: 75,
    column: 3,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'turn_threshold', value: 10 },
    effects: [
      { stat: StatType.STR, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c3_greataxe_tempering', {
    name: 'Rocket-Greataxe Tempering',
    description: 'Quenched in the corona of a blue hypergiant. The blade now screams in frequencies that shatter bone.',
    cost: 70,
    column: 3,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_warp_pulse', {
    name: 'Warp-Pulse Conditioning',
    description: 'Exposure to intermittent warp-surges has rewired your nervous system for unnatural speed.',
    cost: 65,
    column: 3,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_ironhide_shell', {
    name: 'Ironhide Asteroid Shell',
    description: 'Nickel-iron deposits from a dead world laminate your hide. A geological defense.',
    cost: 65,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 6, kind: 'flat' }],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 4 — Deep Void Brutality
  // ═══════════════════════════════════════════════════════════════════

  node('c4_annihilation_stance', {
    name: 'Cosmic Annihilation Stance',
    description: 'Your battle posture creates a localized null-field. Debris and hope evaporate simultaneously.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 6, kind: 'flat' }],
  }),

  node('c4_unyielding_core', {
    name: 'Titan\'s Unyielding Core',
    description: 'Your center of mass has collapsed into something denser than physics should allow.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 6, kind: 'flat' }],
  }),

  node('c4_warp_furnace', {
    name: 'Warp-Fire Furnace',
    description: 'A second reactor, improvised from salvage and spite, grafts onto your primary core.',
    cost: 90,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c4_asteroid_impact', {
    name: 'Asteroid Impact Doctrine',
    description: 'Your asteroid-ship is a weapon first, a vessel second. Ram them at superluminal velocities.',
    cost: 90,
    column: 4,
    rarity: 50,
    effects: [{ stat: StatType.STR, value: 7, kind: 'flat' }],
    unlocksAbility: 'sporgk_impact',
  }),

  node('c4_void_nomad', {
    name: 'Void Nomad\'s Resilience',
    description: 'Generations of deep-space wandering bred a constitution that treats vacuum like a mild breeze.',
    cost: 85,
    column: 4,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_star_map', {
    name: 'Barbarian\'s Star-Map',
    description: 'Constellations scratched onto your gauntlet in dried blood. The stars themselves offer tactical advice.',
    cost: 80,
    column: 4,
    rarity: 40,
    effects: [{ stat: StatType.INT, value: 5, kind: 'flat' }],
  }),

  node('c4_rocket_agility', {
    name: 'Rocket-Pack Agility Drills',
    description: 'Full-combat maneuvering in an asteroid thicket. The drills kill a quarter of trainees. You survived.',
    cost: 80,
    column: 4,
    rarity: 45,
    effects: [{ stat: StatType.AGI, value: 5, kind: 'flat' }],
  }),

  node('c4_naked_singularity', {
    name: 'Naked Singularity',
    description: 'Strip away every layer of protection. What remains is a point of infinite density — and infinite damage.',
    cost: 90,
    column: 4,
    type: NodeType.CONDITIONAL,
    rarity: 25,
    condition: { type: 'gear_unequipped', value: 2 },
    effects: [{ stat: StatType.STR, value: 10, kind: 'flat' }],
  }),

  node('c4_lucky_breach', {
    name: 'Lucky Breach',
    description: 'Fortune has always smiled on the first pug through the hull breach. You make your own luck now.',
    cost: 85,
    column: 4,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'stat_threshold', stat: StatType.LCK, value: 10 },
    effects: [
      { stat: StatType.LCK, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c4_sustained_rage', {
    name: 'Sustained Rage',
    description: 'A cold fury that never crests, never fades. An eternal pressure behind every strike.',
    cost: 85,
    column: 4,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_rage',
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_explosive_burst', {
    name: 'Explosive Burst',
    description: 'Compress all your violence into a single heartbeat. After that, nothing they throw matters.',
    cost: 85,
    column: 4,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_rage',
    effects: [
      { stat: StatType.STR, value: 4, kind: 'flat' },
      { stat: StatType.AGI, value: 4, kind: 'flat' },
    ],
  }),

  node('c4_armor_melt', {
    name: 'Armor Melt',
    description: 'Crank your core temperature until your own plating sloughs off. What remains is pure, unburdened muscle.',
    cost: 80,
    column: 4,
    type: NodeType.ANTI_SYNERGY,
    rarity: 20,
    effects: [
      { stat: StatType.STA, value: -6, kind: 'flat' },
      { stat: StatType.STR, value: 12, kind: 'flat' },
    ],
  }),

  node('c4_stellar_forging', {
    name: 'Stellar Core-Forging',
    description: 'Let a dying star\'s final pulse temper your body. Every cell becomes a weapon.',
    cost: 90,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c4_ram_proficiency', {
    name: 'Asteroid Ram Proficiency',
    description: 'The front third of your ship is now solid impact-foam. Pedal to the hull, every time.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 6, kind: 'flat' }],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 5 — Void-Smash Doctrine
  // ═══════════════════════════════════════════════════════════════════

  node('anchor_void_doctrine', {
    name: 'Void-Smash Doctrine',
    description: 'A philosophy of impact. If the universe will not yield, apply escalating force until it does.',
    cost: 100,
    column: 5,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.STR, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c5_cosmic_wrath', {
    name: 'Cosmic Breaker\'s Wrath',
    description: 'You no longer fight enemies. You break concepts. Their armor is a suggestion you decline.',
    cost: 100,
    column: 5,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 7, kind: 'flat' }],
  }),

  node('c5_titan_flesh', {
    name: 'Unyielding Titan Flesh',
    description: 'Your tissue has the tensile strength of collapsed star matter. Wounds close before they fully open.',
    cost: 100,
    column: 5,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 7, kind: 'flat' }],
  }),

  node('c5_warp_immolation', {
    name: 'Warp-Fire Immolation',
    description: 'Become the fire. Your body is the fuel, the air, and the spark. Everything in reach burns.',
    cost: 105,
    column: 5,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
    unlocksAbility: 'sporgk_immolate',
  }),

  node('c5_gravity_expertise', {
    name: 'Gravity Well Expertise',
    description: 'Manipulate local gravity with nothing but your own mass and conviction. Speed becomes irrelevant.',
    cost: 95,
    column: 5,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
  }),

  node('c5_desperation', {
    name: 'Desperation Protocol',
    description: 'When the war-chest runs dry, your body remembers the starvation years. That old hunger is a weapon.',
    cost: 110,
    column: 5,
    type: NodeType.CONDITIONAL,
    rarity: 25,
    condition: { type: 'gold_unspent', value: 200 },
    effects: [{ stat: StatType.STR, value: 10, kind: 'flat' }],
  }),

  node('c5_turn_fifteen', {
    name: 'Turn Fifteen Awakening',
    description: 'Three bosses deep, your body finally admits what your mind always knew: this is what you were made for.',
    cost: 110,
    column: 5,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'turn_threshold', value: 15 },
    effects: [
      { stat: StatType.STR, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 6, kind: 'flat' },
    ],
  }),

  node('c5_void_bridge', {
    name: 'Void Bridge: Siphon',
    description: 'A captured vampire siphon-gland, crudely bolted to your reactor. It drinks the enemy\'s essence and feeds the fires.',
    cost: 105,
    column: 5,
    type: NodeType.HYBRID_BRIDGE,
    rarity: 20,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.INT, value: 4, kind: 'flat' },
    ],
  }),

  node('c5_rocket_titan', {
    name: 'Rocket Titan Stance',
    description: 'Your thrusters fire in combat rhythm. Every dodge is a strafing run. Every advance is terminal velocity.',
    cost: 100,
    column: 5,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c5_cosmic_brute', {
    name: 'Cosmic Brute Conditioning',
    description: 'The void is your gymnasium. Every hostile encounter is just another set.',
    cost: 100,
    column: 5,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c5_void_breacher', {
    name: 'Void Breacher\'s Insight',
    description: 'Every hull you\'ve breached has taught you something. Their engineering is now your tactical library.',
    cost: 95,
    column: 5,
    rarity: 45,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STR, value: 3, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 6 — The Cosmic Onslaught
  // ═══════════════════════════════════════════════════════════════════

  node('c6_apocalypse_greataxe', {
    name: 'Apocalypse Greataxe',
    description: 'The final form of the rocket-greataxe. Its ignition sequence is a funeral rite for whatever it touches.',
    cost: 130,
    column: 6,
    rarity: 55,
    effects: [{ stat: StatType.STR, value: 8, kind: 'flat' }],
  }),

  node('c6_nova_vitality', {
    name: 'Nova-Core Vitality',
    description: 'A dying star\'s last coherent pulse, trapped in a containment lattice where your stomach used to be.',
    cost: 130,
    column: 6,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 8, kind: 'flat' }],
  }),

  node('c6_void_sundering', {
    name: 'Void-Sundering Roar',
    description: 'Your battle cry propagates through vacuum by sheer ontological insistence. Sound is optional.',
    cost: 135,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c6_doom_prophecy', {
    name: 'Asteroid Doom Prophecy',
    description: 'You\'ve seen the extinction-level event that ends this sector. You plan to be the one delivering it.',
    cost: 135,
    column: 6,
    rarity: 45,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.INT, value: 5, kind: 'flat' },
    ],
  }),

  node('c6_final_gambit', {
    name: 'Final Gambit',
    description: 'You\'ve spent enough gold to buy a small moon. Now you fight like you have nothing left to lose.',
    cost: 150,
    column: 6,
    type: NodeType.CONDITIONAL,
    rarity: 20,
    condition: { type: 'gold_spent', value: 1000 },
    effects: [{ stat: StatType.STR, value: 12, kind: 'flat' }],
  }),

  node('c6_turn_eighteen', {
    name: 'Turn Eighteen Threshold',
    description: 'Only the final boss remains. Your body, anticipating the last war, sheds every biological limitation.',
    cost: 135,
    column: 6,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'turn_threshold', value: 18 },
    effects: [
      { stat: StatType.STA, value: 10, kind: 'flat' },
      { stat: StatType.STR, value: 5, kind: 'flat' },
    ],
  }),

  node('c6_cosmic_rampart', {
    name: 'Cosmic Rampart',
    description: 'Anchor yourself to the fabric of spacetime. Let the universe break itself against your immovability.',
    cost: 135,
    column: 6,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_rampart',
    effects: [
      { stat: StatType.STA, value: 7, kind: 'flat' },
      { stat: StatType.STR, value: 3, kind: 'flat' },
    ],
  }),

  node('c6_cosmic_onslaught', {
    name: 'Cosmic Onslaught',
    description: 'Abandon the concept of defense. Become an unblockable force. The best shield is a dead enemy.',
    cost: 135,
    column: 6,
    type: NodeType.MUTEX,
    rarity: 25,
    mutexPairId: 'sporgk_mutex_rampart',
    effects: [
      { stat: StatType.STR, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c6_elf_bridge', {
    name: 'Elf Bridge: Crystalline Brute',
    description: 'An elf crystal-lattice graft, force-fed raw asteroid ore until it adapted. Unnatural grace, brute force.',
    cost: 135,
    column: 6,
    type: NodeType.HYBRID_BRIDGE,
    rarity: 20,
    effects: [
      { stat: StatType.AGI, value: 5, kind: 'flat' },
      { stat: StatType.STR, value: 5, kind: 'flat' },
    ],
  }),

  node('c6_warp_storm', {
    name: 'Warp Storm Endurance',
    description: 'Navigate a sustained warp-storm on foot. The radiation peels skin but leaves something harder underneath.',
    cost: 130,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 5, kind: 'flat' },
    ],
  }),

  node('c6_pug_legend', {
    name: 'Cosmic Pug Legend',
    description: 'You\'ve become the story they tell in every asteroid bar from here to the Crab Nebula.',
    cost: 130,
    column: 6,
    rarity: 45,
    effects: [{ stat: StatType.LCK, value: 6, kind: 'flat' }],
  }),

  node('c6_stellar_destroyer', {
    name: 'Stellar Destroyer\'s Form',
    description: 'Your silhouette against the starfield is now indistinguishable from a warship. You\'ve earned that comparison.',
    cost: 135,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.AGI, value: 2, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 7 — The Pinnacle
  // ═══════════════════════════════════════════════════════════════════

  node('anchor_cosmic_breaker', {
    name: 'Cosmic Breaker Pinnacle',
    description: 'The final form. You have become the extinction event that ancient civilizations warned their children about.',
    cost: 170,
    column: 7,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.STR, value: 10, kind: 'flat' },
      { stat: StatType.STA, value: 5, kind: 'flat' },
    ],
  }),

  node('c7_eternal_fire', {
    name: 'Eternal Warp-Fire',
    description: 'The flame that will never extinguish. When the universe finally cools, this ember will remain — and it remembers your name.',
    cost: 170,
    column: 7,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
    unlocksAbility: 'sporgk_eternal_fire',
  }),

  node('c7_voidborn_demigod', {
    name: 'Voidborn Demigod',
    description: 'The void no longer kills you. It asks permission. You have not yet decided whether to grant it.',
    cost: 180,
    column: 7,
    rarity: 50,
    effects: [
      { stat: StatType.STR, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 6, kind: 'flat' },
    ],
  }),

  // Codex unlock — add_node_to_pool target
  node('berserker_rite', {
    name: 'Berserker Rite',
    description: 'A forbidden rite that floods the hull with warp-rage. Unlocked via Codex.',
    cost: 90,
    column: 4,
    rarity: 80,
    effects: [
      { stat: StatType.STR, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c7_final_threshold', {
    name: 'Final Threshold Breach',
    description: 'The end-boss looms. Your body, knowing this is the last war, transcends every limitation it once accepted.',
    cost: 175,
    column: 7,
    type: NodeType.THRESHOLD,
    rarity: 20,
    condition: { type: 'turn_threshold', value: 20 },
    effects: [
      { stat: StatType.STR, value: 12, kind: 'flat' },
      { stat: StatType.STA, value: 8, kind: 'flat' },
    ],
  }),

  node('c7_last_stand', {
    name: 'Last Asteroid Stand',
    description: 'Your asteroid-ship crumbles around you. Fine. You never needed it. The only two things between you and the void are your fists.',
    cost: 170,
    column: 7,
    type: NodeType.ANTI_SYNERGY,
    rarity: 20,
    effects: [
      { stat: StatType.AGI, value: -8, kind: 'flat' },
      { stat: StatType.STR, value: 15, kind: 'flat' },
      { stat: StatType.STA, value: 8, kind: 'flat' },
    ],
  }),
]
