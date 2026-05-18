import type { Encounter } from '../types/encounters'

interface BossTooltipProps {
  id: string
  encounter: Encounter
}

export default function BossTooltip({ id, encounter }: BossTooltipProps) {
  return (
    <div
      id={id}
      role="tooltip"
      className="absolute top-full left-0 mt-2 z-50 p-3 rounded border border-terminal-fail/50 bg-terminal-surface shadow-lg min-w-48"
    >
      <div className="text-terminal-fail text-xs font-bold uppercase tracking-wider mb-1">
        {encounter.enemyName}
      </div>
      <p className="text-terminal-text text-[10px] leading-snug mb-2 italic">
        "{encounter.flavorText}"
      </p>
      <div className="flex flex-col gap-0.5 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-terminal-text/60">Armor</span>
          <span className="text-terminal-text-bright">{encounter.armor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-text/60">Evasion</span>
          <span className="text-terminal-text-bright">{Math.round(encounter.evasion * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-text/60">INT Resist</span>
          <span className="text-terminal-text-bright">{Math.round(encounter.intResist * 100)}%</span>
        </div>
        {encounter.staminaDrain > 0 && (
          <div className="flex justify-between">
            <span className="text-terminal-text/60">Stamina Drain</span>
            <span className="text-terminal-warn">{encounter.staminaDrain}</span>
          </div>
        )}
      </div>
    </div>
  )
}
