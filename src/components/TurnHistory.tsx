import { useGameStore } from '../store'

interface TurnHistoryProps {
  onClose: () => void
}

export default function TurnHistory({ onClose }: TurnHistoryProps) {
  const combatLog = useGameStore((s) => s.run?.combatLog)

  if (!combatLog || combatLog.length === 0) return null

  return (
    <div className="flex flex-col max-h-72 w-64 rounded border border-terminal-border bg-terminal-surface/95 shadow-lg backdrop-blur-sm" role="log" aria-live="polite" aria-label="Combat Log">
      <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-border shrink-0">
        <span className="text-terminal-text text-xs uppercase tracking-widest">Combat Log</span>
        <button
          onClick={onClose}
          className="text-terminal-text/50 hover:text-terminal-text text-sm leading-none px-1"
          aria-label="Close combat log"
        >
          ×
        </button>
      </div>
      <div className="overflow-y-auto p-2 flex flex-col gap-0.5">
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
    </div>
  )
}
