import { useState } from 'react'
import { useGameStore } from '../store'

export default function PostRunScreen() {
  const shareString = useGameStore((s) => s.run?.shareString)
  const lastResult = useGameStore((s) => s.run?.lastResult)
  const turn = useGameStore((s) => s.run?.turn)
  const archetype = useGameStore((s) => s.run?.archetype)
  const seed = useGameStore((s) => s.run?.seed)
  const resetRun = useGameStore((s) => s.resetRun)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!shareString) return
    navigator.clipboard.writeText(shareString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
      <div className={`text-6xl font-bold ${lastResult?.pass ? 'text-terminal-pass' : 'text-terminal-fail'}`}>
        {lastResult?.pass ? 'PASS' : 'FAIL'}
      </div>

      <div className="flex flex-col gap-2 text-center">
        <div className="text-terminal-text text-sm">
          {archetype} · Turn {turn}/20 · Seed: {seed?.slice(0, 8)}
        </div>
        {lastResult && (
          <div className="text-terminal-text text-sm">
            {lastResult.pass
              ? `Margin: +${lastResult.deficit}`
              : `Deficit: -${Math.abs(lastResult.deficit)}`}
          </div>
        )}
      </div>

      {shareString && (
        <div className="flex items-center gap-2">
          <code className="px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-text-bright text-xs font-mono">
            {shareString}
          </code>
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded border border-terminal-accent text-terminal-accent text-xs hover:bg-terminal-accent/10 transition-colors"
            aria-label="Copy share string"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <button
        onClick={resetRun}
        className="px-6 py-3 rounded bg-terminal-accent text-black font-bold text-sm hover:bg-terminal-accent/80 transition-colors"
        aria-label="Restart run"
      >
        Restart Run
      </button>
    </div>
  )
}
