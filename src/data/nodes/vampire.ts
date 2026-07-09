import { Archetype, StatType, NodeType } from '../../types/enums'
import type { NodeDef } from '../../types/nodes'

function node(id: string, overrides: Partial<NodeDef> & Pick<NodeDef, 'name' | 'description' | 'cost' | 'column'>): NodeDef {
  return {
    id: `vamp_${id}`,
    type: NodeType.STANDARD,
    archetype: Archetype.VAMPIRE,
    effects: [],
    rarity: 50,
    isAnchor: false,
    ...overrides,
  }
}

export const vampireNodes: NodeDef[] = [
  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 0 — First Contact with the Void
  // ═══════════════════════════════════════════════════════════════════

  node('c0_void_spark', {
    name: 'Void Spark',
    description: 'A single ember of nothingness kindles in your cathedral-ship\'s sanctum. The first taste of the vacuum\'s hunger.',
    cost: 25,
    column: 0,
    rarity: 60,
    effects: [{ stat: StatType.INT, value: 2, kind: 'flat' }],
  }),

  node('c0_essence_draw', {
    name: 'Essence Draw',
    description: 'Sustain yourself on ambient life-force leaking through the hull. Even the void bleeds something.',
    cost: 25,
    column: 0,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 2, kind: 'flat' }],
  }),

  node('c0_crypt_senses', {
    name: 'Crypt-Sense Attunement',
    description: 'Attune your perceptions to the frequencies of decay. What dies in vacuum leaves an echo.',
    cost: 30,
    column: 0,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 2, kind: 'flat' }],
  }),

  node('c0_vacuum_plate', {
    name: 'Vacuum-Hardened Plating',
    description: 'Reinforce your cathedral-ship\'s hull against the crushing absence. Endurance is the first sacrament.',
    cost: 30,
    column: 0,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 2, kind: 'flat' },
      { stat: StatType.STR, value: 1, kind: 'flat' },
    ],
  }),

  node('c0_initiate_rites', {
    name: 'Initiate\'s Rites',
    description: 'The ancient ceremonies of the void-lords, performed in darkness absolute. Mind, body, and fortune intertwine.',
    cost: 35,
    column: 0,
    rarity: 50,
    effects: [
      { stat: StatType.INT, value: 1, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 1 — The Awakening
  // ═══════════════════════════════════════════════════════════════════

  node('c1_awakened_throne', {
    name: 'The Awakened Throne',
    description: 'The throne pulses with undead consciousness. Your cathedral-ship opens eyes that were never biological. The void now recognizes you.',
    cost: 40,
    column: 1,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c1_lesser_siphon', {
    name: 'Lesser Siphon',
    description: 'The first lesson of the void: all life is borrowable. Every encounter is a transaction where you are always the creditor.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
    unlocksAbility: 'vamp_siphon',
  }),

  node('c1_void_attunement', {
    name: 'Void Attunement',
    description: 'Ignore armor entirely — the vacuum touches what it chooses, bypassing all material barriers with contemptuous ease.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 3, kind: 'flat' }],
  }),

  node('c1_star_marrow', {
    name: 'Stellar Marrow Infusion',
    description: 'Channel the marrow of dead stars through your cathedral\'s conduits. Millennia of decay become your stamina.',
    cost: 30,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 3, kind: 'flat' }],
  }),

  node('c1_null_chant', {
    name: 'Chant of the Null',
    description: 'A litany spoken into the vacuum reinforces both mind and vessel. Sound travels strangely where nothing exists.',
    cost: 35,
    column: 1,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c1_bone_plating', {
    name: 'Ossuary Hull Plating',
    description: 'Layered bone harvested from cathedral crypts. The dead contribute their architecture to your survival.',
    cost: 35,
    column: 1,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 2, kind: 'flat' },
      { stat: StatType.STR, value: 2, kind: 'flat' },
    ],
  }),

  node('c1_spectral_gaze', {
    name: 'Spectral Gaze',
    description: 'Peer through the veil between life and vacuum. The weave of fate becomes faintly legible.',
    cost: 35,
    column: 1,
    rarity: 45,
    effects: [
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
  }),

  node('c1_void_push', {
    name: 'Void-Push',
    description: 'Move matter with thought alone. No armor resists the void\'s claim — it bypasses evasion and pierces all defenses.',
    cost: 40,
    column: 1,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 4, kind: 'flat' }],
  }),

  node('c1_drain_touch', {
    name: 'Drain-Touch',
    description: 'Every physical contact is a siphon. The weak grow weaker; the void grows stronger.',
    cost: 35,
    column: 1,
    rarity: 50,
    effects: [
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c1_hollowed_fasting', {
    name: 'Hollowed Fasting',
    description: 'The void rewards austerity. Unencumbered by gear, your mind sharpens to a razor\'s edge.',
    cost: 35,
    column: 1,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'gear_unequipped', value: 0 },
    effects: [{ stat: StatType.INT, value: 5, kind: 'flat' }],
  }),

  node('c1_void_essence', {
    name: 'Void Essence',
    description: 'Raw void essence floods your neural conduits. Pure, undiluted power — devastating but unsophisticated.',
    cost: 40,
    column: 1,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_void',
    rarity: 25,
    effects: [{ stat: StatType.INT, value: 5, kind: 'flat' }],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 2 — Cathedral Architecture
  // ═══════════════════════════════════════════════════════════════════

  node('c2_cathedral_foundation', {
    name: 'Cathedral Foundation',
    description: 'The bones of your void-cathedral settle into place. Architecture becomes theology.',
    cost: 45,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c2_siphon_rush', {
    name: 'Siphon Rush',
    description: 'Accelerate the drain. Life-force flows into you like a collapsing star swallowing its own light.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 3, kind: 'flat' }],
    unlocksAbility: 'vamp_shroud',
  }),

  node('c2_necrotic_tithe', {
    name: 'Necrotic Tithe',
    description: 'A percentage of all death within your cathedral\'s reach is yours. The void takes its cut first.',
    cost: 45,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_ossuary_hull', {
    name: 'Ossuary Hull Reinforcement',
    description: 'Stacked bones of void-whales form a second hull. The dead protect the undying.',
    cost: 45,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 2, kind: 'flat' },
      { stat: StatType.STR, value: 3, kind: 'flat' },
    ],
  }),

  node('c2_void_pierce', {
    name: 'Void Pierce',
    description: 'Your INT-sourced attacks now ignore armor entirely. There is no plate thick enough to block nothing.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 4, kind: 'flat' }],
  }),

  node('c2_lifedrinker_pulse', {
    name: 'Lifedrinker\'s Pulse',
    description: 'Your cathedral-ship beats with a stolen heartbeat. Stamina surges through repurposed arteries.',
    cost: 50,
    column: 2,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 4, kind: 'flat' }],
  }),

  node('c2_entropy_sense', {
    name: 'Entropy Sense',
    description: 'Feel the heat-death of the universe approaching. That certainty steadies the hand and sharpens fortune.',
    cost: 45,
    column: 2,
    rarity: 45,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_dark_matter_feed', {
    name: 'Dark Matter Feed',
    description: 'Harvest the invisible mass that binds galaxies. What cannot be seen can still be consumed.',
    cost: 45,
    column: 2,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.INT, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_fasted_mind', {
    name: 'Fasted Mind',
    description: 'Gold is a distraction. With nothing weighing your coffers, the void speaks with perfect clarity.',
    cost: 50,
    column: 2,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'gold_unspent', value: 60 },
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c2_void_depth', {
    name: 'Void Efficiency',
    description: 'Refine the void\'s output. Less raw power, but your abilities fire more cleanly and cost less essence.',
    cost: 50,
    column: 2,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_void',
    rarity: 25,
    effects: [
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c2_atrophy_tithe', {
    name: 'Atrophy Tithe',
    description: 'Sacrifice physical strength to the void. Your muscles wither, but your mind blooms with stolen vitality.',
    cost: 60,
    column: 2,
    type: NodeType.ANTI_SYNERGY,
    rarity: 25,
    effects: [
      { stat: StatType.STR, value: -3, kind: 'flat' },
      { stat: StatType.INT, value: 6, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 3 — Cathedral Ascendancy
  // ═══════════════════════════════════════════════════════════════════

  node('c3_cathedral_nexus', {
    name: 'Cathedral-Hull Nexus',
    description: 'The structural heart of your void-cathedral. Every rib, every buttress sings with undead resonance.',
    cost: 60,
    column: 3,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.STA, value: 5, kind: 'flat' },
      { stat: StatType.INT, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_maw_of_void', {
    name: 'Maw of the Void',
    description: 'Open a direct aperture to the vacuum in your cathedral\'s nave. What pours through ignores all armor.',
    cost: 55,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 4, kind: 'flat' }],
  }),

  node('c3_stellar_ossuary', {
    name: 'Stellar Ossuary',
    description: 'A chamber lined with the bones of collapsed stars. The density of ages fuels your endurance.',
    cost: 55,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 4, kind: 'flat' }],
  }),

  node('c3_siphon_channel', {
    name: 'Siphon Channel',
    description: 'Direct the siphon\'s flow through consecrated conduits. What was a trickle becomes a flood.',
    cost: 55,
    column: 3,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'vamp_void',
  }),

  node('c3_requiem_verse', {
    name: 'Requiem Verse',
    description: 'A stanza from the Death-Liturgy etched into your hull. Each syllable weakens the boundary between life and void.',
    cost: 55,
    column: 3,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c3_phased_hull', {
    name: 'Phased Hull',
    description: 'Your cathedral partially exists in the void itself. Half-material, half-absence — the perfect marriage of resilience and intellect.',
    cost: 55,
    column: 3,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.INT, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_crimson_rite', {
    name: 'Crimson Rite',
    description: 'Anoint your cathedral\'s altar with the essence of vanquished foes. Fortune favors the sanguine.',
    cost: 55,
    column: 3,
    rarity: 50,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 1, kind: 'flat' },
    ],
  }),

  node('c3_marrow_lattice', {
    name: 'Marrow Lattice',
    description: 'Weave stellar marrow into a load-bearing skeleton. Strength is borrowed from dead suns.',
    cost: 55,
    column: 3,
    rarity: 50,
    effects: [
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.STR, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_void_calculus', {
    name: 'Void Calculus',
    description: 'Compute the mathematics of nothingness. Cold equations bypass evasion with perfect precision.',
    cost: 60,
    column: 3,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 5, kind: 'flat' }],
  }),

  node('c3_eclipse_prelude', {
    name: 'Eclipse Prelude',
    description: 'Prepare the cathedral for total occultation. When the light dies, your power surges.',
    cost: 60,
    column: 3,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.INT, value: 1, kind: 'flat' },
    ],
  }),

  node('c3_undying_will', {
    name: 'Undying Will',
    description: 'Those who cannot die have no need for rest. Your stamina reserves unlock a deeper well of power.',
    cost: 60,
    column: 3,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'stat_threshold', stat: StatType.STA, value: 15 },
    effects: [{ stat: StatType.INT, value: 6, kind: 'flat' }],
  }),

  node('c3_stalwart_hull', {
    name: 'Stalwart Cathedral Hull',
    description: 'Thicken your vessel\'s bones to impossible density. A fortress of the dead, immovable and eternal.',
    cost: 60,
    column: 3,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_sta',
    rarity: 25,
    effects: [{ stat: StatType.STA, value: 6, kind: 'flat' }],
  }),

  node('c3_siphoned_echo', {
    name: 'Siphoned Echo',
    description: 'Past victims leave resonant imprints in your cathedral. By turn eight, their accumulated voices become a chorus of power.',
    cost: 65,
    column: 3,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'turn_threshold', value: 8 },
    effects: [
      { stat: StatType.INT, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c3_sporgk_rift', {
    name: 'Void Bridge: Asteroid Siphon',
    description: 'A captured Sporgk warp-furnace, repurposed to drain rather than burn. Raw strength feeds the void.',
    cost: 65,
    column: 3,
    type: NodeType.HYBRID_BRIDGE,
    rarity: 20,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STR, value: 3, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 4 — Void Mastery
  // ═══════════════════════════════════════════════════════════════════

  node('c4_entropy_cascade', {
    name: 'Entropy Cascade',
    description: 'Unleash a chain reaction of decay. Each siphoned drop triggers the next, bypassing all defenses in accelerating waves.',
    cost: 80,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 5, kind: 'flat' }],
    unlocksAbility: 'vamp_cascade',
  }),

  node('c4_crypt_lattice', {
    name: 'Crypt Lattice',
    description: 'Expand the ossuary into a self-reinforcing matrix. Each bone strengthens its neighbor.',
    cost: 80,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 5, kind: 'flat' }],
  }),

  node('c4_litany_of_null', {
    name: 'Litany of Null',
    description: 'Recite the full liturgy of emptiness. Every verse recited simultaneously in parallel dimensions of your cathedral.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 3, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c4_entropic_drift', {
    name: 'Entropic Drift',
    description: 'Let the universe\'s slow death carry you forward. The current of decay is predictable to those who study it.',
    cost: 85,
    column: 4,
    rarity: 50,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_cathedral_spire', {
    name: 'Cathedral Spire',
    description: 'Raise a pinnacle that pierces the boundary between dimensions. Height is power in the geometry of the void.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c4_astral_marrow', {
    name: 'Astral Marrow Reserve',
    description: 'Stockpile the life-essence of entire dead nebulae. Stamina measured in astronomical units.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 5, kind: 'flat' }],
  }),

  node('c4_necrotic_command', {
    name: 'Necrotic Command',
    description: 'Will the dead of a thousand worlds to rise within your hull. Their collective intellect bypasses all armor.',
    cost: 90,
    column: 4,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 6, kind: 'flat' }],
  }),

  node('c4_siphon_engine', {
    name: 'Siphon Engine',
    description: 'Industrialize the drain. What was ritual becomes infrastructure.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_ceremonial_oblivion', {
    name: 'Ceremonial Oblivion',
    description: 'The final sacrament. Erase a name from existence and drink the released entropy.',
    cost: 90,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
    unlocksAbility: 'vamp_requiem',
  }),

  node('c4_bone_cathedral', {
    name: 'Bone-Cathedral Synthesis',
    description: 'Your vessel and its ossuary become indistinguishable. The ship is the skeleton; the skeleton is the ship.',
    cost: 85,
    column: 4,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 3, kind: 'flat' },
      { stat: StatType.INT, value: 2, kind: 'flat' },
      { stat: StatType.STR, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_hungering_void', {
    name: 'Hungering Void',
    description: 'The void grows ravenous when you equip your first artifact. A single vessel channels the hunger tenfold.',
    cost: 90,
    column: 4,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'gear_equipped', value: 1 },
    effects: [
      { stat: StatType.INT, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 1, kind: 'flat' },
    ],
  }),

  node('c4_regenerative_plating', {
    name: 'Regenerative Cathedral Plating',
    description: 'Living bone that knits itself from stolen life-force. Constant renewal instead of brute endurance.',
    cost: 90,
    column: 4,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_sta',
    rarity: 25,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_entropy_bloom', {
    name: 'Entropy Bloom',
    description: 'When your intellect reaches critical mass, the decay accelerates exponentially. The universe obliges your understanding.',
    cost: 100,
    column: 4,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'stat_threshold', stat: StatType.INT, value: 25 },
    effects: [
      { stat: StatType.INT, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c4_elf_echo', {
    name: 'Void Bridge: Crystalline Echo',
    description: 'A stolen Elf star-prism, inverted to project void instead of light. Fortune leaks through the dark crystal.',
    cost: 95,
    column: 4,
    type: NodeType.HYBRID_BRIDGE,
    rarity: 20,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 3, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 5 — Void Singularity
  // ═══════════════════════════════════════════════════════════════════

  node('c5_void_singularity', {
    name: 'Void Singularity',
    description: 'Collapse your cathedral\'s core into a point of infinite density. A gravitational well of pure nothingness that devours all defenses.',
    cost: 100,
    column: 5,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c5_sermon_of_dust', {
    name: 'Sermon of Dust',
    description: 'Preach the gospel of universal decay to the uninitiated. Your words strip armor and dissolve evasion before the first strike.',
    cost: 90,
    column: 5,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
    unlocksAbility: 'vamp_sermon',
  }),

  node('c5_event_horizon', {
    name: 'Event Horizon',
    description: 'Expand the singularity\'s influence. Nothing escapes your void — not light, not matter, not the enemy\'s armor.',
    cost: 95,
    column: 5,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 6, kind: 'flat' }],
  }),

  node('c5_eternal_hull', {
    name: 'Eternal Hull',
    description: 'Time stops mattering. Your cathedral has always existed and always will, and its endurance is without terminus.',
    cost: 95,
    column: 5,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 6, kind: 'flat' }],
  }),

  node('c5_null_geometry', {
    name: 'Null Geometry',
    description: 'Rearrange your cathedral in dimensions the enemy cannot perceive. Position becomes a weapon that bypasses evasion.',
    cost: 95,
    column: 5,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c5_necrotic_halo', {
    name: 'Necrotic Halo',
    description: 'A ring of entropic radiation orbits your cathedral. All who enter your presence begin dying.',
    cost: 90,
    column: 5,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 4, kind: 'flat' },
      { stat: StatType.INT, value: 3, kind: 'flat' },
    ],
  }),

  node('c5_throne_attendant', {
    name: 'Throne Attendant',
    description: 'A spectral servitor bound to your awakened throne. It whispers tactical insights gleaned from centuries of void.',
    cost: 95,
    column: 5,
    rarity: 45,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.LCK, value: 2, kind: 'flat' },
    ],
  }),

  node('c5_desolate_vow', {
    name: 'Desolate Vow',
    description: 'Swear an oath of poverty before the void altar. The less gold you hoard, the louder the vacuum sings.',
    cost: 90,
    column: 5,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'gold_unspent', value: 200 },
    effects: [
      { stat: StatType.INT, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c5_siphon_depth', {
    name: 'Siphon Depth',
    description: 'Drill the siphon deeper into a single target\'s core. Maximum drain from minimum surface area — devastating focus.',
    cost: 100,
    column: 5,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_siphon',
    rarity: 25,
    effects: [{ stat: StatType.INT, value: 7, kind: 'flat' }],
  }),

  node('c5_marrow_sacrifice', {
    name: 'Marrow Sacrifice',
    description: 'Burn agility at the altar. Speed is for the living — you trade motion for absolute cerebral dominance.',
    cost: 110,
    column: 5,
    type: NodeType.ANTI_SYNERGY,
    rarity: 25,
    effects: [
      { stat: StatType.AGI, value: -5, kind: 'flat' },
      { stat: StatType.INT, value: 8, kind: 'flat' },
    ],
  }),

  node('c5_dark_harvest', {
    name: 'Dark Harvest',
    description: 'By the time your intellect reaches thirty-five, the void begins actively feeding you. The universe becomes your prey.',
    cost: 105,
    column: 5,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'stat_threshold', stat: StatType.INT, value: 35 },
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 6 — Apotheosis of the Void
  // ═══════════════════════════════════════════════════════════════════

  node('c6_eclipse_rite', {
    name: 'Eclipse Rite',
    description: 'The full occultation ceremony. Darkness becomes absolute — and within it, your intellect pierces all that exists.',
    cost: 135,
    column: 6,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 7, kind: 'flat' }],
    unlocksAbility: 'vamp_eclipse',
  }),

  node('c6_entropy_weave', {
    name: 'Entropy Weave',
    description: 'Spin decay into a tapestry. Every thread is a dying star; every knot is an extinguished civilization.',
    cost: 135,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.STA, value: 6, kind: 'flat' },
      { stat: StatType.INT, value: 2, kind: 'flat' },
    ],
  }),

  node('c6_cathedral_apotheosis', {
    name: 'Cathedral Apotheosis',
    description: 'Your vessel transcends architecture and becomes doctrine. The cathedral is no longer a ship — it is a religion.',
    cost: 140,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c6_lifedrinker_chassis', {
    name: 'Lifedrinker\'s Chassis',
    description: 'Rebuild your cathedral around the siphon. The entire ship becomes a single, unified organ of consumption.',
    cost: 135,
    column: 6,
    rarity: 55,
    effects: [{ stat: StatType.STA, value: 7, kind: 'flat' }],
  }),

  node('c6_void_absolute', {
    name: 'Void Absolute',
    description: 'Achieve total identification with nothingness. No armor exists because you have decided armor is beneath your perception.',
    cost: 145,
    column: 6,
    rarity: 55,
    effects: [{ stat: StatType.INT, value: 8, kind: 'flat' }],
  }),

  node('c6_stellar_oblivion', {
    name: 'Stellar Oblivion',
    description: 'Extinguish a star with a thought. The resulting darkness feeds both mind and vessel for millennia.',
    cost: 140,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c6_sanguine_geometry', {
    name: 'Sanguine Geometry',
    description: 'Draw battle-plans in the blood of the already-drained. Every angle is a siphon; every vector bypasses evasion.',
    cost: 145,
    column: 6,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c6_hallowed_void', {
    name: 'Hallowed Void',
    description: 'When your stamina crosses the twenty-five threshold, the void itself grants you sainthood — and sainthood grants power.',
    cost: 145,
    column: 6,
    type: NodeType.CONDITIONAL,
    rarity: 30,
    condition: { type: 'stat_threshold', stat: StatType.STA, value: 25 },
    effects: [
      { stat: StatType.INT, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  node('c6_siphon_reach', {
    name: 'Siphon Reach',
    description: 'Broaden the siphon\'s aperture. Drain everything in range simultaneously — less depth, more breadth.',
    cost: 145,
    column: 6,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_siphon',
    rarity: 25,
    effects: [
      { stat: StatType.INT, value: 4, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c6_entropy_containment', {
    name: 'Entropy Containment',
    description: 'Contain the cascade within ritual bounds. Controlled decay sacrifices raw destruction for disciplined endurance.',
    cost: 150,
    column: 6,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_entropy',
    rarity: 25,
    effects: [
      { stat: StatType.STA, value: 6, kind: 'flat' },
      { stat: StatType.INT, value: 3, kind: 'flat' },
    ],
  }),

  node('c6_agility_burn', {
    name: 'Agility Immolation',
    description: 'Set your reflexes ablaze as an offering to the void. Speed is for prey — you are the predator eternal.',
    cost: 165,
    column: 6,
    type: NodeType.ANTI_SYNERGY,
    rarity: 25,
    effects: [
      { stat: StatType.AGI, value: -6, kind: 'flat' },
      { stat: StatType.INT, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN 7 — The Void Thrones (Terminus)
  // ═══════════════════════════════════════════════════════════════════

  node('c7_lifedrinker_throne', {
    name: 'The Lifedrinker\'s Throne',
    description: 'Ascend the ultimate seat within your cathedral. Every life ever taken feeds you now — an endless banquet across eternity.',
    cost: 165,
    column: 7,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.INT, value: 8, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  node('c7_terminus_requiem', {
    name: 'Terminus Requiem',
    description: 'The final verse of the Death-Liturgy. Sing it and the universe listens, drains, and obeys.',
    cost: 175,
    column: 7,
    isAnchor: true,
    rarity: 100,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 6, kind: 'flat' },
    ],
  }),

  node('c7_necrotic_apotheosis', {
    name: 'Necrotic Apotheosis',
    description: 'When your intellect reaches fifty, shed the last vestiges of mortality. You are now a law of the universe: all things drain.',
    cost: 170,
    column: 7,
    type: NodeType.THRESHOLD,
    rarity: 25,
    condition: { type: 'stat_threshold', stat: StatType.INT, value: 50 },
    effects: [
      { stat: StatType.INT, value: 10, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('c7_void_ascension', {
    name: 'Void Ascension',
    description: 'Transcend the cathedral, the ship, and the self. Become indistinguishable from the void — and the void ignores all armor, all evasion, all resistance.',
    cost: 170,
    column: 7,
    rarity: 55,
    effects: [
      { stat: StatType.INT, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
    unlocksAbility: 'vamp_necrotic',
  }),

  node('c7_entropy_unbound', {
    name: 'Entropy Unbound',
    description: 'Remove all safeties from the cascade. True entropy knows no containment — pure devastation at the cost of stability.',
    cost: 180,
    column: 7,
    type: NodeType.MUTEX,
    mutexPairId: 'vamp_mutex_entropy',
    rarity: 25,
    effects: [
      { stat: StatType.INT, value: 7, kind: 'flat' },
      { stat: StatType.STA, value: 4, kind: 'flat' },
    ],
  }),

  // Codex unlock — add_node_to_pool targets
  node('lich_ascendant', {
    name: 'Lich Ascendant',
    description: 'Shed the last pretense of mortality. Codex-unlocked void mastery.',
    cost: 120,
    column: 5,
    rarity: 85,
    effects: [
      { stat: StatType.INT, value: 6, kind: 'flat' },
      { stat: StatType.STA, value: 3, kind: 'flat' },
    ],
  }),

  node('entropic_cascade', {
    name: 'Entropic Cascade',
    description: 'Chain entropy through the hull. Codex-unlocked advanced node.',
    cost: 110,
    column: 5,
    rarity: 80,
    effects: [
      { stat: StatType.INT, value: 5, kind: 'flat' },
      { stat: StatType.STA, value: 2, kind: 'flat' },
    ],
  }),
]
