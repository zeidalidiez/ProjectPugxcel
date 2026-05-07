import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'
import { RunPhase } from '../types/enums'
import { audioEngine } from '../sound/engine'

export function useAudio() {
  const phase = useGameStore((s) => s.phase)
  const lastResult = useGameStore((s) => s.run?.lastResult)
  const prevPhase = useRef(phase)

  useEffect(() => {
    audioEngine.init()
  }, [])

  useEffect(() => {
    if (phase === RunPhase.ARCHETYPE_SELECT && prevPhase.current !== RunPhase.ARCHETYPE_SELECT) {
      audioEngine.playMusic('menu')
    }
    if (phase === RunPhase.FORECAST && prevPhase.current === RunPhase.POST_RUN) {
      audioEngine.stopMusic()
    }
    if (phase === RunPhase.STINGER && lastResult) {
      audioEngine.playStinger(lastResult.stingerVariant)
    }
    if (phase === RunPhase.POST_RUN) {
      audioEngine.playMusic('post_run')
    }
    prevPhase.current = phase
  }, [phase, lastResult])

  return {
    playNodePurchase: () => audioEngine.playSfx('purchase_node'),
    playItemPurchase: () => audioEngine.playSfx('purchase_gear'),
    playClick: () => audioEngine.playSfx('click'),
    playHover: () => audioEngine.playSfx('hover'),
    playTypewriterTick: () => audioEngine.playTypewriterTick(),
  }
}
