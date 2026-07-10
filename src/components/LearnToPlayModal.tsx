import { useEffect, useState } from 'react'
import { LEARN_STEPS } from '../data/learn-to-play'

interface LearnToPlayModalProps {
  onClose: () => void
}

export default function LearnToPlayModal({ onClose }: LearnToPlayModalProps) {
  const [step, setStep] = useState(0)
  const current = LEARN_STEPS[step]
  const isFirst = step === 0
  const isLast = step === LEARN_STEPS.length - 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (isLast) onClose()
        else setStep((s) => Math.min(s + 1, LEARN_STEPS.length - 1))
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setStep((s) => Math.max(s - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLast, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-title"
        className="bg-terminal-surface border border-terminal-accent rounded-lg p-5 sm:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-[0_0_32px_var(--accent-glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-terminal-accent text-[10px] uppercase tracking-[0.2em] mb-1">
              Learn to Play · {step + 1}/{LEARN_STEPS.length}
            </div>
            <h2
              id="learn-title"
              className="text-terminal-text-bright text-lg font-bold tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {current.title}
            </h2>
            <p className="text-terminal-text text-xs mt-0.5">{current.kicker}</p>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-text/60 hover:text-terminal-text text-sm shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 mb-4" aria-hidden>
          {LEARN_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === step ? 'bg-terminal-accent' : i < step ? 'bg-terminal-accent/40' : 'bg-terminal-border'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {current.body.map((line) => (
            <p key={line} className="text-terminal-text text-sm leading-relaxed">
              <span className="text-terminal-accent/70 mr-1.5">›</span>
              {line}
            </p>
          ))}
        </div>

        {current.callout && (
          <div className="mb-5 px-3 py-2 rounded border border-terminal-accent/40 bg-terminal-accent/10 text-terminal-accent text-xs font-mono leading-relaxed">
            {current.callout}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={isFirst}
            className="px-3 py-1.5 rounded border border-terminal-border text-terminal-text text-xs hover:border-terminal-accent hover:text-terminal-text-bright disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            {!isLast && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-terminal-border text-terminal-text/60 text-xs hover:text-terminal-text transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
              className="px-4 py-1.5 rounded bg-terminal-accent text-black text-xs font-bold hover:bg-terminal-accent/80 transition-colors"
            >
              {isLast ? 'Begin' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
