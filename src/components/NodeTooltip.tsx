import { STAT_LABELS } from '../types/stats'
import type { ConstellationNode, NodeDef } from '../types/nodes'

interface NodeTooltipProps {
  node: ConstellationNode
  def: NodeDef
  price: number
  purchasable: boolean
  purchased: boolean
  locked: boolean
  hasDrafts: boolean
}

export default function NodeTooltip({ node: _node, def, price, purchasable, purchased, locked, hasDrafts }: NodeTooltipProps) {
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
        {hasDrafts && purchasable && !purchased && (
          <span className="text-terminal-pass">Click to buy</span>
        )}
      </div>
    </div>
  )
}
