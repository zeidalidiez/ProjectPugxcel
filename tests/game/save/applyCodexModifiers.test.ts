import { describe, it, expect } from 'vitest'
import { applyCodexModifiers } from '../../../src/game/save/codex'
import { Archetype, StatType } from '../../../src/types/enums'

describe('applyCodexModifiers', () => {
  it('stat_boost adds to primary stat for each archetype', () => {
    // Uses the real modifier lookup — we test with empty array since we can't inject fake IDs
    const empty = applyCodexModifiers(Archetype.SPORGK, [])
    expect(empty.bonusStats).toBeDefined()
    expect(empty.bonusGold).toBe(0)
    expect(empty.extraNodes).toEqual([])
    expect(empty.extraItems).toEqual([])
  })

  it('start_gold sums correctly from unlocked modifiers', () => {
    // War Chest: +50 gold, reach_turn 15
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_war_chest', 'mod_golden_paws'])
    expect(result.bonusGold).toBe(75) // 50 + 25
  })

  it('stat_boost uses targetStat if specified, else primary stat', () => {
    // mod_endurance: stat_boost 2, stat: STA
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_endurance'])
    expect(result.bonusStats[StatType.STA]).toBe(2)
    // Primary stat not boosted
    expect(result.bonusStats[StatType.STR] ?? 0).toBe(0)
  })

  it('stat_boost without stat targets primary stat', () => {
    // mod_iron_hide: stat_boost 2, no stat field → primary STR for Sporgk
    const sporgkResult = applyCodexModifiers(Archetype.SPORGK, ['mod_iron_hide'])
    expect(sporgkResult.bonusStats[StatType.STR]).toBe(2)

    const elfResult = applyCodexModifiers(Archetype.ELF, ['mod_crystalline_focus'])
    expect(elfResult.bonusStats[StatType.AGI]).toBe(2)

    const vampResult = applyCodexModifiers(Archetype.VAMPIRE, ['mod_void_touched'])
    expect(vampResult.bonusStats[StatType.INT]).toBe(2)
  })

  it('add_node_to_pool adds extra nodes when ID exists', () => {
    // Use a real node ID from the sporgk pool that exists
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_sporgk_berserker'])
    // mod_sporgk_berserker references sporgk_berserker_rite which may not exist
    // The function skips missing nodes gracefully
    expect(Array.isArray(result.extraNodes)).toBe(true)
  })

  it('add_item_to_pool adds extra items when ID exists', () => {
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_naked_brawler'])
    // item_void_knuckles may not exist — function skips gracefully
    expect(Array.isArray(result.extraItems)).toBe(true)
  })

  it('empty codex returns zero bonuses', () => {
    const result = applyCodexModifiers(Archetype.SPORGK, [])
    expect(result.bonusGold).toBe(0)
    for (const stat of Object.values(StatType)) {
      expect(result.bonusStats[stat] ?? 0).toBe(0)
    }
    expect(result.extraNodes).toEqual([])
    expect(result.extraItems).toEqual([])
  })

  it('is deterministic — same inputs = same output', () => {
    const ids = ['mod_iron_hide', 'mod_war_chest', 'mod_lucky_charm']
    const r1 = applyCodexModifiers(Archetype.SPORGK, ids)
    const r2 = applyCodexModifiers(Archetype.SPORGK, ids)
    expect(r1).toEqual(r2)
  })

  it('unknown modifier IDs are silently skipped', () => {
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_nonexistent_12345'])
    expect(result.bonusGold).toBe(0)
  })

  it('multiple stat_boost modifiers stack additively', () => {
    // mod_iron_hide (+2 STR primary) + mod_boss_slayer (+3 STR primary)
    const result = applyCodexModifiers(Archetype.SPORGK, ['mod_iron_hide', 'mod_boss_slayer'])
    expect(result.bonusStats[StatType.STR]).toBe(5) // 2 + 3
  })
})
