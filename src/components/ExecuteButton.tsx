import { useGameStore } from '../store'

export default function ExecuteButton() {
  const phase = useGameStore((s) => s.run?.phase)
  const execute = useGameStore((s) => s.execute)
  const isDraft = phase === 'DRAFT'

  return (
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
      aria-label="Execute"
    >
      Execute
    </button>
  )
}
