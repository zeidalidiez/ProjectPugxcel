import { Archetype } from '../types/enums'
import { loadArchetypeFlavor } from '../data/nodes'

export interface ArchetypeCardData {
  key: Archetype
  name: string
  subtitle: string
  description: string
  accentClass: string
  borderClass: string
  bgTint: string
}

interface ArchetypeCardProps {
  arch: ArchetypeCardData
  onSelect: (key: Archetype) => void
}

export default function ArchetypeCard({ arch, onSelect }: ArchetypeCardProps) {
  const flavor = loadArchetypeFlavor(arch.key)
  const primary = flavor.primaryStat
  const secondary = flavor.secondaryStat
  const theme = flavor.theme ?? {}
  const accent = theme['--accent'] ?? '#fb923c'
  const accentSoft = theme['--accent-soft'] ?? '#7c2d12'
  const accentGlow = theme['--accent-glow'] ?? 'rgba(251,176,60,0.55)'
  const rgbMatch = accent.match(/^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i)
  const bgTint = rgbMatch
    ? `rgba(${parseInt(rgbMatch[1], 16)},${parseInt(rgbMatch[2], 16)},${parseInt(rgbMatch[3], 16)},0.06)`
    : 'rgba(251,146,60,0.06)'

  function applyTheme() {
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value)
    }
    document.documentElement.setAttribute('data-archetype', arch.key.toLowerCase())
  }

  function clearTheme() {
    for (const key of Object.keys(theme)) {
      document.documentElement.style.removeProperty(key)
    }
    document.documentElement.removeAttribute('data-archetype')
  }

  return (
    <button
      onClick={() => onSelect(arch.key)}
      onMouseEnter={applyTheme}
      onMouseLeave={clearTheme}
      className="flex flex-col items-center text-center gap-5 rounded-lg border-2 border-terminal-border hover:border-terminal-accent transition-all flex-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-terminal-accent"
      style={{
        padding: '36px 28px',
        backgroundColor: bgTint,
        borderColor: accent,
        borderWidth: '1px',
      }}
      aria-label={`Select ${arch.name}`}
    >
      <div>
        <div className="text-terminal-text-bright font-bold text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{arch.name}</div>
        <div className="text-terminal-text text-sm mt-1">{arch.subtitle}</div>
      </div>
      <p className="text-terminal-text text-sm leading-relaxed max-w-sm">{arch.description}</p>
      <div className="flex gap-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{
            backgroundColor: accent,
            color: '#000',
            boxShadow: `0 0 14px ${accentGlow}`,
          }}
        >
          {primary}
        </span>
        <span
          className="px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{
            backgroundColor: accentSoft,
            color: accent,
            boxShadow: `0 0 6px ${accentGlow}`,
          }}
        >
          {secondary}
        </span>
      </div>
    </button>
  )
}
