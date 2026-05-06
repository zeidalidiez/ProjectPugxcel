import { useGameStore } from '../store'
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

  const isDraft = phase === RunPhase.DRAFT
  const isPrep = turn !== undefined && turn <= PREP_TURNS
  const activeIdx = phase ? PHASE_INDEX[phase] : -1

  return (
    <div className="h-full flex flex-col gap-2 p-3">
      <div className="flex items-center gap-3 px-4 py-3 rounded border border-terminal-border bg-terminal-surface">
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
        <div className="text-terminal-accent text-xs font-mono px-1">
          › {isPrep ? PHASE_HELP[phase as string].prep : PHASE_HELP[phase as string].encounter}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-terminal-border pb-2">
        <ForecastRadar />
        <GoldDisplay />
      </div>
      <ThreatHeatmap />

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="flex flex-col gap-2 w-48 shrink-0">
          <StatPanel />
          <EquipmentSlots />
          <PowerPreview />
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <ConstellationViewport />
          {isDraft && <StoreModal />}
        </div>

        <div className="w-64 shrink-0">
          <TurnHistory />
        </div>
      </div>

      <div className="border-t border-terminal-border pt-2">
        {phase === RunPhase.FORECAST && (
          <button
            onClick={() => useGameStore.getState().advanceToPayout()}
            className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-accent text-black hover:bg-terminal-accent/80 transition-colors"
          >
            Continue to Payout
          </button>
        )}
        {phase === RunPhase.PAYOUT && (
          <button
            onClick={() => useGameStore.getState().initDraft()}
            className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-accent text-black hover:bg-terminal-accent/80 transition-colors"
          >
            Begin Drafting
          </button>
        )}
        {isDraft && isPrep && (
          <button
            onClick={() => useGameStore.getState().advanceToForecast()}
            className="w-full py-4 text-lg font-bold tracking-widest uppercase rounded bg-terminal-warn text-black hover:bg-terminal-warn/80 transition-colors"
          >
            Advance to Next Turn
          </button>
        )}
        {isDraft && !isPrep && <ExecuteButton />}
      </div>
    </div>
  )
}
