import { useEffect, useState } from 'react'
import { useGameStore } from '../store'
import { usePhase } from '../hooks/usePhase'
import { audioEngine } from '../sound/engine'

export default function ExecuteTerminal() {
  const combatLog = useGameStore((s) => s.run?.combatLog)
  const lastResult = useGameStore((s) => s.run?.lastResult)
  const { advance } = usePhase()

  const [displayedCharCount, setDisplayedCharCount] = useState(0)

  useEffect(() => {
    setDisplayedCharCount(0)
    if (!combatLog || combatLog.length === 0) return

    const totalChars = combatLog.reduce((sum, line) => sum + line.text.length, 0)
    let i = 0
    const interval = setInterval(() => {
      i++
      audioEngine.playTypewriterTick()
      setDisplayedCharCount(i)
      if (i >= totalChars) {
        clearInterval(interval)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [combatLog])

  useEffect(() => {
    if (!combatLog || !lastResult) return
    const totalChars = combatLog.reduce((sum, line) => sum + line.text.length, 0)
    if (displayedCharCount >= totalChars && totalChars > 0) {
      const timer = setTimeout(() => advance(), 2000)
      return () => clearTimeout(timer)
    }
  }, [displayedCharCount, combatLog, lastResult, advance])

  if (!combatLog || combatLog.length === 0) return null

  const totalChars = combatLog.reduce((sum, line) => sum + line.text.length, 0)
  let remaining = displayedCharCount
  const visibleLines: Array<{ line: (typeof combatLog)[number]; visibleText: string; lineIndex: number }> = []

  for (let idx = 0; idx < combatLog.length; idx++) {
    if (remaining <= 0) break
    const line = combatLog[idx]
    const visibleChars = Math.min(remaining, line.text.length)
    visibleLines.push({ line, visibleText: line.text.substring(0, visibleChars), lineIndex: idx })
    remaining -= line.text.length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-bg/95" role="dialog" aria-label="Resolution">
      <div className="flex flex-col gap-4 max-w-2xl w-full" style={{ padding: '40px' }} aria-live="polite">
        {visibleLines.map((item) => (
          <div
            key={item.lineIndex}
            className={`
              font-mono text-sm leading-relaxed transition-opacity duration-100
              ${item.line.type === 'crit' ? 'text-terminal-warn' : ''}
              ${item.line.type === 'ability' ? 'text-terminal-vampire' : ''}
              ${item.line.type === 'total' ? 'text-terminal-text-bright font-bold' : ''}
              ${item.line.type === 'result' ? 'text-terminal-accent text-3xl font-bold text-center mt-4' : ''}
              ${item.line.type === 'info' ? 'text-terminal-text' : ''}
            `}
          >
            {item.line.type === 'info' && '> '}{item.visibleText}
          </div>
        ))}

        {displayedCharCount >= totalChars && totalChars > 0 && lastResult && (
          <div className={`text-center text-5xl font-bold mt-6 ${lastResult.pass ? 'text-terminal-pass' : 'text-terminal-fail'}`}>
            {lastResult.pass ? 'PASS' : 'FAIL'}
          </div>
        )}
      </div>
    </div>
  )
}
