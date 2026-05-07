import { useState, useEffect, useRef } from 'react'
import { createRNG } from '../game/rng/create'
import { generateConstellation } from '../game/constellation/generate'
import { canPurchaseNode } from '../game/constellation/canPurchase'
import { purchaseNode } from '../game/constellation/purchase'
import { generateEncounters } from '../game/resolve/encounter'
import { resolve } from '../game/resolve/resolve'
import { calculatePayout } from '../game/economy/payout'
import { parseShareString } from '../game/save/deserialize'
import { EMPTY_STATS, addStats } from '../types/stats'
import { Archetype, StatType, RunPhase } from '../types/enums'
import type { RunState, CombatLogLine } from '../types/run'

interface ReplayViewerProps {
  shareString: string
  onBack: () => void
}

export default function ReplayViewer({ shareString, onBack }: ReplayViewerProps) {
  const [log, setLog] = useState<CombatLogLine[]>([])
  const [displayedLines, setDisplayedLines] = useState(0)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [finalResult, setFinalResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const replaying = useRef(false)

  useEffect(() => {
    if (replaying.current) return
    replaying.current = true

    try {
      const result = parseShareString(shareString.trim())
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      const parsed = result.data

      const archMap: Record<string, Archetype> = {
        SPRGK: Archetype.SPORGK,
        ELF: Archetype.ELF,
        VAMP: Archetype.VAMPIRE,
      }
      const archetype = archMap[parsed.archetype]
      if (!archetype) {
        setError(`Unknown archetype: ${parsed.archetype}`)
        return
      }

      const seed = parsed.seed
      const draftSeq = parsed.draftSeq
      const rng = createRNG(seed)
      const constellation = generateConstellation(rng, archetype)

      let draftedIds: string[] = []
      const startId = constellation.startNodeId
      if (startId) draftedIds = [startId]

      const sortedNodes = [...constellation.nodes.values()].sort((a, b) =>
        a.column !== b.column ? a.column - b.column : a.y - b.y,
      )

      let stats = { ...EMPTY_STATS }
      let gold = 80
      let inventory: RunState['inventory'] = []
      let abilities: string[] = []

      if (startId) {
        const result = purchaseNode(constellation, [], startId, archetype)
        if (result) {
          stats = addStats(stats, result.statGain)
          if (result.abilityUnlocked) abilities = [result.abilityUnlocked]
        }
      }

      const allLogs: CombatLogLine[] = []
      const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

      async function replayTurn(turn: number) {
        setCurrentTurn(turn)

        const turnRng = createRNG(`${seed}_${archetype}_t${turn}_ex`)
        const encounters = generateEncounters(turnRng, turn, 5)

        const draftChar = draftSeq[turn - 1]
        if (draftChar && draftChar !== 'Z') {
          const nodeIdx = BASE36.indexOf(draftChar)
          if (nodeIdx >= 0 && nodeIdx < sortedNodes.length) {
            const node = sortedNodes[nodeIdx]
            if (canPurchaseNode(constellation, node.id, draftedIds)) {
              const result = purchaseNode(constellation, draftedIds, node.id, archetype)
              if (result) {
                stats = addStats(stats, result.statGain)
                draftedIds = [...draftedIds, node.id]
                if (result.abilityUnlocked) abilities = [...abilities, result.abilityUnlocked]
              }
            }
          }
        }

        gold += calculatePayout(turn, stats[StatType.LCK])

        const tempRun: RunState = {
          seed,
          archetype,
          turn,
          phase: RunPhase.DRAFT,
          stats,
          baseStats: stats,
          gold,
          constellation,
          draftedNodeIds: draftedIds,
          inventory,
          abilities,
          currentNodeDrafts: 1,
          extraNodeDrafts: 0,
          storeItems: [],
          storeRerolled: false,
          encounters,
          combatLog: [],
          lastResult: null,
          runEnded: false,
          shareString: '',
        }

        const resolveRng = createRNG(`${seed}_${archetype}_t${turn}_re`)
        const { result, log: turnLog } = resolve(tempRun, resolveRng)

        allLogs.push({ text: `── TURN ${turn} ──`, type: 'info' })
        allLogs.push(...turnLog)
        allLogs.push({ text: '', type: 'info' })

        setLog([...allLogs])

        if (!result.pass) {
          setFinalResult('FAIL')
          return false
        }
        return true
      }

      let cancelled = false
      async function walkTurns() {
        for (let t = 1; t <= 20; t++) {
          if (cancelled) return
          const passed = await replayTurn(t)
          if (!passed) break
          await new Promise((r) => setTimeout(r, 1500))
        }
        if (!cancelled && !finalResult) {
          setFinalResult('PASS')
        }
      }

      walkTurns()

      return () => { cancelled = true }
    } catch (e) {
      setError(`Replay error: ${(e as Error).message}`)
      replaying.current = false
    }
  }, [shareString])

  useEffect(() => {
    if (log.length === 0) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedLines(i)
      if (i >= log.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [log])

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-terminal-fail text-lg font-bold">Replay Error</div>
        <div className="text-terminal-text text-sm">{error}</div>
        <button onClick={onBack} className="px-4 py-2 rounded bg-terminal-accent text-black text-sm">Back</button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-12">
      <div className="text-terminal-accent text-xs uppercase tracking-widest mb-2">
        REPLAY OF SHARED RUN — Turn {currentTurn}/20
      </div>

      <div className="flex flex-col gap-1 max-w-2xl w-full max-h-[70vh] overflow-y-auto font-mono text-sm" role="log" aria-live="polite">
        {log.slice(0, displayedLines).map((line, i) => (
          <div
            key={i}
            className={`
              leading-relaxed
              ${line.type === 'crit' ? 'text-terminal-warn' : ''}
              ${line.type === 'ability' ? 'text-terminal-vampire' : ''}
              ${line.type === 'total' ? 'text-terminal-text-bright font-bold' : ''}
              ${line.type === 'result' ? 'text-terminal-accent font-bold' : ''}
              ${line.type === 'info' && line.text.startsWith('──') ? 'text-terminal-text/40 text-xs text-center my-2' : ''}
              ${line.type === 'info' && !line.text.startsWith('──') ? 'text-terminal-text' : ''}
            `}
          >
            {line.type === 'info' && !line.text.startsWith('──') ? '> ' : ''}{line.text}
          </div>
        ))}
      </div>

      {finalResult && (
        <>
          <div className={`text-5xl font-bold ${finalResult === 'PASS' ? 'text-terminal-pass' : 'text-terminal-fail'}`}>
            {finalResult}
          </div>
          <button onClick={onBack} className="px-6 py-3 rounded bg-terminal-accent text-black font-bold text-sm">
            Back to Menu
          </button>
        </>
      )}
    </div>
  )
}
