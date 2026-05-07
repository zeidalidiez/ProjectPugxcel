import { useEffect } from 'react'
import { useGameStore } from '../store'

export function useFontScale() {
  const fontSize = useGameStore((s) => s.settings.fontSize)
  const setFontSize = useGameStore((s) => s.updateSettings)

  useEffect(() => {
    const base = 14
    const rem = (base * fontSize) / 100
    document.documentElement.style.fontSize = `${rem}px`
  }, [fontSize])

  return { fontSize, setFontSize: (val: 100 | 125 | 150) => setFontSize({ fontSize: val }) }
}
