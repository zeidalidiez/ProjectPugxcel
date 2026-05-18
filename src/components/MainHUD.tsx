import { useGameStore } from '../store'
import { useState } from 'react'
import { RunPhase } from '../types/enums'
import StatPanel from './StatPanel'
import EquipmentSlots from './EquipmentSlots'
import PowerPreview from './PowerPreview'
import ConstellationViewport from './ConstellationViewport'
import TurnHistory from './TurnHistory'
import ForecastRadar from './ForecastRadar'
import ThreatHeatmap from './ThreatHeatmap'
import GoldDisplay from './GoldDisplay'
import StoreModal from './StoreModal'
import ExecuteButton from './ExecuteButton'

const RUN_PHASES = [RunPhase.FORECAST, RunPhase.PAYOUT, RunPhase.DRAFT] as const
const PHASE_INDEX: Record<string, number> = { FORECAST: 0, PAYOUT: 1, DRAFT: 2 }

const PREP_TURNS = 0

const PHASE_HELP: Record<string, { prep: string; encounter: string }> = {
  [RunPhase.FORECAST]: {
    prep: 'No threats detected. Build freely. Press CONTINUE.',
    encounter: 'Review the radar above. Plan which stats to invest. Press CONTINUE when ready.',
  },
  [RunPhase.PAYOUT]: {
    prep: 'Gold received. Press BEGIN DRAFTING to enter the store.',
    encounter: 'Gold received. Press BEGIN DRAFTING to enter the store.',
  },
  [RunPhase.DRAFT]: {
    prep: 'Purchase 1 node (green circles) + any items. Press ADVANCE to continue.',
    encounter: 'Purchase 1 node (green circles) + any items from the store. Press EXECUTE to resolve.',
  },
}

export default function MainHUD() {
  const phase = useGameStore((s) => s.run?.phase)
  const turn = useGameStore((s) => s.run?.turn)
  const [showLeftPanel, setShowLeftPanel] = useState(false)
  const [showLog, setShowLog] = useState(false)

  const isDraft = phase === RunPhase.DRAFT
  const isPrep = turn !== undefined && turn <= PREP_TURNS
  const activeIdx = phase ? PHASE_INDEX[phase] : -1

  return (
    <div className="h-full flex flex-col gap-2 p-3 sm:p-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded border border-terminal-border bg-terminal-surface mb-2">
        {isPrep && (
          <div className="bg-terminal-warn/20 text-terminal-warn text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider mr-2">
            PREPARATION
          </div>
        )}
        {RUN_PHASES.map((p, i) => {
          const isActive = p === phase
          const isPast = i < activeIdx
          return (
            <div key={p} className="flex items-center gap-2">
              <div className={`
                flex items-center gap-1.5 px-2 py-1 rounded font-mono text-xs font-bold
                ${isActive ? 'bg-terminal-accent text-black text-sm px-3 py-1.5' : ''}
                ${isPast ? 'text-terminal-pass' : ''}
                ${!isActive && !isPast ? 'text-terminal-text/30' : ''}
              `}>
                {isPast && <span className="text-terminal-pass">✓</span>}
                <span>{i + 1}. {p}</span>
              </div>
              {i < RUN_PHASES.length - 1 && (
                <span className="text-terminal-border text-xs">—</span>
              )}
            </div>
          )
        })}
        <div className="ml-auto text-terminal-accent text-xs font-mono font-bold tracking-wider">
          TURN {turn}
        </div>
      </div>

      {phase && PHASE_HELP[phase as string] && (
        <div className="text-terminal-accent text-xs font-mono px-1" role="status">
          › {isPrep ? PHASE_HELP[phase as string].prep : PHASE_HELP[phase as string].encounter}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-terminal-border pb-2">
        <div className="flex items-center gap-3">
          <ForecastRadar />
          <ThreatHeatmap />
        </div>
        <div className="flex items-center gap-3">
          <GoldDisplay />
          <button
            onClick={() => setShowLog(!showLog)}
            className={`px-3 py-1 rounded border text-xs font-mono transition-colors ${
              showLog
                ? 'bg-terminal-accent/20 border-terminal-accent text-terminal-accent'
                : 'border-terminal-border text-terminal-text/60 hover:text-terminal-text hover:border-terminal-text/40'
            }`}
            aria-pressed={showLog}
          >
            Log
          </button>
        </div>
      </div>

      <div className="sm:hidden flex gap-2 mb-2">
        <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="px-3 py-1 rounded border border-terminal-border text-terminal-text text-xs">
          {showLeftPanel ? 'Hide Stats' : 'Stats'}
        </button>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        <div className={`flex-col gap-2 w-48 shrink-0 ${showLeftPanel ? 'flex' : 'hidden'} sm:flex`}>
          <StatPanel />
          <EquipmentSlots />
          <PowerPreview />
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0 relative">
          <ConstellationViewport />
          {isDraft && <StoreModal />}
          {showLog && (
            <div className="absolute top-2 right-2 z-50">
              <TurnHistory onClose={() => setShowLog(false)} />
            </div>
          )}
        </div>

      </div>

      <div className="border-t border-terminal-border pt-2">
        {phase === RunPhase.FORECAST && (
          <div>
            <button
              onClick={() => useGameStore.getState().advanceToPayout()}
              className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-accent text-black hover:bg-terminal-accent/80 transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-label="Continue to Payout — press Enter or Space"
            >
              Continue to Payout
            </button>
            <div className="text-terminal-text/30 text-[10px] font-mono text-center mt-1">[Enter / Space]</div>
          </div>
        )}
        {phase === RunPhase.PAYOUT && (
          <div>
            <button
              onClick={() => useGameStore.getState().initDraft()}
              className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-accent text-black hover:bg-terminal-accent/80 transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-label="Begin Drafting — press Enter or Space"
            >
              Begin Drafting
            </button>
            <div className="text-terminal-text/30 text-[10px] font-mono text-center mt-1">[Enter / Space]</div>
          </div>
        )}
        {isDraft && isPrep && (
          <div>
            <button
              onClick={() => useGameStore.getState().advanceToForecast()}
              className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-warn text-black hover:bg-terminal-warn/80 transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-label="Advance to Next Turn — press Enter or Space"
            >
              Advance to Next Turn
            </button>
            <div className="text-terminal-text/30 text-[10px] font-mono text-center mt-1">[Enter / Space]</div>
          </div>
        )}
        {isDraft && !isPrep && <ExecuteButton />}
      </div>
    </div>
  )
}
