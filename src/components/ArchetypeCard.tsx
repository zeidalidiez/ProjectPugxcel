import { Archetype } from '../types/enums'

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
  return (
    <button
      onClick={() => onSelect(arch.key)}
      onMouseEnter={() => document.documentElement.setAttribute('data-archetype', arch.key.toLowerCase())}
      onMouseLeave={() => document.documentElement.removeAttribute('data-archetype')}
      className="flex flex-col items-center text-center gap-5 rounded-lg border-2 border-terminal-border hover:border-terminal-accent transition-all flex-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-terminal-accent"
      style={{ padding: '36px 28px', backgroundColor: arch.bgTint, borderColor: 'var(--accent)', borderWidth: '1px' }}
      aria-label={`Select ${arch.name}`}
    >
      <div>
        <div className="text-terminal-text-bright font-bold text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{arch.name}</div>
        <div className="text-terminal-text text-sm mt-1">{arch.subtitle}</div>
      </div>
      <p className="text-terminal-text text-sm leading-relaxed max-w-sm">{arch.description}</p>
      <div className="flex gap-2">
        {arch.key === Archetype.SPORGK && (
          <>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>STR</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>STA</span>
          </>
        )}
        {arch.key === Archetype.ELF && (
          <>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>AGI</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}>LCK</span>
          </>
        )}
        {arch.key === Archetype.VAMPIRE && (
          <>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>INT</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>STA</span>
          </>
        )}
      </div>
    </button>
  )
}
