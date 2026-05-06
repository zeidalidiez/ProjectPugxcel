import { useEffect, useState } from 'react'
import { useGameStore } from '../store'
import { usePhase } from '../hooks/usePhase'

export default function ExecuteTerminal() {
  const combatLog = useGameStore((s) => s.run?.combatLog)
  const lastResult = useGameStore((s) => s.run?.lastResult)
  const { advance } = usePhase()

  const [displayedLines, setDisplayedLines] = useState<number>(0)

  useEffect(() => {
    setDisplayedLines(0)
    if (!combatLog || combatLog.length === 0) return

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedLines(i)
      if (i >= combatLog.length) {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [combatLog])

  useEffect(() => {
    if (!combatLog || !lastResult) return
    if (displayedLines >= combatLog.length) {
      const timer = setTimeout(() => advance(), 2000)
      return () => clearTimeout(timer)
    }
  }, [displayedLines, combatLog, lastResult, advance])

  if (!combatLog || combatLog.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-bg/95" role="dialog" aria-label="Resolution">
      <div className="flex flex-col gap-4 max-w-2xl w-full p-8">
        {combatLog.slice(0, displayedLines).map((line, i) => (
          <div
            key={i}
            className={`
              font-mono text-sm leading-relaxed transition-opacity duration-100
              ${line.type === 'crit' ? 'text-terminal-warn' : ''}
              ${line.type === 'ability' ? 'text-terminal-vampire' : ''}
              ${line.type === 'total' ? 'text-terminal-text-bright font-bold' : ''}
              ${line.type === 'result' ? 'text-terminal-accent text-3xl font-bold text-center mt-4' : ''}
              ${line.type === 'info' ? 'text-terminal-text' : ''}
            `}
            style={{ opacity: Math.min(1, (i + 1) / displayedLines) }}
          >
            {line.type === 'info' && '> '}{line.text}
          </div>
        ))}

        {displayedLines >= (combatLog?.length ?? 0) && lastResult && (
          <div className={`text-center text-5xl font-bold mt-6 ${lastResult.pass ? 'text-terminal-pass' : 'text-terminal-fail'}`}>
            {lastResult.pass ? 'PASS' : 'FAIL'}
          </div>
        )}
      </div>
    </div>
  )
}
