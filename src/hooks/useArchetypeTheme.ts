import { useEffect } from 'react'
import { useGameStore } from '../store'
import { loadArchetypeFlavor } from '../data/nodes'

const DEFAULT_THEME: Record<string, string> = {
  '--accent': '#fb923c',
  '--accent-soft': '#7c2d12',
  '--accent-glow': 'rgba(251, 146, 60, 0.20)',
  '--radius-card': '4px',
  '--background-mood-color': '#ffffff',
  '--background-mood-density': '0.04',
}

export function useArchetypeTheme() {
  const archetype = useGameStore((s) => s.run?.archetype)

  useEffect(() => {
    const root = document.documentElement
    const theme = archetype
      ? (loadArchetypeFlavor(archetype).theme ?? DEFAULT_THEME)
      : DEFAULT_THEME

    const prev: string[] = []
    for (const [key, value] of Object.entries(theme)) {
      const old = root.style.getPropertyValue(key)
      if (old) prev.push(key)
      root.style.setProperty(key, value)
    }

    return () => {
      for (const key of prev) {
        root.style.removeProperty(key)
      }
    }
  }, [archetype])
}
