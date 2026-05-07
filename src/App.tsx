import { useEffect, useState } from 'react'
import { useGameStore } from './store'
import { RunPhase } from './types/enums'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useFontScale } from './hooks/useFontScale'
import { useAudio } from './hooks/useAudio'
import ArchetypeSelect from './components/ArchetypeSelect'
import MainHUD from './components/MainHUD'
import ExecuteTerminal from './components/ExecuteTerminal'
import PostRunScreen from './components/PostRunScreen'
import ReplayViewer from './components/ReplayViewer'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const initialized = useGameStore((s) => s.initialized)
  const init = useGameStore((s) => s.init)
  const reducedMotion = useReducedMotion()
  const [replayShare, setReplayShare] = useState<string | null>(null)
  useFontScale()

  useKeyboardNav()
  useAudio()

  useEffect(() => {
    init()
  }, [init])

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center text-terminal-text text-sm">
        Initializing...
      </div>
    )
  }

  if (replayShare) {
    return (
      <ErrorBoundary>
        <ReplayViewer shareString={replayShare} onBack={() => setReplayShare(null)} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`h-full ${reducedMotion ? 'motion-reduce' : ''}`}>
        {phase === RunPhase.ARCHETYPE_SELECT && (
          <ArchetypeSelect onReplay={setReplayShare} />
        )}
        {(phase === RunPhase.FORECAST || phase === RunPhase.PAYOUT || phase === RunPhase.DRAFT) && <MainHUD />}
        {phase === RunPhase.STINGER && <ExecuteTerminal />}
        {phase === RunPhase.POST_RUN && <PostRunScreen />}
      </div>
    </ErrorBoundary>
  )
}
