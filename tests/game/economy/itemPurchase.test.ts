import { describe, it, expect } from 'vitest'
import {
  removeFirstStoreListing,
  getEquippedInSlot,
  inventoryAfterEquip,
} from '../../../src/game/economy/itemPurchase'
import { ItemSlot } from '../../../src/types/enums'
import type { InventoryItem } from '../../../src/types/items'

describe('removeFirstStoreListing', () => {
  it('removes only the first matching listing', () => {
    const store = ['a', 'b', 'a', 'c']
    expect(removeFirstStoreListing(store, 'a')).toEqual(['b', 'a', 'c'])
  })

  it('returns same array contents when id missing', () => {
    const store = ['a', 'b']
    expect(removeFirstStoreListing(store, 'z')).toEqual(['a', 'b'])
  })

  it('does not mutate original', () => {
    const store = ['x', 'y']
    removeFirstStoreListing(store, 'x')
    expect(store).toEqual(['x', 'y'])
  })
})

describe('inventoryAfterEquip', () => {
  it('replaces equipped item in the same slot and drops the old one', () => {
    const inv: InventoryItem[] = [
      { defId: 'old_helm', instanceId: '1', slot: ItemSlot.HEAD, equipped: true },
      { defId: 'boots', instanceId: '2', slot: ItemSlot.PAWS, equipped: true },
    ]
    const next: InventoryItem = {
      defId: 'new_helm',
      instanceId: '3',
      slot: ItemSlot.HEAD,
      equipped: true,
    }
    const result = inventoryAfterEquip(inv, next)
    expect(result.find((i) => i.defId === 'old_helm')).toBeUndefined()
    expect(result.find((i) => i.defId === 'new_helm')?.equipped).toBe(true)
    expect(result.find((i) => i.defId === 'boots')).toBeDefined()
  })
})

describe('getEquippedInSlot', () => {
  it('returns equipped item for slot', () => {
    const inv: InventoryItem[] = [
      { defId: 'a', instanceId: '1', slot: ItemSlot.BODY, equipped: false },
      { defId: 'b', instanceId: '2', slot: ItemSlot.BODY, equipped: true },
    ]
    expect(getEquippedInSlot(inv, ItemSlot.BODY)?.defId).toBe('b')
    expect(getEquippedInSlot(inv, ItemSlot.HEAD)).toBeUndefined()
  })
})
