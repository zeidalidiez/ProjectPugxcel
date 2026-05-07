import { useState } from 'react'
import { useGameStore } from '../store'
import { calculateThreshold } from '../game/economy/threshold'

const THREAT_LABELS: Record<string, string> = {
  ARMORED: 'ARMORED',
  EVASIVE: 'EVASIVE',
  RESISTANT: 'RESISTANT',
  STAMINA_DRAIN: 'DRAIN',
  KINETIC: 'KINETIC',
  VOID: 'VOID',
  CRYSTALLINE: 'CRYSTAL',
}

const PREP_TURNS = 0

export default function ForecastRadar() {
  const encounters = useGameStore((s) => s.run?.encounters)
  const turn = useGameStore((s) => s.run?.turn)
  const uncertaintyMode = useGameStore((s) => s.settings.uncertaintyMode)
  const [hoveredTurn, setHoveredTurn] = useState<number | null>(null)

  if (turn === undefined) return null
  const isPrep = turn <= PREP_TURNS

  if (isPrep || !encounters || encounters.length === 0) {
    const remaining = PREP_TURNS - turn + 1
    return (
      <div className="flex items-center gap-2 px-3 py-1" role="region" aria-label="Forecast">
        <span className="text-terminal-warn text-xs font-bold uppercase tracking-wider">
          PREPARATION — {remaining} turn{remaining !== 1 ? 's' : ''} until encounters
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center px-3 py-1 relative" role="region" aria-label="Forecast Radar">
      {encounters.slice(0, 5).map((enc, i) => {
        const t = turn + i
        const isBoss = t % 5 === 0
        const isCurrent = i === 0

        if (uncertaintyMode && i > 1) {
          return (
            <div key={t} className="flex flex-col items-center px-2 py-1 rounded border border-terminal-border bg-terminal-bg min-w-16 opacity-50">
              <span className={`text-xs ${isBoss ? 'text-terminal-fail' : 'text-terminal-text'}`}>T{t}</span>
              <span className="text-terminal-text/40 text-[10px]">???</span>
            </div>
          )
        }

        return (
          <div
            key={t}
            tabIndex={isBoss ? 0 : -1}
            role={isBoss ? 'button' : undefined}
            aria-describedby={isBoss ? `boss-tooltip-${t}` : undefined}
            onMouseEnter={() => isBoss ? setHoveredTurn(t) : null}
            onMouseLeave={() => setHoveredTurn(null)}
            onFocus={() => setHoveredTurn(t)}
            onBlur={() => setHoveredTurn(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setHoveredTurn(null)
                ;(e.currentTarget as HTMLElement).blur()
              }
            }}
            className={`
              flex flex-col items-center px-2 py-1 rounded border min-w-16 cursor-default
              ${isCurrent ? 'border-terminal-accent bg-terminal-accent/10' : 'border-terminal-border bg-terminal-bg'}
              ${isBoss ? 'hover:border-terminal-fail/60' : ''}
            `}
          >
            <span className={`text-xs font-bold ${isBoss ? 'text-terminal-fail' : 'text-terminal-text-bright'}`}>
              T{t}{isBoss ? ' BOSS' : ''}
            </span>
            <span className="text-terminal-text text-[10px]">
              {calculateThreshold(t)}
            </span>
            <div className="flex gap-0.5 mt-0.5">
              {enc.threatTags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[8px] text-terminal-warn">
                  {THREAT_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {(() => {
        const hovered = hoveredTurn !== null ? encounters.find((_, i) => turn + i === hoveredTurn) : null
        if (!hovered) return null
        return (
          <div
            id={`boss-tooltip-${hoveredTurn}`}
            role="tooltip"
            className="absolute top-full left-0 mt-2 z-50 p-3 rounded border border-terminal-fail/50 bg-terminal-surface shadow-lg min-w-48"
          >
            <div className="text-terminal-fail text-xs font-bold uppercase tracking-wider mb-1">
              {hovered.enemyName}
            </div>
            <p className="text-terminal-text text-[10px] leading-snug mb-2 italic">
              "{hovered.flavorText}"
            </p>
            <div className="flex flex-col gap-0.5 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-text/60">Armor</span>
                <span className="text-terminal-text-bright">{hovered.armor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-text/60">Evasion</span>
                <span className="text-terminal-text-bright">{Math.round(hovered.evasion * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-text/60">INT Resist</span>
                <span className="text-terminal-text-bright">{Math.round(hovered.intResist * 100)}%</span>
              </div>
              {hovered.staminaDrain > 0 && (
                <div className="flex justify-between">
                  <span className="text-terminal-text/60">Stamina Drain</span>
                  <span className="text-terminal-warn">{hovered.staminaDrain}</span>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
