import { useState, useCallback, useRef, useMemo, useEffect, useLayoutEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../store'
import { getNodeById } from '../data/nodes'
import { canPurchaseNode } from '../game/constellation/canPurchase'
import { applyDiscount } from '../game/economy/cost'
import { StatType } from '../types/enums'
import type { ConstellationNode } from '../types/nodes'
import NodeTooltip from './NodeTooltip'
import { useAudio } from '../hooks/useAudio'

export default function ConstellationViewport() {
  const { constellation, draftedIds, archetype, gold, lck, currentNodeDrafts, phase } = useGameStore(
    useShallow((s) => ({
      constellation: s.run?.constellation,
      draftedIds: s.run?.draftedNodeIds,
      archetype: s.run?.archetype,
      gold: s.run?.gold,
      lck: s.run?.stats?.[StatType.LCK] ?? 0,
      currentNodeDrafts: s.run?.currentNodeDrafts,
      phase: s.run?.phase,
    })),
  )
  const purchaseNode = useGameStore((s) => s.purchaseNode)

  const [scale, setScale] = useState(0.6)
  const [offset, setOffset] = useState({ x: 100, y: 60 })
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastOffset = useRef({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setOffset({ x: rect.width / 2 - 800 * 0.6, y: rect.height / 2 - 450 * 0.6 })
  }, [])

  const { playNodePurchase, playHover } = useAudio()

  const isDraft = phase === 'DRAFT'

  const purchasableIds = useMemo(() => {
    if (!constellation || !draftedIds) return new Set<string>()
    const result = new Set(
      [...constellation.nodes.keys()].filter((id) =>
        canPurchaseNode(constellation, id, draftedIds),
      ),
    )
    return result
  }, [constellation, draftedIds])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      setScale((s) => Math.max(0.2, Math.min(2, s - e.deltaY * 0.0008)))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    panning.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    lastOffset.current = { ...offset }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [offset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panning.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setOffset({ x: lastOffset.current.x + dx, y: lastOffset.current.y + dy })
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    panning.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  if (!constellation || !archetype) return null

  const nodes = [...constellation.nodes.values()]
  const pad = 60
  const minX = Math.min(...nodes.map((n) => n.x)) - pad
  const maxX = Math.max(...nodes.map((n) => n.x)) + pad
  const minY = Math.min(...nodes.map((n) => n.y)) - pad
  const maxY = Math.max(...nodes.map((n) => n.y)) + pad
  const svgW = maxX - minX
  const svgH = maxY - minY

  return (
    <div
      className="relative flex-1 overflow-hidden border border-terminal-border rounded bg-terminal-bg touch-none select-none"
      role="region"
      aria-label="Constellation"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'relative',
        }}>
          <svg
            style={{
              position: 'absolute',
              left: minX,
              top: minY,
              width: svgW,
              height: svgH,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
            viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
          >
            {nodes.flatMap((node) =>
              node.edges.map((targetId) => {
                const target = constellation.nodes.get(targetId)
                if (!target) return null
                const purchased = (draftedIds ?? []).includes(node.id) && (draftedIds ?? []).includes(target.id)
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={purchased ? 'var(--color-terminal-accent)' : '#1e2d44'}
                    strokeWidth={purchased ? 2.5 : 1}
                    strokeLinecap="round"
                  />
                )
              }),
            )}
          </svg>

          {nodes.map((node) => {
            const def = constellation.defMap?.get(node.defId) ?? getNodeById(archetype, node.defId)
            if (!def) return null
            const purchased = (draftedIds ?? []).includes(node.id)
            const purchasable = purchasableIds.has(node.id)
            const locked = node.locked
            const price = applyDiscount(def.cost, lck)
            const affordable = gold !== undefined && gold >= price
            const canBuy = isDraft && purchasable && !purchased && !locked && affordable && (currentNodeDrafts ?? 0) > 0

            return (
              <button
                key={node.id}
                onClick={(e) => {
                  if (canBuy) {
                    e.stopPropagation()
                    const success = purchaseNode(node.id)
                    if (success) {
                      playNodePurchase()
                    }
                  }
                }}
                onPointerEnter={() => {
                  setHoveredNode(node)
                  playHover()
                }}
                onPointerLeave={() => setHoveredNode(null)}
                disabled={!canBuy}
                className={`
                  absolute rounded-full border-2 flex items-center justify-center
                  text-[9px] font-mono font-bold transition-colors duration-150
                  w-9 h-9 -translate-x-1/2 -translate-y-1/2
                  ${purchased ? 'bg-terminal-accent border-terminal-accent text-black' : ''}
                  ${locked ? 'bg-terminal-surface border-terminal-fail/30 text-terminal-text/30 cursor-not-allowed' : ''}
                  ${purchasable && !purchased && !locked && affordable ? 'border-terminal-pass bg-terminal-surface text-terminal-pass hover:border-terminal-accent hover:text-terminal-accent cursor-pointer' : ''}
                  ${purchasable && !purchased && !locked && !affordable ? 'border-terminal-warn/50 bg-terminal-surface text-terminal-text/50 cursor-not-allowed' : ''}
                  ${!purchasable && !purchased && !locked ? 'border-terminal-border bg-terminal-bg/80 text-terminal-text/40' : ''}
                `}
                style={{ left: node.x, top: node.y }}
                aria-label={`${def.name}: ${def.description}. Cost: ${price}g`}
              >
                {def.isAnchor ? '★' : '·'}
              </button>
            )
          })}
        </div>
      </div>

      {hoveredNode && (() => {
        const def = getNodeById(archetype, hoveredNode.defId)
        if (!def) return null
        const price = applyDiscount(def.cost, lck)
        const purchasable = purchasableIds.has(hoveredNode.id)
        const purchased = (draftedIds ?? []).includes(hoveredNode.id)
        const locked = hoveredNode.locked
        return (
          <NodeTooltip
            node={hoveredNode}
            def={def}
            price={price}
            purchasable={purchasable}
            purchased={purchased}
            locked={locked}
            hasDrafts={(currentNodeDrafts ?? 0) > 0}
          />
        )
      })()}

      <div className="absolute top-2 right-2 flex gap-2">
        {isDraft && (
          <div className="px-2 py-1 rounded bg-terminal-accent/20 text-terminal-accent text-xs font-bold">
            DRAFT — {currentNodeDrafts ?? 0} pick{(currentNodeDrafts ?? 0) !== 1 ? 's' : ''}
          </div>
        )}
        <div className="px-2 py-1 rounded bg-terminal-surface text-terminal-text/60 text-xs font-mono">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  )
}
