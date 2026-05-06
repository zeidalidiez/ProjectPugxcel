import { Archetype, ItemTier, ItemSlot, ItemCategory, StatType, ThreatTag } from '../../types/enums'
import type { ItemDef } from '../../types/items'

export const vampItems: ItemDef[] = [
  // ═══════════════════════════════════════ T1 (3 items) ═══════════════════════════════════════

  {
    id: 'vamp_item_void_siphon_ring',
    name: 'Void Siphon Ring',
    tier: ItemTier.T1,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.TRINKET,
    archetype: Archetype.VAMPIRE,
    cost: 25,
    description: 'A cold iron ring that siphons ambient void-energy through the wearer. Tingles unpleasantly.',
    effects: [{ statBonus: { [StatType.INT]: 3 } }],
  },
  {
    id: 'vamp_item_gothic_shroud',
    name: 'Gothic Shroud',
    tier: ItemTier.T1,
    slot: ItemSlot.BODY,
    category: ItemCategory.ARMOR,
    archetype: Archetype.VAMPIRE,
    cost: 25,
    description: 'A dark shroud woven from cathedral-ship synth-velvet. Resists the cold pull of the void.',
    effects: [{ resistance: { tag: ThreatTag.VOID, value: 8 } }],
  },
  {
    id: 'vamp_item_void_whisper_charm',
    name: 'Void Whisper Charm',
    tier: ItemTier.T1,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.ABILITY,
    archetype: Archetype.VAMPIRE,
    cost: 35,
    description: 'A charm that translates void-static into a weaponized whisper. The void has much to say.',
    effects: [{ grantsAbility: 'vamp_ab_void_whisper' }],
  },

  // ═══════════════════════════════════════ T2 (4 items) ═══════════════════════════════════════

  {
    id: 'vamp_item_cathedral_rapier',
    name: 'Cathedral Rapier',
    tier: ItemTier.T2,
    slot: ItemSlot.PAWS,
    category: ItemCategory.WEAPON,
    archetype: Archetype.VAMPIRE,
    cost: 55,
    description: 'A rapier forged from cathedral-ship spire iron. Elegant, needle-sharp, impossibly cold.',
    effects: [{ strMult: 1.4 }, { statBonus: { [StatType.INT]: 3 } }],
  },
  {
    id: 'vamp_item_void_crown',
    name: 'Void Crown',
    tier: ItemTier.T2,
    slot: ItemSlot.HEAD,
    category: ItemCategory.ARMOR,
    archetype: Archetype.VAMPIRE,
    cost: 50,
    description: 'A spiked crown worn by void-court functionaries. Commands respect from the dark.',
    effects: [
      { resistance: { tag: ThreatTag.VOID, value: 12 } },
      { statBonus: { [StatType.STA]: 2 } },
    ],
  },
  {
    id: 'vamp_item_siphon_bead',
    name: 'Siphon Bead',
    tier: ItemTier.T2,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.TRINKET,
    archetype: Archetype.VAMPIRE,
    cost: 55,
    description: 'A polished onyx bead that drinks deeply from ambient energy fields. Passes the draught to its wearer.',
    effects: [{ statBonus: { [StatType.STA]: 3, [StatType.INT]: 2 } }],
  },
  {
    id: 'vamp_item_soul_rend_scroll',
    name: 'Soul Rend Scroll',
    tier: ItemTier.T2,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.ABILITY,
    archetype: Archetype.VAMPIRE,
    cost: 65,
    description: 'A scroll inscribed with the oldest void-liturgy. Reads the soul — then rends what it finds.',
    effects: [{ grantsAbility: 'vamp_ab_soul_rend' }],
  },

  // ═══════════════════════════════════════ T3 (3 items) ═══════════════════════════════════════

  {
    id: 'vamp_item_void_lord_scepter',
    name: 'Void-Lord Scepter',
    tier: ItemTier.T3,
    slot: ItemSlot.PAWS,
    category: ItemCategory.WEAPON,
    archetype: Archetype.VAMPIRE,
    cost: 105,
    description: 'A scepter of office wielded by void-lords during cathedral-ship conclave. Channels command into damage.',
    effects: [
      { strMult: 1.3 },
      { flatBonus: 12 },
      { statBonus: { [StatType.INT]: 4 } },
    ],
  },
  {
    id: 'vamp_item_cathedral_plate',
    name: 'Cathedral Plate',
    tier: ItemTier.T3,
    slot: ItemSlot.BODY,
    category: ItemCategory.ARMOR,
    archetype: Archetype.VAMPIRE,
    cost: 95,
    description: 'Ceremonial plate armour from the cathedral-ship nave. Blessed in void-rites spanning centuries.',
    effects: [
      { resistance: { tag: ThreatTag.VOID, value: 15 } },
      { resistance: { tag: ThreatTag.RESISTANT, value: 12 } },
    ],
  },
  {
    id: 'vamp_item_cathedral_bolt_tome',
    name: 'Cathedral Bolt Tome',
    tier: ItemTier.T3,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.ABILITY,
    archetype: Archetype.VAMPIRE,
    cost: 120,
    description: 'A tome of cathedral-ship offensive doctrine. Speaks bolts of consecrated void-energy into being.',
    effects: [{ grantsAbility: 'vamp_ab_cathedral_bolt' }],
  },

  // ═══════════════════════════════════════ T4 (2 items) ═══════════════════════════════════════

  {
    id: 'vamp_item_void_heart',
    name: 'Void Heart',
    tier: ItemTier.T4,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.TRINKET,
    archetype: Archetype.VAMPIRE,
    cost: 270,
    description: 'The preserved heart of a void-lord, still beating. Each pulse rewrites a small piece of reality in your favour.',
    effects: [
      { statBonus: { [StatType.INT]: 8, [StatType.STA]: 6 } },
      { extraNodeDraft: true },
    ],
  },
  {
    id: 'vamp_item_siphon_lord_sigil',
    name: 'Siphon-Lord Sigil',
    tier: ItemTier.T4,
    slot: ItemSlot.ARTIFACT,
    category: ItemCategory.ABILITY,
    archetype: Archetype.VAMPIRE,
    cost: 300,
    description: 'The personal sigil of a siphon-lord. Drains life force across light-years. Cathedral-ship doctrine states this is a negotiation. It is not.',
    effects: [{ grantsAbility: 'vamp_ab_life_siphon' }],
    statRequirements: { [StatType.INT]: 20 },
  },
]
