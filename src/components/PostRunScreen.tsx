import { useState } from 'react'
import { useGameStore } from '../store'

export default function PostRunScreen() {
  const shareString = useGameStore((s) => s.run?.shareString)
  const lastResult = useGameStore((s) => s.run?.lastResult)
  const turn = useGameStore((s) => s.run?.turn)
  const archetype = useGameStore((s) => s.run?.archetype)
  const seed = useGameStore((s) => s.run?.seed)
  const resetRun = useGameStore((s) => s.resetRun)
  const saveBuild = useGameStore((s) => s.saveBuild)
  const [copied, setCopied] = useState(false)
  const [buildName, setBuildName] = useState('')
  const [savingBuild, setSavingBuild] = useState(false)

  function handleCopy() {
    if (!shareString) return
    navigator.clipboard.writeText(shareString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6" style={{ padding: '48px' }}>
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

      <div className="flex items-center gap-3">
        {!savingBuild ? (
          <button
            onClick={() => setSavingBuild(true)}
            className="px-4 py-2 rounded border border-terminal-border text-terminal-text text-xs hover:border-terminal-accent transition-colors"
            aria-label="Save build"
          >
            Save Build
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="Build name..."
              className="px-2 py-1.5 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs w-36 outline-none focus:border-terminal-accent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && buildName.trim()) {
                  saveBuild(buildName.trim())
                  setSavingBuild(false)
                  setBuildName('')
                }
                if (e.key === 'Escape') {
                  setSavingBuild(false)
                  setBuildName('')
                }
              }}
              aria-label="Build name"
            />
            <button
              onClick={() => {
                if (buildName.trim()) {
                  saveBuild(buildName.trim())
                  setSavingBuild(false)
                  setBuildName('')
                }
              }}
              disabled={!buildName.trim()}
              className="px-3 py-1.5 rounded bg-terminal-accent text-black text-xs font-bold hover:bg-terminal-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Confirm save build"
            >
              Save
            </button>
            <button
              onClick={() => { setSavingBuild(false); setBuildName('') }}
              className="px-2 py-1.5 rounded border border-terminal-border text-terminal-text/60 text-xs hover:text-terminal-text"
              aria-label="Cancel save build"
            >
              Cancel
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
    </div>
  )
}
