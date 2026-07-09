import { STAT_LABELS } from '../types/stats'
import { StatType } from '../types/enums'
import type { ItemDef, ItemEffect } from '../types/items'

interface EquipCompareModalProps {
  equipped: ItemDef
  incoming: ItemDef
  price: number
  onConfirm: () => void
  onCancel: () => void
}

function effectLines(effects: ItemEffect[]): string[] {
  const lines: string[] = []
  for (const eff of effects) {
    if (eff.strMult !== undefined) lines.push(`Weapon mult ×${eff.strMult}`)
    if (eff.flatBonus !== undefined) lines.push(`+${eff.flatBonus} flat dmg`)
    if (eff.resistance) {
      lines.push(`${eff.resistance.tag} null −${eff.resistance.value}`)
    }
    if (eff.statBonus) {
      for (const [k, v] of Object.entries(eff.statBonus)) {
        if (v !== undefined) lines.push(`+${v} ${STAT_LABELS[k as StatType] ?? k}`)
      }
    }
    if (eff.grantsAbility) lines.push('Grants ability')
    if (eff.extraNodeDraft) lines.push('+1 node draft')
  }
  return lines.length > 0 ? lines : ['No special effects']
}

function ItemColumn({
  label,
  def,
  accent,
}: {
  label: string
  def: ItemDef
  accent: 'current' | 'new'
}) {
  const lines = effectLines(def.effects)
  const border =
    accent === 'new'
      ? 'border-terminal-accent bg-terminal-accent/5'
      : 'border-terminal-border bg-terminal-bg/60'

  return (
    <div className={`flex-1 min-w-0 rounded border p-3 ${border}`}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-terminal-text/50 mb-1">
        {label}
      </div>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-terminal-text-bright font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {def.name}
        </span>
        <span className="text-[10px] font-mono text-terminal-text/50 shrink-0">
          {def.tier}
        </span>
      </div>
      <div className="text-[10px] font-mono text-terminal-text/40 mb-2">
        {def.slot} · {def.category}
      </div>
      <p className="text-terminal-text/80 text-xs leading-snug mb-3">{def.description}</p>
      <ul className="flex flex-col gap-1">
        {lines.map((line) => (
          <li
            key={line}
            className={`text-[11px] font-mono ${
              accent === 'new' ? 'text-terminal-accent' : 'text-terminal-text/70'
            }`}
          >
            {accent === 'new' ? '+ ' : '· '}{line}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function EquipCompareModal({
  equipped,
  incoming,
  price,
  onConfirm,
  onCancel,
}: EquipCompareModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-terminal-bg/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="equip-compare-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-2xl rounded border border-terminal-accent/40 bg-terminal-surface shadow-[0_0_40px_rgba(0,0,0,0.6)] p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="equip-compare-title" className="text-terminal-accent text-xs font-mono uppercase tracking-[0.2em] mb-1">
          Slot conflict · {incoming.slot}
        </div>
        <h2
          className="text-terminal-text-bright text-xl mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Replace equipped gear?
        </h2>
        <p className="text-terminal-text/60 text-xs mb-4 font-mono">
          This slot is already filled. Confirm to scrap the current piece and equip the new one for {price}g.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <ItemColumn label="Currently equipped" def={equipped} accent="current" />
          <div className="hidden sm:flex items-center justify-center text-terminal-accent font-mono text-lg px-1" aria-hidden>
            →
          </div>
          <ItemColumn label="Purchasing" def={incoming} accent="new" />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded border border-terminal-border text-terminal-text text-sm font-mono hover:border-terminal-text/50 transition-colors"
          >
            Keep current
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded bg-terminal-accent text-black text-sm font-bold tracking-wide hover:brightness-110 transition-all"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Replace · {price}g
          </button>
        </div>
      </div>
    </div>
  )
}
