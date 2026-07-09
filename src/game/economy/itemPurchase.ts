import type { InventoryItem } from '../../types/items'
import type { ItemSlot } from '../../types/enums'

/** Remove the first matching listing from the store (one purchase = one slot). */
export function removeFirstStoreListing(storeItems: string[], itemId: string): string[] {
  const idx = storeItems.indexOf(itemId)
  if (idx === -1) return storeItems
  return [...storeItems.slice(0, idx), ...storeItems.slice(idx + 1)]
}

/** Currently equipped item in a slot, if any. */
export function getEquippedInSlot(
  inventory: InventoryItem[],
  slot: ItemSlot,
): InventoryItem | undefined {
  return inventory.find((i) => i.slot === slot && i.equipped)
}

/**
 * Build inventory after equipping a new item into `slot`.
 * Previously equipped gear in that slot is removed (replaced, not hoarded).
 */
export function inventoryAfterEquip(
  inventory: InventoryItem[],
  next: InventoryItem,
): InventoryItem[] {
  return [
    ...inventory.filter((i) => !(i.slot === next.slot && i.equipped)),
    next,
  ]
}
