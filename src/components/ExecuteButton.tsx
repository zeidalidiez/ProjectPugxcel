import { useGameStore } from '../store'

export default function ExecuteButton() {
  const phase = useGameStore((s) => s.run?.phase)
  const execute = useGameStore((s) => s.execute)
  const isDraft = phase === 'DRAFT'

  return (
    <div>
      <button
        onClick={execute}
        disabled={!isDraft}
        className={`
          w-full py-4 text-lg font-bold tracking-widest uppercase rounded transition-colors
          ${isDraft
            ? 'bg-terminal-accent text-black hover:bg-terminal-accent/80 cursor-pointer'
            : 'bg-terminal-surface text-terminal-text/30 cursor-not-allowed'
          }
        `}
        style={{ fontFamily: 'var(--font-display)' }}
        aria-label="Execute — press Enter or Space"
      >
        Execute
      </button>
      {isDraft && <div className="text-terminal-accent/50 text-[10px] font-mono text-center mt-1">[Enter / Space]</div>}
    </div>
  )
}
