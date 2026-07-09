import { describe, it, expect } from 'vitest'
import {
  isConditionMet,
  canPurchaseWithCondition,
  applyAntiSynergyPenalty,
} from '../../../src/game/constellation/conditions'
import { Archetype, NodeType, StatType } from '../../../src/types/enums'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { NodeDef } from '../../../src/types/nodes'
import { ItemSlot } from '../../../src/types/enums'

const baseDef = (overrides: Partial<NodeDef> = {}): NodeDef => ({
  id: 'test',
  name: 'Test',
  description: '',
  type: NodeType.STANDARD,
  archetype: Archetype.SPORGK,
  cost: 50,
  effects: [{ stat: StatType.STR, value: 4, kind: 'flat' }],
  rarity: 50,
  column: 2,
  isAnchor: false,
  ...overrides,
})

describe('structural conditions', () => {
  it('turn_threshold blocks CONDITIONAL purchase until turn met', () => {
    const def = baseDef({
      type: NodeType.THRESHOLD,
      condition: { type: 'turn_threshold', value: 10 },
    })
    expect(canPurchaseWithCondition(def, { turn: 5, stats: EMPTY_STATS, inventory: [] })).toBe(false)
    expect(canPurchaseWithCondition(def, { turn: 10, stats: EMPTY_STATS, inventory: [] })).toBe(true)
  })

  it('stat_threshold requires stat', () => {
    const def = baseDef({
      type: NodeType.CONDITIONAL,
      condition: { type: 'stat_threshold', stat: StatType.STR, value: 15 },
    })
    expect(
      canPurchaseWithCondition(def, {
        turn: 1,
        stats: { ...EMPTY_STATS, STR: 10 },
        inventory: [],
      }),
    ).toBe(false)
    expect(
      canPurchaseWithCondition(def, {
        turn: 1,
        stats: { ...EMPTY_STATS, STR: 15 },
        inventory: [],
      }),
    ).toBe(true)
  })

  it('gear_unequipped condition', () => {
    expect(
      isConditionMet(
        { type: 'gear_unequipped', value: 0 },
        { turn: 1, stats: EMPTY_STATS, inventory: [] },
      ),
    ).toBe(true)
    expect(
      isConditionMet(
        { type: 'gear_unequipped', value: 0 },
        {
          turn: 1,
          stats: EMPTY_STATS,
          inventory: [{ defId: 'x', instanceId: '1', slot: ItemSlot.HEAD, equipped: true }],
        },
      ),
    ).toBe(false)
  })

  it('anti-synergy halves gains when similar nodes already owned', () => {
    const def = baseDef({ type: NodeType.ANTI_SYNERGY })
    const owned = [baseDef({ id: 'other', type: NodeType.ANTI_SYNERGY })]
    const gain = { ...EMPTY_STATS, STR: 4 }
    const penalized = applyAntiSynergyPenalty(gain, def, owned)
    expect(penalized.STR).toBe(2)
  })
})
