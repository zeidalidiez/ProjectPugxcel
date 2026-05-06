import { useMemo } from 'react'
import { useGameStore } from '../store'

export function useFontScale() {
  const fontSize = useGameStore((s) => s.settings.fontSize)

  const scale = useMemo(() => fontSize / 100, [fontSize])

  const style = useMemo<React.CSSProperties>(() => ({
    fontSize: `${14 * scale}px`,
    lineHeight: 1.5,
  }), [scale])

  const setFontSize = useGameStore((s) => s.updateSettings)

  return { scale, style, fontSize, setFontSize: (val: 100 | 125 | 150) => setFontSize({ fontSize: val }) }
}
