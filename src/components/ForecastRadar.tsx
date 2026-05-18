import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useGameStore } from '../store'
import { calculateThreshold } from '../game/economy/threshold'
import BossTooltip from './BossTooltip'

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
  const { encounters, turn, balanceWeights } = useGameStore(
    useShallow((s) => ({
      encounters: s.run?.encounters,
      turn: s.run?.turn,
      balanceWeights: s.run?.balanceWeights,
    })),
  )
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
    <div className="flex gap-2 items-center px-3 py-1 overflow-x-auto snap-x sm:overflow-visible relative" role="region" aria-label="Forecast Radar">
      {encounters.slice(0, 5).map((enc, i) => {
        const t = turn + i
        const isBoss = t % 5 === 0
        const isCurrent = i === 0

        if (uncertaintyMode && i > 1) {
          return (
            <div key={t} className="flex flex-col items-center px-2 py-1 rounded border border-terminal-border bg-terminal-bg min-w-14 max-sm:min-w-12 opacity-50 snap-start flex-shrink-0">
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
              flex flex-col items-center px-2 py-1 rounded border min-w-14 max-sm:min-w-12 cursor-default snap-start flex-shrink-0
              ${isCurrent ? 'border-terminal-accent bg-terminal-accent/10' : 'border-terminal-border bg-terminal-bg'}
              ${isBoss ? 'hover:border-terminal-fail/60' : ''}
            `}
          >
            <span className={`text-xs font-bold ${isBoss ? 'text-terminal-fail' : 'text-terminal-text-bright'}`}>
              T{t}{isBoss ? ' BOSS' : ''}
            </span>
            <span className="text-terminal-text text-[10px]">
              {calculateThreshold(t, balanceWeights)}
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
        if (!hovered || hoveredTurn === null) return null
        return <BossTooltip id={`boss-tooltip-${hoveredTurn}`} encounter={hovered} />
      })()}
    </div>
  )
}
