import { useGameStore } from '../store'

export default function TurnHistory() {
  const combatLog = useGameStore((s) => s.run?.combatLog)

  if (!combatLog || combatLog.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5 p-2 border border-terminal-border rounded bg-terminal-surface h-full overflow-y-auto" role="log" aria-label="Combat Log">
      <div className="text-terminal-text text-xs uppercase tracking-widest mb-1">Combat Log</div>
      {combatLog.map((line, i) => (
        <div
          key={i}
          className={`
            text-xs font-mono leading-relaxed
            ${line.type === 'crit' ? 'text-terminal-warn' : ''}
            ${line.type === 'ability' ? 'text-terminal-vampire' : ''}
            ${line.type === 'total' ? 'text-terminal-text-bright font-bold' : ''}
            ${line.type === 'result' ? 'text-terminal-accent text-sm font-bold' : ''}
            ${line.type === 'info' ? 'text-terminal-text' : ''}
          `}
        >
          {line.text}
        </div>
      ))}
    </div>
  )
}
