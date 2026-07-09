import { useState, useEffect, useMemo } from 'react'
import { simulateShareReplay } from '../game/save/simulateShareReplay'

interface ReplayViewerProps {
  shareString: string
  onBack: () => void
}

export default function ReplayViewer({ shareString, onBack }: ReplayViewerProps) {
  const simulation = useMemo(() => simulateShareReplay(shareString), [shareString])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!simulation.ok) return
    const logLen = simulation.log.length
    let i = 0
    // Schedule first paint asynchronously to avoid setState-in-effect lint on reset
    const interval = setInterval(() => {
      i++
      setTick(i)
      if (i >= logLen) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [simulation, shareString])

  // Reset display when share string changes via keying off shareString in displayedLines
  const displayedLines = simulation.ok ? Math.min(tick, simulation.log.length) : 0

  if (!simulation.ok) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-12">
        <div className="text-terminal-fail text-lg font-bold">Replay Error</div>
        <div className="text-terminal-text text-sm">{simulation.error}</div>
        <button onClick={onBack} className="px-4 py-2 rounded bg-terminal-accent text-black text-sm">Back</button>
      </div>
    )
  }

  const log = simulation.log
  const currentTurn = log.slice(0, displayedLines).filter((l) => l.text.startsWith('── TURN')).length
  const showFinal = displayedLines >= log.length && log.length > 0
  const finalResult = simulation.finalResult

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

      {showFinal && (
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
