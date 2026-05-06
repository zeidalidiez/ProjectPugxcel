import { useGameStore } from '../store'
import { ThreatTag, StatType } from '../types/enums'

const TAG_STAT_MAP: Partial<Record<ThreatTag, StatType>> = {
  [ThreatTag.ARMORED]: StatType.STR,
  [ThreatTag.EVASIVE]: StatType.INT,
  [ThreatTag.RESISTANT]: StatType.INT,
  [ThreatTag.STAMINA_DRAIN]: StatType.STA,
}

export default function ThreatHeatmap() {
  const encounters = useGameStore((s) => s.run?.encounters)

  if (!encounters || encounters.length === 0) return null

  const tagCounts: Record<string, number> = {}
  for (const enc of encounters.slice(0, 5)) {
    for (const tag of enc.threatTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
  }

  const relevant = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

  if (relevant.length === 0) return null

  return (
    <div className="flex gap-2 items-center px-2 text-xs" aria-label="Threat Analysis">
      {relevant.map(([tag, count]) => {
        const stat = TAG_STAT_MAP[tag as ThreatTag]
        return (
          <span key={tag} className="flex items-center gap-1">
            <span className="text-terminal-warn">{tag.replace('_', ' ')}</span>
            {stat && <span className="text-terminal-text/60">→ {stat}</span>}
            <span className="text-terminal-text/40">x{count}</span>
          </span>
        )
      })}
    </div>
  )
}
