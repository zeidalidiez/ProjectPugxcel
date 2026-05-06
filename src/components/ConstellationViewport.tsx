import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useGameStore } from '../store'
import { getNodeById } from '../data/nodes'
import { canPurchaseNode } from '../game/constellation/canPurchase'
import { applyDiscount } from '../game/economy/cost'
import { StatType } from '../types/enums'
import { STAT_LABELS } from '../types/stats'
import type { ConstellationNode } from '../types/nodes'

export default function ConstellationViewport() {
  const constellation = useGameStore((s) => s.run?.constellation)
  const draftedIds = useGameStore((s) => s.run?.draftedNodeIds)
  const archetype = useGameStore((s) => s.run?.archetype)
  const currentNodeDrafts = useGameStore((s) => s.run?.currentNodeDrafts)
  const gold = useGameStore((s) => s.run?.gold)
  const lck = useGameStore((s) => s.run?.stats?.[StatType.LCK]) ?? 0
  const purchaseNode = useGameStore((s) => s.purchaseNode)
  const phase = useGameStore((s) => s.run?.phase)

  const [scale, setScale] = useState(0.6)
  const [offset, setOffset] = useState({ x: 100, y: 60 })
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastOffset = useRef({ x: 0, y: 0 })

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
            const def = getNodeById(archetype, node.defId)
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
                    purchaseNode(node.id)
                  }
                }}
                onPointerEnter={() => setHoveredNode(node)}
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
          <div className="absolute bottom-4 left-4 z-50 pointer-events-none p-3 rounded border border-terminal-accent bg-terminal-surface shadow-lg max-w-64">
            <div className="flex items-center gap-1 mb-1">
              {def.isAnchor && <span className="text-terminal-warn text-xs">★</span>}
              <span className="text-terminal-text-bright font-bold text-xs">{def.name}</span>
              <span className="text-terminal-text/40 text-[10px] ml-auto">{def.type}</span>
            </div>
            <p className="text-terminal-text text-[10px] leading-snug mb-2">{def.description}</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {def.effects.map((eff, i) => (
                <span key={i} className="text-[9px] px-1 rounded bg-terminal-accent/10 text-terminal-accent">
                  {eff.kind === 'flat' ? '+' : ''}{eff.value} {STAT_LABELS[eff.stat]}
                </span>
              ))}
            </div>
            <div className="flex justify-between text-[10px]">
              <span className={purchased ? 'text-terminal-accent' : locked ? 'text-terminal-fail' : purchasable ? 'text-terminal-warn' : 'text-terminal-text/40'}>
                {purchased ? 'Purchased' : locked ? 'Locked' : purchasable ? `${price}g` : 'Unreachable'}
              </span>
              {currentNodeDrafts !== undefined && currentNodeDrafts > 0 && purchasable && !purchased && (
                <span className="text-terminal-pass">Click to buy</span>
              )}
            </div>
          </div>
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
