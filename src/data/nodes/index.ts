import type { NodeDef } from '../../types/nodes'
import { Archetype } from '../../types/enums'
import { sporgkNodes } from './sporgk'
import { elfNodes } from './elf'
import { vampireNodes } from './vampire'

const nodeMap: Record<Archetype, NodeDef[]> = {
  [Archetype.SPORGK]: sporgkNodes,
  [Archetype.ELF]: elfNodes,
  [Archetype.VAMPIRE]: vampireNodes,
}

export function getNodePool(archetype: Archetype): NodeDef[] {
  return nodeMap[archetype]
}

export function getNodeById(archetype: Archetype, id: string): NodeDef | undefined {
  return nodeMap[archetype].find((n) => n.id === id)
}

export function getAnchors(archetype: Archetype): NodeDef[] {
  return nodeMap[archetype].filter((n) => n.isAnchor)
}

export function getNodesByColumn(archetype: Archetype, column: number): NodeDef[] {
  return nodeMap[archetype].filter((n) => n.column === column)
}

export { sporgkNodes, elfNodes, vampireNodes }
