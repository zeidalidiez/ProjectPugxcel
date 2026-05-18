import { useGameStore } from '../store'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-terminal-surface border border-terminal-accent rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-terminal-text-bright text-lg font-bold mb-4 tracking-wider">SETTINGS</h2>

        <div className="mb-5">
          <div className="text-terminal-text text-xs mb-2 uppercase tracking-widest">Font Size</div>
          <div className="flex gap-2">
            {([100, 125, 150] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateSettings({ fontSize: s })}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  settings.fontSize === s
                    ? 'bg-terminal-accent text-black font-bold'
                    : 'border border-terminal-border text-terminal-text hover:border-terminal-accent'
                }`}
                aria-label={`Font size ${s}%`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: 'Sound', key: 'soundEnabled' as const },
            { label: 'Music', key: 'musicEnabled' as const },
            { label: 'Uncertainty Mode', key: 'uncertaintyMode' as const },
            { label: 'Reduced Motion', key: 'reducedMotion' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-terminal-text text-xs">{label}</span>
              <button
                onClick={() => updateSettings({ [key]: !settings[key] })}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings[key] ? 'bg-terminal-accent' : 'bg-terminal-border'
                }`}
                role="switch"
                aria-checked={settings[key]}
                aria-label={`Toggle ${label}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-terminal-accent text-black text-sm font-bold hover:bg-terminal-accent/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
